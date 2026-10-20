import { useEffect, useState } from "react";
import { getAuthCapabilities } from "../../utils/api/api";

interface EmailCapabilityIndicatorProps {
  compact?: boolean;
}

const EmailCapabilityIndicator = ({ compact = false }: EmailCapabilityIndicatorProps) => {
  const [canSendAsUser, setCanSendAsUser] = useState(false);

  useEffect(() => {
    let active = true;
    getAuthCapabilities()
      .then((capabilities) => {
        if (active) setCanSendAsUser(capabilities.canSendAsUser);
      })
      .catch(() => {
        // If capabilities cannot be verified, keep the safe REPS service default.
        if (active) setCanSendAsUser(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const message = canSendAsUser
    ? "Messages will be sent from your Google account."
    : "Outbound notifications will be sent through the REPS service account.";

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
          background: canSendAsUser ? "#2563eb" : "#98a2b3",
          borderRadius: "50%",
          boxShadow: canSendAsUser ? "0 0 0 3px rgba(37,99,235,.12)" : "none",
          display: "inline-block",
          flex: "0 0 auto",
          height: compact ? 7 : 9,
          width: compact ? 7 : 9,
        }}
      />
      <span>
        {compact ? (canSendAsUser ? "Google email enabled" : "REPS email service") : (
          <>
            {canSendAsUser ? "Google email permissions enabled" : "REPS email service active"}
            <br />
            {message}
          </>
        )}
      </span>
    </div>
  );
};

export default EmailCapabilityIndicator;
