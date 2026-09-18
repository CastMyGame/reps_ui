import { useNotifications } from "./NotificationProvider";
import "./notifications.css";

/** Development-only control. It is intentionally not rendered in production. */
const NotificationSimulator = () => {
  const { notify, requestBrowserPermission, browserPermission } = useNotifications();

  if (process.env.NODE_ENV === "production") return null;

  const simulate = (title: string, message: string, target: string, kind: "success" | "warning") => {
    notify({ title, message, target, kind }, { browser: true });
  };

  return <section className="reps-notification-simulator" aria-label="Development notification simulator">
    <p>Notification simulator</p>
    <button type="button" onClick={() => requestBrowserPermission()}>
      {browserPermission === "granted" ? "Browser alerts enabled" : "Enable browser alerts"}
    </button>
    <button type="button" onClick={() => simulate("New referral", "A new referral needs review.", "/m/admin/write-ups", "warning")}>Simulate referral</button>
    <button type="button" onClick={() => simulate("Assignment completed", "A student assignment is ready for review.", "/dashboard/admin", "success")}>Simulate completion</button>
  </section>;
};

export default NotificationSimulator;
