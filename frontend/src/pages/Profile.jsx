import React, { useMemo } from "react";

function getLocalUser() {
  try { return JSON.parse(localStorage.getItem("cl_user") || "null"); } catch { return null; }
}

export default function Profile() {
  const user = useMemo(getLocalUser, []);

  return (
    <div className="space-y-6">
      {/* HERO (same style as Home; v4-safe arbitrary linear gradient) */}
      <section
        className="
          rounded-2xl p-6 md:p-8
          bg-white border border-primary/10 shadow-sm
          bg-[linear-gradient(90deg,rgba(185,174,229,0.6),rgba(255,243,224,0.7),white)]
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading text-primary">Your Profile</h1>
            <p className="text-primary/70 mt-1">Manage your personal information (placeholder).</p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold">Profile information</h3>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <Field label="Name" value={user?.name || "—"} />
            <Field label="Email" value={user?.email || "—"} />
            <Field label="Role" value={String(user?.role || "—")} />
            <Field label="Student No." value="—" />
          </div>
          <div className="mt-6">
            <button className="px-3 py-1.5 rounded-lg border bg-white shadow-sm hover:bg-cream">Edit (placeholder)</button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold">Avatar</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-lavender/60" />
            <div className="text-sm text-primary/70">Upload/change avatar (placeholder)</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-primary/60">{label}</div>
      <div className="mt-1 rounded-lg border bg-white px-3 py-2 text-primary/90">{value}</div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}
