import admin from "firebase-admin";

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error.message);
  // Exit the process if Firebase initialization fails, as it's a critical service
  process.exit(1);
}

export default admin;