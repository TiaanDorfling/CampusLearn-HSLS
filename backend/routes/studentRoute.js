// backend/routes/studentRoute.js
import express from "express";
import { auth } from "../middleware/auth.js";
import Student from "../model/StudentModel.js";
import User from "../model/UserModel.js";

const router = express.Router();

/**
 * GET /api/student/me
 * Returns the current user's student profile.
 */
router.get("/me", auth(true), async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;

    const user = await User.findById(uid).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const student = await Student.findOne({ user: uid })
      .populate("user", "name email role")
      .lean();

    if (!student) {
      return res.status(200).json({ student: null });
    }

    return res.status(200).json({ student });
  } catch (err) {
    console.error("Error fetching student:", err);
    return res.status(500).json({ error: "Failed to fetch student profile" });
  }
});

/**
 * PUT /api/student/me
 * Creates or updates a student profile for the logged-in user.
 */
router.put("/me", auth(true), async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;

    const user = await User.findById(uid).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const patch = {
      studentNumber: req.body.studentNumber ?? undefined,
      year: req.body.year ?? undefined,
      phone: req.body.phone ?? undefined,
      about: req.body.about ?? undefined,
      emergencyContact: req.body.emergencyContact ?? undefined,
    };

    Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);

    const student = await Student.findOneAndUpdate(
      { user: uid },
      { $set: { user: uid, ...patch } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .populate("user", "name email role")
      .lean();

    return res.status(200).json({ student });
  } catch (err) {
    console.error("Error updating student:", err);
    return res.status(500).json({ error: "Failed to update student profile" });
  }
});

/**
 * GET /api/student/:email
 * Finds a student profile by their associated user's email.
 */
router.get("/:email", auth(true), async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const student = await Student.findOne({ user: user._id })
      .populate("user", "name email role")
      .lean();

    if (!student) return res.status(404).json({ error: "Student profile not found" });

    return res.status(200).json({ student });
  } catch (err) {
    console.error("Error fetching student by email:", err);
    return res.status(500).json({ error: "Failed to fetch student by email" });
  }
});

export default router;
