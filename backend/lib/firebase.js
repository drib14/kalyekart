import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  let serviceAccount;

  // For production environments, use a single environment variable
  // containing the entire JSON service account object.
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("🔑 Initializing Firebase Admin SDK from FIREBASE_SERVICE_ACCOUNT environment variable...");

    // Parse the JSON string from the environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // The private key within the JSON object needs its newlines correctly formatted.
    // This handles the escaped newlines from the environment variable.
    if (serviceAccount.private_key) {
        let privateKey = serviceAccount.private_key;
        // The private key within the JSON object needs its newlines correctly formatted.
        // This handles the escaped newlines from the environment variable.
        privateKey = privateKey.replace(/\\n/g, '\n');

        // Remove surrounding quotes if they exist
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }

        serviceAccount.private_key = privateKey;
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized successfully from environment variable.");

  } else {
    // Fallback to a local service account file for local development.
    // This file should be in .gitignore.
    console.log("🔑 Initializing Firebase Admin SDK from local service account file...");
    const localServiceAccountPath = path.resolve(__dirname, "../firebase-service-account.json");

    if (!fs.existsSync(localServiceAccountPath)) {
        throw new Error(`Local service account file not found at ${localServiceAccountPath}. Please ensure it exists for local development.`);
    }

    serviceAccount = require(localServiceAccountPath);

    console.log("✅ Firebase Admin SDK initialized successfully from local file.");
  }

} catch (error) {
  console.error("❌ Firebase Admin SDK initialization error:", error.message);
  console.error("👉 For production, ensure the FIREBASE_SERVICE_ACCOUNT environment variable is set correctly.");
  console.error("👉 For local development, ensure 'firebase-service-account.json' exists in the 'backend' directory.");
  process.exit(1);
}

export default admin;