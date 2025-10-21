import api from "./axios";

export async function listThreads() {
  const { data } = await api.get("/forum/threads");
  return data; // { items }
}
export async function createThread({ title, body, courseCode }) {
  const { data } = await api.post("/forum/threads", { title, body, courseCode });
  return data; // { thread }
}
export async function getThread(id) {
  const { data } = await api.get(`/forum/threads/${id}`);
  return data; // { thread, posts }
}
export async function addPost(threadId, body) {
  const { data } = await api.post(`/forum/threads/${threadId}/posts`, { body });
  return data; // { post }
}
