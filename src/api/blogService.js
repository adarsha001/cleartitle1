// services/blogService.js
const API_BASE_URL =  'http://localhost:5000/api';

export const blogAPI = {
  // Get all blogs
  getAllBlogs: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/blogs${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }
    
    return response.json();
  },

  // Get single blog by ID or slug
  getSingleBlog: async (id) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch blog');
    }
    
    return response.json();
  },
    getRelatedBlogs: async (id, limit = 3) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}/related?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch related blogs');
    return response.json();
  }
};