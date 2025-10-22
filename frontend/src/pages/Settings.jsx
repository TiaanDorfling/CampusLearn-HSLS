import React from "react";
import { useEffect, useState } from "react";

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
  const isDarkModeToggle = label.toLowerCase().includes("dark");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (isDarkModeToggle) {
      const theme = localStorage.getItem("theme");
      setEnabled(theme === "dark");
    }
  }, [isDarkModeToggle]);

  const handleToggle = () => {
    if (!isDarkModeToggle) return; // only dark mode is functional for now

    const newTheme = enabled ? "light" : "dark";
    setEnabled(!enabled);
    localStorage.setItem("theme", newTheme);

    // Apply the theme immediately
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <label
      className="flex items-center justify-between gap-4 rounded-lg border bg-white dark:bg-campus-cream-dark px-3 py-2 transition"
    >
      <span className="text-primary/90 dark:text-campus-lavender">{label}</span>

      <button
        type="button"
        onClick={handleToggle}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
          enabled ? "bg-campus-purple" : "bg-cream"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
            enabled ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>
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
