import React, { useEffect, useState } from "react";
import { listBroadcasts, listPM, markBroadcastRead, markPMRead } from "../../api/messages";

export default function MessagesDrawer({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [pms, setPMs] = useState([]);

  async function refresh() {
    setLoading(true);
    try {
      const [b, p] = await Promise.all([
        listBroadcasts({ onlyUnread: true }),
        listPM({ onlyUnread: true }),
      ]);
      setBroadcasts(b.items || []);
      setPMs(p.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (open) refresh(); }, [open]);

  if (!open) return null;
  const unreadCount = (broadcasts?.length || 0) + (pms?.length || 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-[360px] bg-white shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">New Messages</h3>
          <button onClick={onClose} className="text-sm px-2 py-1">✕</button>
        </div>
        <p className="text-xs text-primary/60 mb-3">
          {loading ? "Loading…" : unreadCount ? `${unreadCount} unread` : "All caught up!"}
        </p>

        {pms?.length ? (
          <section className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Private messages</h4>
            <ul className="space-y-2">
              {pms.map(m => (
                <li key={m._id} className="border rounded p-2 bg-lavender/20">
                  <div className="text-sm font-medium">From: {m.from?.name || m.fromEmail}</div>
                  <div className="text-xs text-primary/70">{m.subject || "No subject"}</div>
                  <div className="text-sm mt-1 line-clamp-3">{m.body}</div>
                  <button
                    className="mt-2 text-xs underline"
                    onClick={async () => { await markPMRead(m._id); refresh(); }}
                  >
                    Mark as read
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {broadcasts?.length ? (
          <section>
            <h4 className="text-sm font-semibold mb-2">Announcements</h4>
            <ul className="space-y-2">
              {broadcasts.map(m => (
                <li key={m._id} className="border rounded p-2 bg-lavender/20">
                  <div className="text-sm font-medium">{m.title}</div>
                  <div className="text-[11px] text-primary/60">
                    {m.courseCode ? `Course: ${m.courseCode}` : null}
                  </div>
                  <div className="text-sm mt-1 line-clamp-3">{m.body}</div>
                  <button
                    className="mt-2 text-xs underline"
                    onClick={async () => { await markBroadcastRead(m._id); refresh(); }}
                  >
                    Mark as read
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
