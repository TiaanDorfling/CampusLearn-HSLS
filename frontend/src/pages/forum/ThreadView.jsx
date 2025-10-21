import React, { useEffect, useState } from "react";
import BackHomeButton from "../../components/BackHomeButton.jsx";
import { useParams } from "react-router-dom";
import { getThread, addPost } from "../../api/forum";

export default function ThreadView() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await getThread(id);
    setThread(res.thread || null);
    setPosts(res.posts || []);
  }
  useEffect(() => { refresh(); }, [id]);

  async function onReply(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const f = new FormData(e.currentTarget);
      await addPost(id, f.get("body"));
      e.currentTarget.reset();
      await refresh();
    } finally { setBusy(false); }
  }

  if (!thread) return <div className="text-sm text-primary/60">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{thread.title}</h1>
          <div className="text-xs text-primary/60">
            {thread.courseCode ? `Course: ${thread.courseCode} • ` : ""}{new Date(thread.createdAt).toLocaleString()}
          </div>
        </div>
        <BackHomeButton />
      </header>

      <article className="border rounded p-3 bg-white">
        <div className="text-sm whitespace-pre-wrap">{thread.body}</div>
      </article>

      <section className="border rounded p-3 bg-white">
        <h3 className="font-semibold mb-2">Replies</h3>
        {posts.length === 0 ? (
          <div className="text-sm text-primary/60">No replies yet.</div>
        ) : (
          <ul className="space-y-3">
            {posts.map(p => (
              <li key={p._id} className="border rounded p-2">
                <div className="text-xs text-primary/60">{new Date(p.createdAt).toLocaleString()}</div>
                <div className="text-sm whitespace-pre-wrap">{p.body}</div>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={onReply} className="mt-3 space-y-2">
          <textarea name="body" rows="4" className="w-full border rounded px-2 py-1" placeholder="Write a reply…" required />
          <button className="px-3 py-1 rounded bg-accent text-primary-900" disabled={busy}>
            {busy ? "Posting…" : "Reply"}
          </button>
        </form>
      </section>
    </div>
  );
}
