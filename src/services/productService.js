import axios from "axios";

const API = axios.create({
  baseURL: 'https://sales-api.sphx-dev.online/api'
});

export const getProductCategories = async () => {
  const res = await API.get('/fostec_product');
  const data = res.data;

  // แปลงเป็น format ที่ UI ต้องใช้
  const grouped = {
    FOSTEC: data.map((item) => item.name),
  };

  return grouped;
};

export const getFostecProducts = async () => {
  const res = await API.get('/fostec_product');
  return res.data;
};

export const getProductCategories2 = async () => {
  const res = await API.get('/measuring_work');
  const data = res.data;

  // แปลงเป็น format ที่ UI ต้องใช้
  const grouped = {
    งานตรวจรับ: data.map((item) => item.name),
  };

  return grouped;
};

export const getMeasuringWorks = async () => {
  const res = await API.get('/measuring_work');
  return res.data;
};

// FOSTEC Product CRUD
export const createFostecProduct = (id, name) => {
  return API.post(`/fostec_product?id=${id}&name=${name}`);
};
export const deleteFostecProduct = (id) => API.delete(`/fostec_product/${id}`);
export const updateFostecProduct = (id, name) => API.put(`/fostec_product/${id}?name=${name}`);

// Measuring Work CRUD
export const createMeasuringWork = (id, name) => {
  return API.post(`/measuring_work?id=${id}&name=${name}`);
};
export const deleteMeasuringWork = (id) => API.delete(`/measuring_work/${id}`);
export const updateMeasuringWork = (id, name) => API.put(`/measuring_work/${id}?name=${name}`);