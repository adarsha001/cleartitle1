// services/carouselApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
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

// ============ PUBLIC ENDPOINTS ============

export const carouselApi = {
  // Public endpoints
  getImages: (params) => api.get('/carousel/images', { params }),
  getImageById: (id) => api.get(`/carousel/images/${id}`),
  getMainBanners: (params) => api.get('/carousel/main-banners', { params }),
  getByPropertyType: (params) => api.get('/carousel/by-property-type', { params }),
  getRandomImages: (params) => api.get('/carousel/random', { params }),
  trackClick: (id) => api.post(`/carousel/track-click/${id}`),

  // Admin endpoints
  createImage: (formData) => api.post('/carousel/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateImage: (id, formData) => api.put(`/carousel/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (id) => api.delete(`/carousel/delete/${id}`),
  updateOrder: (data) => api.post('/carousel/update-order', data),
};

export default carouselApi;