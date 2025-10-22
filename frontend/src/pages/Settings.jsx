import React from "react";

export default function Settings() {
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
            <h1 className="text-2xl md:text-3xl font-heading text-primary">Settings</h1>
            <p className="text-primary/70 mt-1">Configure your account and app preferences (placeholder).</p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold">Account</h3>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <Toggle label="Two-factor authentication" />
            <Toggle label="Email notifications" />
            <Toggle label="SMS notifications" />
            <Toggle label="Dark mode" />
          </div>
          <div className="mt-6">
            <button className="px-3 py-1.5 rounded-lg border bg-white shadow-sm hover:bg-cream">Save (placeholder)</button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold">Privacy</h3>
          <div className="mt-4 space-y-3 text-sm">
            <PlaceholderRow label="Show profile to classmates" />
            <PlaceholderRow label="Share course progress with tutors" />
            <PlaceholderRow label="Allow message requests" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ label }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border bg-white px-3 py-2">
      <span className="text-primary/90">{label}</span>
      {/* Non-functional placeholder switch */}
      <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-cream">
        <span className="inline-block h-4 w-4 transform rounded-full bg-lavender translate-x-1" />
      </span>
    </label>
  );
}

function PlaceholderRow({ label }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2">
      <span className="text-primary/90">{label}</span>
      <span className="text-primary/50">placeholder</span>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}
