import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

// ===== USERS =====
export const getUsers = () => API.get("/users");

export const getUser = (id) => API.get(`/users/${id}`);

export const createUser = (userData) => {
  const params = new URLSearchParams();
  // Generate auto ID to prevent duplicates
  const newId = Math.floor(Math.random() * 10000) + 1000;
  params.append('id', newId);
  params.append('name', userData.name);
  params.append('username', userData.username);
  if (userData.email) params.append('email', userData.email);
  params.append('password', userData.password);
  params.append('group_user', userData.role); // Use group_user instead of role
  
  return API.post(`/users?${params.toString()}`);
};

export const updateUser = (id, data) => API.put(`/users/${id}`, data);

export const deleteUser = (id) => API.delete(`/users/${id}`);