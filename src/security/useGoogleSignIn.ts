import { useEffect, useRef, useState } from "react";
import { baseUrl } from "../utils/jsonData";

/** One navigation per interaction, shared by desktop and mobile login. */
export function useGoogleSignIn() {
  const started = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // A browser Back navigation can restore the pending page from its cache.
    const reset = () => { started.current = false; setPending(false); setError(""); };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const signIn = () => {
    if (started.current) return;
    started.current = true; // Also blocks clicks before React flushes its state.
    setPending(true);
    setError("");
    try {
      window.location.assign(`${baseUrl}/oauth2/authorization/google`);
    } catch {
      started.current = false;
      setPending(false);
      setError("Google sign-in could not start. Please try again.");
    }
  };
  return { pending, error, signIn };
}
