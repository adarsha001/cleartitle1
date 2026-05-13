// src/services/batchService.js
import axios from 'axios';

const ADMIN_BATCHES_URL = 'https://saimr-backend-1.onrender.com/api/admin/batches';

// Create axios instance with auth token for admin operations
const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL: baseURL,
  });

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

const api = createAxiosInstance(ADMIN_BATCHES_URL);
const publicApi = axios.create({ baseURL: ADMIN_BATCHES_URL });

// Check if user is admin
export const checkAdminAccess = async () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return false;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isAdmin = payload.userType === 'admin' || 
                    payload.userType === 'superadmin' || 
                    payload.role === 'admin' || 
                    payload.isAdmin === true;
    
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};

// Check if user can perform admin action
export const canPerformAdminAction = async () => {
  try {
    const isAdmin = await checkAdminAccess();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) return { allowed: false, message: 'Please login to perform this action' };
    if (!isAdmin) return { allowed: false, message: 'Admin access required for this action' };
    
    return { allowed: true, message: '' };
  } catch (error) {
    return { allowed: false, message: 'Error checking permissions' };
  }
};

// Error handler utility
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { success: false, message: data.message || 'Invalid data provided', errors: data.errors || [], status: 400 };
      case 401:
        return { success: false, message: 'Please login to continue', status: 401 };
      case 403:
        return { success: false, message: data.message || 'Admin access required for this action', status: 403 };
      case 404:
        return { success: false, message: data.message || 'Resource not found', status: 404 };
      case 422:
        return { success: false, message: 'Validation failed', errors: data.errors || [], status: 422 };
      case 500:
        return { success: false, message: 'Server error. Please try again later', status: 500 };
      default:
        return { success: false, message: data.message || 'An error occurred', status: status };
    }
  } else if (error.request) {
    return { success: false, message: 'Unable to connect to server. Please check your internet connection', status: 0 };
  } else {
    return { success: false, message: error.message || 'An unexpected error occurred', status: -1 };
  }
};

export const batchService = {
  // Public routes (no authentication required)
  getAllBatches: async () => {
    try {
      const response = await publicApi.get('/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getBatch: async (id) => {
    try {
      const response = await publicApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getBatchesByLocation: async (location) => {
    try {
      const response = await publicApi.get(`/location/${location}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getBatchesOrderedByType: async (batchType, limit = null) => {
    try {
      const params = limit ? { limit } : {};
      const response = await publicApi.get(`/type/${batchType}/ordered`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin routes (authentication required)
  createBatch: async (batchData) => {
    try {
      const formData = new FormData();
      
      Object.keys(batchData).forEach(key => {
        if (key === 'image' && batchData[key] instanceof File) {
          formData.append('image', batchData[key]);
        } else if (key === 'propertyUnits' && Array.isArray(batchData[key])) {
          const cleanIds = batchData[key].filter(id => id && typeof id === 'string');
          formData.append('propertyUnits', JSON.stringify(cleanIds));
        } else if (key === 'locationCoordinates' && batchData[key]) {
          formData.append('locationCoordinates', JSON.stringify(batchData[key]));
        } else if (key === 'tags' && Array.isArray(batchData[key])) {
          formData.append('tags', JSON.stringify(batchData[key]));
        } else if (key === 'image' && typeof batchData[key] === 'object' && batchData[key]?.url) {
          formData.append('image', JSON.stringify(batchData[key]));
        } else if (batchData[key] !== undefined && batchData[key] !== null) {
          formData.append(key, batchData[key]);
        }
      });

      const response = await api.post('/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateBatch: async (id, batchData) => {
    try {
      console.log('=== UPDATE BATCH START ===');
      console.log('Batch ID:', id);
      
      const formData = new FormData();
      
      for (const [key, value] of Object.entries(batchData)) {
        if (value === undefined || value === null) continue;
        
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } 
        else if (key === 'propertyUnits') {
          let cleanPropertyUnits = [];
          
          if (Array.isArray(value)) {
            cleanPropertyUnits = value
              .map(unit => {
                if (typeof unit === 'object' && unit !== null) {
                  return unit.propertyId || unit._id || null;
                }
                if (typeof unit === 'string') {
                  return unit;
                }
                return null;
              })
              .filter(id => id && typeof id === 'string');
          }
          
          cleanPropertyUnits = [...new Set(cleanPropertyUnits)];
          
          console.log('Cleaned property units (IDs only):', cleanPropertyUnits);
          formData.append('propertyUnits', JSON.stringify(cleanPropertyUnits));
        }
        else if (key === 'locationCoordinates' && value) {
          formData.append('locationCoordinates', JSON.stringify(value));
        }
        else if (key === 'tags' && Array.isArray(value)) {
          formData.append('tags', JSON.stringify(value));
        }
        else if (key === 'image' && typeof value === 'object' && value?.url) {
          formData.append('image', JSON.stringify(value));
        }
        else if (key !== 'propertyUnits') {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      }
      
      const response = await api.put(`/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('Update successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update batch error:', error.response?.data || error.message);
      throw handleApiError(error);
    }
  },

  deleteBatch: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  setBatchDisplayOrder: async (id, order) => {
    try {
      if (!id) throw new Error('Batch ID is required');
      
      const orderNumber = typeof order === 'number' ? order : parseInt(order, 10);
      if (isNaN(orderNumber)) throw new Error('Order must be a valid number');
      
      const response = await api.patch(`/${id}/set-display-order`, { 
        order: orderNumber 
      });
      
      return response.data;
    } catch (error) {
      console.error('setBatchDisplayOrder error:', error.response?.data || error.message);
      throw handleApiError(error);
    }
  },

  addPropertyUnit: async (batchId, propertyUnitId, displayOrder = null) => {
    try {
      const response = await api.post(`/${batchId}/add-unit`, { 
        propertyUnitId,
        displayOrder 
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  removePropertyUnit: async (batchId, propertyUnitId) => {
    try {
      const response = await api.post(`/${batchId}/remove-unit`, { propertyUnitId });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  toggleActiveStatus: async (batchId) => {
    try {
      const response = await api.patch(`/${batchId}/toggle-active`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAllBatchesAdmin: async () => {
    try {
      const response = await api.get('/admin/all');
      return response.data;
    } catch (error) {
      console.error('getAllBatchesAdmin error:', error.response?.data || error.message);
      throw handleApiError(error);
    }
  },

  getBatchesByUser: async (userId) => {
    try {
      const response = await api.get(`/admin/user/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getBatchTypes: () => {
    return [
      { value: 'location_based', label: 'Location Based' },
      { value: 'project_group', label: 'Project Group' },
      { value: 'featured_listings', label: 'Featured Listings' },
      { value: 'similar_properties', label: 'Similar Properties' },
      { value: 'comparison_group', label: 'Comparison Group' }
    ];
  },

  getStatusBadgeClass: (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  },

  getStatusText: (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  }
};

export default batchService;