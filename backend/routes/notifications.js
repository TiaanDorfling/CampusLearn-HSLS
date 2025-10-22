import express from "express";
import mongoose from "mongoose";
import { auth } from "../middleware/auth.js";

const router = express.Router();
const Notification =
  mongoose.models.Notification ||
  mongoose.model(
    "Notification",
    new mongoose.Schema(
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
        type: { type: String, default: "system" },
        title: { type: String, default: "" },
        body: { type: String, default: "" },
        link: { type: String, default: "" },
        read: { type: Boolean, default: false, index: true },
        meta: { type: Object, default: {} },
      },
      { timestamps: true, collection: "notifications" }
    )
  );

// LIST MY NOTIFICATIONS
router.get("/", auth(true), async (req, res) => {
  try {
    const userId = req.user._id;
    const items = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ ok: true, count: items.length, items });
  } catch (err) {
    console.error("notifications:list error:", err);
    res.status(500).json({ ok: false, error: "Failed to fetch notifications" });
  }
});

router.get("/badge", auth(true), async (req, res) => {
  try {
    const userId = req.user._id;
    const unread = await Notification.countDocuments({ userId, read: false });
    res.json({ ok: true, unread });
  } catch (err) {
    console.error("notifications:badge error:", err);
    res.status(500).json({ ok: false, error: "Failed to fetch badge count" });
  }
});

router.patch("/:id/read", auth(true), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const updated = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ ok: false, error: "Notification not found" });
    res.json({ ok: true, notification: updated });
  } catch (err) {
    console.error("notifications:markOne error:", err);
    res.status(500).json({ ok: false, error: "Failed to update notification" });
  }
});

router.patch("/read-all", auth(true), async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    res.json({ ok: true, matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    console.error("notifications:readAll error:", err);
    res.status(500).json({ ok: false, error: "Failed to mark all as read" });
  }
});

router.delete("/:id", auth(true), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deleted = await Notification.findOneAndDelete({ _id: id, userId }).lean();
    if (!deleted) return res.status(404).json({ ok: false, error: "Notification not found" });
    res.json({ ok: true, message: "Notification deleted" });
  } catch (err) {
    console.error("notifications:delete error:", err);
    res.status(500).json({ ok: false, error: "Failed to delete notification" });
  }
});

export default router;
