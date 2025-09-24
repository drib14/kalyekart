import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:5000",
			},
			"/nominatim": {
				target: "https://nominatim.openstreetmap.org",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/nominatim/, ""),
				headers: {
					"User-Agent": "Cebu-Delivery-App/1.0",
				},
			},
		},
	},
});
