// backend/models/admin/AdminUser.js
import mongoose from "mongoose";

const AdminUserSchema = new mongoose.Schema(
  {
    name:  String,
    email: { type: String, index: true },
    role:  { type: String, index: true },
  },
  { timestamps: true }
);

// Different model name; same physical collection: "users"
export default mongoose.models.AdminUser
  || mongoose.model("AdminUser", AdminUserSchema, "users");
