// frontend/src/routes/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ChatbotPage from '../pages/chatbot/ChatbotPage';

import PublicLayout from "../layouts/PublicLayout.jsx";
import AppLayout from "../layouts/AppLayout.jsx";

import AuthGuard from "./guards/AuthGuard.jsx";
import RoleGuard from "./guards/RoleGuard.jsx";

import Home from "../pages/public/Home.jsx";
import Courses from "../pages/public/Courses.jsx";
import CourseInfo from "../pages/public/CourseInfo.jsx";
import Auth from "../pages/public/Auth.jsx";
import SignUp from "../auth/SignUp.jsx";

import CalendarHome from "../pages/calendar/CalendarHome.jsx";

// Make sure these files exist with these exact names:
import StudentDashboard from "../pages/student/StudentDashboard.jsx";
import TutorDashboard   from "../pages/tutor/TutorDashboard.jsx";
import AdminDashboard   from "../pages/admin/AdminDashboard.jsx";

import NotFound from "../pages/NotFound.jsx";
import SignOut from "../pages/SignOut.jsx";

/* ---------- Helpers ---------- */
function getLocalUser() {
  try { return JSON.parse(localStorage.getItem("cl_user") || "null"); } catch { return null; }
}

function PublicOnly({ children }) {
  let authed = false;
  try {
    const u = getLocalUser();
    const a = JSON.parse(localStorage.getItem("cl_auth") || "null");
    authed = !!(u || a?.email || a?.user);
  } catch { /* ignore */ }
  return authed ? <Navigate to="/app" replace /> : children;
}

/** Role-based landing under /app */
function PrivateIndex() {
  const u = getLocalUser();
  const role = String(u?.role || "").toLowerCase();
  if (role === "admin") return <Navigate to="admin" replace />;
  if (role === "tutor") return <Navigate to="tutor" replace />;
  return <Navigate to="student" replace />; // default
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- Public Area ---------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseInfo />} />
        <Route path="/auth" element={<PublicOnly><Auth /></PublicOnly>} />
        <Route path="/auth/register" element={<PublicOnly><SignUp /></PublicOnly>} />
      </Route>

      {/* ---------- Private Area (/app/*) ---------- */}
      <Route
        path="/app"
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        {/* Role-based index */}
        <Route index element={<PrivateIndex />} />

        {/* Keep calendar if needed */}
        <Route path="calendar" element={<CalendarHome />} />

        {/* Dashboards (role guarded) */}
        <Route element={<RoleGuard allow={["student"]} />}>
          <Route path="student" element={<StudentDashboard />} />
        </Route>

        <Route element={<RoleGuard allow={["tutor"]} />}>
          <Route path="tutor" element={<TutorDashboard />} />
        </Route>

        <Route element={<RoleGuard allow={["admin"]} />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>

        {/* Common aliases so links like "/app/dashboard" or "/dashboard" don't 404 */}
        <Route path="dashboard" element={<PrivateIndex />} />
        <Route path="home" element={<PrivateIndex />} />

        {/* Sign out */}
        <Route path="signout" element={<SignOut />} />

        {/* anything else under /app -> role landing */}
        <Route path="*" element={<PrivateIndex />} />
      </Route>

      {/* Top-level aliases that people often bookmark/use */}
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="/home" element={<Navigate to="/app" replace />} />

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
