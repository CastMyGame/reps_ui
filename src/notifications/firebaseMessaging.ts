import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  Messaging,
  onMessage,
  Unsubscribe,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "",
};

const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY || "";

export interface ForegroundPushPayload {
  title: string;
  body: string;
  target?: string;
}

export class FcmSetupError extends Error {}

const isConfigured = () =>
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      vapidKey,
  );

const messaging = async (): Promise<Messaging> => {
  if (!isConfigured()) {
    throw new FcmSetupError("Firebase Cloud Messaging has not been configured for this environment.");
  }

  if (!(await isSupported())) {
    throw new FcmSetupError("Push notifications are not supported by this browser.");
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getMessaging(app);
};

/**
 * Requests notification permission and returns the device's FCM registration token.
 * Send this token to the authenticated backend immediately; do not keep it only in
 * browser storage because FCM can rotate it.
 */
export const requestFcmToken = async (): Promise<string> => {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new FcmSetupError("Push notifications require a supported browser and service workers.");
  }

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;

  if (permission !== "granted") {
    throw new FcmSetupError("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const token = await getToken(await messaging(), {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new FcmSetupError("Firebase did not return a registration token for this device.");
  }

  return token;
};

/** Listens for messages while the REPS app is open in the foreground. */
export const onForegroundPush = async (
  handler: (payload: ForegroundPushPayload) => void,
): Promise<Unsubscribe> =>
  onMessage(await messaging(), (payload) => {
    handler({
      title: payload.notification?.title || payload.data?.title || "REPS",
      body: payload.notification?.body || payload.data?.body || "You have a new update.",
      target: payload.data?.target,
    });
  });
