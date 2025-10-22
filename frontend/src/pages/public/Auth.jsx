import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, getSession } from "../../api/auth";

function roleHome(roleRaw) {
  const role = String(roleRaw || "").toLowerCase();
  if (role === "admin") return "/app/admin";
  if (role === "tutor") return "/app/tutor";
  return "/app/student";
}


function pickNext(from, role) {
  const bad = new Set(["/app", "/app/", "/app/home", "/app/dashboard", "/app/calendar", "/auth", "/"]);
  if (from && !bad.has(from)) return from;
  return roleHome(role);
}

export default function Auth() {
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await getSession();
        if (!alive) return;

        if (s?.active && s?.user) {
          localStorage.setItem("cl_auth", JSON.stringify({ user: s.user, token: "cookie" }));
          localStorage.setItem("cl_user", JSON.stringify(s.user));

          const from = loc.state?.from?.pathname;
          const next = pickNext(from, s.user.role);
          nav(next, { replace: true });
        }
      } catch {
      }
    })();
    return () => { alive = false; };
  }, [loc.state, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!email || !password) throw new Error("Please enter your email and password.");

      const data = await login({ email, password });
      localStorage.setItem("cl_auth", JSON.stringify({ user: data.user, token: "cookie" }));
      localStorage.setItem("cl_user", JSON.stringify(data.user));

      const from = loc.state?.from?.pathname;
      const next = pickNext(from, data.user.role);
      nav(next, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please check your email/password.";
      setError(
        /Invalid credentials/i.test(msg)
          ? "We couldn't sign you in. Double-check your email/password, or register if you’re new."
          : msg
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-md mx-auto p-6 mt-12 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-heading mb-1">Sign in</h1>
      <p className="text-sm text-primary/70 mb-6">
        Use your registered email and password. New here?{" "}
        <Link to="/auth/register" className="underline">Create an account</Link>.
      </p>

      {error ? (
        <div className="mb-4 rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium">Email</span>
          <input
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded border border-primary/20 px-3 py-2 bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-primary/20 px-3 py-2 bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>

        <button
          disabled={busy}
          className="w-full px-4 py-2 rounded font-button bg-accent text-primary-900 disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-xs text-primary/70">
        Trouble signing in? Try resetting your password with an admin.
      </p>
    </section>
  );
}
