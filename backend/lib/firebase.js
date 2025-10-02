import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Check if the individual Firebase environment variables are set.
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  ) {
    console.log("🔑 Initializing Firebase Admin SDK from individual environment variables...");

    // Sanitize the private key to handle potential formatting issues from environment variables.
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '')
      // 1. Remove potential surrounding quotes that some systems add.
      .replace(/^"|"$/g, '')
      // 2. Replace literal "\\n" strings with actual newline characters.
      .replace(/\\n/g, '\n');

    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
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
    // Fallback to a local service account file for local development.
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
  console.error("👉 For production, ensure FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables are set correctly.");
  process.exit(1);
}

export default admin;