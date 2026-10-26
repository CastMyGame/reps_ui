import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ContactUsModal } from "./contactUsModal";

/** Interest requests use the existing contact channel; they never provision or start checkout. */
export default function Register() {
  const [contact, setContact] = useState("");
  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: "24px", textAlign: "center" }}>
      <h1>Request REPS access for your school</h1>
      <p>School activation requires approval from the REPS team.</p>
      <p>Tell us your school name and location using General Inquiry. We will discuss onboarding and help your authorized school representative establish access.</p>
      <p>An inquiry does not create a school or administrator account, activate access, start a subscription, or take payment. Any approved billing is arranged separately.</p>
      <button type="button" onClick={() => setContact("contact")} className="button-primary">Contact REPS to request access</button>
      <p>Already have an active account? <Link to="/login">Sign in</Link>. For an existing school's invitation or activation, contact your school administrator.</p>
      <p>Please do not include student records, passwords, or other sensitive information in your inquiry.</p>
      {contact && <ContactUsModal setContactUsDisplayModal={setContact} />}
    </main>
  );
}
