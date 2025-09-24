import axios from "axios";

const API_URL = "https://psgc.cloud/api";

export const getRegions = async () => {
	const response = await axios.get(`${API_URL}/regions`);
	return response.data;
};

export const getProvinces = async (regionId) => {
	const response = await axios.get(`${API_URL}/regions/${regionId}/provinces`);
	return response.data;
};

export const getMunicipalities = async (provinceId) => {
	const response = await axios.get(
		`${API_URL}/provinces/${provinceId}/municipalities`
	);
	return response.data;
};

export const getBarangays = async (municipalityId) => {
	const response = await axios.get(
		`${API_URL}/municipalities/${municipalityId}/barangays`
	);
	return response.data;
};
