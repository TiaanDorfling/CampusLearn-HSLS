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
        const r = await getTutorHome();
        if (!alive) return;

        const events = normalizeEvents(Array.isArray(r?.schedule) ? r.schedule : []);
        setSchedule(events);
        setUnread(Array.isArray(r?.unread?.items) ? r.unread.items : []);
        const next = r?.nextSession || r?.nextClass || findNextFromSchedule(events);
        setNextSession(next || null);

        if (events.length === 0) {
          try {
            const [sched, msgs] = await Promise.all([
              getMyTeachingSchedule(),
              unread.length ? Promise.resolve({ items: unread }) : getUnreadPreview(3),
            ]);
            if (!alive) return;
            const evts = normalizeEvents(Array.isArray(sched?.events) ? sched.events : []);
            setSchedule(evts);
            setUnread(Array.isArray(msgs?.items) ? msgs.items : unread);
            setNextSession(
              sched?.nextSession || sched?.nextClass || findNextFromSchedule(evts) || null
            );
          } catch {
            /* keep existing state */
          }
        }
      } catch (e) {
        try {
          const [sched, msgs] = await Promise.all([getMyTeachingSchedule(), getUnreadPreview(3)]);
          if (!alive) return;
          const evts = normalizeEvents(Array.isArray(sched?.events) ? sched.events : []);
          setSchedule(evts);
          setUnread(Array.isArray(msgs?.items) ? msgs.items : []);
          setNextSession(sched?.nextSession || sched?.nextClass || findNextFromSchedule(evts) || null);
        } catch (e2) {
          setError(e2.message || "Failed to load home.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
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
    <QuickAction onClick={() => nav("/app/settings")} label="Settings" />
  </div>
</section> 


{/* Tutoring Resources & Tips Section */}
<section className="mt-8 bg-white/70 border border-primary/10 rounded-2xl p-6 shadow-sm">
  <h2 className="text-xl font-semibold text-primary mb-3">✨ Tutoring Tips & Resources</h2>

  <div className="space-y-2 text-primary/80">
    <p>Here are a few key tips to make your tutoring sessions more effective:</p>
    <ul className="list-disc ml-5 space-y-1">
      <li>🕐 Always start on time and set a positive tone.</li>
      <li>🎯 Begin each session with a clear learning goal.</li>
      <li>💬 Encourage interaction — let students think out loud.</li>
      <li>🌱 Track progress and celebrate small wins often.</li>
      <li>📚 End each session with a short recap or “knowledge check.”</li>
    </ul>
  </div>

  <div className="mt-5">
    <h3 className="text-lg font-semibold text-primary mb-2">🎥 Helpful YouTube Tutorials</h3>
    <p className="text-sm text-primary/70 mb-3">
      Explore these short videos to enhance your tutoring techniques:
    </p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <a
        href="https://www.youtube.com/watch?v=KjK0dK3V2uk"
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-primary/20 bg-white hover:bg-cream/60 transition p-3 shadow-sm"
      >
        <h4 className="font-semibold text-primary text-sm mb-1">How to Be an Effective Tutor</h4>
        <p className="text-xs text-primary/60">Practical strategies for engaging and motivating students.</p>
      </a>

      <a
        href="https://www.youtube.com/watch?v=Rk5FjBRbKzA"
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-primary/20 bg-white hover:bg-cream/60 transition p-3 shadow-sm"
      >
        <h4 className="font-semibold text-primary text-sm mb-1">Building Student Confidence</h4>
        <p className="text-xs text-primary/60">Tips to create a supportive and inspiring learning space.</p>
      </a>

      <a
        href="https://www.youtube.com/watch?v=H6n3p1XjGG0"
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-primary/20 bg-white hover:bg-cream/60 transition p-3 shadow-sm"
      >
        <h4 className="font-semibold text-primary text-sm mb-1">Engaging Online Tutoring Techniques</h4>
        <p className="text-xs text-primary/60">Learn how to keep remote learners motivated and focused.</p>
      </a>
    </div>
  </div>

  <p className="mt-4 text-sm text-primary/60 italic text-center">
    “A great tutor doesn’t just teach — they help students discover their potential.” 🌟
  </p>
</section>
