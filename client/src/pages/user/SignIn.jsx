import styles from "../../index";
import { Link, useNavigate } from "react-router-dom";
import {
  loadingEnd,
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../../components/OAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "email required" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Invalid email address",
    }),
  password: z.string().min(1, { message: "password required" }),
});

// export const refreshToken = async (dispatch,getState) => {
//   const { authSlice } = getState();

//   if (!authSlice.refreshToken) {
//     // No refresh token available, handle the situation (e.g., log out the user)
//     dispatch(logout());
//     return;
//   }

//   try {
//     const res = await fetch('/api/auth/refresh', {
//       method: 'POST',
//       credentials: 'include', // Include cookies in the request
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       dispatch(refreshTokenFailure(data));
//       return;
//     }

//     // The server should set the new access token and refresh token in the response cookies
//     dispatch(refreshTokenSuccess(data));
//   } catch (err) {
//     dispatch(signInFailure(err));
//   }
// }

function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const { isLoading, isError } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (formData, e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch(`/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      dispatch(loadingEnd());
      
      // Check if response was successful
      if (!res.ok || data.succes === false) {
        const errorMessage = data.message || "Sign in failed. Please try again.";
        dispatch(signInFailure(errorMessage));
        return;
      }

      // Store tokens in localStorage
      if (data?.accessToken) {
        localStorage.removeItem("accessToken");
        localStorage.setItem("accessToken", data.accessToken);
      }
      if (data?.refreshToken) {
        localStorage.removeItem("refreshToken");
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      // Sign in successful
      dispatch(signInSuccess(data));

      // Navigate based on user role
      if (data.isAdmin) {
        navigate("/adminDashboard");
      } else if (data.isUser) {
        navigate("/");
      } else {
        dispatch(signInFailure("Invalid user role"));
      }
    } catch (error) {
      dispatch(loadingEnd());
      const errorMessage = error.message || "An error occurred. Please try again.";
      dispatch(signInFailure(errorMessage));
    }
  };

  return (
    <>
      <div
        className={`max-w-[340px] pb-10 md:max-w-md min-h-[500px] mx-auto mt-[70px] md:mt-[80px] rounded-lg overflow-hidden  shadow-2xl`}
      >
        <div
          className={` green px-6 py-2   rounded-t-lg flex justify-between items-center`}
        >
          <h1 className={`${styles.heading2}  text-normal `}>Sign In</h1>
          <Link to={"/"} onClick={() => dispatch(loadingEnd())}>
            <div className=" px-3  font-bold  hover:bg-green-300 rounded-md  shadow-inner">
              x
            </div>
          </Link>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 pt-10 px-5"
        >
          <div>
            <input
              type="text"
              id="email"
              className="text-black bg-slate-100 p-3 rounded-md w-full"
              placeholder="Email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-[10px]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              id="password"
              className="text-black bg-slate-100 p-3 rounded-md w-full"
              placeholder="Password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-[10px]">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            className={`${styles.button}  disabled:bg-slate-500 text-black disabled:text-white`}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
          
          {isError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md text-[12px]">
              {typeof isError === 'string' ? isError : isError?.message || "Something went wrong"}
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <p className="text-[10px]">
              No account?{" "}
              <span className="text-blue-600 font-semibold">
                <Link to={`/signup`}>Sign Up</Link>
              </span>
            </p>
            <p className="text-[10px] text-blue-600 hover:text-blue-800 cursor-pointer">Forgot password?</p>
          </div>
        </form>
        <div>
          <h3 className="text-center text-slate-700 pt-3 pb-3 text-[10px]">
            OR
          </h3>
          <div className="flex justify-center items-center gap-3 pb-6">
            <span className="bg-green-300 w-20 h-[.1px]"></span>
            <span className="text-[10px] sm:text-[12px] text-slate-500">
              Continue with social login
            </span>
            <span className="bg-green-300 w-20 h-[.1px]"> </span>
          </div>

          <OAuth />
        </div>
      </div>
    </>
  );
}

export default SignIn;
