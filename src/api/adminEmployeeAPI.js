// frontend/src/api/adminAPI.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/employee/admin', // Changed from /api/employee/admin to /api/admin
  timeout: 70000,
});

// Request interceptor - use regular auth token
API.interceptors.request.use(
  (config) => {
    // Get token from your main auth system
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling unauthorized access
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to main login
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      // Forbidden - User is not admin
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
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
  },

  // Additional admin methods
  getEmployeeWorkItems: async (id, date) => {
    try {
      const response = await API.get(`/employees/${id}/work-items`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEmployeeMonthlyReport: async (id, year, month) => {
    try {
      const response = await API.get(`/employees/${id}/monthly-report`, {
        params: { year, month }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default API;