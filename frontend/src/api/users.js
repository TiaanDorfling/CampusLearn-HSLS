import api from "./axios";


export async function searchUsers({ q = "", limit = 30, role } = {}) {
  const { data } = await api.get("/users", { params: { q, limit, role } });
  return data;
}
