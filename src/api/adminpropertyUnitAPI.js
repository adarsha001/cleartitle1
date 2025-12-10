import axios from 'axios';

export const API_URL = 'https://saimr-backend-1.onrender.com/api';

export const propertyUnitAPI = {
  // Get all property units for ADMIN (with admin filters)
  getAllPropertyUnits: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/admin/property-units`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching property units:', error);
      throw error;
    }
  },

  // Get all property units for PUBLIC (without admin filters)
  getPublicPropertyUnits: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/property-units`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching public property units:', error);
      throw error;
    }
  },

  // Get single property unit (public or admin based on auth)
  getPropertyUnit: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_URL}/property-units/${id}`, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching property unit:', error);
      throw error;
    }
  },

  // Create property unit
  createPropertyUnit: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/property-units`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating property unit:', error);
      throw error;
    }
  },

  // Update property unit
  updatePropertyUnit: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/property-units/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating property unit:', error);
      throw error;
    }
  },

  // Delete property unit
  deletePropertyUnit: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/property-units/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting property unit:', error);
      throw error;
    }
  },

  // ADMIN ONLY ROUTES
  // Update approval status (admin only)
  updateApprovalStatus: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/admin/property-units/${id}/approval`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating approval status:', error);
      throw error;
    }
  },

  // Toggle featured status (admin only)
  toggleFeatured: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/admin/property-units/${id}/toggle-featured`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling featured:', error);
      throw error;
    }
  },

  // Toggle verified status (admin only)
  toggleVerified: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/admin/property-units/${id}/toggle-verified`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error toggling verified:', error);
      throw error;
    }
  },

  // Bulk update property units (admin only)
  bulkUpdatePropertyUnits: async (data) => {
    try {
      const response = await axios.put(`${API_URL}/admin/property-units/bulk/update`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating property units:', error);
      throw error;
    }
  },

  // Bulk delete property units (admin only)
  bulkDeletePropertyUnits: async (data) => {
    try {
      const response = await axios.delete(`${API_URL}/admin/property-units/bulk/delete`, {
        data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting property units:', error);
      throw error;
    }
  },

  // Get property unit statistics (admin only)
  getPropertyUnitStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/property-units/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Get property unit by ID for admin
  getPropertyUnitByIdAdmin: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/property-units/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching property unit for admin:', error);
      throw error;
    }
  },

  // Create property unit as admin
  createPropertyUnitAdmin: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/admin/property-units`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating property unit as admin:', error);
      throw error;
    }
  },

  // Update property unit as admin
  updatePropertyUnitAdmin: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/admin/property-units/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating property unit as admin:', error);
      throw error;
    }
  },

  // Delete property unit as admin
  deletePropertyUnitAdmin: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/admin/property-units/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting property unit as admin:', error);
      throw error;
    }
  }
};

// Update display orders (for drag & drop reordering)
export const updateDisplayOrders = async (orders) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/admin/property-units/display-orders/update`,
      { orders },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update display orders error:', error);
    throw error;
  }
};

// Update single display order
export const updateSingleDisplayOrder = async (id, displayOrder) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/admin/property-units/${id}/display-order`,
      { displayOrder },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update single display order error:', error);
    throw error;
  }
};

