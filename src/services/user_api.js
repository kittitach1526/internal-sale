import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// ===== USERS =====
export const getUsers = () => API.get("/users");

// export const getUser = (id) => API.get(`/users/${id}`);

// export const createUser = (data) => API.post("/users", data);

// export const updateUser = (id, data) => API.put(`/users/${id}`, data);

// export const deleteUser = (id) => API.delete(`/users/${id}`);