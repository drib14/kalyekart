import axios from "axios";

const API_URL = "https://psgc.cloud/api";

export const getRegions = async () => {
	const response = await axios.get(`${API_URL}/regions`);
	return response.data;
};

// NOTE: This API fetches all cities and municipalities and filters them on the client side.
// This is not ideal, but it is a limitation of the psgc.cloud API.
export const getCitiesAndMunicipalities = async (provinceCode) => {
	const municipalitiesResponse = await axios.get(`${API_URL}/municipalities`);
	const citiesResponse = await axios.get(`${API_URL}/cities`);
	const combined = [...municipalitiesResponse.data, ...citiesResponse.data];
	const provincePrefix = provinceCode.substring(0, 4); // e.g., "0722"
	const filtered = combined.filter((m) => m.code.startsWith(provincePrefix));
	return filtered.sort((a, b) => a.name.localeCompare(b.name));
};

// NOTE: This API fetches all barangays and filters them on the client side.
// This is not ideal, but it is a limitation of the psgc.cloud API.
export const getBarangays = async (municipalityCode) => {
	const response = await axios.get(`${API_URL}/barangays`);
	const municipalityPrefix = municipalityCode.substring(0, 6); // e.g., "072217"
	return response.data.filter((b) => b.code.startsWith(municipalityPrefix));
};