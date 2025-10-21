import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../logo.svg";
import MessagesDrawer from "../components/messages/MessagesDrawer.jsx";

function getLocalUser() {
  try { return JSON.parse(localStorage.getItem("cl_user") || "null"); } catch { return null; }
}

export default function AppLayout() {
  const nav = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useMemo(getLocalUser, []);
  const role = String(user?.role || "").toLowerCase();

  function goSignOut() {
    nav("signout", { replace: true }); // /app/signout
  }

  // Sidebar items depend on role:
  const links = [
    { to: "messages", label: "Messages", show: true },
    { to: "forum", label: "Forum", show: true },
    // Home (role landing)
    { to: "student", label: "Home", show: role === "student" },
    { to: "tutor",   label: "Home", show: role === "tutor" },
    { to: "admin",   label: "Home", show: role === "admin" },

    // Dashboards available via explicit button (still linkable here but not shown unless you prefer)
    { to: "student/dashboard", label: "Dashboard", show: false && role === "student" },
    { to: "tutor/dashboard",   label: "Dashboard", show: false && role === "tutor" },
    { to: "admin/dashboard",   label: "Dashboard", show: false && role === "admin" },

    // Keep calendar if you use it
    { to: "calendar", label: "Calendar", show: false },
  ].filter(i => i.show);

  return (
    <div className="min-h-screen grid grid-rows-[auto,1fr] bg-cream">
      <header className="bg-white border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => nav("/app")} className="flex items-center gap-3" aria-label="Home">
            <img src={logo} alt="CampusLearn logo" className="h-8 w-8" />
            <span className="text-xl font-heading text-primary">CampusLearn</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="px-3 py-1 rounded font-button border border-primary-800 text-primary-800 hover:bg-cream"
              title="Show new messages"
            >
              New messages
            </button>
            <span className="text-sm font-sans text-primary-900">
              {user?.name ? `Signed in as ${user.name}` : "Signed in"}
            </span>
            <button
              onClick={goSignOut}
              className="px-3 py-1 rounded font-button border border-primary-800 text-primary-800 hover:bg-cream"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[220px,1fr] gap-0">
        <aside className="bg-white border-r border-primary/10">
          <nav className="p-4 flex flex-col gap-2">
            {links.map(l => (
              <AppLink key={l.to} to={l.to}>{l.label}</AppLink>
            ))}
          </nav>
        </aside>

        <main className="p-6">
          <Outlet />
        </main>
      </div>

      <MessagesDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

function AppLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded font-sans ${
          isActive ? "bg-lavender text-primary-900" : "text-primary-900 hover:bg-cream"
        }`
      }
      end
    >
      {children}
    </NavLink>
  );
}
