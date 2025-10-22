import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MessagesDrawer from "../../components/messages/MessagesDrawer";
import ScheduleTable from "../../components/schedule/ScheduleTable";
import { getTutorHome } from "../../api/home";

export default function TutorHome() {
  const nav = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nextSession, setNextSession] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [unread, setUnread] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        const r = await getTutorHome();
        if (!alive) return;

        const events = normalizeEvents(Array.isArray(r?.schedule) ? r.schedule : []);
        setSchedule(events);
        setUnread(Array.isArray(r?.unread?.items) ? r.unread.items : []);
        const next = r?.nextSession || r?.nextClass || findNextFromSchedule(events);
        setNextSession(next || null);
      } catch (e) {
        console.warn("⚠️ TutorHome: failed to load data", e);
        setSchedule([]);
        setUnread([]);
        setNextSession(null);
        setError("Check out more, later!");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* HEADER —  */}
      <div className="bg-primary border-b-4 border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-cream">
                Welcome back, Tutor 👋
              </h1>
              <p className="text-beige mt-1">
                Manage your sessions, engage with students, and monitor class progress.
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <Stat label="Today" value={`${countToday(schedule)} sessions`} />
              {unread.length > 0 && (
                <Stat label="Unread" value={`${unread.length} msgs`} onClick={() => setDrawer(true)} />
              )}
              <Stat label="Students" value="—" />
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTION BAR  */}
      <div className="bg-white border-b-2 border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap gap-2">
            <QuickAction onClick={() => nav("/app/tutor/dashboard")} label="Open Dashboard" />
            <QuickAction onClick={() => nav("/app/messages")} label="Messages" />
            <QuickAction onClick={() => nav("/app/forum")} label="Forum" />
            <QuickAction onClick={() => nav("/app/settings")} label="Settings" />
          </div>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TUTORING TIPS + VIDEOS */}
        <section className="bg-white/60 border-2 border-primary/10 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-heading font-bold text-primary mb-2">✨ Tutoring Tips for Success</h2>
          <ul className="list-disc ml-5 text-primary/80 space-y-1">
            <li>🕐 Start sessions on time and keep them focused.</li>
            <li>🎯 Set clear learning goals for each class.</li>
            <li>💬 Encourage questions — active students learn better.</li>
            <li>🌱 Offer constructive feedback and track progress weekly.</li>
            <li>🤝 Build rapport — students engage more with a supportive tutor.</li>
            <li>📚 Share additional learning resources via the Materials Library.</li>
          </ul>
          <p className="mt-3 text-sm text-primary/60 italic">
            “The best tutors don’t just teach — they inspire curiosity.” 🌟
          </p>

          <div className="mt-5">
            <h3 className="text-lg font-heading font-bold text-primary mb-2">🎥 Helpful YouTube Tutorials</h3>
            <p className="text-sm text-primary/70 mb-3">
              Explore these short videos to enhance your tutoring techniques:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="https://www.google.com/search?sca_esv=514c60beb9213ab0&rlz=1C5CHFA_enZA1046ZA1046&sxsrf=AE3TifNu6epyJlY9nkZYH0DoS6eaY6cg2Q:1761164031440&udm=7&fbs=AIIjpHxU7SXXniUZfeShr2fp4giZud1z6kQpMfoEdCJxnpm_3YlUqOpj4OTU_HmqxOd8LCZRmCXZfilaEd7O0OWEblYuNA8KmxQaFtAUVBSc6CSsPE847cxUbHj0gZ4UF6TazPdWcpwZbrIx3VY12G-19H9tv1KseZFih8bYmsbyKIG72B2pTOopPlWA0DqRLaSFpeMEJRbU98h5VxjHpfPOQqcu_UrttQ&q=how+to+tutor+online&sa=X&ved=2ahUKEwj6yfCjz7iQAxUmVkEAHUPKJZoQtKgLegQIMxAB&biw=1440&bih=812&dpr=2#fpstate=ive&vld=cid:8b1e4871,vid:dTHhV1Cw-SA,st:0"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border-2 border-primary/10 bg-white hover:bg-cream/60 transition p-3 shadow-sm"
              >
                <h4 className="font-heading font-semibold text-primary text-sm mb-1">How to Be an Effective Tutor</h4>
                <p className="text-xs text-primary/60">Practical strategies for engaging and motivating students.</p>
              </a>

              <a
                href="https://www.google.com/search?sca_esv=514c60beb9213ab0&rlz=1C5CHFA_enZA1046ZA1046&sxsrf=AE3TifNu6epyJlY9nkZYH0DoS6eaY6cg2Q:1761164031440&udm=7&fbs=AIIjpHxU7SXXniUZfeShr2fp4giZud1z6kQpMfoEdCJxnpm_3YlUqOpj4OTU_HmqxOd8LCZRmCXZfilaEd7O0OWEblYuNA8KmxQaFtAUVBSc6CSsPE847cxUbHj0gZ4UF6TazPdWcpwZbrIx3VY12G-19H9tv1KseZFih8bYmsbyKIG72B2pTOopPlWA0DqRLaSFpeMEJRbU98h5VxjHpfPOQqcu_UrttQ&q=how+to+tutor+online&sa=X&ved=2ahUKEwj6yfCjz7iQAxUmVkEAHUPKJZoQtKgLegQIMxAB&biw=1440&bih=812&dpr=2#fpstate=ive&vld=cid:90992817,vid:X1aokT2yHrI,st:0"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border-2 border-primary/10 bg-white hover:bg-cream/60 transition p-3 shadow-sm"
              >
                <h4 className="font-heading font-semibold text-primary text-sm mb-1">Building Student Confidence</h4>
                <p className="text-xs text-primary/60">Tips to create a supportive and inspiring learning space.</p>
              </a>

              <a
                href="https://www.google.com/search?q=ymca+song&sca_esv=514c60beb9213ab0&rlz=1C5CHFA_enZA1046ZA1046&udm=7&biw=1440&bih=812&sxsrf=AE3TifNEBwNfacNh7SDngrv2h6RP_O0jMQ%3A1761164035090&ei=Azv5aKaeBdqmhbIP1Z-NoQo&oq=YMCH&gs_lp=EhZnd3Mtd2l6LW1vZGVsZXNzLXZpZGVvIgRZTUNIKgIIATIKEAAYgAQYChixAzIHEAAYgAQYCjIHEAAYgAQYCjIHEAAYgAQYCjIHEAAYgAQYCjIHEAAYgAQYCjIFEAAYgAQyBRAAGIAEMgcQABiABBgKSN4tUIkOWIcbcAF4AJABAJgB6gSgAe8LqgEJMi0yLjEuMC4xuAEByAEA-AEBmAIFoAKWDKgCCsICBxAjGOoCGCfCAgQQIxgnwgILEAAYgAQYsQMYgwHCAhEQABiABBiKBRiRAhixAxiDAcICDRAAGIAEGIoFGEMYsQPCAhAQABiABBiKBRhDGLEDGIMBwgILEAAYgAQYigUYhgOYAwySBwsxLjAuMi4xLjAuMaAH3RWyBwkyLTIuMS4wLjG4B4kMwgcFMi00LjHIByA&sclient=gws-wiz-modeless-video#fpstate=ive&vld=cid:9d510c22,vid:CS9OO0S5w2k,st:0"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border-2 border-primary/10 bg-white hover:bg-cream/60 transition p-3 shadow-sm"
              >
                <h4 className="font-heading font-semibold text-primary text-sm mb-1">Engaging Online Tutoring Techniques</h4>
                <p className="text-xs text-primary/60">Learn how to keep remote learners motivated and focused.</p>
              </a>
            </div>
          </div>

          <p className="mt-4 text-sm text-primary/60 italic text-center">
            “A great tutor doesn’t just teach — they help students discover their potential.” 🌟
          </p>
        </section>

        {/* ERROR BANNER  */}
        {error && (
          <div className="rounded-lg border-2 border-redbrown/60 p-3 text-sm text-redbrown bg-cream shadow-sm">
            {error}
          </div>
        )}

        {/* MAIN GRID */}
        <section className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-1">
            {nextSession && (
              <Card>
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-primary">Next Session</h3>
                  <span className="text-xs text-primary/60">Local time</span>
                </div>
                <div className="mt-3 rounded-xl border-2 border-primary/10 bg-cream/50 p-4">
                  <div className="text-lg font-heading font-semibold text-primary">
                    {nextSession.title || nextSession.subject || "Session"}
                  </div>
                  <div className="text-sm font-sans text-primary-800">
                    {nextSession.day} {nextSession.start}–{nextSession.end}
                  </div>
                  <div className="text-sm text-primary/70">
                    {nextSession.location || nextSession.room || ""}
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2" />
        </section>
      </div>

      <MessagesDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}

function Stat({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border-2 border-primary/10 bg-white p-3 text-left shadow-sm hover:border-primary/30 transition"
    >
      <div className="text-[11px] uppercase tracking-wide text-primary/60">{label}</div>
      <div className="text-base font-heading font-semibold text-primary">{value}</div>
    </button>
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
function Card({ children }) {
  return (
    <div className="rounded-2xl border-2 border-primary/10 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

function normalizeEvents(events = []) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return events.map((e) => {
    if (e.day) return e;
    if (e.date) {
      const d = new Date(e.date);
      if (!isNaN(d)) {
        return { ...e, day: days[d.getDay()] };
      }
    }
    return e;
  });
}

function countToday(events) {
  const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  return (events || []).filter((e) => (e.day || "").slice(0, 3) === today.slice(0, 3)).length;
}

function findNextFromSchedule(events) {
  const now = new Date();
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()].slice(0, 3);
  const mins = now.getHours() * 60 + now.getMinutes();
  const today = (events || []).filter(
    (e) => (e.day || "").slice(0, 3).toLowerCase() === weekday.toLowerCase()
  );
  const future = today
    .map((e) => ({
      ...e,
      m: parseInt(e.start?.split(":")[0] || 0) * 60 + parseInt(e.start?.split(":")[1] || 0),
    }))
    .filter((e) => e.m >= mins)
    .sort((a, b) => a.m - b.m);
  return future[0] || null;
}
