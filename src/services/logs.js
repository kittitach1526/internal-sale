import axios from 'axios';

// API base URL
const API_URL = 'https://sales-api.sphx-dev.online/api';

// ฟังก์ชันสร้าง log entry สำหรับบันทึกกิจกรรม
export const createLog = async (logData) => {
  try {
    const response = await axios.post(`${API_URL}/logs`, logData);
    return response.data;
  } catch (error) {
    console.error('Error creating log:', error);
    throw error;
  }
};

// ฟังก์ชันดึงข้อมูล logs ทั้งหมด
export const getLogs = async () => {
  try {
    const response = await axios.get(`${API_URL}/logs`);
    return response.data;
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

// ฟังก์ชันดึงข้อมูล logs แบบมี pagination
export const getLogsWithPagination = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = {
      page,
      limit,
      ...filters
    };
    const response = await axios.get(`${API_URL}/logs`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching logs with pagination:', error);
    throw error;
  }
};

// ฟังก์ชันค้นหา logs
export const searchLogs = async (searchTerm, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/logs/search`, {
      params: { q: searchTerm, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching logs:', error);
    throw error;
  }
};

// ฟังก์ชันลบ logs เก่า (ตามจำนวนที่กำหนด)
export const deleteOldLogs = async (daysOld = 90) => {
  try {
    const response = await axios.delete(`${API_URL}/logs/cleanup`, {
      params: { days_old: daysOld }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting old logs:', error);
    throw error;
  }
};

// ฟังก์ชันดึงสถิติ logs
export const getLogStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/logs/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching log statistics:', error);
    throw error;
  }
};
