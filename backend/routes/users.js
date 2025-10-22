import express from "express";
import { auth } from "../middleware/auth.js";
import User from "../model/UserModel.js";

const router = express.Router();

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
