import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const NotificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["message", "forum", "system"], default: "system", index: true },
    title: { type: String, default: "" },
    text:  { type: String, default: "" },
    data:  { type: Schema.Types.Mixed, default: {} },
    read:  { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: "notifications" }
);

NotificationSchema.index({ user: 1, createdAt: -1 });

const Notification = models.Notification || model("Notification", NotificationSchema);
export default Notification;
