import axios from 'axios';

const API_URL = 'https://saimr-backend-1.onrender.com/api/admin/batches';

// Create axios instance with auth token
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_URL,
  });

  // Add token to requests
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createAxiosInstance();

// Check if user is admin
export const checkAdminAccess = async () => {
  try {
    // You might want to check user role from your existing auth system
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return false;
    
    // Decode token to check user role (simple implementation)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isAdmin = payload.userType === 'admin' || 
                    payload.userType === 'superadmin' || 
                    payload.role === 'admin' || 
                    payload.isAdmin === true;
    
    return isAdmin;
  } catch (error) {
  //error('Error checking admin access:', error);
    return false;
  }
};

// Batch CRUD Operations
export const batchService = {
  // Create new batch
  createBatch: async (batchData) => {
    const formData = new FormData();
    
    // Append all fields to formData
    Object.keys(batchData).forEach(key => {
      if (key === 'image' && batchData[key] instanceof File) {
        formData.append('image', batchData[key]);
      } else if (key === 'propertyUnits' && Array.isArray(batchData[key])) {
        formData.append('propertyUnits', JSON.stringify(batchData[key]));
      } else if (key === 'locationCoordinates' && batchData[key]) {
        formData.append('locationCoordinates', JSON.stringify(batchData[key]));
      } else if (key === 'tags' && Array.isArray(batchData[key])) {
        formData.append('tags', JSON.stringify(batchData[key]));
      } else if (batchData[key] !== undefined && batchData[key] !== null) {
        formData.append(key, batchData[key]);
      }
    });

    const response = await api.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all batches
  getAllBatches: async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
  },

  // Get single batch
  getBatch: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Update batch
  updateBatch: async (id, batchData) => {
    const formData = new FormData();
    
    Object.keys(batchData).forEach(key => {
      if (key === 'image' && batchData[key] instanceof File) {
        formData.append('image', batchData[key]);
      } else if (key === 'propertyUnits' && Array.isArray(batchData[key])) {
        formData.append('propertyUnits', JSON.stringify(batchData[key]));
      } else if (key === 'locationCoordinates' && batchData[key]) {
        formData.append('locationCoordinates', JSON.stringify(batchData[key]));
      } else if (key === 'tags' && Array.isArray(batchData[key])) {
        formData.append('tags', JSON.stringify(batchData[key]));
      } else if (batchData[key] !== undefined && batchData[key] !== null) {
        formData.append(key, batchData[key]);
      }
    });

    const response = await api.put(`/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete batch
 deleteBatch: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      // Handle different error types
      if (error.response) {
        // Server responded with error
        throw new Error(error.response.data.message || 'Failed to delete batch');
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server');
      } else {
        // Something else happened
        throw new Error('Error setting up request');
      }
    }
  },
  // Add property unit to batch
  addPropertyUnit: async (batchId, propertyUnitId) => {
    const response = await api.post(`/${batchId}/add-unit`, { propertyUnitId });
    return response.data;
  },

  // Remove property unit from batch
  removePropertyUnit: async (batchId, propertyUnitId) => {
    const response = await api.post(`/${batchId}/remove-unit`, { propertyUnitId });
    return response.data;
  },

  // Toggle batch active status
  toggleActiveStatus: async (batchId) => {
    const response = await api.patch(`/${batchId}/toggle-active`);
    return response.data;
  },

  // Get batch statistics
  getBatchStats: async () => {
    const response = await api.get('/stats/summary');
    return response.data;
  },

  // Search property units for adding to batch
  searchPropertyUnits: async (searchParams) => {
    // This should call your existing property units API
    const response = await axios.get('/api/property-units', {
      params: searchParams,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
      },
    });
    return response.data;
  },
};