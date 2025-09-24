import axios from "axios";

// NOTE: This function is specifically designed to get all cities and municipalities in Cebu.
// It fetches all cities and municipalities and filters them based on the known PSGC codes for Cebu.
export const getCebuCitiesAndMunicipalities = async () => {
	const municipalitiesResponse = await axios.get("https://psgc.cloud/api/municipalities");
	const citiesResponse = await axios.get("https://psgc.cloud/api/cities");
	const combined = [...municipalitiesResponse.data, ...citiesResponse.data];
	const cebuProvincePrefix = "0722";
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
	const response = await axios.get("https://psgc.cloud/api/barangays");
	const municipalityPrefix = municipalityCode.substring(0, 6); // e.g., "072217"
	const filtered = response.data.filter((b) =>
		b.code.startsWith(municipalityPrefix)
	);
	return filtered.sort((a, b) => a.name.localeCompare(b.name));
};