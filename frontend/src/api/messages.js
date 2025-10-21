import api from "./axios";

export async function listBroadcasts({ onlyUnread = false } = {}) {
  const { data } = await api.get("/messages", { params: { onlyUnread } });
  return data; 
}

export async function sendBroadcast({ title, body, courseCode }) {
  const { data } = await api.post("/messages", { title, body, courseCode });
  return data; 
}

export async function markBroadcastRead(id) {
  const { data } = await api.patch(`/messages/${id}/read`);
  return data; 
}


export async function listPM({ onlyUnread = false } = {}) {
  const { data } = await api.get("/pm", { params: { onlyUnread } });
  return data; 
}

export async function sendPM({ toUserId, body, subject }) {
  const { data } = await api.post("/pm", { toUserId, body, subject });
  return data; 
}

export async function markPMRead(id) {
  const { data } = await api.patch(`/pm/${id}/read`);
  return data; 
}
