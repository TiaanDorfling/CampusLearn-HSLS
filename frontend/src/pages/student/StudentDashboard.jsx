import { useEffect, useState } from "react";
import api from "../../api/axios";
import { getCourse } from "../../api/adminapi";

import {
  Calendar, BookOpen, CheckCircle2, Bell, TrendingUp, AlertCircle,
  MessageSquare, Users, Award, Clock, ChevronRight, Star, Target, Book
} from "lucide-react";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // core data
  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // flags
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // ---------- fetch student ----------
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
        if (!s) throw new Error("Unexpected response shape from /me endpoint");

        setStudent(s);
        setError("");

        // hydrate courses after we have a student
        await hydrateCourses(s);
      } catch (err) {
        console.error("Failed to load student:", err?.response?.status, err?.response?.data || err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load student data. Please try again.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    const hydrateCourses = async (s) => {
      setCoursesLoading(true);
      try {
        const arr = Array.isArray(s?.courses) ? s.courses : [];

        // map each item to a full course object using admin API if needed
        const fullCourses = await Promise.all(
          arr.map(async (c) => {
            // item might be: { _id, code, title/name } OR just an id string
            const id = c?._id || c?.id || c;
            // if already looks full enough, keep it
            if (c && (c.code || c.title || c.name)) return c;

            try {
              const course = await getCourse(id);
              return course;
            } catch {
              // fall back to a minimal shape so UI doesn't break
              return typeof c === "object"
                ? c
                : { _id: id, code: id, title: "Course" };
            }
          })
        );

        // normalize title/name for rendering
        const normalized = fullCourses.map((c) => ({
          ...c,
          title: c.title || c.name || c.code || "Course",
        }));

        setEnrolledCourses(normalized.filter(Boolean));
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchStudent();
  }, []);

  // ---------- profile form ----------
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
      } catch (e1) {
        res = await api.put("/student/me", body, { headers });
      }

      const updated = res?.data?.student || res?.data || body;
      // Optimistically merge the local state so the UI reflects changes immediately
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
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------- guards ----------
  if (loading) return <div className="p-10 text-center">Loading student data...</div>;
  if (error)   return <div className="p-10 text-red-600 text-center">{error}</div>;
  if (!student) return <div className="p-10 text-center">No student found.</div>;

  // ---------- demo data (unchanged visual scaffolding) ----------
  const schedule = [
    { day: "Mon", start: "09:00", end: "10:30", title: "SEN381", location: "B201", color: "bg-blue-500" },
    { day: "Tue", start: "11:00", end: "12:30", title: "PRG381", location: "C105", color: "bg-purple-500" },
    { day: "Wed", start: "13:00", end: "15:00", title: "DBD382", location: "Lab 2", color: "bg-green-500" },
    { day: "Thu", start: "10:00", end: "11:30", title: "ELD380", location: "A304", color: "bg-orange-500" },
    { day: "Fri", start: "08:00", end: "10:00", title: "NET380", location: "B001", color: "bg-pink-500" },
  ];

  const marks = [
    { code: "SEN381", name: "Software Engineering", overall: 78, terms: [
      { label: "Test 1", score: 75 }, { label: "Assignment", score: 82 }, { label: "Project", score: 80 }
    ]},
    { code: "PRG381", name: "Programming 3", overall: 66, terms: [
      { label: "Test 1", score: 60 }, { label: "Lab", score: 72 }, { label: "Project", score: 65 }
    ]},
    { code: "DBD382", name: "Databases", overall: 85, terms: [
      { label: "Test 1", score: 88 }, { label: "Assignment", score: 84 }, { label: "Project", score: 83 }
    ]},
  ];

  const upcomingEvents = [
    { id: 1, title: "Assignment Due: React Project", date: "Oct 25", type: "assignment", priority: "high" },
    { id: 2, title: "Midterm Exam: Database Systems", date: "Oct 28", type: "exam", priority: "high" },
    { id: 3, title: "Group Presentation", date: "Oct 30", type: "presentation", priority: "medium" },
    { id: 4, title: "Lab Submission: Network Config", date: "Nov 02", type: "assignment", priority: "low" },
  ];

  const recentGrades = [
    { course: "Web Development", assignment: "Project 1", grade: "A-", score: 88, date: "Oct 15" },
    { course: "Data Structures", assignment: "Quiz 3", grade: "B+", score: 85, date: "Oct 12" },
    { course: "Software Eng", assignment: "Test 2", grade: "A", score: 92, date: "Oct 10" },
  ];

  const courseCount =
    (Array.isArray(enrolledCourses) && enrolledCourses.length) ||
    (Array.isArray(student?.courses) && student.courses.length) ||
    0;

  const stats = [
    { label: "Current Courses", value: courseCount, icon: BookOpen, color: "from-blue-500 to-blue-600", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { label: "Average Grade", value: "B+", icon: TrendingUp, color: "from-green-500 to-green-600", iconBg: "bg-green-100", iconColor: "text-green-600" },
    { label: "Upcoming Events", value: upcomingEvents.length, icon: Calendar, color: "from-purple-500 to-purple-600", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
    { label: "Completed Tasks", value: "12/15", icon: CheckCircle2, color: "from-orange-500 to-orange-600", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30">
                {student.name?.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Welcome back, {student.name?.split(" ")[0]}!</h1>
                <p className="text-blue-100 mt-1">Student ID: {student.studentNumber} • {student.year}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition border border-white/30">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
              </button>
              <button className="relative p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition border border-white/30">
                <MessageSquare className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  5
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: Target },
              { id: "courses", label: "My Courses", icon: Book },
              { id: "schedule", label: "Schedule", icon: Calendar },
              { id: "grades", label: "Grades", icon: Award },
              { id: "profile", label: "Profile", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-4 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:bg-gray-50"
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
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 p-4 text-sm text-red-700 bg-red-50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className={`h-2 bg-linear-to-r ${stat.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Upcoming Events */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    Upcoming Events
                  </h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 bg-linear-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all group cursor-pointer"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          event.priority === "high"
                            ? "bg-red-100"
                            : event.priority === "medium"
                            ? "bg-orange-100"
                            : "bg-green-100"
                        }`}
                      >
                        {event.type === "exam" ? "📝" : event.type === "assignment" ? "📄" : "🎤"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{event.title}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {event.date}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Grades */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    Recent Grades
                  </h2>
                </div>
                <div className="space-y-4">
                  {recentGrades.map((grade, idx) => (
                    <div key={idx} className="p-4 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900 text-sm">{grade.course}</p>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${
                            grade.score >= 90
                              ? "bg-green-100 text-green-700"
                              : grade.score >= 80
                              ? "bg-blue-100 text-blue-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {grade.grade}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{grade.assignment}</p>
                      <p className="text-xs text-gray-500 mt-1">{grade.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Schedule Preview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-purple-600" />
                This Week's Schedule
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {schedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-linear-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <p className="text-xs font-bold text-gray-500 mb-2">{item.day}</p>
                    <div className={`w-full h-1 ${item.color} rounded-full mb-2`}></div>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-xs text-gray-600">
                      {item.start} - {item.end}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{item.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Courses */}
        {activeTab === "courses" && (
          <div className="space-y-6">
            {coursesLoading ? (
              <div className="p-6 bg-white rounded-2xl shadow text-center text-gray-600">
                Loading your enrolled courses…
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(enrolledCourses.length ? enrolledCourses : (student.courses || [])).map((course) => {
                  const id = course?._id || course?.id || course;
                  const code = course?.code || id;
                  const title = course?.title || course?.name || code;

                  return (
                    <div
                      key={id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
                    >
                      <div className="h-32 bg-linear-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white opacity-80" />
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition">
                          {code}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">{title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">View Details</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!enrolledCourses.length && !(student.courses || []).length && (
                  <div className="col-span-full p-8 text-center text-gray-600 bg-white rounded-2xl shadow">
                    You’re not enrolled in any courses yet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Schedule */}
        {activeTab === "schedule" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="py-4 px-4 text-left font-bold text-gray-700">Day</th>
                    <th className="py-4 px-4 text-left font-bold text-gray-700">Time</th>
                    <th className="py-4 px-4 text-left font-bold text-gray-700">Course</th>
                    <th className="py-4 px-4 text-left font-bold text-gray-700">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50 transition">
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">{item.day}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {item.start} - {item.end}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                          <span className="font-medium text-gray-900">{item.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{item.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grades */}
        {activeTab === "grades" && (
          <div className="space-y-6">
            {marks.map((course) => (
              <div key={course.code} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{course.code}</h3>
                    <p className="text-gray-600 text-sm">{course.name}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-4xl font-bold ${
                        course.overall >= 80
                          ? "text-green-600"
                          : course.overall >= 70
                          ? "text-blue-600"
                          : course.overall >= 60
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {course.overall}%
                    </div>
                    <p className="text-sm text-gray-500">Overall</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {course.terms.map((term, i) => (
                    <div key={i} className="p-4 bg-linear-to-br from-gray-50 to-blue-50 rounded-xl text-center">
                      <p className="text-xs text-gray-600 mb-2">{term.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{term.score}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile */}
        {activeTab === "profile" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="font-medium text-gray-900">{student.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Student Number</p>
                  <p className="font-medium text-gray-900">{student.studentNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Year</p>
                  <p className="font-medium text-gray-900">{student.year}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Phone</p>
                  <p className="font-medium text-gray-900">{student.phone}</p>
                </div>
              </div>
            </div>

            <form onSubmit={onSave} className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Edit Profile</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-1 block">Phone</span>
                  <input
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-1 block">Year</span>
                  <input
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </label>
              </div>
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 mb-1 block">About</span>
                <textarea
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  rows="3"
                  value={form.about}
                  onChange={(e) => setForm({ ...form, about: e.target.value })}
                />
              </label>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-1 block">Emergency Contact Name</span>
                  <input
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-1 block">Emergency Contact Phone</span>
                  <input
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                  />
                </label>
              </div>
              <button
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60"
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
