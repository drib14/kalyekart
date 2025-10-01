import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const serviceAccountPath = path.join(__dirname, "..", "firebase-service-account.json");
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error.message);
  process.exit(1);
}

export default admin;