// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app = null;
let messaging = null;

try {
  // Check if critical config is present to avoid crashing immediately
  if (!firebaseConfig.projectId) {
    console.warn("VITE_FIREBASE_PROJECT_ID is missing. Firebase features will be disabled.");
  } else if (!firebaseConfig.apiKey) {
    console.warn("VITE_FIREBASE_API_KEY is missing. Firebase features will be disabled.");
  } else {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    console.log("Firebase initialized successfully");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // App continues without Firebase
}

export { messaging };
