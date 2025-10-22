// controller/AdminController.js
import User from "../model/UserModel.js";
import { ForumPost, ForumThread } from "../model/Forum.js";

/** Fetch all users (admin panel) */
export async function getAllUsers(_req, res) {
  try {
    const users = await User.find({}, "-passwordHash").sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, count: users.length, users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ ok: false, error: "Failed to load users" });
  }
}

/** Update user role */
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'tutor', 'student'].includes(role)) {
      return res.status(400).json({ ok: false, error: "Invalid role" });
    }
    const updated = await User.findByIdAndUpdate(id, { role }, { new: true, projection: "-passwordHash" });
    if (!updated) return res.status(404).json({ ok: false, error: "User not found" });
    return res.json({ ok: true, message: "Role updated", user: updated });
  } catch (err) {
    console.error("updateUserRole error:", err);
    return res.status(500).json({ ok: false, error: "Failed to update role" });
  }
}

/** Delete user */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ ok: false, error: "User not found" });
    return res.json({ ok: true, message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ ok: false, error: "Failed to delete user" });
  }
}

/** Get all forum posts (admin view) */
export async function getAllForumPosts(_req, res) {
  try {
    const posts = await ForumPost.find()
      .populate("author", "name email role")
      .populate({ path: "thread", select: "title createdAt" })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ ok: true, count: posts.length, posts });
  } catch (err) {
    console.error("getAllForumPosts error:", err);
    return res.status(500).json({ ok: false, error: "Failed to load posts" });
  }
}

/** Delete a forum post */
export async function deleteForumPost(req, res) {
  try {
    const { id } = req.params;
    const deleted = await ForumPost.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ ok: false, error: "Post not found" });
    return res.json({ ok: true, message: "Post deleted" });
  } catch (err) {
    console.error("deleteForumPost error:", err);
    return res.status(500).json({ ok: false, error: "Failed to delete post" });
  }
}

/** System health (admin) */
export async function getHealth(_req, res) {
  return res.json({
    ok: true,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
}
