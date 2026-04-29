import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/fostec_product";
const API_URL_2 = "http://127.0.0.1:8000/api/measuring_work";

export const getProductCategories = async () => {
  const res = await axios.get(API_URL);
  const data = res.data;

  // แปลงเป็น format ที่ UI ต้องใช้
  const grouped = {
    FOSTEC: data.map((item) => item.name),
  };

  return grouped;
};

export const getFostecProducts = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getProductCategories2 = async () => {
  const res = await axios.get(API_URL_2);
  const data = res.data;

  // แปลงเป็น format ที่ UI ต้องใช้
  const grouped = {
    งานตรวจรับ: data.map((item) => item.name),
  };

  return grouped;
};

export const getMeasuringWorks = async () => {
  const res = await axios.get(API_URL_2);
  return res.data;
};

// FOSTEC Product CRUD
export const createFostecProduct = (id, name) => {
  return axios.post(`${API_URL}?id=${id}&name=${name}`);
};
export const deleteFostecProduct = (id) => axios.delete(`${API_URL}/${id}`);
export const updateFostecProduct = (id, name) => axios.put(`${API_URL}/${id}?name=${name}`);

// Measuring Work CRUD
export const createMeasuringWork = (id, name) => {
  return axios.post(`${API_URL_2}?id=${id}&name=${name}`);
};
export const deleteMeasuringWork = (id) => axios.delete(`${API_URL_2}/${id}`);
export const updateMeasuringWork = (id, name) => axios.put(`${API_URL_2}/${id}?name=${name}`);