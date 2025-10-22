import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true,
    },

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
