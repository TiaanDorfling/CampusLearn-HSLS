import React from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default function ScheduleTable({ events = [], startHour = 8, endHour = 18 }) {
  const HOURS = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const rowH = 48;

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      {/* Header */}
      <div
        className="grid border-b bg-primary/5 text-sm font-medium"
        style={{ gridTemplateColumns: "80px repeat(5, 1fr)" }}
      >
        <div className="px-2 py-2 text-left">Time</div>
        {DAYS.map((d) => (
          <div key={d} className="px-2 py-2 text-center">{d}</div>
        ))}
      </div>

      {/* Body */}
      <div
        className="grid text-sm relative"
        style={{ gridTemplateColumns: "80px repeat(5, 1fr)" }}
      >
        {/* Time rail */}
        <div>
          {HOURS.map((h) => (
            <div
              key={h}
              className="border-b text-right pr-2 text-xs text-primary/60"
              style={{ height: rowH }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {DAYS.map((day) => (
          <div key={day} className="relative border-l">
            {HOURS.map((h) => (
              <div key={h} className="border-b/50 border-b" style={{ height: rowH }} />
            ))}
            {(events || [])
              .filter((e) => e.day?.slice(0, 3).toLowerCase() === day.toLowerCase())
              .map((e, i) => (
                <Block key={i} e={e} startHour={startHour} rowH={rowH} />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Block({ e, startHour, rowH }) {
  const [sh, sm] = e.start.split(":").map(Number);
  const [eh, em] = e.end.split(":").map(Number);

  const startMins = (sh - startHour) * 60 + sm;
  const dur = (eh * 60 + em) - (sh * 60 + sm);

  const top = (startMins / 60) * rowH;
  const height = (dur / 60) * rowH;

  return (
    <div
      className="absolute left-1 right-1 rounded-lg bg-pink-300/70 text-primary-900 shadow p-2"
      style={{ top, height }}
    >
      <div className="text-xs font-semibold">{e.title}</div>
      <div className="text-[11px]">{e.start}–{e.end} • {e.location}</div>
    </div>
  );
}
