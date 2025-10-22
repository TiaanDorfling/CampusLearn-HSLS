import express from "express";
import mongoose from "mongoose";
import { auth, requireRole } from "../middleware/auth.js";
import Topic from "../model/Topic.js";

const router = express.Router();

router.get("/", auth(true), async (req, res) => {
  try {
    const { topic, page = 1, limit = 20 } = req.query;
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.max(1, Math.min(parseInt(limit, 10), 100));

    const filter = {};
    if (topic) {
      if (!mongoose.Types.ObjectId.isValid(topic)) {
        return res.status(400).json({ error: "Invalid topic id" });
      }
      filter._id = topic;
    }

    const topics = await Topic.find(filter)
      .select("title resources")
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean();

    const items = [];
    for (const t of topics) {
      for (const r of t.resources || []) {
        items.push({
          _id: r._id,
          topicId: t._id,
          topicTitle: t.title,
          fileName: r.fileName,
          fileUrl: r.fileUrl,
          uploadedBy: r.uploadedBy,
          uploadedAt: r.uploadedAt,
        });
      }
    }
    res.json({ items, page: p, limit: l });
  } catch (err) {
    console.error("GET /resources error:", err);
    res.status(500).json({ error: "Failed to list resources" });
  }
});

router.get("/mine", auth(true), async (req, res) => {
  try {
    const uid = req.user._id;
    const topics = await Topic.find({ "resources.uploadedBy": uid })
      .select("title resources")
      .lean();

    const items = [];
    for (const t of topics) {
      for (const r of t.resources || []) {
        if (String(r.uploadedBy) === String(uid)) {
          items.push({
            _id: r._id,
            topicId: t._id,
            topicTitle: t.title,
            fileName: r.fileName,
            fileUrl: r.fileUrl,
            uploadedBy: r.uploadedBy,
            uploadedAt: r.uploadedAt,
          });
        }
      }
    }
    res.json({ items });
  } catch (err) {
    console.error("GET /resources/mine error:", err);
    res.status(500).json({ error: "Failed to list my resources" });
  }
});

router.delete("/:id", auth(true), async (req, res) => {
  try {
    const { id } = req.params;
    const { topic } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(topic)) {
      return res.status(400).json({ error: "Invalid id(s)" });
    }

    const doc = await Topic.findById(topic);
    if (!doc) return res.status(404).json({ error: "Topic not found" });

    const resource = doc.resources.id(id);
    if (!resource) return res.status(404).json({ error: "Resource not found" });

    const isOwner = String(resource.uploadedBy) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    resource.deleteOne();
    await doc.save();

    return res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /resources/:id error:", err);
    res.status(500).json({ error: "Failed to delete resource" });
  }
});

export default router;
