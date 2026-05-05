// api/adminAgentService.js
const API_BASE_URL =  'https://saimr-backend-1.onrender.com/api';

const adminAgentService = {
  // Get all agents with pagination
  getAllAgents: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/admin/agents?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get global agent statistics for dashboard
  getGlobalAgentStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents/stats/global`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get agent summary by agentId
  getAgentSummary: async (agentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents/${agentId}/summary`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get agent's referred users
  getAgentReferredUsers: async (agentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents/${agentId}/referred-users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Get agent's appointments
  getAgentAppointments: async (agentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents/${agentId}/appointments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Update agent status
  updateAgentStatus: async (agentId, statusData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/agents/${agentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(statusData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export default adminAgentService;