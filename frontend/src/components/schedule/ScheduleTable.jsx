import React from "react";

/**
 * props:
 *  - events: [{ day, start, end, title, location }]
 *  - startHour = 8, endHour = 18
 *  - density: "normal" | "compact"  (compact = shorter rows)
 *  - accent: boolean (use accent background for blocks)
 */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function ScheduleTable({
  events = [],
  startHour = 8,
  endHour = 18,
  density = "normal",
  accent = false,
}) {
  const HOURS = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const rowH = density === "compact" ? 40 : 48; // px per hour

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="grid grid-cols-[80px,repeat(5,1fr)] border-b bg-primary/5 text-sm">
        <div className="px-2 py-2 font-medium">Time</div>
        {DAYS.map(d => <div key={d} className="px-2 py-2 font-medium text-center">{d}</div>)}
      </div>

      <div className="grid grid-cols-[80px,repeat(5,1fr)] text-sm relative">
        {/* time rail */}
        <div>
          {HOURS.map(h => (
            <div key={h} className="border-b px-2 py-1 text-right text-xs text-primary/60" style={{ height: rowH }}>
              {String(h).padStart(2,"0")}:00
            </div>
          ))}
        </div>

        {/* day columns */}
        {DAYS.map(day => (
          <div key={day} className="relative border-l">
            {HOURS.map(h => (
              <div key={h} className="border-b/50 border-b" style={{ height: rowH }} />
            ))}
            {(events || []).filter(e => e.day === day).map((e, idx) => (
              <Block key={idx} {...e} startHour={startHour} rowH={rowH} accent={accent} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Block({ start, end, title, location, startHour, rowH, accent }) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = (sh - startHour) * 60 + sm;
  const dur = (eh * 60 + em) - (sh * 60 + sm);
  const top = (startMin / 60) * rowH;
  const height = Math.max((dur / 60) * rowH, 34);

  return (
    <div
      className={`absolute left-1 right-1 rounded-lg ${accent ? "bg-accent/90 text-primary-900" : "bg-lavender/70"} shadow p-2`}
      style={{ top, height }}
    >
      <div className="text-xs font-semibold">{title}</div>
      <div className="text-[11px]">{start}–{end} • {location}</div>
    </div>
  );
}
