// frontend/src/api/adminapi.js
import api from "./axios";

// Try multiple paths in order; succeed on the first that works
async function trySeq(requestFns) {
  let lastErr;
  for (const fn of requestFns) {
    try {
      return await fn();
    } catch (err) {
      const s = err?.response?.status || err?.status;
      // continue only on 404/405/Not Found/Method Not Allowed
      if (s === 404 || s === 405) { lastErr = err; continue; }
      lastErr = err; break;
    }
  }
  throw lastErr || new Error("All endpoints failed");
}

const shape = (res) => ({
  items: Array.isArray(res?.items) ? res.items : [],
  page:  res?.page ?? 1,
  total: res?.total ?? (Array.isArray(res?.items) ? res.items.length : 0),
});

const qp = ({ page=1, pageSize=20, q }={}) => {
  const p = { page, pageSize };
  if (q != null && String(q).trim() !== "") p.q = q;
  return p;
};

/* -------------------- STUDENTS -------------------- */
export async function listStudents({ page=1, pageSize=20, q, all=false } = {}) {
  const fetchPage = async (pg) => {
    const { data } = await trySeq([
      () => api.get("/admin/students", { params: qp({ page: pg, pageSize, q }) }),
      () => api.get("/students",       { params: qp({ page: pg, pageSize, q }) }),
      () => api.get("/student",        { params: qp({ page: pg, pageSize, q }) }),
    ]);
    return shape(data);
  };

  if (!all) return fetchPage(page);

  // Aggregate all pages
  const acc = []; let pg = 1, total = 0;
  for (;;) {
    const { items, total: t } = await fetchPage(pg);
    if (pg === 1) total = t || items.length;
    if (!items.length) break;
    acc.push(...items);
    if (total && acc.length >= total) break;
    pg += 1;
    if (pg > 100) break; // safety cap
  }
  return { items: acc, page: 1, total: total || acc.length };
}
export async function getStudent(id) {
  const { data } = await trySeq([
    () => api.get(`/admin/students/${id}`),
    () => api.get(`/students/${id}`),
    () => api.get(`/student/${id}`),
  ]);
  return data;
}
export async function createStudent(body) {
  // Accept {name,email,year,phone}; map to common shape
  const payload = {
    name:  body.name,
    email: body.email,
    year:  body.year != null ? String(body.year) : undefined,
    phone: body.phone != null ? String(body.phone) : undefined,
  };
  const { data } = await trySeq([
    () => api.post("/admin/students", payload),
    // fallback: older plural/singular versions
    () => api.post("/students", payload),
    () => api.post("/student",  payload),
  ]);
  return data;
}
export async function updateStudent(id, patch) {
  const payload = {
    name:  patch.name,
    year:  patch.year != null ? String(patch.year) : undefined,
    phone: patch.phone != null ? String(patch.phone) : undefined,
  };
  const { data } = await trySeq([
    () => api.put(`/admin/students/${id}`, payload),
    () => api.put(`/students/${id}`,      payload),
    () => api.put(`/student/${id}`,       payload),
  ]);
  return data;
}
export async function deleteStudent(id) {
  const { data } = await trySeq([
    () => api.delete(`/admin/students/${id}`),
    () => api.delete(`/students/${id}`),
    () => api.delete(`/student/${id}`),
  ]);
  return data;
}

/* -------------------- TUTORS -------------------- */
export async function listTutors({ page=1, pageSize=20, q, all=false } = {}) {
  const fetchPage = async (pg) => {
    const { data } = await trySeq([
      () => api.get("/admin/tutors", { params: qp({ page: pg, pageSize, q }) }),
      () => api.get("/tutors",       { params: qp({ page: pg, pageSize, q }) }),
      () => api.get("/tutor",        { params: qp({ page: pg, pageSize, q }) }),
    ]);
    return shape(data);
  };
  if (!all) return fetchPage(page);
  const acc=[]; let pg=1, total=0;
  for(;;){ const r=await fetchPage(pg); if(pg===1) total=r.total||r.items.length;
    if(!r.items.length) break; acc.push(...r.items);
    if(total && acc.length>=total) break; pg++; if(pg>100) break; }
  return { items: acc, page: 1, total: total || acc.length };
}
export async function getTutor(id){
  const { data } = await trySeq([
    () => api.get(`/admin/tutors/${id}`),
    () => api.get(`/tutors/${id}`),
    () => api.get(`/tutor/${id}`),
  ]); return data;
}
export async function createTutor(body){
  const { data } = await trySeq([
    () => api.post("/admin/tutors", body),
    () => api.post("/tutors", body),
    () => api.post("/tutor",  body),
  ]); return data;
}
export async function updateTutor(id, patch){
  const { data } = await trySeq([
    () => api.put(`/admin/tutors/${id}`, patch),
    () => api.put(`/tutors/${id}`,      patch),
    () => api.put(`/tutor/${id}`,       patch),
  ]); return data;
}
export async function deleteTutor(id){
  const { data } = await trySeq([
    () => api.delete(`/admin/tutors/${id}`),
    () => api.delete(`/tutors/${id}`),
    () => api.delete(`/tutor/${id}`),
  ]); return data;
}

/* -------------------- COURSES -------------------- */
export async function listCourses({ page=1, pageSize=20, q, all=false } = {}) {
  const fetchPage = async (pg) => {
    const { data } = await trySeq([
      () => api.get("/admin/courses", { params: qp({ page: pg, pageSize, q }) }),
      () => api.get("/courses",       { params: qp({ page: pg, pageSize, q }) }),
      () => api.get("/course",        { params: qp({ page: pg, pageSize, q }) }),
    ]);
    return shape(data);
  };
  if (!all) return fetchPage(page);
  const acc=[]; let pg=1, total=0;
  for(;;){ const r=await fetchPage(pg); if(pg===1) total=r.total||r.items.length;
    if(!r.items.length) break; acc.push(...r.items);
    if(total && acc.length>=total) break; pg++; if(pg>100) break; }
  return { items: acc, page: 1, total: total || acc.length };
}
export async function getCourse(id){
  const { data } = await trySeq([
    () => api.get(`/admin/courses/${id}`),
    () => api.get(`/courses/${id}`),
    () => api.get(`/course/${id}`),
  ]); return data;
}
export async function createCourse(body){
  const { data } = await trySeq([
    () => api.post("/admin/courses", body),
    () => api.post("/courses", body),
    () => api.post("/course",  body),
  ]); return data;
}
export async function updateCourse(id, patch){
  const { data } = await trySeq([
    () => api.put(`/admin/courses/${id}`, patch),
    () => api.put(`/courses/${id}`,      patch),
    () => api.put(`/course/${id}`,       patch),
  ]); return data;
}
export async function deleteCourse(id){
  const { data } = await trySeq([
    () => api.delete(`/admin/courses/${id}`),
    () => api.delete(`/courses/${id}`),
    () => api.delete(`/course/${id}`),
  ]); return data;
}

const adminapi = {
  students: { list: listStudents, get: getStudent, create: createStudent, update: updateStudent, remove: deleteStudent },
  tutors:   { list: listTutors,   get: getTutor,   create: createTutor,   update: updateTutor,   remove: deleteTutor   },
  courses:  { list: listCourses,  get: getCourse,  create: createCourse,  update: updateCourse,  remove: deleteCourse  },
};
export default adminapi;
