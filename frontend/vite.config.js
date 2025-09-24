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
			"/psgc": {
				target: "https://psgc.rootscratch.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/psgc/, ""),
			},
		},
	},
});
