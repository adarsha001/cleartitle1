// frontend/src/api/employeeAPI.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://saimr-backend-1.onrender.com/api',
  timeout: 70000,
});

// Request interceptor
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

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('employeeData');
      window.location.href = '/employee-login';
    }
    return Promise.reject(error);
  }
);

export const employeeAPI = {
  // Auth
  register: async (formData) => {
    try {
      const response = await API.post('/employee/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success && response.data.token) {
        localStorage.setItem('employeeToken', response.data.token);
        localStorage.setItem('employeeData', JSON.stringify(response.data.employee));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  login: async (credentials) => {
    try {
      const response = await API.post('/employee/login', credentials);
      if (response.data.success && response.data.token) {
        localStorage.setItem('employeeToken', response.data.token);
        localStorage.setItem('employeeData', JSON.stringify(response.data.employee));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      const response = await API.post('/employee/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    } finally {
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('employeeData');
    }
  },

  getProfile: async () => {
    try {
      const response = await API.get('/employee/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProfile: async (formData) => {
    try {
      const response = await API.put('/employee/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success && response.data.employee) {
        localStorage.setItem('employeeData', JSON.stringify(response.data.employee));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Work Items
  getTodayWorkItems: async () => {
    try {
      const response = await API.get('/employee/today-work-items');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addWorkItem: async (data) => {
    try {
      const response = await API.post('/employee/add-work-item', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadWorkImage: async (workItemIndex, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('workItemIndex', workItemIndex);
      formData.append('workImage', imageFile);
      
      const response = await API.post('/employee/upload-work-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  completeWorkItem: async (workItemIndex) => {
    try {
      const response = await API.put('/employee/complete-work-item', { workItemIndex });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateWorkItem: async (workItemIndex, description) => {
    try {
      const response = await API.put('/employee/update-work-item', { workItemIndex, description });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteWorkItem: async (workItemIndex) => {
    try {
      const response = await API.delete('/employee/delete-work-item', { data: { workItemIndex } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateDailySummary: async (dailySummary) => {
    try {
      const response = await API.put('/employee/update-daily-summary', { dailySummary });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Daily Images Routes
  getDailyImages: async () => {
    try {
      const response = await API.get('/employee/daily-images');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadDailyImage: async (imageFile, imageType = 'general', caption = '') => {
    try {
      const formData = new FormData();
      formData.append('dailyImage', imageFile);
      formData.append('imageType', imageType);
      formData.append('caption', caption);
      
      const response = await API.post('/employee/upload-daily-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteDailyImage: async (imageIndex) => {
    try {
      const response = await API.delete('/employee/delete-daily-image', { data: { imageIndex } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStats: async () => {
    try {
      const response = await API.get('/employee/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin
  getAllEmployees: async () => {
    try {
      const response = await API.get('/employee/employees');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('employeeToken');
  },

  getCurrentEmployee: () => {
    const data = localStorage.getItem('employeeData');
    return data ? JSON.parse(data) : null;
  },

  isAdmin: () => {
    const employee = employeeAPI.getCurrentEmployee();
    return employee?.isAdmin === true || employee?.userType === 'admin';
  }
};

export default API;