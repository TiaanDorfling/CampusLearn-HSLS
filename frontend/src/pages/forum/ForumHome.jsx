import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackHomeButton from "../../components/BackHomeButton.jsx";
import { listThreads, createThread } from "../../api/forum";

export default function ForumHome() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await listThreads();
    setItems(res.items || []);
  }
  useEffect(() => { refresh(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      title: f.get("title"),
      body: f.get("body"),
      courseCode: f.get("courseCode") || undefined,
    };
    setBusy(true);
    try {
      const { thread } = await createThread(payload);
      setShowNew(false);
      nav(`/app/forum/${thread._id}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Forum</h1>
        <div className="flex gap-2">
          <BackHomeButton />
          <button className="px-3 py-1 rounded border" onClick={() => setShowNew(v => !v)}>
            {showNew ? "Close" : "New thread"}
          </button>
        </div>
      </div>

      {showNew && (
        <form onSubmit={onCreate} className="border rounded p-3 space-y-2 bg-white">
          <input name="title" className="w-full border rounded px-2 py-1" placeholder="Title" required />
          <input name="courseCode" className="w-full border rounded px-2 py-1" placeholder="Course code (optional)" />
          <textarea name="body" rows="5" className="w-full border rounded px-2 py-1" placeholder="Content…" required />
          <button className="px-3 py-1 rounded bg-accent text-primary-900" disabled={busy}>
            {busy ? "Posting…" : "Post thread"}
          </button>
        </form>
      )}

      <div className="border rounded bg-white">
        {items.length === 0 ? (
          <div className="p-4 text-primary/60 text-sm">No threads yet.</div>
        ) : (
          <ul>
            {items.map(t => (
              <li key={t._id} className="p-3 border-b last:border-0">
                <Link to={`/app/forum/${t._id}`} className="font-medium hover:underline">{t.title}</Link>
                <div className="text-xs text-primary/60">
                  {t.courseCode ? `Course: ${t.courseCode} • ` : ""}{new Date(t.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
