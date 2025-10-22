import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../logo.svg"; // ⬅️ import the logo URL

export default function PublicLayout() {
  const { pathname } = useLocation();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-cream/50 text-primary-900">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => nav("/")}
            className="flex items-center gap-3"
            aria-label="CampusLearn Home"
          >
            <img
              src={logo}
              alt="CampusLearn logo"
              className="h-7 w-7"
              loading="eager"
              decoding="async"
            />
            <span className="text-xl font-heading text-primary tracking-wide">
              CampusLearn
            </span>
          </button>

          <nav className="hidden md:flex gap-6 font-sans items-center">
            <HeaderLink to="/" active={pathname === "/"}>
              Home
            </HeaderLink>
            <HeaderLink to="/courses" active={pathname.startsWith("/courses")}>
              Courses
            </HeaderLink>
            <HeaderLink to="/auth" active={pathname === "/auth"}>
              Sign in
            </HeaderLink>
            <Link
              to="/auth"
              className="px-3 py-1.5 rounded-lg font-button bg-accent text-primary-900 hover:shadow"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-primary/10 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-lg font-heading text-primary">CampusLearn</div>
            <p className="mt-1 text-sm">
              Peer-to-peer tutoring, resources, and quick feedback.
            </p>
          </div>
          <div className="text-sm space-y-1">
            <div className="font-heading text-primary">Explore</div>
            <div><Link className="underline" to="/courses">Courses</Link></div>
            <div><Link className="underline" to="/auth">Sign in</Link></div>
          </div>
          <div className="text-sm">
            <div className="font-heading text-primary">Contact</div>
            <p className="mt-1">support@campuslearn.local</p>
          </div>
        </div>
        <div className="border-t border-primary/10 py-4 text-center text-xs">
          © {new Date().getFullYear()} CampusLearn™
        </div>
      </footer>
    </div>
  );
}

function HeaderLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`hover:underline ${active ? "text-primary font-semibold" : "text-primary-900"}`}
    >
      {children}
    </Link>
  );
}
