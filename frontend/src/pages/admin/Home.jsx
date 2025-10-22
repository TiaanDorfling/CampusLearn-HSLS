import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MessagesDrawer from "../../components/messages/MessagesDrawer";

export default function AdminHome() {
  const nav = useNavigate();
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Home</h1>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border" onClick={() => nav("/app/admin/dashboard")}>
            Open Dashboard
          </button>
          <button className="px-3 py-1 rounded border" onClick={() => nav("/app/messages")}>
            Messages
          </button>
          <button className="px-3 py-1 rounded border" onClick={() => nav("/app/forum")}>
            Forum
          </button>
          <button className="px-3 py-1 rounded border" onClick={() => setDrawer(true)}>
            New messages
          </button>
        </div>
      </div>

      <p className="text-primary/70">
        Manage users, send institution-wide or course-targeted announcements, and moderate the forum.
      </p>

      <MessagesDrawer open={drawer} onClose={() => setDrawer(false)} />
    </div>
  );
}
