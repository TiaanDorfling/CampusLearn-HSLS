import React from "react";

/**
 * props.courses = [
 *  { code: "SEN381", name: "Software Engineering", overall: 78, terms: [{label:"Test 1", score:75, weight:20}, ...] }
 * ]
 */
export default function MarksGrid({ courses = [] }) {
  if (!courses.length) {
    return <div className="text-sm text-primary/60">No marks yet.</div>;
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((c, i) => (
        <div key={i} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{c.code}</div>
            <div className={`px-2 py-0.5 rounded text-xs ${badge(c.overall)}`}>
              {c.overall ?? "–"}%
            </div>
          </div>
          <div className="text-sm text-primary/70">{c.name}</div>

          <div className="mt-3 space-y-1">
            {(c.terms || []).map((t, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="text-primary/80">{t.label}</div>
                <div className="text-primary">{t.score ?? "–"}%</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function badge(n) {
  if (n == null) return "bg-cream text-primary";
  if (n >= 75) return "bg-green-100 text-green-800";
  if (n >= 50) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-700";
}
