// frontend/src/api/forum.js
// Uses the shared axios instance (baseURL: "/api") and prefixes forum routes with "/forum"
import api from "./axios";

/**
 * GET /api/forum/threads[?category=id]
 * Backend returns: { ok, threads }
 * Normalized to:   { items }
 */
export async function listThreads(categoryId) {
  const params = categoryId ? { category: categoryId } : undefined;
  const { data } = await api.get("/forum/threads", { params });
  return { items: data?.threads || [] };
}

/**
 * POST /api/forum/threads { title, categoryId, body? }
 * Backend creates thread and (if body given) first post.
 * Returns: { thread }
 */
export async function createThread({ title, body, categoryId }) {
  const { data } = await api.post("/forum/threads", { title, categoryId, body });
  return { thread: data?.thread };
}

/**
 * GET /api/forum/threads/:id + /api/forum/threads/:id/posts
 * Returns: { thread, posts }
 */
export async function getThread(id) {
  const [{ data: t }, { data: p }] = await Promise.all([
    api.get(`/forum/threads/${id}`),
    api.get(`/forum/threads/${id}/posts`),
  ]);
  return { thread: t?.thread || null, posts: p?.posts || [] };
}

/**
 * POST /api/forum/posts { threadId, content }
 * Returns: { post }
 */
export async function addPost(threadId, body) {
  const { data } = await api.post("/forum/posts", { threadId, content: body });
  return { post: data?.post };
}

/** Optional helpers if you later show read indicators */
export async function markPostRead(postId) {
  await api.post(`/forum/posts/${postId}/read`);
}
export async function markThreadRead(threadId) {
  await api.post(`/forum/threads/${threadId}/read-all`);
}
