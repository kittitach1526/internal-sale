import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const getProductTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product_types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product types:', error);
    throw error;
  }
};

export const getProductTypesByCategory = async (categoryId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product_types/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product types by category:', error);
    throw error;
  }
};

export const getProductTypeById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product_types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product type:', error);
    throw error;
  }
};

export const createProductType = async (typeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/product_types`, typeData);
    return response.data;
  } catch (error) {
    console.error('Error creating product type:', error);
    throw error;
  }
};

export const updateProductType = async (id, typeData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/product_types/${id}`, typeData);
    return response.data;
  } catch (error) {
    console.error('Error updating product type:', error);
    throw error;
  }
};

export const deleteProductType = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/product_types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product type:', error);
    throw error;
  }
};
