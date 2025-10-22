// frontend/src/api/health.js
import api from "./axios";

export async function healthz() {
  try {
    const res = await api.get("/healthz", { validateStatus: () => true });
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      data: res.data ?? null,
    };
  } catch (err) {
    return { ok: false, status: 0, error: err.friendlyMessage || err.message };
  }
}
