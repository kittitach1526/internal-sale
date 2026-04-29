import axios from 'axios';

const API = axios.create({
  baseURL: 'https://sales-api.sphx-dev.online/api'
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
