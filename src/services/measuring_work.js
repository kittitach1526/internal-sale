import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const getMeasuringWorks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/measuring_work`);
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching measuring works:', error);
    throw error;
  }
};

export const getMeasuringWorkById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/measuring-works/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching measuring work:', error);
    throw error;
  }
};

export const createMeasuringWork = async (workData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/measuring-works`, workData);
    return response.data;
  } catch (error) {
    console.error('Error creating measuring work:', error);
    throw error;
  }
};

export const updateMeasuringWork = async (id, workData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/measuring-works/${id}`, workData);
    return response.data;
  } catch (error) {
    console.error('Error updating measuring work:', error);
    throw error;
  }
};

export const deleteMeasuringWork = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/measuring-works/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting measuring work:', error);
    throw error;
  }
};
