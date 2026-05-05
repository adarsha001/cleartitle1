import API from './axios';

const AdminAPI = {
  // Get all users with pagination and filters
  getAllUsers: (params = {}) => {
    const { page = 1, limit = 10, search = '', sourceWebsite = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (search) queryParams.append('search', search);
    if (sourceWebsite) queryParams.append('sourceWebsite', sourceWebsite);
    
    return API.get(`/admin/users?${queryParams.toString()}`);
  },

  // Get user by ID with complete details - FIXED ROUTE
  getUserById: (userId) => {
    return API.get(`/admin/clear/users/${userId}`);
  },

  // Get website user statistics
  getWebsiteStats: () => {
    return API.get('/admin/stats/website');
  },

  // Get users by specific website
  getUsersByWebsite: (website, params = {}) => {
    const { page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return API.get(`/admin/website/${website}?${queryParams.toString()}`);
  },

  // Update user status or role
  updateUserRole: (userId, roleData) => {
    return API.put(`/admin/users/${userId}/role`, roleData);
  },

  // Toggle user verification status
  toggleUserVerification: (userId) => {
    return API.patch(`/admin/users/${userId}/verify`);
  },

  // Delete user account
  deleteUser: (userId) => {
    return API.delete(`/admin/users/${userId}`);
  },

  // Get user activity logs
  getUserActivityLogs: (userId, params = {}) => {
    const { page = 1, limit = 50 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return API.get(`/admin/users/${userId}/activity?${queryParams.toString()}`);
  }
};

export default AdminAPI;