import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const getProductCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product_categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw error;
  }
};

export const getProductCategoryById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/product_categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product category:', error);
    throw error;
  }
};

export const createProductCategory = async (categoryData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/product_categories`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating product category:', error);
    throw error;
  }
};

export const updateProductCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/product_categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating product category:', error);
    throw error;
  }
};

export const deleteProductCategory = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/product_categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product category:', error);
    throw error;
  }
};
