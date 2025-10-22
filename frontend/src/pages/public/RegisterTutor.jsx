// src/pages/public/RegisterTutor.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth";
import { isValidEmail, isCampusEmail } from "../../utils/validators";

export default function RegisterTutor() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", modules: "" });
  const [err, setErr] = useState(""); const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault(); setErr(""); setSaving(true);
    try {
      if (!isValidEmail(form.email)) throw new Error("Use a valid email.");
      if (!isCampusEmail(form.email)) throw new Error("Use your @belgiumcampus.ac.za email.");
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "tutor",
        modules: form.modules.split(",").map(s=>s.trim()).filter(Boolean)
      });
      nav("/auth", { replace: true });
    } catch (e2) { setErr(e2.message || "Failed to register."); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-heading text-primary mb-4">Register — Tutor</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Full name"
               value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="w-full border rounded px-3 py-2" placeholder="@belgiumcampus.ac.za email"
               value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password"
               value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <input className="w-full border rounded px-3 py-2" placeholder="Modules (comma-separated, e.g. SEN381,PRG381)"
               value={form.modules} onChange={e=>setForm({...form, modules:e.target.value})}/>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button disabled={saving} className="px-4 py-2 rounded bg-accent text-primary-900">
          {saving ? "Creating…" : "Create Tutor"}
        </button>
      </form>
    </div>
  );
}
