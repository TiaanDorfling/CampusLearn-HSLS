// frontend/src/api/assistant.js
import axios from "axios";

/** messages: [{role:'user'|'assistant', content:string}] */
export async function sendChat(messages) {
  const { data } = await axios.post("/api/ai/chat", { messages });
  return data; // { text }
}
