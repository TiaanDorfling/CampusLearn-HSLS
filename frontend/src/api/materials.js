import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
const base = `${API_BASE}/materials`;

const opts = { withCredentials: true, timeout: 15000 };

function friendlyError(err, fallback) {
  const msg =
    err?.response?.data?.friendlyMessage ||
    err?.response?.data?.message ||
    err?.message ||
    fallback;
  const e = new Error(msg);
  e.status = err?.response?.status;
  return e;
}

export async function listMaterials(params = {}) {
  try {
    const { data } = await axios.get(base, { ...opts, params });
    return {
      items: Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []),
      total: Number.isFinite(data?.total) ? data.total : (data?.items?.length || 0),
      page: data?.page ?? 1,
      pageSize: data?.pageSize ?? (data?.items?.length || 0),
    };
  } catch (e) {
    throw friendlyError(e, "Failed to load materials.");
  }
}

export async function uploadMaterials(formData) {
  try {
    if (!(formData instanceof FormData)) {
      throw new Error("uploadMaterials expects FormData");
    }
    const { data } = await axios.post(`${base}/upload`, formData, {
      ...opts,
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (x) => x,
    });
    return data;
  } catch (e) {
    throw friendlyError(e, "Upload failed.");
  }
}

export async function deleteMaterial(id) {
  try {
    if (!id) throw new Error("Missing material id.");
    const { data } = await axios.delete(`${base}/${encodeURIComponent(id)}`, opts);
    return data;
  } catch (e) {
    throw friendlyError(e, "Delete failed.");
  }
}
