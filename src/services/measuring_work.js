import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api'
});

export const getMeasuringWorks = async () => {
  try {
    const response = await API.get('/measuring_work');
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching measuring works:', error);
    throw error;
  }
};

export const getMeasuringWorkById = async (id) => {
  try {
    const response = await API.get(`/measuring-works/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching measuring work:', error);
    throw error;
  }
};

export const createMeasuringWork = async (workData) => {
  try {
    const response = await API.post('/measuring-works', workData);
    return response.data;
  } catch (error) {
    console.error('Error creating measuring work:', error);
    throw error;
  }
};

export const updateMeasuringWork = async (id, workData) => {
  try {
    const response = await API.put(`/measuring-works/${id}`, workData);
    return response.data;
  } catch (error) {
    console.error('Error updating measuring work:', error);
    throw error;
  }
};

export const deleteMeasuringWork = async (id) => {
  try {
    const response = await API.delete(`/measuring-works/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting measuring work:', error);
    throw error;
  }
};
