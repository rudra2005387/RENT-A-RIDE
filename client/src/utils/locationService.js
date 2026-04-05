// Location service with fallback data for Indian cities and areas
const INDIAN_LOCATIONS = {
  // Major Cities and Districts in India with approximate coordinates
  "kolkata": { lat: 22.5726, lng: 88.3639, district: "West Bengal", type: "city" },
  "delhi": { lat: 28.7041, lng: 77.1025, district: "Delhi", type: "city" },
  "mumbai": { lat: 19.0760, lng: 72.8777, district: "Maharashtra", type: "city" },
  "bangalore": { lat: 12.9716, lng: 77.5946, district: "Karnataka", type: "city" },
  "hyderabad": { lat: 17.3850, lng: 78.4867, district: "Telangana", type: "city" },
  "pune": { lat: 18.5204, lng: 73.8567, district: "Maharashtra", type: "city" },
  "chennai": { lat: 13.0827, lng: 80.2707, district: "Tamil Nadu", type: "city" },
  "ahmedabad": { lat: 23.0225, lng: 72.5714, district: "Gujarat", type: "city" },
  "jaipur": { lat: 26.9124, lng: 75.7873, district: "Rajasthan", type: "city" },
  "lucknow": { lat: 26.8467, lng: 80.9462, district: "Uttar Pradesh", type: "city" },
  "kanpur": { lat: 26.4499, lng: 80.3319, district: "Uttar Pradesh", type: "city" },
  "indore": { lat: 22.7196, lng: 75.8577, district: "Madhya Pradesh", type: "city" },
  "thane": { lat: 19.2183, lng: 72.9781, district: "Maharashtra", type: "city" },
  "bhopal": { lat: 23.1815, lng: 79.9864, district: "Madhya Pradesh", type: "city" },
  "visakhapatnam": { lat: 17.6869, lng: 83.2185, district: "Andhra Pradesh", type: "city" },
  "patna": { lat: 25.5941, lng: 85.1376, district: "Bihar", type: "city" },
  "vadodara": { lat: 22.3072, lng: 73.1812, district: "Gujarat", type: "city" },
  "ludhiana": { lat: 30.9010, lng: 75.8573, district: "Punjab", type: "city" },
  "surat": { lat: 21.1702, lng: 72.8311, district: "Gujarat", type: "city" },
  "kochi": { lat: 9.9312, lng: 76.2673, district: "Kerala", type: "city" },
  "coimbatore": { lat: 11.0081, lng: 76.9124, district: "Tamil Nadu", type: "city" },
  "chandigarh": { lat: 30.7333, lng: 76.7794, district: "Chandigarh", type: "city" },
  "allahabad": { lat: 25.4358, lng: 81.8463, district: "Uttar Pradesh", type: "city" },
  "ranchi": { lat: 23.3441, lng: 85.3096, district: "Jharkhand", type: "city" },
  "nashik": { lat: 19.9975, lng: 73.7898, district: "Maharashtra", type: "city" },
  "aurangabad": { lat: 19.8762, lng: 75.3433, district: "Maharashtra", type: "city" },
};

// Searchable locations with areas
const LOCATION_DATABASE = [
  // Delhi NCR
  { name: "Noida", district: "Uttar Pradesh", lat: 28.5921, lng: 77.3869, region: "Delhi NCR" },
  { name: "Gurgaon", district: "Haryana", lat: 28.4595, lng: 77.0266, region: "Delhi NCR" },
  { name: "New Delhi", district: "Delhi", lat: 28.6139, lng: 77.2090, region: "Delhi NCR" },
  { name: "Faridabad", district: "Haryana", lat: 28.4089, lng: 77.3178, region: "Delhi NCR" },
  
  // Mumbai Metropolitan
  { name: "Mumbai", district: "Maharashtra", lat: 19.0760, lng: 72.8777, region: "Mumbai Metro" },
  { name: "Navi Mumbai", district: "Maharashtra", lat: 19.0330, lng: 73.0297, region: "Mumbai Metro" },
  { name: "Thane", district: "Maharashtra", lat: 19.2183, lng: 72.9781, region: "Mumbai Metro" },
  { name: "Mira Road", district: "Maharashtra", lat: 19.2676, lng: 72.8194, region: "Mumbai Metro" },
  
  // Bengaluru Area
  { name: "Bangalore", district: "Karnataka", lat: 12.9716, lng: 77.5946, region: "Bangalore" },
  { name: "Whitefield", district: "Karnataka", lat: 13.0350, lng: 77.6245, region: "Bangalore" },
  { name: "Indiranagar", district: "Karnataka", lat: 13.0350, lng: 77.6405, region: "Bangalore" },
  { name: "Koramangala", district: "Karnataka", lat: 12.9352, lng: 77.6245, region: "Bangalore" },
  
  // Kolkata Area
  { name: "Kolkata", district: "West Bengal", lat: 22.5726, lng: 88.3639, region: "Kolkata" },
  { name: "Salt Lake", district: "West Bengal", lat: 22.5674, lng: 88.4407, region: "Kolkata" },
  { name: "Howrah", district: "West Bengal", lat: 22.5958, lng: 88.2636, region: "Kolkata" },
  { name: "Rajarhat", district: "West Bengal", lat: 22.5975, lng: 88.4639, region: "Kolkata" },
  
  // Hyderabad Area
  { name: "Hyderabad", district: "Telangana", lat: 17.3850, lng: 78.4867, region: "Hyderabad" },
  { name: "HITEC City", district: "Telangana", lat: 17.3604, lng: 78.3497, region: "Hyderabad" },
  { name: "Banjara Hills", district: "Telangana", lat: 17.3915, lng: 78.4604, region: "Hyderabad" },
  
  // Pune Area
  { name: "Pune", district: "Maharashtra", lat: 18.5204, lng: 73.8567, region: "Pune" },
  { name: "Viman Nagar", district: "Maharashtra", lat: 18.5521, lng: 73.9104, region: "Pune" },
  { name: "Hinjewadi", district: "Maharashtra", lat: 18.5941, lng: 73.7339, region: "Pune" },
];

/**
 * Search for locations based on user input with debouncing
 * @param {string} query - User input query
 * @param {number} limit - Maximum results to return
 * @returns {Array} Array of location suggestions
 */
export const searchLocations = async (query, limit = 10) => {
  if (!query || query.trim().length < 2) return [];

  const lowerQuery = query.toLowerCase().trim();
  
  // Filter from database first (fast local search)
  const localResults = LOCATION_DATABASE.filter(loc =>
    loc.name.toLowerCase().includes(lowerQuery) ||
    loc.district.toLowerCase().includes(lowerQuery) ||
    loc.region.toLowerCase().includes(lowerQuery)
  ).slice(0, limit);

  // If we have local results, return them
  if (localResults.length > 0) {
    return localResults.map(loc => ({
      ...loc,
      label: `${loc.name}, ${loc.district}`,
      value: loc.name,
    }));
  }

  // Fallback to predefined major cities
  const majorResults = Object.entries(INDIAN_LOCATIONS)
    .filter(([key, val]) =>
      key.toLowerCase().includes(lowerQuery) ||
      val.district.toLowerCase().includes(lowerQuery)
    )
    .slice(0, limit)
    .map(([key, val]) => ({
      lat: val.lat,
      lng: val.lng,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      district: val.district,
      label: `${key.charAt(0).toUpperCase() + key.slice(1)}, ${val.district}`,
      value: key.charAt(0).toUpperCase() + key.slice(1),
      region: val.district,
    }));

  return majorResults;
};

/**
 * Reverse geocode coordinates to get location name (optional)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Location details
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    // Using OpenStreetMap Nominatim API (free, no key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return {
      address: data.address?.city || data.address?.town || data.display_name,
      lat,
      lng,
    };
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return { address: "Unknown Location", lat, lng };
  }
};

/**
 * Get coordinates for a location name
 * @param {string} locationName - Location name
 * @returns {Promise<Object>} Location with coordinates
 */
export const geocodeLocation = async (locationName) => {
  // First check if it's in our database
  const dbLocation = LOCATION_DATABASE.find(
    loc => loc.name.toLowerCase() === locationName.toLowerCase()
  );

  if (dbLocation) {
    return {
      name: dbLocation.name,
      lat: dbLocation.lat,
      lng: dbLocation.lng,
      district: dbLocation.district,
    };
  }

  // Check major cities
  const majorCity = Object.entries(INDIAN_LOCATIONS).find(
    ([key]) => key.toLowerCase() === locationName.toLowerCase()
  );

  if (majorCity) {
    const [name, data] = majorCity;
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      lat: data.lat,
      lng: data.lng,
      district: data.district,
    };
  }

  // Fallback to API if available
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)},India&limit=1`
    );
    const data = await response.json();

    if (data.length > 0) {
      return {
        name: locationName,
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        district: data[0].address?.county || "Unknown",
      };
    }
  } catch (error) {
    console.error("Geocode error:", error);
  }

  return { name: locationName, lat: null, lng: null, district: "Unknown" };
};
