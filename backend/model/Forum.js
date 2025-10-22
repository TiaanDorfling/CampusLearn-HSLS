import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const forumCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const forumThreadSchema = new Schema(
  {
    category: { type: Types.ObjectId, ref: "ForumCategory" },
    author: { type: Types.ObjectId, ref: "User", required: true },
    authorRole: { type: String, enum: ["student", "tutor", "admin"], required: true },
    title: { type: String, required: true },
  },
  { timestamps: true }
);

const forumPostSchema = new Schema(
  {
    thread: { type: Types.ObjectId, ref: "ForumThread", required: true },
    author: { type: Types.ObjectId, ref: "User", required: true },
    authorRole: { type: String, enum: ["student", "tutor", "admin"], required: true },
    content: { type: String, required: true },
    readBy: [
      {
        user: { type: Types.ObjectId, ref: "User" },
        readAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

forumPostSchema.index({ thread: 1, createdAt: 1 });

export const ForumCategory = model("ForumCategory", forumCategorySchema);
export const ForumThread = model("ForumThread", forumThreadSchema);
export const ForumPost = model("ForumPost", forumPostSchema);
