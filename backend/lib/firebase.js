import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // For production environments like Render, use a single environment variable
  // containing the entire JSON service account object.
  if (process.env.FIREBASE_CREDENTIALS) {
    console.log("🔑 Initializing Firebase Admin SDK from FIREBASE_CREDENTIALS environment variable...");

    console.log(">>>> DEBUG START <<<<");
    console.log("RAW FIREBASE_CREDENTIALS:", JSON.stringify(process.env.FIREBASE_CREDENTIALS));

    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

    // The private key within the JSON object needs its newlines correctly formatted.
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

    console.log("SANITIZED private_key:", JSON.stringify(serviceAccount.private_key));
    console.log(">>>> DEBUG END <<<<");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized successfully from environment variable.");

  } else {
    // Fallback to a local service account file for local development.
    // This file should be in .gitignore.
    console.log("🔑 Initializing Firebase Admin SDK from local service account file...");
    const serviceAccountPath = path.resolve(__dirname, "../firebase-service-account.json");
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin SDK initialized successfully from file.");
  }
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization error:", error.message);
  if (error.code === 'MODULE_NOT_FOUND') {
      console.error("👉 For local development, ensure 'firebase-service-account.json' exists in the 'backend' directory.");
  }
  console.error("👉 For production, ensure the FIREBASE_CREDENTIALS environment variable is set correctly.");
  process.exit(1);
}

export default admin;