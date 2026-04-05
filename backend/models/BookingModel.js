import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
    required: true,
  },
  pickupDate: { type: Date, required: true },
  dropOffDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pickUpLocation: { type: String, required: true },
  dropOffLocation: { type: String, required: true },
  
  // New coordinate fields for location tracking
  pickUpCoordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  dropOffCoordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  
  // Trip metrics calculated from coordinates
  estimatedDistance: { type: Number }, // in kilometers
  estimatedDuration: { type: Number }, // in minutes
  estimatedFare: { type: Number }, // in INR
  
  totalPrice: { type: Number, required: true },
  razorpayOrderId: { type: String, required: true },
  razorpayPaymentId: { type: String, required: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  status: {
    type: String,
    enum: ["notBooked", "booked", "onTrip", "notPicked", "canceled", "overDue", "tripCompleted"],
    default: "booked"
  }
});

const Booking = mongoose.model("Booking", userSchema);

export default Booking;
