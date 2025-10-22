// backend/routes/tutorRoute.js
import express from "express";
import { auth } from "../middleware/auth.js";
import Tutor from "../model/TutorModel.js";
import User from "../model/UserModel.js";
import Student from "../model/StudentModel.js";

const router = express.Router();

/**
 * GET /api/tutor/me
 * Returns the tutor profile of the currently authenticated user.
 */
router.get("/me", auth(true), async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;

    const tutor = await Tutor.findOne({ user: uid })
      .populate("user", "name email role")
      .lean();

    return res.status(200).json({ tutor: tutor || null });
  } catch (err) {
    console.error("Error fetching tutor:", err);
    return res.status(500).json({ error: "Failed to fetch tutor profile" });
  }
});

/**
 * PUT /api/tutor/me
 * Creates or updates the current user's tutor profile.
 */
router.put("/me", auth(true), async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;

    const user = await User.findById(uid).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const patch = {
      bio: req.body.bio ?? undefined,
      phone: req.body.phone ?? undefined,
      assignedModules: req.body.assignedModules ?? undefined,
      tutorTopics: req.body.tutorTopics ?? undefined,
      uploadedResources: req.body.uploadedResources ?? undefined,
    };

    Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);

    const tutor = await Tutor.findOneAndUpdate(
      { user: uid },
      { $set: { user: uid, ...patch } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .populate("user", "name email role")
      .lean();

    return res.status(200).json({ tutor });
  } catch (err) {
    console.error("Error updating tutor:", err);
    return res.status(500).json({ error: "Failed to update tutor profile" });
  }
});

/**
 * GET /api/tutor/:tutorId/students
 * Lists students assigned to this tutor (if any).
 */
router.get("/:tutorId/students", auth(true), async (req, res) => {
  try {
    const { tutorId } = req.params;
    const q = req.query.q || "";
    const page = parseInt(req.query.page || "1", 10);
    const limit = 25;

    const tutor = await Tutor.findById(tutorId).lean();
    if (!tutor) return res.status(404).json({ error: "Tutor not found" });

    const query = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const students = await Student.find(query)
      .populate("user", "name email role")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Student.countDocuments(query);
    return res.status(200).json({ items: students, total, page });
  } catch (err) {
    console.error("Error fetching tutor students:", err);
    return res.status(500).json({ error: "Failed to fetch tutor's students" });
  }
});

export default router;
