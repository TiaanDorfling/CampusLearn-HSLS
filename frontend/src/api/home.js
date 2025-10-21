// Simple front-end wrappers you’ll wire to your backend later.

export async function getStudentHome() {
  // expect the backend to return:
  // { nextClass: {...} | null, schedule: [...], unread: { items: [...] } }
  const r = await fetch("/api/home/student", { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load student home");
  return r.json();
}

// Fallbacks you can use if you prefer separate endpoints:
export async function getMySchedule() {
  const r = await fetch("/api/schedule/me", { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load schedule");
  return r.json(); // { events: [...] }
}
export async function getUnreadPreview(limit = 3) {
  const r = await fetch(`/api/messages/unread?limit=${limit}`, { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load messages");
  return r.json(); // { items: [...] }
}
