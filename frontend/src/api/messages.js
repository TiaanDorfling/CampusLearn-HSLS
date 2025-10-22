// frontend/src/api/messages.js
import api from "./axios";

/** NOTIFICATIONS (Announcements) */
export async function listBroadcasts({ onlyUnread = false } = {}) {
  // backend: GET /api/notifications?onlyUnread=true|false  → { ok, count, items }
  const { data } = await api.get("/notifications", { params: { onlyUnread } });
  return data; // keep shape; your UI reads .items
}

export async function sendBroadcast({ title, body, courseCode }) {
  // NOTE: backend does not expose POST /notifications in this repo.
  // If you have an admin-only create endpoint elsewhere, point to it here.
  // For now, this will 404 on this backend; leaving as /notifications for correctness.
  const { data } = await api.post("/notifications", { title, body, courseCode });
  return data;
}

export async function markBroadcastRead(id) {
  // backend: PATCH /api/notifications/:id/read → { ok, item }
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

/** PRIVATE MESSAGES (DMs) */
export async function listPM({ onlyUnread = false } = {}) {
  // backend: GET /api/pm?onlyUnread=true|false → { items: [...] }
  const { data } = await api.get("/pm", { params: { onlyUnread } });
  return data; // keep shape; your UI reads .items
}

export async function sendPM({ toUserId, body, subject }) {
  // backend: POST /api/pm  body { toUserId, subject, body }
  const { data } = await api.post("/pm", { toUserId, body, subject });
  return data;
}

export async function markPMRead(id) {
  // backend: PATCH /api/pm/:id/read → { ok: true }
  const { data } = await api.patch(`/pm/${id}/read`);
  return data;
}
