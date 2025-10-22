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
        await logout(); 
        setMsg("Signed out.");
      } catch (err) {
        setMsg(err?.friendlyMessage || "Signed out (local).");
      } finally {
        try {
          localStorage.removeItem("cl_auth");
          localStorage.removeItem("cl_user");
        } catch {}

        if (!alive) return;
        nav("/auth", { replace: true });

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
