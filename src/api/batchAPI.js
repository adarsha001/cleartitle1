// api/batchAPI.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://saimr-backend-1.onrender.com/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper functions
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('batchSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('batchSessionId', sessionId);
  }
  return sessionId;
};

const generateSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const batchAPI = {
  // ============= PROPERTY VIEW TRACKING =============
  
  // Record property view (called when user clicks property)
  recordPropertyView: async (propertyId, options = {}) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping view recording');
        return null;
      }
      
      const { duration = 0, source = 'direct', timeWindowHours = 24 } = options;
      const sessionId = getSessionId();
      
      const response = await API.post(`/batch-views/property/${propertyId}/view`, {
        duration,
        source,
        sessionId,
        timeWindowHours
      });
      
      return response.data;
    } catch (error) {
      console.warn('Failed to record property view:', error?.response?.data?.message || error.message);
      return null;
    }
  },
  
  // ============= USER BATCH METHODS =============
  
  // Get batch analytics (for batch owner)
  getBatchAnalytics: async (batchId) => {
    const response = await API.get(`/batch-views/batch/${batchId}/analytics`);
    return response.data;
  },
  
  // Get user's own batches
  getUserBatches: async () => {
    const response = await API.get('/batch-views/user/my-batches');
    return response.data;
  },
  
  // ============= ADMIN METHODS =============
  
  // Get all batches (admin only)
  getAllBatches: async () => {
    const response = await API.get('/batch-views/admin/all');
    return response.data;
  },
  
  // Get batch by ID with full details (admin only)
  getBatchById: async (batchId) => {
    const response = await API.get(`/batch-views/admin/batch/${batchId}`);
    return response.data;
  },
  
  // Get company-wide analytics (admin only)
  getCompanyAnalytics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.companyId) params.append('companyId', filters.companyId);
    
    const response = await API.get(`/batch-views/admin/company-analytics?${params}`);
    return response.data;
  },
  
  // Delete batch (admin only)
  deleteBatch: async (batchId) => {
    const response = await API.delete(`/batch-views/admin/batch/${batchId}`);
    return response.data;
  },
  
  // Toggle batch active status (admin only)
  toggleBatchStatus: async (batchId) => {
    const response = await API.patch(`/batch-views/admin/batch/${batchId}/toggle`);
    return response.data;
  },
  
  // Get batch property click stats (admin only)
  getBatchPropertyClickStats: async (batchId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await API.get(`/batch-views/admin/batch/${batchId}/property-clicks?${params}`);
    return response.data;
  },
  
  // Get batch user click stats (admin only)
  getBatchUserClickStats: async (batchId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await API.get(`/batch-views/admin/batch/${batchId}/user-clicks?${params}`);
    return response.data;
  },
  
  // Export batch analytics (admin only)
  exportBatchAnalytics: async (batchId, format = 'csv', filters = {}) => {
    const params = new URLSearchParams({ format });
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await API.get(`/batch-views/admin/batch/${batchId}/export?${params}`, {
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  },
  
  // ============= UTILITY METHODS =============
  
  // Get session ID helper
  getSessionId: getSessionId,
  
  // Refresh session ID
  refreshSessionId: () => {
    const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('batchSessionId', newSessionId);
    return newSessionId;
  },
  
  // Clear session ID
  clearSessionId: () => {
    sessionStorage.removeItem('batchSessionId');
    sessionStorage.removeItem('sessionId');
  }
};

export default API;