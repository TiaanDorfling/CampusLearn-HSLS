import mongoose from "mongoose";

const AdminUserSchema = new mongoose.Schema(
  {
    name:  String,
    email: { type: String, index: true },
    role:  { type: String, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.AdminUser
  || mongoose.model("AdminUser", AdminUserSchema, "users");
