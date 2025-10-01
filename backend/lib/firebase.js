import admin from "firebase-admin";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

try {
  console.log("🔑 Initializing Firebase Admin SDK from service account file...");
  const serviceAccount = require("../firebase-service-account.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("❌ Firebase Admin SDK initialization error:", error.message);
  if (error.code === "MODULE_NOT_FOUND") {
    console.error(
      "👉 Please ensure the firebase-service-account.json file exists in the 'backend' directory."
    );
  }
  process.exit(1);
}

export default admin;
