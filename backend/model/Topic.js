// backend/model/Topic.js
import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadedAt: { type: Date, default: Date.now },
});

const broadcastSchema = new mongoose.Schema({
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    moduleCode: { type: String, required: true },
    tags: [{ type: String }],
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    resources: [resourceSchema],
    broadcasts: [broadcastSchema], // ✅ FIXED: allows tutor/admin announcements
  },
  { timestamps: true }
);

// 🔧 Instance methods
topicSchema.methods.addSubscriber = async function (userId) {
  if (!this.subscribers.includes(userId)) {
    this.subscribers.push(userId);
    await this.save();
  }
};

topicSchema.methods.removeSubscriber = async function (userId) {
  this.subscribers = this.subscribers.filter(
    (sub) => sub.toString() !== userId.toString()
  );
  await this.save();
};

topicSchema.methods.addResource = async function (resourceData) {
  this.resources.push(resourceData);
  await this.save();
};

const Topic = mongoose.model("Topic", topicSchema);
export default Topic;
