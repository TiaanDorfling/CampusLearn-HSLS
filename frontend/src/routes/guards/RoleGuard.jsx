import { Navigate, Outlet } from "react-router-dom";

function getAuth() {
  try {
    const raw = localStorage.getItem("cl_auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function roleHome(roleRaw) {
  const role = String(roleRaw || "").toLowerCase();
  if (role === "admin") return "/app/admin";
  if (role === "tutor") return "/app/tutor";
  return "/app/student"; 
}

export default function RoleGuard({ allow = [] }) {
  const auth = getAuth();
  const role = String(auth?.user?.role || "").toLowerCase();

  if (!auth?.user) return <Navigate to="/auth" replace />;

  if (allow.length && !allow.map(r => String(r).toLowerCase()).includes(role)) {
    return <Navigate to={roleHome(role)} replace />;
  }

  return <Outlet />;
}
