// services/projectBatchService.js
import axios from 'axios';

const API_URL = 'https://saimr-backend-1.onrender.com/api/batches';

export const projectBatchService = {
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

  // Get project batches with advanced filtering
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

  // Get single project batch by ID
  getProjectBatchById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/project/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project batch:', error);
      throw error;
    }
  }
};