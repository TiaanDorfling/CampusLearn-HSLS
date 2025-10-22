// backend/model/Submission.js
import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseCode: { type: String, required: true, trim: true }, // e.g., "SEN381"
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    status: { type: String, enum: ["submitted", "graded", "returned"], default: "submitted", index: true },
    grade: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who graded
  },
  { timestamps: true }
);

SubmissionSchema.index({ createdAt: -1 });

const Submission = mongoose.model("Submission", SubmissionSchema);
export default Submission;
