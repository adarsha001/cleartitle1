// src/hooks/useAdminUsers.js
import { useState, useCallback } from 'react';
import AdminAPI from '../api/admin';
import { useNavigate } from 'react-router-dom';

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    sourceWebsite: ''
  });
  const navigate = useNavigate();

  const fetchUsers = useCallback(async (page = 1, search = '', sourceWebsite = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const params = {
        page,
        limit: pagination.limit,
        search,
        sourceWebsite: sourceWebsite !== 'all' ? sourceWebsite : ''
      };

      const { data } = await AdminAPI.getAllUsers(params);
      
      if (data.success) {
        setUsers(data.users);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total,
          limit: pagination.limit
        });
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load users');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, pagination.limit]);

  const fetchUserDetails = useCallback(async (userId) => {
    setLoading(true);
    try {
      const { data } = await AdminAPI.getUserById(userId);
      if (data.success) {
        return data.user;
      }
      throw new Error(data.message || 'Failed to fetch user details');
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWebsiteStats = useCallback(async () => {
    try {
      const { data } = await AdminAPI.getWebsiteStats();
      if (data.success) {
        return data.stats;
      }
      return null;
    } catch (error) {
      console.error('Error fetching website stats:', error);
      return null;
    }
  }, []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, filters.search, filters.sourceWebsite);
    }
  }, [fetchUsers, pagination.totalPages, filters.search, filters.sourceWebsite]);

  const handleSearch = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    fetchUsers(1, searchTerm, filters.sourceWebsite);
  }, [fetchUsers, filters.sourceWebsite]);

  const handleWebsiteFilter = useCallback((website) => {
    setFilters(prev => ({ ...prev, sourceWebsite: website }));
    fetchUsers(1, filters.search, website);
  }, [fetchUsers, filters.search]);

  const clearFilters = useCallback(() => {
    setFilters({ search: '', sourceWebsite: '' });
    fetchUsers(1, '', '');
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    fetchUserDetails,
    fetchWebsiteStats,
    handlePageChange,
    handleSearch,
    handleWebsiteFilter,
    clearFilters
  };
};