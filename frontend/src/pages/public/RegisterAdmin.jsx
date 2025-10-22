// src/pages/public/RegisterAdmin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth"; // expects backend to set role server-side or accept role
import { isValidEmail } from "../../utils/validators";

export default function RegisterAdmin() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState(""); const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault(); setErr(""); setSaving(true);
    try {
      if (!isValidEmail(form.email)) throw new Error("Use a valid email.");
      await register({ ...form, role: "admin" }); // backend should enforce who can create admins
      nav("/auth", { replace: true });
    } catch (e2) { setErr(e2.message || "Failed to register."); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-heading text-primary mb-4">Register — Admin</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Full name"
               value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="w-full border rounded px-3 py-2" placeholder="Email"
               value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password"
               value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button disabled={saving} className="px-4 py-2 rounded bg-accent text-primary-900">
          {saving ? "Creating…" : "Create Admin"}
        </button>
      </form>
    </div>
  );
}
