import axios from "axios";

// NOTE: This function is specifically designed to get all cities and municipalities in Cebu.
// It fetches all cities and municipalities and filters them based on the official PSGC province code for Cebu.
export const getCebuCitiesAndMunicipalities = async () => {
	try {
		const municipalitiesResponse = await axios.get("https://psgc.cloud/api/municipalities");
		const citiesResponse = await axios.get("https://psgc.cloud/api/cities");
		const combined = [...municipalitiesResponse.data, ...citiesResponse.data];

		const cebuProvinceCode = "072200000";
		// HUCs (Highly Urbanized Cities) like Cebu, Mandaue, and Lapu-Lapu are administratively independent
		// from the province and may not share the province code. We must include them explicitly.
		const cebuCityCode = "072217000";
		const mandaueCityCode = "072230000";
		const lapuLapuCityCode = "072226000";

		const filtered = combined.filter(
			(loc) =>
				loc.provinceCode === cebuProvinceCode ||
				loc.code === cebuCityCode ||
				loc.code === mandaueCityCode ||
				loc.code === lapuLapuCityCode
		);

		// Remove duplicates that might occur if HUCs have the province code AND are explicitly added
		const unique = filtered.filter((value, index, self) => index === self.findIndex((t) => t.code === value.code));

		return unique.sort((a, b) => a.name.localeCompare(b.name));
	} catch (error) {
		console.error("Error fetching Cebu cities and municipalities:", error);
		return []; // Return an empty array on error
	}
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