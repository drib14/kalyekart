import axios from "axios";

const API_URL = "https://psgc.cloud/api";

export const getRegions = async () => {
	const response = await axios.get(`${API_URL}/regions`);
	return response.data;
};

// NOTE: This function is specifically designed to get all cities and municipalities in Cebu.
// It fetches all cities and municipalities and filters them based on the known PSGC codes for Cebu.
export const getCebuCitiesAndMunicipalities = async () => {
	const municipalitiesResponse = await axios.get(`${API_URL}/municipalities`);
	const citiesResponse = await axios.get(`${API_URL}/cities`);
	const combined = [...municipalitiesResponse.data, ...citiesResponse.data];
	const cebuProvincePrefix = "0702";
	const cebuCityCode = "0730600000";
	const mandaueCityCode = "0731300000";
	const lapuLapuCityCode = "0731100000";

	const filtered = combined.filter(
		(m) =>
			m.code.startsWith(cebuProvincePrefix) ||
			m.code === cebuCityCode ||
			m.code === mandaueCityCode ||
			m.code === lapuLapuCityCode
	);
	return filtered.sort((a, b) => a.name.localeCompare(b.name));
};

// NOTE: This API fetches all barangays and filters them on the client side.
// This is not ideal, but it is a limitation of the psgc.cloud API.
export const getBarangays = async (municipalityCode) => {
	const response = await axios.get(`${API_URL}/barangays`);
	const municipalityPrefix = municipalityCode.substring(0, 6); // e.g., "072217"
	return response.data.filter((b) => b.code.startsWith(municipalityPrefix));
};