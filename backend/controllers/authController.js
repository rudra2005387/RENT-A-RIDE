import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import Jwt from "jsonwebtoken";

const expireDate = new Date(Date.now() + 3600000);

export const signUp = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Validate required fields
    if (!username || !email || !password) {
      return next(errorHandler(400, "All fields are required"));
    }

    // Trim whitespace
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return next(errorHandler(400, "Invalid email format"));
    }

    // Validate password length
    if (trimmedPassword.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters long"));
    }

    // Validate username length
    if (trimmedUsername.length < 3) {
      return next(errorHandler(400, "Username must be at least 3 characters long"));
    }

    const hashedPassword = bcryptjs.hashSync(trimmedPassword, 10);
    const newUser = new User({
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
      isUser: true,
    });
    await newUser.save();
    res.status(201).json({ succes: true, message: "Account created successfully. Please sign in." });
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(errorHandler(400, `${field} already exists`));
    }
    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return next(errorHandler(400, messages.join(", ")));
    }
    next(error);
  }
};

//refreshTokens
export const refreshToken = async (req, res, next) => {
  // const refreshToken = req.cookies.refresh_token;

  if (!req.headers.authorization) {
    return next(errorHandler(403, "bad request no header provided"));
  }

  const refreshToken = req.headers.authorization.split(" ")[1].split(",")[0];
  const accessToken = req.headers.authorization.split(" ")[1].split(",")[1];

  console.log(refreshToken);
  console.log(accessToken);

  if (!refreshToken) {
    // res.clearCookie("access_token", "refresh_token");
    return next(errorHandler(401, "You are not authenticated"));
  }

  try {
    const decoded = Jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    const user = await User.findById(decoded.id);

    if (!user) return next(errorHandler(403, "Invalid refresh token"));
    if (user.refreshToken !== refreshToken) {
      // res.clearCookie("access_token", "refresh_token");
      return next(errorHandler(403, "Invalid refresh token"));
    }

    const newAccessToken = Jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" }
    );
    const newRefreshToken = Jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );

    // Update the refresh token in the database for the user
    await User.updateOne({ _id: user._id }, { refreshToken: newRefreshToken });

    res
      .cookie("access_token", newAccessToken, {
        httpOnly: true,
        maxAge: 900000,
        sameSite: "None",
        secure: true,
        domain: "rent-a-ride-two.vercel.app",
      }) // 15 minutes
      .cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        maxAge: 604800000,
        sameSite: "None",
        secure: true,
        domain: "rent-a-ride-two.vercel.app",
      }) // 7 days
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(errorHandler(500, "error in refreshToken controller in server"));
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  
  try {
    // Validate required fields
    if (!email || !password) {
      return next(errorHandler(400, "Email and password are required"));
    }

    // Trim and normalize email
    const trimmedEmail = email.trim().toLowerCase();

    // Find user by email
    const validUser = await User.findOne({ email: trimmedEmail });
    if (!validUser) {
      return next(errorHandler(401, "Invalid email or password"));
    }

    // Check password
    let validPassword = false;
    try {
      validPassword = bcryptjs.compareSync(password, validUser.password);
    } catch (bcryptError) {
      console.error("Bcrypt comparison error:", bcryptError);
      return next(errorHandler(500, "Authentication process failed"));
    }

    if (!validPassword) {
      return next(errorHandler(401, "Invalid email or password"));
    }

    // Generate tokens
    let accessToken = "";
    let refreshToken = "";
    
    try {
      accessToken = Jwt.sign({ id: validUser._id }, process.env.ACCESS_TOKEN, {
        expiresIn: "15m",
      });
      refreshToken = Jwt.sign({ id: validUser._id }, process.env.REFRESH_TOKEN, {
        expiresIn: "7d",
      });
    } catch (jwtError) {
      console.error("JWT generation error:", jwtError);
      return next(errorHandler(500, "Token generation failed. Please try again."));
    }

    // Update user with refresh token
    const updatedData = await User.findByIdAndUpdate(
      { _id: validUser._id },
      { refreshToken },
      { new: true }
    );

    if (!updatedData) {
      return next(errorHandler(500, "User update failed"));
    }

    // Prepare response without password
    const { password: hashedPassword, ...userWithoutPassword } = updatedData._doc;

    const responsePayload = {
      succes: true,
      refreshToken,
      accessToken,
      ...userWithoutPassword,
    };

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error("SignIn error:", error);
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).lean();
    if (user && !user.isUser) {
      return next(errorHandler(409, "email already in use as a vendor"));
    }
    if (user) {
      const { password: hashedPassword, ...rest } = user;
      const token = Jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN);

      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expireDate,
          SameSite: "None",
          Domain: ".vercel.app",
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8); //we are generating a random password since there is no password in result
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        profilePicture: req.body.photo,
        password: hashedPassword,
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8) +
          Math.random().toString(36).slice(-8),
        email: req.body.email,
        isUser: true,
        //we cannot set username to req.body.name because other user may also have same name so we generate a random value and concat it to name
        //36 in toString(36) means random value from 0-9 and a-z
      });
      const savedUser = await newUser.save();
      const userObject = savedUser.toObject();

      const token = Jwt.sign({ id: newUser._id }, process.env.ACCESS_TOKEN);
      const { password: hashedPassword2, ...rest } = userObject;
      res
        .cookie("access_token", token, {
          httpOnly: true,
          expires: expireDate,
          sameSite: "None",
          secure: true,
          domain: ".vercel.app",
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
