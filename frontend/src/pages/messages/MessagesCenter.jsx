import React, { useEffect, useMemo, useState } from "react";
import BackHomeButton from "../../components/BackHomeButton.jsx";
import UserPicker from "../../components/users/UserPicker.jsx";
import { listPM, listBroadcasts, markPMRead, markBroadcastRead, sendPM, sendBroadcast } from "../../api/messages";

function getLocalUser() { try { return JSON.parse(localStorage.getItem("cl_user") || "null"); } catch { return null; } }
const Tab = { INBOX: "INBOX", UNREAD: "UNREAD", BROADCASTS: "BROADCASTS", COMPOSE_PM: "COMPOSE_PM", COMPOSE_BC: "COMPOSE_BC" };

export default function MessagesCenter() {
  const user = useMemo(getLocalUser, []);
  const role = String(user?.role || "").toLowerCase();
  const canBroadcast = role === "admin" || role === "tutor";

  const [tab, setTab] = useState(Tab.INBOX);
  const [pm, setPM] = useState([]);
  const [bc, setBC] = useState([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [p, b] = await Promise.all([listPM(), listBroadcasts()]);
      setPM(p.items || []);
      setBC(b.items || []);
    } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  const unreadPM = pm.filter(x => !(x.isReadBy || []).includes(x.meId));
  const unreadBC = bc.filter(x => !(x.isReadBy || []).includes(x.meId));

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 grid grid-cols-[220px,1fr] gap-4">
      <aside className="border rounded p-3 bg-white">
        <div className="flex flex-col gap-2 text-sm">
          <button className={btn(tab === Tab.INBOX)} onClick={() => setTab(Tab.INBOX)}>Inbox</button>
          <button className={btn(tab === Tab.UNREAD)} onClick={() => setTab(Tab.UNREAD)}>
            Unread <span className="ml-1 text-[11px]">({unreadPM.length + unreadBC.length})</span>
          </button>
          <button className={btn(tab === Tab.BROADCASTS)} onClick={() => setTab(Tab.BROADCASTS)}>Announcements</button>
          <hr className="my-2" />
          <button className={btn(tab === Tab.COMPOSE_PM)} onClick={() => setTab(Tab.COMPOSE_PM)}>✉︎ Compose PM</button>
          {canBroadcast && (
            <button className={btn(tab === Tab.COMPOSE_BC)} onClick={() => setTab(Tab.COMPOSE_BC)}>📣 New Announcement</button>
          )}
        </div>
      </aside>

      <section className="border rounded p-3 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Messages</div>
          <BackHomeButton />
        </div>

        {loading ? <div>Loading…</div> : null}

        {tab === Tab.INBOX && (
          <>
            <List title="Private messages" items={pm} onRead={markPMRead} />
            <div className="mt-6" />
            <List title="Announcements" items={bc} onRead={markBroadcastRead} showCourse />
          </>
        )}
        {tab === Tab.BROADCASTS && (
          <List title="Announcements" items={bc} onRead={markBroadcastRead} showCourse />
        )}
        {tab === Tab.UNREAD && (
          <>
            <List title="Unread PM" items={unreadPM} onRead={markPMRead} />
            <div className="mt-6" />
            <List title="Unread Announcements" items={unreadBC} onRead={markBroadcastRead} showCourse />
          </>
        )}

        {tab === Tab.COMPOSE_PM && <ComposePM onSent={refresh} />}
        {tab === Tab.COMPOSE_BC && canBroadcast && <ComposeBC onSent={refresh} />}
      </section>
    </div>
  );
}

function List({ title, items, onRead, showCourse = false }) {
  if (!items?.length) return <div className="text-sm text-primary/60">{title}: No items.</div>;
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul>
        {items.map(m => {
          const unread = !(m.isReadBy || []).includes(m.meId);
          return (
            <li key={m._id} className={`border-b py-2 ${unread ? "bg-lavender/20" : ""}`}>
              <div className="text-sm font-medium">{m.subject || m.title || "(no subject)"}</div>
              {showCourse && m.courseCode ? (
                <div className="text-[11px] text-primary/60">Course: {m.courseCode}</div>
              ) : null}
              <div className="text-sm">{m.body}</div>
              <button className="text-xs underline mt-1" onClick={async () => { await onRead(m._id); }}>
                Mark read
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ComposePM({ onSent }) {
  const [toUser, setToUser] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!toUser?._id) return alert("Please choose a recipient.");
    setBusy(true);
    try {
      await sendPM({ toUserId: toUser._id, subject, body });
      setToUser(null); setSubject(""); setBody("");
      onSent?.();
      alert("Private message sent.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <h3 className="font-semibold">Compose private message</h3>
      <UserPicker value={toUser} onChange={setToUser} />
      <input className="w-full border rounded px-2 py-1" placeholder="Subject" value={subject} onChange={(e)=>setSubject(e.target.value)} />
      <textarea className="w-full border rounded px-2 py-1" rows="6" placeholder="Message…" value={body} onChange={(e)=>setBody(e.target.value)} required />
      <button className="px-3 py-1 rounded bg-accent text-primary-900" disabled={busy}>{busy ? "Sending…" : "Send"}</button>
    </form>
  );
}

function ComposeBC({ onSent }) {
  const [courseCode, setCourseCode] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await sendBroadcast({ title, body, courseCode });
      setCourseCode(""); setTitle(""); setBody("");
      onSent?.();
      alert("Announcement sent.");
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <h3 className="font-semibold">New announcement</h3>
      <input className="w-full border rounded px-2 py-1" placeholder="Course code (e.g. SEN381)" value={courseCode} onChange={(e)=>setCourseCode(e.target.value)} required />
      <input className="w-full border rounded px-2 py-1" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
      <textarea className="w-full border rounded px-2 py-1" rows="6" placeholder="Message…" value={body} onChange={(e)=>setBody(e.target.value)} required />
      <button className="px-3 py-1 rounded bg-accent text-primary-900" disabled={busy}>{busy ? "Sending…" : "Send"}</button>
    </form>
  );
}

function btn(active) { return `text-left px-2 py-1 rounded ${active ? "bg-lavender/30" : "hover:bg-cream"}`; }
