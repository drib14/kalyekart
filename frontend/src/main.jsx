import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "leaflet/dist/leaflet.css";

import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();
const googleClientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<GoogleOAuthProvider clientId={googleClientId}>
			<BrowserRouter>
				<QueryClientProvider client={queryClient}>
					<App />
				</QueryClientProvider>
			</BrowserRouter>
		</GoogleOAuthProvider>
	</StrictMode>
);