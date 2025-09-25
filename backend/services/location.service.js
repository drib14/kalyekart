import fetch from "node-fetch";

const API_BASE_URL = "https://us1.locationiq.com/v1";
export async function getCoordinates(address) {
  const ACCESS_TOKEN = process.env.LOCATIONIQ_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    console.error("LocationIQ Access Token is not configured in .env file.");
    throw new Error("Server configuration error: Missing LocationIQ token.");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/search?key=${ACCESS_TOKEN}&q=${encodeURIComponent(
        address
      )}&format=json`
    );
    const data = await response.json();
    if (data.error) {
      console.error("LocationIQ API Error:", data.error);
      throw new Error("Failed to geocode address.");
    }
    if (data && data.length > 0) {
      return {
        lat: data[0].lat,
        lon: data[0].lon,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    throw new Error("Could not fetch coordinates.");
  }
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}