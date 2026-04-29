import axios from "axios";

const API = axios.create({
  baseURL: "https://sales-api.sphx-dev.online/api",
});

// ===== USERS =====
export const getUsers = () => API.get("/users");

export const getUser = (id) => API.get(`/users/${id}`);

export const createUser = (userData) => {
  const params = new URLSearchParams();
  // Generate a random ID for new user
  const newId = Math.floor(Math.random() * 1000) + 100;
  params.append('id', newId);
  params.append('name', userData.name);
  params.append('username', userData.username);
  if (userData.email) params.append('email', userData.email);
  params.append('password', userData.password);
  params.append('group_user', userData.role); // Use group_user instead of role
  
  return axios.post(`${API.defaults.baseURL}/users?${params.toString()}`);
};

export const updateUser = (id, data) => API.put(`/users/${id}`, data);

export const deleteUser = (id) => API.delete(`/users/${id}`);