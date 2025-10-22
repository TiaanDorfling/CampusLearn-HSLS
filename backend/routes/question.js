// backend/routes/question.js
import express from "express";
import { body, param } from "express-validator";
import { validate } from "../middleware/validate.js";
import { auth, requireRole } from "../middleware/auth.js";
import Question from "../model/QuestionModel.js";
import mongoose from "mongoose";
import mongoosePkg from "mongoose";
const { Schema } = mongoosePkg;

const router = express.Router();

// Inline Notification model
const Notification =
  mongoose.models.Notification ||
  mongoose.model(
    "Notification",
    new Schema(
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
        type: { type: String, required: true },
        title: { type: String, required: true },
        message: { type: String, default: "" },
        meta: { type: Object, default: {} },
        isRead: { type: Boolean, default: false, index: true },
      },
      { timestamps: true, collection: "notifications" }
    )
  );

/**
 * POST /api/questions
 */
router.post(
  "/",
  auth(true),
  requireRole("student"),
  [
    body("title").isString().trim().isLength({ min: 5 }),
    body("body").isString().trim().isLength({ min: 10 }),
    body("topic").optional().isMongoId(),
    body("moduleCode").optional().isString().trim().isLength({ min: 3, max: 10 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { title, body: bodyText, topic, moduleCode } = req.body;
      const question = await Question.create({
        title,
        body: bodyText,
        student: req.user.id,
        topic,
        moduleCode,
      });
      return res.status(201).json({ message: "Question posted successfully", question });
    } catch (error) {
      console.error("Error posting question:", error);
      return res.status(500).json({ error: "Failed to post question" });
    }
  }
);

/**
 * GET /api/questions
 */
router.get("/", auth(false), async (_req, res) => {
  try {
    const questions = await Question.find()
      .populate("student", "name email")
      .populate("topic", "title")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ error: "Failed to fetch questions" });
  }
});

/**
 * POST /api/questions/:questionId/response  (tutor only)
 */
router.post(
  "/:questionId/response",
  auth(true),
  requireRole("tutor"),
  [
    param("questionId").isMongoId(),
    body("content").isString().trim().isLength({ min: 10 }),
    body("isAnonymous").optional().isBoolean(),
  ],
  validate,
  async (req, res) => {
    const { questionId } = req.params;
    const { content, isAnonymous } = req.body;
    const tutorId = req.user.id;

    const responseData = { message: content, postedBy: tutorId, isAnonymous: isAnonymous || false };

    try {
      const question = await Question.findById(questionId);
      if (!question) return res.status(404).json({ message: "Question not found" });

      await question.addResponse(responseData);
      const lastResponse = question.responses[question.responses.length - 1];

      // Notify the student who asked (unless the tutor is somehow the same user)
      if (String(question.student) !== String(tutorId)) {
        await Notification.create({
          userId: question.student,
          type: "QUESTION_RESPONSE",
          title: "Your question has a new response",
          message: content.slice(0, 160),
          meta: { questionId: question._id, responseId: lastResponse._id },
        });
      }

      return res.status(201).json({ message: "Response posted successfully", response: lastResponse });
    } catch (error) {
      console.error("Error posting response:", error);
      return res.status(500).json({ error: "Failed to post response" });
    }
  }
);

/**
 * GET /api/questions/:questionId/responses
 */
router.get("/:questionId/responses", auth(true), [param("questionId").isMongoId()], validate, async (req, res) => {
  const { questionId } = req.params;
  try {
    const question = await Question.findById(questionId);
    if (!question) return res.status(400).json({ message: "question does not exist!" });
    return res.status(200).json({ message: "Responses returned successfully", responses: question.responses });
  } catch (error) {
    console.error("Error fetching responses: ", error);
    return res.status(500).json({ error: "Failed to fetch responses." });
  }
});

export default router;
