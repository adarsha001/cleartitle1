// api/propertyUnitAPI.js - UPDATED VERSION
import axios from 'axios';

export const API_URL =  ' https://saimr-backend-1.onrender.com/api';

// Create axios instance with base URL
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000, // Increased timeout
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
  //error('API Error:', error.response?.status, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ALL API METHODS
export const propertyUnitAPI = {
  // ✅ GET ALL PROPERTY UNITS (ADMIN) - THIS WAS MISSING
  getAllPropertyUnits: async (params = {}) => {
    try {
    //log('Fetching property units with params:', params);
      const response = await API.get('/admin/property-units', { params });
    //log('Property units response:', response.data);
      return response.data;
    } catch (error) {
    //error('Error fetching property units:', error);
      throw error;
    }
  },

  // ✅ GET PROPERTY UNIT STATS (ADMIN) - THIS WAS MISSING
  getPropertyUnitStats: async () => {
    try {
    //log('Fetching property unit stats...');
      const response = await API.get('/admin/property-units/stats');
    //log('Stats response:', response.data);
      return response.data;
    } catch (error) {
    //error('Error fetching stats:', error);
      throw error;
    }
  },

  // Get property units (public)
  getPropertyUnits: async (params = {}) => {
    try {
      const response = await API.get('/property-units', { params });
      return response.data;
    } catch (error) {
    //error('Error fetching property units:', error);
      throw error;
    }
  },

  // Get single property unit
  getPropertyUnit: async (id) => {
    try {
      const response = await API.get(`/property-units/${id}`);
      return response.data;
    } catch (error) {
    //error('Error fetching property unit:', error);
      throw error;
    }
  },

  // Get single property unit for admin
  getPropertyUnitByIdAdmin: async (id) => {
    try {
      const response = await API.get(`/admin/property-units/${id}`);
      return response.data;
    } catch (error) {
    //error('Error fetching property unit:', error);
      throw error;
    }
  },

  // Update approval status
  updateApprovalStatus: async (id, data) => {
    try {
      const response = await API.put(`/admin/property-units/${id}/approval`, data);
      return response.data;
    } catch (error) {
    //error('Error updating approval status:', error);
      throw error;
    }
  },

  // Toggle featured
  toggleFeatured: async (id) => {
    try {
      const response = await API.put(`/admin/property-units/${id}/toggle-featured`, {});
      return response.data;
    } catch (error) {
    //error('Error toggling featured:', error);
      throw error;
    }
  },

  // Toggle verified
  toggleVerified: async (id) => {
    try {
      const response = await API.put(`/admin/property-units/${id}/toggle-verified`, {});
      return response.data;
    } catch (error) {
    //error('Error toggling verified:', error);
      throw error;
    }
  },

  // Create property unit
  createPropertyUnit: async (formData) => {
    try {
      const response = await API.post('/property-units', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
    //error('Error creating property unit:', error);
      throw error;
    }
  },

  // Create property unit (admin)
  createPropertyUnitAdmin: async (formData) => {
    try {
      const response = await API.post('/admin/property-units', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
    //error('Error creating property unit:', error);
      throw error;
    }
  },

  // Update property unit
  updatePropertyUnit: async (id, formData) => {
    try {
      const response = await API.put(`/property-units/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
    //error('Error updating property unit:', error);
      throw error;
    }
  },

  // Update property unit (admin)
  updatePropertyUnitAdmin: async (id, formData) => {
    try {
      const response = await API.put(`/property-units/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
    //error('Error updating property unit:', error);
      throw error;
    }
  },

  // Delete property unit
  deletePropertyUnit: async (id) => {
    try {
      const response = await API.delete(`/property-units/${id}`);
      return response.data;
    } catch (error) {
    //error('Error deleting property unit:', error);
      throw error;
    }
  },

  // Delete property unit (admin)
  deletePropertyUnitAdmin: async (id) => {
    try {
      const response = await API.delete(`/admin/property-units/${id}`);
      return response.data;
    } catch (error) {
    //error('Error deleting property unit:', error);
      throw error;
    }
  },

  // Bulk update
  bulkUpdatePropertyUnits: async (data) => {
    try {
      const response = await API.put('/admin/property-units/bulk/update', data);
      return response.data;
    } catch (error) {
    //error('Error bulk updating:', error);
      throw error;
    }
  },

  // Bulk delete
  bulkDeletePropertyUnits: async (data) => {
    try {
      const response = await API.delete('/admin/property-units/bulk/delete', { data });
      return response.data;
    } catch (error) {
    //error('Error bulk deleting:', error);
      throw error;
    }
  },

  // Update display orders
// Update display orders - FIXED
updateDisplayOrders: async (displayOrders) => {
  try {
  //log('Sending display orders:', displayOrders);
    const response = await API.put('/admin/property-units/display-orders/update', { 
      displayOrders 
    });
  //log('Display orders response:', response.data);
    return response.data;
  } catch (error) {
  //error('Error updating display orders:', error);
    // More detailed error logging
    if (error.response) {
    //error('Response data:', error.response.data);
    //error('Response status:', error.response.status);
    //error('Response headers:', error.response.headers);
    } else if (error.request) {
    //error('No response received:', error.request);
    } else {
    //error('Error setting up request:', error.message);
    }
    throw error;
  }
},
  // Get pending approvals
  getPendingApprovals: async () => {
    try {
      const response = await API.get('/admin/property-units/pending');
      return response.data;
    } catch (error) {
    //error('Error fetching pending approvals:', error);
      throw error;
    }
  },

  // Get my properties
  getMyProperties: async () => {
    try {
      const response = await API.get('/property-units/my-properties');
      return response.data;
    } catch (error) {
    //error('Error fetching my properties:', error);
      throw error;
    }
  }
};