// frontend/src/api/auth.js
import api from "./axios";

/** POST /auth/login */
export async function login({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  // Optional: minimal local hint for guards while session cookie is set server-side
  try {
    localStorage.setItem("cl_auth", JSON.stringify({ email }));
  } catch {}
  return res.data; // e.g. { message, user }
}

/** POST /auth/register */
export async function register({ name, email, password, role = "student" }) {
  const res = await api.post("/auth/register", { name, email, password, role });
  return res.data; // e.g. { message, user }
}

/** GET /auth/session */
export async function getSession() {
  const res = await api.get("/auth/session");
  return res.data; // e.g. { user } or { active: true/false }
}

/** POST /auth/logout */
export async function logout() {
  const res = await api.post("/auth/logout");
  try { localStorage.removeItem("cl_auth"); localStorage.removeItem("cl_user"); } catch {}
  return res.data;
}

