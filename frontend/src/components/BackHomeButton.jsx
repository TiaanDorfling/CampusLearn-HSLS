import React from "react";
import { useNavigate } from "react-router-dom";

function getLocalUser() {
  try { return JSON.parse(localStorage.getItem("cl_user") || "null"); } catch { return null; }
}

export default function BackHomeButton({ className = "" }) {
  const nav = useNavigate();
  const user = getLocalUser();
  const role = String(user?.role || "").toLowerCase();

  function go() {
    if (role === "admin") return nav("/app/admin");
    if (role === "tutor") return nav("/app/tutor");
    return nav("/app/student"); // default
  }

  return (
    <button
      onClick={go}
      className={`px-3 py-1 rounded border hover:bg-cream ${className}`}
      title="Back to Home"
    >
      ← Back to Home
    </button>
  );
}
