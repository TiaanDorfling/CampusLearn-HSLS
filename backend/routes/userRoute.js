// backend/routes/userRoute.js
import express from "express";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import { auth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import User from "../model/UserModel.js";
import { updateProfile, adminUpdateUser } from "../controller/UserController.js";

/** Keep email check aligned with current UserModel constraint */
function validateEmailForRole(email, role = "student") {
  const reStudent = /^[a-z0-9._%+-]+@student\.belgiumcampus\.ac\.za$/i;
  return reStudent.test(String(email || ""));
}

const router = express.Router();

// Update current user (profile)
router.put("/update-user", auth(true), updateProfile);

// Admin updates any user's profile
router.put("/update/:id", auth(true), requireRole("admin"), adminUpdateUser);

// Admin creates new user
router.post(
  "/create-user",
  [
    body("name").isString().trim().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8 }),
    body("role").optional().isIn(["student", "tutor", "admin"]),
  ],
  validate,
  auth(true),
  requireRole("admin"),
  async (req, res) => {
    try {
      const { name, email, password, role = "student" } = req.body;

      if (!validateEmailForRole(email, role)) {
        return res.status(400).json({ error: "Campus student email required" });
      }

      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ error: "Email already exists" });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        name,
        email: email.toLowerCase(),
        role,
        passwordHash,
      });

      res.status(201).json({
        message: `${role} registered successfully`,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error("ADMIN create-user error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// Admin deletes user
router.delete("/delete/:id", auth(true), requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(403).json({
        error: "Administrators cannot delete their own account using this endpoint.",
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      message: `User with ID ${id} (Email: ${user.email}) deleted successfully.`,
    });
  } catch (err) {
    console.error("DELETE USER error:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
