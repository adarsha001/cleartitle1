import axios from 'axios';

const API = axios.create({
  baseURL: 'https://saimr-backend-1.onrender.com/api',
  timeout: 70000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Session management
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('batchSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('batchSessionId', sessionId);
  }
  return sessionId;
};

export const propertyUnitAPI = {
  getPropertyUnits: (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });
    return API.get('/property-units', { params: cleanParams });
  },

  getAllAssignablePropertyUnits: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        cleanParams[key] = params[key];
      }
    });
    const response = await API.get('/property-units/all', { params: cleanParams });
    return response.data;
  },

  getPropertyUnit: async (id) => {
    const response = await API.get(`/property-units/${id}`);
    const token = localStorage.getItem('token');
    if (token && response.data?.success) {
      propertyUnitAPI.recordPropertyView(id).catch(error => {
        console.warn('Failed to record property view (non-critical):', error);
      });
    }
    return response;
  },

  createPropertyUnit: (formData) => {
    return API.post('/property-units', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updatePropertyUnit: (id, formData) => {
    return API.put(`/property-units/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deletePropertyUnit: (id) => {
    return API.delete(`/property-units/${id}`);
  },

  getPendingApprovals: () => {
    return API.get('/property-units/admin/pending');
  },

  updateApprovalStatus: (id, status, reason = '') => {
    return API.put(`/property-units/admin/${id}/status`, {
      approvalStatus: status,
      rejectionReason: reason
    });
  },

  getMyProperties: () => {
    return API.get('/property-units/my-properties');
  },

  getFeaturedPropertyUnits: async () => {
    const response = await API.get('/property-units/featured');
    return response;
  },

  // Batch view tracking methods
  recordPropertyView: async (propertyId, options = {}) => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const { source = 'direct', sessionId = getSessionId(), duration = 0 } = options;
    const response = await API.post(`/batch-views/property/${propertyId}/view`, {
      source,
      sessionId,
      duration
    });
    return response.data;
  },

  getBatchViewStats: async (batchId) => {
    const response = await API.get(`/batch-views/batch/${batchId}/stats`);
    return response.data;
  },

  getUserBatchViews: async (batchId, limit = 50) => {
    const response = await API.get(`/batch-views/batch/${batchId}/user-views`, {
      params: { limit }
    });
    return response.data;
  },

  getUserViewingHistory: async (limit = 50, offset = 0) => {
    const response = await API.get('/batch-views/user/history', {
      params: { limit, offset }
    });
    return response.data;
  },

  getPopularBatches: async (limit = 10, timeFrame = 'all') => {
    const response = await API.get('/batch-views/batches/popular', {
      params: { limit, timeFrame }
    });
    return response.data;
  },

  getBatchViewerInsights: async (batchId) => {
    const response = await API.get(`/batch-views/batch/${batchId}/insights`);
    return response.data;
  },

  getBatchRecommendations: async (limit = 10) => {
    const response = await API.get('/batch-views/user/recommendations', {
      params: { limit }
    });
    return response.data;
  },

  getPropertyBatches: async (propertyId) => {
    const response = await API.get(`/property-units/${propertyId}/batches`);
    return response.data;
  }
};

export const batchSessionHelper = {
  getSessionId,
  refreshSessionId: () => {
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('batchSessionId', newSessionId);
    return newSessionId;
  },
  clearSessionId: () => {
    sessionStorage.removeItem('batchSessionId');
  }
};

export default API;