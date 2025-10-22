// routes/notifications.js
import express from "express";
import { auth } from "../middleware/auth.js";
import * as note from "../controller/NotificationController.js";

const router = express.Router();

// Require auth so req.user is set in the controller
router.get("/", auth(true), note.getAll);
router.patch("/:id/read", auth(true), note.markRead);
router.delete("/:id", auth(true), note.deleteNotification);

export default router;
