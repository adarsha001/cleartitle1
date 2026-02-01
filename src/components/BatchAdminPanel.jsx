// src/components/admin/batches/BatchAdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { batchService, checkAdminAccess } from '../api/batchService';
import BatchCard from './BatchCard';
import BatchStats from './BatchStats';
import FilterPanel from './FilterPanel';
import DeleteConfirmModal from './DeleteConfirmModal';
import StatusToggleModal from './StatusToggleModal';

const BatchAdminPanel = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    batchType: 'all',
    status: 'all',
    location: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Modal states
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [batchToToggle, setBatchToToggle] = useState(null);

  // Check admin access on mount
  useEffect(() => {
    const checkAccess = async () => {
      const adminStatus = await checkAdminAccess();
      setIsAdmin(adminStatus);
      if (!adminStatus) {
        navigate('/login');
      }
    };
    checkAccess();
  }, [navigate]);

  // Fetch batches
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      };

      // Remove 'all' filters
      if (filters.batchType === 'all') delete params.batchType;
      if (filters.status === 'all') delete params.status;
      if (filters.status === 'active') params.isActive = true;
      if (filters.status === 'inactive') params.isActive = false;

      const response = await batchService.getAllBatches(params);
      
      if (response.success) {
        setBatches(response.data);
        setTotalItems(response.pagination?.total || 0);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch batches');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchBatches();
    }
  }, [currentPage, filters, isAdmin]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle batch delete
  const handleDelete = async () => {
    try {
      await batchService.deleteBatch(batchToDelete._id);
      setSuccess('Batch deleted successfully');
      fetchBatches();
      setBatchToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete batch');
    }
  };

  // Handle status toggle
  const handleToggleStatus = async () => {
    try {
      await batchService.toggleActiveStatus(batchToToggle._id);
      setSuccess(`Batch ${!batchToToggle.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchBatches();
      setBatchToToggle(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Clear notifications
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Batches</h1>
              <p className="mt-2 text-gray-600">Manage and organize property units into batches</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/admin/batches/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Batch
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <BatchStats batches={batches} />

        {/* Notifications */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />

        {/* Batches Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No batches found</h3>
            <p className="mt-1 text-gray-500">Create your first batch to get started.</p>
            <div className="mt-6">
              <Link
                to="/admin/batches/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700"
              >
                Create Batch
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {batches.map((batch) => (
                <BatchCard
                  key={batch._id}
                  batch={batch}
                  onEdit={() => navigate(`/admin/batches/edit/${batch._id}`)}
                  onView={() => navigate(`/admin/batches/${batch._id}`)}
                  onDelete={() => setBatchToDelete(batch)}
                  onToggleStatus={() => setBatchToToggle(batch)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <DeleteConfirmModal
        isOpen={!!batchToDelete}
        batch={batchToDelete}
        onClose={() => setBatchToDelete(null)}
        onConfirm={handleDelete}
      />

      <StatusToggleModal
        isOpen={!!batchToToggle}
        batch={batchToToggle}
        onClose={() => setBatchToToggle(null)}
        onConfirm={handleToggleStatus}
      />
    </div>
  );
};

export default BatchAdminPanel;