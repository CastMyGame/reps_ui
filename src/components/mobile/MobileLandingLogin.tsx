import { loginRole } from "../../utils/accountAdministration";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GoogleIcon from "@mui/icons-material/GMobiledataRounded";
import { baseUrl } from "../../utils/jsonData";
import "./mobile-landing.css";

const MobileLandingLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px), (pointer: coarse)").matches) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const routeByRole = (role: string) => {
    if (role === "ADMIN") return navigate("/m/admin");
    if (role === "TEACHER") return navigate("/m/teacher");
    if (role === "STUDENT") return navigate("/m/student");
    if (role === "GUIDANCE") return navigate("/dashboard/guidance");
    setError("Your account does not have a valid REPS role.");
  };

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await axios.post(`${baseUrl}/auth`, {
        username: formData.get("username"),
        password: formData.get("password"),
      });
      const user = response.data?.userModel;
      const token = response.data?.response;
      const role = user ? loginRole(user) : "";

      if (!user || !token || !role) {
        throw new Error("Invalid login response");
      }

      sessionStorage.setItem("Authorization", token);
      sessionStorage.setItem("loginMethod", "PASSWORD");
      sessionStorage.setItem("userName", user.firstName || user.username || "");
      sessionStorage.setItem("schoolName", user.school ?? user.schoolName ?? "");
      sessionStorage.setItem("email", user.username || "");
      sessionStorage.setItem("role", role);
      routeByRole(role);
    } catch {
      setError("Sign-in failed. Check your email and password. New or inactive accounts require school administrator activation first.");
    } finally {
      setLoading(false);
    }
  };

  return <main className="mobile-login-app">
    <section className="mobile-login-card">
      <img src="/repsLogo.png" alt="REPS" className="mobile-login-logo" />
      <p className="mobile-login-eyebrow">REPS DISCIPLINE</p>
      <h1>Welcome back</h1>
      <p>Sign in to manage the moments that matter at your school.</p>
      <form className="mobile-login-form" onSubmit={handlePasswordLogin}>
        <label htmlFor="mobile-username">Username or email</label>
        <input id="mobile-username" name="username" type="text" autoComplete="username" required />
        <label htmlFor="mobile-password">Password</label>
        <input id="mobile-password" name="password" type="password" autoComplete="current-password" required />
        <button type="submit" className="mobile-login-submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <a href="/set-password">Have a school setup credential?</a>
        <a className="mobile-login-forgot" href="/forgot-password">Forgot password?</a>
        {error && <p className="mobile-login-error" role="alert">{error}</p>}
      </form>
      <div className="mobile-login-divider"><span>or continue with</span></div>
      <button type="button" className="mobile-login-google" onClick={() => { window.location.assign(`${baseUrl}/oauth2/authorization/google`); }}>
        <GoogleIcon aria-hidden="true" /> Sign in with Google
      </button>
    </section>
    <p className="mobile-login-footer">Secure school access · Google sign-in</p>
  </main>;
};

export default MobileLandingLogin;
