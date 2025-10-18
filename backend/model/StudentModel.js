// backend/model/StudentModel.js
import mongoose from "mongoose";

/**
 * Student profile stored in its own collection, linked to a base User.
 * This does NOT use discriminators. It’s a simple 1:1 profile with a ref to User.
 * That makes populate('user') valid and fixes the StrictPopulateError you saw.
 */
const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true, // one student profile per user
    },

    // Optional profile fields used in your StudentDashboard + future needs
    studentNumber: { type: String },
    year: { type: String },
    phone: { type: String },
    about: { type: String },

    courses: [
      {
        code: { type: String },
        name: { type: String },
      },
    ],

    emergencyContact: {
      name: String,
      phone: String,
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", StudentSchema);
export default Student;
