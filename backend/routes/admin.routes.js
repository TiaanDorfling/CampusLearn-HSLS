import express from "express";
import mongoose from "mongoose";

import AdminUser    from "../model/admin/AdminUser.js";
import AdminStudent from "../model/admin/AdminStudent.js";
import AdminTutor   from "../model/admin/AdminTutor.js";
import AdminCourse  from "../model/admin/AdminCourse.js";

const router = express.Router();
const aw = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const rx = (q) => new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

const pageArgs = (req) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize || "20", 10)));
  const q = (req.query.q && String(req.query.q).trim() !== "") ? String(req.query.q) : null;
  return { page, pageSize, q };
};

/* ---------------- STUDENTS ---------------- */
router.get("/students", aw(async (req, res) => {
  const { page, pageSize, q } = pageArgs(req);
  const pipeline = [
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
  ];
  if (q) {
    const s = rx(q);
    pipeline.push({ $match: { $or: [
      { "u.name": s }, { "u.email": s }, { studentNumber: s }, { year: s }, { "emergencyContact.phone": s },
    ]}});
  }
  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $facet: {
      items: [
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
        { $addFields: { name: "$u.name", email: "$u.email", phone: { $ifNull: ["$phone", "$emergencyContact.phone"] } } },
        { $project: { u: 0 } },
      ],
      meta: [{ $count: "total" }],
    } }
  );
  const out = await AdminStudent.aggregate(pipeline);
  res.json({ items: out?.[0]?.items || [], page, total: out?.[0]?.meta?.[0]?.total || 0 });
}));

router.get("/students/:id", aw(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
  const st = await AdminStudent.findById(id).populate("user");
  if (!st) return res.status(404).json({ message: "Student not found" });
  const obj = st.toObject();
  obj.name = st.user?.name || null;
  obj.email = st.user?.email || null;
  obj.phone = obj?.phone || obj?.emergencyContact?.phone || null;
  res.json(obj);
}));

router.post("/students", aw(async (req, res) => {
  const { name, email, year, phone, about, studentNumber, user: userId } = req.body;
  let u = (userId && mongoose.isValidObjectId(userId)) ? await AdminUser.findById(userId) : null;
  if (!u) {
    if (!name || !email) return res.status(400).json({ message: "name and email are required" });
    u = await AdminUser.create({ name, email, role: "student" });
  }
  const st = await AdminStudent.create({
    user: u._id,
    about: about || "",
    year: year != null ? String(year) : undefined,
    studentNumber,
    emergencyContact: phone ? { phone: String(phone) } : undefined,
  });
  const obj = st.toObject();
  obj.name = u.name; obj.email = u.email; obj.phone = obj?.emergencyContact?.phone || null;
  res.status(201).json(obj);
}));

router.put("/students/:id", aw(async (req, res) => {
  const { id } = req.params;
  const st = await AdminStudent.findById(id).populate("user");
  if (!st) return res.status(404).json({ message: "Student not found" });

  const { name, email, year, phone, about, studentNumber } = req.body;
  if (name || email) await AdminUser.findByIdAndUpdate(st.user._id, { ...(name?{name}:{}) , ...(email?{email}:{}) });

  st.about = about ?? st.about;
  st.year  = year != null ? String(year) : st.year;
  if (phone != null) st.emergencyContact = { ...(st.emergencyContact || {}), phone: String(phone) };
  if (studentNumber != null) st.studentNumber = studentNumber;
  await st.save();

  const obj = st.toObject();
  obj.name = name ?? st.user?.name;
  obj.email = email ?? st.user?.email;
  obj.phone = obj?.emergencyContact?.phone || null;
  res.json(obj);
}));

router.delete("/students/:id", aw(async (req, res) => {
  const { id } = req.params;
  const st = await AdminStudent.findById(id);
  if (!st) return res.status(404).json({ message: "Student not found" });
  await AdminStudent.findByIdAndDelete(id);
  res.json({ ok: true });
}));

/* ---------------- TUTORS ---------------- */
router.get("/tutors", aw(async (req, res) => {
  const { page, pageSize, q } = pageArgs(req);
  const pipeline = [
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
  ];
  if (q) {
    const s = rx(q);
    pipeline.push({ $match: { $or: [
      { "u.name": s }, { "u.email": s }, { phone: s }, { bio: s }, { tutorTopics: s }, { assignedModules: s },
    ]}});
  }
  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $facet: {
      items: [
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
        { $addFields: { name: "$u.name", email: "$u.email" } },
        { $project: { u: 0 } },
      ],
      meta: [{ $count: "total" }],
    } }
  );
  const out = await AdminTutor.aggregate(pipeline);
  res.json({ items: out?.[0]?.items || [], page, total: out?.[0]?.meta?.[0]?.total || 0 });
}));

router.get("/tutors/:id", aw(async (req, res) => {
  const t = await AdminTutor.findById(req.params.id).populate("user");
  if (!t) return res.status(404).json({ message: "Tutor not found" });
  const obj = t.toObject();
  obj.name = t.user?.name || null;
  obj.email = t.user?.email || null;
  res.json(obj);
}));

router.post("/tutors", aw(async (req, res) => {
  const { name, email, phone, bio, tutorTopics, assignedModules, uploadedResources, user: userId } = req.body;
  let u = (userId && mongoose.isValidObjectId(userId)) ? await AdminUser.findById(userId) : null;
  if (!u) {
    if (!name || !email) return res.status(400).json({ message: "name and email are required" });
    u = await AdminUser.create({ name, email, role: "tutor" });
  }
  const t = await AdminTutor.create({
    user: u._id, phone, bio,
    tutorTopics: tutorTopics || [], assignedModules: assignedModules || [], uploadedResources: uploadedResources || [],
  });
  const obj = t.toObject(); obj.name = u.name; obj.email = u.email;
  res.status(201).json(obj);
}));

router.put("/tutors/:id", aw(async (req, res) => {
  const t = await AdminTutor.findById(req.params.id).populate("user");
  if (!t) return res.status(404).json({ message: "Tutor not found" });
  const { name, email, phone, bio, tutorTopics, assignedModules, uploadedResources } = req.body;
  if (name || email) await AdminUser.findByIdAndUpdate(t.user._id, { ...(name?{name}:{}) , ...(email?{email}:{}) });
  if (phone != null) t.phone = phone;
  if (bio != null) t.bio = bio;
  if (tutorTopics != null) t.tutorTopics = tutorTopics;
  if (assignedModules != null) t.assignedModules = assignedModules;
  if (uploadedResources != null) t.uploadedResources = uploadedResources;
  await t.save();
  const obj = t.toObject(); obj.name = name ?? t.user?.name; obj.email = email ?? t.user?.email;
  res.json(obj);
}));

router.delete("/tutors/:id", aw(async (req, res) => {
  const t = await AdminTutor.findById(req.params.id);
  if (!t) return res.status(404).json({ message: "Tutor not found" });
  await AdminTutor.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

/* ---------------- COURSES ---------------- */
router.get("/courses", aw(async (req, res) => {
  const { page, pageSize, q } = pageArgs(req);
  const match = q ? { $or: [{ code: rx(q) }, { title: rx(q) }, { description: rx(q) }, { year: rx(q) }, { semester: rx(q) }] } : {};
  const [items, total] = await Promise.all([
    AdminCourse.find(match).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
    AdminCourse.countDocuments(match),
  ]);
  res.json({ items, page, total });
}));

router.get("/courses/:id", aw(async (req, res) => {
  const c = await AdminCourse.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Course not found" });
  res.json(c);
}));

router.post("/courses", aw(async (req, res) => {
  const { code, title, description, year, semester, tutors } = req.body;
  if (!code || !title) return res.status(400).json({ message: "code and title are required" });
  const c = await AdminCourse.create({
    code, title, description: description || "", year: year || "", semester: semester || "", tutors: tutors || [],
  });
  res.status(201).json(c);
}));

router.put("/courses/:id", aw(async (req, res) => {
  const { id } = req.params;
  const { code, title, description, year, semester, tutors } = req.body;
  const c = await AdminCourse.findById(id);
  if (!c) return res.status(404).json({ message: "Course not found" });
  if (code != null) c.code = code;
  if (title != null) c.title = title;
  if (description != null) c.description = description;
  if (year != null) c.year = year;
  if (semester != null) c.semester = semester;
  if (tutors != null) c.tutors = tutors;
  await c.save();
  res.json(c);
}));

router.delete("/courses/:id", aw(async (req, res) => {
  const c = await AdminCourse.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Course not found" });
  await AdminCourse.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

/* ---------------- ENROLLMENT (NEW) ---------------- */
router.post("/courses/:courseId/enroll", aw(async (req, res) => {
  const { courseId } = req.params;
  const { studentId } = req.body;

  if (!studentId) return res.status(400).json({ error: "studentId is required" });
  if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ error: "invalid ids" });
  }

  const [course, student] = await Promise.all([
    AdminCourse.findById(courseId),
    AdminStudent.findById(studentId),
  ]);
  if (!course)  return res.status(404).json({ error: "Course not found" });
  if (!student) return res.status(404).json({ error: "Student not found" });

  await Promise.all([
    AdminCourse.updateOne({ _id: course._id },  { $addToSet: { students: student._id } }),
    AdminStudent.updateOne({ _id: student._id },{ $addToSet: { courses:  course._id } }),
  ]);

  const updated = await AdminCourse.findById(courseId).lean();
  res.json({ ok: true, course: updated });
}));

router.post("/students/:studentId/enroll", aw(async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.body;

  if (!courseId) return res.status(400).json({ error: "courseId is required" });
  if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ error: "invalid ids" });
  }

  const [course, student] = await Promise.all([
    AdminCourse.findById(courseId),
    AdminStudent.findById(studentId),
  ]);
  if (!course)  return res.status(404).json({ error: "Course not found" });
  if (!student) return res.status(404).json({ error: "Student not found" });

  await Promise.all([
    AdminCourse.updateOne({ _id: course._id },  { $addToSet: { students: student._id } }),
    AdminStudent.updateOne({ _id: student._id },{ $addToSet: { courses:  course._id } }),
  ]);

  const updated = await AdminCourse.findById(courseId).lean();
  res.json({ ok: true, course: updated });
}));

router.delete("/courses/:courseId/students/:studentId", aw(async (req, res) => {
  const { courseId, studentId } = req.params;

  if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ error: "invalid ids" });
  }

  await Promise.all([
    AdminCourse.updateOne({ _id: courseId },  { $pull: { students: studentId } }),
    AdminStudent.updateOne({ _id: studentId },{ $pull: { courses:  courseId } }),
  ]);

  const updated = await AdminCourse.findById(courseId).lean();
  res.json({ ok: true, course: updated });
}));

export default router;
