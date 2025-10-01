import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
	let serviceAccount;

	// Check if the environment variable is set
	if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
		serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
		// Correctly format the private key by replacing escaped newlines
		if (serviceAccount.private_key) {
			serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
		}
		console.log("Initializing Firebase Admin SDK from environment variable...");
	} else {
		// Fallback to reading from the file
		const serviceAccountPath = path.join(__dirname, "..", "firebase-service-account.json");
		serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
		console.log("Initializing Firebase Admin SDK from file...");
	}

	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});

	console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
	console.error("Firebase Admin SDK initialization error:", error.message);
	// Optional: Exit the process only if Firebase is absolutely essential for startup
	process.exit(1);
}

export default admin;