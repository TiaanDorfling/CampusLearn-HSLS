import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MessagesDrawer from "../../components/messages/MessagesDrawer";
import ScheduleTable from "../../components/schedule/ScheduleTable";
import { getTutorHome, getMyTeachingSchedule, getUnreadPreview } from "../../api/home";

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
        const r = await getTutorHome(); // aggregated endpoint
        if (!alive) return;
        setNextSession(r?.nextSession || null);
        setSchedule(Array.isArray(r?.schedule) ? r.schedule : []);
        setUnread(Array.isArray(r?.unread?.items) ? r.unread.items : []);
      } catch {
        // fallback if backend route not ready
        try {
          const [sched, msgs] = await Promise.all([getMyTeachingSchedule(), getUnreadPreview(3)]);
          if (!alive) return;
          setSchedule(Array.isArray(sched?.events) ? sched.events : []);
          setUnread(Array.isArray(msgs?.items) ? msgs.items : []);
          setNextSession(findNextFromSchedule(sched?.events || []));
        } catch (e2) {
          setError(e2.message || "Failed to load home.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section
        className="
          rounded-2xl p-6 md:p-8
          bg-white
          border border-primary/10 shadow-sm
          bg-[linear-gradient(90deg,rgba(185,174,229,0.6),rgba(255,243,224,0.7),white)]
        "
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading text-primary">
              Welcome back, Tutor 👋
            </h1>
            <p className="text-primary/70 mt-1">
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

        {/* Quick actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <QuickAction onClick={() => nav("/app/tutor/dashboard")} label="Open Dashboard" />
          <QuickAction onClick={() => nav("/app/messages")} label="Messages" />
          <QuickAction onClick={() => nav("/app/forum")} label="Forum" />
          <QuickAction onClick={() => nav("/app/tutor/library")} label="Materials Library" />
          <QuickAction onClick={() => nav("/app/settings")} label="Settings" />
        </div>
      </section>

      {error && (
        <div className="rounded border border-red-400/60 p-3 text-sm text-red-700 bg-red-50">{error}</div>
      )}

      {/* MAIN GRID */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Next teaching session */}
          {nextSession && (
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Next Session</h3>
                <span className="text-xs text-primary/60">Local time</span>
              </div>
              <div className="mt-3 rounded-xl border bg-white p-4">
                <div className="text-lg font-semibold">{nextSession.title}</div>
                <div className="text-sm">{nextSession.day} {nextSession.start}–{nextSession.end}</div>
                <div className="text-sm text-primary/70">{nextSession.location}</div>
              </div>
            </Card>
          )}

          {/* Recent student messages */}
          {unread.length > 0 && (
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent student messages</h3>
                <button className="text-sm underline" onClick={() => nav("/app/messages")}>
                  View all
                </button>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {unread.map(m => (
                  <li key={m._id} className="rounded-lg border p-3 hover:bg-cream/50 transition">
                    <div className="font-medium">{m.senderName || "Student"}</div>
                    <div className="text-primary/60">
                      {m.subject || m.body?.slice(0, 60)}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Right column: weekly schedule */}
        {schedule.length > 0 && (
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">This Week’s Teaching Schedule</h3>
                <button className="text-sm underline" onClick={() => nav("/app/tutor/dashboard")}>
                  Open full schedule
                </button>
              </div>
              <div className="mt-3">
                <ScheduleTable events={schedule} startHour={8} endHour={18} />
              </div>
            </Card>
          </div>
        )}
      </section>

      <MessagesDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}

/* Helpers (reused from student home) */
function Stat({ label, value, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="rounded-xl border bg-white p-3 text-left shadow-sm hover:shadow transition">
      <div className="text-[11px] uppercase tracking-wide text-primary/60">{label}</div>
      <div className="text-base font-semibold text-primary">{value}</div>
    </button>
  );
}
function QuickAction({ label, onClick }) {
  return (
    <button onClick={onClick} className="px-3 py-1.5 rounded-lg border bg-white shadow-sm hover:bg-cream transition">
      {label}
    </button>
  );
}
function Card({ children }) {
  return <div className="rounded-2xl border bg-white p-5 shadow-sm">{children}</div>;
}
function countToday(events) {
  const today = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
  return (events || []).filter(e => (e.day || "").slice(0,3) === today.slice(0,3)).length;
}
function findNextFromSchedule(events) {
  const now = new Date();
  const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()].slice(0,3);
  const mins = now.getHours() * 60 + now.getMinutes();
  const today = (events || []).filter(e => (e.day || "").slice(0,3).toLowerCase() === weekday.toLowerCase());
  const future = today
    .map(e => ({ ...e, m: parseInt(e.start.split(":")[0]) * 60 + parseInt(e.start.split(":")[1]) }))
    .filter(e => e.m >= mins)
    .sort((a,b)=>a.m-b.m);
  return future[0] || null;
}
