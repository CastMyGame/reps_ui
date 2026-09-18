/*
 * Firebase Cloud Messaging background worker.
 *
 * Before enabling FCM, replace the values in firebase-config.js with the public
 * Web App configuration from Firebase Console. That configuration is not a
 * service-account credential and is safe to expose to a browser.
 */
importScripts("/firebase-config.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js");

if (self.REPS_FIREBASE_CONFIG && self.REPS_FIREBASE_CONFIG.apiKey) {
  firebase.initializeApp(self.REPS_FIREBASE_CONFIG);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || payload.data?.title || "REPS";
    const options = {
      body: payload.notification?.body || payload.data?.body || "You have a new update.",
      icon: "/repsLogo.png",
      data: { target: payload.data?.target || "/m/admin" },
      tag: payload.data?.notificationId || "reps-notification",
    };

    return self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.target || "/m/admin";
  event.waitUntil(clients.openWindow(target));
});
