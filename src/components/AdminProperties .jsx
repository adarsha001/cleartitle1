import React, { useState, useEffect } from 'react';
import { 
  fetchAllProperties, 
  createPropertyByAdmin, 
  updatePropertyByAdmin,
  deletePropertyByAdmin,
  toggleFeatured,
  bulkUpdateProperties,
  fetchPropertyStats
} from '../api/adminApi';
import PropertyForm from './PropertyForm';
import PropertyCard from './PropertyCard';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    approvalStatus: '',
    hasAgent: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const { data } = await fetchAllProperties(params);
      setProperties(data.data || data.properties || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.totalProperties || data.total || 0,
        totalPages: data.pagination?.totalPages || Math.ceil((data.pagination?.totalProperties || data.total || 0) / pagination.limit)
      }));
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await fetchPropertyStats();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    loadProperties();
    loadStats();
  }, [pagination.page, pagination.limit, filters]);

  const handleCreateProperty = async (propertyData) => {
    try {
      await createPropertyByAdmin(propertyData);
      setShowForm(false);
      loadProperties();
      loadStats();
    } catch (err) {
      setError(err.message || 'Failed to create property');
    }
  };

  const handleUpdateProperty = async (propertyData) => {
    try {
      await updatePropertyByAdmin(editingProperty._id, propertyData);
      setEditingProperty(null);
      loadProperties();
      loadStats();
    } catch (err) {
      setError(err.message || 'Failed to update property');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await deletePropertyByAdmin(propertyId);
      loadProperties();
      loadStats();
    } catch (err) {
      setError(err.message || 'Failed to delete property');
    }
  };

  const handleToggleFeatured = async (propertyId) => {
    try {
      await toggleFeatured(propertyId);
      loadProperties();
    } catch (err) {
      setError(err.message || 'Failed to toggle featured status');
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    try {
      switch (action) {
        case 'delete':
          if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} properties?`)) return;
          await bulkUpdateProperties({
            ids: selectedIds,
            updateData: { isActive: false } // Soft delete
          });
          break;
        case 'approve':
          await bulkUpdateProperties({
            ids: selectedIds,
            updateData: { approvalStatus: 'approved' }
          });
          break;
        case 'feature':
          await bulkUpdateProperties({
            ids: selectedIds,
            updateData: { isFeatured: true }
          });
          break;
        default:
          break;
      }
      loadProperties();
      loadStats();
    } catch (err) {
      setError(err.message || `Failed to perform ${action} action`);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      city: '',
      approvalStatus: '',
      hasAgent: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && properties.length === 0) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header and Stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Property Management</h2>
            <p className="text-gray-600">Manage all properties and agent details</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Property</span>
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-blue-600">{stats.overall?.totalProperties || 0}</div>
              <div className="text-gray-600 text-sm">Total Properties</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-green-600">{stats.overall?.totalApproved || 0}</div>
              <div className="text-gray-600 text-sm">Approved</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-orange-600">{stats.overall?.totalFeatured || 0}</div>
              <div className="text-gray-600 text-sm">Featured</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-purple-600">{stats.overall?.totalWithAgents || 0}</div>
              <div className="text-gray-600 text-sm">With Agents</div>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Outright">Outright</option>
            <option value="Commercial">Commercial</option>
            <option value="Farmland">Farmland</option>
            <option value="JD/JV">JD/JV</option>
          </select>

          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filters.approvalStatus}
            onChange={(e) => setFilters(prev => ({ ...prev, approvalStatus: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.hasAgent}
            onChange={(e) => setFilters(prev => ({ ...prev, hasAgent: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Properties</option>
            <option value="true">With Agents</option>
            <option value="false">Without Agents</option>
          </select>

          <button
            onClick={clearFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid gap-6">
        {properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or add a new property.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Property
            </button>
          </div>
        ) : (
          properties.map(property => (
            <PropertyCard
              key={property._id}
              property={property}
              onEdit={() => setEditingProperty(property)}
              onDelete={() => handleDeleteProperty(property._id)}
              onToggleFeatured={() => handleToggleFeatured(property._id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Property Form Modal */}
      {(showForm || editingProperty) && (
        <PropertyForm
          property={editingProperty}
          onSubmit={editingProperty ? handleUpdateProperty : handleCreateProperty}
          onClose={() => {
            setShowForm(false);
            setEditingProperty(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminProperties;