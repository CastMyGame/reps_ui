/* Standalone local FCM test worker. It is intentionally separate from REPS app code. */
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDrD8VQP0AcHp8uJI1IjFakHn214hav9j4",
  authDomain: "notification-service-reps.firebaseapp.com",
  projectId: "notification-service-reps",
  storageBucket: "notification-service-reps.firebasestorage.app",
  messagingSenderId: "514965369233",
  appId: "1:514965369233:web:4bb7a21f33f365a42f6a30"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || "REPS test";
  return self.registration.showNotification(title, {
    body: payload.notification?.body || payload.data?.body || "Firebase message received.",
    icon: "/repsLogo.png",
    tag: "reps-fcm-test"
  });
});
