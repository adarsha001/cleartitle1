// frontend/src/api/adminAPI.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/employee/admin',
  timeout: 70000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employeeToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminAPI = {
  getDashboardStats: async () => {
    try {
      const response = await API.get('/dashboard-stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllEmployees: async () => {
    try {
      const response = await API.get('/employees');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEmployeeById: async (id) => {
    try {
      const response = await API.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEmployeeRecordsByDateRange: async (id, startDate, endDate) => {
    try {
      const response = await API.get(`/employees/${id}/records`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateEmployeeStatus: async (id, isActive) => {
    try {
      const response = await API.put(`/employees/${id}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};