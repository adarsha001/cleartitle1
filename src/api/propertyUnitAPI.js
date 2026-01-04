// api/propertyUnitAPI.js
import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'https://saimr-backend-1.onrender.com/api',
  timeout: 15000,
});

// Add request interceptor to include token
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

// Add response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Property Unit API methods
export const propertyUnitAPI = {
  // Get all property units with filters
// Get all property units with filters
getPropertyUnits: (params = {}) => {
  // Clean up params - remove empty strings
  const cleanParams = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      cleanParams[key] = params[key];
    }
  });
  
  console.log('API - Sending params:', cleanParams);
  
  return API.get('/property-units', { 
    params: cleanParams,
    paramsSerializer: {
      indexes: null
    }
  }).then(response => {
    console.log('API - Response data:', response.data);
    return response;
  });
},
  // Get single property unit
  getPropertyUnit: (id) => {
    return API.get(`/property-units/${id}`);
  },

  // Create property unit (FormData for images)
  createPropertyUnit: (formData) => {
    return API.post('/property-units', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update property unit
  updatePropertyUnit: (id, formData) => {
    return API.put(`/property-units/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete property unit
  deletePropertyUnit: (id) => {
    return API.delete(`/property-units/${id}`);
  },

  // Get pending approvals (admin only)
  getPendingApprovals: () => {
    return API.get('/property-units/admin/pending');
  },

  // Update approval status (admin only)
  updateApprovalStatus: (id, status, reason = '') => {
    return API.put(`/property-units/admin/${id}/status`, {
      approvalStatus: status,
      rejectionReason: reason
    });
  },

  // Get my properties
  getMyProperties: () => {
    return API.get('/property-units/my-properties');
  },

  // Get featured property units
 getFeaturedPropertyUnits: async (params = {}) => {
  try {
    console.log('getFeaturedPropertyUnits called with params:', params);
    
    // For featured endpoint, we don't send any parameters
    // Remove all parameters or only send essential ones if backend expects them
    const cleanParams = {};
    
    // Only include parameters that the backend actually accepts
    // If backend doesn't accept any params, leave cleanParams empty
    
    console.log('Making request with cleaned params:', cleanParams);
    
    const response = await API.get('/property-units/featured', { 
      // Remove params entirely or keep empty object
      // params: cleanParams, // Comment this out if backend doesn't accept params
    });
    
    console.log('Featured properties response:', response.data);
    return response;
  } catch (error) {
    console.error('Error in getFeaturedPropertyUnits:', error.response?.data || error.message);
    throw error;
  }
}
};