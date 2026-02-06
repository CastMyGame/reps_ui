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
  monthly: "price_1SxV0BL6eaJCQwNQLWIQKkoD",
  yearly: "price_1SxajDL6eaJCQwNQYOsv0kMo",
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

  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const zipDigits = zip.replace(/\D/g, "");

  const [zipLookupLoading, setZipLookupLoading] = useState(false);
  const [zipLookupError, setZipLookupError] = useState("");

  const lookupZip = async (zip5: string) => {
    // Using Zippopotam.us (no key). Example: https://api.zippopotam.us/us/29455
    const url = `https://api.zippopotam.us/us/${zip5}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ZIP lookup failed (${res.status})`);
    return res.json();
  };

  useEffect(() => {
    setSchoolQuery("");
    setSelectedSchool(null);
    setShowCreateSchool(false);
    setCreateSchoolError("");
  }, [zip]);

  useEffect(() => {
    const fetchSchools = async () => {
      const zip5 = zip.replace(/\D/g, "");

      // Only load when ZIP is valid AND we have city/state from lookup
      if (zip5.length !== 5 || !city.trim() || state.trim().length !== 2) {
        setSchools([]);
        setSelectedSchool(null);
        return;
      }

      setSchoolsLoading(true);
      setSchoolsError("");

      try {
        const res = await axios.get<School[]>(`${baseUrl}/school/v1/search`, {
          params: { city: city.trim(), state: state.trim() },
        });

        setSchools(Array.isArray(res.data) ? res.data : []);
      } catch (e: any) {
        console.error(
          "fetchSchools failed",
          e?.response?.status,
          e?.response?.data,
        );
        setSchools([]);
        setSchoolsError("Failed to load schools for that ZIP.");
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, [zip, city, state]);

  useEffect(() => {
    const zip5 = zip.replace(/\D/g, "");
    setZipLookupError("");

    if (zip5.length !== 5) {
      // Clear location if ZIP not valid yet
      setCity("");
      setState("");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setZipLookupLoading(true);
        setSchools([]);
        setSchoolsError("");
        setSelectedSchool(null);

        const data = await lookupZip(zip5);

        // Zippopotam format:
        // data.places[0]["place name"] => city
        // data.places[0]["state abbreviation"] => state
        const place = data?.places?.[0];
        const cityName = place?.["place name"] || "";
        const stateAbbr = place?.["state abbreviation"] || "";

        if (!cancelled) {
          setCity(cityName);
          setState(stateAbbr);
        }
      } catch (e: any) {
        if (!cancelled) {
          setCity("");
          setState("");
          setZipLookupError("Could not find that ZIP code.");
        }
      } finally {
        if (!cancelled) setZipLookupLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [zip]);

  const filteredSchools = useMemo(() => {
    const q = schoolQuery.trim().toLowerCase();
    if (!q) return schools;

    return schools.filter((s) =>
      (s.schoolName || "").toLowerCase().includes(q),
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
    const cityValue = city.trim();
    const stateValue = state.trim().toUpperCase();

    if (zipDigits.length !== 5)
      return setCreateSchoolError("ZIP must be 5 digits.");

    if (!cityValue) return setCreateSchoolError("City is required.");
    if (stateValue.length !== 2)
      return setCreateSchoolError("State must be 2 letters.");
    if (!name) return setCreateSchoolError("School name is required.");
    if (!currency) return setCreateSchoolError("Currency name is required.");

    setCreatingSchool(true);
    try {
      const payload = {
        schoolName: name,
        currency: currency,
        city: cityValue,
        state: stateValue,
        zip: zipDigits,
      };

      const res = await axios.post<SchoolResponse>(
        `${baseUrl}/school/v1/newSchool`,
        payload,
      );

      const created = res.data?.school;
      if (!created) {
        setCreateSchoolError(res.data?.error || "Failed to create school.");
        return;
      }

      // Add to local list if not already present, then select it
      setSchools((prev) => {
        const exists = prev.some(
          (s) => s.schoolIdNumber === created.schoolIdNumber,
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
        payload,
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
          `Checkout failed (status ${status ?? "unknown"})`,
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

        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}
        >
          <input
            type="text"
            value={zip}
            onChange={(e) =>
              setZip(e.target.value.replace(/\D/g, "").slice(0, 5))
            }
            placeholder="ZIP code (5 digits)"
            style={{
              flex: "0 0 180px",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />

          <input
            type="text"
            value={city}
            readOnly
            placeholder="City"
            style={{
              flex: "1 1 240px",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#f7f7f7",
            }}
          />

          <input
            type="text"
            value={state}
            readOnly
            placeholder="State"
            style={{
              flex: "0 0 90px",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#f7f7f7",
            }}
          />
        </div>

        {zipLookupLoading && <p style={{ marginTop: 8 }}>Looking up ZIP…</p>}
        {!!zipLookupError && (
          <p style={{ marginTop: 8, color: "crimson" }}>{zipLookupError}</p>
        )}

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
            placeholder={
              zipDigits.length === 5 && !zipLookupError
                ? "Search school name…"
                : "Enter ZIP to search schools…"
            }
            disabled={zipDigits.length !== 5 || !!zipLookupError}
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
              // only allow creating once ZIP lookup succeeded
              if (
                zipDigits.length !== 5 ||
                !city.trim() ||
                state.trim().length !== 2 ||
                zipLookupError
              ) {
                setCreateSchoolError(
                  "Enter a valid 5-digit ZIP so we can locate your city/state before creating a school.",
                );
                setShowCreateSchool(true);
                return;
              }

              setShowCreateSchool((v) => !v);
              setCreateSchoolError("");
              if (schoolQuery.trim() && !newSchoolName.trim()) {
                setNewSchoolName(schoolQuery.trim());
              }
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

        {zipDigits.length !== 5 ? (
          <p style={{ marginTop: 12, color: "#555" }}>
            Enter a 5-digit ZIP code to load schools.
          </p>
        ) : !zipLookupLoading &&
          !zipLookupError &&
          !schoolsLoading &&
          filteredSchools.length === 0 ? (
          <p style={{ marginTop: 12, color: "#555" }}>
            No schools found in {city}, {state} {zipDigits}. Try creating one.
          </p>
        ) : null}

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
