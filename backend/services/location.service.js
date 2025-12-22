import fetch from "node-fetch";

const PSGC_API_BASE_URL = "https://psgc.cloud/api";
const OPENCAGE_API_BASE_URL = "https://api.opencagedata.com/geocode/v1";
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

const CEBU_PROVINCE_CODE = "07022";
// Manually include HUCs since they are not under the provincial code
const HUC_CEBU_CODES = ["0730600000", "0731100000", "0731300000"]; // Cebu City, Lapu-Lapu, Mandaue

/**
 * Fetches all cities and municipalities for Cebu province.
 */
export async function getCebuCitiesAndMunicipalities() {
    try {
        const [citiesRes, munRes] = await Promise.all([
            fetch(`${PSGC_API_BASE_URL}/cities`),
            fetch(`${PSGC_API_BASE_URL}/municipalities`)
        ]);
        const cities = await citiesRes.json();
        const municipalities = await munRes.json();

        const cebuCities = cities.filter(c =>
            c.code.startsWith(CEBU_PROVINCE_CODE) || HUC_CEBU_CODES.includes(c.code)
        );
        const cebuMunicipalities = municipalities.filter(m => m.code.startsWith(CEBU_PROVINCE_CODE));

        return [...cebuCities, ...cebuMunicipalities].sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error fetching Cebu cities and municipalities:", error);
        throw new Error("Could not fetch Cebu locations");
    }
}

/**
 * Fetches all barangays for a given city or municipality code.
 */
export async function getBarangays(cityOrMunCode) {
    try {
        const response = await fetch(`${PSGC_API_BASE_URL}/cities/${cityOrMunCode}/barangays`);
        if (response.status === 404) { // It might be a municipality
             const munResponse = await fetch(`${PSGC_API_BASE_URL}/municipalities/${cityOrMunCode}/barangays`);
             return await munResponse.json();
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching barangays:", error);
        throw new Error("Could not fetch barangays");
    }
}

/**
 * Gets coordinates for a given address string.
 */
export async function getCoordinates(address) {
    if (!OPENCAGE_API_KEY) {
        console.error("OpenCage API Key is not configured.");
        throw new Error("Server configuration error: Missing OpenCage key.");
    }
    // Mock for testing/dummy keys
    if (OPENCAGE_API_KEY.startsWith("dummy")) {
        console.warn("Using dummy OpenCage key, returning mock coordinates.");
        return { lat: 10.3157, lng: 123.8854 }; // Cebu City coordinates
    }

    try {
        const response = await fetch(
            `${OPENCAGE_API_BASE_URL}/json?key=${OPENCAGE_API_KEY}&q=${encodeURIComponent(address)}`
        );
        const data = await response.json();

        if (data.status && data.status.code !== 200) {
             throw new Error(data.status.message);
        }

        if (data && data.results && data.results.length > 0) {
            return data.results[0].geometry; // Returns { lat: ..., lng: ... }
        }
        return null;
    } catch (error) {
        console.error("Error fetching coordinates from OpenCage:", error);
        throw new Error("Could not fetch coordinates.");
    }
}

/**
 * Calculates the distance between two coordinates in kilometers.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Gets address details for given coordinates using reverse geocoding.
 */
export async function reverseGeocode(lat, lon) {
    if (!OPENCAGE_API_KEY) {
        console.error("OpenCage API Key is not configured.");
        throw new Error("Server configuration error: Missing OpenCage key.");
    }
    try {
        const response = await fetch(
            `${OPENCAGE_API_BASE_URL}/json?key=${OPENCAGE_API_KEY}&q=${lat}+${lon}`
        );
        const data = await response.json();
        if (data.status && data.status.code !== 200) {
             throw new Error(data.status.message);
        }

        if (data.results && data.results.length > 0) {
             // OpenCage components can be accessed via data.results[0].components
             return data.results[0].components;
        }
        return null;
    } catch (error) {
        console.error("Error reverse geocoding from OpenCage:", error);
        throw new Error("Could not perform reverse geocoding.");
    }
}