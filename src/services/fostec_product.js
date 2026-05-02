import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api'
});

export const getFostecProducts = async () => {
  try {
    const response = await API.get('/fostec_product');
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching fostec products:', error);
    throw error;
  }
};

export const createFostecProduct = async (id, name) => {
  try {
    const response = await API.post(`/fostec_product?id=${id}&name=${name}`);
    return response.data;
  } catch (error) {
    console.error('Error creating fostec product:', error);
    throw error;
  }
};

export const deleteFostecProduct = async (id) => {
  try {
    const response = await API.delete(`/fostec_product/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting fostec product:', error);
    throw error;
  }
};
