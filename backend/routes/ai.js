// backend/routes/ai.js
import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.warn("[AI] GEMINI_API_KEY missing in backend/.env");

const genAI = new GoogleGenerativeAI(apiKey);
const MODEL = "gemini-1.5-flash";

const SYSTEM = `You are CampusLearn's helpful tutor assistant.
Be direct, practical, concise. If unsure, say so briefly.`;

/**
 * POST /api/ai/chat
 * body: { messages: [{ role: "user"|"assistant", content: string }] }
 * returns: { text: string }
 */
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages[] required" });
    }

    const history = messages.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }],
    }));
    const last = messages[messages.length - 1];
    const userTurn = {
      role: "user",
      parts: [{ text: String(last.content || "") }],
    };

    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM,
    });

    const result = await model.generateContent({
      contents: [...history, userTurn],
    });

    const text = result?.response?.text?.() ?? "";
    return res.json({ text });
  } catch (err) {
    console.error("[AI] /chat error:", err);
    return res.status(500).json({ error: "AI service failed" });
  }
});

export default router;
