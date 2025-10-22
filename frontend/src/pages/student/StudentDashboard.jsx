import { useEffect, useState } from "react";
import api from "../../api/axios";
import { getCourse } from "../../api/adminapi";

import {
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Bell,
  BarChart3,
  UserCheck,
  ChevronRight,
  Star,
  Edit2,
} from "lucide-react";

export default function StudentDashboard() {
  const [activeView, setActiveView] = useState("overview");

  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let res;
        try {
          res = await api.get("/students/me", { headers });
        } catch (e1) {
          try {
            res = await api.get("/student/me", { headers });
          } catch (e2) {
            res = await api.get("/me", { headers });
          }
        }

        const payload = res?.data;
        const s = payload?.student || payload?.data || payload;
        if (!s) throw new Error("Unexpected response from /me endpoint");

        setStudent(s);
        setError("");
        await hydrateCourses(s);
      } catch (err) {
        console.error(
          "Failed to load student:",
          err?.response?.status,
          err?.response?.data || err
        );
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load student data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    const hydrateCourses = async (s) => {
      setCoursesLoading(true);
      try {
        const arr = Array.isArray(s?.courses) ? s.courses : [];
        const fullCourses = await Promise.all(
          arr.map(async (c) => {
            const id = c?._id || c?.id || c;
            if (c && (c.code || c.title || c.name)) return c;
            try {
              return await getCourse(id);
            } catch {
              return typeof c === "object" ? c : { _id: id, code: id, title: "Course" };
            }
          })
        );

        const normalized = fullCourses.map((c) => ({
          ...c,
          title: c?.title || c?.name || c?.code || "Course",
        }));

        setEnrolledCourses(normalized.filter(Boolean));
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchStudent();
  }, []);

  const [form, setForm] = useState({
    phone: "",
    year: "",
    about: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  useEffect(() => {
    if (student) {
      setForm({
        phone: student.phone || "",
        year: student.year || "",
        about: student.about || "",
        emergencyContactName: student.emergencyContact?.name || "",
        emergencyContactPhone: student.emergencyContact?.phone || "",
      });
    }
  }, [student]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const body = {
        phone: form.phone,
        year: form.year,
        about: form.about,
        emergencyContact: {
          name: form.emergencyContactName || undefined,
          phone: form.emergencyContactPhone || undefined,
        },
      };

      let res;
      try {
        res = await api.put("/students/me", body, { headers });
      } catch {
        res = await api.put("/student/me", body, { headers });
      }

      const updated = res?.data?.student || res?.data || body;
      setStudent((prev) => ({
        ...prev,
        ...updated,
        emergencyContact: {
          ...(prev?.emergencyContact || {}),
          ...(updated?.emergencyContact || body.emergencyContact || {}),
        },
      }));

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading student data...</div>;
  if (error) return <div className="p-10 text-redbrown text-center">{error}</div>;
  if (!student) return <div className="p-10 text-center">No student found.</div>;

  const upcomingTasks = [
    { id: 1, task: "Finish React assignment", deadline: "Today", priority: "high" },
    { id: 2, task: "Prep for DB midterm", deadline: "Tomorrow", priority: "medium" },
    { id: 3, task: "Group project sync", deadline: "Fri", priority: "low" },
  ];
  const systemAlerts = [
    { id: 1, type: "warning", message: "3 assignments due this week", priority: "medium" },
    { id: 2, type: "info", message: "Lab slots updated for Thursday", priority: "low" },
    { id: 3, type: "error", message: "One course missing materials", priority: "high" },
  ];
  const recentActivity = [
    {
      id: 1,
      type: "assignment",
      user: "You",
      action: "submitted Project 1 (Web Dev)",
      time: "2 hours ago",
    },
    { id: 2, type: "grade", user: "Lecturer", action: "graded Database Quiz 2", time: "Yesterday" },
    { id: 3, type: "course", user: "You", action: "joined SEN381 group", time: "2 days ago" },
    { id: 4, type: "meeting", user: "You", action: "booked tutor session", time: "3 days ago" },
  ];

  const schedule = [
    { day: "Mon", start: "09:00", end: "10:30", title: "SEN381", location: "B201", color: "bg-accent" },
    { day: "Tue", start: "11:00", end: "12:30", title: "PRG381", location: "C105", color: "bg-lavender" },
    { day: "Wed", start: "13:00", end: "15:00", title: "DBD382", location: "Lab 2", color: "bg-primary" },
    { day: "Thu", start: "10:00", end: "11:30", title: "ELD380", location: "A304", color: "bg-redbrown" },
    { day: "Fri", start: "08:00", end: "10:00", title: "NET380", location: "B001", color: "bg-primary-800" },
  ];

  const marks = [
    {
      code: "SEN381",
      name: "Software Engineering",
      overall: 78,
      terms: [
        { label: "Test 1", score: 75 },
        { label: "Assignment", score: 82 },
        { label: "Project", score: 80 },
      ],
    },
    {
      code: "PRG381",
      name: "Programming 3",
      overall: 66,
      terms: [
        { label: "Test 1", score: 60 },
        { label: "Lab", score: 72 },
        { label: "Project", score: 65 },
      ],
    },
    {
      code: "DBD382",
      name: "Databases",
      overall: 85,
      terms: [
        { label: "Test 1", score: 88 },
        { label: "Assignment", score: 84 },
        { label: "Project", score: 83 },
      ],
    },
  ];

  const courseCount =
    (Array.isArray(enrolledCourses) && enrolledCourses.length) ||
    (Array.isArray(student?.courses) ? student.courses.length : 0);

  const stats = [
    { label: "Enrolled Courses", value: courseCount, icon: BookOpen, color: "bg-primary", change: "+1" },
    { label: "Avg Grade", value: "B+", icon: TrendingUp, color: "bg-accent", change: "—" },
    { label: "Upcoming Events", value: "3", icon: Calendar, color: "bg-lavender", change: "+2" },
    { label: "Completed Tasks", value: "12/15", icon: CheckCircle2, color: "bg-redbrown", change: "+3" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header  */}
      <div className="bg-primary border-b-4 border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-cream">Student Dashboard</h1>
              <p className="text-beige mt-1">Welcome back, {student?.name?.split(" ")[0]}!</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-accent text-primary-900 rounded-lg hover:bg-accent/90 transition font-button font-medium shadow-lg">
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
            </div>
          </div>
        </div>
      </div>

      {/* Tabs  */}
      <div className="bg-white border-b-2 border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "courses", label: "My Courses", icon: BookOpen },
              { id: "schedule", label: "Schedule", icon: Calendar },
              { id: "grades", label: "Grades", icon: TrendingUp },
              { id: "profile", label: "Profile", icon: Users },
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
        {/* OVERVIEW */}
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
                        String(stat.change).startsWith("+") || stat.change === "—"
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

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left (2/3) */}
              <div className="lg:col-span-2 space-y-8">
                {/* Alerts */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> System Alerts
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
                            Dismiss
                          </button>
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
                    {recentActivity.map((a) => (
                      <div key={a.id} className="flex items-start gap-4 p-3 bg-cream/50 rounded-lg">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            a.type === "assignment"
                              ? "bg-accent/20"
                              : a.type === "grade"
                              ? "bg-primary/20"
                              : a.type === "course"
                              ? "bg-lavender/20"
                              : "bg-redbrown/20"
                          }`}
                        >
                          {a.type === "assignment" ? "📄" : a.type === "grade" ? "⭐" : a.type === "course" ? "📘" : "👥"}
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
              </div>

              {/* Right sidebar */}
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-lg font-heading font-bold text-primary mb-4">Quick Actions</h2>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveView("courses")}
                      className="w-full px-4 py-3 bg-primary text-cream rounded-lg hover:bg-primary-800 transition font-button font-medium text-left flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" /> View My Courses
                    </button>
                    <button
                      onClick={() => setActiveView("schedule")}
                      className="w-full px-4 py-3 bg-accent text-primary-900 rounded-lg hover:bg-accent/90 transition font-button font-medium text-left flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" /> View Schedule
                    </button>
                    <button
                      onClick={() => setActiveView("profile")}
                      className="w-full px-4 py-3 bg-lavender text-primary-900 rounded-lg hover:bg-lavender/90 transition font-button font-medium text-left flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" /> Edit Profile
                    </button>
                  </div>
                </div>

                {/* Tasks */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                  <h2 className="text-lg font-heading font-bold text-primary mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" /> Upcoming Tasks
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

            {/* This Week's Schedule */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h2 className="text-xl font-heading font-bold text-primary mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" /> This Week's Schedule
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-cream/60 rounded-lg border-2 border-primary/10 hover:border-accent transition"
                  >
                    <p className="text-xs font-bold text-primary-800 mb-2">{item.day}</p>
                    <div className={`w-full h-1 ${item.color} rounded-full mb-2`} />
                    <p className="font-heading font-semibold text-primary text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-primary-800">
                      {item.start} - {item.end}
                    </p>
                    <p className="text-xs text-primary-800/70 mt-1">{item.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* COURSES */}
        {activeView === "courses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl font-heading font-bold text-primary">My Courses</h2>
                <p className="text-primary-800 font-sans text-sm">Total: {courseCount} courses</p>
              </div>
            </div>

            {coursesLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
                Loading your courses…
              </div>
            ) : enrolledCourses && enrolledCourses.length ? (
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
                        <th className="py-4 px-4 text-left font-heading font-semibold text-primary w-28">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledCourses.map((c) => (
                        <tr
                          key={c._id || c.id}
                          className="border-b border-primary/10 hover:bg-lavender/5 transition"
                        >
                          <td className="py-3 px-4 text-primary-800">{c.code || "—"}</td>
                          <td className="py-3 px-4 text-primary-800">{c.title || c.name || "—"}</td>
                          <td className="py-3 px-4 text-primary-800">{c.year || "—"}</td>
                          <td className="py-3 px-4 text-primary-800">{c.semester || "—"}</td>
                          <td className="py-3 px-4 text-primary-800">
                            {Array.isArray(c.tutors) ? c.tutors.length : 0}
                          </td>
                          <td className="py-3 px-4">
                            <button className="p-2 rounded-lg border-2 border-primary/30 hover:bg-lavender/20 transition text-primary flex items-center gap-1">
                              <Edit2 className="w-4 h-4" />
                              <span className="text-xs font-button">View</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-primary/10 text-center">
                No courses found.
              </div>
            )}
          </div>
        )}

        {/* SCHEDULE */}
        {activeView === "schedule" && (
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-primary/10">
            <h2 className="text-2xl font-heading font-bold text-primary mb-6">Weekly Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="py-4 px-4 text-left font-heading text-primary">Day</th>
                    <th className="py-4 px-4 text-left font-heading text-primary">Time</th>
                    <th className="py-4 px-4 text-left font-heading text-primary">Course</th>
                    <th className="py-4 px-4 text-left font-heading text-primary">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, idx) => (
                    <tr key={idx} className="border-b border-primary/10 hover:bg-lavender/5 transition">
                      <td className="py-4 px-4 text-primary-800 font-medium">{item.day}</td>
                      <td className="py-4 px-4 text-primary-800">
                        {item.start} - {item.end}
                      </td>
                      <td className="py-4 px-4 text-primary-800">{item.title}</td>
                      <td className="py-4 px-4 text-primary-800">{item.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GRADES */}
        {activeView === "grades" && (
          <div className="space-y-6">
            {marks.map((course) => (
              <div
                key={course.code}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-heading font-bold text-primary">{course.code}</h3>
                    <p className="text-primary-800 font-sans text-sm">{course.name}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-4xl font-heading font-bold ${
                        course.overall >= 80
                          ? "text-accent"
                          : course.overall >= 70
                          ? "text-primary"
                          : course.overall >= 60
                          ? "text-redbrown"
                          : "text-primary-800"
                      }`}
                    >
                      {course.overall}%
                    </div>
                    <p className="text-xs text-primary-800/70">Overall</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {course.terms.map((term, i) => (
                    <div
                      key={i}
                      className="p-4 bg-cream/60 rounded-lg border-2 border-primary/10 text-center"
                    >
                      <p className="text-xs text-primary-800/80 mb-2">{term.label}</p>
                      <p className="text-2xl font-heading font-bold text-primary">{term.score}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROFILE */}
        {activeView === "profile" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h3 className="text-lg font-heading font-bold text-primary mb-4">Profile Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-primary-800/70 text-xs">Email</p>
                  <p className="font-heading text-primary">{student.email}</p>
                </div>
                <div>
                  <p className="text-primary-800/70 text-xs">Student Number</p>
                  <p className="font-heading text-primary">{student.studentNumber}</p>
                </div>
                <div>
                  <p className="text-primary-800/70 text-xs">Year</p>
                  <p className="font-heading text-primary">{student.year}</p>
                </div>
                <div>
                  <p className="text-primary-800/70 text-xs">Phone</p>
                  <p className="font-heading text-primary">{student.phone || "—"}</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={onSave}
              className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10"
            >
              <h3 className="text-lg font-heading font-bold text-primary mb-6">Edit Profile</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <label className="block">
                  <span className="text-sm font-heading text-primary mb-1 block">Phone</span>
                  <input
                    className="w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-heading text-primary mb-1 block">Year</span>
                  <input
                    className="w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </label>
              </div>
              <label className="block mb-4">
                <span className="text-sm font-heading text-primary mb-1 block">About</span>
                <textarea
                  className="w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                  rows="3"
                  value={form.about}
                  onChange={(e) => setForm({ ...form, about: e.target.value })}
                />
              </label>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <label className="block">
                  <span className="text-sm font-heading text-primary mb-1 block">
                    Emergency Contact Name
                  </span>
                  <input
                    className="w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                    value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-heading text-primary mb-1 block">
                    Emergency Contact Phone
                  </span>
                  <input
                    className="w-full rounded-lg border-2 border-primary/30 px-4 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                  />
                </label>
              </div>
              <button
                className="px-6 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-md disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
