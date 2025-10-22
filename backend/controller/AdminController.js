import User from "../model/UserModel.js";
import { ForumThread } from "../model/Forum.js";
import Topic from "../model/Topic.js";

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({}, "-passwordHash").lean();
    return res.json({ ok: true, count: users.length, users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ ok: false, error: "Failed to load users" });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const updated = await User.findByIdAndUpdate(id, { role }, { new: true }).lean();
    if (!updated) return res.status(404).json({ ok: false, error: "User not found" });
    return res.json({ ok: true, message: "Role updated", user: updated });
  } catch (err) {
    console.error("updateUserRole error:", err);
    return res.status(500).json({ ok: false, error: "Failed to update role" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ ok: false, error: "User not found" });
    return res.json({ ok: true, message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ ok: false, error: "Failed to delete user" });
  }
}

export async function getAllForumPosts(_req, res) {
  try {
    const posts = await ForumThread.find().sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, count: posts.length, posts });
  } catch (err) {
    console.error("getAllForumPosts error:", err);
    return res.status(500).json({ ok: false, error: "Failed to load posts" });
  }
}

export async function deleteForumPost(req, res) {
  try {
    const { id } = req.params;
    const deleted = await ForumThread.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ ok: false, error: "Post not found" });
    return res.json({ ok: true, message: "Post deleted" });
  } catch (err) {
    console.error("deleteForumPost error:", err);
    return res.status(500).json({ ok: false, error: "Failed to delete post" });
  }
}

export async function getHealth(_req, res) {
  return res.json({
    ok: true,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
}
