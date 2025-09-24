import axios from "axios";

export const getCoordinates = async (query) => {
	const response = await axios.get(
		`https://nominatim.openstreetmap.org/search?q=${query}&format=json`
	);
	return response.data;
};