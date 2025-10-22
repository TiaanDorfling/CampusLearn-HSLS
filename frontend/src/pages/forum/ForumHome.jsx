import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BackHomeButton from "../../components/BackHomeButton.jsx";
import { listThreads, createThread } from "../../api/forum";
import api from "../../api/axios"; // shared axios at /api

// Small UI bits (local to file)
function CategoryPill({ name }) {
  if (!name) return null;
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
      {name}
    </span>
  );
}

function ThreadSkeleton() {
  return (
    <li className="p-4 border-b last:border-0 animate-pulse">
      <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-32 bg-gray-100 rounded" />
      </div>
    </li>
  );
}

export default function ForumHome() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await listThreads();
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    setCatLoading(true);
    try {
      const { data } = await api.get("/forum/categories");
      let cats = data?.categories || [];

      // Dev convenience: auto-seed if none exist (requires auth cookie)
      if (cats.length === 0) {
        try {
          await api.post("/forum/categories/seed-defaults");
          const { data: again } = await api.get("/forum/categories");
          cats = again?.categories || [];
        } catch {
          // ignore seeding errors silently in UI
        }
      }
      setCategories(cats);
    } finally {
      setCatLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (showNew) loadCategories(); }, [showNew]);

  async function onCreate(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      title: f.get("title"),
      body: f.get("body"),                    // becomes opening post content
      categoryId: f.get("categoryId") || undefined,
    };
    setBusy(true);
    try {
      const { thread } = await createThread(payload);
      setShowNew(false);
      nav(`/app/forum/${thread._id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Forum</h1>
            <p className="text-sm text-gray-600 mt-1">
              Ask questions, share notes, and help your classmates thrive.
            </p>
          </div>
          <div className="flex gap-2">
            <BackHomeButton />
            <button
              className={`px-3 py-2 rounded-xl border text-sm font-medium transition
                          ${showNew ? "bg-gray-50 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-black"}`}
              onClick={() => setShowNew(v => !v)}
            >
              {showNew ? "Close" : "New thread"}
            </button>
          </div>
        </div>

        {showNew && (
          <form onSubmit={onCreate} className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                name="title"
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
                placeholder="e.g. Need help with simplex pivot row"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="categoryId"
                className="w-full border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black/20"
                required
                disabled={catLoading || categories.length === 0}
              >
                <option value="">
                  {catLoading ? "Loading…" : (categories.length ? "Select a category" : "No categories found")}
                </option>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Opening post</label>
              <textarea
                name="body"
                rows="5"
                className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20"
                placeholder="Describe your question or share context…"
                required
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black transition disabled:opacity-60"
                disabled={busy}
              >
                {busy ? "Posting…" : "Post thread"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Thread list */}
      <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
        {loading ? (
          <ul>
            {Array.from({ length: 4 }).map((_, i) => <ThreadSkeleton key={i} />)}
          </ul>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-2">🗨️</div>
            <p className="text-sm text-gray-600">No threads yet. Be the first to start a discussion!</p>
          </div>
        ) : (
          <ul className="divide-y">
            {items.map(t => (
              <li key={t._id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/app/forum/${t._id}`} className="font-semibold hover:underline">
                      {t.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                      <CategoryPill name={t.category?.name} />
                      <span>{new Date(t.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <Link
                    to={`/app/forum/${t._id}`}
                    className="shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium hover:bg-white transition"
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
