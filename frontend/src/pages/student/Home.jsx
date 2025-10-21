import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MessagesDrawer from "../../components/messages/MessagesDrawer";
import ScheduleTable from "../../components/schedule/ScheduleTable";

export default function StudentHome() {
  const nav = useNavigate();
  const [drawer, setDrawer] = useState(false);

  // demo data – replace with real API later
  const schedule = useMemo(
    () => [
      { day: "Mon", start: "09:00", end: "10:30", title: "SEN381", location: "B201" },
      { day: "Tue", start: "11:00", end: "12:30", title: "PRG381", location: "C105" },
      { day: "Wed", start: "13:00", end: "15:00", title: "DBD382", location: "Lab 2" },
      { day: "Fri", start: "08:00", end: "10:00", title: "NET380", location: "B001" },
    ],
    []
  );
  const next = schedule[0];

  return (
    <div className="space-y-6">
      {/* Top hero */}
      <section className="rounded-2xl p-6 md:p-8 bg-gradient-to-r from-lavender/60 via-cream/70 to-white border border-primary/10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading text-primary">Welcome back 👋</h1>
            <p className="text-primary/70 mt-1">
              Stay on top of your classes, messages and forum activity in one place.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <Stat label="Today" value="3 classes" />
            <Stat label="Unread" value="2 msgs" onClick={() => setDrawer(true)} />
            <Stat label="Progress" value="72%" />
          </div>
        </div>

        {/* quick actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <QuickAction onClick={() => nav("/app/student/dashboard")} label="Open Dashboard" />
          <QuickAction onClick={() => nav("/app/messages")} label="Messages" />
          <QuickAction onClick={() => nav("/app/forum")} label="Forum" />
          <QuickAction onClick={() => setDrawer(true)} label="New messages" />
        </div>
      </section>

      {/* Main content */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* left column: next up + recent */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Next up</h3>
              <span className="text-xs text-primary/60">Local time</span>
            </div>
            {next ? (
              <div className="mt-3 rounded-xl border bg-white p-4">
                <div className="text-lg font-semibold">{next.title}</div>
                <div className="text-sm">{next.day} {next.start}–{next.end}</div>
                <div className="text-sm text-primary/70">{next.location}</div>
              </div>
            ) : (
              <p className="text-sm text-primary/60 mt-2">Nothing scheduled.</p>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent messages</h3>
              <button className="text-sm underline" onClick={() => nav("/app/messages")}>
                View all
              </button>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="rounded-lg border p-3 hover:bg-cream/50 transition">
                <div className="font-medium">Admin • Course registration opens</div>
                <div className="text-primary/60">Check deadlines for SEN381</div>
              </li>
              <li className="rounded-lg border p-3 hover:bg-cream/50 transition">
                <div className="font-medium">Tutor • Lab reminder</div>
                <div className="text-primary/60">Bring your laptop to Lab 2</div>
              </li>
            </ul>
          </Card>
        </div>

        {/* right column: weekly schedule */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">This week</h3>
              <button className="text-sm underline" onClick={() => nav("/app/student/dashboard")}>
                Open full schedule
              </button>
            </div>
            <div className="mt-3">
              <ScheduleTable
                events={schedule}
                startHour={8}
                endHour={18}
                density="compact"
                accent
              />
            </div>
          </Card>
        </div>
      </section>

      <MessagesDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}

function Stat({ label, value, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border bg-white p-3 text-left shadow-sm hover:shadow transition"
    >
      <div className="text-[11px] uppercase tracking-wide text-primary/60">{label}</div>
      <div className="text-base font-semibold text-primary">{value}</div>
    </button>
  );
}

function QuickAction({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg border bg-white shadow-sm hover:bg-cream transition"
    >
      {label}
    </button>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">{children}</div>
  );
}
