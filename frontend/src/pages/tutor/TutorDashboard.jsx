// frontend/src/pages/tutor/TutorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import adminapi from "../../api/adminapi";
import {
  Calendar,
  BookOpen,
  Users,
  Clock,
  Bell,
  MessageSquare,
  FileText,
  AlertCircle,
  Plus,
  UserPlus,
} from "lucide-react";
import Loader from "../../components/ui/Loader";
import Empty from "../../components/ui/Empty";

export default function TutorDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [list, setList] = useState({ items: [], total: 0, page: 1 });
  const [activeTab, setActiveTab] = useState("overview");

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesErr, setCoursesErr] = useState("");

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    year: "",
    semester: "",
  });

  const [selectedCourse, setSelectedCourse] = useState("");
  const [studentQ, setStudentQ] = useState("");
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [studentMatches, setStudentMatches] = useState([]);
  const [assigningId, setAssigningId] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        const auth = getLocalAuth();
        const user = auth?.user;
        if (!user || String(user.role).toLowerCase() !== "tutor") {
          const discovered = await discoverCurrentTutor();
          if (!alive) return;
          if (!discovered) {
            setTutor(null);
            setList({ items: [], total: 0, page: 1 });
            setCourses([]);
            return;
          }
          setTutor(discovered);
          const ls = await fetchTutorStudents(discovered._id || discovered.id, { page: 1, q: "" });
          if (!alive) return;
          setList(ls);
          await hydrateTutorCourses(discovered._id || discovered.id);
          return;
        }
        let me = user;
        try {
          const full = await adminapi.tutors.get(user._id || user.id);
          me = normalizeTutor(full) || user;
        } catch {}
        if (!alive) return;
        setTutor(me);
        const ls = await fetchTutorStudents(me._id || me.id, { page: 1, q: "" });
        if (!alive) return;
        setList(ls);
        await hydrateTutorCourses(me._id || me.id);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load tutor dashboard."
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function hydrateTutorCourses(tutorId) {
    setCoursesLoading(true);
    setCoursesErr("");
    try {
      const res = await fetchTutorCourses(tutorId);
      setCourses(res.items || []);
    } catch (e) {
      setCoursesErr(e?.message || "Failed to load courses.");
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }

  async function onSearch(e) {
    e?.preventDefault();
    if (!tutor?._id && !tutor?.id) return;
    const ls = await fetchTutorStudents(tutor._id || tutor.id, { page: 1, q });
    setList(ls);
  }

  async function onCreateCourse(e) {
    e.preventDefault();
    if (!tutor?._id && !tutor?.id) return;
    setCreating(true);
    try {
      const payload = {
        code: form.code || undefined,
        title: form.title || form.name || undefined,
        name: form.title || undefined,
        description: form.description || undefined,
        year: form.year || undefined,
        semester: form.semester || undefined,
        tutors: [tutor._id || tutor.id],
        tutorId: tutor._id || tutor.id,
      };
      await adminapi.courses.create(payload);
      setForm({ code: "", title: "", description: "", year: "", semester: "" });
      await hydrateTutorCourses(tutor._id || tutor.id);
      alert("Course created.");
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Failed to create course.");
    } finally {
      setCreating(false);
    }
  }

  async function onFindStudents(e) {
    e?.preventDefault();
    setSearchingStudents(true);
    try {
      const { items } = await adminapi.students.list({ page: 1, pageSize: 20, q: studentQ });
      setStudentMatches(items || []);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Failed to search students.");
      setStudentMatches([]);
    } finally {
      setSearchingStudents(false);
    }
  }

  async function onAssignStudent(studentId) {
    if (!selectedCourse) {
      alert("Select a course first.");
      return;
    }
    setAssigningId(studentId);
    try {
      await adminapi.courses.enroll(selectedCourse, studentId);
      await hydrateTutorCourses(tutor._id || tutor.id);
      alert("Student assigned to course.");
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Failed to assign student.");
    } finally {
      setAssigningId("");
    }
  }

  const upcomingClasses = [
    { id: 1, course: "Web Development 301", time: "10:00 AM", date: "2025-10-22", room: "Room 204" },
    { id: 2, course: "Database Systems 202", time: "2:00 PM", date: "2025-10-23", room: "Lab 3" },
    { id: 3, course: "React Advanced", time: "11:00 AM", date: "2025-10-24", room: "Room 305" },
  ];

  const pendingAssignments = [
    { id: 1, course: "Web Development 301", title: "React Project", dueDate: "2025-10-25", submissions: 24, total: 30 },
    { id: 2, course: "Database Systems 202", title: "SQL Quiz", dueDate: "2025-10-26", submissions: 18, total: 25 },
  ];

  const recentActivity = [
    { id: 1, type: "submission", student: "John Doe", action: "submitted React Project", time: "2 hours ago" },
    { id: 2, type: "question", student: "Jane Smith", action: "asked a question in forum", time: "3 hours ago" },
    { id: 3, type: "submission", student: "Mike Johnson", action: "submitted SQL Quiz", time: "5 hours ago" },
  ];

  const forumNotifications = [
    { id: 1, type: "question", thread: "Help with React Hooks", student: "Sarah Lee", time: "1 hour ago", unread: true },
    { id: 2, type: "reply", thread: "Database Normalization", student: "Tom Wilson", time: "4 hours ago", unread: true },
    { id: 3, type: "question", thread: "Assignment Clarification", student: "Emma Brown", time: "1 day ago", unread: false },
  ];

  const unreadMessages = 5;
  const unreadForumNotifs = forumNotifications.filter((n) => n.unread).length;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };
  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  if (loading) return <Loader label="Loading tutor dashboard..." />;
  if (error) {
    return (
      <div className="p-4 text-redbrown bg-cream border-2 border-redbrown rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }
  if (!tutor) return <Empty title="No tutor profile" />;

  const stats = [
    { label: "Courses Teaching", value: courses.length || tutor.courses?.length || 0, icon: BookOpen, color: "bg-primary" },
    { label: "Total Students", value: list.total || 0, icon: Users, color: "bg-accent" },
    { label: "Pending Reviews", value: pendingAssignments.length, icon: FileText, color: "bg-lavender" },
    { label: "Upcoming Classes", value: upcomingClasses.length, icon: Clock, color: "bg-redbrown" },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-primary border-b-4 border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-cream">Welcome back, {tutor.name}</h1>
              <p className="text-beige mt-1">Manage your courses and students</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/app/messages")}
                className="relative flex items-center gap-2 px-4 py-2 bg-accent text-primary-900 rounded-lg hover:bg-accent/90 transition font-button font-medium shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-redbrown text-cream text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/app/forum")}
                className="relative flex items-center gap-2 px-4 py-2 bg-lavender text-primary-900 rounded-lg hover:bg-lavender/90 transition font-button font-medium shadow-lg"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Forums</span>
                {unreadForumNotifs > 0 && (
                  <span className="absolute -top-2 -right-2 bg-redbrown text-cream text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {unreadForumNotifs}
                  </span>
                )}
              </button>

              <button className="relative flex items-center gap-2 px-4 py-2 bg-primary-800 text-cream rounded-lg hover:bg-primary-900 transition font-button font-medium shadow-lg">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Alerts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 hover:border-primary/30 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-800 text-sm font-medium font-sans">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold text-primary mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
                  <stat.icon className="w-6 h-6 text-cream" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-heading font-bold text-primary">My Courses</h2>
                  <p className="text-primary-800/70 text-sm">
                    Total: {courses.length}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-5 gap-3 mb-4">
                <input
                  className="rounded-lg border-2 border-primary/20 px-3 py-2 md:col-span-1"
                  placeholder="Code (e.g. SEN381)"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
                <input
                  className="rounded-lg border-2 border-primary/20 px-3 py-2 md:col-span-2"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <input
                  className="rounded-lg border-2 border-primary/20 px-3 py-2 md:col-span-2"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <input
                  className="rounded-lg border-2 border-primary/20 px-3 py-2"
                  placeholder="Year"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
                <input
                  className="rounded-lg border-2 border-primary/20 px-3 py-2"
                  placeholder="Semester"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                />
                <button
                  onClick={onCreateCourse}
                  disabled={creating || !form.title}
                  className="md:col-span-5 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-primary-900 font-button font-medium hover:bg-accent/90 transition disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  {creating ? "Creating…" : "Add Course"}
                </button>
              </div>

              {coursesLoading ? (
                <div className="text-sm text-primary-800/70">Loading your courses…</div>
              ) : coursesErr ? (
                <div className="text-sm text-redbrown">{coursesErr}</div>
              ) : courses.length ? (
                <div className="rounded-xl border-2 border-primary/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-sans">
                      <thead>
                        <tr className="border-b-2 border-primary/20 bg-lavender/20">
                          <th className="py-3 px-4 text-left font-heading font-semibold text-primary">Code</th>
                          <th className="py-3 px-4 text-left font-heading font-semibold text-primary">Title</th>
                          <th className="py-3 px-4 text-left font-heading font-semibold text-primary">Year</th>
                          <th className="py-3 px-4 text-left font-heading font-semibold text-primary">Semester</th>
                          <th className="py-3 px-4 text-left font-heading font-semibold text-primary">Students</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((c) => (
                          <tr key={c._id || c.id} className="border-b border-primary/10 hover:bg-lavender/5 transition">
                            <td className="py-3 px-4 text-primary-800">{c.code || "—"}</td>
                            <td className="py-3 px-4 text-primary-800">{c.title || c.name || "—"}</td>
                            <td className="py-3 px-4 text-primary-800">{c.year || "—"}</td>
                            <td className="py-3 px-4 text-primary-800">{c.semester || "—"}</td>
                            <td className="py-3 px-4 text-primary-800">
                              {Array.isArray(c.students) ? c.students.length : (c.studentCount ?? 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 text-sm text-primary-800/70">
                  No courses yet.
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-heading font-bold text-primary">Assign Students to a Course</h2>
              </div>
              <div className="grid md:grid-cols-5 gap-3 mb-4">
                <select
                  className="rounded-lg border-2 border-primary/20 px-3 py-2 md:col-span-2"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Select course…</option>
                  {courses.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {(c.code || "") + " " + (c.title || c.name || "")}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded-lg border-2 border-primary/20 px-3 py-2 md:col-span-2"
                  placeholder="Search students by name/email/id"
                  value={studentQ}
                  onChange={(e) => setStudentQ(e.target.value)}
                />
                <button
                  onClick={onFindStudents}
                  disabled={searchingStudents}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition disabled:opacity-60"
                >
                  {searchingStudents ? "Searching…" : "Search"}
                </button>
              </div>
              {studentMatches.length > 0 ? (
                <div className="rounded-xl border-2 border-primary/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-sans">
                      <thead>
                        <tr className="border-b-2 border-primary/20 bg-lavender/20">
                          <th className="py-3 px-4 text-left font-heading font-semibold text-primary">Student</th>
                          <th className="py-3 px-4 text-left font-heading font-semibold text-primary">Email</th>
                          <th className="py-3 px-4 text-left font-heading font-semibold text-primary">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentMatches.map((s) => (
                          <tr key={s._id || s.id} className="border-b border-primary/10">
                            <td className="py-3 px-4 text-primary-800">{s.name || s.fullName || "Student"}</td>
                            <td className="py-3 px-4 text-primary-800">{s.email || "—"}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => onAssignStudent(s._id || s.id)}
                                disabled={assigningId === (s._id || s.id)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-primary-900 font-button hover:bg-accent/90 transition disabled:opacity-60"
                              >
                                <UserPlus className="w-4 h-4" />
                                {assigningId === (s._id || s.id) ? "Assigning…" : "Assign"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-primary-800/70">No results.</div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h3 className="text-lg font-heading font-bold text-primary mb-2">Tutor Profile</h3>
              <div className="text-sm">
                <div><span className="text-primary-800/70">Name:</span> <span className="font-heading text-primary">{tutor.name}</span></div>
                <div><span className="text-primary-800/70">Email:</span> <span className="font-heading text-primary">{tutor.email || "—"}</span></div>
                <div><span className="text-primary-800/70">Courses:</span> <span className="font-heading text-primary">{courses.length || tutor.courses?.length || 0}</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h3 className="text-lg font-heading font-bold text-primary mb-4">Forum Notifications</h3>
              <div className="space-y-3">
                {forumNotifications.map((n) => (
                  <div key={n.id} className={`p-3 rounded-lg border-2 ${n.unread ? "border-accent bg-accent/10" : "border-primary/10"}`}>
                    <div className="text-sm font-heading text-primary">{n.thread}</div>
                    <div className="text-xs text-primary-800/70">{n.type} by {n.student} • {n.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h3 className="text-lg font-heading font-bold text-primary mb-4">Upcoming Classes</h3>
              <ul className="space-y-2 text-sm">
                {upcomingClasses.map((c) => (
                  <li key={c.id} className="p-3 rounded-lg border-2 border-primary/10 bg-cream/50">
                    <div className="font-heading text-primary">{c.course}</div>
                    <div className="text-primary-800/70">{c.date} • {c.time} • {c.room}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h3 className="text-lg font-heading font-bold text-primary mb-4">Pending Assignments</h3>
              <ul className="space-y-2 text-sm">
                {pendingAssignments.map((a) => (
                  <li key={a.id} className="p-3 rounded-lg border-2 border-primary/10 bg-cream/50">
                    <div className="font-heading text-primary">{a.title} — {a.course}</div>
                    <div className="text-primary-800/70">Due {a.dueDate} • {a.submissions}/{a.total} submissions</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h3 className="text-lg font-heading font-bold text-primary mb-4">Recent Activity</h3>
              <ul className="space-y-2 text-sm">
                {recentActivity.map((r) => (
                  <li key={r.id} className="p-3 rounded-lg border-2 border-primary/10 bg-cream/50">
                    <div className="font-heading text-primary">{r.student}</div>
                    <div className="text-primary-800/70">{r.action} • {r.time}</div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function getLocalAuth() {
  try {
    return JSON.parse(localStorage.getItem("cl_auth") || "null");
  } catch {
    return null;
  }
}

function normalizeTutor(data) {
  return data?.tutor || data?.data || data;
}

async function discoverCurrentTutor() {
  const auth = getLocalAuth();
  const user = auth?.user;
  if (!user) return null;
  if (user._id || user.id) {
    try {
      const t = await adminapi.tutors.get(user._id || user.id);
      const norm = normalizeTutor(t);
      if (norm && String(norm.role || user.role).toLowerCase() === "tutor") return norm;
    } catch {}
  }
  if (user.email) {
    try {
      const { items } = await adminapi.tutors.list({ page: 1, q: user.email });
      if (Array.isArray(items) && items.length) return items[0];
    } catch {}
  }
  return null;
}

async function fetchTutorStudents(tutorId, { page = 1, q = "" } = {}) {
  if (!tutorId) return { items: [], total: 0, page: 1 };
  const candidates = [
    `/admin/tutors/${tutorId}/students`,
    `/tutors/${tutorId}/students`,
    `/tutor/${tutorId}/students`,
    `/admin/students?tutorId=${encodeURIComponent(tutorId)}&page=${page}&q=${encodeURIComponent(q)}`,
    `/students?tutorId=${encodeURIComponent(tutorId)}&page=${page}&q=${encodeURIComponent(q)}`,
  ];
  for (const path of candidates) {
    try {
      const { data } = await api.get(path);
      const items = data?.items || data?.students || data?.data || [];
      const total = data?.total ?? (Array.isArray(items) ? items.length : 0);
      return { items: Array.isArray(items) ? items : [], total, page };
    } catch {}
  }
  return { items: [], total: 0, page };
}

async function fetchTutorCourses(tutorId) {
  if (!tutorId) return { items: [], total: 0, page: 1 };
  const candidates = [
    `/admin/tutors/${tutorId}/courses`,
    `/tutors/${tutorId}/courses`,
    `/tutor/${tutorId}/courses`,
    `/admin/courses?tutor=${encodeURIComponent(tutorId)}`,
    `/admin/courses?teacher=${encodeURIComponent(tutorId)}`,
    `/admin/courses?instructor=${encodeURIComponent(tutorId)}`,
    `/courses?tutor=${encodeURIComponent(tutorId)}`,
  ];
  for (const path of candidates) {
    try {
      const { data } = await api.get(path);
      const items = data?.items || data?.courses || data?.data || data || [];
      const list = Array.isArray(items) ? items : (Array.isArray(data) ? data : []);
      const total = data?.total ?? (Array.isArray(list) ? list.length : 0);
      return { items: list, total, page: 1 };
    } catch {}
  }
  return { items: [], total: 0, page: 1 };
}
