import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { Alert, Box, Button, Container, TextField } from "@mui/material";
import axios from "axios";
import { baseUrl } from "../utils/jsonData";
// Read and remove the bearer fragment once. Never store it in browser storage or send it in a URL.
export default function SetPassword() {
  const [credential, setCredential] = useState(() =>
    window.location.hash.slice(1),
  );
  useLayoutEffect(() => {
    if (window.location.hash)
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
  }, []);
  const [emailLink] = useState(() => !!credential);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (lock.current) return;
    if (password !== confirmation || password.length < 12) {
      setMessage(
        "Choose a password of at least 12 characters and enter it the same way twice.",
      );
      return;
    }
    lock.current = true;
    setBusy(true);
    setMessage("");
    try {
      await axios.post(`${baseUrl}/account-access/complete`, {
        username: emailLink ? undefined : username.trim(),
        credential,
        newPassword: password,
      });
      setCredential("");
      setPassword("");
      setConfirmation("");
      setComplete(true);
    } catch {
      setMessage(
        "Setup could not be confirmed. The credential may be expired, used, disabled or out of attempts. Try your new password at login before requesting another credential. Students can ask their teacher; staff can request a new setup email.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 3 }}>
        <h1>Set your REPS password</h1>
        {complete ? (
          <Alert severity="success">
            Password saved. <a href="/login">Sign in to REPS</a> with your
            school username and new password.
          </Alert>
        ) : (
          <>
            <p>
              {emailLink
                ? "This link works once and expires after 24 hours."
                : "Enter the REPS username and setup credential your school gave you. No personal email is required. The credential works once, expires after 15 minutes, and allows five guesses."}
            </p>
            <p>
              Choose a private passphrase of at least 12 characters. Do not
              share your password with staff or classmates.
            </p>
            {message && <Alert severity="error">{message}</Alert>}
            <form onSubmit={submit}>
              <fieldset disabled={busy}>
                {!emailLink && (
                  <>
                    <TextField
                      required
                      fullWidth
                      margin="normal"
                      label="REPS username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                    <TextField
                      required
                      fullWidth
                      margin="normal"
                      label="School setup credential"
                      value={credential}
                      onChange={(e) => setCredential(e.target.value)}
                      autoComplete="off"
                      inputProps={{
                        maxLength: 32,
                        autoCapitalize: "characters",
                        spellCheck: false,
                      }}
                    />
                  </>
                )}
                <TextField
                  required
                  fullWidth
                  margin="normal"
                  label="New password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  inputProps={{ minLength: 12, maxLength: 72 }}
                />
                <TextField
                  required
                  fullWidth
                  margin="normal"
                  label="Confirm new password"
                  type="password"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="new-password"
                />
                <Button type="submit" disabled={busy}>
                  Save password
                </Button>
              </fieldset>
            </form>
            <p>
              Have a private school Google account?{" "}
              <a href="/login">Use Google sign-in</a> with your registered
              school account. Disabled accounts still need administrator
              approval.
            </p>
          </>
        )}
      </Box>
    </Container>
  );
}
