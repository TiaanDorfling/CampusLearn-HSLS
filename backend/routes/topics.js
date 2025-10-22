// backend/routes/topics.js
import express from "express";
import { body, query } from "express-validator";
import { validate } from "../middleware/validate.js";
import { auth } from "../middleware/auth.js";
import Topic from "../model/Topic.js";
import upload from "../utils/upload.js";

const router = express.Router();

// ============================================================================
// GET /api/topics?keyword=
// ============================================================================
router.get(
  "/",
  [query("keyword").optional().isString().trim().isLength({ min: 1 })],
  validate,
  auth(true),
  async (req, res) => {
    try {
      const { keyword } = req.query;
      const filter = keyword ? { $text: { $search: keyword } } : {};
      const topics = await Topic.find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .select(
          "title body moduleCode creatorId createdAt subscribers resources broadcasts"
        )
        .populate("creatorId", "name email role")
        .lean()
        .exec();

      return res.status(200).json({
        message: "Topics fetched successfully.",
        count: topics.length,
        topics,
      });
    } catch (err) {
      console.error("GET /topics", err);
      return res.status(500).json({ error: "Failed to fetch topics" });
    }
  }
);

// ============================================================================
// POST /api/topics  →  Create Topic
// ============================================================================
router.post(
  "/",
  auth(true),
  [
    body("title").isString().trim().isLength({ min: 3 }),
    body("description").isString().trim().isLength({ min: 5 }),
    body("moduleCode").isString().trim().isLength({ min: 2 }),
    body("tags").optional().isArray().custom((arr) => arr.every((t) => typeof t === "string")),
  ],
  validate,
  async (req, res) => {
    try {
      const { title, description, moduleCode, tags = [] } = req.body;
      const topic = await Topic.create({
        title,
        body: description,
        moduleCode,
        tags,
        creatorId: req.user.id,
      });

      return res.status(201).json({
        message: "Topic created successfully.",
        topic,
      });
    } catch (err) {
      console.error("POST /topics", err);
      return res.status(500).json({ error: "Failed to create topic" });
    }
  }
);

// ============================================================================
// POST /api/topics/:id/subscribe
// ============================================================================
router.post("/:id/subscribe", auth(true), async (req, res) => {
  try {
    const { id: topicId } = req.params;
    const userId = req.user._id;

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found." });

    await topic.addSubscriber(userId);

    return res.status(200).json({
      message: "Subscribed successfully.",
      topicId,
      subscriberCount: topic.subscribers.length,
    });
  } catch (error) {
    console.error("POST /topics/:id/subscribe", error);
    return res.status(500).json({ message: "Server error while subscribing." });
  }
});

// ============================================================================
// DELETE /api/topics/:id/unsubscribe
// ============================================================================
router.delete("/:id/unsubscribe", auth(true), async (req, res) => {
  try {
    const { id: topicId } = req.params;
    const userId = req.user._id;

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found." });

    await topic.removeSubscriber(userId);

    return res.status(200).json({
      message: "Unsubscribed successfully.",
      topicId,
      subscriberCount: topic.subscribers.length,
    });
  } catch (error) {
    console.error("DELETE /topics/:id/unsubscribe", error);
    return res.status(500).json({ message: "Server error while unsubscribing." });
  }
});

// ============================================================================
// POST /api/topics/:id/resource → upload file
// Accepts form field name "resourceFile" OR "file".
// ============================================================================
router.post(
  "/:id/resource",
  auth(true),
  // allow either field name
  (req, res, next) => {
    const handler = upload.single("resourceFile");
    handler(req, res, (err) => {
      if (err?.code === "LIMIT_UNEXPECTED_FILE" || !req.file) {
        return upload.single("file")(req, res, next);
      }
      return err ? next(err) : next();
    });
  },
  async (req, res) => {
    try {
      const { id: topicId } = req.params;
      const file = req.file;
      const userId = req.user._id;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded or file failed validation." });
      }

      const topic = await Topic.findById(topicId);
      if (!topic) return res.status(404).json({ message: "Topic not found." });

      const resourceData = {
        fileName: file.originalname,
        fileUrl: `/uploads/topic-resources/${file.filename}`, // served by app.js
        uploadedBy: userId,
        uploadedAt: new Date(),
      };

      await topic.addResource(resourceData);

      return res.status(201).json({
        message: "Resource uploaded successfully.",
        resource: resourceData,
      });
    } catch (error) {
      console.error("File Upload Error:", error);
      return res.status(500).json({ message: "Server error during file upload." });
    }
  }
);

// ============================================================================
// POST /api/topics/:id/broadcast → tutor/admin messages
// ============================================================================
router.post("/:id/broadcast", auth(true), async (req, res) => {
  try {
    const { id: topicId } = req.params;
    const { message } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ message: "Topic not found." });

    topic.broadcasts.push({
      message,
      sentAt: new Date(),
      sentBy: req.user._id,
    });

    await topic.save();

    return res.status(200).json({
      message: "Broadcast sent successfully.",
      topicId,
    });
  } catch (error) {
    console.error("POST /topics/:id/broadcast", error);
    return res.status(500).json({ message: "Failed to send broadcast." });
  }
});

export default router;
