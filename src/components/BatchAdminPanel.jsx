import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import batchService, { checkAdminAccess } from '../api/batchService';
import DeleteConfirmModal from './DeleteConfirmModal';
import StatusToggleModal from './StatusToggleModal';

const BatchAdminPanel = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [batchToToggle, setBatchToToggle] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [tempOrder, setTempOrder] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    batchType: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const checkAccess = async () => {
      const adminStatus = await checkAdminAccess();
      setIsAdmin(adminStatus);
      setAuthChecked(true);
      if (!adminStatus) navigate('/');
    };
    checkAccess();
  }, [navigate]);

  const getDisplayOrderValue = (batch) => {
    // Check for currentDisplayOrder virtual property
    if (batch.currentDisplayOrder !== undefined) return batch.currentDisplayOrder;
    // Check for displayOrders object
    if (batch.displayOrders) {
      const orderField = `${batch.batchType}_order`;
      if (batch.displayOrders[orderField] !== undefined) return batch.displayOrders[orderField];
    }
    // Fallback to displayOrder
    return batch.displayOrder || 0;
  };

  const fetchBatches = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await batchService.getAllBatchesAdmin();
      
      if (response.success) {
        let batchData = response.data || [];
        
        // Apply filters
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          batchData = batchData.filter(batch => 
            (batch.batchName?.toLowerCase().includes(searchTerm) ||
            batch.locationName?.toLowerCase().includes(searchTerm) ||
            batch.batchCode?.toLowerCase().includes(searchTerm))
          );
        }
        
        if (filters.batchType !== 'all') {
          batchData = batchData.filter(batch => batch.batchType === filters.batchType);
        }
        
        if (filters.status !== 'all') {
          const isActive = filters.status === 'active';
          batchData = batchData.filter(batch => batch.isActive === isActive);
        }
        
        // Group by type and sort by display order
        const groupedByType = {};
        batchData.forEach(batch => {
          if (!groupedByType[batch.batchType]) groupedByType[batch.batchType] = [];
          groupedByType[batch.batchType].push(batch);
        });
        
        Object.keys(groupedByType).forEach(type => {
          groupedByType[type].sort((a, b) => {
            const orderA = getDisplayOrderValue(a);
            const orderB = getDisplayOrderValue(b);
            return orderA - orderB;
          });
        });
        
        batchData = Object.values(groupedByType).flat();
        setBatches(batchData);
      } else {
        setError(response.message || 'Failed to fetch batches');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  }, [filters, isAdmin]);

  useEffect(() => {
    if (isAdmin && authChecked) fetchBatches();
  }, [fetchBatches, isAdmin, authChecked]);

  const getBatchesOfSameType = (batchId) => {
    const targetBatch = batches.find(b => b._id === batchId);
    if (!targetBatch) return [];
    
    return batches
      .filter(b => b.batchType === targetBatch.batchType)
      .sort((a, b) => {
        const orderA = getDisplayOrderValue(a);
        const orderB = getDisplayOrderValue(b);
        return orderA - orderB;
      });
  };

  const handleReorderBatch = async (batchId, newPositionNumber) => {
    try {
      const targetBatch = batches.find(b => b._id === batchId);
      if (!targetBatch) return;

      const sameTypeBatches = getBatchesOfSameType(batchId);
      const newOrder = newPositionNumber - 1;
      
      if (newOrder < 0 || newOrder >= sameTypeBatches.length) {
        setError(`Position must be between 1 and ${sameTypeBatches.length}`);
        setEditingOrder(null);
        return;
      }

      const currentIndex = sameTypeBatches.findIndex(b => b._id === batchId);
      const currentOrder = getDisplayOrderValue(targetBatch);
      
      if (newOrder === currentOrder) {
        setEditingOrder(null);
        return;
      }

      // Create new order array
      const reorderedBatches = [...sameTypeBatches];
      const [movedBatch] = reorderedBatches.splice(currentIndex, 1);
      reorderedBatches.splice(newOrder, 0, movedBatch);

      // Update all batches in this type
      for (let index = 0; index < reorderedBatches.length; index++) {
        const batch = reorderedBatches[index];
        const currentBatchOrder = getDisplayOrderValue(batch);
        if (currentBatchOrder !== index) {
          await batchService.setBatchDisplayOrder(batch._id, index);
        }
      }
      
      setSuccess(`Batch "${targetBatch.batchName}" moved to position ${newPositionNumber}`);
      await fetchBatches();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Reorder error:', error);
      setError('Failed to update batch order: ' + (error.message || 'Unknown error'));
    } finally {
      setEditingOrder(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      batchType: 'all',
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    try {
      await batchService.deleteBatch(batchToDelete._id);
      setSuccess('Batch deleted successfully');
      fetchBatches();
      setBatchToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete batch');
    }
  };

  const confirmToggleStatus = async () => {
    try {
      await batchService.toggleActiveStatus(batchToToggle._id);
      setSuccess(`Batch ${!batchToToggle.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchBatches();
      setBatchToToggle(null);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const totalPages = Math.ceil(batches.length / itemsPerPage);
  const paginatedBatches = batches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getBatchTypeBadge = (type) => {
    const styles = {
      location_based: 'bg-blue-100 text-blue-800',
      project_group: 'bg-purple-100 text-purple-800',
      featured_listings: 'bg-yellow-100 text-yellow-800',
      similar_properties: 'bg-green-100 text-green-800',
      comparison_group: 'bg-pink-100 text-pink-800'
    };
    const labels = {
      location_based: 'Location Based',
      project_group: 'Project Group',
      featured_listings: 'Featured Listings',
      similar_properties: 'Similar Properties',
      comparison_group: 'Comparison Group'
    };
    return { style: styles[type] || 'bg-gray-100 text-gray-800', label: labels[type] || type };
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Batches</h1>
              <p className="mt-2 text-gray-600">Manage and reorder property batches within each batch type</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/batch/post/property-units"
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700"
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
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Type</label>
              <select
                value={filters.batchType}
                onChange={(e) => handleFilterChange('batchType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="location_based">Location Based</option>
                <option value="project_group">Project Group</option>
                <option value="featured_listings">Featured Listings</option>
                <option value="similar_properties">Similar Properties</option>
                <option value="comparison_group">Comparison Group</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="displayOrder">Display Order</option>
                <option value="batchName">Batch Name</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{batches.length}</div>
            <div className="text-sm text-gray-600">Total Batches</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{batches.filter(b => b.isActive).length}</div>
            <div className="text-sm text-gray-600">Active Batches</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{batches.reduce((sum, b) => sum + (b.stats?.totalProperties || 0), 0)}</div>
            <div className="text-sm text-gray-600">Total Properties</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{batches.reduce((sum, b) => sum + (b.stats?.totalViews || 0), 0)}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : paginatedBatches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No batches found</h3>
            <p className="mt-1 text-gray-500">Create your first batch to get started.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBatches.map((batch) => {
                    const { style: typeStyle, label: typeLabel } = getBatchTypeBadge(batch.batchType);
                    const sameTypeBatches = getBatchesOfSameType(batch._id);
                    const currentOrderIndex = sameTypeBatches.findIndex(b => b._id === batch._id);
                    const currentOrder = currentOrderIndex + 1;
                    const maxOrder = sameTypeBatches.length;
                    const isEditing = editingOrder === batch._id;
                    
                    return (
                      <tr key={batch._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const newOrder = parseInt(tempOrder);
                              if (!isNaN(newOrder) && newOrder >= 1 && newOrder <= maxOrder) {
                                handleReorderBatch(batch._id, newOrder);
                              } else {
                                setError(`Position must be between 1 and ${maxOrder}`);
                                setEditingOrder(null);
                              }
                            }} className="flex items-center space-x-2">
                              <input type="number" value={tempOrder} onChange={(e) => setTempOrder(e.target.value)} min="1" max={maxOrder} className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                              <span className="text-xs text-gray-500">/ {maxOrder}</span>
                              <button type="submit" className="text-green-600 hover:text-green-800" title="Save">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                              </button>
                              <button type="button" onClick={() => setEditingOrder(null)} className="text-red-600 hover:text-red-800" title="Cancel">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900 min-w-[30px]">{currentOrder}</span>
                              <button onClick={() => { setEditingOrder(batch._id); setTempOrder(String(currentOrder)); }} className="text-gray-400 hover:text-blue-600 transition-colors" title="Change order">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded object-cover" src={batch.image?.url || batch.thumbnail || 'https://via.placeholder.com/40x40?text=No+Image'} alt={batch.batchName} onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=No+Image'; }} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{batch.batchName}</div>
                              <div className="text-sm text-gray-500">{batch.locationName}</div>
                              <div className="text-xs text-gray-400">Code: {batch.batchCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${typeStyle}`}>{typeLabel}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">📦 {batch.stats?.totalProperties || 0} properties</div>
                          <div className="text-sm text-gray-500">👁️ {batch.stats?.totalViews || 0} views</div>
                          <div className="text-sm text-gray-500">👤 {batch.stats?.uniqueViewers || 0} viewers</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${batch.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {batch.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => setBatchToToggle(batch)} className="text-yellow-600 hover:text-yellow-900" title={batch.isActive ? 'Deactivate' : 'Activate'}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                            </button>
                            <button onClick={() => navigate(`/admin/batches/edit/${batch._id}`)} className="text-blue-600 hover:text-blue-900" title="Edit">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => navigate(`/admin/batches/${batch._id}`)} className="text-green-600 hover:text-green-900" title="View">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button onClick={() => setBatchToDelete(batch)} className="text-red-600 hover:text-red-900" title="Delete">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <span className="px-4 py-2 text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50">Next</button>
            </nav>
          </div>
        )}
      </div>

      <DeleteConfirmModal isOpen={!!batchToDelete} batch={batchToDelete} onClose={() => setBatchToDelete(null)} onConfirm={handleDelete} />
      <StatusToggleModal isOpen={!!batchToToggle} batch={batchToToggle} onClose={() => setBatchToToggle(null)} onConfirm={confirmToggleStatus} />
    </div>
  );
};

export default BatchAdminPanel;