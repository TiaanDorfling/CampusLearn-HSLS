import api from "./axios";

export async function getMyTutor() {
  const { data } = await api.get("/tutors/me");
  return data; // { tutor, courses }
}

export async function getTutorStudents(tutorId, params = {}) {
  const { page = 1, q = "" } = params;
  const { data } = await api.get(`/tutors/${tutorId}/students`, { params: { page, q } });
  return data; // { items, page, total }
}
