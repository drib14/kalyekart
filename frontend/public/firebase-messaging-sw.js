import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyDkQL2BbtR_Vpi6DP039667QKSxFCjDIFk",
  authDomain: "kalyekart-9556a.firebaseapp.com",
  projectId: "kalyekart-9556a",
  storageBucket: "kalyekart-9556a.firebasestorage.app",
  messagingSenderId: "993765824457",
  appId: "1:993765824457:web:f3c28dc4b3f3b323fafa18",
  measurementId: "G-MNSQSX1HVW"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});