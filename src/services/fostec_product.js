import axios from 'axios';

const API = axios.create({
  baseURL: 'https://sales-api.sphx-dev.online/api'
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

export const getFostecProductById = async (id) => {
  try {
    const response = await API.get(`/fostec-products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fostec product:', error);
    throw error;
  }
};

export const createFostecProduct = async (productData) => {
  try {
    const response = await API.post('/fostec-products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating fostec product:', error);
    throw error;
  }
};

export const updateFostecProduct = async (id, productData) => {
  try {
    const response = await API.put(`/fostec-products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating fostec product:', error);
    throw error;
  }
};

export const deleteFostecProduct = async (id) => {
  try {
    const response = await API.delete(`/fostec-products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting fostec product:', error);
    throw error;
  }
};

export const getFostecProductCategories = async () => {
  try {
    const response = await API.get('/fostec_product/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching fostec product categories:', error);
    throw error;
  }
};

export const getFostecProductTypesByCategory = async (category) => {
  try {
    const response = await API.get(`/fostec_product/types/${encodeURIComponent(category)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fostec product types by category:', error);
    throw error;
  }
};
