// routes/admin.js
import express from "express";
import * as admin from "../controller/AdminController.js";

const router = express.Router();

router.get("/users", admin.getAllUsers);
router.patch("/users/:id/role", admin.updateUserRole);
router.delete("/users/:id", admin.deleteUser);

router.get("/forum", admin.getAllForumPosts);
router.delete("/forum/:id", admin.deleteForumPost);

router.get("/health", admin.getHealth);

export default router;
