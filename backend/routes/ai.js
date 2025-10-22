// routes/ai.js
import express from "express";
import * as ai from "../controller/AIController.js";

const router = express.Router();

router.post("/chat", ai.chatWithAI);

export default router;
