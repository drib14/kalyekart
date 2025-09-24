import axios from "axios";

const API_URL = "https://psgc.cloud/api";

export const getRegions = async () => {
	const response = await axios.get(`${API_URL}/regions`);
	return response.data;
};

// NOTE: This API fetches all municipalities and filters them on the client side.
// This is not ideal, but it is a limitation of the psgc.cloud API.
export const getMunicipalities = async (provinceCode) => {
	const response = await axios.get(`${API_URL}/municipalities`);
	console.log("Raw municipalities response:", response.data);
	const provincePrefix = provinceCode.substring(0, 4); // e.g., "0722"
	const filtered = response.data.filter((m) => m.code.startsWith(provincePrefix));
	console.log("Filtered municipalities:", filtered);
	return filtered;
};

// NOTE: This API fetches all barangays and filters them on the client side.
// This is not ideal, but it is a limitation of the psgc.cloud API.
export const getBarangays = async (municipalityCode) => {
	const response = await axios.get(`${API_URL}/barangays`);
	console.log("Raw barangays response:", response.data);
	const municipalityPrefix = municipalityCode.substring(0, 6); // e.g., "072217"
	const filtered = response.data.filter((b) => b.code.startsWith(municipalityPrefix));
	console.log("Filtered barangays:", filtered);
	return filtered;
};