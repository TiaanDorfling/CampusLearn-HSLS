// frontend/src/pages/admin/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

// Photos (from your assets folder)
import campusImg from "../../assets/campus.jpg";
import heroImg from "../../assets/hero.jpg";
import it1 from "../../assets/it1.jpg";
import it3 from "../../assets/it3.jpg";
import it5 from "../../assets/it5.jpg";

import {
  MessageSquare,
  Bell,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function AdminHome() {
  const nav = useNavigate();

  // --- static demo content (student admin-focused) ---
  const kpis = [
    { label: "Active Students", value: "1,284", icon: Users, color: "bg-primary", change: "+12%" },
    { label: "Active Tutors", value: "42", icon: GraduationCap, color: "bg-lavender", change: "+3%" },
    { label: "Courses Running", value: "36", icon: BookOpen, color: "bg-accent", change: "+5%" },
    { label: "Avg. Response (Msgs)", value: "1h 12m", icon: Clock, color: "bg-redbrown", change: "—" },
  ];

  const activity = [
    { time: "09:05", what: "New post in Software Engineering forum", who: "Student · L. Mthembu" },
    { time: "10:22", what: "Three new enrollment requests received", who: "System" },
    { time: "11:10", what: "Support ticket #4133 marked as resolved", who: "Support · T. Jones" },
    { time: "11:45", what: "Notice sent to BIT third-years", who: "Admin · You" },
  ];

  const glance = [
    { title: "Pending Enrollments", value: "5", caption: "Awaiting review" },
    { title: "Course Approvals", value: "3", caption: "In the queue" },
    { title: "Support Tickets", value: "4", caption: "Open" },
    { title: "Flagged Posts", value: "2", caption: "Needs moderation" },
  ];

  const enrollQueue = [
    { name: "Thandi Nkosi", programme: "BIT (FT)", status: "Docs outstanding" },
    { name: "Alex Mahlangu", programme: "BComp (SE)", status: "Payment review" },
    { name: "Priya Naidoo", programme: "Diploma (IT)", status: "Ready to confirm" },
    { name: "K. van Wyk", programme: "BIT (PT)", status: "Awaiting ID copy" },
    { name: "Mpho Dlamini", programme: "BComp (DS)", status: "Docs outstanding" },
  ];

  const todayTasks = [
    { title: "Verify proof of registration (BIT PT batch)", owner: "You", due: "Today" },
    { title: "Approve 3 course outlines (2025 intake)", owner: "Curriculum", due: "Today" },
    { title: "Publish library access update", owner: "Admin Team", due: "Today" },
    { title: "Escalate 2 unresolved tickets", owner: "Support", due: "Today" },
  ];

  const quickLinks = [
    { title: "Course Manager", href: "/app/admin/courses" },
    { title: "Users & Roles", href: "/app/admin" },
    { title: "Messages", href: "/app/messages" },
    { title: "Forum Moderation", href: "/app/forum" },
  ];

  const alertsCount = todayTasks.length;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header — same style language as Admin Dashboard */}
      <div className="bg-primary border-b-4 border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-cream">Admin Home</h1>
              <p className="text-beige mt-1">Overview of student activity, operations and platform health</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => nav("/app/messages")}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-primary-900 rounded-lg hover:bg-accent/90 transition font-button font-medium shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
              </button>
              <button
                onClick={() => nav("/app/admin/dashboard")}
                className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-cream rounded-lg hover:bg-primary-900 transition font-button font-medium shadow-lg"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Alerts</span>
                <span className="bg-redbrown text-cream text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {alertsCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions row — same bar used across */}
      <div className="bg-white border-b-2 border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2">
            <QuickAction onClick={() => nav("/app/admin/dashboard")} label="Open Dashboard" />
            <QuickAction onClick={() => nav("/app/admin/courses")} label="Course Manager" />
            <QuickAction onClick={() => nav("/app/messages")} label="Messages" />
            <QuickAction onClick={() => nav("/app/forum")} label="Forum" />
            <QuickAction onClick={() => nav("/app/settings")} label="Settings" />
          </div>
        </div>
      </div>

      {/* Body content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((k, idx) => (
            <StatCard
              key={idx}
              icon={k.icon}
              color={k.color}
              label={k.label}
              value={k.value}
              change={k.change}
            />
          ))}
        </div>

        {/* Top grid: activity + tasks + campus photos */}
        <div className="grid xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <Card>
              <Header title="Live activity" right={<span className="text-xs font-button text-primary-800/70">Today</span>} />
              <ul className="mt-3 divide-y divide-primary/10">
                {activity.map((a, i) => (
                  <li key={i} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-heading text-primary">{a.what}</div>
                      <div className="text-xs text-primary-800/70 font-sans">{a.who}</div>
                    </div>
                    <div className="text-xs text-primary-800/70 font-sans">{a.time}</div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <Header
                title="Today’s tasks"
                right={
                  <button
                    className="text-sm font-button text-accent hover:underline"
                    onClick={() => nav("/app/admin/dashboard")}
                  >
                    Open Dashboard
                  </button>
                }
              />
              <ul className="mt-3 space-y-2">
                {todayTasks.map((t, i) => (
                  <li
                    key={i}
                    className="rounded-xl border-2 border-primary/10 bg-white p-3 flex items-center justify-between hover:bg-lavender/10 transition"
                  >
                    <div>
                      <div className="font-heading text-primary">{t.title}</div>
                      <div className="text-xs text-primary-800/70 font-sans">
                        Owner: {t.owner} • Due: {t.due}
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream/60 border border-primary/10">
                      Priority
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Right column: campus photos + quick links */}
          <div className="space-y-8">
            <Card className="overflow-hidden">
              <h3 className="text-lg font-heading font-bold text-primary">Campus highlights</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <ImageTile src={campusImg} alt="Campus" />
                <ImageTile src={heroImg} alt="Atrium" />
                <ImageTile src={it3} alt="Lecture hall" />
                <ImageTile src={it1} alt="Student project" />
                <ImageTile src={it5} alt="Workshop" />
                <ImageTile src={it3} alt="Lab" />
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-heading font-bold text-primary">Quick links</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {quickLinks.map((l, i) => (
                  <li key={i}>
                    <button
                      onClick={() => nav(l.href)}
                      className="w-full text-left rounded-lg border-2 border-primary/10 p-3 bg-white hover:bg-cream/60 transition font-button"
                    >
                      {l.title}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Middle grid: Enrollment Queue + At a Glance + System Health */}
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <Header
              title="Enrollment queue"
              right={
                <button
                  className="text-sm font-button text-accent hover:underline"
                  onClick={() => nav("/app/admin/courses")}
                >
                  Go to Course Manager
                </button>
              }
            />
            <div className="mt-3 rounded-xl border-2 border-primary/10 overflow-hidden bg-white">
              <table className="table-auto w-full text-sm font-sans">
                <thead className="bg-lavender/20">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-heading font-semibold text-primary">Student</th>
                    <th className="px-4 py-3 font-heading font-semibold text-primary">Programme</th>
                    <th className="px-4 py-3 font-heading font-semibold text-primary">Status</th>
                    <th className="px-4 py-3 font-heading font-semibold text-primary">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {enrollQueue.map((e, i) => (
                    <tr key={i} className="hover:bg-lavender/5 transition">
                      <td className="px-4 py-3 text-primary-800">{e.name}</td>
                      <td className="px-4 py-3 text-primary-800">{e.programme}</td>
                      <td className="px-4 py-3 text-primary-800">
                        <StatusPill text={e.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <TinyBtn onClick={() => {}} tone="accent">Review</TinyBtn>
                          <TinyBtn onClick={() => {}} tone="primary">Message</TinyBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-8">
            <Card>
              <Header
                title="At a glance"
                right={
                  <button
                    className="text-sm font-button text-accent hover:underline"
                    onClick={() => nav("/app/admin/dashboard")}
                  >
                    Dashboard
                  </button>
                }
              />
              <div className="mt-3 grid sm:grid-cols-2 gap-4">
                {glance.map((g, i) => (
                  <Glance key={i} title={g.title} value={g.value} caption={g.caption} />
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-heading font-bold text-primary">System health</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <HealthRow k="DB connection" v={<Healthy text="OK" />} />
                <HealthRow k="API latency (p95)" v={<Warn text="142 ms" />} />
                <HealthRow k="Uptime (24h)" v={<Healthy text="99.97%" />} />
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* === Reusable UI blocks (shared visual language with Admin Dashboard) === */
function Header({ title, right }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-heading font-bold text-primary">{title}</h3>
      {right}
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value, change }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 hover:border-primary/30 transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg shadow-md`}>
          <Icon className="w-6 h-6 text-cream" />
        </div>
        <span
          className={`text-xs font-button font-bold px-2 py-1 rounded-full ${
            String(change).startsWith("+") || change === "—"
              ? "bg-accent/20 text-accent"
              : "bg-redbrown/20 text-redbrown"
          }`}
        >
          {change}
        </span>
      </div>
      <p className="text-primary-800 text-sm font-medium font-sans">{label}</p>
      <p className="text-3xl font-heading font-bold text-primary mt-1">{value}</p>
    </div>
  );
}

function QuickAction({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-md border-2 border-primary/20 bg-white text-primary font-button hover:bg-lavender/20 transition shadow-sm"
    >
      {label}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 ${className}`}>
      {children}
    </div>
  );
}

function Glance({ title, value, caption }) {
  return (
    <div className="rounded-xl border-2 border-primary/10 bg-white p-4">
      <div className="text-sm text-primary-800/70 font-sans">{title}</div>
      <div className="text-2xl font-heading font-semibold text-primary">{value}</div>
      <div className="text-xs text-primary-800/70 font-sans">{caption}</div>
    </div>
  );
}

function HealthRow({ k, v }) {
  return (
    <li className="flex items-center justify-between rounded-lg border-2 border-primary/10 p-2 bg-white">
      <span className="text-primary-800/70 font-sans">{k}</span>
      <span className="font-medium text-primary">{v}</span>
    </li>
  );
}

function Healthy({ text }) {
  return (
    <span className="px-2 py-0.5 rounded-md text-xs bg-green-100 text-green-700 border border-green-200">
      {text}
    </span>
  );
}
function Warn({ text }) {
  return (
    <span className="px-2 py-0.5 rounded-md text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
      {text}
    </span>
  );
}

function StatusPill({ text }) {
  const tone =
    /docs|id|await/i.test(text)
      ? "bg-lavender/30 border-lavender/40 text-primary"
      : /ready|confirm/i.test(text)
      ? "bg-accent/30 border-accent/40 text-primary-900"
      : "bg-cream/70 border-primary/10 text-primary";
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${tone}`}>
      {text}
    </span>
  );
}

function TinyBtn({ children, onClick, tone = "primary" }) {
  const toneCls =
    tone === "accent"
      ? "border-accent/60 hover:bg-accent/20"
      : "border-primary/30 hover:bg-cream/70";
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded-lg border font-button ${toneCls} transition`}
    >
      {children}
    </button>
  );
}

function ImageTile({ src, alt }) {
  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-primary/10 bg-cream/60">
      <img src={src} alt={alt} className="h-24 w-full object-cover" loading="lazy" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-lavender via-cream to-white" />
    </div>
  );
}
