// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import User from "../model/UserModel.js";
import { generateToken, verifyToken } from "../utils/jwt.js";

const router = express.Router();

/** 
 * NOTE (current constraint):
 * UserModel enforces student domain via schema `match`.
 * Keep API validation aligned to avoid 500s from schema validation.
 * If/when you relax the schema to allow tutor/admin domains, just update
 * `validateEmailForRole` accordingly.
 */
function validateEmailForRole(email, role = "student") {
  // Current behavior: all roles must use student emails
  const reStudent = /^[a-z0-9._%+-]+@student\.belgiumcampus\.ac\.za$/i;
  return reStudent.test(String(email || ""));
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
router.post(
  "/register",
  [
    body("name").isString().trim().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8 }),
    body("role").optional().isIn(["student", "tutor", "admin"]),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password, role = "student" } = req.body;

      if (!validateEmailForRole(email, role)) {
        return res.status(400).json({ error: "Campus student email required" });
      }

      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ error: "Email already exists" });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email: email.toLowerCase(), role, passwordHash });

      res.status(201).json({
        message: `${role} registered successfully`,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error("REGISTER error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post(
  "/login",
  [body("email").isEmail(), body("password").isString().isLength({ min: 8 })],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: String(email).toLowerCase() });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });

      const token = generateToken({ sub: user._id.toString(), role: user.role });

      res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000, // 1h
      });

      res.status(200).json({
        message: "Login successful",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error("LOGIN error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// ── LOGOUT ────────────────────────────────────────────────────────────────────
router.post("/logout", (_req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logout successful" });
});

// ── SESSION CHECK ─────────────────────────────────────────────────────────────
router.get("/session", (req, res) => {
  const token = req.cookies?.jwt;
  if (!token) return res.status(401).json({ active: false });

  const payload = verifyToken(token);
  if (!payload) {
    res.clearCookie("jwt");
    return res.status(401).json({ active: false });
  }

  res.status(200).json({
    active: true,
    user: { id: payload.sub, role: payload.role },
    exp: payload.exp,
  });
});

export default router;
