import { useEffect, useState } from "react";
import { AuthCapabilities, getAuthCapabilities } from "../../utils/api/api";

interface EmailCapabilityIndicatorProps {
  compact?: boolean;
}

const EmailCapabilityIndicator = ({ compact = false }: EmailCapabilityIndicatorProps) => {
  const [capabilities, setCapabilities] = useState<AuthCapabilities | null>(null);

  useEffect(() => {
    let active = true;
    getAuthCapabilities()
      .then((capabilities) => {
        if (active) setCapabilities(capabilities);
      })
      .catch(() => {
        // An unavailable status must not promise a usable delivery route.
        if (active) setCapabilities(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const reconnectRequired = capabilities?.emailProvider === "RECONNECT_REQUIRED"
    || capabilities?.emailPermission === "RECONNECT_REQUIRED";
  const canSendAsUser = !reconnectRequired && capabilities?.emailProvider === "GOOGLE_GMAIL"
    && capabilities.canSendAsUser;
  const smtpAvailable = !reconnectRequired && capabilities?.emailProvider === "REPS_SMTP";
  const label = reconnectRequired ? "Gmail reconnect required"
    : canSendAsUser ? "Google email enabled"
    : smtpAvailable ? "REPS email service" : "Email status unavailable";
  const message = reconnectRequired
    ? "Reconnect Gmail in Gmail settings. Email requiring your Gmail connection is blocked."
    : canSendAsUser ? "Messages will be sent from your Google account."
    : smtpAvailable ? "Outbound notifications will be sent through the REPS service account."
    : "Email availability could not be verified. Check Gmail settings or try again.";

  return (
    <div
      role="status"
      aria-live="polite"
      title={message}
      style={{
        alignItems: "center",
        color: "#667085",
        display: compact ? "inline-flex" : "flex",
        fontSize: compact ? 10 : 12,
        gap: 8,
        lineHeight: 1.35,
        margin: compact ? "0 10px" : "12px 0 18px",
        verticalAlign: "middle",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          background: reconnectRequired ? "#b45309" : canSendAsUser ? "#2563eb" : "#98a2b3",
          borderRadius: "50%",
          boxShadow: canSendAsUser ? "0 0 0 3px rgba(37,99,235,.12)" : "none",
          display: "inline-block",
          flex: "0 0 auto",
          height: compact ? 7 : 9,
          width: compact ? 7 : 9,
        }}
      />
      <span>
        {compact ? label : (
          <>
            {label}
            <br />
            {message}
            <br />
            <a href="/account/gmail">Gmail settings</a>
            {["ADMIN", "TEACHER"].includes(sessionStorage.getItem("role") || "") && <>{" · "}<a href="/account/student-access">Student access</a></>}
            {" Â· "}
            <a href="/account/notifications">Email status</a>
          </>
        )}
      </span>
    </div>
  );
};

export default EmailCapabilityIndicator;
