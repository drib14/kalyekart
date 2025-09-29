import axios from "axios";

export const getCoordinates = async (query) => {
	const response = await axios.get(
		`/nominatim/search?q=${query}&format=json`
	);
	return response.data;
};