import admin from "firebase-admin";
import serviceAccount from "./firebase-service-account.json" assert { type: "json" };

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error.message);
  process.exit(1);
}

export default admin;