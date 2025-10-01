import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			// devOptions: {
			// 	enabled: true, // for testing in dev
			// },
		}),
	],
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
					"Referer": "https://www.geoportal.gov.ph/",
				},
			},
		},
	},
});