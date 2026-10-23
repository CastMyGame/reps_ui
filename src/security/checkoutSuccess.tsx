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
        Payment was submitted. Account provisioning waits for Stripe confirmation. New teacher accounts require school administrator activation before login or password setup. Payment does not grant administrator access.
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
        Ask your existing school administrator to activate your account. Then use Forgot password on this REPS login page or Google login with your registered email. No initial password is emailed automatically. If your school has no administrator, contact REPS for assisted setup; creating a school does not create its first administrator.
      </p>
    </div>
  );
}
