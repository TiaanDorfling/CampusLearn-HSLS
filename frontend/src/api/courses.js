export async function listMyCourses() {
  const r = await fetch("/api/courses/mine", { credentials: "include" });
  if (!r.ok) throw new Error("Failed to load courses");
  return r.json(); 
}
export async function createCourse(payload) {
  const r = await fetch("/api/courses", {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Create failed");
  return r.json();
}
export async function addSession(courseId, session) {
  const r = await fetch(`/api/courses/${courseId}/sessions`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
  if (!r.ok) throw new Error("Add session failed");
  return r.json();
}
export async function enrollStudent(courseId, studentId) {
  const r = await fetch(`/api/courses/${courseId}/enroll`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId }),
  });
  if (!r.ok) throw new Error("Enroll failed");
  return r.json();
}
