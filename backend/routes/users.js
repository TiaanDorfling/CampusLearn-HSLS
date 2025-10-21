// backend/routes/users.js
import express from "express";
import mongoose from "mongoose";
import { auth } from "../middleware/auth.js"; // use auth(true) if your login cookies are set

const router = express.Router();

// Bind/reuse User model to 'users' collection
const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    new mongoose.Schema(
      {
        name:  { type: String, required: true },
        email: { type: String, required: true, unique: true, index: true },
        role:  { type: String, enum: ["student", "tutor", "admin"], required: true },
      },
      { collection: "users", timestamps: true }
    )
  );

// GET /api/users?limit=30&q=&role=
router.get("/", auth(false), async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 30, 100));
    const q = (req.query.q || "").trim();
    const role = (req.query.role || "").trim();

    const filter = {};
    if (q) {
      filter.$or = [
        { name:  { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    if (role) filter.role = role;

    const items = await User.find(filter)
      .select("_id name email role")
      .sort({ name: 1 })
      .limit(limit)
      .lean();

    res.json({ items });
  } catch (err) {
    console.error("GET /api/users error:", err);
    res.status(500).json({ error: "Failed to list users" });
  }
});

export default router;
