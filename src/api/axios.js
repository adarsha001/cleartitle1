// src/api/axios.js
import axios from 'axios';

const baseURL = 'https://saimr-backend-1.onrender.com/api';

// Create main API instance for JSON requests
const API = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
});

// Create separate instance for FormData/multipart requests
const APII = axios.create({
  baseURL,
  timeout: 30000, // Longer timeout for file uploads
  withCredentials: true,
});

// Request interceptor for JSON API
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers['Content-Type'] = 'application/json';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor for FormData API (APII)
APII.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let browser set it automatically
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Common response interceptor for both instances
const handleResponseError = (error) => {
  console.error('❌ Response error:', {
    url: error.config?.url,
    status: error.response?.status,
    message: error.message,
    code: error.code,
    data: error.response?.data
  });

  if (error.code === 'ECONNABORTED') {
    throw new Error('Request timeout. Please check your connection.');
  }

  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  if (error.response?.status === 403) {
    throw new Error('You do not have permission to access this resource.');
  }

  if (!error.response) {
    throw new Error('Network error. Please check your connection and try again.');
  }

  return Promise.reject(error);
};

API.interceptors.response.use(
  (response) => {
    return response;
  },
  handleResponseError
);

APII.interceptors.response.use(
  (response) => {
    return response;
  },
  handleResponseError
);

// ==================== PROPERTY APIs ====================
export const getProperties = (params = {}) => {
  return API.get("/properties", { 
    params: { 
      ...params, 
      website: "cleartitle",
      page: params.page || 1,
      limit: params.limit || 12
    } 
  });
};

export const getPropertyById = (id) => API.get(`/properties/${id}`);
export const getAllProperties = () => API.get("/properties", { 
  params: { 
    limit: 1000, 
    page: 1 
  } 
});

// ==================== ENQUIRY APIs ====================
export const createEnquiry = (enquiryData) => API.post("/auth/enquiries", enquiryData);
export const getUserEnquiries = () => API.get("/users/my-enquiries");

// ==================== USER PROFILE APIs ====================
export const getUserProfile = () => API.get("/users/profile");
export const updateUserProfile = (userData) => API.put("/users/profile", userData);
export const deleteUserAccount = () => API.delete("/users/account");
export const getUserProperties = () => API.get("/users/properties");
export const deleteUserProperty = (propertyId) => API.delete(`/properties/${propertyId}`);

// ==================== PASSWORD MANAGEMENT APIs ====================

/**
 * Change user password (within profile update)
 * This is handled by updateUserProfile with password fields
 * @param {Object} passwordData - { currentPassword, newPassword, confirmNewPassword }
 * @returns {Promise} - Returns success message
 */
export const changePassword = (passwordData) => {
  return API.post('/users/change-password', passwordData);
};

/**
 * Forgot password - Request password reset email
 * @param {string} email - User's email address
 * @returns {Promise} - Returns success message
 */
export const forgotPassword = (email) => {
  return API.post('/auth/forgot-password', { email });
};

/**
 * Reset password with token
 * @param {string} token - Reset token from email
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise} - Returns success message
 */
export const resetPassword = (token, newPassword, confirmPassword) => {
  return API.post(`/auth/reset-password/${token}`, { newPassword, confirmPassword });
};

// ==================== AGENT APIs ====================

/**
 * Apply for agent status (called after user selects agent type)
 * @param {string} referralCode - Optional referral code from another agent
 * @returns {Promise} - Returns agent profile data
 */
export const applyForAgent = (referralCode) => {
  return API.post('/users/apply-agent', { referralCode });
};

/**
 * Check if current user has an agent profile
 * @returns {Promise} - Returns hasAgentProfile boolean and agent data if exists
 */
export const checkAgentStatus = () => {
  return API.get('/users/check-agent-status');
};

/**
 * Get agent profile details
 * @returns {Promise} - Returns complete agent profile
 */
export const getAgentProfile = () => {
  return API.get('/agent/profile');
};

/**
 * Get agent referral info (code and stats only)
 * @returns {Promise} - Returns referral code, count, and rewards
 */
export const getAgentReferralInfo = () => {
  return API.get('/agent/referral-info');
};

/**
 * Get agent dashboard statistics
 * @returns {Promise} - Returns dashboard stats including referrals, rewards, appointments
 */
export const getAgentDashboard = () => {
  return API.get('/agent/dashboard');
};

/**
 * Get all appointments for the agent
 * @param {Object} params - Query parameters (status, startDate, endDate)
 * @returns {Promise} - Returns list of appointments
 */
export const getAgentAppointments = (params = {}) => {
  return API.get('/agent/appointments', { params });
};

/**
 * Schedule a new appointment for a client
 * @param {Object} appointmentData - { clientId, propertyId, appointmentDate, appointmentTime, notes }
 * @returns {Promise} - Returns created appointment
 */
export const scheduleAppointment = (appointmentData) => {
  return API.post('/agent/appointments', appointmentData);
};

/**
 * Update appointment status
 * @param {string} appointmentId - ID of the appointment
 * @param {Object} updateData - { status, feedback, dealValue }
 * @returns {Promise} - Returns updated appointment
 */
export const updateAppointmentStatus = (appointmentId, updateData) => {
  return API.put(`/agent/appointments/${appointmentId}`, updateData);
};

/**
 * Get agent referral statistics with history
 * @returns {Promise} - Returns referral stats including history
 */
export const getAgentReferralStats = () => {
  return API.get('/agent/referral-stats');
};

/**
 * Track referral signup (called during user registration)
 * @param {Object} data - { referralCode, userId }
 * @returns {Promise} - Returns tracking result
 */
export const trackReferralSignup = (data) => {
  return API.post('/agent/track-referral', data);
};

// ==================== PROPERTY FORM DATA APIs ====================
export const createProperty = (formData) => APII.post("/properties", formData);

export const uploadPropertyImages = (propertyId, images) => {
  const formData = new FormData();
  images.forEach(image => {
    formData.append('images', image);
  });
  return APII.post(`/properties/${propertyId}/images`, formData);
};

export const updatePropertyImages = (propertyId, images) => {
  const formData = new FormData();
  images.forEach(image => {
    formData.append('images', image);
  });
  return APII.put(`/properties/${propertyId}/images`, formData);
};

export const deletePropertyImage = (propertyId, imageId) => 
  APII.delete(`/properties/${propertyId}/images/${imageId}`);

export const uploadUserAvatar = (avatarFile) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  return APII.post('/users/upload-avatar', formData);
};

// ==================== EXPORTS ====================
export { APII };
export default API;