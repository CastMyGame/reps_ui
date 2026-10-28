import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(params.get("session_id"));
  }, [params]);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Billing and school access</h1>
      <p>
        New checkout is unavailable during the approved-onboarding pilot. Billing and onboarding are coordinated through the REPS team. This return page does not verify payment or create an account. Payment does not grant administrator access or school membership.
      </p>

      {sessionId && (
        <p style={{ color: "#555" }}>
          Stripe session: <code>{sessionId}</code>
        </p>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: "#254c4c",
            color: "white",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Go to Login
        </button>

        <button
          onClick={() => navigate("/sign-up")}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Contact REPS
        </button>
      </div>

      <p style={{ marginTop: 18, color: "#666" }}>
        For an existing invitation or account, contact your school administrator. New school activation and first-administrator setup require approval from the REPS team. Existing billing questions can be reviewed by REPS using your payment reference.
      </p>
    </div>
  );
}
