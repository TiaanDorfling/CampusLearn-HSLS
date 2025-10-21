import React from "react";

/**
 * props.events = [
 *  { day: "Mon"|"Tue"|"Wed"|"Thu"|"Fri", start: "09:00", end: "10:30", title: "SEN381", location: "B201" }
 * ]
 */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i); // 08:00..18:00

export default function ScheduleTable({ events = [] }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="grid grid-cols-[80px,repeat(5,1fr)] border-b bg-primary/5 text-sm">
        <div className="px-2 py-2 font-medium">Time</div>
        {DAYS.map(d => <div key={d} className="px-2 py-2 font-medium text-center">{d}</div>)}
      </div>

      <div className="grid grid-cols-[80px,repeat(5,1fr)] text-sm">
        {/* time rail */}
        <div>
          {HOURS.map(h => (
            <div key={h} className="h-12 border-b px-2 py-1 text-right text-xs text-primary/60">
              {String(h).padStart(2,"0")}:00
            </div>
          ))}
        </div>

        {/* day columns */}
        {DAYS.map(day => (
          <div key={day} className="relative border-l">
            {HOURS.map(h => <div key={h} className="h-12 border-b/50 border-b"></div>)}
            {(events || []).filter(e => e.day === day).map((e, idx) => (
              <Block key={idx} {...e} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Block({ start, end, title, location }) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = (sh - 8) * 60 + sm; // offset from 08:00
  const dur = (eh * 60 + em) - (sh * 60 + sm);
  const top = (startMin / 60) * 48 / 1; // 48px per hour (h-12)
  const height = (dur / 60) * 48;

  return (
    <div
      className="absolute left-1 right-1 rounded-lg bg-accent/80 text-primary-900 shadow p-2"
      style={{ top, height, minHeight: 36 }}
    >
      <div className="text-xs font-semibold">{title}</div>
      <div className="text-[11px]">{start}–{end} • {location}</div>
    </div>
  );
}
