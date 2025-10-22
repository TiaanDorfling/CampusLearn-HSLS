// frontend/src/api/students.js
import api from "./axios";

/** Student (self) */
export async function getMyStudent() {
  const { data } = await api.get("/student/me");
  return data; // { student, courses?, stats? }
}
export async function updateMyStudent(patch) {
  const { data } = await api.put("/student/me", patch);
  return data; // { student }
}

/** Admin / Tutor utilities */
export async function listStudents(params = {}) {
  const { page = 1, q = "" } = params;
  const { data } = await api.get("/student", { params: { page, q } });
  return data; // { items, page, total }
}
export async function getStudent(id) {
  const { data } = await api.get(`/student/${id}`);
  return data; // { student }
}
export async function createStudent(payload) {
  const { data } = await api.post("/student", payload);
  return data; // { student }
}
export async function updateStudent(id, patch) {
  const { data } = await api.put(`/student/${id}`, patch);
  return data; // { student }
}
export async function deleteStudent(id) {
  const { data } = await api.delete(`/student/${id}`);
  return data; // { ok: true }
}
