// services/projectBatchService.js
import axios from 'axios';

const API_URL = 'https://saimr-backend-1.onrender.com/api/batches';

export const projectBatchService = {
  // ========== PROJECT BATCH METHODS ==========
  
  // Get all project batches with pagination
  getProjectBatches: async (options = {}) => {
    try {
      const {
        page = 1,
        limit = 6,
        sortBy = 'displayOrder',
        sortOrder = 'asc'
      } = options;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });
      
      const response = await axios.get(`${API_URL}/project?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project batches:', error);
      throw error;
    }
  },

  // Get single project batch by ID
  getProjectBatchById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/project/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project batch:', error);
      throw error;
    }
  },

  // Get featured project batches
  getFeaturedProjectBatches: async (limit = 3) => {
    try {
      const response = await axios.get(`${API_URL}/project/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured project batches:', error);
      throw error;
    }
  },

  // Filter project batches
  filterProjectBatches: async (filters = {}) => {
    try {
      const {
        page = 1,
        limit = 6,
        search = '',
        location = '',
        minProperties = 0,
        maxProperties = null,
        sortBy = 'displayOrder',
        sortOrder = 'asc'
      } = filters;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        location,
        minProperties: minProperties.toString(),
        sortBy,
        sortOrder
      });
      
      if (maxProperties) {
        params.append('maxProperties', maxProperties.toString());
      }
      
      const response = await axios.get(`${API_URL}/project/filter?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error filtering project batches:', error);
      throw error;
    }
  },

  // ========== LOCATION BATCH METHODS ==========
  
  // Get all location-based batches with pagination
  getLocationBatches: async (options = {}) => {
    try {
      const {
        page = 1,
        limit = 6,
        sortBy = 'displayOrder',
        sortOrder = 'asc'
      } = options;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });
      
      const response = await axios.get(`${API_URL}/location?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location batches:', error);
      throw error;
    }
  },

  // Get single location batch by ID
  getLocationBatchById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/location/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location batch:', error);
      throw error;
    }
  },

  // Get featured location batches
  getFeaturedLocationBatches: async (limit = 3) => {
    try {
      const response = await axios.get(`${API_URL}/location/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured location batches:', error);
      throw error;
    }
  },

  // Filter location batches by city, state, etc.
  filterLocationBatches: async (filters = {}) => {
    try {
      const {
        page = 1,
        limit = 6,
        search = '',
        city = '',
        state = '',
        minProperties = 0,
        maxProperties = null,
        sortBy = 'displayOrder',
        sortOrder = 'asc'
      } = filters;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        city,
        state,
        minProperties: minProperties.toString(),
        sortBy,
        sortOrder
      });
      
      if (maxProperties) {
        params.append('maxProperties', maxProperties.toString());
      }
      
      const response = await axios.get(`${API_URL}/location/filter?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error filtering location batches:', error);
      throw error;
    }
  },

  // ========== HELPER/ALIAS METHODS ==========
  
  // Get all batches (alias - returns both types or filter)
  getAllBatches: async (options = {}) => {
    // You can modify this to return either project or location batches
    // based on a parameter, or return both
    const { type = 'project', ...rest } = options;
    if (type === 'location') {
      return await projectBatchService.getLocationBatches(rest);
    }
    return await projectBatchService.getProjectBatches(rest);
  },

  // Get batch by ID (auto-detects type)
  getBatch: async (id) => {
    try {
      // Try project batch first
      const projectResponse = await projectBatchService.getProjectBatchById(id);
      if (projectResponse.success && projectResponse.data) {
        return projectResponse;
      }
    } catch (error) {
      // If not found, try location batch
      return await projectBatchService.getLocationBatchById(id);
    }
  }
};