import React, { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import logo from "../logo.svg";

function getLocalUser() {
  try { return JSON.parse(localStorage.getItem("cl_user") || "null"); } catch { return null; }
}
function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase() || "")
    .join("");
}

export default function AppLayout() {
  const nav = useNavigate();
  const user = useMemo(getLocalUser, []);
  const role = String(user?.role || "").toLowerCase();

  function goSignOut() {
    nav("signout", { replace: true }); // /app/signout
  }

  return (
    <div className="min-h-screen bg-cream relative">
      {/* Decorative side accents */}
      <div aria-hidden className="pointer-events-none fixed inset-y-0 left-0 -z-10 w-40 md:w-56 lg:w-64">
        <div className="h-full w-full bg-gradient-to-b from-lavender/25 via-cream/10 to-transparent blur-2xl" />
      </div>
      <div aria-hidden className="pointer-events-none fixed inset-y-0 right-0 -z-10 w-40 md:w-56 lg:w-64">
        <div className="h-full w-full bg-gradient-to-t from-lavender/25 via-cream/10 to-transparent blur-2xl" />
      </div>

      {/* Optional top tint for depth */}
      <div aria-hidden className="pointer-events-none fixed -z-10 inset-x-0 top-0 h-40 bg-gradient-to-b from-white/60 to-transparent" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button onClick={() => nav("/app")} className="flex items-center gap-3" aria-label="Home">
            <img src={logo} alt="CampusLearn logo" className="h-8 w-8" />
            <span className="text-xl font-heading text-primary">CampusLearn</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-primary/10 bg-white">
              <div className="h-8 w-8 rounded-full bg-lavender/60 flex items-center justify-center text-primary font-semibold">
                {initials(user?.name) || "U"}
              </div>
              <div className="leading-tight">
                <div className="text-sm text-primary-900 font-medium">
                  {user?.name || "Signed in"}
                </div>
                <div className="text-[11px] text-primary/70 capitalize">
                  {role || "user"}
                </div>
              </div>
            </div>

            <button
              onClick={goSignOut}
              className="px-3 py-1.5 rounded-xl font-button border border-primary/20 text-primary-900 hover:bg-cream"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="h-[3px] bg-gradient-to-r from-lavender via-cream to-white" />
      </header>

      {/* Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="rounded-2xl border border-primary/10 bg-white/90 backdrop-blur-[1px] shadow-sm p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
