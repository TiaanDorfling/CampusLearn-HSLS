// backend/models/admin/AdminStudent.js
import mongoose from "mongoose";

const AdminStudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", index: true },
    about: String,
    year:  String, // DB uses string like "3"
    studentNumber: String,
    emergencyContact: { phone: String },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "AdminCourse" }],
  },
  { timestamps: true }
);

// Different model name; same physical collection: "students"
export default mongoose.models.AdminStudent
  || mongoose.model("AdminStudent", AdminStudentSchema, "students");
