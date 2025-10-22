// frontend/src/pages/SignOut.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";

export default function SignOut() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("Signing you out...");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Clear server session cookie
        await logout(); // POST /api/auth/logout (must clear cookie on server)
        setMsg("Signed out.");
      } catch (err) {
        // Even if network fails, hard-clear local hints to avoid loops
        setMsg(err?.friendlyMessage || "Signed out (local).");
      } finally {
        try {
          localStorage.removeItem("cl_auth");
          localStorage.removeItem("cl_user");
        } catch {}

        // Navigate to /auth; final hard reload guarantees clean state
        if (!alive) return;
        nav("/auth", { replace: true });
        // Optional: Uncomment for belt-and-braces cache bust
        // setTimeout(() => window.location.replace("/auth"), 50);
      }
    })();
    return () => { alive = false; };
  }, [nav]);

  return (
    <div className="grid place-items-center py-12">
      <div className="text-sm text-primary/70">{msg}</div>
    </div>
  );
}
