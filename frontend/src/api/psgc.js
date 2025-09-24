import axios from "axios";

const API_URL = "/psgc";

export const getRegions = async () => {
	const response = await axios.get(`${API_URL}`);
	return response.data;
};

export const getProvinces = async (regionId) => {
	const response = await axios.get(`${API_URL}/provinces?region_id=${regionId}`);
	return response.data;
};

export const getMunicipalities = async (provinceId) => {
	const response = await axios.get(
		`${API_URL}/municipalities?province_id=${provinceId}`
	);
	return response.data;
};

export const getCoordinates = async (query) => {
	const response = await axios.get(
		`https://nominatim.openstreetmap.org/search?q=${query}&format=json`
	);
	return response.data;
};

export const getBarangays = async (municipalityId) => {
	const response = await axios.get(
		`${API_URL}/barangays?municipality_id=${municipalityId}`
	);
	return response.data;
};