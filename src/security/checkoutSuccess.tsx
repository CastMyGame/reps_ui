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
      <h1>Payment successful</h1>
      <p>
        Thanks — your subscription is active. We’re now provisioning your school +
        teacher account.
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
          Back to Registration
        </button>
      </div>

      <p style={{ marginTop: 18, color: "#666" }}>
        If login doesn’t work immediately, wait ~10–30 seconds and try again — the
        provisioning happens when Stripe confirms the checkout via webhook.
      </p>
    </div>
  );
}
