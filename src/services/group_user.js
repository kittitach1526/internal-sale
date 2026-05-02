import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api'
});

export const getGroupUsers = async () => {
  try {
    const response = await API.get('/group_user');
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching group users:', error);
    throw error;
  }
};
