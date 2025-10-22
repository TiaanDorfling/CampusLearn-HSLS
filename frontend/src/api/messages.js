import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
const opts = { withCredentials: true, timeout: 15000 };

function friendlyError(err, fallback) {
  const msg =
    err?.response?.data?.friendlyMessage ||
    err?.response?.data?.message ||
    err?.message ||
    fallback;
  const e = new Error(msg);
  e.status = err?.response?.status;
  return e;
}

/* ============
   Private Messages (PM)
   ============ */

// GET /api/pm?onlyUnread=(true|false)&limit=&cursor=
export async function listPM({ onlyUnread = false, limit, cursor } = {}) {
  try {
    const params = { onlyUnread };
    if (limit) params.limit = limit;
    if (cursor) params.cursor = cursor;
    const { data } = await axios.get(`${API_BASE}/pm`, { ...opts, params });
    return {
      items: Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []),
      total: Number.isFinite(data?.total) ? data.total : undefined,
      nextCursor: data?.nextCursor,
    };
  } catch (e) {
    throw friendlyError(e, "Failed to load messages.");
  }
}

// POST /api/pm  { toUserId, subject, body }
export async function sendPM({ toUserId, subject = "", body = "" }) {
  try {
    const { data } = await axios.post(`${API_BASE}/pm`, { toUserId, subject, body }, opts);
    return data;
  } catch (e) {
    throw friendlyError(e, "Failed to send message.");
  }
}

// POST /api/pm/:id/read
export async function markPMRead(id) {
  try {
    const { data } = await axios.post(`${API_BASE}/pm/${encodeURIComponent(id)}/read`, null, opts);
    return data;
  } catch (e) {
    throw friendlyError(e, "Failed to mark message read.");
  }
}

// POST /api/pm/read-many  { ids: [...] }
export async function markPMReadMany(ids = []) {
  try {
    const { data } = await axios.post(`${API_BASE}/pm/read-many`, { ids }, opts);
    return data;
  } catch (e) {
    throw friendlyError(e, "Failed to mark messages read.");
  }
}

/* ============
   Announcements / Broadcasts
   ============ */

// GET /api/notifications?onlyUnread=(true|false)&limit=&cursor=
export async function listBroadcasts({ onlyUnread = false, limit, cursor } = {}) {
  try {
    const params = { onlyUnread };
    if (limit) params.limit = limit;
    if (cursor) params.cursor = cursor;
    const { data } = await axios.get(`${API_BASE}/notifications`, { ...opts, params });
    return {
      items: Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []),
      total: Number.isFinite(data?.total) ? data.total : undefined,
      nextCursor: data?.nextCursor,
    };
  } catch (e) {
    throw friendlyError(e, "Failed to load announcements.");
  }
}

// POST /api/notifications/broadcast  { title, body, courseCode }
export async function sendBroadcast({ title, body, courseCode }) {
  try {
    const { data } = await axios.post(
      `${API_BASE}/notifications/broadcast`,
      { title, body, courseCode },
      opts
    );
    return data;
  } catch (e) {
    throw friendlyError(e, "Failed to send announcement.");
  }
}

// POST /api/notifications/:id/read
export async function markBroadcastRead(id) {
  try {
    const { data } = await axios.post(
      `${API_BASE}/notifications/${encodeURIComponent(id)}/read`,
      null,
      opts
    );
    return data;
  } catch (e) {
    throw friendlyError(e, "Failed to mark announcement read.");
  }
}

/* ============
   Optional convenience: small unread preview for top-bars
   (uses /pm only, never hits /messages/unread)
   ============ */
export async function listUnreadPreview(limit = 3) {
  const res = await listPM({ onlyUnread: true, limit });
  return res.items || [];
}
