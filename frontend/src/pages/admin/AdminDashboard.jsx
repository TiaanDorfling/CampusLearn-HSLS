// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"; // <-- use raw axios instance for "all students" (no q)
import {
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../api/students";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Search,
  Plus,
  Edit2,
  Trash2,
  Bell,
  MessageSquare,
  Settings,
  BarChart3,
  AlertCircle,
  Calendar,
  UserCheck,
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import Empty from "../../components/ui/Empty";
import Modal from "../../components/ui/Modal";

export default function AdminDashboard() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // Will contain ALL students when there's no search
  const [data, setData] = useState({ items: [], total: 0 });

  // Start on Students so the list is visible first
  const [activeView, setActiveView] = useState("students");

  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState(null);
  const [busy, setBusy] = useState(false);

  // --- helpers ---
  function normalizeList(res) {
    // Handles shapes like {items,total}, {students,count}, {data:[...]} etc.
    const items =
      res?.items ??
      res?.students ??
      res?.data ??
      res?.rows ??
      [];
    const total =
      res?.total ??
      res?.count ??
      (Array.isArray(items) ? items.length : 0);
    return { items, total, page: res?.page ?? 1 };
  }

  // Fetch ALL students by omitting `q` entirely; page through results.
  async function fetchAllStudentsNoQuery() {
    const HARD_CAP_PAGES = 100; // safety
    const all = [];
    let total = 0;
    let pg = 1;

    for (; pg <= HARD_CAP_PAGES; pg++) {
      // NOTE: no `q` param here on purpose
      const { data: res } = await api.get("/student", { params: { page: pg } });
      const { items, total: t } = normalizeList(res);

      if (pg === 1) total = t || items.length || 0;
      if (!items?.length) break;

      all.push(...items);
      if (total && all.length >= total) break;
    }

    return { items: all, total: total || all.length };
  }

  // Main loader: searches use listStudents(); empty query uses raw axios (no q).
  async function refresh({ page: pg = page, q: query = q } = {}) {
    setLoading(true);
    setError("");
    try {
      if (query && String(query).trim()) {
        // SEARCH MODE — rely on your existing API util (sends q)
        const res = await listStudents({ page: pg, q: query });
        const { items, total } = normalizeList(res);
        setData({ items, total });
        setPage(pg);
      } else {
        // ALL STUDENTS — do NOT send q at all
        const { items, total } = await fetchAllStudentsNoQuery();
        setData({ items, total });
        setPage(1);
      }
      setQ(query);
    } catch (err) {
      const status = err?.status || err?.response?.status;
      const serverMsg =
        err?.friendlyMessage ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load students.";
      console.error("Students load failed:", {
        status,
        data: err?.response?.data,
        detail: err,
      });
      setError(`${serverMsg}${status ? ` (HTTP ${status})` : ""}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load ALL students initially (no search)
    refresh({ page: 1, q: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- CRUD handlers ---
  async function onCreate(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      year: form.get("year") || undefined,
      phone: form.get("phone") || undefined,
    };
    setBusy(true);
    try {
      await createStudent(payload);
      setOpenNew(false);
      await refresh();
    } catch (err) {
      alert(err?.friendlyMessage || "Could not create student");
    } finally {
      setBusy(false);
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      year: form.get("year") || undefined,
      phone: form.get("phone") || undefined,
    };
    setBusy(true);
    try {
      await updateStudent(openEdit._id || openEdit.id, payload);
      setOpenEdit(null);
      await refresh();
    } catch (err) {
      alert(err?.friendlyMessage || "Could not update student");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this student?")) return;
    try {
      await deleteStudent(id);
      await refresh();
    } catch (err) {
      alert(err?.friendlyMessage || "Could not delete student");
    }
  }

  // --- Demo metrics/feeds (unchanged) ---
  const stats = [
    { label: "Total Students", value: data.total || 0, icon: Users, color: "bg-primary", change: "+12%" },
    { label: "Active Courses", value: 24, icon: BookOpen, color: "bg-accent", change: "+5%" },
    { label: "Total Tutors", value: 18, icon: GraduationCap, color: "bg-lavender", change: "+3%" },
    { label: "Enrollment Rate", value: "94%", icon: TrendingUp, color: "bg-redbrown", change: "+8%" },
  ];
  const recentActivity = [
    { id: 1, type: "enrollment", user: "John Doe", action: "enrolled in Web Development 301", time: "2 hours ago" },
    { id: 2, type: "user", user: "Jane Smith", action: "registered as new student", time: "3 hours ago" },
    { id: 3, type: "course", user: "Admin", action: "created new course: Advanced React", time: "5 hours ago" },
    { id: 4, type: "tutor", user: "Mike Johnson", action: "assigned to Database Systems", time: "1 day ago" },
  ];
  const systemAlerts = [
    { id: 1, type: "warning", message: "5 students pending approval", priority: "medium" },
    { id: 2, type: "info", message: "System backup scheduled for tonight", priority: "low" },
    { id: 3, type: "error", message: "2 courses have missing tutors", priority: "high" },
  ];
  const upcomingTasks = [
    { id: 1, task: "Review student applications", deadline: "Today", priority: "high" },
    { id: 2, task: "Assign tutors to new courses", deadline: "Tomorrow", priority: "medium" },
    { id: 3, task: "Generate monthly report", deadline: "Oct 25", priority: "low" },
  ];

  // If you also want a loader for the Students tab:
  const showStudentsLoader = loading && activeView === "students";

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-primary border-b-4 border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-cream">Admin Dashboard</h1>
              <p className="text-beige mt-1">Manage your learning platform</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => nav("/app/messages")}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-primary-900 rounded-lg hover:bg-accent/90 transition font-button font-medium shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-cream rounded-lg hover:bg-primary-900 transition font-button font-medium shadow-lg">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Alerts</span>
                <span className="bg-redbrown text-cream text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {systemAlerts.filter((a) => a.priority === "high").length}
                </span>
              </button>

              <button
                onClick={() => nav("/app/settings")}
                className="flex items-center gap-2 px-4 py-2 bg-lavender text-primary-900 rounded-lg hover:bg-lavender/90 transition font-button font-medium shadow-lg"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b-2 border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "students", label: "Students", icon: Users },
              { id: "courses", label: "Courses", icon: BookOpen },
              { id: "tutors", label: "Tutors", icon: GraduationCap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-button font-medium transition border-b-4 ${
                  activeView === tab.id
                    ? "border-accent text-primary bg-lavender/10"
                    : "border-transparent text-primary-800 hover:bg-lavender/5"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-lg border-2 border-redbrown/60 p-4 text-sm text-redbrown bg-cream flex items-start justify-between gap-3 shadow-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => refresh({ page: 1, q })}
              className="px-3 py-1.5 rounded-md bg-redbrown text-cream font-button hover:bg-redbrown/90"
            >
              Retry
            </button>
          </div>
        )}

        {/* Overview */}
        {activeView === "overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 hover:border-primary/30 transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
                      <stat.icon className="w-6 h-6 text-cream" />
                    </div>
                    <span
                      className={`text-xs font-button font-bold px-2 py-1 rounded-full ${
                        stat.change.startsWith("+")
                          ? "bg-accent/20 text-accent"
                          : "bg-redbrown/20 text-redbrown"
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-primary-800 text-sm font-medium font-sans">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold text-primary mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left (2/3) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Alerts */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    System Alerts
                  </h2>
                  <div className="space-y-3">
                    {systemAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          alert.priority === "high"
                            ? "bg-redbrown/10 border-redbrown"
                            : alert.priority === "medium"
                            ? "bg-accent/10 border-accent"
                            : "bg-lavender/10 border-lavender"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">
                              {alert.type === "error"
                                ? "🚨"
                                : alert.type === "warning"
                                ? "⚠️"
                                : "ℹ️"}
                            </span>
                            <div>
                              <p className="font-heading font-medium text-primary">{alert.message}</p>
                              <span
                                className={`text-xs font-button font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                                  alert.priority === "high"
                                    ? "bg-redbrown text-cream"
                                    : alert.priority === "medium"
                                    ? "bg-accent text-primary-900"
                                    : "bg-lavender text-primary-900"
                                }`}
                              >
                                {alert.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <button className="text-primary hover:text-accent font-button text-sm font-medium">
                            Resolve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Activity
                  </h2>
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-3 bg-cream/50 rounded-lg">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            activity.type === "enrollment"
                              ? "bg-accent/20"
                              : activity.type === "user"
                              ? "bg-primary/20"
                              : activity.type === "course"
                              ? "bg-lavender/20"
                              : "bg-redbrown/20"
                          }`}
                        >
                          {activity.type === "enrollment"
                            ? "📚"
                            : activity.type === "user"
                            ? "👤"
                            : activity.type === "course"
                            ? "📖"
                            : "👨‍🏫"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-sans text-primary-800">
                            <span className="font-medium text-primary">{activity.user}</span>{" "}
                            {activity.action}
                          </p>
                          <p className="text-xs text-primary-800/70 font-sans mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enrollment Trends (placeholder) */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Enrollment Trends
                  </h2>
                  <div className="h-64 flex items-center justify-center bg-lavender/10 rounded-lg border-2 border-dashed border-lavender">
                    <p className="text-primary-800 font-sans">Chart visualization would go here</p>
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-lg font-heading font-bold text-primary mb-4">Quick Actions</h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveView("students")}
                      className="w-full px-4 py-3 bg-primary text-cream rounded-lg hover:bg-primary-800 transition font-button font-medium text-left flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Manage Students
                    </button>
                    <button
                      onClick={() => setActiveView("courses")}
                      className="w-full px-4 py-3 bg-accent text-primary-900 rounded-lg hover:bg-accent/90 transition font-button font-medium text-left flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Manage Courses
                    </button>
                    <button
                      onClick={() => setActiveView("tutors")}
                      className="w-full px-4 py-3 bg-lavender text-primary-900 rounded-lg hover:bg-lavender/90 transition font-button font-medium text-left flex items-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      Manage Tutors
                    </button>
                  </div>
                </div>

                {/* Upcoming Tasks */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-lg font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Upcoming Tasks
                  </h2>
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <div key={task.id} className="p-3 bg-cream/50 rounded-lg border-l-4 border-accent">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-heading font-medium text-sm text-primary">{task.task}</p>
                          <span
                            className={`text-xs font-button font-bold px-2 py-0.5 rounded-full ${
                              task.priority === "high"
                                ? "bg-redbrown text-cream"
                                : task.priority === "medium"
                                ? "bg-accent text-primary-900"
                                : "bg-lavender text-primary-900"
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-primary-800 font-sans">📅 {task.deadline}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-lg font-heading font-bold text-primary mb-4">System Status</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-sans text-primary-800">Server Status</span>
                      <span className="flex items-center gap-2 text-sm font-button font-medium text-accent">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-sans text-primary-800">Database</span>
                      <span className="flex items-center gap-2 text-sm font-button font-medium text-accent">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        Healthy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-sans text-primary-800">Last Backup</span>
                      <span className="text-sm font-button font-medium text-primary-800">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students */}
        {activeView === "students" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">Student Management</h2>
                <p className="text-primary-800 font-sans text-sm">Total: {data.total} students</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <input
                    className="rounded-lg border-2 border-primary/30 px-4 py-2 text-sm font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Search by name/email"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <button
                    onClick={() => refresh({ page: 1, q })}
                    className="px-4 py-2 rounded-lg bg-lavender text-primary-900 font-button font-medium hover:bg-lavender/80 transition shadow-md"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setOpenNew(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-lg flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Student
                </button>
              </div>
            </div>

            {showStudentsLoader ? (
              <Loader label="Loading students..." />
            ) : data.items?.length ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-primary/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans">
                    <thead>
                      <tr className="border-b-2 border-primary/20 bg-lavender/20">
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Name</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Email</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Year</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Phone</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary w-40">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((s) => (
                        <tr key={s._id || s.id} className="border-b border-primary/10 hover:bg-lavender/5 transition">
                          <td className="py-3 px-4 text-primary-800">{s.name}</td>
                          <td className="py-3 px-4 text-primary-800">{s.email}</td>
                          <td className="py-3 px-4 text-primary-800">{s.year ?? "—"}</td>
                          <td className="py-3 px-4 text-primary-800">{s.phone ?? "—"}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                className="p-2 rounded-lg border-2 border-primary/30 hover:bg-lavender/20 transition text-primary"
                                onClick={() => setOpenEdit(s)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 rounded-lg border-2 border-redbrown/30 hover:bg-redbrown/10 transition text-redbrown"
                                onClick={() => onDelete(s._id || s.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <Empty title="No students found" hint="Add our first student to get started." />
            )}
          </div>
        )}

        {/* Courses */}
        {activeView === "courses" && (
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-primary/10 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-lavender" />
            <h2 className="text-2xl font-heading font-bold text-primary mb-2">Course Management</h2>
            <p className="text-primary-800 font-sans">Course management interface coming soon...</p>
          </div>
        )}

        {/* Tutors */}
        {activeView === "tutors" && (
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-primary/10 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h2 className="text-2xl font-heading font-bold text-primary mb-2">Tutor Management</h2>
            <p className="text-primary-800 font-sans">Tutor management interface coming soon...</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={openNew}
        onClose={() => setOpenNew(false)}
        title="Add New Student"
        footer={
          <>
            <button
              className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-button font-medium hover:bg-lavender/20 transition"
              onClick={() => setOpenNew(false)}
            >
              Cancel
            </button>
            <button
              form="createStudent"
              className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-md"
              disabled={busy}
            >
              {busy ? "Creating..." : "Create Student"}
            </button>
          </>
        }
      >
        <form id="createStudent" onSubmit={onCreate} className="space-y-4">
          <label className="block">
            <span className="text-sm font-heading font-medium text-primary">Name *</span>
            <input
              name="name"
              className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-heading font-medium text-primary">Email *</span>
            <input
              name="email"
              type="email"
              className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Year</span>
              <input
                name="year"
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Phone</span>
              <input
                name="phone"
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </label>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!openEdit}
        onClose={() => setOpenEdit(null)}
        title="Edit Student"
        footer={
          <>
            <button
              className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-button font-medium hover:bg-lavender/20 transition"
              onClick={() => setOpenEdit(null)}
            >
              Cancel
            </button>
            <button
              form="editStudent"
              className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-md"
              disabled={busy}
            >
              {busy ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        {openEdit && (
          <form id="editStudent" onSubmit={onUpdate} className="space-y-4">
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Name *</span>
              <input
                name="name"
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                defaultValue={openEdit.name}
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Year</span>
                <input
                  name="year"
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                  defaultValue={openEdit.year ?? ""}
                />
              </label>
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Phone</span>
                <input
                  name="phone"
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                  defaultValue={openEdit.phone ?? ""}
                />
              </label>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
