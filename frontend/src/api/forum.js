import api from "./axios";


export async function listThreads(categoryId) {
  const params = categoryId ? { category: categoryId } : undefined;
  const { data } = await api.get("/forum/threads", { params });
  return { items: data?.threads || [] };
}


export async function createThread({ title, body, categoryId }) {
  const { data } = await api.post("/forum/threads", { title, categoryId, body });
  return { thread: data?.thread };
}


export async function getThread(id) {
  const [{ data: t }, { data: p }] = await Promise.all([
    api.get(`/forum/threads/${id}`),
    api.get(`/forum/threads/${id}/posts`),
  ]);
  return { thread: t?.thread || null, posts: p?.posts || [] };
}


export async function addPost(threadId, body) {
  const { data } = await api.post("/forum/posts", { threadId, content: body });
  return { post: data?.post };
}

export async function markPostRead(postId) {
  await api.post(`/forum/posts/${postId}/read`);
}
export async function markThreadRead(threadId) {
  await api.post(`/forum/threads/${threadId}/read-all`);
}
