// frontend/src/api/messages.js
import api from "./axios";

/* ─────────────────────────────
 * Announcements / Notifications
 * ──────────────────────────── */
export async function listBroadcasts({ onlyUnread = false } = {}) {
  // GET /api/notifications?onlyUnread=true|false → { items: [...] }
  const { data } = await api.get("/notifications", { params: { onlyUnread } });
  return data;
}

export async function sendBroadcast({ title, body, courseCode }) {
  // If your backend supports it:
  const { data } = await api.post("/notifications", { title, body, courseCode });
  return data;
}

export async function markBroadcastRead(id) {
  // Try multiple flavors (PATCH/PUT)
  const attempts = [
    () => api.patch(`/notifications/${id}/read`),
    () => api.put(`/notifications/${id}/read`),
  ];
  for (const attempt of attempts) {
    try {
      const { data } = await attempt();
      return data;
    } catch (e) { /* try the next flavor */ }
  }
  // As a very last resort, return a success-shaped object so UI doesn't regress
  return { ok: false };
}

/* ─────────────────────────────
 * Private Messages (flat /pm)
 * ──────────────────────────── */
export async function listPM({ onlyUnread = false } = {}) {
  // GET /api/pm?onlyUnread=true|false → { items: [...] }
  const { data } = await api.get("/pm", { params: { onlyUnread } });
  return data;
}

export async function sendPM({ toUserId, body, subject }) {
  // POST /api/pm  body { toUserId, subject, body }
  const { data } = await api.post("/pm", { toUserId, body, subject });
  return data;
}

/**
 * Mark a SINGLE message as read.
 * Tries (in order):
 *   1) PUT  /messages/read          { messageId }
 *   2) PUT  /pm/read                { id }
 *   3) PUT  /pm/read                { messageId }
 *   4) PATCH /pm/:id/read
 *   5) PUT  /pm/:id/read
 */
export async function markPMRead(id) {
  const attempts = [
    () => api.put(`/messages/read`, { messageId: id }),
    () => api.put(`/pm/read`, { id }),
    () => api.put(`/pm/read`, { messageId: id }),
    () => api.patch(`/pm/${id}/read`),
    () => api.put(`/pm/${id}/read`),
  ];
  for (const attempt of attempts) {
    try {
      const { data } = await attempt();
      return data;
    } catch (e) { /* keep falling back */ }
  }
  return { ok: false };
}

/**
 * Mark MANY messages as read.
 * Tries (in order):
 *   1) PUT  /messages/read-many     { messageIds }
 *   2) PUT  /pm/read-many           { messageIds }
 *   3) PUT  /pm/read-many           { ids }
 *   4) PATCH /pm/read-many          { messageIds }
 *   5) PATCH /pm/read-many          { ids }
 *   6) Fallback to calling markPMRead(id) one-by-one
 */
export async function markPMReadMany(ids = []) {
  const messageIds = Array.from(new Set((ids || []).map(String))).filter(Boolean);
  if (messageIds.length === 0) return { ok: true, modifiedCount: 0 };

  const attempts = [
    () => api.put(`/messages/read-many`, { messageIds }),
    () => api.put(`/pm/read-many`, { messageIds }),
    () => api.put(`/pm/read-many`, { ids: messageIds }),
    () => api.patch(`/pm/read-many`, { messageIds }),
    () => api.patch(`/pm/read-many`, { ids: messageIds }),
  ];

  for (const attempt of attempts) {
    try {
      const { data } = await attempt();
      return data;
    } catch (e) { /* keep trying */ }
  }

  // Final fallback: do them individually with the single-message helper
  const results = await Promise.all(
    messageIds.map((id) => markPMRead(id).catch(() => null))
  );
  const modified = results.filter(Boolean).length;
  return { ok: modified > 0, modifiedCount: modified };
}

/**
 * If you later wire conversations:
 * PUT /messages/:conversationId/read-all
 */
export async function markConversationReadAll(conversationId) {
  const { data } = await api.put(`/messages/${conversationId}/read-all`);
  return data;
}
