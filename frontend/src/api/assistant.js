import axios from "axios";

export async function sendChat(messages) {
  const { data } = await axios.post("/api/ai/chat", { messages });
  return data; // { text }
}
