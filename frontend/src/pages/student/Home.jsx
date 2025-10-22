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
  const now=new Date(); // October at runtime -> October schedule
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

  // YouTube
  const ytWatchUrl="https://www.youtube.com/watch?v=QPzmsQ86_HM";
  const ytEmbedUrl="https://www.youtube.com/embed/QPzmsQ86_HM?rel=0&modestbranding=1";

  // Group modules
  const grouped=modules.reduce((acc,m)=>{(acc[m.cat] ||= []).push(m);return acc;},{}); // eslint-disable-line
  // Group events by date (for centered sections)
  const eventsByDate = monthEvents.reduce((acc,ev)=>{(acc[ev.dateKey] ||= []).push(ev);return acc;},{}); // eslint-disable-line

  return (
    <div className="max-w-screen-2xl mx-auto px-6 space-y-12">
      {/* HERO (full width, centered) */}
      <section className="rounded-3xl p-8 bg-white border border-primary/10 shadow-sm bg-[linear-gradient(90deg,rgba(185,174,229,0.6),rgba(255,243,224,0.7),white)]">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-heading text-primary">Welcome back 👋</h1>
            <p className="text-primary/70 mt-2">
              Stay on top of your classes, messages and forum activity.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto md:ml-auto">
            <Stat label="Today" value={`${countTodayFromEvents(monthEvents)} classes`} />
            {unread.length>0 && <Stat label="Unread" value={`${unread.length} msgs`} onClick={()=>setDrawer(true)}/>}
            <Stat label="Progress" value="—" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
          <QuickAction onClick={()=>nav("/app/student/dashboard")} label="Open Dashboard" />
          <QuickAction onClick={()=>nav("/app/messages")} label="Messages" />
          <QuickAction onClick={()=>nav("/app/forum")} label="Forum" />
          <QuickAction onClick={()=>nav("/app/profile")} label="Profile" />
          <QuickAction onClick={()=>nav("/app/settings")} label="Settings" />
          {/* NEW: Assistant quick action */}
          <QuickAction onClick={()=>nav("/app/assistant")} label="Assistant" />
        </div>
      </section>

      {/* WIDE CONTENT (centered, fuller) */}
      <section className="space-y-12">
        {/* Top row: Video + Quick cards */}
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Student life at Belgium Campus</h3>
              <a className="text-sm underline" href={ytWatchUrl} target="_blank" rel="noreferrer">
                View on YouTube
              </a>
            </div>
            <div className="mt-3 relative w-full pt-[56.25%] rounded-xl overflow-hidden border">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={ytEmbedUrl}
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
                  <h3 className="font-semibold">Next up</h3>
                  <span className="text-xs text-primary/60">Local time</span>
                </div>
                <div className="mt-3 rounded-xl border bg-white p-4 text-center">
                  <div className="text-base font-semibold">{nextClass.subject}</div>
                  <div className="text-xs text-primary/60">{nextClass.code} • {nextClass.room}</div>
                  <div className="text-sm mt-1">
                    {fmtDate(nextClass.date)} — {nextClass.start}–{nextClass.end}
                  </div>
                </div>
              </Card>
            )}

            {unread.length>0 && (
              <Card>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Recent messages</h3>
                  <button className="text-sm underline" onClick={()=>nav("/app/messages")}>View all</button>
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {unread.map(m=>(
                    <li key={m._id} className="rounded-lg border p-3 hover:bg-cream/50 transition">
                      <div className="font-medium">{m.senderName || m.from || "Message"}</div>
                      <div className="text-primary/60">{m.subject || m.title || m.body?.slice(0,60)}</div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>

        {/* DUMMY SCHEDULE — OCTOBER */}
        <Card>
          <h3 className="font-semibold text-center">October Class Schedule</h3>
          <div className="mt-4 rounded-2xl border p-4">
            <div className="space-y-6 max-w-5xl mx-auto">
              {Object.keys(eventsByDate).map((key)=>{
                const evs=eventsByDate[key];
                const d=evs[0].date;
                return (
                  <div key={key} className="text-center">
                    <div className="inline-flex items-center gap-2 bg-cream/60 border border-primary/10 rounded-full px-3 py-1 text-sm font-medium">
                      {fmtDate(d)}
                    </div>
                    <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 place-items-stretch">
                      {evs.sort((a,b)=>cmpTime(a.start,b.start)).map(e=>(
                        <div key={e.id} className="rounded-xl border bg-white p-4 shadow-sm">
                          <div className="text-sm font-semibold">{e.subject}</div>
                          <div className="text-xs text-primary/60">{e.code} • {e.room}</div>
                          <div className="mt-1 text-sm">{e.start} – {e.end}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Modules table (no "View" column) */}
        <Card>
          <h3 className="font-semibold mb-3">Software Engineering — Modules & Streams</h3>
          <div className="rounded-xl border overflow-hidden">
            <table className="table-auto w-full text-sm">
              <thead className="bg-cream/60">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">Subject</th>
                  <th className="px-3 py-2 font-medium">Code</th>
                  <th className="px-3 py-2 font-medium">NQF</th>
                  <th className="px-3 py-2 font-medium">Credits</th>
                  <th className="px-3 py-2 font-medium">Prerequisites</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(grouped).map(([cat,rows])=>(
                  <React.Fragment key={cat}>
                    <tr className="bg-primary/5">
                      <td className="px-3 py-2 font-semibold" colSpan={5}>{cat}</td>
                    </tr>
                    {rows.map(m=>(
                      <tr key={m.code} className="hover:bg-cream/40 align-top">
                        <td className="px-3 py-2">{m.subject}</td>
                        <td className="px-3 py-2">{m.code}</td>
                        <td className="px-3 py-2">{m.nqf}</td>
                        <td className="px-3 py-2">{m.credits}</td>
                        <td className="px-3 py-2">{m.prereq?.length ? m.prereq.join(", ") : "—"}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Qualifications grid */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">What is your next study option</h3>
            <Link className="text-sm underline" to="/courses">See all</Link>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {coursesShowcase.map((course)=>(
              <article key={course.id} className="rounded-xl overflow-hidden bg-white border shadow-sm hover:shadow transition">
                <img src={course.image} alt={course.title} className="h-36 w-full object-cover" loading="lazy" />
                <div className="p-4 flex flex-col gap-2">
                  <h4 className="font-semibold text-primary text-sm mb-1">{course.title}</h4>
                  {course.badges?.length ? (
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {course.badges.slice(0,3).map((b,i)=>(
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full border border-primary/20 bg-cream/60">
                          {b}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-xs text-primary/70">{course.blurb}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <Link to={`/courses/${course.id}#overview`} className="text-xs text-accent font-button hover:underline">View →</Link>
                    <Link to={`/courses/${course.id}#more`} className="text-[11px] text-primary/70 hover:underline">Read more</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>
      <MessagesDrawer open={drawer} onClose={()=>setDrawer(false)} />
    </div>
  );
}

/* Helpers */
function Stat({label,value,onClick}){
  return (
    <button type="button" onClick={onClick}
      className="rounded-xl border bg-white p-3 text-left shadow-sm hover:shadow transition w-full">
      <div className="text-[11px] uppercase tracking-wide text-primary/60">{label}</div>
      <div className="text-base font-semibold text-primary">{value}</div>
    </button>
  );
}
function QuickAction({label,onClick}){
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-lg border bg-white shadow-sm hover:bg-cream transition">
      {label}
    </button>
  );
}
function Card({children,className=""}){
  return <div className={`rounded-2xl border bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}
