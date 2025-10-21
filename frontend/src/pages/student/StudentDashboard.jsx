import { useEffect, useState } from "react";
import { getMyStudent, updateMyStudent } from "../../api/students";
import { Calendar, BookOpen, CheckCircle2, Clock, Bell, TrendingUp, FileText, AlertCircle, MessageSquare, MessageCircle, Users } from "lucide-react";
import Loader from "../../components/ui/Loader";
import Empty from "../../components/ui/Empty";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [form, setForm] = useState({
    phone: "",
    year: "",
    about: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        const res = await getMyStudent();
        if (!alive) return;
        setStudent(res.student || null);
        setForm((f) => ({
          ...f,
          phone: res.student?.phone || "",
          year: res.student?.year || "",
          about: res.student?.about || "",
          emergencyContactName: res.student?.emergencyContact?.name || "",
          emergencyContactPhone: res.student?.emergencyContact?.phone || "",
        }));
      } catch (err) {
        setError(err?.friendlyMessage || err?.message || "Failed to load your profile.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function onSave(e) {
    e?.preventDefault();
    setSaving(true);
    setError("");
    const patch = {
      phone: form.phone,
      year: form.year,
      about: form.about,
      emergencyContact: {
        name: form.emergencyContactName,
        phone: form.emergencyContactPhone,
      },
    };
    const prev = student;
    try {
      setStudent((s) => ({ ...s, ...patch }));
      const res = await updateMyStudent(patch);
      setStudent(res.student || prev);
    } catch (err) {
      setStudent(prev);
      setError(err?.friendlyMessage || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  // Mock data 
  const currentCourses = student?.courses || [];
  const completedCourses = []; // Add completed courses from API
  const upcomingEvents = [
    { id: 1, title: "Assignment Due: React Project", date: "2025-10-25", type: "assignment" },
    { id: 2, title: "Midterm Exam: Database Systems", date: "2025-10-28", type: "exam" },
    { id: 3, title: "Group Presentation", date: "2025-10-30", type: "presentation" },
  ];
  const recentGrades = [
    { course: "Web Development", assignment: "Project 1", grade: "A-", date: "2025-10-15" },
    { course: "Data Structures", assignment: "Quiz 3", grade: "B+", date: "2025-10-12" },
  ];

  // Forum notifications 
  const forumNotifications = [
    { id: 1, type: "reply", thread: "Help with React Hooks", author: "John Doe", time: "2 hours ago", unread: true },
    { id: 2, type: "mention", thread: "Group Project Discussion", author: "Jane Smith", time: "5 hours ago", unread: true },
    { id: 3, type: "reply", thread: "Database Assignment Help", author: "Mike Johnson", time: "1 day ago", unread: false },
  ];

  const unreadMessages = 3; // Replace with real count from API
  const unreadForumNotifs = forumNotifications.filter(n => n.unread).length;

  // Calendar state
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
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  if (loading) return <Loader label="Fetching your student profile..." />;
  if (!student) return <Empty title="No student profile" hint="Ask admin to attach your user to a student record." />;

  const stats = [
    { label: "Current Courses", value: currentCourses.length, icon: BookOpen, color: "bg-primary" },
    { label: "Completed", value: completedCourses.length, icon: CheckCircle2, color: "bg-accent" },
    { label: "Upcoming Events", value: upcomingEvents.length, icon: Calendar, color: "bg-lavender" },
    { label: "Average Grade", value: "B+", icon: TrendingUp, color: "bg-redbrown" },
  ];

  return (
    <div className="min-h-screen bg-cream">
 
      <div className="bg-primary border-b-4 border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-cream">Welcome back, {student.name || student.fullName || "Student"}</h1>
              <p className="text-beige mt-1">Here's what's happening with your courses</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Messages */}
              <button 
                onClick={() => window.location.href = '/student/messages'}
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
                onClick={() => window.location.href = '/student/forums'}
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
        {error && (
          <div className="mb-6 rounded-lg border-2 border-redbrown/60 p-4 text-sm text-redbrown bg-cream flex items-start gap-2 shadow-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

    
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 hover:border-primary/30 transition">
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
            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-primary flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Academic Calendar
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                    className="px-3 py-1 border-2 border-primary rounded-lg hover:bg-lavender/20 transition text-primary font-bold"
                  >
                    ←
                  </button>
                  <span className="px-4 py-1 font-heading font-bold text-primary">{monthNames[month]} {year}</span>
                  <button 
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    className="px-3 py-1 border-2 border-primary rounded-lg hover:bg-lavender/20 transition text-primary font-bold"
                  >
                    →
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-sm font-heading font-semibold text-primary-800 py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const isToday = new Date().getDate() === day && 
                                  new Date().getMonth() === month && 
                                  new Date().getFullYear() === year;
                  return (
                    <div
                      key={day}
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm cursor-pointer transition font-medium ${
                        isToday 
                          ? "bg-accent text-primary-900 font-bold shadow-md" 
                          : "hover:bg-lavender/30 text-primary-800"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Courses */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Current Courses
              </h2>
              {currentCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {currentCourses.map((course) => (
                    <div key={course._id || course.id} className="border-2 border-lavender/30 rounded-lg p-4 hover:shadow-md hover:border-lavender transition bg-cream/30">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-heading font-semibold text-primary">{course.code}</h3>
                          <p className="text-sm text-primary-800 font-sans">{course.name}</p>
                        </div>
                        <span className="px-2 py-1 bg-accent text-primary-900 text-xs rounded-full font-button font-medium">Active</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-primary-800 mb-1 font-sans">
                          <span>Progress</span>
                          <span className="font-bold">65%</span>
                        </div>
                        <div className="w-full bg-beige rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: "65%" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty title="No courses" hint="Once your admin enrolls you, they'll appear here." />
              )}
            </div>

            {/* Completed Courses */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h2 className="text-xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Completed Courses
              </h2>
              {completedCourses.length > 0 ? (
                <div className="space-y-3">
                  {completedCourses.map((course) => (
                    <div key={course._id} className="flex items-center justify-between p-3 border-2 border-lavender/30 rounded-lg hover:border-lavender transition">
                      <div>
                        <h3 className="font-heading font-medium text-primary">{course.code} — {course.name}</h3>
                        <p className="text-sm text-primary-800 font-sans">Completed: {course.completedDate}</p>
                      </div>
                      <span className="px-3 py-1 bg-accent text-primary-900 font-heading font-bold rounded-lg">
                        {course.grade}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-primary-800">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="font-sans">No completed courses yet</p>
                </div>
              )}
            </div>
          </div>

        
          <div className="space-y-8">
            {/* Profile */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-cream text-2xl font-heading font-bold shadow-lg">
                  {(student.name || student.fullName || "S")[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-primary">{student.name || student.fullName}</h3>
                  <p className="text-sm text-primary-800 font-sans">Year {student.year || "—"}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm font-sans">
                <div className="flex justify-between">
                  <span className="text-primary-800">Student #:</span>
                  <span className="font-medium text-primary">{student.studentNumber ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-800">Email:</span>
                  <span className="font-medium text-primary text-xs">{student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-800">Phone:</span>
                  <span className="font-medium text-primary">{student.phone || "—"}</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab("profile")}
                className="w-full mt-4 px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-lavender/20 transition font-button font-medium"
              >
                Edit Profile
              </button>
            </div>

            {/* Forum Notifications */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-primary flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Forum Activity
                </h2>
                <button 
                  onClick={() => navigate('/student/forums')}
                  className="text-xs font-button text-primary hover:text-accent transition font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {forumNotifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-lg border-l-4 cursor-pointer transition ${
                      notif.unread 
                        ? "bg-lavender/20 border-accent" 
                        : "bg-cream/50 border-beige"
                    }`}
                    onClick={() => navigate('/student/forums')}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-heading font-medium text-sm text-primary line-clamp-1">{notif.thread}</p>
                      {notif.unread && (
                        <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-1.5 ml-2" />
                      )}
                    </div>
                    <p className="text-xs text-primary-800 font-sans">
                      {notif.type === 'reply' ? '💬' : '@'} {notif.author} • {notif.time}
                    </p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/student/forums')}
                className="w-full mt-4 px-4 py-2 bg-lavender text-primary-900 rounded-lg hover:bg-lavender/80 transition font-button font-medium"
              >
                Go to Forums
              </button>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h2 className="text-lg font-heading font-bold text-primary mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming
              </h2>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="p-3 bg-cream/50 rounded-lg border-l-4 border-accent">
                    <p className="font-heading font-medium text-sm text-primary">{event.title}</p>
                    <p className="text-xs text-primary-800 mt-1 font-sans">{event.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
              <h2 className="text-lg font-heading font-bold text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Grades
              </h2>
              <div className="space-y-3">
                {recentGrades.map((grade, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-cream/50 rounded-lg">
                    <div>
                      <p className="font-heading font-medium text-sm text-primary">{grade.assignment}</p>
                      <p className="text-xs text-primary-800 font-sans">{grade.course}</p>
                    </div>
                    <span className="px-3 py-1 bg-accent text-primary-900 font-heading font-bold rounded-lg">
                      {grade.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit */}
        {activeTab === "profile" && (
          <div className="fixed inset-0 bg-primary-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-primary">
              <div className="p-6 border-b-2 border-primary/20 flex items-center justify-between bg-cream">
                <h2 className="text-2xl font-heading font-bold text-primary">Edit Profile</h2>
                <button 
                  onClick={() => setActiveTab("overview")}
                  className="text-primary-800 hover:text-redbrown text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-heading font-medium text-primary">Phone</span>
                    <input 
                      className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 focus:ring-2 focus:ring-accent focus:border-accent font-sans" 
                      value={form.phone}
                      onChange={(e)=>setForm({...form, phone:e.target.value})}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-heading font-medium text-primary">Year</span>
                    <input 
                      className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 focus:ring-2 focus:ring-accent focus:border-accent font-sans" 
                      value={form.year}
                      onChange={(e)=>setForm({...form, year:e.target.value})}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-heading font-medium text-primary">About</span>
                  <textarea 
                    className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 focus:ring-2 focus:ring-accent focus:border-accent font-sans" 
                    rows="4" 
                    value={form.about}
                    onChange={(e)=>setForm({...form, about:e.target.value})}
                  />
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-heading font-medium text-primary">Emergency Contact Name</span>
                    <input 
                      className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 focus:ring-2 focus:ring-accent focus:border-accent font-sans" 
                      value={form.emergencyContactName}
                      onChange={(e)=>setForm({...form, emergencyContactName:e.target.value})}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-heading font-medium text-primary">Emergency Contact Phone</span>
                    <input 
                      className="mt-1 w-full rounded-lg border-2 border-primary/30 px-4 py-2 focus:ring-2 focus:ring-accent focus:border-accent font-sans" 
                      value={form.emergencyContactPhone}
                      onChange={(e)=>setForm({...form, emergencyContactPhone:e.target.value})}
                    />
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={onSave}
                    className="flex-1 px-6 py-3 rounded-lg bg-primary text-cream font-button font-bold hover:bg-primary-800 disabled:opacity-60 transition shadow-lg" 
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className="px-6 py-3 rounded-lg border-2 border-primary text-primary font-button font-medium hover:bg-lavender/20 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}