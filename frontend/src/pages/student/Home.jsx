import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MessagesDrawer from "../../components/messages/MessagesDrawer";
import ScheduleTable from "../../components/schedule/ScheduleTable";
import { getStudentHome, getMySchedule, getUnreadPreview } from "../../api/home";

export default function StudentHome() {
  const nav = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nextClass, setNextClass] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [unread, setUnread] = useState([]); // preview
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError("");
        // Try a single aggregated endpoint first
        const r = await getStudentHome();
        if (!alive) return;
        setNextClass(r?.nextClass || null);
        setSchedule(Array.isArray(r?.schedule) ? r.schedule : []);
        setUnread(Array.isArray(r?.unread?.items) ? r.unread.items : []);
      } catch {
        // Fallback if you haven’t built /api/home/student yet
        try {
          const [sched, msgs] = await Promise.all([getMySchedule(), getUnreadPreview(3)]);
          if (!alive) return;
          setSchedule(Array.isArray(sched?.events) ? sched.events : []);
          setUnread(Array.isArray(msgs?.items) ? msgs.items : []);
          setNextClass((sched?.nextClass) || findNextFromSchedule(sched?.events || []));
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
      <section className="rounded-2xl p-6 md:p-8 bg-linear-to-r from-lavender/60 via-cream/70 to-white border border-primary/10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading text-primary">Welcome back 👋</h1>
            <p className="text-primary/70 mt-1">
              Stay on top of your classes, messages and forum activity.
            </p>
          </div>

          {/* quick stats derived from live data */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <Stat label="Today" value={`${countToday(schedule)} classes`} />
            {unread.length > 0 && <Stat label="Unread" value={`${unread.length} msgs`} onClick={() => setDrawer(true)} />}
            <Stat label="Progress" value="—" />
          </div>
        </div>

        {/* quick actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <QuickAction onClick={() => nav("/app/student/dashboard")} label="Open Dashboard" />
          <QuickAction onClick={() => nav("/app/messages")} label="Messages" />
          <QuickAction onClick={() => nav("/app/forum")} label="Forum" />
          {/* Removed: <QuickAction onClick={() => setDrawer(true)} label="New messages" /> */}
        </div>
      </section>

      {error && (
        <div className="rounded border border-red-400/60 p-3 text-sm text-red-700 bg-red-50">{error}</div>
      )}

      {/* MAIN GRID */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Next up — ONLY if DB has one */}
          {nextClass && (
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Next up</h3>
                <span className="text-xs text-primary/60">Local time</span>
              </div>
              <div className="mt-3 rounded-xl border bg-white p-4">
                <div className="text-lg font-semibold">{nextClass.title}</div>
                <div className="text-sm">{nextClass.day} {nextClass.start}–{nextClass.end}</div>
                <div className="text-sm text-primary/70">{nextClass.location}</div>
              </div>
            </Card>
          )}

          {/* Recent messages — ONLY when there’s unread */}
          {unread.length > 0 && (
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent messages</h3>
                <button className="text-sm underline" onClick={() => nav("/app/messages")}>
                  View all
                </button>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {unread.map(m => (
                  <li key={m._id} className="rounded-lg border p-3 hover:bg-cream/50 transition">
                    <div className="font-medium">{m.senderName || m.from || "Message"}</div>
                    <div className="text-primary/60">{m.subject || m.title || m.body?.slice(0, 60)}</div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Right column: schedule — ONLY if DB has events */}
        {schedule.length > 0 && (
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">This week</h3>
                <button className="text-sm underline" onClick={() => nav("/app/student/dashboard")}>
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

/* helpers */
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
  // naive "next class today" finder
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
