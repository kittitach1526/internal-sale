import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// ===== GROUP COST =====
export const getGroupCost = () => API.get("/group_cost");
export const createGroupCost = (name) => {
  // Generate auto ID to prevent duplicates
  const autoId = Math.floor(Math.random() * 10000) + 1000;
  return API.post("/group_cost/", { id: autoId, name });
};
export const deleteGroupCost = (id) => API.delete(`/group_cost/${id}`);
export const updateGroupCost = (id, name) => API.put(`/group_cost/${id}`, { name });