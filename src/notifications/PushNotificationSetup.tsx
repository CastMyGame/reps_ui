import { useState } from "react";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import { FcmSetupError, requestFcmToken } from "./firebaseMessaging";

const PushNotificationSetup = () => {
  const [status, setStatus] = useState<"idle" | "working" | "enabled" | "error">("idle");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const enablePush = async () => {
    setStatus("working");
    setMessage("");
    try {
      const registrationToken = await requestFcmToken();
      setToken(registrationToken);
      setStatus("enabled");
      setMessage("This device is ready to receive REPS notifications.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof FcmSetupError ? error.message : "Push setup could not be completed. Please try again.");
    }
  };

  const copyToken = async () => {
    await navigator.clipboard.writeText(token);
    setMessage("Registration token copied. You can use it for a Firebase Console test.");
  };

  return (
    <section className="mobile-admin-section" aria-labelledby="mobile-push-heading">
      <h3 id="mobile-push-heading">Notifications</h3>
      <p className="mobile-admin-supporting-copy">Turn on alerts for new referrals and updates that need your attention.</p>
      <button className="mobile-admin-primary-action" type="button" disabled={status === "working" || status === "enabled"} onClick={enablePush}>
        <NotificationsActiveRoundedIcon aria-hidden="true" />
        <span>
          <strong>{status === "enabled" ? "Notifications enabled" : "Enable notifications"}</strong>
          <small>{status === "enabled" ? "This device can receive push alerts." : "Allow REPS to send you mobile alerts."}</small>
        </span>
      </button>
      {message && <p className={status === "error" ? "mobile-admin-error" : "mobile-admin-supporting-copy"} role={status === "error" ? "alert" : "status"}>{message}</p>}
      {token && <button type="button" onClick={copyToken}>Copy test token</button>}
    </section>
  );
};

export default PushNotificationSetup;
