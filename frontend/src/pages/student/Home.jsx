import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MessagesDrawer from "../../components/messages/MessagesDrawer";
import ScheduleTable from "../../components/schedule/ScheduleTable";

export default function StudentHome() {
  const nav = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const [schedule, setSchedule] = useState([
    { day: "Mon", start: "09:00", end: "10:30", title: "SEN381", location: "B201" },
    { day: "Wed", start: "13:00", end: "15:00", title: "DBD382", location: "Lab 2" },
    { day: "Fri", start: "08:00", end: "10:00", title: "NET380", location: "B001" },
  ]);

  // (Optional) Fetch a lightweight “next up” from backend later
  const nextClass = schedule[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Student Home</h1>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 rounded border" onClick={() => nav("/app/student/dashboard")}>
            Open Dashboard
          </button>
          <button className="px-3 py-1 rounded border" onClick={() => nav("/app/messages")}>
            Messages
          </button>
          <button className="px-3 py-1 rounded border" onClick={() => nav("/app/forum")}>
            Forum
          </button>
          <button className="px-3 py-1 rounded border" onClick={() => setDrawer(true)}>
            New messages
          </button>
        </div>
      </div>

      <p className="text-primary/70">
        Welcome back! Check announcements for your enrolled courses, send private messages, and join the forum.
      </p>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Next class */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-primary/60">Next class</div>
          {nextClass ? (
            <>
              <div className="mt-1 text-lg font-semibold">{nextClass.title}</div>
              <div className="text-sm">{nextClass.day} {nextClass.start}–{nextClass.end}</div>
              <div className="text-sm text-primary/70">{nextClass.location}</div>
            </>
          ) : (
            <div className="text-sm text-primary/60">No upcoming classes.</div>
          )}
        </div>

        {/* Quick schedule snapshot */}
        <div className="rounded-xl border bg-white p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold">This week</div>
            <button className="text-sm underline" onClick={() => nav("/app/student/dashboard")}>
              Open full schedule
            </button>
          </div>
          <div className="mt-3">
            <ScheduleTable events={schedule} />
          </div>
        </div>
      </div>

      <MessagesDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}
