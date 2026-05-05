// services/cardAdApi.js
import axios from 'axios';

// Use relative path or environment variable for API URL
const API_BASE_URL = 'https://saimr-backend-1.onrender.com/api';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ PUBLIC ENDPOINTS ============

export const cardAdApi = {
  // Get all sections with their ads
  getAllSections: (params) => {
    const { target } = params || {};
    return api.get('/card-ads/sections', { params: { target } });
  },

  // Get ads for specific section
  getSectionAds: (sectionId, params) => {
    const { target, limit } = params || {};
    return api.get(`/card-ads/section/${sectionId}`, { 
      params: { target, limit } 
    });
  },

  // Get available sections list
  getSectionsList: () => {
    return api.get('/card-ads/sections/list');
  },

  // Track click on ad
  trackClick: (adId) => {
    return api.post(`/card-ads/track-click/${adId}`);
  },
};

// ============ ADMIN ENDPOINTS ============

export const cardAdAdminApi = {
  // Create new ad with image upload
  createAd: (formData) => {
    return api.post('/card-ads/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Update existing ad
  updateAd: (id, formData) => {
    return api.put(`/card-ads/update/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Delete ad
  deleteAd: (id) => {
    return api.delete(`/card-ads/delete/${id}`);
  },

  // Update display order for section
  updateSectionOrder: (section, updates) => {
    return api.post('/card-ads/update-order', { section, updates });
  },
};

export default cardAdApi;