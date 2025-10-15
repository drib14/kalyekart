import axios from "../lib/axios";

export const getFavorites = async () => {
	const response = await axios.get("/favorites");
	return response.data;
};

export const addFavorite = async (productId) => {
	const response = await axios.post(`/favorites/${productId}`);
	return response.data;
};

export const removeFavorite = async (productId) => {
	const response = await axios.delete(`/favorites/${productId}`);
	return response.data;
};