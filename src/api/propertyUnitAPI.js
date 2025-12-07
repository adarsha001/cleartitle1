// In your api/axios.js or similar file
import axios from 'axios';

const baseURL = 'https://saimr-backend-1.onrender.com/api';

const API = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
});

// Add the property unit API endpoints
export const propertyUnitAPI = {
  // Get all property units with filters
  getPropertyUnits: (params = {}) => {
    return API.get('/property-units', { params });
  },

  // Get single property unit
  getPropertyUnit: (id) => {
    return API.get(`/property-units/${id}`);
  },

  // Create property unit (FormData for images)
  createPropertyUnit: (formData) => {
    const APII = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: true,
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      APII.defaults.headers.Authorization = `Bearer ${token}`;
    }
    
    return APII.post('/property-units', formData);
  },

  // Update property unit
  updatePropertyUnit: (id, formData) => {
    const APII = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: true,
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      APII.defaults.headers.Authorization = `Bearer ${token}`;
    }
    
    return APII.put(`/property-units/${id}`, formData);
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
  }
};