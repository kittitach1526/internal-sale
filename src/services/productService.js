import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/fostec_product";
const API_URL_2 = "http://127.0.0.1:8000/api/measuring_work";

export const getProductCategories = async () => {
  const res = await axios.get(API_URL);
  const data = res.data;

  // 🔥 แปลงเป็น format ที่ UI ต้องใช้
  const grouped = {
    FOSTEC: data.map((item) => item.name),
  };

  return grouped;
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

// FOSTEC Product CRUD
export const createFostecProduct = (name) => axios.post(API_URL, { name });
export const deleteFostecProduct = (id) => axios.delete(`${API_URL}/${id}`);
export const updateFostecProduct = (id, name) => axios.put(`${API_URL}/${id}`, { name });

// Measuring Work CRUD
export const createMeasuringWork = (name) => axios.post(API_URL_2, { name });
export const deleteMeasuringWork = (id) => axios.delete(`${API_URL_2}/${id}`);
export const updateMeasuringWork = (id, name) => axios.put(`${API_URL_2}/${id}`, { name });