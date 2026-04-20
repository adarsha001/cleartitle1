import axios from 'axios';

const API_URL = 'https://saimr-backend-1.onrender.com/api/admin/batches';

// Create axios instance with auth token for admin operations
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_URL,
  });

  // Add token to requests
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createAxiosInstance();

// Public axios instance (no auth token) for public routes
const publicApi = axios.create({
  baseURL: API_URL,
});

// Check if user is admin
export const checkAdminAccess = async () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return false;
    
    // Decode token to check user role
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isAdmin = payload.userType === 'admin' || 
                    payload.userType === 'superadmin' || 
                    payload.role === 'admin' || 
                    payload.isAdmin === true;
    
    return isAdmin;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
};

// Batch Services
export const batchService = {
  // ============ PUBLIC ROUTES (No authentication required) ============
  
  // GET /api/property-batches - Get all batches (public)
  getAllBatches: async () => {
    try {
      const response = await publicApi.get('/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // GET /api/property-batches/:id - Get single batch (public)
  getBatch: async (id) => {
    try {
      const response = await publicApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // GET /api/property-batches/location/:location - Get batches by location (public)
  getBatchesByLocation: async (location) => {
    try {
      const response = await publicApi.get(`/location/${location}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ============ ADMIN ONLY ROUTES (Authentication required) ============
  
  // POST /api/property-batches - Create new batch (admin only)
  createBatch: async (batchData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to formData
      Object.keys(batchData).forEach(key => {
        if (key === 'image' && batchData[key] instanceof File) {
          formData.append('image', batchData[key]);
        } else if (key === 'propertyUnits' && Array.isArray(batchData[key])) {
          formData.append('propertyUnits', JSON.stringify(batchData[key]));
        } else if (key === 'locationCoordinates' && batchData[key]) {
          formData.append('locationCoordinates', JSON.stringify(batchData[key]));
        } else if (key === 'tags' && Array.isArray(batchData[key])) {
          formData.append('tags', JSON.stringify(batchData[key]));
        } else if (key === 'image' && typeof batchData[key] === 'object' && batchData[key]?.url) {
          // Handle image object with URL
          formData.append('image', JSON.stringify(batchData[key]));
        } else if (batchData[key] !== undefined && batchData[key] !== null) {
          formData.append(key, batchData[key]);
        }
      });

      const response = await api.post('/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // PUT /api/property-batches/:id - Update batch (admin only)
  updateBatch: async (id, batchData) => {
    try {
      const formData = new FormData();
      
      Object.keys(batchData).forEach(key => {
        if (key === 'image' && batchData[key] instanceof File) {
          formData.append('image', batchData[key]);
        } else if (key === 'propertyUnits' && Array.isArray(batchData[key])) {
          formData.append('propertyUnits', JSON.stringify(batchData[key]));
        } else if (key === 'locationCoordinates' && batchData[key]) {
          formData.append('locationCoordinates', JSON.stringify(batchData[key]));
        } else if (key === 'tags' && Array.isArray(batchData[key])) {
          formData.append('tags', JSON.stringify(batchData[key]));
        } else if (key === 'image' && typeof batchData[key] === 'object' && batchData[key]?.url) {
          formData.append('image', JSON.stringify(batchData[key]));
        } else if (batchData[key] !== undefined && batchData[key] !== null) {
          formData.append(key, batchData[key]);
        }
      });

      const response = await api.put(`/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // DELETE /api/property-batches/:id - Delete batch (admin only)
  deleteBatch: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ============ PROPERTY UNIT MANAGEMENT ROUTES (Admin only) ============
  
  // POST /api/property-batches/:id/add-unit - Add property unit to batch (admin only)
  addPropertyUnit: async (batchId, propertyUnitId) => {
    try {
      const response = await api.post(`/${batchId}/add-unit`, { propertyUnitId });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // POST /api/property-batches/:id/remove-unit - Remove property unit from batch (admin only)
  removePropertyUnit: async (batchId, propertyUnitId) => {
    try {
      const response = await api.post(`/${batchId}/remove-unit`, { propertyUnitId });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ============ STATUS MANAGEMENT ROUTES (Admin only) ============
  
  // PATCH /api/property-batches/:id/toggle-active - Toggle batch status (admin only)
  toggleActiveStatus: async (batchId) => {
    try {
      const response = await api.patch(`/${batchId}/toggle-active`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ============ ADMIN SPECIAL ROUTES ============
  
  // GET /api/property-batches/admin/all - Get all batches including inactive (admin only)
  getAllBatchesAdmin: async () => {
    try {
      const response = await api.get('/admin/all');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // GET /api/property-batches/admin/user/:userId - Get batches by user (admin only)
  getBatchesByUser: async (userId) => {
    try {
      const response = await api.get(`/admin/user/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ============ HELPER METHODS ============
  
  // Validate batch data
  validateBatchData: (batchData) => {
    const errors = [];
    
    if (!batchData.batchName?.trim()) {
      errors.push('Batch name is required');
    }
    
    if (!batchData.locationName?.trim()) {
      errors.push('Location name is required');
    }
    
    if (!batchData.batchType?.trim()) {
      errors.push('Batch type is required');
    }
    
    // Check if image is provided (either File, URL string, or object with URL)
    const hasImage = batchData.image && (
      batchData.image instanceof File ||
      typeof batchData.image === 'string' ||
      (typeof batchData.image === 'object' && batchData.image.url)
    );
    
    if (!hasImage) {
      errors.push('Image is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Prepare batch data for submission
  prepareBatchData: (batchData) => {
    const preparedData = { ...batchData };
    
    // Convert propertyUnits to array if needed
    if (preparedData.propertyUnits && !Array.isArray(preparedData.propertyUnits)) {
      if (typeof preparedData.propertyUnits === 'string') {
        try {
          preparedData.propertyUnits = JSON.parse(preparedData.propertyUnits);
        } catch {
          preparedData.propertyUnits = [];
        }
      } else {
        preparedData.propertyUnits = [];
      }
    }
    
    // Convert tags to array if needed
    if (preparedData.tags && !Array.isArray(preparedData.tags)) {
      if (typeof preparedData.tags === 'string') {
        try {
          preparedData.tags = JSON.parse(preparedData.tags);
        } catch {
          preparedData.tags = [];
        }
      } else {
        preparedData.tags = [];
      }
    }
    
    // Convert locationCoordinates if needed
    if (preparedData.locationCoordinates && typeof preparedData.locationCoordinates === 'string') {
      try {
        preparedData.locationCoordinates = JSON.parse(preparedData.locationCoordinates);
      } catch {
        preparedData.locationCoordinates = {};
      }
    }
    
    // Convert isActive to boolean
    if (typeof preparedData.isActive === 'string') {
      preparedData.isActive = preparedData.isActive === 'true' || preparedData.isActive === '1';
    }
    
    // Convert displayOrder to number
    if (preparedData.displayOrder !== undefined) {
      preparedData.displayOrder = parseInt(preparedData.displayOrder) || 0;
    }
    
    return preparedData;
  },

  // Generate batch types for dropdown
  getBatchTypes: () => {
    return [
      { value: 'location_based', label: 'Location Based' },
      { value: 'project_group', label: 'Project Group' },
      { value: 'featured_listings', label: 'Featured Listings' },
      { value: 'similar_properties', label: 'Similar Properties' },
      { value: 'comparison_group', label: 'Comparison Group' }
    ];
  },

  // Get status badge class
  getStatusBadgeClass: (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  },

  // Get status text
  getStatusText: (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  }
};

// Error handler utility
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { 
          success: false, 
          message: data.message || 'Invalid data provided',
          errors: data.errors || [],
          status: 400 
        };
      case 401:
        return { 
          success: false, 
          message: 'Please login to continue',
          status: 401 
        };
      case 403:
        return { 
          success: false, 
          message: data.message || 'Admin access required for this action',
          status: 403 
        };
      case 404:
        return { 
          success: false, 
          message: data.message || 'Resource not found',
          status: 404 
        };
      case 422:
        return { 
          success: false, 
          message: 'Validation failed',
          errors: data.errors || [],
          status: 422 
        };
      case 500:
        return { 
          success: false, 
          message: 'Server error. Please try again later',
          status: 500 
        };
      default:
        return { 
          success: false, 
          message: data.message || 'An error occurred',
          status: status 
        };
    }
  } else if (error.request) {
    return { 
      success: false, 
      message: 'Unable to connect to server. Please check your internet connection',
      status: 0 
    };
  } else {
    return { 
      success: false, 
      message: error.message || 'An unexpected error occurred',
      status: -1 
    };
  }
};

// Check if user can perform admin actions
export const canPerformAdminAction = async () => {
  try {
    const isAdmin = await checkAdminAccess();
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      return {
        allowed: false,
        message: 'Please login to perform this action'
      };
    }
    
    if (!isAdmin) {
      return {
        allowed: false,
        message: 'Admin access required for this action'
      };
    }
    
    return {
      allowed: true,
      message: ''
    };
  } catch (error) {
    return {
      allowed: false,
      message: 'Error checking permissions'
    };
  }
};

// Export for convenience
export default batchService;