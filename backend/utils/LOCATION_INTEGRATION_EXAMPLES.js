/**
 * EXAMPLE: How to integrate location coordinates with booking logic
 * 
 * This example shows how to use the new location data with coordinates
 * in your backend booking and vehicle search flows.
 */

// Example 1: Backend booking search using location coordinates
/*
import { getTravelSummary } from "../utils/distanceCalculator.js";

export const searchCarsWithLocations = async (req, res, next) => {
  try {
    const {
      pickupCoords,
      dropoffCoords,
      pickupDate,
      dropoffDate,
      pickUpLocation,
      dropOffLocation,
    } = req.body;

    // Calculate travel summary (distance, duration, estimated fare)
    const travelSummary = getTravelSummary(pickupCoords, dropoffCoords);

    console.log("Travel Summary:", travelSummary);
    // Output:
    // {
    //   distance: 15.5,
    //   duration: 25,
    //   fare: 382.5,
    //   estimatedTime: "0 hour(s) 25 minutes"
    // }

    // Now use this data to:
    // 1. Filter vehicles based on distance coverage
    // 2. Calculate and return estimated fare
    // 3. Show route on map
    // 4. Validate pickup/dropoff areas are in service

    // Find vehicles available in the pickup area
    const availableVehicles = await Vehicle.find({
      serviceAreas: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [pickupCoords.lng, pickupCoords.lat],
          },
        },
      },
      availability: {
        $elemMatch: {
          date: { $gte: pickupDate, $lte: dropoffDate },
          isAvailable: true,
        },
      },
    });

    // Enrich vehicles with pricing
    const vehiclesWithPricing = availableVehicles.map((vehicle) => ({
      ...vehicle.toObject(),
      estimatedFare: travelSummary.fare,
      distance: travelSummary.distance,
      estimatedDuration: travelSummary.estimatedTime,
    }));

    return res.status(200).json({
      success: true,
      data: vehiclesWithPricing,
      travelSummary,
    });
  } catch (error) {
    next(error);
  }
};
*/

// Example 2: Store coordinates in booking for later reference
/*
const bookingSchema = new Schema({
  // ... existing fields
  pickup: {
    location: String,
    district: String,
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  dropoff: {
    location: String,
    district: String,
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  estimatedDistance: Number, // km
  estimatedDuration: Number, // minutes
  estimatedFare: Number, // INR
  createdAt: { type: Date, default: Date.now },
});

// Create geospatial indexes for location-based queries
bookingSchema.index({ "pickup.coordinates": "2dsphere" });
bookingSchema.index({ "dropoff.coordinates": "2dsphere" });
*/

// Example 3: Find bookings within a certain radius
/*
const findBookingsNearLocation = async (latitude, longitude, radiusKm = 10) => {
  const radiusMeters = radiusKm * 1000;
  
  return await Booking.find({
    "pickup.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: radiusMeters,
      },
    },
  });
};
*/

// Example 4: Using with distance calculation in vehicle pricing
/*
import { calculateDistance, calculateFare } from "../utils/distanceCalculator.js";

const calculatePricingWithLocation = (pickupCoords, dropoffCoords, vehicleType) => {
  const distance = calculateDistance(
    pickupCoords.lat,
    pickupCoords.lng,
    dropoffCoords.lat,
    dropoffCoords.lng
  );

  // Different pricing for different vehicle types
  let baseRate = 50; // INR
  let perKmRate = 15; // INR/km
  let surgeMultiplier = 1; // Peak hours multiplier

  if (vehicleType === "premium") {
    baseRate = 75;
    perKmRate = 25;
  } else if (vehicleType === "economy") {
    baseRate = 40;
    perKmRate = 10;
  }

  const distanceFare = distance * perKmRate * surgeMultiplier;
  const totalFare = baseRate + distanceFare;

  return {
    distance,
    baseFare: baseRate,
    distanceFare,
    totalFare: Math.round(totalFare),
    perKmRate,
  };
};
*/

// Example 5: Frontend integration - using coordinates after booking
/*
// In your checkout or confirmation page, you can:
// 1. Show the route on a map
// 2. Display pickup and dropoff markers
// 3. Show distance and estimated duration
// 4. Allow users to see the calculated fare

import L from "leaflet"; // Or any map library

const showBookingRoute = (pickupCoords, dropoffCoords, estimatedData) => {
  const map = L.map("map").setView([pickupCoords.lat, pickupCoords.lng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  // Add markers
  L.marker([pickupCoords.lat, pickupCoords.lng])
    .bindPopup("Pickup Point")
    .addTo(map);

  L.marker([dropoffCoords.lat, dropoffCoords.lng])
    .bindPopup("Dropoff Point")
    .addTo(map);

  // Draw line between points
  L.polyline([
    [pickupCoords.lat, pickupCoords.lng],
    [dropoffCoords.lat, dropoffCoords.lng],
  ]).addTo(map);

  // Show booking details
  document.getElementById("distance").innerHTML = estimatedData.distance + " km";
  document.getElementById("duration").innerHTML = estimatedData.estimatedTime;
  document.getElementById("fare").innerHTML = "₹" + estimatedData.fare;
};
*/

// Example 6: Admin dashboard - View all bookings on map by location
/*
const getAllBookingsOnMap = async () => {
  const bookings = await Booking.find({
    status: "completed",
  });

  const mapData = bookings.map((booking) => ({
    id: booking._id,
    pickup: {
      lat: booking.pickup.coordinates.coordinates[1],
      lng: booking.pickup.coordinates.coordinates[0],
      location: booking.pickup.location,
    },
    dropoff: {
      lat: booking.dropoff.coordinates.coordinates[1],
      lng: booking.dropoff.coordinates.coordinates[0],
      location: booking.dropoff.location,
    },
    distance: booking.estimatedDistance,
    fare: booking.estimatedFare,
  }));

  return mapData;
};
*/

console.log("Location Integration Examples - See comments for usage patterns");
