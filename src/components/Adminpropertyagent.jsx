// components/Adminpropertyagent.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  getPropertiesWithAgents, 
  deletePropertyByAdmin,
  toggleFeatured,
  approveProperty,
  rejectProperty,
  getPropertyStats,
  createPropertyByAdmin,
  updatePropertyByAdmin,
  getPropertyById,
  assignAgentToProperty,
  getAgentsList
} from '../api/adminApi';
import AdminPropertyCard from './AdminPropertyCard';
import PropertyForm from './PropertyForm';
import LoadingSpinner from './LoadingSpinner';
import AgentAssignmentModal from './AgentAssignmentModal';

const Adminpropertyagent = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    approvalStatus: '',
    hasAgent: '',
    search: '',
    city: '',
    forSale: '',
    isFeatured: '',
    isVerified: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch all properties on mount
  useEffect(() => {
    fetchAllProperties();
    fetchStats();
  }, []);

  // Filter and sort properties when filters or sort change
  useEffect(() => {
    applyFiltersAndSort();
  }, [allProperties, filters, sortBy, sortOrder]);

  // Update pagination when filtered properties change
  useEffect(() => {
    updatePagination();
  }, [filteredProperties]);

  const fetchAllProperties = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching all properties...');
      
      // Fetch all properties without pagination from backend
      const response = await getPropertiesWithAgents({ limit: 1000 }); // Fetch large number
      console.log("📨 Response data received:", response.data);
      
      const properties = response.data.data || [];
      console.log('✅ Total properties fetched:', properties.length);
      
      setAllProperties(properties);
      setError(null);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message || 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    if (allProperties.length === 0) {
      setFilteredProperties([]);
      return;
    }

    console.log('🔍 Applying filters:', filters);
    
    // Start with all properties
    let result = [...allProperties];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(property => {
        return (
          (property.title && property.title.toLowerCase().includes(searchTerm)) ||
          (property.description && property.description.toLowerCase().includes(searchTerm)) ||
          (property.content && property.content.toLowerCase().includes(searchTerm)) ||
          (property.city && property.city.toLowerCase().includes(searchTerm)) ||
          (property.propertyLocation && property.propertyLocation.toLowerCase().includes(searchTerm))
        );
      });
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(property => 
        property.category === filters.category
      );
    }

    // Apply approval status filter
    if (filters.approvalStatus) {
      result = result.filter(property => 
        property.approvalStatus === filters.approvalStatus
      );
    }

    // Apply city filter
    if (filters.city) {
      const cityTerm = filters.city.toLowerCase();
      result = result.filter(property => 
        property.city && property.city.toLowerCase().includes(cityTerm)
      );
    }

    // Apply agent filter
    if (filters.hasAgent) {
      const hasAgentBool = filters.hasAgent === 'true';
      result = result.filter(property => {
        if (hasAgentBool) {
          return property.agentDetails && property.agentDetails.name;
        } else {
          return !property.agentDetails || !property.agentDetails.name;
        }
      });
    }

    // Apply forSale filter
    if (filters.forSale) {
      const forSaleBool = filters.forSale === 'true';
      result = result.filter(property => 
        property.forSale === forSaleBool
      );
    }

    // Apply isFeatured filter
    if (filters.isFeatured) {
      const isFeaturedBool = filters.isFeatured === 'true';
      result = result.filter(property => 
        property.isFeatured === isFeaturedBool
      );
    }

    // Apply isVerified filter
    if (filters.isVerified) {
      const isVerifiedBool = filters.isVerified === 'true';
      result = result.filter(property => 
        property.isVerified === isVerifiedBool
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'price':
          aValue = parseFloat(a.price) || 0;
          bValue = parseFloat(b.price) || 0;
          break;
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'displayOrder':
          aValue = a.displayOrder || 0;
          bValue = b.displayOrder || 0;
          break;
        case 'agentName':
          aValue = (a.agentDetails?.name || '').toLowerCase();
          bValue = (b.agentDetails?.name || '').toLowerCase();
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    console.log('✅ Filtered properties:', result.length);
    setFilteredProperties(result);
  };

  const updatePagination = () => {
    const total = filteredProperties.length;
    const totalPages = Math.ceil(total / pagination.limit);
    
    setPagination(prev => ({
      ...prev,
      total: total,
      totalPages: totalPages,
      // Reset to page 1 if current page exceeds total pages
      page: prev.page > totalPages ? 1 : prev.page
    }));
  };

  // Get current page properties
  const currentPageProperties = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredProperties.slice(startIndex, endIndex);
  }, [filteredProperties, pagination.page, pagination.limit]);

  const fetchStats = async () => {
    try {
      const response = await getPropertyStats();
      setStats(response.data.data);
      console.log("📊 Stats response:", response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;
    
    try {
      await deletePropertyByAdmin(propertyId);
      // Update local state
      setAllProperties(prev => prev.filter(p => p._id !== propertyId));
      fetchStats(); // Refresh stats
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to delete property');
    }
  };

  const handleToggleFeatured = async (propertyId) => {
    try {
      await toggleFeatured(propertyId);
      // Update local state
      setAllProperties(prev => prev.map(p => 
        p._id === propertyId ? { ...p, isFeatured: !p.isFeatured } : p
      ));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update featured status');
    }
  };

  const handleStatusChange = async (propertyId, status, reason = '') => {
    try {
      if (status === 'approved') {
        await approveProperty(propertyId);
      } else {
        await rejectProperty(propertyId, reason || 'Rejected by admin');
      }
      // Update local state
      setAllProperties(prev => prev.map(p => 
        p._id === propertyId ? { ...p, approvalStatus: status } : p
      ));
      fetchStats(); // Refresh stats
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update property status');
    }
  };

  const handleEditProperty = async (propertyId) => {
    try {
      setLoading(true);
      const response = await getPropertyById(propertyId);
      setEditingProperty(response.data.data);
      setShowPropertyForm(true);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load property for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = (property) => {
    setSelectedProperty(property);
    setShowAgentModal(true);
  };

  const handleAgentAssignment = async (agentData) => {
    try {
      await assignAgentToProperty(selectedProperty._id, agentData);
      // Refresh the properties to get updated agent info
      fetchAllProperties();
      setShowAgentModal(false);
      setSelectedProperty(null);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to assign agent');
    }
  };

 // In Adminpropertyagent.jsx, update the handlePropertyFormSubmit function:
const handlePropertyFormSubmit = async (formData, isEdit = false) => {
  try {
    console.log('🔄 Processing property form submission, isEdit:', isEdit);
    
    if (isEdit && editingProperty) {
      console.log(`📝 Updating property: ${editingProperty._id}`);
      await updatePropertyByAdmin(editingProperty._id, formData);
    } else {
      console.log('🆕 Creating new property');
      await createPropertyByAdmin(formData);
    }
    
    setShowPropertyForm(false);
    setEditingProperty(null);
    // Refresh properties after creating/updating
    fetchAllProperties();
    fetchStats();
    setError(null);
  } catch (err) {
    console.error('❌ Error in handlePropertyFormSubmit:', err);
    setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} property`);
  }
};
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 when filter changes
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      approvalStatus: '',
      hasAgent: '',
      search: '',
      city: '',
      forSale: '',
      isFeatured: '',
      isVerified: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Update stats display to use filtered properties for real-time counts
  const filteredStats = useMemo(() => {
    if (!filteredProperties.length) return null;
    
    return {
      filteredCount: filteredProperties.length,
      approvedCount: filteredProperties.filter(p => p.approvalStatus === 'approved').length,
      pendingCount: filteredProperties.filter(p => p.approvalStatus === 'pending').length,
      withAgentsCount: filteredProperties.filter(p => p.agentDetails && p.agentDetails.name).length
    };
  }, [filteredProperties]);

  if (loading && allProperties.length === 0) {
    return <LoadingSpinner message="Loading properties..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Property & Agent Management
              </h1>
              <p className="mt-2 text-sm lg:text-base text-gray-600">
                Manage all properties, agent assignments, and approvals
              </p>
            </div>
            <button
              onClick={() => setShowPropertyForm(true)}
              className="mt-4 lg:mt-0 bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm lg:text-base">Add New Property</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 lg:p-3 rounded-lg">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm lg:text-base font-medium text-gray-600">
                  {Object.keys(filters).some(key => filters[key]) ? 'Filtered' : 'Total'} Properties
                </p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {filteredStats ? filteredStats.filteredCount : stats?.overall?.totalProperties || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 lg:p-3 rounded-lg">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm lg:text-base font-medium text-gray-600">Approved</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {filteredStats ? filteredStats.approvedCount : stats?.overall?.totalApproved || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 lg:p-3 rounded-lg">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm lg:text-base font-medium text-gray-600">Pending</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {filteredStats ? filteredStats.pendingCount : stats?.overall?.totalPending || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 lg:p-3 rounded-lg">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm lg:text-base font-medium text-gray-600">With Agents</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">
                  {filteredStats ? filteredStats.withAgentsCount : stats?.overall?.totalWithAgents || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search in title, description, city..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Commercial">Commercial</option>
                <option value="Outright">Outright</option>
                <option value="Farmland">Farmland</option>
                <option value="JD/JV">JD/JV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.approvalStatus}
                onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agent</label>
              <select
                value={filters.hasAgent}
                onChange={(e) => handleFilterChange('hasAgent', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Properties</option>
                <option value="true">With Agents</option>
                <option value="false">Without Agents</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Filter by city..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">For Sale</label>
              <select
                value={filters.forSale}
                onChange={(e) => handleFilterChange('forSale', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">For Sale</option>
                <option value="false">Not For Sale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
              <select
                value={filters.isFeatured}
                onChange={(e) => handleFilterChange('isFeatured', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verified</label>
              <select
                value={filters.isVerified}
                onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Showing {Math.min(pagination.limit, currentPageProperties.length)} of {filteredProperties.length} filtered properties
              </span>
              <button
                onClick={clearFilters}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
                <option value="displayOrder">Display Order</option>
                <option value="agentName">Agent Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {loading && currentPageProperties.length === 0 ? (
          <LoadingSpinner message="Loading properties..." />
        ) : currentPageProperties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {allProperties.length === 0 ? 'No properties found' : 'No properties match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {allProperties.length === 0 
                ? 'Try adding a new property.' 
                : 'Try adjusting your filters or clear all filters.'}
            </p>
            {allProperties.length === 0 ? (
              <button
                onClick={() => setShowPropertyForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Property
              </button>
            ) : (
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {currentPageProperties.map(property => (
              <AdminPropertyCard
                key={property._id}
                property={property}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
                onToggleFeatured={handleToggleFeatured}
                onStatusChange={handleStatusChange}
                onAssignAgent={handleAssignAgent}
                showApproveReject={true}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <select
                  value={pagination.page}
                  onChange={(e) => setPagination(prev => ({ ...prev, page: parseInt(e.target.value) }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      {showPropertyForm && (
        <PropertyForm
          property={editingProperty}
          onSubmit={handlePropertyFormSubmit}
          onClose={() => {
            setShowPropertyForm(false);
            setEditingProperty(null);
          }}
        />
      )}

      {/* Agent Assignment Modal */}
      {showAgentModal && (
        <AgentAssignmentModal
          property={selectedProperty}
          onSubmit={handleAgentAssignment}
          onClose={() => {
            setShowAgentModal(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </div>
  );
};

export default Adminpropertyagent;