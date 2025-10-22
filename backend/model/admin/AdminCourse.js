import mongoose from "mongoose";

const AdminCourseSchema = new mongoose.Schema(
  {
    code:  { type: String, index: true },
    title: { type: String, index: true },
    description: String,
    year:     String,
    semester: String,
    tutors:  [{ type: mongoose.Schema.Types.ObjectId, ref: "AdminTutor" }],
  },
  { timestamps: true }
);

export default mongoose.models.AdminCourse
  || mongoose.model("AdminCourse", AdminCourseSchema, "courses");
