import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "./NotificationProvider";
import "./notifications.css";

const NotificationHost = () => {
  const navigate = useNavigate();
  const { notifications, dismiss } = useNotifications();

  if (notifications.length === 0) return null;

  return <aside className="reps-notification-host" aria-live="polite" aria-label="Notifications">
    {notifications.map((notification) => <article key={notification.id} className={`reps-notification reps-notification-${notification.kind}`}>
      <div><strong>{notification.title}</strong><p>{notification.message}</p>{notification.target && <button type="button" onClick={() => { navigate(notification.target!); dismiss(notification.id); }}>View</button>}</div>
      <button className="reps-notification-dismiss" type="button" aria-label={`Dismiss ${notification.title}`} onClick={() => dismiss(notification.id)}><CloseRoundedIcon /></button>
    </article>)}
  </aside>;
};

export default NotificationHost;
