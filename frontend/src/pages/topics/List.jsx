import React from "react";
import { Link } from "react-router-dom";

export default function List() {
  const topics = [
    { id: "sen381", title: "SEN381 – Software Engineering", posts: 42, subscribers: 180 },
    { id: "dbs200", title: "DBS200 – Database Systems", posts: 28, subscribers: 150 },
    { id: "web101", title: "WEB101 – Web Development", posts: 65, subscribers: 320 }
  ];

  return (
    <section className="grid gap-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl text-primary">Topics</h1>
          <p className="text-gray-700">Browse topics and jump into questions and resources.</p>
        </div>
        <div className="flex gap-2">
          <input className="border rounded-md px-3 py-2" placeholder="Search topics..." />
          <select className="border rounded-md px-3 py-2">
            <option>All</option>
            <option>Subscribed</option>
            <option>Popular</option>
          </select>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map(t => (
          <Link key={t.id} to={`/topics/${t.id}`} className="rounded-xl border border-lavender/50 bg-white/80 p-4 hover:shadow">
            <h3 className="font-semibold text-primary">{t.title}</h3>
            <div className="mt-2 text-xs text-gray-600 flex gap-4">
              <span>{t.posts} posts</span>
              <span>{t.subscribers} subscribers</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
