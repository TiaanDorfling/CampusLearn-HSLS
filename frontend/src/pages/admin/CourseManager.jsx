import React, { useEffect, useState } from "react";
import { listMyCourses, createCourse, addSession, enrollStudent } from "../../api/courses";

export default function AdminCourseManager() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [err, setErr] = useState("");

  async function refresh() {
    setErr(""); setLoading(true);
    try { const r = await listMyCourses(); setCourses(r.items || []); }
    catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ refresh(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await createCourse({ code: f.get("code"), name: f.get("name"), description: f.get("description") });
    e.currentTarget.reset();
    refresh();
  }

  async function onAddSession(e, id) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await addSession(id, { day: f.get("day"), start: f.get("start"), end: f.get("end"), location: f.get("location") });
    e.currentTarget.reset();
    refresh();
  }

  async function onEnroll(e, id) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await enrollStudent(id, f.get("studentId"));
    e.currentTarget.reset();
    refresh();
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Course Manager (Admin)</h1>
        <p className="text-sm text-primary/70">Create courses, schedule sessions, enroll students.</p>
      </header>

      <section className="rounded-xl border bg-white p-4 space-y-3">
        <h3 className="font-semibold">Create course</h3>
        <form onSubmit={onCreate} className="grid md:grid-cols-3 gap-3">
          <input name="code" placeholder="Code (e.g. SEN381)" className="rounded border px-3 py-2" required />
          <input name="name" placeholder="Name" className="rounded border px-3 py-2" required />
          <input name="description" placeholder="Description" className="rounded border px-3 py-2" />
          <button className="px-3 py-2 rounded bg-accent text-primary-900 md:col-span-3">Create</button>
        </form>
      </section>

      {err && <div className="p-3 rounded border bg-red-50 text-red-700 text-sm">{err}</div>}

      <section className="space-y-4">
        {loading ? <div>Loading…</div> : (courses.length ? courses.map(c => (
          <div key={c._id} className="rounded-xl border bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.code} — {c.name}</div>
                <div className="text-sm text-primary/60">{c.description}</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <form onSubmit={(e)=>onAddSession(e, c._id)} className="rounded-lg border p-3 space-y-2">
                <div className="text-sm font-medium">Add session</div>
                <div className="grid grid-cols-2 gap-2">
                  <select name="day" className="rounded border px-2 py-1">
                    {["Mon","Tue","Wed","Thu","Fri"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input name="location" placeholder="Location" className="rounded border px-2 py-1" />
                  <input name="start" type="time" className="rounded border px-2 py-1" required />
                  <input name="end" type="time" className="rounded border px-2 py-1" required />
                </div>
                <button className="px-3 py-1 rounded bg-cream hover:bg-lavender/40">Add</button>
              </form>

              <form onSubmit={(e)=>onEnroll(e, c._id)} className="rounded-lg border p-3 space-y-2">
                <div className="text-sm font-medium">Enroll student</div>
                <div className="grid grid-cols-2 gap-2">
                  <input name="studentId" placeholder="Student ID" className="rounded border px-2 py-1" required />
                </div>
                <button className="px-3 py-1 rounded bg-cream hover:bg-lavender/40">Enroll</button>
              </form>
            </div>

            {Array.isArray(c.sessions) && c.sessions.length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1">Sessions</div>
                <ul className="list-disc pl-5 space-y-1">
                  {c.sessions.map((s,i)=>(
                    <li key={i}>{s.day} {s.start}-{s.end} • {s.location}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )) : <div className="text-sm text-primary/60">No courses yet.</div>)}
      </section>
    </div>
  );
}
