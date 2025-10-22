import mongoose from "mongoose";

const AdminStudentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", index: true },
    about: String,
    year:  String,
    studentNumber: String,
    emergencyContact: { phone: String },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "AdminCourse" }],
  },
  { timestamps: true }
);

export default mongoose.models.AdminStudent
  || mongoose.model("AdminStudent", AdminStudentSchema, "students");
