import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";

const CAMPUS_EMAIL_RE = /^[a-z0-9._%+-]+@student\.belgiumcampus\.ac\.za$/i;

export default function SignUp() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [validity, setValidity] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Run validation checks and update the state
    setValidity({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),//atleast one uppercase
      number: /\d/.test(newPassword),//atleast one number
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(newPassword),//atleast one special char
    });
  };

  //  Helper variable to check if all rules are met
  const allRequirementsMet = Object.values(validity).every(Boolean);

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setOk("");
    if (!CAMPUS_EMAIL_RE.test(email)) {
      setError("Please use your campus student email (@student.belgiumcampus.ac.za).");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (!allRequirementsMet) {
      setError("Please ensure your password meets all requirements.");
      return;
    }
    
    setBusy(true);
    try {
      const data = await register({ name, email, password, role: "student" });
      setOk(data?.message || "Registered successfully!");
      // After successful register, send them to sign-in
      setTimeout(() => nav("/auth", { replace: true }), 800);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Registration failed.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-md mx-auto p-6 mt-12 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-heading mb-1">Create your account</h1>
      <p className="text-sm text-primary/70 mb-6">
        Already have an account? <Link to="/auth" className="underline">Sign in</Link>.
      </p>

      {error ? (
        <div className="mb-4 rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {ok ? (
        <div className="mb-4 rounded bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {ok}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium">Full name</span>
          <input
            type="text"
            className="mt-1 w-full rounded border border-primary/20 px-3 py-2 bg-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            required
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium">Campus email</span>
          <input
            type="email"
            className="mt-1 w-full rounded border border-primary/20 px-3 py-2 bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@student.belgiumcampus.ac.za"
            required
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium">Password</span>
          <input
            type="password"
            className="mt-1 w-full rounded border border-primary/20 px-3 py-2 bg-white"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </label>

      <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm space-y-1">
                <p id="length" className={validity.length ? 'valid' : 'invalid'}>
                  At least 8 characters
                </p>
                <p id="uppercase" className={validity.uppercase ? 'valid' : 'invalid'}>
                  At least one uppercase letter
                </p>
                <p id="number" className={validity.number ? 'valid' : 'invalid'}>
                  At least one number
                </p>
                <p id="special" className={validity.special ? 'valid' : 'invalid'}>
                  At least one special character
                </p>
        </div>
    
        <label className="block">
          <span className="block text-sm font-medium">Confirm Password</span>
          <input
            type="password"
            className="mt-1 w-full rounded border border-primary/20 px-3 py-2 bg-white"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
      </label>

        <button
          disabled={busy}
          className="w-full px-4 py-2 rounded font-button bg-accent text-primary-900 disabled:opacity-60"
        >
          {busy ? "Creating account..." : "Register"}
        </button>
      </form>
    </section>
  );
}
