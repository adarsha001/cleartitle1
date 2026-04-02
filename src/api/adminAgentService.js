// src/services/adminAgentService.js
import axios from 'axios';

const API_URL = ' https://saimr-backend-1.onrender.com/api';

// Create axios instance with auth header
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

// Agent Admin API Endpoints
export const adminAgentService = {
  // Get all agent applications
  getAgentApplications: async (params = {}) => {
    try {
      const response = await api.get('/admin/agents/applications', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  },

  // Get agent by agentId
  getAgentById: async (agentId) => {
    try {
      const response = await api.get(`/admin/agents/${agentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  },

  // Search agents
  searchAgents: async (params = {}) => {
    try {
      const response = await api.get('/admin/agents/search', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  },

  // Approve agent
  approveAgent: async (userId, agentData) => {
    try {
      const response = await api.put(`/admin/agents/${userId}/approve`, agentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  },

  // Reject agent
  rejectAgent: async (userId, rejectionData) => {
    try {
      const response = await api.put(`/admin/agents/${userId}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  },

  // Set agent to pending
  setAgentToPending: async (userId, notes) => {
    try {
      const response = await api.put(`/admin/agents/${userId}/pending`, { notes });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  },

  // Suspend agent
  suspendAgent: async (userId, suspensionData) => {
    try {
      const response = await api.put(`/admin/agents/${userId}/suspend`, suspensionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  },

  // Reactivate agent
  reactivateAgent: async (userId, notes) => {
    try {
      const response = await api.put(`/admin/agents/${userId}/reactivate`, { notes });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  },

  // Get agent stats
  getAgentStats: async () => {
    try {
      const response = await api.get('/admin/agents/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  },
};

export default adminAgentService;