import fetch from "node-fetch";

const PSGC_API_BASE_URL = process.env.PSGC_API_BASE_URL;
const LOCATIONIQ_API_BASE_URL = process.env.LOCATIONIQ_API_BASE_URL;
const LOCATIONIQ_ACCESS_TOKEN = process.env.LOCATIONIQ_ACCESS_TOKEN;

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
    if (!LOCATIONIQ_ACCESS_TOKEN) {
        console.error("LocationIQ Access Token is not configured.");
        throw new Error("Server configuration error: Missing LocationIQ token.");
    }
    try {
        const response = await fetch(
            `${LOCATIONIQ_API_BASE_URL}/search?key=${LOCATIONIQ_ACCESS_TOKEN}&q=${encodeURIComponent(address)}&format=json`
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        if (data && data.length > 0) {
            return { lat: data[0].lat, lon: data[0].lon };
        }
        return null;
    } catch (error) {
        console.error("Error fetching coordinates from LocationIQ:", error);
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
    if (!LOCATIONIQ_ACCESS_TOKEN) {
        console.error("LocationIQ Access Token is not configured.");
        throw new Error("Server configuration error: Missing LocationIQ token.");
    }
    try {
        const response = await fetch(
            `${LOCATIONIQ_API_BASE_URL}/reverse?key=${LOCATIONIQ_ACCESS_TOKEN}&lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.address;
    } catch (error) {
        console.error("Error reverse geocoding from LocationIQ:", error);
        throw new Error("Could not perform reverse geocoding.");
    }
}