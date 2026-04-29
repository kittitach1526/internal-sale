import axios from 'axios';

const API_BASE_URL = 'https://sales-api.sphx-dev.online/api';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error response:', error.response?.data);
    if (error.response) {
      return {
        success: false,
        message: error.response.data.detail || error.response.data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      };
    }
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};
