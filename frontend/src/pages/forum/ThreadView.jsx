import React, { useEffect, useMemo, useRef, useState } from "react";
import BackHomeButton from "../../components/BackHomeButton.jsx";
import { useParams } from "react-router-dom";
import { getThread, addPost } from "../../api/forum";

function CategoryPill({ name }) {
  if (!name) return null;
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
      {name}
    </span>
  );
}

function AuthorLine({ user }) {
  const label = user?.name || user?.email || "Member";
  return <span className="text-xs text-gray-600">{label}</span>;
}

export default function ThreadView() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  // Composer (controlled)
  const [draft, setDraft] = useState("");
  const composerRef = useRef(null);
  const textareaRef = useRef(null);

  async function refresh() {
    try {
      const res = await getThread(id);
      setThread(res.thread || null);
      setPosts(res.posts || []);
      setErr(null);
    } catch (e) {
      console.error("Thread load failed", e);
      setErr("Could not load this thread.");
    }
  }
  useEffect(() => { refresh(); }, [id]);

  function focusComposer() {
    // Scroll into view and focus the textarea
    requestAnimationFrame(() => {
      composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      textareaRef.current?.focus();
    });
  }

  async function onReplySubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setBusy(true);
    try {
      await addPost(id, text);
      setDraft("");
      await refresh();
      requestAnimationFrame(() => textareaRef.current?.focus());
    } finally {
      setBusy(false);
    }
  }

  function onComposerKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!busy && draft.trim()) onReplySubmit(e);
    }
  }

  const originalPost = useMemo(() => posts[0] || null, [posts]);
  const replies = useMemo(() => (posts.length > 1 ? posts.slice(1) : []), [posts]);

  if (err) return <div className="max-w-5xl mx-auto text-sm text-red-600">{err}</div>;
  if (!thread) return <div className="max-w-5xl mx-auto text-sm text-gray-600">Loading…</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold leading-tight">{thread.title}</h1>
            <div className="flex items-center gap-2">
              <CategoryPill name={thread.category?.name} />
              <span className="text-xs text-gray-600">{new Date(thread.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={focusComposer}
              className="rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition"
              title="Reply to this thread"
            >
              Reply
            </button>
            <BackHomeButton />
          </div>
        </div>
      </header>

      {/* Original post */}
      <article className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Original post</h3>
          {originalPost && (
            <button
              onClick={focusComposer}
              className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50 transition"
              title="Reply to this post"
            >
              Reply
            </button>
          )}
        </div>

        {originalPost ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <AuthorLine user={originalPost.author} />
              <span className="text-xs text-gray-600">
                {new Date(originalPost.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="text-sm whitespace-pre-wrap">
              {originalPost.content || originalPost.body}
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-600">No content.</div>
        )}
      </article>

      {/* Replies */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Replies</h3>
          <span className="text-xs text-gray-500">{replies.length} total</span>
        </div>

        {replies.length === 0 ? (
          <div className="text-sm text-gray-600">No replies yet.</div>
        ) : (
          <ul className="space-y-3">
            {replies.map((p) => (
              <li key={p._id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between mb-1">
                  <AuthorLine user={p.author} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {new Date(p.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={focusComposer}
                      className="text-xs rounded-lg border px-2 py-1 hover:bg-gray-50 transition"
                      title="Reply to this post"
                    >
                      Reply
                    </button>
                  </div>
                </div>
                <div className="text-sm whitespace-pre-wrap">{p.content || p.body}</div>
              </li>
            ))}
          </ul>
        )}

        {/* Composer */}
        <form ref={composerRef} onSubmit={onReplySubmit} className="mt-4 space-y-2">
          <label className="block text-sm font-medium">Write a reply</label>
          <textarea
            ref={textareaRef}
            name="body"
            rows="4"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onComposerKeyDown}
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
            placeholder="Reply..."
            required
          />
          <div className="flex items-center justify-end">
            <button
              className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg黑 transition disabled:opacity-60"
              disabled={busy || !draft.trim()}
            >
              {busy ? "Posting…" : "Reply"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
