import api from "./axios";

export async function getEvents() {
    const {data} = await api.get("calendar");
    return data;
}

