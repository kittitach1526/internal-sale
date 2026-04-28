import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const getGroupUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/group_user`);
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching group users:', error);
    throw error;
  }
};
