import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// ===== COST =====
export const getCosts = () => API.get("/cost");
export const createCost = (data) => API.post("/cost", data);
export const updateCost = (id, data) => API.put(`/cost/${id}`, data);
export const deleteCost = (id) => API.delete(`/cost/${id}`);
export const getCostsByCategory = (categoryId) => API.get(`/cost/category/${categoryId}`);
