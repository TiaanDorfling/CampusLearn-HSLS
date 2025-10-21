import { useEffect, useState } from "react";
import { getMyTutor, getTutorStudents } from "../../api/tutors";
import { Calendar, BookOpen, Users, Clock, Bell, MessageSquare, MessageCircle, FileText, AlertCircle, Search, GraduationCap } from "lucide-react";
import Loader from "../../components/ui/Loader";
import Empty from "../../components/ui/Empty";

export default function TutorDashboard() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [list, setList] = useState({ items: [], total: 0, page: 1 });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Load tutor info and student list when the page first loads
    let alive = true;
    (async () => {
      try {
        const res = await getMyTutor();
        if (!alive) return;
        setTutor(res.tutor);

        // Once we have the tutor, load their students
        if (res.tutor?._id) {
          const ls = await getTutorStudents(res.tutor._id, { page: 1, q: "" });
          if (!alive) return;
          setList(ls);
        }
      } catch (err) {
        setError(err?.friendlyMessage || "Failed to load tutor dashboard.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    // Cleanup in case the component unmounts during fetch
    return () => { alive = false; };
  }, []);

  async function onSearch(e) {
    e?.preventDefault();
    if (!tutor?._id) return;
    const ls = await getTutorStudents(tutor._id, { page: 1, q });
    setList(ls);
  }

  // Temporary demo data (replace with API data later)
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
  const unreadForumNotifs = forumNotifications.filter(n => n.unread).length;

  // Calendar state and helpers
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

  if (loading) return <Loader label="Loading tutor dashboard..." />;
  if (error) return (
    <div className="p-4 text-redbrown bg-cream border-2 border-redbrown rounded-lg flex items-center gap-2">
      <AlertCircle className="w-5 h-5" />
      {error}
    </div>
  );
  if (!tutor) return <Empty title="No tutor profile" />;

  const stats = [
    { label: "Courses Teaching", value: tutor.courses?.length || 0, icon: BookOpen, color: "bg-primary" },
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
              {/* Quick access buttons for messages, forums, and alerts */}
              
              {/* Messages */}
              <button 
                onClick={() => window.location.href = '/tutor/messages'}
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
              
              {/* Forums */}
              <button 
                onClick={() => window.location.href = '/tutor/forums'}
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

              {/* Alerts */}
              <button className="relative flex items-center gap-2 px-4 py-2 bg-primary-800 text-cream rounded-lg hover:bg-primary-900 transition font-button font-medium shadow-lg">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Alerts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick overview cards */}
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

        {/* Main content area */}
        <div className="grid lg:grid-cols-3 gap-8">
    
          <div className="lg:col-span-2 space-y-8">
            {/* Teaching calendar */}
            ...
            {/* Courses section */}
            ...
            {/* Student list */}
            ...
          </div>

          <div className="space-y-8">
            {/* Tutor profile summary */}
            ...
            {/* Forum notifications */}
            ...
            {/* Upcoming classes */}
            ...
            {/* Pending assignments */}
            ...
            {/* Recent activity */}
            ...
          </div>
        </div>
      </div>
    </div>
  );
}
