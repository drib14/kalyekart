import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

try {
	console.log("🔑 Initializing Firebase Admin SDK...");

	let credential;

	// Check if we have the individual environment variables
	if (
		process.env.FIREBASE_PROJECT_ID &&
		process.env.FIREBASE_CLIENT_EMAIL &&
		process.env.FIREBASE_PRIVATE_KEY
	) {
		console.log("Using individual environment variables for Firebase...");

		let privateKey = process.env.FIREBASE_PRIVATE_KEY;
		// Handle escaped newlines
		privateKey = privateKey.replace(/\\n/g, "\n");

		// Remove surrounding quotes if they exist (common issue with .env files)
		if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
			privateKey = privateKey.substring(1, privateKey.length - 1);
		}

		credential = admin.credential.cert({
			projectId: process.env.FIREBASE_PROJECT_ID,
			clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
			privateKey: privateKey,
		});
	}
	// Fallback to the single JSON string variable
	else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
		console.log("Using FIREBASE_SERVICE_ACCOUNT environment variable...");
		const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
		credential = admin.credential.cert(serviceAccount);
	}
	else {
		throw new Error("No Firebase credentials found in environment variables.");
	}

	admin.initializeApp({
		credential: credential,
	});

	console.log("✅ Firebase Admin SDK initialized successfully.");
} catch (error) {
	console.error("❌ Firebase Admin SDK initialization error:", error.message);
	console.error("⚠️ The server will continue to run, but Firebase features (like notifications) will not work.");
	// We do NOT exit the process here, allowing the server to start even with bad credentials
}

export default admin;
