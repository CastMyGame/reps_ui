import React from "react";
import { useNavigate } from "react-router-dom";

export default function CheckoutCancel() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Checkout canceled</h1>
      <p>No worries — you weren’t charged.</p>

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/sign-up")}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: "#FF7A35",
            color: "white",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Try again
        </button>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
