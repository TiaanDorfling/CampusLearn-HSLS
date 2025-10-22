// Minimal service that calls your backend: POST /api/ai/chat
// No frontend Gemini SDK needed.

const DEFAULT_SUGGESTIONS = [
  "What else can you do?",
  "Give me a study tip",
  "Find a tutor for CS101"
];

export async function sendMessageToBot(prompt) {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // keep session cookies if any
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) {
    throw new Error(`AI chat failed with status ${res.status}`);
  }
  const data = await res.json();

  // Your AIController returns a JSON object with simulated answer text under "reply"
  // (and sometimes "suggestions"). We make this tolerant.
  const text =
    data.reply || data.response || data.message || data.text || "…(no reply)";
  const suggestedReplies = Array.isArray(data.suggestions)
    ? data.suggestions
    : DEFAULT_SUGGESTIONS;

  return { text, suggestedReplies };
}

export async function getInitialGreeting() {
  // Keep it static to avoid waiting on network for the first render.
  const text =
    "Greetings, recruit. I am Optimist Prime. I will guide you on your noble quest for knowledge. State your mission.";
  return { text, suggestedReplies: ["What can you do?", "Study tips", "Find a tutor"] };
}
