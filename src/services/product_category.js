import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api'
});

export const getProductCategories = async () => {
  try {
    const response = await API.get('/product_categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw error;
  }
};

export const getProductCategoryById = async (id) => {
  try {
    const response = await API.get(`/product_categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product category:', error);
    throw error;
  }
};

export const createProductCategory = async (categoryData) => {
  try {
    const response = await API.post('/product_categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating product category:', error);
    throw error;
  }
};

export const updateProductCategory = async (id, categoryData) => {
  try {
    const response = await API.put(`/product_categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Error updating product category:', error);
    throw error;
  }
};

export const deleteProductCategory = async (id) => {
  try {
    const response = await API.delete(`/product_categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product category:', error);
    throw error;
  }
};
