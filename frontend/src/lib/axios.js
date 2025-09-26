import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "/api",
	withCredentials: true, // send cookies to the server
});

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				await axiosInstance.post("/auth/refresh-token");
				return axiosInstance(originalRequest);
			} catch (refreshError) {
				// Here you should handle failed refresh
				// For example, redirect to login page or show a toast
				console.error("Token refresh failed:", refreshError);
				// window.location.href = "/login"; // Example of redirecting
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;