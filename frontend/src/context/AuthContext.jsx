import React, { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, role: 'student'|'tutor'|'admin' }

  const loginAs = (role = "student") => {
    setUser({ id: "demo", name: "Demo User", role });
  };
  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, loginAs, logout }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
