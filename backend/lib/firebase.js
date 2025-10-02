import admin from "firebase-admin";

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Check for Firebase credentials in environment variables
  if (
    process.env.FIREBASE_TYPE &&
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_CLIENT_ID &&
    process.env.FIREBASE_AUTH_URI &&
    process.env.FIREBASE_TOKEN_URI &&
    process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL &&
    process.env.FIREBASE_CLIENT_X509_CERT_URL
  ) {
    console.log("🔑 Initializing Firebase Admin SDK from environment variables...");
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Fallback to service account file for local development
    console.log(
      "🔑 Initializing Firebase Admin SDK from service account file..."
    );
    const serviceAccountPath = path.resolve(
      __dirname,
      "../firebase-service-account.json"
    );
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  console.log("✅ Firebase Admin SDK initialized successfully.");
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
