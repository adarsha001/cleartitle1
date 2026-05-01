import axios from 'axios';

const API_URL =  'http://localhost:5000/api/myproperties';

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
  (error) => {
    return Promise.reject(error);
  }
);

// Property API calls
export const propertyService = {
  // Get user's properties with filters
  getUserProperties: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    const response = await api.get(`/my-properties?${params}`);
    return response.data;
  },

  // Get single property
  getPropertyById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    const response = await api.put(`/${id}`, propertyData);
    return response.data;
  },

  // Delete property
  deleteProperty: async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  // Bulk delete properties
  bulkDeleteProperties: async (propertyIds) => {
    const response = await api.delete('/bulk-delete', {
      data: { propertyIds }
    });
    return response.data;
  },

  // Update property status
  updatePropertyStatus: async (id, availability) => {
    const response = await api.patch(`/${id}/status`, { availability });
    return response.data;
  },
};

export default api;