// frontend/src/api/home.js
// Simple front-end wrappers you’ll wire to your backend later.

const BASE = "/api";

/* ===================== STUDENT ===================== */

export async function getStudentHome() {
  // Expected shape:
  // { nextClass: {...} | null, schedule: [...], unread: { items: [...] } }
  const r = await fetch(`${BASE}/home/student`, { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load student home");
  return r.json();
}

// Fallback if you prefer a separate schedule endpoint
export async function getMySchedule() {
  const r = await fetch(`${BASE}/calendar`, { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load schedule");
  return r.json(); // { events: [...] }
}

/* ====================== TUTOR ====================== */

export async function getTutorHome() {
  // Expected shape (similar to student):
  // { nextSession | nextClass: {...} | null, schedule: [...], unread: { items: [...] } }
  const r = await fetch(`${BASE}/home/tutor`, { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load tutor home");
  return r.json();
}

export async function getMyTeachingSchedule() {
  // Use whatever route your backend exposes for a tutor’s schedule.
  // If you use a different path (e.g. /api/tutor/schedule) change here.
  const r = await fetch(`${BASE}/calendar/teaching`, { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load teaching schedule");
  return r.json(); // { events: [...] }
}

/* ==================== MESSAGES ===================== */

export async function getUnreadPreview(limit = 3) {
  const r = await fetch(`${BASE}/messages/unread?limit=${encodeURIComponent(limit)}`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error("Failed to load messages");
  return r.json(); // { items: [...] }
}
