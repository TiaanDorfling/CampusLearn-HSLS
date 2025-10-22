// frontend/src/pages/messages/MessagesCenter.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import BackHomeButton from "../../components/BackHomeButton.jsx";
import UserPicker from "../../components/users/UserPicker.jsx";
import {
  listPM,
  listBroadcasts,
  markPMRead,
  markPMReadMany,
  markBroadcastRead,
  sendPM,
  sendBroadcast,
} from "../../api/messages";

/* =========================
   Helpers
   ========================= */
function getLocalUser() {
  try {
    return JSON.parse(localStorage.getItem("cl_user") || "null");
  } catch {
    return null;
  }
}

// robust current-user id
function myIdFromUser(u) {
  return String(
    (u && (u._id || u.id || u.userId || u.uid || (u.user && (u.user._id || u.user.id)))) ||
      ""
  );
}

const Tab = {
  CHATS: "CHATS",
  UNREAD: "UNREAD",
  BROADCASTS: "BROADCASTS",
  COMPOSE_PM: "COMPOSE_PM",
  COMPOSE_BC: "COMPOSE_BC",
};

function tabTitle(tab) {
  switch (tab) {
    case Tab.CHATS:
      return "Chats";
    case Tab.UNREAD:
      return "Unread";
    case Tab.BROADCASTS:
      return "Announcements";
    case Tab.COMPOSE_PM:
      return "Compose Private Message";
    case Tab.COMPOSE_BC:
      return "New Announcement";
    default:
      return "Messages";
  }
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

function withDayDividers(thread) {
  const out = [];
  let prevKey = null;
  for (const m of thread || []) {
    const d = new Date(extractCreatedAt(m) || 0);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (key !== prevKey) {
      out.push({ kind: "day", label: dayLabel(d) });
      prevKey = key;
    }
    out.push({ kind: "msg", msg: m });
  }
  return out;
}

/* ----- id + party utilities ----- */
function firstVal(...vals) {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).length) return v;
  }
  return null;
}
function asId(x) {
  if (!x) return null;
  if (typeof x === "object") return x._id || x.id || null;
  return x;
}
function extractFromId(m) {
  return String(
    firstVal(
      asId(m.from),
      m.fromId,
      m.senderId,
      m.userFromId,
      m.fromUserId,
      asId(m.fromUser),
      asId(m.sender),
      m.createdBy,
      m.authorId
    ) || ""
  );
}
function extractToId(m) {
  return String(
    firstVal(
      asId(m.to),
      m.toId,
      m.recipientId,
      m.userToId,
      m.toUserId,
      asId(m.toUser),
      asId(m.receiver),
      asId(m.recipient)
    ) || ""
  );
}
function extractParticipants(m) {
  const arr =
    m.participants || m.members || m.memberIds || m.recipients || m.users || [];
  return (arr || []).map((p) => (typeof p === "object" ? p : { _id: p }));
}
function extractConversationId(m) {
  return String(firstVal(asId(m.conversation), m.conversationId, m.threadId) || "");
}
function extractCreatedAt(m) {
  return (
    firstVal(
      m.createdAt,
      m.created_at,
      m.sentAt,
      m.timestamp,
      m.date,
      m.createdOn,
      m.time
    ) || 0
  );
}
function extractText(m) {
  return firstVal(m.body, m.text, m.message, m.content) || "";
}
function displayName(userObj) {
  if (!userObj) return "";
  return (
    [userObj.firstName, userObj.lastName].filter(Boolean).join(" ") ||
    userObj.name ||
    userObj.fullName ||
    userObj.email ||
    ""
  );
}
function shortId(id) {
  const s = String(id || "");
  return s ? s.slice(-6) : "??????";
}

/* ----- read helpers ----- */
function resolveMeForMessage(m, appMeId) {
  return String(m?.meId || appMeId || "");
}

function readArrayToStrings(m) {
  const arr = (m.isReadBy || m.readBy || []).map((v) => {
    if (typeof v === "object" && v) return String(v._id || v.id || v);
    return String(v);
  });
  return arr;
}

function wasReadByMe(m, appMeId) {
  const msgMe = resolveMeForMessage(m, appMeId);
  const candidates = new Set(
    [msgMe, appMeId, m.userId, m.ownerId].filter(Boolean).map(String)
  );
  const readStrs = readArrayToStrings(m);
  if ([...candidates].some((id) => readStrs.includes(String(id)))) return true;
  if (m.isRead === true || m.read === true || m.is_read === true) return true;
  if (m.readAt || m.read_at) return true;
  return false;
}

function markLocalAsRead(item, appMeId) {
  const msgMe = resolveMeForMessage(item, appMeId);
  const toAdd = [msgMe, appMeId].filter(Boolean).map(String);
  const merged = new Set([...readArrayToStrings(item), ...toAdd]);
  return {
    ...item,
    isReadBy: Array.from(merged),
    readAt: item.readAt || new Date().toISOString(),
  };
}

/* ----- grouping helpers ----- */
function getCounterparty(m, meId) {
  const fromId = extractFromId(m);
  const toId = extractToId(m);
  const convId = extractConversationId(m);
  const parts = extractParticipants(m);

  if (fromId || toId) {
    const mine = String(fromId) === String(resolveMeForMessage(m, meId));
    const otherId = mine ? toId : fromId;
    if (otherId) {
      const otherObj = mine ? m.to || m.toUser || m.receiver || {} : m.from || m.fromUser || m.sender || {};
      const name =
        displayName(otherObj) ||
        (parts.find((p) => String(p._id) === String(otherId)) &&
          displayName(parts.find((p) => String(p._id) === String(otherId)))) ||
        `User • ${shortId(otherId)}`;
      const avatarUrl =
        otherObj.avatarUrl || otherObj.photo || otherObj.image || otherObj.avatar || null;
      return { key: `u:${otherId}`, otherId: String(otherId), name, avatarUrl };
    }
  }

  if (parts.length) {
    const my = resolveMeForMessage(m, meId);
    const others = parts.filter((p) => String(p._id) !== String(my));
    const other = others[0] || {};
    if (others.length === 1) {
      return {
        key: `u:${other._id}`,
        otherId: String(other._id),
        name: displayName(other) || `User • ${shortId(other._id)}`,
        avatarUrl: other.avatarUrl || other.photo || other.image || other.avatar || null,
      };
    } else {
      const key = convId || `g:${others.map((p) => p._id).sort().join(",")}`;
      const name =
        others.map((p) => displayName(p)).filter(Boolean).slice(0, 2).join(", ") +
          (others.length > 2 ? ` +${others.length - 2}` : "") || "Group";
      return { key, otherId: null, name, avatarUrl: null };
    }
  }

  if (convId) return { key: `c:${convId}`, otherId: null, name: "Conversation", avatarUrl: null };

  if (extractFromId(m) && extractToId(m)) {
    const a = extractFromId(m);
    const b = extractToId(m);
    const pair = [a, b].sort().join("|");
    const my = resolveMeForMessage(m, meId);
    const otherId = String(a) === String(my) ? b : a;
    const name = otherId ? `User • ${shortId(otherId)}` : "Conversation";
    return { key: `p:${pair}`, otherId: otherId || null, name, avatarUrl: null };
  }

  return { key: `misc`, otherId: null, name: "Conversation", avatarUrl: null };
}

function isPMUnreadForMe(m, meId) {
  const fromId = extractFromId(m);
  const my = resolveMeForMessage(m, meId);
  if (String(fromId) === String(my)) return false;
  return !wasReadByMe(m, meId);
}

function buildCounterpartyGroups(items, meId) {
  const by = new Map();
  for (const m of items || []) {
    const cp = getCounterparty(m, meId);
    if (!cp) continue;

    const slot =
      by.get(cp.key) ||
      {
        key: cp.key,
        otherId: cp.otherId || null,
        name: cp.name || "Conversation",
        avatarUrl: cp.avatarUrl || null,
        msgs: [],
        unread: 0,
        lastSnippet: "",
        lastAt: 0,
      };

    if (isPMUnreadForMe(m, meId)) slot.unread += 1;
    slot.msgs.push(m);

    const at = new Date(extractCreatedAt(m) || 0).getTime();
    if (at >= slot.lastAt) {
      slot.lastAt = at;
      slot.lastSnippet = (extractText(m) || m.subject || "").slice(0, 64);
      slot.name = cp.name || slot.name;
      slot.avatarUrl = cp.avatarUrl ?? slot.avatarUrl;
      slot.otherId = cp.otherId ?? slot.otherId;
    }
    by.set(cp.key, slot);
  }

  return Array.from(by.values())
    .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0))
    .map((g) => ({
      ...g,
      lastWhen: g.lastAt
        ? new Date(g.lastAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
    }));
}

function buildFullThread(allMessages, group, meId) {
  if (!group) return [];

  if (group.key?.startsWith("p:")) {
    const ids = group.key.slice(2).split("|");
    const a = ids[0], b = ids[1];
    return allMessages.filter((m) => {
      const f = extractFromId(m), t = extractToId(m);
      return (f === a && t === b) || (f === b && t === a);
    });
  }

  if (group.otherId) {
    return allMessages.filter((m) => {
      const f = extractFromId(m), t = extractToId(m);
      const my = resolveMeForMessage(m, meId);
      return (
        (String(f) === String(my) && String(t) === String(group.otherId)) ||
        (String(f) === String(group.otherId) && String(t) === String(my))
      );
    });
  }

  if (group.key?.startsWith("c:")) {
    const cid = group.key.slice(2);
    return allMessages.filter((m) => String(extractConversationId(m)) === String(cid));
  }

  return group.msgs || [];
}

/* =========================
   Component
   ========================= */
export default function MessagesCenter() {
  const user = useMemo(getLocalUser, []);
  const meId = useMemo(() => myIdFromUser(user), [user]);
  const role = String(user?.role || "").toLowerCase();
  const canBroadcast = role === "admin" || role === "tutor";

  const [tab, setTab] = useState(Tab.CHATS);
  const [pm, setPM] = useState([]);
  const [bc, setBC] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedKey, setSelectedKey] = useState(null);

  // Local read overlay so badges don’t pop back during server lag
  const pmOverlayRef = useRef(new Set());
  const bcOverlayRef = useRef(new Set());
  function overlayPM(ids = []) { ids.forEach((id) => pmOverlayRef.current.add(String(id))); }
  function overlayBC(id) { if (id) bcOverlayRef.current.add(String(id)); }

  function reconcilePMFromServer(items = []) {
    for (const m of items) {
      const idStr = String(m._id);
      if (pmOverlayRef.current.has(idStr) && wasReadByMe(m, meId)) pmOverlayRef.current.delete(idStr);
    }
    if (pmOverlayRef.current.size === 0) return items;
    return items.map((m) => pmOverlayRef.current.has(String(m._id)) ? markLocalAsRead(m, meId) : m);
  }
  function reconcileBCFromServer(items = []) {
    for (const m of items) {
      const idStr = String(m._id);
      if (bcOverlayRef.current.has(idStr) && wasReadByMe(m, meId)) bcOverlayRef.current.delete(idStr);
    }
    if (bcOverlayRef.current.size === 0) return items;
    return items.map((m) => bcOverlayRef.current.has(String(m._id)) ? markLocalAsRead(m, meId) : m);
  }

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  async function ensurePMReadsPersist(targetIds, appMe) {
    const targets = new Set((targetIds || []).map(String));
    if (targets.size === 0) return true;
    for (let attempt = 0; attempt < 4; attempt++) {
      await sleep(attempt === 0 ? 120 : 280);
      try {
        const res = await listPM({ onlyUnread: false });
        const items = res?.items || [];
        const remaining = items.filter(
          (m) => targets.has(String(m._id)) && !wasReadByMe(m, appMe)
        );
        if (remaining.length === 0) return true;
      } catch {}
    }
    return false;
  }

  async function ensureBCReadPersist(id, appMe) {
    if (!id) return true;
    for (let attempt = 0; attempt < 3; attempt++) {
      await sleep(attempt === 0 ? 120 : 280);
      try {
        const res = await listBroadcasts({ onlyUnread: false });
        const items = res?.items || [];
        const stillUnread = items.some(
          (m) => String(m._id) === String(id) && !wasReadByMe(m, appMe)
        );
        if (!stillUnread) return true;
      } catch {}
    }
    return false;
  }

  async function refresh() {
    setLoading(true);
    try {
      const [p, b] = await Promise.all([listPM({ onlyUnread: false }), listBroadcasts()]);
      setPM(reconcilePMFromServer(p?.items || []));
      setBC(reconcileBCFromServer(b?.items || []));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const unreadPMOnly = pm.filter((m) => isPMUnreadForMe(m, meId));
  const groupsAll = useMemo(() => buildCounterpartyGroups(pm, meId), [pm, meId]);
  const groupsUnread = useMemo(
    () => buildCounterpartyGroups(unreadPMOnly, meId),
    [unreadPMOnly, meId]
  );

  useEffect(() => {
    if (tab === Tab.CHATS && !selectedKey && groupsAll.length) {
      setSelectedKey(groupsAll[0].key);
    }
  }, [tab, groupsAll, selectedKey]);

  const selectedGroup = groupsAll.find((g) => g.key === selectedKey) || null;

  function markLocalPMsAsRead(ids = []) {
    if (!ids.length) return;
    overlayPM(ids);
    const setIds = new Set(ids.map(String));
    setPM((prev) => prev.map((m) => (setIds.has(String(m._id)) ? markLocalAsRead(m, meId) : m)));
  }
  function markLocalBCAsRead(id) {
    if (!id) return;
    overlayBC(id);
    setBC((prev) => prev.map((m) => (m._id === id ? markLocalAsRead(m, meId) : m)));
  }

  return (
    <div className="h-[calc(100vh-80px)] grid grid-cols-1 md:grid-cols-[72px_320px_1fr] bg-neutral-50 rounded-lg overflow-hidden border">
      {/* LEFT RAIL */}
      <aside className="hidden md:flex flex-col items-center gap-2 py-3 bg-neutral-900 text-neutral-100">
        <RailButton label="Chats" active={tab === Tab.CHATS} onClick={() => setTab(Tab.CHATS)} icon="💬" />
        <RailButton label="Unread" active={tab === Tab.UNREAD} onClick={() => setTab(Tab.UNREAD)} icon="🟣" badge={unreadPMOnly.length} />
        <RailButton label="Announcements" active={tab === Tab.BROADCASTS} onClick={() => setTab(Tab.BROADCASTS)} icon="📣" />
        <div className="h-px w-8 my-2 bg-neutral-700" />
        <RailButton label="Compose" active={tab === Tab.COMPOSE_PM} onClick={() => setTab(Tab.COMPOSE_PM)} icon="✉️" />
        {canBroadcast && <RailButton label="New" active={tab === Tab.COMPOSE_BC} onClick={() => setTab(Tab.COMPOSE_BC)} icon="📝" />}
        <div className="mt-auto pb-2">
          <BackHomeButton />
        </div>
      </aside>

      {/* MIDDLE COLUMN */}
      <section className="bg-white border-r flex flex-col min-h-0">
        <Header title={tabTitle(tab)} right={loading ? <Spinner /> : null} />

        {tab === Tab.CHATS && (
          <div className="overflow-y-auto h-full">
            <ul className="divide-y divide-neutral-100">
              {groupsAll.map((g) => (
                <li key={g.key}>
                  <button
                    className={`w-full text-left px-3 py-2.5 hover:bg-neutral-50 transition ${
                      selectedKey === g.key ? "bg-purple-50" : ""
                    }`}
                    onClick={() => setSelectedKey(g.key)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={g.name} avatarUrl={g.avatarUrl} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{g.name}</div>
                          {g.unread > 0 && (
                            <span className="text-[10px] rounded-full px-1.5 py-px bg-purple-600 text-white">
                              {g.unread}
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-neutral-500 truncate">
                          {g.lastSnippet}
                        </div>
                      </div>
                      <div className="text-[11px] text-neutral-400 whitespace-nowrap">
                        {g.lastWhen}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === Tab.UNREAD && (
          <div className="overflow-y-auto h-full p-2">
            <ul className="divide-y divide-neutral-100">
              {groupsUnread.map((g) => (
                <li key={g.key}>
                  <button
                    className="w-full text-left px-3 py-2.5 hover:bg-neutral-50 transition"
                    onClick={() => {
                      setSelectedKey(g.key);
                      setTab(Tab.CHATS);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={g.name} avatarUrl={g.avatarUrl} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{g.name}</div>
                          {g.unread > 0 && (
                            <span className="text-[10px] rounded-full px-1.5 py-px bg-purple-600 text-white">
                              {g.unread}
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-neutral-500 truncate">
                          {g.lastSnippet}
                        </div>
                      </div>
                      <div className="text-[11px] text-neutral-400 whitespace-nowrap">
                        {g.lastWhen}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4" />
            <AnnouncementList
              meId={meId}
              items={bc}
              showOnlyUnread
              onRead={async (id) => {
                markLocalBCAsRead(id);
                await markBroadcastRead(id);
                await ensureBCReadPersist(id, meId);
                await refresh();
              }}
              onChanged={refresh}
              compact
            />
          </div>
        )}

        {tab === Tab.BROADCASTS && (
          <div className="overflow-y-auto h-full p-2">
            <AnnouncementList
              meId={meId}
              items={bc}
              onRead={async (id) => {
                markLocalBCAsRead(id);
                await markBroadcastRead(id);
                await ensureBCReadPersist(id, meId);
                await refresh();
              }}
              onChanged={refresh}
            />
          </div>
        )}

        {tab === Tab.COMPOSE_PM && (
          <ComposePM
            onSent={async (toUserId) => {
              await refresh();
              setTab(Tab.CHATS);
              setSelectedKey(`u:${String(toUserId)}`);
            }}
          />
        )}
        {tab === Tab.COMPOSE_BC && canBroadcast && <ComposeBC onSent={refresh} />}
      </section>

      {/* RIGHT PANE (thread view) */}
      <section className="bg-white flex flex-col min-h-0">
        <Header title={tab === Tab.CHATS ? selectedGroup?.name || "" : ""} right={null} />
        {tab === Tab.CHATS && selectedGroup ? (
          <ThreadView
            meId={meId}
            group={selectedGroup}
            allMessages={pm}
            onMarkReadMany={async (ids) => {
              if (!ids?.length) return;
              const uniq = Array.from(new Set(ids.map(String)));

              markLocalPMsAsRead(uniq);

              try {
                await markPMReadMany(uniq);
              } catch {
                await Promise.all(uniq.map((id) => markPMRead(id).catch(() => null)));
              }

              await ensurePMReadsPersist(uniq, meId);
              await refresh();
            }}
            onReply={async (text) => {
              const toUserId = selectedGroup.otherId;
              if (toUserId) {
                await sendPM({ toUserId, subject: "", body: text });
                await refresh();
                setSelectedKey(`u:${String(toUserId)}`);
              }
            }}
          />
        ) : (
          <div className="h-full" />
        )}
      </section>
    </div>
  );
}

/* =========================
   RIGHT PANE: Thread + Reply
   ========================= */
function ThreadView({ meId, group, allMessages, onMarkReadMany, onReply }) {
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef(null);

  const fullThread = useMemo(
    () =>
      buildFullThread(allMessages || [], group, meId).sort(
        (a, b) =>
          new Date(extractCreatedAt(a) || 0) - new Date(extractCreatedAt(b) || 0)
      ),
    [allMessages, group, meId]
  );

  useEffect(() => {
    const unreadIds = fullThread.filter((m) => isPMUnreadForMe(m, meId)).map((m) => m._id);
    if (unreadIds.length) onMarkReadMany?.(unreadIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.key, fullThread.length, meId]);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [fullThread.length]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div
        ref={scrollerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2"
      >
        {withDayDividers(fullThread).map((it, i) =>
          it.kind === "day" ? (
            <DayDivider key={`day-${i}`} label={it.label} />
          ) : (
            <Bubble key={it.msg._id || i} meId={meId} msg={it.msg} />
          )
        )}
      </div>

      <form
        className="border-t p-3 flex gap-2 bg-white"
        onSubmit={async (e) => {
          e.preventDefault();
          const text = draft.trim();
          if (!text) return;
          await onReply?.(text);
          setDraft("");
        }}
      >
        <input
          className="flex-1 border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
          placeholder={`Message ${group.name}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="px-4 py-2 rounded bg-neutral-900 text-white hover:bg-black">
          Send
        </button>
      </form>
    </div>
  );
}

/* =========================
   Compose Forms
   ========================= */
function ComposePM({ onSent }) {
  const [toUser, setToUser] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!toUser?._id) return;
    setBusy(true);
    try {
      await sendPM({ toUserId: toUser._id, subject, body });
      setSubject("");
      setBody("");
      onSent?.(toUser._id);
      setToUser(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-3 space-y-2">
      <div className="font-semibold">Compose Private Message</div>
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
      <button className="px-3 py-1 rounded bg-neutral-900 text-white" disabled={busy}>
        {busy ? "Sending…" : "Send"}
      </button>
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
      setCourseCode("");
      setTitle("");
      setBody("");
      onSent?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-3 space-y-2">
      <div className="font-semibold">New Announcement</div>
      <input
        className="w-full border rounded px-2 py-1"
        placeholder="Course code"
        value={courseCode}
        onChange={(e) => setCourseCode(e.target.value)}
        required
      />
      <input
        className="w-full border rounded px-2 py-1"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="w-full border rounded px-2 py-1"
        rows={6}
        placeholder="Message…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />
      <button className="px-3 py-1 rounded bg-neutral-900 text-white" disabled={busy}>
        {busy ? "Sending…" : "Send"}
      </button>
    </form>
  );
}

/* =========================
   Shared UI
   ========================= */
function Header({ title, right }) {
  return (
    <div className="h-12 px-4 flex items-center justify-between border-b bg-white">
      <div className="font-semibold">{title}</div>
      <div>{right}</div>
    </div>
  );
}

function RailButton({ label, active, onClick, icon, badge }) {
  return (
    <button
      className={`w-12 h-12 rounded-xl grid place-items-center relative transition ${
        active ? "bg-neutral-800 text-white" : "hover:bg-neutral-800/50"
      }`}
      onClick={onClick}
      title={label}
    >
      <span className="text-lg leading-none">{icon}</span>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] bg-purple-600 text-white rounded-full px-1">
          {badge}
        </span>
      )}
    </button>
  );
}

function Avatar({ name = "?", avatarUrl = null }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border border-neutral-200"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-linear-to-br from-neutral-700 to-neutral-900 text-white grid place-items-center text-sm font-semibold">
      {initials || "?"}
    </div>
  );
}

function AnnouncementList({
  meId,
  items,
  onRead,
  onChanged,
  compact = false,
  showOnlyUnread = false,
}) {
  if (!items?.length) return null;

  const isUnread = (m) => !wasReadByMe(m, meId);
  const list = showOnlyUnread ? items.filter(isUnread) : items;
  if (showOnlyUnread && !list.length) return null;

  return (
    <ul className="divide-y divide-neutral-100">
      {list.map((m) => {
        const unread = isUnread(m);
        return (
          <li key={m._id} className={`px-3 py-3 ${unread ? "bg-purple-50" : "bg-white"}`}>
            <div className="text-sm font-medium">
              {m.title || m.subject || "(no title)"}
            </div>
            {m.courseCode && (
              <div className="text-[11px] text-neutral-500">Course: {m.courseCode}</div>
            )}
            {!compact && extractText(m) && (
              <div className="text-sm whitespace-pre-wrap mt-1">{extractText(m)}</div>
            )}
            <button
              className="text-xs underline mt-1"
              onClick={async () => {
                await onRead(m._id);
                await onChanged?.();
              }}
            >
              Mark read
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Bubble({ meId, msg }) {
  const my = resolveMeForMessage(msg, meId);
  const fromId = extractFromId(msg);
  const mine = String(fromId) === String(my);

  const dt = new Date(extractCreatedAt(msg) || Date.now());
  const time = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const isUnreadForMe = !mine && !wasReadByMe(msg, my);

  return (
    <div className={`max-w-[80%] ${mine ? "mr-auto" : "ml-auto"}`}>
      <div
        className={`rounded-2xl px-3 py-2 shadow-sm border ${
          mine
            ? "bg-white text-neutral-900 border-neutral-200"
            : "bg-neutral-900 text-white border-neutral-900"
        }`}
      >
        {msg.subject ? (
          <div className={`text:[11px] mb-1 ${mine ? "opacity-70" : "opacity-90"}`}>
            {msg.subject}
          </div>
        ) : null}
        <div className="whitespace-pre-wrap text-sm">{extractText(msg)}</div>
        <div className={`text-[10px] mt-1 ${mine ? "opacity-60" : "opacity-90"}`}>
          {time}
          {isUnreadForMe ? " · Unread" : ""}
        </div>
      </div>
    </div>
  );
}

function DayDivider({ label }) {
  return (
    <div className="my-3 text-center">
      <span className="inline-block px-3 py-0.5 text-[11px] rounded-full bg-neutral-100 text-neutral-600 border">
        {label}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="animate-spin inline-block w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full" />
  );
}
