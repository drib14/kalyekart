import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "sonner";
import {
	getFavorites as getFavoritesApi,
	addFavorite as addFavoriteApi,
	removeFavorite as removeFavoriteApi,
} from "../api/favorite.api";

export const useUserStore = create((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,
	favorites: [],

	setUser: (user) => set({ user }),

	getFavorites: async () => {
		try {
			const favorites = await getFavoritesApi();
			set({ favorites });
		} catch (error) {
			toast.error("Failed to fetch favorites");
		}
	},

	addFavorite: async (productId) => {
		try {
			const { favorites } = await addFavoriteApi(productId);
			set({ favorites });
			toast.success("Product added to favorites");
		} catch (error) {
			toast.error("Failed to add to favorites");
		}
	},

	removeFavorite: async (productId) => {
		try {
			const { favorites } = await removeFavoriteApi(productId);
			set({ favorites });
			toast.success("Product removed from favorites");
		} catch (error) {
			toast.error("Failed to remove from favorites");
		}
	},

	signup: async ({ name, email, password, confirmPassword }) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}

		try {
			const res = await axios.post("/auth/signup", { name, email, password });
			set({ user: res.data, loading: false });
			toast.success("Account created successfully!");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},
	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });
			set({ user: res.data, loading: false });
			toast.success("Logged in successfully!");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},

	googleLogin: async (userProfile) => {
		set({ loading: true });
		try {
			const res = await axios.post("/auth/google", userProfile);
			set({ user: res.data, loading: false });
			toast.success("Logged in successfully with Google!");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "Google login failed");
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
			if (response.data) {
				get().getFavorites();
			}
		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null });
		}
	},

	refreshUser: async () => {
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data });
		} catch (error) {
			console.log("Silent user refresh failed:", error.message);
		}
	},

	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
}));

// TODO: Implement the axios interceptors for refreshing access token
