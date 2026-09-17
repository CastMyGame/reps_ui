import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";

export type NotificationKind = "info" | "success" | "warning";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  target?: string;
  createdAt: number;
}

export type NewNotification = Omit<AppNotification, "id" | "createdAt">;

interface NotificationContextValue {
  notifications: AppNotification[];
  notify: (notification: NewNotification, options?: { browser?: boolean }) => void;
  dismiss: (id: string) => void;
  requestBrowserPermission: () => Promise<NotificationPermission | "unsupported">;
  browserPermission: NotificationPermission | "unsupported";
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const initialBrowserPermission = (): NotificationPermission | "unsupported" =>
  "Notification" in window ? Notification.permission : "unsupported";

export const NotificationProvider = ({ children }: PropsWithChildren) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | "unsupported">(initialBrowserPermission);

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const showBrowserNotification = useCallback((notification: AppNotification) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: "/repsLogo.png",
      tag: notification.id,
    });

    browserNotification.onclick = () => {
      window.focus();
      if (notification.target) window.location.assign(notification.target);
      browserNotification.close();
    };
  }, []);

  const notify = useCallback((newNotification: NewNotification, options?: { browser?: boolean }) => {
    const notification: AppNotification = {
      ...newNotification,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setNotifications((current) => [notification, ...current].slice(0, 4));
    if (options?.browser) showBrowserNotification(notification);
  }, [showBrowserNotification]);

  const requestBrowserPermission = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported" as const;
    const permission = await Notification.requestPermission();
    setBrowserPermission(permission);
    return permission;
  }, []);

  const value = useMemo(() => ({ notifications, notify, dismiss, requestBrowserPermission, browserPermission }), [notifications, notify, dismiss, requestBrowserPermission, browserPermission]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};
