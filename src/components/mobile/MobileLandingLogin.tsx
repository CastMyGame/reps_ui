import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "@mui/icons-material/GMobiledataRounded";
import { baseUrl } from "../../utils/jsonData";
import "./mobile-landing.css";

const MobileLandingLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px), (pointer: coarse)").matches) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return <main className="mobile-login-app">
    <section className="mobile-login-card">
      <img src="/repsLogo.png" alt="REPS" className="mobile-login-logo" />
      <p className="mobile-login-eyebrow">REPS DISCIPLINE</p>
      <h1>Welcome back</h1>
      <p>Sign in to manage the moments that matter at your school.</p>
      <button type="button" className="mobile-login-google" onClick={() => { window.location.assign(`${baseUrl}/oauth2/authorization/google`); }}>
        <GoogleIcon aria-hidden="true" /> Continue with Google
      </button>
    </section>
    <p className="mobile-login-footer">Secure school access · Google sign-in</p>
  </main>;
};

export default MobileLandingLogin;
