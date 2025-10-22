// frontend/src/pages/admin/AdminCourseManager.jsx
import React, { useEffect, useState } from "react";
import {
  listCourses,
  createCourse as adminCreateCourse,
  enrollStudentInCourse,
} from "../../api/adminapi";

export default function AdminCourseManager() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [err, setErr] = useState("");
  const [creating, setCreating] = useState(false);
  const [enrollingId, setEnrollingId] = useState(null);

  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const r = await listCourses({ all: true, pageSize: 500 });
      setCourses(r.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      code: f.get("code"),
      title: f.get("title"),
      description: f.get("description") || "",
      year: f.get("year") || "",
      semester: f.get("semester") || "",
    };
    setCreating(true);
    try {
      await adminCreateCourse(payload);
      e.currentTarget.reset();
      await refresh();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Could not create course");
    } finally {
      setCreating(false);
    }
  }

  async function onEnroll(e, id) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const studentId = f.get("studentId");
    if (!studentId) return;
    setEnrollingId(id);
    try {
      await enrollStudentInCourse(id, studentId);
      e.currentTarget.reset();
      // If your backend returns updated course enrollment, you could refresh here
      // to reflect any enrollment counters
      // await refresh();
      alert("Student enrolled in course");
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Could not enroll student");
    } finally {
      setEnrollingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header — match Admin Dashboard style */}
      <div className="bg-primary border-b-4 border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-cream">Course Manager</h1>
              <p className="text-beige mt-1">
                Create courses and enroll students using the admin API.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Create Course */}
        <section className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10">
          <h3 className="text-xl font-heading font-bold text-primary mb-4">Create course</h3>
          <form onSubmit={onCreate} className="grid md:grid-cols-5 gap-3">
            <input
              name="code"
              placeholder="Code (e.g. SEN381)"
              className="rounded-lg border-2 border-primary/20 px-3 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
            <input
              name="title"
              placeholder="Title"
              className="rounded-lg border-2 border-primary/20 px-3 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
              required
            />
            <input
              name="year"
              placeholder="Year"
              className="rounded-lg border-2 border-primary/20 px-3 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <input
              name="semester"
              placeholder="Semester"
              className="rounded-lg border-2 border-primary/20 px-3 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent"
            />
            <input
              name="description"
              placeholder="Description"
              className="rounded-lg border-2 border-primary/20 px-3 py-2 font-sans focus:ring-2 focus:ring-accent focus:border-accent md:col-span-3"
            />
            <div className="md:col-span-2 flex items-stretch">
              <button
                className="w-full px-4 py-2 rounded-lg bg-primary text-cream font-button font-medium hover:bg-primary-800 transition shadow-md"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create course"}
              </button>
            </div>
          </form>
        </section>

        {err && (
          <div className="rounded-lg border-2 border-redbrown/60 p-4 text-sm text-redbrown bg-cream shadow-md">
            {err}
          </div>
        )}

        {/* Courses list */}
        <section className="space-y-4">
          {loading ? (
            <div className="text-primary-800 font-sans">Loading…</div>
          ) : courses.length ? (
            courses.map((c) => (
              <div
                key={c._id || c.id}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-primary/10 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-heading font-bold text-primary">
                      {c.code} — {c.title}
                    </div>
                    <div className="text-sm text-primary-800/70 font-sans">
                      {c.description || "No description"}
                    </div>
                  </div>
                  <div className="text-sm text-primary-800/70 font-sans">
                    <span className="inline-block mr-3">
                      Year: <b className="text-primary">{c.year || "—"}</b>
                    </span>
                    <span className="inline-block mr-3">
                      Semester: <b className="text-primary">{c.semester || "—"}</b>
                    </span>
                    <span className="inline-block">
                      Tutors:{" "}
                      <b className="text-primary">
                        {Array.isArray(c.tutors) ? c.tutors.length : 0}
                      </b>
                    </span>
                  </div>
                </div>

                {/* Enroll student */}
                <div className="grid md:grid-cols-2 gap-4">
                  <form
                    onSubmit={(e) => onEnroll(e, c._id || c.id)}
                    className="rounded-lg border-2 border-primary/10 p-3 space-y-2 bg-cream/40"
                  >
                    <div className="text-sm font-heading text-primary">Enroll student</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="studentId"
                        placeholder="Student ID"
                        className="rounded-lg border-2 border-primary/20 px-2 py-1 font-sans focus:ring-2 focus:ring-accent focus:border-accent col-span-2"
                        required
                      />
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-primary text-cream font-button hover:bg-primary-800 transition"
                      disabled={enrollingId === (c._id || c.id)}
                    >
                      {enrollingId === (c._id || c.id) ? "Enrolling…" : "Enroll"}
                    </button>
                  </form>

                  {/* Meta box */}
                  <div className="rounded-lg border-2 border-primary/10 p-3 bg-white">
                    <div className="text-sm font-heading text-primary">Course details</div>
                    <ul className="mt-2 text-sm text-primary-800/80 space-y-1">
                      <li>
                        <b className="text-primary">Code:</b> {c.code}
                      </li>
                      <li>
                        <b className="text-primary">Title:</b> {c.title}
                      </li>
                      <li>
                        <b className="text-primary">Year/Semester:</b> {c.year || "—"} / {c.semester || "—"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-primary-800/70 font-sans">No courses yet.</div>
          )}
        </section>
      </div>
    </div>
  );
}
