import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// ===== GROUP COST =====
export const getGroupCost = () => API.get("/group_cost");
export const createGroupCost = (id, name) => API.post("/group_cost/", { id, name });
export const deleteGroupCost = (id) => API.delete(`/group_cost/${id}`);
export const updateGroupCost = (id, name) => API.put(`/group_cost/${id}`, { name });