// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDkQL2BbtR_Vpi6DP039667QKSxFCjDIFk",
  authDomain: "kalyekart-9556a.firebaseapp.com",
  projectId: "kalyekart-9556a",
  storageBucket: "kalyekart-9556a.firebasestorage.app",
  messagingSenderId: "993765824457",
  appId: "1:993765824457:web:f3c28dc4b3f3b323fafa18",
  measurementId: "G-MNSQSX1HVW"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
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