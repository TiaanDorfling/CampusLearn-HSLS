//frontend/src/routes/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import AppLayout from "../layouts/AppLayout.jsx";

import AuthGuard from "./guards/AuthGuard.jsx";
import RoleGuard from "./guards/RoleGuard.jsx";

import Home from "../pages/public/Home.jsx";
import Courses from "../pages/public/Courses.jsx";
import CourseInfo from "../pages/public/CourseInfo.jsx";
import Auth from "../pages/public/Auth.jsx";
import SignUp from "../auth/SignUp.jsx";

import RegisterAdmin from "../pages/public/RegisterAdmin.jsx";
import RegisterTutor from "../pages/public/RegisterTutor.jsx";

import CalendarHome from "../pages/calendar/CalendarHome.jsx";

// Role-specific HOME pages
import StudentHome from "../pages/student/Home.jsx";
import TutorHome   from "../pages/tutor/Home.jsx";
import AdminHome   from "../pages/admin/Home.jsx";

// Tutor-specific pages
import MaterialsLibrary from "../pages/tutor/MaterialsLibrary.jsx";

// Dashboards
import StudentDashboard from "../pages/student/StudentDashboard.jsx";
import TutorDashboard   from "../pages/tutor/TutorDashboard.jsx";
import AdminDashboard   from "../pages/admin/AdminDashboard.jsx";

// Messages Center
import MessagesCenter from "../pages/messages/MessagesCenter.jsx";

// Forum
import ForumHome from "../pages/forum/ForumHome.jsx";
import ThreadView from "../pages/forum/ThreadView.jsx";

import Profile from "../pages/Profile.jsx";
import Settings from "../pages/Settings.jsx";

import NotFound from "../pages/NotFound.jsx";
import SignOut from "../pages/SignOut.jsx";

/* ---------- Helpers ---------- */
function getLocalAuth() {
  try { 
    return JSON.parse(localStorage.getItem("cl_auth") || "null"); 
  } catch { 
    return null; 
  }
}

function PublicOnly({ children }) {
  const auth = getLocalAuth();
  if (auth?.user) return <Navigate to="/app" replace />;
  return children;
}

function PrivateIndex() {
  const auth = getLocalAuth();
  const role = String(auth?.user?.role || "").toLowerCase();
  if (role === "admin") return <Navigate to="admin" replace />;
  if (role === "tutor") return <Navigate to="tutor" replace />;
  return <Navigate to="student" replace />;
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
        {/* IMPORTANT: remove public admin/tutor registration routes for security */}
        {/* If you truly need public tutor signup for demo, re-add with server-side validation */}
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
        {/* Role-based index (goes to each role's HOME) */}
        <Route index element={<PrivateIndex />} />

        {/* Calendar (optional) */}
        <Route path="calendar" element={<CalendarHome />} />

        {/* Student area */}
        <Route element={<RoleGuard allow={["student"]} />}>
          <Route path="student" element={<StudentHome />} />
          <Route path="student/dashboard" element={<StudentDashboard />} />
        </Route>

        {/* Tutor area */}
        <Route element={<RoleGuard allow={["tutor","admin"]} />}>
          <Route path="tutor" element={<TutorHome />} />
          <Route path="tutor/dashboard" element={<TutorDashboard />} />
          <Route path="tutor/library" element={<MaterialsLibrary />} />
        </Route>

        {/* Admin area */}
        <Route element={<RoleGuard allow={["admin"]} />}>
          <Route path="admin" element={<AdminHome />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          {/* Admin-only creation pages */}
          <Route path="admin/register-admin" element={<RegisterAdmin />} />
          <Route path="admin/register-tutor" element={<RegisterTutor />} />
        </Route>

        {/* Messages (all roles) */}
        <Route path="messages" element={<MessagesCenter />} />

        {/* Forum (all roles) */}
        <Route path="forum" element={<ForumHome />} />
        <Route path="forum/:id" element={<ThreadView />} />

        {/* Profile & Settings (all roles) */}
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />

        {/* Sign out */}
        <Route path="signout" element={<SignOut />} />

        {/* Friendly aliases inside /app */}
        <Route path="home" element={<PrivateIndex />} />
        <Route path="dashboard" element={<PrivateIndex />} />

        {/* Any other /app path -> role landing */}
        <Route path="*" element={<PrivateIndex />} />
      </Route>

      {/* Top-level aliases */}
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="/home" element={<Navigate to="/app" replace />} />

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
