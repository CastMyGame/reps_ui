import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./dev-session-login.css";

type Role = "ADMIN" | "TEACHER" | "STUDENT" | "GUIDANCE";

const destinationForRole: Record<Role, string> = {
  ADMIN: "/m/admin",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
  GUIDANCE: "/dashboard/guidance",
};

/**
 * Local-development sign-in helper. It deliberately has no default credential
 * and is unreachable in a production build.
 */
const DevSessionLogin = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [error, setError] = useState("");

  if (process.env.NODE_ENV === "production") return <Navigate to="/login" replace />;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedToken = token.trim();
    const trimmedEmail = email.trim();

    if (!trimmedToken || !trimmedEmail) {
      setError("Enter a valid test token and email address.");
      return;
    }

    sessionStorage.setItem("Authorization", trimmedToken);
    sessionStorage.setItem("email", trimmedEmail);
    sessionStorage.setItem("role", role);
    sessionStorage.setItem("userName", name.trim() || trimmedEmail);
    sessionStorage.setItem("schoolName", schoolName.trim());
    navigate(destinationForRole[role], { replace: true });
  };

  return <main className="dev-session-page">
    <section className="dev-session-card">
      <p>REPS · Development only</p>
      <h1>Test session</h1>
      <div className="dev-session-warning">Use a short-lived development token only. Nothing is sent anywhere by this page.</div>
      <form onSubmit={submit}>
        <label htmlFor="dev-token">Test JWT</label>
        <textarea id="dev-token" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="off" spellCheck={false} rows={4} required />

        <label htmlFor="dev-email">Email</label>
        <input id="dev-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" required />

        <label htmlFor="dev-role">Role</label>
        <select id="dev-role" value={role} onChange={(event) => setRole(event.target.value as Role)}>
          <option value="ADMIN">Admin</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
          <option value="GUIDANCE">Guidance</option>
        </select>

        <label htmlFor="dev-name">Display name <span>(optional)</span></label>
        <input id="dev-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" />

        <label htmlFor="dev-school">School name <span>(optional)</span></label>
        <input id="dev-school" value={schoolName} onChange={(event) => setSchoolName(event.target.value)} autoComplete="off" />

        {error && <p className="dev-session-error" role="alert">{error}</p>}
        <button type="submit">Start test session</button>
      </form>
    </section>
  </main>;
};

export default DevSessionLogin;
