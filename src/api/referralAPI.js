// services/referralAPI.js
const API_BASE_URL =  'https://saimr-backend-1.onrender.com/api';

const referralAPI = {

  checkReferralStatus: async (userId) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/referrals/status/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check referral status');
      }
      
      return data;
    } catch (error) {
      console.error('Error checking referral status:', error);
      throw error;
    }
  },

  /**
   * Search agent by referral code
   */
  searchAgentByReferralCode: async (referralCode) => {
    if (!referralCode) {
      throw new Error('Referral code is required');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/referrals/search/${referralCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search referral code');
      }
      
      return data;
    } catch (error) {
      console.error('Error searching referral code:', error);
      throw error;
    }
  },

  /**
   * Apply referral code for a user
   */
  applyReferral: async (userId, referralCode) => {
    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required. Please log in again.');
    }
    
    if (!referralCode) {
      throw new Error('Referral code is required');
    }
    
    console.log('Applying referral - UserId:', userId, 'ReferralCode:', referralCode);
    
    try {
      const response = await fetch(`${API_BASE_URL}/referrals/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: userId,
          referralCode: referralCode
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply referral code');
      }
      
      return data;
    } catch (error) {
      console.error('Error applying referral:', error);
      throw error;
    }
  },

  /**
   * Get referral statistics for an agent
   * @param {string} agentId - Agent ID
   * @returns {Promise}
   */
  getAgentReferralStats: async (agentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/referrals/agent/${agentId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch agent stats');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching agent referral stats:', error);
      throw error;
    }
  },

  /**
   * Get referral history for an agent
   * @param {string} agentId - Agent ID
   * @param {object} params - Query params (page, limit, status)
   * @returns {Promise}
   */
  getAgentReferralHistory: async (agentId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/referrals/agent/${agentId}/history${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch referral history');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching referral history:', error);
      throw error;
    }
  },

  /**
   * Generate referral link for agent
   * @param {string} referralCode - Agent's referral code
   * @param {string} baseUrl - Base URL of the app
   * @returns {string}
   */
  generateReferralLink: (referralCode, baseUrl = window.location.origin) => {
    return `${baseUrl}/register?ref=${referralCode}`;
  },

  /**
   * Extract referral code from current URL
   * @returns {string|null}
   */
  getReferralCodeFromURL: () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
  }
};

export default referralAPI;