import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
} from "@mui/material";
import { api } from "../utils/api/http";
import {
  accountError,
  invitationStateLabel,
} from "../utils/accountAdministration";
export default function StudentAccess() {
  const [username, setUsername] = useState("");
  const [verified, setVerified] = useState(false);
  const [privateEmail, setPrivateEmail] = useState(false);
  const [handoff, setHandoff] = useState<{
    username: string;
    credential: string;
    expiresAt: string;
    maximumAttempts: number;
  } | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const authorized =
    ["ADMIN", "TEACHER"].includes(sessionStorage.getItem("role") || "") &&
    !!sessionStorage.getItem("Authorization");
  async function request(email: boolean) {
    if (
      !authorized ||
      !verified ||
      !username.trim() ||
      (email && !privateEmail) ||
      lock.current
    )
      return;
    if (
      !window.confirm(
        "Confirm you verified this student’s identity. Reissuing school access replaces older setup credentials and requires password setup before assignment access.",
      )
    )
      return;
    lock.current = true;
    setBusy(true);
    setHandoff(null);
    setError("");
    setStatus("");
    const path = `/accounts/v1/students/${encodeURIComponent(username.trim())}`;
    try {
      const response = await api.post(
        `${path}/${email ? "invitation" : "setup"}`,
        { identityVerified: verified, privateEmailAllowed: privateEmail },
      );
      if (!email) setHandoff(response.data);
      else {
        const result = await api.get(`${path}/access`);
        setStatus(result.data.invitationStatus);
      }
    } catch (failure) {
      setError(accountError(failure));
    } finally {
      lock.current = false;
      setBusy(false);
      setVerified(false);
    }
  }
  if (!authorized)
    return (
      <Alert severity="warning">
        Sign in as an authorized teacher or school administrator.
      </Alert>
    );
  return (
    <Container maxWidth="sm">
      <h1>Student first login and recovery</h1>
      <p>
        Use this for new students and students who forgot their password. Only
        your authorized school/student relationships are available. Existing
        passwords are never shown.
      </p>
      <p>
        Verify the student in person using your school’s identity-check
        procedure. Give the credential privately to that student, then let them
        choose their password privately. Do not put it in disciplinary emails,
        class chats or shared documents.
      </p>
      <fieldset disabled={busy}>
        <TextField
          fullWidth
          label="Student REPS username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setHandoff(null);
            setVerified(false);
            setPrivateEmail(false);
            setStatus("");
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={verified}
              onChange={(_, value) => setVerified(value)}
            />
          }
          label="I verified this student's identity"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={privateEmail}
              onChange={(_, value) => setPrivateEmail(value)}
            />
          }
          label="I also verified that this student independently controls their registered mailbox"
        />
        <Button
          disabled={busy || !verified || !username.trim()}
          onClick={() => void request(false)}
        >
          Issue school setup credential
        </Button>
        <Button
          disabled={busy || !verified || !privateEmail || !username.trim()}
          onClick={() => void request(true)}
        >
          Email setup link
        </Button>
      </fieldset>
      {error && <Alert severity="error">{error}</Alert>}
      {status && (
        <Alert severity={status === "SENT" ? "info" : "warning"}>
          Invitation status: {invitationStateLabel(status)}. Sent means accepted
          for sending, not confirmed delivery. If unconfirmed, check the mailbox
          before reissuing. Wait at least one minute between email requests.
        </Alert>
      )}
      {handoff && (
        <section aria-label="Private student handoff">
          <h2>Give privately to {handoff.username}</h2>
          <p>
            Setup credential: <strong>{handoff.credential}</strong>
          </p>
          <p>
            Expires: {new Date(handoff.expiresAt).toLocaleString()}. Maximum
            guesses: {handoff.maximumAttempts}.
          </p>
          <p>
            Open <a href="/set-password">Set password</a> on the student’s
            device. Sign out of any staff session before handing over a shared
            device. This credential grants no assignment access.
          </p>
          <Button onClick={() => setHandoff(null)}>Hide credential</Button>
        </section>
      )}
      <p>
        <a href="/login">Return to REPS login</a>
      </p>
    </Container>
  );
}
