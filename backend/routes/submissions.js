import express from "express";
import mongoose from "mongoose";
import { body, query, param } from "express-validator";
import { auth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import Submission from "../model/Submission.js";
import mongoosePkg from "mongoose";
const { Schema } = mongoosePkg;

const Notification =
  mongoose.models.Notification ||
  mongoose.model(
    "Notification",
    new Schema(
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
        type: { type: String, required: true },
        title: { type: String, required: true },
        message: { type: String, default: "" },
        meta: { type: Object, default: {} },
        isRead: { type: Boolean, default: false, index: true },
      },
      { timestamps: true, collection: "notifications" }
    )
  );

const router = express.Router();

router.post(
  "/",
  auth(true),
  requireRole("student"),
  [
    body("courseCode").isString().trim().isLength({ min: 3 }),
    body("title").isString().trim().isLength({ min: 3 }),
    body("fileUrl").isString().trim().isLength({ min: 5 }),
  ],
  validate,
  async (req, res) => {
    try {
      const sub = await Submission.create({
        student: req.user._id,
        courseCode: req.body.courseCode,
        title: req.body.title,
        fileUrl: req.body.fileUrl,
      });
      return res.status(201).json({ submission: sub });
    } catch (err) {
      console.error("POST /submissions error:", err);
      return res.status(500).json({ error: "Failed to submit assignment" });
    }
  }
);

router.get("/mine", auth(true), requireRole("student"), async (req, res) => {
  try {
    const items = await Submission.find({ student: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (err) {
    console.error("GET /submissions/mine error:", err);
    res.status(500).json({ error: "Failed to list my submissions" });
  }
});

router.get(
  "/",
  auth(true),
  requireRole("tutor", "admin"),
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { q = "", course = "", page = 1, limit = 25 } = req.query;
      const p = Math.max(1, parseInt(page, 10));
      const l = Math.max(1, Math.min(parseInt(limit, 10), 100));

      const filter = {};
      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: "i" } },
          { fileUrl: { $regex: q, $options: "i" } },
        ];
      }
      if (course) filter.courseCode = course;

      const [items, total] = await Promise.all([
        Submission.find(filter)
          .populate("student", "name email")
          .sort({ createdAt: -1 })
          .skip((p - 1) * l)
          .limit(l)
          .lean(),
        Submission.countDocuments(filter),
      ]);

      res.json({ items, total, page: p, limit: l });
    } catch (err) {
      console.error("GET /submissions error:", err);
      res.status(500).json({ error: "Failed to list submissions" });
    }
  }
);

router.patch(
  "/:id",
  auth(true),
  requireRole("tutor", "admin"),
  [
    param("id").isMongoId(),
    body("status").optional().isIn(["submitted", "graded", "returned"]),
    body("grade").optional().isFloat({ min: 0, max: 100 }),
    body("feedback").optional().isString().trim().isLength({ min: 0 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const patch = {};
      if (req.body.status) patch.status = req.body.status;
      if (req.body.grade !== undefined) patch.grade = Number(req.body.grade);
      if (req.body.feedback !== undefined) patch.feedback = req.body.feedback;
      patch.tutor = req.user._id;

      const sub = await Submission.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
      if (!sub) return res.status(404).json({ error: "Submission not found" });

      await Notification.create({
        userId: sub.student,
        type: "SUBMISSION_GRADED",
        title: `Submission updated: ${sub.title}`,
        message: `Your submission has been ${sub.status}${sub.grade != null ? ` (Grade: ${sub.grade})` : ""}.`,
        meta: { submissionId: sub._id, courseCode: sub.courseCode },
      });

      return res.json({ submission: sub });
    } catch (err) {
      console.error("PATCH /submissions/:id error:", err);
      res.status(500).json({ error: "Failed to update submission" });
    }
  }
);

export default router;
