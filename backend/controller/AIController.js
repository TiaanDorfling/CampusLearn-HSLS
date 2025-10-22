// controller/AIController.js
/**
 * This controller simulates AI chatbot responses for local testing.
 * Later, Gemini integration can replace `chatWithAI`.
 */

export async function chatWithAI(req, res) {
  try {
    const { prompt, context } = req.body;

    // Simulated local response
    const response = simulateAIResponse(prompt);

    return res.json({
      ok: true,
      message: "AI simulated response",
      prompt,
      reply: response,
      context,
    });
  } catch (err) {
    console.error("chatWithAI error:", err);
    return res.status(500).json({ ok: false, error: "AI simulation failed" });
  }
}

/** Simulated AI logic (local only) */
function simulateAIResponse(prompt) {
  const lower = (prompt || "").toLowerCase();

  if (lower.includes("recursion"))
    return "Recursion is when a function calls itself until a base condition is met.";
  if (lower.includes("jwt"))
    return "JWT stands for JSON Web Token — used for authentication.";
  if (lower.includes("mongodb"))
    return "MongoDB is a NoSQL database that stores JSON-like documents.";
  if (lower.includes("api"))
    return "An API (Application Programming Interface) defines how systems communicate.";
  if (lower.includes("react"))
    return "React is a front-end JavaScript library for building user interfaces.";

  // Default fallback
  return "That's a great question! Let’s think about it — can you clarify what specifically you’d like to understand?";
}
