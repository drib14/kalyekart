import admin from "firebase-admin";

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Firebase Initialization Debugging ---
console.log("--- Firebase Auth Debugging ---");
console.log(
	`FIREBASE_PROJECT_ID found: ${!!process.env.FIREBASE_PROJECT_ID}`
);
console.log(
	`FIREBASE_PRIVATE_KEY found: ${!!process.env.FIREBASE_PRIVATE_KEY}`
);
console.log(
	`FIREBASE_CLIENT_EMAIL found: ${!!process.env.FIREBASE_CLIENT_EMAIL}`
);
console.log("-----------------------------");

try {
	// Prioritize service account from a single environment variable (for Render, etc.)
	if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
		console.log("🔑 Initializing Firebase Admin SDK from FIREBASE_SERVICE_ACCOUNT_JSON...");
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		});
		console.log("✅ Firebase Admin SDK initialized successfully from environment variable.");
	} else if (
		process.env.FIREBASE_PROJECT_ID &&
		process.env.FIREBASE_PRIVATE_KEY &&
		process.env.FIREBASE_CLIENT_EMAIL
	) {
		// Fallback to individual environment variables
		console.log("🔑 Initializing Firebase Admin SDK from individual environment variables...");
		const serviceAccount = {
			type: "service_account",
			project_id: process.env.FIREBASE_PROJECT_ID,
			private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
			private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
			client_email: process.env.FIREBASE_CLIENT_EMAIL,
			client_id: process.env.FIREBASE_CLIENT_ID,
			auth_uri: "https://accounts.google.com/o/oauth2/auth",
			token_uri: "https://oauth2.googleapis.com/token",
			auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
			client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
		};
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		});
		console.log("✅ Firebase Admin SDK initialized successfully from environment variables.");
	} else {
		// Fallback to service account file for local development
		console.log("🔑 Initializing Firebase Admin SDK from service account file...");
		const serviceAccountPath = path.resolve(__dirname, "../firebase-service-account.json");
		const serviceAccount = require(serviceAccountPath);
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
		});
		console.log("✅ Firebase Admin SDK initialized successfully from file.");
	}
} catch (error) {
	console.error("❌ Firebase Admin SDK initialization error:", error.message);
	if (error.code === "MODULE_NOT_FOUND") {
		console.error(
			"👉 Please ensure the firebase-service-account.json file exists in the 'backend' directory or that Firebase environment variables are set."
		);
	}
	process.exit(1);
}

export default admin;
