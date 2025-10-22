// frontend/src/pages/messages/MessagesCenter.jsx
import React, { useEffect, useMemo, useRef, useState, useMemo as useMemo2 } from "react";
import BackHomeButton from "../../components/BackHomeButton.jsx";
import UserPicker from "../../components/users/UserPicker.jsx";
import {
  listPM,
  listBroadcasts,
  markPMRead,
  markBroadcastRead,
  sendPM,
} from "../../api/messages";

// ————————————— helpers (local storage) —————————————
function getLocalUser() {
  try {
    return JSON.parse(localStorage.getItem("cl_user") || "null");
  } catch {
    return null;
  }
}

const Tab = {
  CHATS: "CHATS",
  COMPOSE_PM: "COMPOSE_PM",
  BROADCASTS: "BROADCASTS",
  UNREAD: "UNREAD",
};

export default function MessagesCenter() {
  const user = useMemo(getLocalUser, []);
  const [tab, setTab] = useState(Tab.CHATS); // default to Chats
  const [pm, setPM] = useState([]);
  const [bc, setBC] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // for Chats tab

  // ——— data load (filtered to logged-in user) ———
  async function refresh() {
    setLoading(true);
    try {
      const [p, b] = await Promise.all([listPM(), listBroadcasts()]);
      const myId = user?._id ?? null;

      const rawPM = p?.items ?? [];
      const mine = myId
        ? rawPM
            .filter((m) => involvesMe(m, myId))
            .map((m) => ({ ...m, meId: m.meId || myId }))
        : rawPM;

      setPM(mine);
      setBC(b?.items ?? []);
    } catch (err) {
      console.error("messages refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, []);

  const unreadPM = pm.filter((x) => !(x.isReadBy || []).includes(x.meId));
  const unreadBC = bc.filter((x) => !(x.isReadBy || []).includes(x.meId));

  // build roster using THIS user's id
  const chatRoster = groupByCounterparty(pm, user?._id);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 grid grid-cols-[260px,1fr] gap-4">
      {/* ——— LEFT SIDEBAR ——— */}
      <aside className="border rounded p-3 bg-white">
        <div className="mb-2 text-xs uppercase tracking-wide text-primary/60">Menu</div>
        <div className="flex flex-col gap-2 text-sm">
          <button className={btn(tab === Tab.CHATS)} onClick={() => setTab(Tab.CHATS)}>
            Chats
          </button>
          <button
            className={btn(tab === Tab.COMPOSE_PM)}
            onClick={() => setTab(Tab.COMPOSE_PM)}
          >
            ✉︎ Compose
          </button>
          <button
            className={btn(tab === Tab.BROADCASTS)}
            onClick={() => setTab(Tab.BROADCASTS)}
          >
            Announcements
          </button>
          <button className={btn(tab === Tab.UNREAD)} onClick={() => setTab(Tab.UNREAD)}>
            Unread <span className="ml-1 text-[11px]">({unreadPM.length + unreadBC.length})</span>
          </button>
        </div>

        {tab === Tab.CHATS && (
          <div className="mt-4">
            <div className="mb-1 text-xs uppercase tracking-wide text-primary/60">
              Conversations
            </div>
            <Roster
              roster={chatRoster}
              selectedUserId={selectedUser?._id}
              onSelect={(u) => setSelectedUser(u)}
            />
          </div>
        )}
      </aside>

      {/* ——— RIGHT PANEL ——— */}
      <section className="border rounded p-3 bg-white min-h-[520px]">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Messages</div>
          <BackHomeButton />
        </div>

        {loading ? <div>Loading…</div> : null}

        {tab === Tab.BROADCASTS && (
          <List title="Announcements" items={bc} onRead={markBroadcastRead} showCourse />
        )}

        {tab === Tab.UNREAD && (
          <>
            <List title="Unread PM" items={unreadPM} onRead={markPMRead} />
            <div className="mt-6" />
            <List
              title="Unread Announcements"
              items={unreadBC}
              onRead={markBroadcastRead}
              showCourse
            />
          </>
        )}

        {tab === Tab.COMPOSE_PM && <ComposePM onSent={refresh} />}

        {tab === Tab.CHATS && (
          <ThreadView
            me={user}
            messages={pm}
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            onMarkRead={markPMRead}
            onSend={async (toId, body) => {
              await sendPM({ toUserId: toId, subject: "", body });
              await refresh();
            }}
          />
        )}
      </section>
    </div>
  );
}

/* ==============================
   LISTS & COMPOSE FORMS
   ============================== */

function List({ title, items, onRead, showCourse = false }) {
  if (!items?.length)
    return <div className="text-sm text-primary/60">{title}: No items.</div>;
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul>
        {items.map((m) => {
          const unread = !(m.isReadBy || []).includes(m.meId);
          return (
            <li key={m._id} className={`border-b py-2 ${unread ? "bg-lavender/20" : ""}`}>
              <div className="text-sm font-medium">
                {m.subject || m.title || "(no subject)"}{" "}
                <span className="text-[10px] ml-2 px-1 rounded border">
                  {unread ? "Unread" : "Read"}
                </span>
              </div>
              {showCourse && m.courseCode ? (
                <div className="text-[11px] text-primary/60">Course: {m.courseCode}</div>
              ) : null}
              {m.body ? (
                <div className="text-sm whitespace-pre-wrap">{m.body}</div>
              ) : null}
              <button
                className="text-xs underline mt-1"
                onClick={async () => {
                  await onRead(m._id);
                }}
              >
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
      setToUser(null);
      setSubject("");
      setBody("");
      onSent?.();
      alert("Private message sent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <h3 className="font-semibold">Compose private message</h3>
      <UserPicker value={toUser} onChange={setToUser} />
      <input
        className="w-full border rounded px-2 py-1"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <textarea
        className="w-full border rounded px-2 py-1"
        rows={6}
        placeholder="Message…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />
      <button className="px-3 py-1 rounded bg-accent text-primary-900" disabled={busy}>
        {busy ? "Sending…" : "Send"}
      </button>
    </form>
  );
}

/* ==============================
   CHATS: FULL THREAD VIEW
   ============================== */

function ThreadView({
  me,
  messages,
  selectedUser,
  onSelectUser,
  onMarkRead,
  onSend,
}) {
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef(null);

  // Auto-pick first chat if none selected yet
  useEffect(() => {
    if (!selectedUser) {
      const r = groupByCounterparty(messages, me?._id);
      if (r[0]) onSelectUser(r[0].user);
    }
  }, [messages, selectedUser, onSelectUser, me]);

  const thread = useMemo2(() => {
    if (!selectedUser) return [];
    const myId = me?._id || messages.find((m) => m.meId)?.meId;
    return messages
      .filter((m) => {
        const other = otherParty(m, myId);
        return other?._id === selectedUser._id;
      })
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [messages, selectedUser, me]);

  // Mark incoming as read when visible
  useEffect(() => {
    const myId = me?._id || messages.find((m) => m.meId)?.meId;
    thread
      .filter((m) => otherParty(m, myId) && !(m.isReadBy || []).includes(myId))
      .forEach((m) => onMarkRead?.(m._id));
  }, [thread, messages, me, onMarkRead]);

  // Keep scrolled to newest
  useEffect(() => {
    if (scrollerRef.current)
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [thread.length]);

  if (!selectedUser) {
    return (
      <div className="text-sm text-primary/60">
        Pick a conversation on the left to view chat history.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[520px]">
      <div className="border-b pb-2 mb-2 flex items-center justify-between">
        <div className="font-semibold">Chat with {displayFullName(selectedUser)}</div>
      </div>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
        {withDayDividers(thread).map((item, i) =>
          item.kind === "day" ? (
            <DayDivider key={`tv-day-${i}`} label={item.label} />
          ) : (
            <Bubble key={item.msg._id} meId={me?._id || item.msg.meId} msg={item.msg} />
          )
        )}
        {!thread.length && (
          <div className="text-xs text-primary/60">No messages yet. Say hi 👋</div>
        )}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const toId = selectedUser._id;
          const text = draft.trim();
          if (!text) return;
          await onSend?.(toId, text);
          setDraft("");
        }}
        className="mt-2 flex gap-2"
      >
        <input
          className="flex-1 border rounded px-2 py-1"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="px-3 py-1 rounded bg-accent text-primary-900">Send</button>
      </form>
    </div>
  );
}

/* ==============================
   UI: BUBBLE + DAY DIVIDER
   ============================== */

function Bubble({ meId, msg }) {
  const fromId = msg.fromId || msg.from?._id || msg.senderId;
  const mine = String(fromId) === String(meId);
  const dt = new Date(msg.createdAt || Date.now());
  const time = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isUnreadForMe =
    !mine && !(msg.isReadBy || []).map(String).includes(String(meId));

  return (
    <div className={`max-w-[78%] ${mine ? "ml-auto" : "mr-auto"}`}>
      <div
        className={`rounded-2xl px-3 py-2 shadow relative ${
          mine ? "bg-cream" : "bg-lavender/30"
        }`}
      >
        {msg.subject ? (
          <div className="text-[11px] font-semibold mb-1 opacity-70">{msg.subject}</div>
        ) : null}
        <div className="whitespace-pre-wrap text-sm pr-16">
          {msg.body || msg.text}
        </div>
        <span className="absolute bottom-1 right-2 text-[10px] opacity-60">
          {time} · {isUnreadForMe ? "Unread" : "Read"}
        </span>
      </div>
    </div>
  );
}

function DayDivider({ label }) {
  return (
    <div className="my-4 text-center">
      <span className="inline-block px-3 py-0.5 text-[11px] rounded-full bg-cream/70 text-primary/80 border">
        {label}
      </span>
    </div>
  );
}

/* ==============================
   UTILS (date grouping & ids)
   ============================== */

function withDayDividers(thread) {
  const out = [];
  let prevKey = null;
  for (const m of thread) {
    const d = new Date(m.createdAt || 0);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (key !== prevKey) {
      out.push({ kind: "day", label: dayLabel(d) });
      prevKey = key;
    }
    out.push({ kind: "msg", msg: m });
  }
  return out;
}

function dayLabel(d) {
  const today = new Date();
  const ymd = (x) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
  const yesterday = new Date(today.getTime() - 86400000);
  if (ymd(d) === ymd(today)) return "Today";
  if (ymd(d) === ymd(yesterday)) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function btn(active) {
  return `text-left px-2 py-1 rounded ${active ? "bg-lavender/30" : "hover:bg-cream"}`;
}

// ——— id/party helpers ———
function getIds(m, withParticipants = false) {
  const fromId = m.fromId || m.from?._id || m.senderId;
  const toId = m.toId || m.to?._id || m.recipientId;
  const participants = withParticipants ? m.participants || m.memberIds || [] : undefined;
  return { fromId, toId, participants };
}

function involvesMe(m, myId) {
  const { fromId, toId, participants } = getIds(m, true);
  if (participants?.length) return participants.some((id) => String(id) === String(myId));
  return String(fromId) === String(myId) || String(toId) === String(myId);
}

function otherParty(m, myId) {
  const { fromId, toId } = getIds(m);
  const from = m.from || {};
  const to = m.to || {};
  const otherId = String(fromId) === String(myId) ? toId : fromId;
  const other = String(fromId) === String(myId) ? to : from;
  const full =
    [other.firstName, other.lastName].filter(Boolean).join(" ") ||
    other.name ||
    other.fullName ||
    other.email;
  return otherId ? { _id: otherId, name: full } : null;
}

function groupByCounterparty(messages, myId) {
  const byId = new Map();
  for (const m of messages) {
    const other = otherParty(m, myId);
    if (!other?._id) continue;
    const key = String(other._id);
    const slot =
      byId.get(key) || { user: other, unread: 0, lastDate: 0, lastSnippet: "" };

    const isMine = String(m.fromId || m.from?._id || m.senderId) === String(myId);
    const unread = !isMine && !(m.isReadBy || []).includes(myId);
    if (unread) slot.unread += 1;

    const ts = new Date(m.createdAt || 0).getTime();
    if (ts >= slot.lastDate) {
      slot.lastDate = ts;
      slot.lastSnippet = (m.body || m.text || m.subject || "").slice(0, 64);
      slot.user = { _id: other._id, name: other.name || slot.user.name };
    }
    byId.set(key, slot);
  }
  return Array.from(byId.values()).sort((a, b) => b.lastDate - a.lastDate);
}

/* ==============================
   Roster (left sidebar for Chats)
   ============================== */

function Roster({ roster, selectedUserId, onSelect }) {
  if (!roster.length)
    return (
      <div className="text-xs text-primary/60">
        No conversations yet. Send a PM to start one.
      </div>
    );
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {roster.map((r) => (
        <li key={r.user._id}>
          <button
            className={`w-full text-left px-2 py-2 rounded border hover:bg-cream transition ${
              selectedUserId === r.user._id ? "bg-lavender/30" : "bg-white"
            }`}
            onClick={() => onSelect(r.user)}
            title={displayFullName(r.user)}
          >
            <div className="flex items-center justify-between">
              <span className="truncate max-w-[160px] font-medium">
                {displayFullName(r.user)}
              </span>
              {r.unread > 0 && (
                <span className="ml-2 text-[10px] rounded px-1 border">{r.unread}</span>
              )}
            </div>
            <div className="text-[10px] text-primary/60 truncate">{r.lastSnippet}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function displayFullName(u) {
  return (
    [u.firstName, u.lastName].filter(Boolean).join(" ") ||
    u.name ||
    u.fullName ||
    u.email ||
    "Unknown user"
  );
}
