import mongoose from "mongoose";

const TutorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedModules: [{ type: String }],
    tutorTopics: [{ type: String }],
    uploadedResources: [
      {
        resourceID: { type: mongoose.Schema.Types.ObjectId, ref: "Resource" },
        title: String,
        uploadDate: { type: Date, default: Date.now },
      },
    ],
    bio: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

TutorSchema.methods.uploadResource = function (resource) {
  this.uploadedResources.push(resource);
  return this.save();
};

export default mongoose.model("Tutor", TutorSchema);
