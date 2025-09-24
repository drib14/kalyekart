import axios from "axios";

export const getCoordinates = async (query) => {
	const response = await axios.get(
		`/nominatim/search?q=${query}&format=json`,
		{
			headers: {
				"User-Agent": "Cebu-Delivery-App/1.0",
			},
		}
	);
	return response.data;
};