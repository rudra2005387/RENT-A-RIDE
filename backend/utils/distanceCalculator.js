/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first location
 * @param {number} lon1 - Longitude of first location
 * @param {number} lat2 - Latitude of second location
 * @param {number} lon2 - Longitude of second location
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Estimate duration for a trip using distance
 * Assumes average speed of 40 km/h in urban areas, 60 km/h on highways
 * @param {number} distance - Distance in kilometers
 * @returns {number} Estimated duration in minutes
 */
export const estimateDuration = (distance) => {
  // Urban areas average: 40 km/h
  // Highway average: 60 km/h
  // Assume 40% urban, 60% highway for India
  const avgSpeed = 40 * 0.4 + 60 * 0.6; // ~52 km/h
  const durationHours = distance / avgSpeed;
  return Math.round(durationHours * 60); // Convert to minutes
};

/**
 * Calculate fare for a trip
 * Pricing structure:
 * - Base fare: ₹50
 * - Per km: ₹15
 * - Per minute (waiting): ₹1
 * @param {number} distance - Distance in kilometers
 * @param {number} duration - Duration in minutes
 * @returns {number} Estimated fare in INR
 */
export const calculateFare = (distance, duration) => {
  const baseFare = 50;
  const perKmRate = 15;
  const perMinuteRate = 1;

  const distanceFare = distance * perKmRate;
  const durationFare = duration * perMinuteRate;
  const totalFare = baseFare + distanceFare + durationFare;

  return Math.round(totalFare);
};

/**
 * Get travel summary from pickup and dropoff coordinates
 * @param {Object} pickupCoords - { lat, lng }
 * @param {Object} dropoffCoords - { lat, lng }
 * @returns {Object} Travel summary with distance, duration, fare
 */
export const getTravelSummary = (pickupCoords, dropoffCoords) => {
  if (
    !pickupCoords ||
    !dropoffCoords ||
    !pickupCoords.lat ||
    !pickupCoords.lng ||
    !dropoffCoords.lat ||
    !dropoffCoords.lng
  ) {
    return {
      distance: 0,
      duration: 0,
      fare: 50, // Base fare only
      error: "Invalid coordinates provided",
    };
  }

  const distance = calculateDistance(
    pickupCoords.lat,
    pickupCoords.lng,
    dropoffCoords.lat,
    dropoffCoords.lng
  );

  const duration = estimateDuration(distance);
  const fare = calculateFare(distance, duration);

  return {
    distance: distance, // km
    duration: duration, // minutes
    fare: fare, // INR
    estimatedTime: Math.ceil(duration / 60) + " hour(s) " + (duration % 60) + " minutes",
  };
};
