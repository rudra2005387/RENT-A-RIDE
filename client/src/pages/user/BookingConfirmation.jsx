import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdCheckCircle, MdLocationOn, MdDirectionsCar, MdAccessTime, MdMonetizationOn } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import { toast } from "sonner";

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const latestBooking = useSelector((state) => state.latestBookings);
  const [booking, setBooking] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get booking ID from URL params or use from Redux
    const searchParams = new URLSearchParams(location.search);
    const bookingId = searchParams.get("bookingId");

    if (!latestBooking?.data && !bookingId) {
      toast.error("No booking found. Redirecting...");
      navigate("/");
      return;
    }

    setBooking(latestBooking?.data || {});
    setVehicleDetails(latestBooking?.vehicleDetails || {});
    setLoading(false);
  }, [latestBooking, location, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!booking || !booking.bookingDetails) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <p className="text-center text-gray-600">Booking details not found.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const bookingDetails = booking.bookingDetails || booking;
  const pickupDate = new Date(bookingDetails.pickupDate);
  const dropoffDate = new Date(bookingDetails.dropOffDate);

  const formatDateTime = (date) => {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MdCheckCircle className="text-green-500" size={64} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your reservation has been successfully booked</p>
        </div>

        {/* Main Booking Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Vehicle Section */}
          <div className="p-6 border-b-2 border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Vehicle Details</h2>
            <div className="flex gap-6">
              {vehicleDetails?.image && (
                <img
                  src={vehicleDetails.image[0]}
                  alt={vehicleDetails.name}
                  className="w-40 h-32 object-contain bg-gray-100 rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {vehicleDetails?.company} {vehicleDetails?.name}
                </h3>
                <p className="text-gray-600 mb-3">{vehicleDetails?.model || "Standard"}</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MdDirectionsCar /> {vehicleDetails?.fuel_type || "Petrol"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MdMonetizationOn /> ₹{vehicleDetails?.price}/day
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="p-6 border-b-2 border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Trip Details</h2>
            <div className="space-y-4">
              {/* Pickup */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MdLocationOn className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-semibold">Pick-up Location</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {bookingDetails.pickUpLocation}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <CiCalendarDate /> {formatDateTime(pickupDate)}
                    </p>
                    {bookingDetails.pickUpCoordinates && (
                      <p className="text-xs text-gray-500 mt-1">
                        Latitude: {bookingDetails.pickUpCoordinates.lat?.toFixed(4)}, 
                        Longitude: {bookingDetails.pickUpCoordinates.lng?.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="text-gray-400">↓</div>
              </div>

              {/* Dropoff */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MdLocationOn className="text-green-600 mt-1 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-semibold">Drop-off Location</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {bookingDetails.dropOffLocation}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <CiCalendarDate /> {formatDateTime(dropoffDate)}
                    </p>
                    {bookingDetails.dropOffCoordinates && (
                      <p className="text-xs text-gray-500 mt-1">
                        Latitude: {bookingDetails.dropOffCoordinates.lat?.toFixed(4)}, 
                        Longitude: {bookingDetails.dropOffCoordinates.lng?.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Metrics */}
          {(bookingDetails.estimatedDistance || bookingDetails.estimatedDuration) && (
            <div className="p-6 border-b-2 border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Estimated Trip Metrics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Distance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookingDetails.estimatedDistance?.toFixed(1)} km
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm flex items-center justify-center gap-1">
                    <MdAccessTime /> Duration
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookingDetails.estimatedDuration} min
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Est. Fare</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{bookingDetails.estimatedFare?.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Summary */}
          <div className="p-6 border-b-2 border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Price Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle price</span>
                <span className="text-gray-900 font-semibold">₹{vehicleDetails?.price}/day</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-600">Total amount</span>
                <span className="text-gray-600 font-semibold">
                  ₹{bookingDetails.totalPrice}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-lg font-bold text-gray-900">Total Paid</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{bookingDetails.totalPrice}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Status */}
          <div className="p-6 border-b-2 border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Booking Status</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID</span>
                <span className="text-gray-900 font-mono text-sm">
                  {bookingDetails._id?.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {bookingDetails.status || "Booked"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booked on</span>
                <span className="text-gray-900">
                  {new Date(bookingDetails.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="p-6 bg-blue-50">
            <p className="text-sm text-gray-700">
              ✓ A confirmation email has been sent to your registered email address. Please check
              your inbox for booking details and important information.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => navigate("/orders")}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Back Home
          </button>
        </div>
      </div>
    </div>
  );
}
