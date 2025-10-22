import api from "./axios";

/**
 * Search users by name/email.
 * Returns: { items: [{ _id, name, email, role }, ...] }
 */
export async function searchUsers({ q = "", limit = 30, role } = {}) {
  const { data } = await api.get("/users", { params: { q, limit, role } });
  return data;
}
