import fetch from "node-fetch";

const API_BASE_URL = "https://psgc.cloud/api";
const CEBU_PROVINCE_CODE = "072200000";

export async function getCebuCities() {
  try {
    const response = await fetch(`${API_BASE_URL}/cities`);
    const cities = await response.json();
    return cities.filter((city) =>
      city.code.startsWith(CEBU_PROVINCE_CODE)
    );
  } catch (error) {
    console.error("Error fetching Cebu cities:", error);
    throw new Error("Could not fetch Cebu cities");
  }
}

export async function getCebuMunicipalities() {
  try {
    const response = await fetch(`${API_BASE_URL}/municipalities`);
    const municipalities = await response.json();
    return municipalities.filter((municipality) =>
      municipality.code.startsWith(CEBU_PROVINCE_CODE)
    );
  } catch (error) {
    console.error("Error fetching Cebu municipalities:", error);
    throw new Error("Could not fetch Cebu municipalities");
  }
}

export async function getBarangays(cityOrMunicipalityCode) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cities-municipalities/${cityOrMunicipalityCode}/barangays`
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching barangays:", error);
    throw new Error("Could not fetch barangays");
  }
}