import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path for the Render Secret File
const RENDER_SECRET_FILE_PATH = '/etc/secrets/firebase-service-account.json';

try {
  let serviceAccount;

  // For production on Render, use the Secret File.
  if (fs.existsSync(RENDER_SECRET_FILE_PATH)) {
    console.log("🔑 Initializing Firebase Admin SDK from Render Secret File...");
    const serviceAccountString = fs.readFileSync(RENDER_SECRET_FILE_PATH, 'utf8');
    serviceAccount = JSON.parse(serviceAccountString);

    console.log("✅ Firebase Admin SDK initialized successfully from Render Secret File.");

  } else {
    // Fallback to a local service account file for local development.
    // This file should be in .gitignore.
    console.log("🔑 Initializing Firebase Admin SDK from local service account file...");
    const localServiceAccountPath = path.resolve(__dirname, "../firebase-service-account.json");

    if (!fs.existsSync(localServiceAccountPath)) {
        throw new Error(`Local service account file not found at ${localServiceAccountPath}. Please ensure it exists for local development or that the Render Secret File is configured for production.`);
    }

    serviceAccount = require(localServiceAccountPath);

    console.log("✅ Firebase Admin SDK initialized successfully from local file.");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

} catch (error) {
  console.error("❌ Firebase Admin SDK initialization error:", error.message);
  console.error("👉 For production, ensure you have uploaded your service account JSON as a Secret File on Render with the destination path set to `/etc/secrets/firebase-service-account.json`.");
  console.error("👉 For local development, ensure 'firebase-service-account.json' exists in the 'backend' directory.");
  process.exit(1);
}

export default admin;