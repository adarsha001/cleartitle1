import axios from "axios";

// Use relative paths in production, full URL in development
const isDevelopment = import.meta.env.DEV;
const baseURL = 'https://saimr-backend-1.onrender.com/api'
  

// Public API for click tracking (no authentication required)
const PublicAPI = axios.create({
  baseURL,
  timeout: 10000,
});

// Add request interceptor to log all outgoing requests
PublicAPI.interceptors.request.use((config) => {
  if (isDevelopment) {
  //log('📤 Public API Request:', {
    //   url: config.url,
    //   method: config.method,
    // });
  }
  return config;
});

// Add response interceptor for debugging
PublicAPI.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
    //log('✅ Public API Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    console.error('❌ Public API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Enhanced public click tracking that includes user data from localStorage
export const trackClickPublic = async (clickData) => {
  try {
    // Get user data directly from localStorage
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    // Get or create session ID
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('sessionId', sessionId);
    }

    // Prepare user data if logged in
    const userData = user ? {
      userId: user.id || user._id,
      userName: user.name || user.username || user.gmail || user.email
    } : {};

    const trackingData = {
      ...clickData,
      ...userData,
      sessionId: sessionId,
      pageUrl: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    if (isDevelopment) {
    //log('📤 Tracking click with user data:', {
      //   ...trackingData,
      //   hasUser: !!user,
      //   userId: user?.id,
      //   userName: user?.name
      // });
    }

    const response = await PublicAPI.post("/clicks/track", trackingData);
    
    if (isDevelopment) {
    //log('✅ Click tracked successfully:', response.data);
    }
    return response.data;
  } catch (error) {
  //warn('⚠️ Click tracking failed:', error.message);
    // Fail gracefully - don't break the user experience
    return { 
      success: false, 
      message: 'Tracking failed but action completed',
      error: error.message 
    };
  }
};

// Legacy function for components that don't need user data
export const trackClickAnonymous = async (clickData) => {
  try {
    const response = await PublicAPI.post("/clicks/track", {
      ...clickData,
      pageUrl: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    return response.data;
  } catch (error) {
  //warn('⚠️ Click tracking failed:', error.message);
    return { success: false, message: 'Tracking failed but action completed' };
  }
};

export default PublicAPI;