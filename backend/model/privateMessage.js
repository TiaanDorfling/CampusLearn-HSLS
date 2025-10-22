// backend/model/privateMessage.js
import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["student", "tutor", "admin"], required: true },
      },
    ],
  },
  { timestamps: true, collection: "conversations" } // optional but explicit
);

const MessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ["student", "tutor", "admin"], required: true },
    },
    subject: { type: String, default: "" },
    text: { type: String, required: true },
    isReadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, collection: "privatemessages" } // ✅ match your Compass collection
);

// helpful index for queries we use
ConversationSchema.index({ "participants.user": 1, updatedAt: -1 });
MessageSchema.index({ conversation: 1, createdAt: -1 });

export const Conversation = mongoose.model("Conversation", ConversationSchema);
export const Message = mongoose.model("Message", MessageSchema);
