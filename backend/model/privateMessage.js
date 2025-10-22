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
  { timestamps: true, collection: "conversations" }
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
  { timestamps: true, collection: "privatemessages" }
);

ConversationSchema.index({ "participants.user": 1, updatedAt: -1 });
MessageSchema.index({ conversation: 1, createdAt: -1 });

export const Conversation = mongoose.model("Conversation", ConversationSchema);
export const Message = mongoose.model("Message", MessageSchema);
