import Booking from "../models/BookingModel.js";
import Vehicle from "../models/vehicleModel.js";

//returning vehicles that are not booked in selected Date
export async function availableAtDate(pickupDate, dropOffDate) {
  try {
    // Find bookings that overlap with the requested date range AND have status indicating the vehicle is in use
    const overlappingBookings = await Booking.find({
      $and: [
        {
          $or: [
            // Date overlap conditions
            { pickupDate: { $lt: dropOffDate }, dropOffDate: { $gt: pickupDate } },
            { pickupDate: { $gte: pickupDate, $lt: dropOffDate } },
            { dropOffDate: { $gt: pickupDate, $lte: dropOffDate } },
            { pickupDate: { $lte: pickupDate }, dropOffDate: { $gte: dropOffDate } },
          ],
        },
        {
          // Only exclude vehicles that are actively booked
          status: { $in: ["booked", "onTrip"] },
        },
      ],
    });

    // Extract vehicle IDs that are actively booked during the requested period
    const bookedVehicleIds = overlappingBookings.map((booking) => booking.vehicleId);
    const uniqueBookedVehicleIds = [...new Set(bookedVehicleIds)];

    // Return all vehicles EXCEPT those that are actively booked
    const availableVehicles = await Vehicle.find({
      _id: { $nin: uniqueBookedVehicleIds },
      isDeleted: "false",
    });

    return availableVehicles || [];
  } catch (error) {
    console.error("Error checking vehicle availability:", error);
    throw error;
  }
}
