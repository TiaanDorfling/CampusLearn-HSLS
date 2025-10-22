import express from "express";
import { auth } from "../middleware/auth.js";
import Student from "../model/Student.js";
import User from "../model/UserModel.js";

const router = express.Router();

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

    return res.status(200).json({ student: student || null });
  } catch (err) {
    console.error("Error fetching student:", err);
    return res.status(500).json({ error: "Failed to fetch student profile" });
  }
});

router.put("/me", auth(true), async (req, res) => {
  try {
    const uid = req.user._id || req.user.id;

    const user = await User.findById(uid).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const patch = {
      studentNumber: req.body.studentNumber,
      year: req.body.year,
      phone: req.body.phone,
      about: req.body.about,
      emergencyContact: req.body.emergencyContact,
    };
    Object.keys(patch).forEach(k => patch[k] === undefined && delete patch[k]);

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

export default router;
