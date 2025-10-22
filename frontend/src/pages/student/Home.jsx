// frontend/src/pages/student/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MessagesDrawer from "../../components/messages/MessagesDrawer";
import { getUnreadPreview } from "../../api/home";
import StudentAssistantCard from "../../components/assistant/StudentAssistantCard.jsx";

// Images
import it1 from "../../assets/it1.jpg";
import it3 from "../../assets/it3.jpg";
import it5 from "../../assets/it5.jpg";
import it6 from "../../assets/it6.jpg";

import { MessageSquare, Bell, AlertCircle, Calendar, BookOpen } from "lucide-react";

/** Qualifications showcase */
const coursesShowcase = [
  { id: 1, title: "Bachelor of Computing (BComp)", image: it1, badges: ["4 years", "NQF 8", "≈480–506 credits", "Work-integrated learning"], blurb: "A practical, career-focused degree with strong industry input. Choose a specialisation in Data Science or Software Engineering." },
  { id: 2, title: "Bachelor of Information Technology (BIT)", image: it3, badges: ["3 years", "NQF 7", "360 credits"], blurb: "Comprehensive IT degree building a strong foundation in software development and systems." },
  { id: 22, title: "Bachelor of IT — Part-Time", image: it3, badges: ["5 years", "NQF 7", "Saturdays"], blurb: "BIT for working professionals — Saturday lectures with the same outcomes as the full-time programme." },
  { id: 4, title: "Diploma in Information Technology", image: it5, badges: ["~3 years", "NQF 6", "360 credits"], blurb: "Hands-on qualification developing core competency for fast entry into industry." },
  { id: 7, title: "Diploma for Deaf Students", image: it6, badges: ["Vocational", "Accessible learning"], blurb: "Special-support diploma programme empowering deaf students for IT careers." },
];

/** Modules table data */
const modules = [
  // Core
  { cat: "Core", subject: "Research Methods 381", code: "RSH381", nqf: 7, credits: 7, prereq: ["STA281"] },
  { cat: "Core", subject: "Database Development 381", code: "DBD381", nqf: 7, credits: 7, prereq: ["DBD281"] },
  { cat: "Core", subject: "Innovation and Leadership 321", code: "INL321", nqf: 7, credits: 5, prereq: ["INL201", "INL202"] },
  { cat: "Core", subject: "Linear Programming 381", code: "LPR381", nqf: 7, credits: 11, prereq: ["LPR281", "MAT281"] },
  { cat: "Core", subject: "Machine Learning 381", code: "MLG381", nqf: 7, credits: 7, prereq: ["STA281"] },
  { cat: "Core", subject: "Project 381", code: "PRJ381", nqf: 8, credits: 17, prereq: ["PMM281"] },
  { cat: "Core", subject: "Project Management 381", code: "PMM381", nqf: 7, credits: 7, prereq: [] },

  // Fundamentals: Software Engineering Stream
  { cat: "Fundamentals: Software Engineering Stream", subject: "Programming 381", code: "PRG381", nqf: 7, credits: 9, prereq: ["PRG282"] },
  { cat: "Fundamentals: Software Engineering Stream", subject: "Software Engineering 381", code: "SEN381", nqf: 8, credits: 30, prereq: ["PMM381", "PRG282", "SAD281"] },
  { cat: "Fundamentals: Software Engineering Stream", subject: "Web Programming 381", code: "WPR381", nqf: 7, credits: 9, prereq: ["PRG282", "WPR281"] },

  // Fundamentals: Data Science Stream
  { cat: "Fundamentals: Data Science Stream", subject: "Data Science 381", code: "BIN381", nqf: 8, credits: 30, prereq: ["DWH281", "MLG381"] },
  { cat: "Fundamentals: Data Science Stream", subject: "Database Administration 381", code: "DBA381", nqf: 7, credits: 9, prereq: ["DBD281"] },
  { cat: "Fundamentals: Data Science Stream", subject: "Statistics 381", code: "STA381", nqf: 7, credits: 9, prereq: ["STA281"] },

  // Electives
  { cat: "Electives (choose one of)", subject: "Innovation Management 381", code: "INM381", nqf: 7, credits: 11, prereq: [] },
  { cat: "Electives (choose one of)", subject: "Machine Learning 382", code: "MLG382", nqf: 7, credits: 11, prereq: ["MLG381", "PRG282"] },
  { cat: "Electives (choose one of)", subject: "User Experience Design 381", code: "UAX381", nqf: 7, credits: 11, prereq: ["PRG282", "WPR281"] },
];

/** Weekly pattern for dummy schedule (Mon=1 … Sun=0) */
const weeklySessions = [
  { dow: 1, subject: "Software Engineering 381", code: "SEN381", start: "09:00", end: "10:30", room: "B201" },
  { dow: 1, subject: "Machine Learning 381",     code: "MLG381", start: "11:00", end: "12:00", room: "Lab 1" },
  { dow: 1, subject: "Innovation & Leadership 321", code: "INL321", start: "13:00", end: "14:00", room: "C105" },

  { dow: 2, subject: "Programming 381",          code: "PRG381", start: "11:00", end: "12:30", room: "Lab 2" },
  { dow: 2, subject: "Data Science 381",         code: "BIN381", start: "14:00", end: "16:00", room: "B302" },

  { dow: 3, subject: "Project Management 381",   code: "PMM381", start: "09:00", end: "10:00", room: "A101" },
  { dow: 3, subject: "Database Development 381", code: "DBD381", start: "13:00", end: "14:30", room: "B103" },
  { dow: 3, subject: "Research Methods 381",     code: "RSH381", start: "16:00", end: "17:00", room: "Online" },

  { dow: 4, subject: "Web Programming 381",      code: "WPR381", start: "10:00", end: "11:30", room: "Lab 3" },
  { dow: 4, subject: "Database Administration 381", code: "DBA381", start: "13:00", end: "14:30", room: "B205" },

  { dow: 5, subject: "Statistics 381",           code: "STA381", start: "09:00", end: "10:30", room: "B204" },
  { dow: 5, subject: "Linear Programming 381",   code: "LPR381", start: "12:00", end: "13:30", room: "A203" },
  { dow: 5, subject: "Project 381 — Milestone",  code: "PRJ381", start: "15:00", end: "17:00", room: "Project Lab" },
];

/* ===== Dummy October schedule utils ===== */
function pad2(n){return String(n).padStart(2,"0");}
function fmtDate(d){
  const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return `${days[d.getDay()]} ${d.getDate()} ${d.toLocaleString(undefined,{month:"short"})}`;
}
function cmpTime(a,b){const [ah,am]=a.split(":").map(Number);const [bh,bm]=b.split(":").map(Number);return ah!==bh?ah-bh:am-bm;}
function buildDummyScheduleForCurrentMonth(){
  const now=new Date();
  const y=now.getFullYear(); const m=now.getMonth(); const last=new Date(y,m+1,0).getDate();
  const items=[];
  for(let day=1; day<=last; day++){
    const d=new Date(y,m,day);
    const dow=d.getDay(); // 0=Sun..6=Sat
    for(const s of weeklySessions){
      if(s.dow===dow){
        items.push({
          id:`${y}-${m+1}-${day}-${s.code}-${s.start}`,
          date:d,
          dateKey:`${y}-${pad2(m+1)}-${pad2(day)}`,
          subject:s.subject, code:s.code, start:s.start, end:s.end, room:s.room,
        });
      }
    }
  }
  items.sort((a,b)=> a.date-b.date || cmpTime(a.start,b.start));
  return items;
}
function findNextFromEvents(events){
  const now=new Date();
  for(const e of events){
    const t=new Date(e.date.getFullYear(),e.date.getMonth(),e.date.getDate(),
      Number(e.start.slice(0,2)), Number(e.start.slice(3,5)));
    if(t>=now) return e;
  } return null;
}
function countTodayFromEvents(events){
  const today=new Date();
  return events.filter(e=>e.date.getFullYear()===today.getFullYear()
    && e.date.getMonth()===today.getMonth()
    && e.date.getDate()===today.getDate()).length;
}
/* ======================================= */

export default function StudentHome(){
  const nav = useNavigate();
  const [drawer,setDrawer]=useState(false);
  const [unread,setUnread]=useState([]);

  // Build dummy schedule once (current month)
  const monthEvents = useMemo(buildDummyScheduleForCurrentMonth,[]);
  const nextClass = useMemo(()=>findNextFromEvents(monthEvents),[monthEvents]);

  // Unread preview only (no schedule fetch)
  useEffect(()=>{
    let alive=true;
    (async()=>{
      try{
        const msgs=await getUnreadPreview(3);
        if(alive) setUnread(Array.isArray(msgs?.items)?msgs.items:[]);
      }catch{/* ignore */}
    })();
    return ()=>{alive=false;};
  },[]);

  // Derived quick stats
  const todayCount = countTodayFromEvents(monthEvents);
  const unreadCount = unread.length;
  const alertCount = unreadCount > 0 ? Math.min(unreadCount, 9) : 0;

  // Group modules
<<<<<<< HEAD
  const grouped=modules.reduce((acc,m)=>{(acc[m.cat] ||= []).push(m);return acc;},{});  
  // Group events by date (for centered sections)
  const eventsByDate = monthEvents.reduce((acc,ev)=>{(acc[ev.dateKey] ||= []).push(ev);return acc;},{});  
=======
  const grouped=modules.reduce((acc,m)=>{(acc[m.cat] ||= []).push(m);return acc;},{}); // eslint-disable-line
  // Group events by date (for centered sections)
  const eventsByDate = monthEvents.reduce((acc,ev)=>{(acc[ev.dateKey] ||= []).push(ev);return acc;},{}); // eslint-disable-line
>>>>>>> 001ef1b82ee8a243818ce6868e540680baf6761d

  return (
    <div className="min-h-screen bg-cream">
      {/* Header — match Admin styling */}
      <div className="bg-primary border-b-4 border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-cream">Student Home</h1>
              <p className="text-beige mt-1">Stay on top of your classes, messages and forum activity</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => nav("/app/messages")}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-primary-900 rounded-lg hover:bg-accent/90 transition font-button font-medium shadow-lg">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
                {unreadCount > 0 && (
                  <span className="bg-redbrown text-cream text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
              </button>
              <button onClick={() => setDrawer(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-cream rounded-lg hover:bg-primary-900 transition font-button font-medium shadow-lg">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Alerts</span>
                <span className="bg-redbrown text-cream text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {alertCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* Quick Actions row — match Admin style */}
      <div className="bg-white border-b-2 border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2">
            <QuickAction onClick={()=>nav("/app/student/dashboard")} label="Open Dashboard" />
            <QuickAction onClick={()=>nav("/app/messages")} label="Messages" />
            <QuickAction onClick={()=>nav("/app/forum")} label="Forum" />
            <QuickAction onClick={()=>nav("/app/profile")} label="Profile" />
            <QuickAction onClick={()=>nav("/app/settings")} label="Settings" />
          </div>
=======
        <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
          <QuickAction onClick={()=>nav("/app/student/dashboard")} label="Open Dashboard" />
          <QuickAction onClick={()=>nav("/app/messages")} label="Messages" />
          <QuickAction onClick={()=>nav("/app/forum")} label="Forum" />
          <QuickAction onClick={()=>nav("/app/profile")} label="Profile" />
          <QuickAction onClick={()=>nav("/app/settings")} label="Settings" />
          {/* NEW: Assistant quick action */}
          <QuickAction onClick={()=>nav("/app/assistant")} label="Assistant" />
>>>>>>> 001ef1b82ee8a243818ce6868e540680baf6761d
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error banner (Admin style) */}
        {/* (Kept if you ever wire in error states) */}

        {/* Stats — same tile style as Admin */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          <StatCard icon={Calendar} color="bg-primary" label="Today’s Classes" value={todayCount} change="+0" />
          <StatCard icon={MessageSquare} color="bg-accent" label="Unread Messages" value={unreadCount} change={unreadCount ? `+${unreadCount}` : "—"} />
          <StatCard icon={BookOpen} color="bg-lavender" label="Next Class" value={nextClass ? `${nextClass.code}` : "—"} change={nextClass ? "Soon" : "—"} />
        </div>

        {/* Top row: Video + side cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-heading font-bold text-primary">Student life at Belgium Campus</h3>
              <a className="text-sm font-button text-accent hover:underline" href="https://www.youtube.com/watch?v=QPzmsQ86_HM" target="_blank" rel="noreferrer">
                View on YouTube
              </a>
            </div>
            <div className="mt-3 relative w-full pt-[56.25%] rounded-xl overflow-hidden border-2 border-primary/10">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/QPzmsQ86_HM?rel=0&modestbranding=1"
                title="Belgium Campus Student Life (YouTube)"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                frameBorder="0"
              />
            </div>
          </Card>

          <div className="space-y-8">
            {/* NEW: Quick Ask Assistant card */}
            <StudentAssistantCard />

            {nextClass && (
              <Card>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading font-bold text-primary">Next up</h3>
                  <span className="text-xs font-button text-primary-800/70">Local time</span>
                </div>
                <div className="mt-3 rounded-xl border-2 border-primary/10 bg-cream/50 p-4 text-center">
                  <div className="text-base font-heading font-semibold text-primary">{nextClass.subject}</div>
                  <div className="text-xs text-primary-800/70">{nextClass.code} • {nextClass.room}</div>
                  <div className="text-sm mt-1 font-sans">
                    {fmtDate(nextClass.date)} — {nextClass.start}–{nextClass.end}
                  </div>
                </div>
              </Card>
            )}

            {unread.length>0 && (
              <Card>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-heading font-bold text-primary">Recent messages</h3>
                  <button className="text-sm font-button text-accent hover:underline" onClick={()=>nav("/app/messages")}>View all</button>
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {unread.map(m=>(
                    <li key={m._id} className="rounded-lg border-2 border-primary/10 p-3 hover:bg-lavender/10 transition">
                      <div className="font-heading text-primary">{m.senderName || m.from || "Message"}</div>
                      <div className="text-primary-800/70 font-sans">{m.subject || m.title || m.body?.slice(0,60)}</div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {!nextClass && unread.length===0 && (
              <Card>
                <div className="flex items-center gap-2 text-primary-800">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="text-lg font-heading font-bold">Nothing urgent right now</h3>
                </div>
                <p className="text-sm text-primary-800/70 mt-2">You’re all caught up. Check your modules or browse qualifications below.</p>
              </Card>
            )}
          </div>
        </div>

        {/* October Schedule — Admin card style */}
        <Card>
          <h3 className="text-xl font-heading font-bold text-primary text-center">October Class Schedule</h3>
          <div className="mt-4 rounded-2xl border-2 border-primary/10 p-4">
            <div className="space-y-6 max-w-5xl mx-auto">
              {Object.keys(eventsByDate).map((key)=>{
                const evs=eventsByDate[key];
                const d=evs[0].date;
                return (
                  <div key={key} className="text-center">
                    <div className="inline-flex items-center gap-2 bg-cream/60 border-2 border-primary/10 rounded-full px-3 py-1 text-sm font-button text-primary">
                      <Calendar className="w-4 h-4" /> {fmtDate(d)}
                    </div>
                    <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-stretch">
                      {evs.sort((a,b)=>cmpTime(a.start,b.start)).map(e=>(
                        <div key={e.id} className="rounded-xl border-2 border-primary/10 bg-white p-4 shadow-sm">
                          <div className="text-sm font-heading text-primary">{e.subject}</div>
                          <div className="text-xs text-primary-800/70 font-sans">{e.code} • {e.room}</div>
                          <div className="mt-1 text-sm font-sans text-primary">{e.start} – {e.end}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Modules table — Admin table look */}
        <Card>
          <h3 className="text-xl font-heading font-bold text-primary mb-3">Software Engineering — Modules & Streams</h3>
          <div className="rounded-xl border-2 border-primary/10 overflow-hidden bg-white">
            <table className="table-auto w-full text-sm font-sans">
              <thead className="bg-lavender/20">
                <tr className="text-left">
                  <th className="px-4 py-3 font-heading font-semibold text-primary">Subject</th>
                  <th className="px-4 py-3 font-heading font-semibold text-primary">Code</th>
                  <th className="px-4 py-3 font-heading font-semibold text-primary">NQF</th>
                  <th className="px-4 py-3 font-heading font-semibold text-primary">Credits</th>
                  <th className="px-4 py-3 font-heading font-semibold text-primary">Prerequisites</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {Object.entries(grouped).map(([cat,rows])=>(
                  <React.Fragment key={cat}>
                    <tr className="bg-cream/60">
                      <td className="px-4 py-2 font-heading font-semibold text-primary" colSpan={5}>{cat}</td>
                    </tr>
                    {rows.map(m=>(
                      <tr key={m.code} className="hover:bg-lavender/5 transition">
                        <td className="px-4 py-3 text-primary-800">{m.subject}</td>
                        <td className="px-4 py-3 text-primary-800">{m.code}</td>
                        <td className="px-4 py-3 text-primary-800">{m.nqf}</td>
                        <td className="px-4 py-3 text-primary-800">{m.credits}</td>
                        <td className="px-4 py-3 text-primary-800">{m.prereq?.length ? m.prereq.join(", ") : "—"}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Qualifications grid — Admin card look */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-bold text-primary">What is your next study option</h3>
            <Link className="text-sm font-button text-accent hover:underline" to="/courses">See all</Link>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {coursesShowcase.map((course)=>(
              <article key={course.id} className="rounded-xl overflow-hidden bg-white border-2 border-primary/10 shadow-sm hover:border-primary/30 transition">
                <img src={course.image} alt={course.title} className="h-36 w-full object-cover" loading="lazy" />
                <div className="p-4 flex flex-col gap-2">
                  <h4 className="font-heading font-semibold text-primary text-sm">{course.title}</h4>
                  {course.badges?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {course.badges.slice(0,3).map((b,i)=>(
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full border border-primary/20 bg-cream/60">
                          {b}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-xs text-primary-800/80 font-sans">{course.blurb}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <Link to={`/courses/${course.id}#overview`} className="text-xs text-accent font-button hover:underline">View →</Link>
                    <Link to={`/courses/${course.id}#more`} className="text-[11px] text-primary-800/70 hover:underline">Read more</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <MessagesDrawer open={drawer} onClose={()=>setDrawer(false)} />
    </div>
  );
}

/* Reusable UI (Admin look) */
function StatCard({ icon:Icon, color, label, value, change }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 hover:border-primary/30 transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg shadow-md`}>
          <Icon className="w-6 h-6 text-cream" />
        </div>
        <span className={`text-xs font-button font-bold px-2 py-1 rounded-full ${
          String(change).startsWith("+") || change === "—" ? "bg-accent/20 text-accent" : "bg-redbrown/20 text-redbrown"
        }`}>{change}</span>
      </div>
      <p className="text-primary-800 text-sm font-medium font-sans">{label}</p>
      <p className="text-3xl font-heading font-bold text-primary mt-1">{value}</p>
    </div>
  );
}

function QuickAction({label,onClick}){
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-md border-2 border-primary/20 bg-white text-primary font-button hover:bg-lavender/20 transition shadow-sm">
      {label}
    </button>
  );
}

function Card({children,className=""}){
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 ${className}`}>
      {children}
    </div>
  );
}
