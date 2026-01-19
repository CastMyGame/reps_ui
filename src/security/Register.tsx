import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { baseUrl } from "../utils/jsonData";
import { School } from "src/types/school";

type SchoolResponse = {
  school: School | null;
  error: string;
};

type CheckoutResponse = {
  url: string | null;
  error: string;
};

const PRICE_IDS = {
  monthly: "price_1RtIGqPsDvvGNveTKLCJPk7p",
  yearly: "price_1RtIJFPsDvvGNveTXRsEzWtJ",
} as const;

type Plan = keyof typeof PRICE_IDS;

export default function Register() {
  // --- Step 1: Load & select (or create) school ---
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolsError, setSchoolsError] = useState<string>("");

  const [schoolQuery, setSchoolQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const [showCreateSchool, setShowCreateSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newCurrencyName, setNewCurrencyName] = useState("");
  const [creatingSchool, setCreatingSchool] = useState(false);
  const [createSchoolError, setCreateSchoolError] = useState("");

  // --- Step 2: Teacher info + plan ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [plan, setPlan] = useState<Plan>("monthly");

  // --- Step 3: Checkout ---
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    const fetchSchools = async () => {
      setSchoolsLoading(true);
      setSchoolsError("");
      try {
        const res = await axios.get<School[]>(`${baseUrl}/school/v1/all`);
        setSchools(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setSchools([]);
        setSchoolsError(
          "Failed to load schools. Please refresh and try again."
        );
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const filteredSchools = useMemo(() => {
    const q = schoolQuery.trim().toLowerCase();
    if (!q) return schools;

    return schools.filter((s) =>
      (s.schoolName || "").toLowerCase().includes(q)
    );
  }, [schools, schoolQuery]);

  const canContinueToTeacherStep = !!selectedSchool;

  const canCheckout =
    !!selectedSchool &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0;

  const resetCreateSchool = () => {
    setNewSchoolName("");
    setNewCurrencyName("");
    setCreateSchoolError("");
  };

  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school);
    setShowCreateSchool(false);
    resetCreateSchool();

    // Optional convenience: when they choose a new school, clear teacher fields
    // setFirstName(""); setLastName(""); setEmail("");
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSchoolError("");

    const name = newSchoolName.trim();
    const currency = newCurrencyName.trim();

    if (!name) return setCreateSchoolError("School name is required.");
    if (!currency) return setCreateSchoolError("Currency name is required.");

    setCreatingSchool(true);
    try {
      const payload = {
        schoolName: name,
        currency: currency,
        // maxPunishLevel and id are set server-side
      };

      const res = await axios.post<SchoolResponse>(
        `${baseUrl}/school/v1/newSchool`,
        payload
      );

      const created = res.data?.school;
      if (!created) {
        setCreateSchoolError(res.data?.error || "Failed to create school.");
        return;
      }

      // Add to local list if not already present, then select it
      setSchools((prev) => {
        const exists = prev.some(
          (s) => s.schoolIdNumber === created.schoolIdNumber
        );
        return exists ? prev : [created, ...prev];
      });

      setSelectedSchool(created);
      setShowCreateSchool(false);
      resetCreateSchool();
      setSchoolQuery(created.schoolName || "");
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      console.error("Create school failed", {
        status,
        data,
        message: err?.message,
      });
    } finally {
      setCreatingSchool(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedSchool) return;

    setCheckoutError("");
    setCheckoutLoading(true);

    try {
      const payload = {
        priceId: PRICE_IDS[plan],
        schoolIdNumber: selectedSchool.schoolIdNumber,
        schoolName: selectedSchool.schoolName,
        currencyName: selectedSchool.currency,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
      };

      const res = await axios.post<CheckoutResponse>(
        `${baseUrl}/stripe/v1/create-checkout-session`,
        payload
      );

      if (!res.data?.url) {
        setCheckoutError(res.data?.error || "Unable to start checkout.");
        return;
      }

      window.location.href = res.data.url;
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const headers = err?.response?.headers;

      console.error("Checkout failed", {
        url: `${baseUrl}/stripe/v1/create-checkout-session`,
        status,
        data,
        headers,
        message: err?.message,
      });

      // show something meaningful on screen
      setCheckoutError(
        data?.error ||
          (typeof data === "string" ? data : null) ||
          `Checkout failed (status ${status ?? "unknown"})`
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Create your REPS Discipline account</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Select your school, choose a plan, then complete payment to finish
        setup.
      </p>

      {/* Step 1: School selection */}
      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>1) Select your school</h2>

        {schoolsLoading && <p>Loading schools…</p>}
        {!!schoolsError && <p style={{ color: "crimson" }}>{schoolsError}</p>}

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginTop: 8,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={schoolQuery}
            onChange={(e) => setSchoolQuery(e.target.value)}
            placeholder="Search school name…"
            style={{
              flex: "1 1 320px",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
          <button
            type="button"
            onClick={() => {
              setShowCreateSchool((v) => !v);
              setCreateSchoolError("");
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
              color: "#111",
            }}
          >
            Can’t find your school? Click to Create
          </button>
        </div>

        {/* Results */}
        {!schoolsLoading && filteredSchools.length > 0 && (
          <div
            style={{
              marginTop: 12,
              maxHeight: 260,
              overflow: "auto",
              border: "1px solid #eee",
              borderRadius: 8,
            }}
          >
            {filteredSchools.slice(0, 50).map((s) => {
              const isSelected =
                selectedSchool?.schoolIdNumber === s.schoolIdNumber;
              return (
                <button
                  key={s.schoolIdNumber}
                  type="button"
                  onClick={() => handleSelectSchool(s)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 12,
                    border: "none",
                    borderBottom: "1px solid #f0f0f0",
                    background: isSelected ? "#f5f8ff" : "white",
                    cursor: "pointer",
                    color: "#111",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#111" }}>
                    {s.schoolName}
                  </div>
                  <div style={{ fontSize: 13, color: "#555" }}>
                    Currency: {s.currency} • School ID: {s.schoolIdNumber}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!schoolsLoading && filteredSchools.length === 0 && (
          <p style={{ marginTop: 12, color: "#555" }}>
            No schools match that search. Try creating a new one.
          </p>
        )}

        {/* Selected school card */}
        {selectedSchool && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 10,
              background: "#f7f7f7",
            }}
          >
            <div style={{ fontWeight: 800, color: "#111" }}>
              Selected School
            </div>
            <div>Name: {selectedSchool.schoolName}</div>
            <div>Currency: {selectedSchool.currency}</div>
            <div>School ID: {selectedSchool.schoolIdNumber}</div>
            <button
              type="button"
              onClick={() => setSelectedSchool(null)}
              style={{
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                background: "white",
                cursor: "pointer",
                color: "#111",
              }}
            >
              Change school
            </button>
          </div>
        )}

        {/* Create school */}
        {showCreateSchool && (
          <form
            onSubmit={handleCreateSchool}
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 10,
              border: "1px solid #eee",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              Create a new school
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                type="text"
                value={newSchoolName}
                onChange={(e) => setNewSchoolName(e.target.value)}
                placeholder="School name"
                style={{
                  flex: "1 1 280px",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="text"
                value={newCurrencyName}
                onChange={(e) => setNewCurrencyName(e.target.value)}
                placeholder='Currency name (e.g., "points")'
                style={{
                  flex: "1 1 220px",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />
            </div>

            {!!createSchoolError && (
              <p style={{ color: "crimson", marginTop: 10 }}>
                {createSchoolError}
              </p>
            )}

            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={creatingSchool}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#254c4c",
                  color: "white",
                  cursor: "pointer",
                  opacity: creatingSchool ? 0.7 : 1,
                }}
              >
                {creatingSchool ? "Creating…" : "Create school"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateSchool(false);
                  resetCreateSchool();
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  background: "white",
                  cursor: "pointer",
                  color: "#111",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Step 2: Teacher info + plan */}
      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
          opacity: canContinueToTeacherStep ? 1 : 0.5,
        }}
      >
        <h2 style={{ marginTop: 0 }}>2) Teacher info + plan</h2>
        {!selectedSchool && <p>Select a school to continue.</p>}

        {selectedSchool && (
          <>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                style={{
                  flex: "1 1 220px",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                style={{
                  flex: "1 1 220px",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                style={{
                  flex: "1 1 280px",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Plan</div>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginRight: 16,
                  gap: 8,
                  color: "#111",
                }}
              >
                <input
                  type="radio"
                  name="plan"
                  value="monthly"
                  checked={plan === "monthly"}
                  onChange={() => setPlan("monthly")}
                />
                Monthly
              </label>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#111",
                }}
              >
                <input
                  type="radio"
                  name="plan"
                  value="yearly"
                  checked={plan === "yearly"}
                  onChange={() => setPlan("yearly")}
                />
                Yearly
              </label>
            </div>
          </>
        )}
      </section>

      {/* Step 3: Checkout */}
      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>3) Continue to payment</h2>

        {!!checkoutError && <p style={{ color: "crimson" }}>{checkoutError}</p>}

        <button
          type="button"
          disabled={!canCheckout || checkoutLoading}
          onClick={handleCheckout}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: canCheckout ? "#FF7A35" : "#ccc",
            color: "white",
            cursor: canCheckout ? "pointer" : "not-allowed",
            opacity: checkoutLoading ? 0.7 : 1,
            fontWeight: 800,
          }}
        >
          {checkoutLoading
            ? "Redirecting to Stripe…"
            : "Continue to Stripe Checkout"}
        </button>

        <p style={{ marginTop: 10, color: "#555" }}>
          You’ll complete payment on Stripe. After payment, your account will be
          provisioned automatically.
        </p>
      </section>
    </div>
  );
}
