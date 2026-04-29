import axios from "axios";

const API = axios.create({
  baseURL: "https://sales-api.sphx-dev.online/api",
});

// ===== SALES =====
export const getSales = () => API.get("/sales");
export const createSale = (data) => API.post("/sales", data);
export const updateSale = (id, data) => API.put(`/sales/${id}`, data);
export const deleteSale = (id) => API.delete(`/sales/${id}`);
export const getSalesByGroupWork = (groupWorkId) => API.get(`/sales/group-work/${groupWorkId}`);
export const getSalesStatistics = () => API.get("/sales/statistics");
export const getMonthlySalesData = () => API.get("/sales/monthly-data");
