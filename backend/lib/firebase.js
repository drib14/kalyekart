import admin from "firebase-admin";

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log("🔑 Initializing Firebase Admin SDK from service account file...");
  const serviceAccountPath = path.resolve(
    __dirname,
    "../firebase-service-account.json"
  );
  const serviceAccount = require(serviceAccountPath);

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
