// backend/models/admin/AdminTutor.js
import mongoose from "mongoose";

const AdminTutorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", index: true },
    phone: String,
    bio:   String,
    tutorTopics:     [String],
    assignedModules: [String],
    uploadedResources:[String],
  },
  { timestamps: true }
);

// Different model name; same physical collection: "tutors"
export default mongoose.models.AdminTutor
  || mongoose.model("AdminTutor", AdminTutorSchema, "tutors");
