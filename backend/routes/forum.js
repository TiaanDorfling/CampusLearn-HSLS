// backend/routes/forum.js
import express from "express";
import jwt from "jsonwebtoken";
import { ForumCategory, ForumThread, ForumPost } from "../model/Forum.js";

const router = express.Router();

// === JWT auth middleware ===
function requireAuth(req, res, next) {
  const token = req.cookies?.jwt;
  if (!token) return res.status(401).json({ ok: false, message: "Not authenticated" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.sub || decoded.id || decoded._id;
    req.userRole = decoded.role || "student";
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
}

// Default categories (idempotent seeding)
const DEFAULT_FORUM_CATEGORIES = [
  { name: "Need a Helping Hand", description: "Ask for help, share resources, get unstuck." },
  { name: "Classes",             description: "Class discussions, notes, labs, and tips." },
  { name: "Internship",          description: "Opportunities, CV advice, interviews." },
  { name: "Exam",                description: "Past papers, prep threads, strategies." },
  { name: "General",             description: "Anything that doesn’t fit elsewhere." },
];

//
// ─── FORUM CATEGORIES ───────────────────────────────────────────────────────────
//

// POST /categories — create category
router.post("/categories", requireAuth, async (req, res) => {
  try {
    const category = await ForumCategory.create({
      name: req.body.name,
      description: req.body.description,
    });
    res.status(201).json({ ok: true, category });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /categories — list all
router.get("/categories", async (_req, res) => {
  try {
    const cats = await ForumCategory.find().sort("name");
    res.json({ ok: true, categories: cats });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /categories/seed-defaults — create missing defaults (idempotent)
router.post("/categories/seed-defaults", requireAuth, async (_req, res) => {
  try {
    let created = 0;
    for (const c of DEFAULT_FORUM_CATEGORIES) {
      const r = await ForumCategory.updateOne(
        { name: c.name },
        { $setOnInsert: { name: c.name, description: c.description || "" } },
        { upsert: true }
      );
      if (r.upsertedId) created++;
    }
    const cats = await ForumCategory.find().sort("name");
    res.json({ ok: true, created, categories: cats });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

//
// ─── THREADS ────────────────────────────────────────────────────────────────────
//

// POST /threads — create thread (and optional opening post via `body`)
router.post("/threads", requireAuth, async (req, res) => {
  try {
    const { categoryId, title, body } = req.body;
    if (!title) return res.status(400).json({ ok: false, message: "Missing title" });

    const thread = await ForumThread.create({
      category: categoryId || undefined,
      author: req.userId,
      authorRole: req.userRole,
      title,
    });

    if (body && body.trim().length) {
      await ForumPost.create({
        thread: thread._id,
        author: req.userId,
        authorRole: req.userRole,
        content: body,
      });
    }

    res.status(201).json({ ok: true, thread });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /threads — list threads (optional ?category=)
router.get("/threads", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const threads = await ForumThread.find(filter)
      .populate("category author")
      .sort("-createdAt");
    res.json({ ok: true, threads });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /threads/:id — single thread
router.get("/threads/:id", async (req, res) => {
  try {
    const t = await ForumThread.findById(req.params.id).populate("category author");
    if (!t) return res.status(404).json({ ok: false, message: "Not found" });
    res.json({ ok: true, thread: t });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /threads/:id/posts — posts within a thread
router.get("/threads/:id/posts", async (req, res) => {
  try {
    const posts = await ForumPost.find({ thread: req.params.id })
      .populate("author")
      .sort("createdAt");
    res.json({ ok: true, posts });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

//
// ─── POSTS ──────────────────────────────────────────────────────────────────────
//

// POST /posts — create post/reply
router.post("/posts", requireAuth, async (req, res) => {
  try {
    const { threadId, content } = req.body;
    if (!threadId || !content) {
      return res.status(400).json({ ok: false, message: "threadId and content are required" });
    }
    const post = await ForumPost.create({
      thread: threadId,
      author: req.userId,
      authorRole: req.userRole,
      content,
    });
    res.status(201).json({ ok: true, post });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /posts?thread=:id — list posts for a thread (back-compat)
router.get("/posts", async (req, res) => {
  try {
    if (!req.query.thread)
      return res.status(400).json({ ok: false, message: "Missing ?thread=id" });
    const posts = await ForumPost.find({ thread: req.query.thread })
      .populate("author")
      .sort("createdAt");
    res.json({ ok: true, posts });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

//
// ─── READ TRACKING (OPTIONAL UX) ────────────────────────────────────────────────
//

// POST /posts/:id/read — mark a single post read
router.post("/posts/:id/read", requireAuth, async (req, res) => {
  try {
    const now = new Date();
    await ForumPost.updateOne(
      { _id: req.params.id, "readBy.user": { $ne: req.userId } },
      { $addToSet: { readBy: { user: req.userId, readAt: now } } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /threads/:id/read-all — mark all posts in thread read
router.post("/threads/:id/read-all", requireAuth, async (req, res) => {
  try {
    const now = new Date();
    await ForumPost.updateMany(
      { thread: req.params.id, "readBy.user": { $ne: req.userId } },
      { $addToSet: { readBy: { user: req.userId, readAt: now } } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
