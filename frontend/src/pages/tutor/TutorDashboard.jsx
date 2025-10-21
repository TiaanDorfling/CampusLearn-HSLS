// frontend/src/pages/tutor/TutorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackHomeButton from "../../components/BackHomeButton.jsx";
import Loader from "../../components/ui/Loader";
import Empty from "../../components/ui/Empty";
import { getMyTutor, getTutorStudents } from "../../api/tutors";

export default function TutorDashboard() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [list, setList] = useState({ items: [], total: 0, page: 1 });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getMyTutor();
        if (!alive) return;
        setTutor(res.tutor);
        if (res.tutor?._id) {
          const ls = await getTutorStudents(res.tutor._id, { page: 1, q: "" });
          if (!alive) return;
          setList(ls);
        }
      } catch (err) {
        setError(err?.friendlyMessage || "Failed to load tutor dashboard.");
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  async function onSearch(e) {
    e?.preventDefault();
    if (!tutor?._id) return;
    const ls = await getTutorStudents(tutor._id, { page: 1, q });
    setList(ls);
  }

  if (loading) return <Loader label="Loading tutor dashboard..." />;
  if (error) return <div className="p-4 text-red-700 bg-red-50 border rounded">{error}</div>;
  if (!tutor) return <Empty title="No tutor profile" />;

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Top toolbar: title + Back to Home + quick actions */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tutor Dashboard</h1>
          <p className="text-primary/70 text-sm">Hello, {tutor.name}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <BackHomeButton />
          <button
            onClick={() => nav("/app/messages")}
            className="px-3 py-1 rounded border hover:bg-cream"
            title="Go to Messages"
          >
            Messages
          </button>
          <button
            onClick={() => nav("/app/forum")}
            className="px-3 py-1 rounded border hover:bg-cream"
            title="Go to Forum"
          >
            Forum
          </button>
        </div>
      </header>

      <section className="rounded-xl border p-4 bg-white">
        <h3 className="font-semibold mb-2">Courses you teach</h3>
        {Array.isArray(tutor.courses) && tutor.courses.length ? (
          <ul className="text-sm list-disc pl-5 space-y-1">
            {tutor.courses.map((c) => (
              <li key={c._id || c.id}>{c.code} — {c.name}</li>
            ))}
          </ul>
        ) : <Empty title="No assigned courses" />}
      </section>

      <section className="rounded-xl border p-4 bg-white">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">Students assigned to you</h3>
          <form onSubmit={onSearch} className="flex gap-2">
            <input
              className="rounded border px-3 py-2 text-sm"
              placeholder="Search by name/email"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
            />
            <button className="px-3 py-2 rounded bg-accent text-primary-900">Search</button>
          </form>
        </div>

        {list.items?.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Year</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map(s => (
                  <tr key={s._id || s.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{s.name}</td>
                    <td className="py-2 pr-4">{s.email}</td>
                    <td className="py-2 pr-4">{s.year ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty title="No students yet" />}
      </section>
    </div>
  );
}
