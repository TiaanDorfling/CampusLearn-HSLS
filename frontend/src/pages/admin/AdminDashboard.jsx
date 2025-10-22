// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  // Students
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  // Tutors
  listTutors,
  createTutor,
  updateTutor,
  deleteTutor,
  // Courses
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api/adminapi";

import {
  Users, BookOpen, GraduationCap, TrendingUp, Search, Plus, Edit2, Trash2,
  Bell, MessageSquare, Settings, BarChart3, AlertCircle, Calendar, UserCheck,
} from "lucide-react";

import Loader from "../../components/ui/Loader";
import Empty from "../../components/ui/Empty";
import Modal from "../../components/ui/Modal";

export default function AdminDashboard() {
  const nav = useNavigate();

  /* ---------------- global ui ---------------- */
  const [activeView, setActiveView] = useState("students"); // default so list is visible
  const [error, setError] = useState("");

  /* ---------------- students state ---------------- */
  const [sLoading, setSLoading] = useState(true);
  const [sQ, setSQ] = useState("");
  const [sData, setSData] = useState({ items: [], total: 0 });
  const [sOpenNew, setSOpenNew] = useState(false);
  const [sOpenEdit, setSOpenEdit] = useState(null);
  const [sBusy, setSBusy] = useState(false);

  /* ---------------- courses state ---------------- */
  const [cLoading, setCLoading] = useState(false);
  const [cQ, setCQ] = useState("");
  const [cData, setCData] = useState({ items: [], total: 0 });
  const [cOpenNew, setCOpenNew] = useState(false);
  const [cOpenEdit, setCOpenEdit] = useState(null);
  const [cBusy, setCBusy] = useState(false);

  /* ---------------- tutors state ---------------- */
  const [tLoading, setTLoading] = useState(false);
  const [tQ, setTQ] = useState("");
  const [tData, setTData] = useState({ items: [], total: 0 });
  const [tOpenNew, setTOpenNew] = useState(false);
  const [tOpenEdit, setTOpenEdit] = useState(null);
  const [tBusy, setTBusy] = useState(false);

  /* ---------------- helpers ---------------- */
  const shape = (res) => {
    const items = res?.items ?? [];
    const total = res?.total ?? (Array.isArray(items) ? items.length : 0);
    return { items, total };
  };

  /* ---------------- refreshers ---------------- */
  async function refreshStudents({ q = sQ } = {}) {
    setSLoading(true); setError("");
    try {
      const res = q?.trim()
        ? await listStudents({ page: 1, q, pageSize: 20 })
        : await listStudents({ all: true, pageSize: 50 });
      setSData(shape(res)); setSQ(q);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load students.");
    } finally { setSLoading(false); }
  }

  async function refreshCourses({ q = cQ } = {}) {
    setCLoading(true); setError("");
    try {
      const res = q?.trim()
        ? await listCourses({ page: 1, q, pageSize: 20 })
        : await listCourses({ all: true, pageSize: 50 });
      setCData(shape(res)); setCQ(q);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load courses.");
    } finally { setCLoading(false); }
  }

  async function refreshTutors({ q = tQ } = {}) {
    setTLoading(true); setError("");
    try {
      const res = q?.trim()
        ? await listTutors({ page: 1, q, pageSize: 20 })
        : await listTutors({ all: true, pageSize: 50 });
      setTData(shape(res)); setTQ(q);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load tutors.");
    } finally { setTLoading(false); }
  }

  useEffect(() => { refreshStudents({ q: "" }); /* initial load */ }, []);
  useEffect(() => {
    if (activeView === "courses" && !cData.items.length && !cLoading) refreshCourses({ q: "" });
    if (activeView === "tutors"  && !tData.items.length && !tLoading) refreshTutors({ q: "" });
  }, [activeView]);

  /* ---------------- STUDENTS CRUD ---------------- */
  async function onCreateStudent(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name:  form.get("name"),
      email: form.get("email"),
      year:  form.get("year") || undefined,
      phone: form.get("phone") || undefined,
    };
    setSBusy(true);
    try { await createStudent(payload); setSOpenNew(false); await refreshStudents(); }
    catch (err) { alert(err?.response?.data?.message || err?.message || "Could not create student"); }
    finally { setSBusy(false); }
  }

  async function onUpdateStudent(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name:  form.get("name"),
      year:  form.get("year") || undefined,
      phone: form.get("phone") || undefined,
    };
    setSBusy(true);
    try { await updateStudent(sOpenEdit._id || sOpenEdit.id, payload); setSOpenEdit(null); await refreshStudents(); }
    catch (err) { alert(err?.response?.data?.message || err?.message || "Could not update student"); }
    finally { setSBusy(false); }
  }

  async function onDeleteStudent(id) {
    if (!confirm("Delete this student?")) return;
    try { await deleteStudent(id); await refreshStudents(); }
    catch (err) { alert(err?.response?.data?.message || err?.message || "Could not delete student"); }
  }

  /* ---------------- COURSES CRUD ---------------- */
  async function onCreateCourse(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      code: form.get("code"),
      title: form.get("title"),
      description: form.get("description") || "",
      year: form.get("year") || "",
      semester: form.get("semester") || "",
    };
    setCBusy(true);
    try { await createCourse(payload); setCOpenNew(false); await refreshCourses(); }
    catch (err) { alert(err?.response?.data?.message || err?.message || "Could not create course"); }
    finally { setCBusy(false); }
  }

  async function onUpdateCourse(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      code: form.get("code") || undefined,
      title: form.get("title") || undefined,
      description: form.get("description") ?? undefined,
      year: form.get("year") ?? undefined,
      semester: form.get("semester") ?? undefined,
    };
    setCBusy(true);
    try { await updateCourse(cOpenEdit._id || cOpenEdit.id, payload); setCOpenEdit(null); await refreshCourses(); }
    catch (err) { alert(err?.response?.data?.message || err?.message || "Could not update course"); }
    finally { setCBusy(false); }
  }

  async function onDeleteCourse(id) {
    if (!confirm("Delete this course?")) return;
    try { await deleteCourse(id); await refreshCourses(); }
    catch (err) { alert(err?.response?.data?.message || err?.message || "Could not delete course"); }
  }

  /* ---------------- TUTORS CRUD ---------------- */
  async function onCreateTutor(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name:  form.get("name"),
      email: form.get("email"),
      phone: form.get("phone") || "",
      bio:   form.get("bio") || "",
    };
    setTBusy(true);
    try { await createTutor(payload); setTOpenNew(false); await refreshTutors(); }
    catch (err) { alert(err?.response?.data?.message || err?.message || "Could not create tutor"); }
    finally { setTBusy(false); }
  }

  async function onUpdateTutor(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name:  form.get("name") || undefined,
      email: form.get("email") || undefined,
      phone: form.get("phone") ?? undefined,
      bio:   form.get("bio") ?? undefined,
    };
    setTBusy(true);
    try { await updateTutor(tOpenEdit._id || tOpenEdit.id, payload); setTOpenEdit(null); await refreshTutors(); }
    catch (err) { alert(err?.response?.data?.message || err?.message || "Could not update tutor"); }
    finally { setTBusy(false); }
  }

  async function onDeleteTutor(id) {
    if (!confirm("Delete this tutor?")) return;
    try { await deleteTutor(id); await refreshTutors(); }
    catch (err) { alert(err?.response?.data?.message || err?.message || "Could not delete tutor"); }
  }

  /* -------- demo stats/feeds -------- */
  const stats = [
    { label: "Total Students", value: sData.total || 0, icon: Users,          color: "bg-primary",   change: "+12%" },
    { label: "Active Courses", value: cData.total || 0, icon: BookOpen,       color: "bg-accent",    change: "+5%"  },
    { label: "Total Tutors",   value: tData.total || 0, icon: GraduationCap,  color: "bg-lavender",  change: "+3%"  },
    { label: "Enrollment Rate",value: "94%",             icon: TrendingUp,     color: "bg-redbrown",  change: "+8%"  },
  ];
  const recentActivity = [
    { id: 1, type: "enrollment", user: "John Doe",  action: "enrolled in Web Development 301", time: "2 hours ago" },
    { id: 2, type: "user",       user: "Jane Smith",action: "registered as new student",       time: "3 hours ago" },
    { id: 3, type: "course",     user: "Admin",     action: "created new course: Advanced React", time: "5 hours ago" },
    { id: 4, type: "tutor",      user: "Mike Johnson", action: "assigned to Database Systems", time: "1 day ago" },
  ];
  const systemAlerts = [
    { id: 1, type: "warning", message: "5 students pending approval", priority: "medium" },
    { id: 2, type: "info",    message: "System backup scheduled for tonight", priority: "low" },
    { id: 3, type: "error",   message: "2 courses have missing tutors", priority: "high" },
  ];
  const upcomingTasks = [
    { id: 1, task: "Review student applications", deadline: "Today",    priority: "high"   },
    { id: 2, task: "Assign tutors to new courses", deadline: "Tomorrow", priority: "medium" },
    { id: 3, task: "Generate monthly report",      deadline: "Oct 25",  priority: "low"    },
  ];

  const showStudentsLoader = sLoading && activeView === "students";
  const showCoursesLoader  = cLoading && activeView === "courses";
  const showTutorsLoader   = tLoading && activeView === "tutors";

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
              <button onClick={() => nav("/app/messages")}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-primary-900 rounded-lg hover:bg-accent/90 transition font-button font-medium shadow-lg">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-cream rounded-lg hover:bg-primary-900 transition font-button font-medium shadow-lg">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Alerts</span>
                <span className="bg-redbrown text-cream text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {systemAlerts.filter(a => a.priority === "high").length}
                </span>
              </button>
              <button onClick={() => nav("/app/settings")}
                className="flex items-center gap-2 px-4 py-2 bg-lavender text-primary-900 rounded-lg hover:bg-lavender/90 transition font-button font-medium shadow-lg">
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
              { id: "courses",  label: "Courses",  icon: BookOpen },
              { id: "tutors",   label: "Tutors",   icon: GraduationCap },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveView(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-button font-medium transition border-b-4 ${
                  activeView === tab.id ? "border-accent text-primary bg-lavender/10"
                                        : "border-transparent text-primary-800 hover:bg-lavender/5"
                }`}>
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
              onClick={() => {
                if (activeView === "students") refreshStudents();
                if (activeView === "courses")  refreshCourses();
                if (activeView === "tutors")   refreshTutors();
              }}
              className="px-3 py-1.5 rounded-md bg-redbrown text-cream font-button hover:bg-redbrown/90">
              Retry
            </button>
          </div>
        )}

        {/* ---------------- Overview ---------------- */}
        {activeView === "overview" && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 hover:border-primary/30 transition">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
                      <stat.icon className="w-6 h-6 text-cream" />
                    </div>
                    <span className={`text-xs font-button font-bold px-2 py-1 rounded-full ${
                      stat.change.startsWith("+") ? "bg-accent/20 text-accent" : "bg-redbrown/20 text-redbrown"
                    }`}>
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
                    <AlertCircle className="w-5 h-5" /> System Alerts
                  </h2>
                  <div className="space-y-3">
                    {systemAlerts.map(alert => (
                      <div key={alert.id}
                        className={`p-4 rounded-lg border-l-4 ${
                          alert.priority === "high" ? "bg-redbrown/10 border-redbrown"
                            : alert.priority === "medium" ? "bg-accent/10 border-accent"
                            : "bg-lavender/10 border-lavender"
                        }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">
                              {alert.type === "error" ? "🚨" : alert.type === "warning" ? "⚠️" : "ℹ️"}
                            </span>
                            <div>
                              <p className="font-heading font-medium text-primary">{alert.message}</p>
                              <span className={`text-xs font-button font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
                                alert.priority === "high" ? "bg-redbrown text-cream"
                                  : alert.priority === "medium" ? "bg-accent text-primary-900"
                                  : "bg-lavender text-primary-900"
                              }`}>
                                {alert.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <button className="text-primary hover:text-accent font-button text-sm font-medium">Resolve</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Recent Activity
                  </h2>
                  <div className="space-y-3">
                    {recentActivity.map(a => (
                      <div key={a.id} className="flex items-start gap-4 p-3 bg-cream/50 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          a.type === "enrollment" ? "bg-accent/20"
                            : a.type === "user" ? "bg-primary/20"
                            : a.type === "course" ? "bg-lavender/20"
                            : "bg-redbrown/20"
                        }`}>
                          {a.type === "enrollment" ? "📚" : a.type === "user" ? "👤" : a.type === "course" ? "📖" : "👨‍🏫"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-sans text-primary-800">
                            <span className="font-medium text-primary">{a.user}</span> {a.action}
                          </p>
                          <p className="text-xs text-primary-800/70 font-sans mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enrollment Trends placeholder */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" /> Enrollment Trends
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
                    <button onClick={() => setActiveView("students")}
                      className="w-full px-4 py-3 bg-primary text-cream rounded-lg hover:bg-primary-800 transition font-button font-medium text-left flex items-center gap-2">
                      <Users className="w-4 h-4" /> Manage Students
                    </button>
                    <button onClick={() => setActiveView("courses")}
                      className="w-full px-4 py-3 bg-accent text-primary-900 rounded-lg hover:bg-accent/90 transition font-button font-medium text-left flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Manage Courses
                    </button>
                    <button onClick={() => setActiveView("tutors")}
                      className="w-full px-4 py-3 bg-lavender text-primary-900 rounded-lg hover:bg-lavender/90 transition font-button font-medium text-left flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Manage Tutors
                    </button>
                  </div>
                </div>

                {/* Tasks */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-lg font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" /> Upcoming Tasks
                  </h2>
                  <div className="space-y-3">
                    {upcomingTasks.map(task => (
                      <div key={task.id} className="p-3 bg-cream/50 rounded-lg border-l-4 border-accent">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-heading font-medium text-sm text-primary">{task.task}</p>
                          <span className={`text-xs font-button font-bold px-2 py-0.5 rounded-full ${
                            task.priority === "high" ? "bg-redbrown text-cream"
                              : task.priority === "medium" ? "bg-accent text-primary-900"
                              : "bg-lavender text-primary-900"
                          }`}>
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
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" /> Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-sans text-primary-800">Database</span>
                      <span className="flex items-center gap-2 text-sm font-button font-medium text-accent">
                        <span className="w-2 h-2 bg-accent rounded-full animate-pulse" /> Healthy
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

        {/* ---------------- Students ---------------- */}
        {activeView === "students" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">Student Management</h2>
                <p className="text-primary-800 font-sans text-sm">Total: {sData.total} students</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <input
                    className="rounded-lg border-2 border-primary/30 px-4 py-2 text-sm font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Search by name/email"
                    value={sQ}
                    onChange={(e) => setSQ(e.target.value)}
                  />
                  <button onClick={() => refreshStudents({ q: sQ })}
                    className="px-4 py-2 rounded-lg bg-lavender text-primary-900 font-button font-medium hover:bg-lavender/80 transition shadow-md">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => setSOpenNew(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Student
                </button>
              </div>
            </div>

            {showStudentsLoader ? (
              <Loader label="Loading students..." />
            ) : sData.items?.length ? (
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
                      {sData.items.map(s => (
                        <tr key={s._id || s.id} className="border-b border-primary/10 hover:bg-lavender/5 transition">
                          <td className="py-3 px-4 text-primary-800">{s.name}</td>
                          <td className="py-3 px-4 text-primary-800">{s.email}</td>
                          <td className="py-3 px-4 text-primary-800">{s.year ?? "—"}</td>
                          <td className="py-3 px-4 text-primary-800">{s.phone ?? s?.emergencyContact?.phone ?? "—"}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="p-2 rounded-lg border-2 border-primary/30 hover:bg-lavender/20 transition text-primary"
                                onClick={() => setSOpenEdit(s)}><Edit2 className="w-4 h-4" /></button>
                              <button className="p-2 rounded-lg border-2 border-redbrown/30 hover:bg-redbrown/10 transition text-redbrown"
                                onClick={() => onDeleteStudent(s._id || s.id)}><Trash2 className="w-4 h-4" /></button>
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

        {/* ---------------- Courses ---------------- */}
        {activeView === "courses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">Course Management</h2>
                <p className="text-primary-800 font-sans text-sm">Total: {cData.total} courses</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <input
                    className="rounded-lg border-2 border-primary/30 px-4 py-2 text-sm font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Search by code/title/semester"
                    value={cQ}
                    onChange={(e) => setCQ(e.target.value)}
                  />
                  <button onClick={() => refreshCourses({ q: cQ })}
                    className="px-4 py-2 rounded-lg bg-lavender text-primary-900 font-button font-medium hover:bg-lavender/80 transition shadow-md">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => setCOpenNew(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Course
                </button>
              </div>
            </div>

            {showCoursesLoader ? (
              <Loader label="Loading courses..." />
            ) : cData.items?.length ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-primary/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans">
                    <thead>
                      <tr className="border-b-2 border-primary/20 bg-lavender/20">
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Code</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Title</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Year</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Semester</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Tutors</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary w-40">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cData.items.map(c => (
                        <tr key={c._id || c.id} className="border-b border-primary/10 hover:bg-lavender/5 transition">
                          <td className="py-3 px-4 text-primary-800">{c.code}</td>
                          <td className="py-3 px-4 text-primary-800">{c.title}</td>
                          <td className="py-3 px-4 text-primary-800">{c.year || "—"}</td>
                          <td className="py-3 px-4 text-primary-800">{c.semester || "—"}</td>
                          <td className="py-3 px-4 text-primary-800">{Array.isArray(c.tutors) ? c.tutors.length : 0}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="p-2 rounded-lg border-2 border-primary/30 hover:bg-lavender/20 transition text-primary"
                                onClick={() => setCOpenEdit(c)}><Edit2 className="w-4 h-4" /></button>
                              <button className="p-2 rounded-lg border-2 border-redbrown/30 hover:bg-redbrown/10 transition text-redbrown"
                                onClick={() => onDeleteCourse(c._id || c.id)}><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <Empty title="No courses found" hint="Create a course to get started." />
            )}
          </div>
        )}

        {/* ---------------- Tutors ---------------- */}
        {activeView === "tutors" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">Tutor Management</h2>
                <p className="text-primary-800 font-sans text-sm">Total: {tData.total} tutors</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <input
                    className="rounded-lg border-2 border-primary/30 px-4 py-2 text-sm font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                    placeholder="Search by name/email/topic"
                    value={tQ}
                    onChange={(e) => setTQ(e.target.value)}
                  />
                  <button onClick={() => refreshTutors({ q: tQ })}
                    className="px-4 py-2 rounded-lg bg-lavender text-primary-900 font-button font-medium hover:bg-lavender/80 transition shadow-md">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => setTOpenNew(true)}
                  className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Tutor
                </button>
              </div>
            </div>

            {showTutorsLoader ? (
              <Loader label="Loading tutors..." />
            ) : tData.items?.length ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-primary/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans">
                    <thead>
                      <tr className="border-b-2 border-primary/20 bg-lavender/20">
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Name</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Email</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Phone</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary">Bio</th>
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary w-40">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tData.items.map(t => (
                        <tr key={t._id || t.id} className="border-b border-primary/10 hover:bg-lavender/5 transition">
                          <td className="py-3 px-4 text-primary-800">{t.name}</td>
                          <td className="py-3 px-4 text-primary-800">{t.email}</td>
                          <td className="py-3 px-4 text-primary-800">{t.phone || "—"}</td>
                          <td className="py-3 px-4 text-primary-800">{t.bio ? String(t.bio).slice(0, 60) : "—"}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="p-2 rounded-lg border-2 border-primary/30 hover:bg-lavender/20 transition text-primary"
                                onClick={() => setTOpenEdit(t)}><Edit2 className="w-4 h-4" /></button>
                              <button className="p-2 rounded-lg border-2 border-redbrown/30 hover:bg-redbrown/10 transition text-redbrown"
                                onClick={() => onDeleteTutor(t._id || t.id)}><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <Empty title="No tutors found" hint="Add a tutor to get started." />
            )}
          </div>
        )}
      </div>

      {/* ---------- STUDENT MODALS ---------- */}
      <Modal
        open={sOpenNew}
        onClose={() => setSOpenNew(false)}
        title="Add New Student"
        footer={
          <>
            <button className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-button font-medium hover:bg-lavender/20 transition"
              onClick={() => setSOpenNew(false)}>Cancel</button>
            <button form="createStudent"
              className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-md"
              disabled={sBusy}>{sBusy ? "Creating..." : "Create Student"}</button>
          </>
        }>
        <form id="createStudent" onSubmit={onCreateStudent} className="space-y-4">
          <label className="block">
            <span className="text-sm font-heading font-medium text-primary">Name *</span>
            <input name="name" required
              className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
          </label>
          <label className="block">
            <span className="text-sm font-heading font-medium text-primary">Email *</span>
            <input name="email" type="email" required
              className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Year</span>
              <input name="year"
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Phone</span>
              <input name="phone"
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!sOpenEdit}
        onClose={() => setSOpenEdit(null)}
        title="Edit Student"
        footer={
          <>
            <button className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-button font-medium hover:bg-lavender/20 transition"
              onClick={() => setSOpenEdit(null)}>Cancel</button>
            <button form="editStudent"
              className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-md"
              disabled={sBusy}>{sBusy ? "Saving..." : "Save Changes"}</button>
          </>
        }>
        {sOpenEdit && (
          <form id="editStudent" onSubmit={onUpdateStudent} className="space-y-4">
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Name *</span>
              <input name="name" required defaultValue={sOpenEdit.name}
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Year</span>
                <input name="year" defaultValue={sOpenEdit.year ?? ""}
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
              </label>
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Phone</span>
                <input name="phone" defaultValue={sOpenEdit.phone ?? sOpenEdit?.emergencyContact?.phone ?? ""}
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
              </label>
            </div>
          </form>
        )}
      </Modal>

      {/* ---------- COURSE MODALS ---------- */}
      <Modal
        open={cOpenNew}
        onClose={() => setCOpenNew(false)}
        title="Add New Course"
        footer={
          <>
            <button className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-button font-medium hover:bg-lavender/20 transition"
              onClick={() => setCOpenNew(false)}>Cancel</button>
            <button form="createCourse"
              className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-md"
              disabled={cBusy}>{cBusy ? "Creating..." : "Create Course"}</button>
          </>
        }>
        <form id="createCourse" onSubmit={onCreateCourse} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Code *</span>
              <input name="code" required
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Title *</span>
              <input name="title" required
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Year</span>
              <input name="year"
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Semester</span>
              <input name="semester"
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-heading font-medium text-primary">Description</span>
            <textarea name="description" rows={3}
              className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
          </label>
        </form>
      </Modal>

      <Modal
        open={!!cOpenEdit}
        onClose={() => setCOpenEdit(null)}
        title="Edit Course"
        footer={
          <>
            <button className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-button font-medium hover:bg-lavender/20 transition"
              onClick={() => setCOpenEdit(null)}>Cancel</button>
            <button form="editCourse"
              className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-md"
              disabled={cBusy}>{cBusy ? "Saving..." : "Save Changes"}</button>
          </>
        }>
        {cOpenEdit && (
          <form id="editCourse" onSubmit={onUpdateCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Code</span>
                <input name="code" defaultValue={cOpenEdit.code || ""}
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
              </label>
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Title</span>
                <input name="title" defaultValue={cOpenEdit.title || ""}
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Year</span>
                <input name="year" defaultValue={cOpenEdit.year || ""}
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
              </label>
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Semester</span>
                <input name="semester" defaultValue={cOpenEdit.semester || ""}
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Description</span>
              <textarea name="description" rows={3} defaultValue={cOpenEdit.description || ""}
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
          </form>
        )}
      </Modal>

      {/* ---------- TUTOR MODALS ---------- */}
      <Modal
        open={tOpenNew}
        onClose={() => setTOpenNew(false)}
        title="Add New Tutor"
        footer={
          <>
            <button className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-button font-medium hover:bg-lavender/20 transition"
              onClick={() => setTOpenNew(false)}>Cancel</button>
            <button form="createTutor"
              className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-md"
              disabled={tBusy}>{tBusy ? "Creating..." : "Create Tutor"}</button>
          </>
        }>
        <form id="createTutor" onSubmit={onCreateTutor} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Name *</span>
              <input name="name" required
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Email *</span>
              <input name="email" type="email" required
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Phone</span>
              <input name="phone"
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-sm font-heading font-medium text-primary">Bio</span>
              <input name="bio"
                className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
            </label>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!tOpenEdit}
        onClose={() => setTOpenEdit(null)}
        title="Edit Tutor"
        footer={
          <>
            <button className="px-4 py-2 rounded-lg border-2 border-primary text-primary font-button font-medium hover:bg-lavender/20 transition"
              onClick={() => setTOpenEdit(null)}>Cancel</button>
            <button form="editTutor"
              className="px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-md"
              disabled={tBusy}>{tBusy ? "Saving..." : "Save Changes"}</button>
          </>
        }>
        {tOpenEdit && (
          <form id="editTutor" onSubmit={onUpdateTutor} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Name</span>
                <input name="name" defaultValue={tOpenEdit.name || ""}
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
              </label>
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Email</span>
                <input name="email" type="email" defaultValue={tOpenEdit.email || ""}
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Phone</span>
                <input name="phone" defaultValue={tOpenEdit.phone || ""}
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
              </label>
              <label className="block">
                <span className="text-sm font-heading font-medium text-primary">Bio</span>
                <input name="bio" defaultValue={tOpenEdit.bio || ""}
                  className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent" />
              </label>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
