const BASE = "/api";


export async function getStudentHome() {
  const r = await fetch("/api/home/student", { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load student home");
  return r.json();
}

export async function getMySchedule() {
  const r = await fetch(`${BASE}/calendar`, { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load schedule");
  return r.json(); 
}


export async function getTutorHome() {

  const r = await fetch(`${BASE}/home/tutor`, { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load tutor home");
  return r.json();
}

export async function getMyTeachingSchedule() {

  const r = await fetch(`${BASE}/calendar/teaching`, { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load teaching schedule");
  return r.json(); 
}


export async function getUnreadPreview(limit = 3) {
  const r = await fetch(`${BASE}/messages/unread?limit=${encodeURIComponent(limit)}`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error("Failed to load messages");
  return r.json(); 
}
