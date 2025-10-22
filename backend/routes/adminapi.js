// backend/routes/adminapi.js
import express from "express";
import mongoose from "mongoose";

// Admin-only models (safe names)
import AdminUser from "../models/admin/AdminUser.js";
import AdminStudent from "../models/admin/AdminStudent.js";
import AdminTutor from "../models/admin/AdminTutor.js";
import AdminCourse from "../models/admin/AdminCourse.js";

const router = express.Router();
const asyncWrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const rx = (q) => new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
const pageArgs = (req) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize || "20", 10)));
  const q = (req.query.q && String(req.query.q).trim() !== "") ? String(req.query.q) : null;
  return { page, pageSize, q };
};

/* -------------------- STUDENTS -------------------- */
router.get("/students", asyncWrap(async (req, res) => {
  const { page, pageSize, q } = pageArgs(req);
  const pipeline = [
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
  ];
  if (q) {
    const s = rx(q);
    pipeline.push({
      $match: {
        $or: [
          { "u.name": s }, { "u.email": s }, { studentNumber: s }, { year: s },
          { "emergencyContact.phone": s },
        ],
      },
    });
  }
  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        items: [
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
          {
            $addFields: {
              name: "$u.name",
              email: "$u.email",
              phone: { $ifNull: ["$phone", "$emergencyContact.phone"] },
            },
          },
          { $project: { u: 0 } },
        ],
        meta: [{ $count: "total" }],
      },
    }
  );
  const out = await AdminStudent.aggregate(pipeline);
  res.json({ items: out?.[0]?.items || [], page, total: out?.[0]?.meta?.[0]?.total || 0 });
}));

router.get("/students/:id", asyncWrap(async (req, res) => {
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

router.post("/students", asyncWrap(async (req, res) => {
  const { name, email, year, phone, about, studentNumber, user: userId } = req.body;

  let userDoc = null;
  if (userId && mongoose.isValidObjectId(userId)) userDoc = await AdminUser.findById(userId);
  if (!userDoc) {
    if (!name || !email) return res.status(400).json({ message: "name and email are required" });
    userDoc = await AdminUser.create({ name, email, role: "student" });
  }

  const st = await AdminStudent.create({
    user: userDoc._id,
    about: about || "",
    year: year != null ? String(year) : undefined,
    studentNumber,
    emergencyContact: phone ? { phone: String(phone) } : undefined,
  });

  const obj = st.toObject();
  obj.name = userDoc.name;
  obj.email = userDoc.email;
  obj.phone = obj?.emergencyContact?.phone || null;
  res.status(201).json(obj);
}));

router.put("/students/:id", asyncWrap(async (req, res) => {
  const { id } = req.params;
  const { name, email, year, phone, about, studentNumber } = req.body;

  const st = await AdminStudent.findById(id).populate("user");
  if (!st) return res.status(404).json({ message: "Student not found" });

  if (name || email) {
    await AdminUser.findByIdAndUpdate(st.user._id, { ...(name ? { name } : {}), ...(email ? { email } : {}) });
  }

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

router.delete("/students/:id", asyncWrap(async (req, res) => {
  const { id } = req.params;
  const st = await AdminStudent.findById(id);
  if (!st) return res.status(404).json({ message: "Student not found" });
  await AdminStudent.findByIdAndDelete(id);
  res.json({ ok: true });
}));

/* -------------------- TUTORS -------------------- */
router.get("/tutors", asyncWrap(async (req, res) => {
  const { page, pageSize, q } = pageArgs(req);
  const pipeline = [
    { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "u" } },
    { $unwind: { path: "$u", preserveNullAndEmptyArrays: true } },
  ];
  if (q) {
    const s = rx(q);
    pipeline.push({
      $match: {
        $or: [
          { "u.name": s }, { "u.email": s }, { phone: s }, { bio: s },
          { tutorTopics: s }, { assignedModules: s },
        ],
      },
    });
  }
  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        items: [
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
          { $addFields: { name: "$u.name", email: "$u.email" } },
          { $project: { u: 0 } },
        ],
        meta: [{ $count: "total" }],
      },
    }
  );
  const out = await AdminTutor.aggregate(pipeline);
  res.json({ items: out?.[0]?.items || [], page, total: out?.[0]?.meta?.[0]?.total || 0 });
}));

router.get("/tutors/:id", asyncWrap(async (req, res) => {
  const t = await AdminTutor.findById(req.params.id).populate("user");
  if (!t) return res.status(404).json({ message: "Tutor not found" });
  const obj = t.toObject();
  obj.name = t.user?.name || null;
  obj.email = t.user?.email || null;
  res.json(obj);
}));

router.post("/tutors", asyncWrap(async (req, res) => {
  const { name, email, phone, bio, tutorTopics, assignedModules, uploadedResources, user: userId } = req.body;
  let userDoc = userId && mongoose.isValidObjectId(userId) ? await AdminUser.findById(userId) : null;
  if (!userDoc) {
    if (!name || !email) return res.status(400).json({ message: "name and email are required" });
    userDoc = await AdminUser.create({ name, email, role: "tutor" });
  }
  const t = await AdminTutor.create({
    user: userDoc._id,
    phone, bio,
    tutorTopics: tutorTopics || [],
    assignedModules: assignedModules || [],
    uploadedResources: uploadedResources || [],
  });
  const obj = t.toObject();
  obj.name = userDoc.name; obj.email = userDoc.email;
  res.status(201).json(obj);
}));

router.put("/tutors/:id", asyncWrap(async (req, res) => {
  const { id } = req.params;
  const t = await AdminTutor.findById(id).populate("user");
  if (!t) return res.status(404).json({ message: "Tutor not found" });

  const { name, email, phone, bio, tutorTopics, assignedModules, uploadedResources } = req.body;
  if (name || email) {
    await AdminUser.findByIdAndUpdate(t.user._id, { ...(name ? { name } : {}), ...(email ? { email } : {}) });
  }
  if (phone != null) t.phone = phone;
  if (bio != null) t.bio = bio;
  if (tutorTopics != null) t.tutorTopics = tutorTopics;
  if (assignedModules != null) t.assignedModules = assignedModules;
  if (uploadedResources != null) t.uploadedResources = uploadedResources;
  await t.save();

  const obj = t.toObject();
  obj.name = name ?? t.user?.name;
  obj.email = email ?? t.user?.email;
  res.json(obj);
}));

router.delete("/tutors/:id", asyncWrap(async (req, res) => {
  const { id } = req.params;
  const t = await AdminTutor.findById(id);
  if (!t) return res.status(404).json({ message: "Tutor not found" });
  await AdminTutor.findByIdAndDelete(id);
  res.json({ ok: true });
}));

/* -------------------- COURSES -------------------- */
router.get("/courses", asyncWrap(async (req, res) => {
  const { page, pageSize, q } = pageArgs(req);
  const match = q ? { $or: [{ code: rx(q) }, { title: rx(q) }, { description: rx(q) }, { year: rx(q) }, { semester: rx(q) }] } : {};

  const [items, total] = await Promise.all([
    AdminCourse.find(match).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
    AdminCourse.countDocuments(match),
  ]);
  res.json({ items, page, total });
}));

router.get("/courses/:id", asyncWrap(async (req, res) => {
  const c = await AdminCourse.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Course not found" });
  res.json(c);
}));

router.post("/courses", asyncWrap(async (req, res) => {
  const { code, title, description, year, semester, tutors } = req.body;
  if (!code || !title) return res.status(400).json({ message: "code and title are required" });
  const c = await AdminCourse.create({
    code, title, description: description || "", year: year || "", semester: semester || "", tutors: tutors || [],
  });
  res.status(201).json(c);
}));

router.put("/courses/:id", asyncWrap(async (req, res) => {
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

router.delete("/courses/:id", asyncWrap(async (req, res) => {
  const { id } = req.params;
  const c = await AdminCourse.findById(id);
  if (!c) return res.status(404).json({ message: "Course not found" });
  await AdminCourse.findByIdAndDelete(id);
  res.json({ ok: true });
}));

export default router;
