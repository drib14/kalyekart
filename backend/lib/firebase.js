import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
	let serviceAccount;

	// Priority 1: Use individual environment variables (most robust method)
	if (process.env.FIREBASE_PROJECT_ID) {
		console.log("Initializing Firebase Admin SDK from individual environment variables...");
		serviceAccount = {
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
	}
	// Priority 2: Use a single JSON environment variable
	else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
		console.log("Initializing Firebase Admin SDK from single JSON environment variable...");
		serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
		// Correctly format the private key by replacing escaped newlines
		if (serviceAccount.private_key) {
			serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
		}
	}
	// Priority 3: Fallback to reading from the file for local development
	else {
		console.log("Initializing Firebase Admin SDK from file...");
		const serviceAccountPath = path.join(__dirname, "..", "firebase-service-account.json");
		serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
	}

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});

	console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
	console.error("Firebase Admin SDK initialization error:", error.message);
	process.exit(1);
}

export default admin;