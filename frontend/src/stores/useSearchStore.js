import { create } from "zustand";
import axios from "../lib/axios";

const useSearchStore = create((set, get) => ({
	query: "",
	results: [],
	history: JSON.parse(localStorage.getItem("searchHistory")) || [],
	isLoading: false,
	error: null,

	setQuery: (query) => set({ query }),

	searchProducts: async (query) => {
		if (!query) {
			return set({ results: [], isLoading: false });
		}
		set({ isLoading: true, error: null });
		try {
			const res = await axios.get(`/products/search?q=${query}`);
			set({ results: res.data, isLoading: false });
		} catch (error) {
			const message = error.response?.data?.message || "Failed to fetch search results";
			set({ error: message, isLoading: false });
		}
	},

	addToHistory: (query) => {
		if (!query) return;
		const { history } = get();
		const newHistory = [query, ...history.filter((h) => h !== query)].slice(0, 5); // Keep last 5 searches
		set({ history: newHistory });
		localStorage.setItem("searchHistory", JSON.stringify(newHistory));
	},

	clearHistory: () => {
		set({ history: [] });
		localStorage.removeItem("searchHistory");
	},
}));

export default useSearchStore;
