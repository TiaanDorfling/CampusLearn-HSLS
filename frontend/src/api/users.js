// Simple user search + list API
// Backend should implement GET /api/users?search= (optional).
// Returns: { items: [{ _id, name, email, role, avatarUrl? }, ...] }

import api from "./axios";

export async function searchUsers({ q = "", limit = 20 } = {}) {
  const params = {};
  if (q) params.search = q;
  if (limit) params.limit = limit;
  const { data } = await api.get("/users", { params });
  return data; // { items }
}
