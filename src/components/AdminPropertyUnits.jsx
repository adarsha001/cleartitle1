// components/AdminPropertyUnits.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import { propertyUnitAPI } from '../api/adminpropertyUnitAPI';
import PropertyUnitEdit from './PropertyUnitEdit';
import PropertyUnitView from './PropertyUnitView';
import BulkEditPanel from './BulkEditPanel';

// Drag and Drop Types
const ItemTypes = {
  PROPERTY: 'property',
};

// Draggable Property Row Component
const DraggablePropertyRow = ({ 
  property, 
  index, 
  moveProperty, 
  handleToggleFeatured,
  handleToggleVerified,
  handleViewProperty,
  handleEditProperty,
  handleDelete,
  handleIndividualAction,
  formatPrice,
  formatDate,
  isReordering,
  isSelected,
  onSelectProperty
}) => {
  const ref = React.useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PROPERTY,
    item: { index, id: property._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.PROPERTY,
    hover: (draggedItem) => {
      if (!ref.current || !isReordering) return;
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveProperty(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const opacity = isDragging ? 0.4 : 1;

  const getStatusBadge = (status) => {
    const statusColors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      available: 'bg-blue-100 text-blue-800',
      sold: 'bg-red-100 text-red-800',
      rented: 'bg-purple-100 text-purple-800',
      'under-agreement': 'bg-orange-100 text-orange-800',
      hold: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get price range from unitTypes
  const getPriceRange = () => {
    if (property.unitTypes && property.unitTypes.length > 0) {
      const prices = property.unitTypes.map(unit => unit.price?.amount || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return formatPrice({ amount: minPrice });
      }
      return `${formatPrice({ amount: minPrice })} - ${formatPrice({ amount: maxPrice })}`;
    }
    return formatPrice(property.price);
  };

  // Get unit types summary
  const getUnitTypesSummary = () => {
    if (property.unitTypes && property.unitTypes.length > 0) {
      const types = property.unitTypes.map(unit => unit.type).join(', ');
      return types.length > 30 ? types.substring(0, 30) + '...' : types;
    }
    return property.propertyType || 'N/A';
  };

  // Get area info
  const getAreaInfo = () => {
    if (property.unitTypes && property.unitTypes.length > 0) {
      const firstUnit = property.unitTypes[0];
      if (firstUnit.carpetArea) return `${firstUnit.carpetArea} sq.ft`;
      if (firstUnit.builtUpArea) return `${firstUnit.builtUpArea} sq.ft`;
      if (firstUnit.plotDetails?.area?.sqft) return `${firstUnit.plotDetails.area.sqft} sq.ft`;
    }
    return property.specifications?.carpetArea ? `${property.specifications.carpetArea} sq.ft` : 'N/A';
  };

  return (
    <tr 
      ref={ref}
      style={{ opacity, cursor: isReordering ? 'move' : 'default' }}
      className={`hover:bg-gray-50 transition-all duration-200 ${isSelected ? 'bg-blue-50' : ''}`}
      data-id={property._id}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        {isReordering ? (
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        ) : (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelectProperty(property._id, e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-500">{index + 1}</span>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          {property.images?.[0]?.url ? (
            <img
              src={property.images[0].url}
              alt={property.title}
              className="w-16 h-16 rounded-lg object-cover mr-4"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
              }}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
              <span className="text-gray-400">🏠</span>
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{property.title || 'No Title'}</div>
            <div className="text-sm text-gray-500">{property.city || 'No City'}</div>
            <div className="text-xs text-gray-400 mt-1">
              {formatDate(property.createdAt)}
            </div>
            {property.slug && (
              <div className="text-xs text-gray-500">Slug: {property.slug}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
              {property.propertyType || 'Unknown'}
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {property.listingType || 'Unknown'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div>Units: {getUnitTypesSummary()}</div>
            <div>Area: {getAreaInfo()}</div>
          </div>
          {property.commonSpecifications?.furnishing && (
            <div className="text-xs text-gray-500">
              Furnishing: {property.commonSpecifications.furnishing}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">
          {getPriceRange()}
        </div>
        {property.unitTypes && property.unitTypes.length > 1 && (
          <div className="text-xs text-gray-500">
            From {property.unitTypes.length} types
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          <div>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(property.approvalStatus)}`}>
              {property.approvalStatus || 'pending'}
            </span>
          </div>
          <div>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(property.availability)}`}>
              {property.availability || 'available'}
            </span>
          </div>
          {property.legalDetails?.reraRegistered && (
            <div className="text-xs text-green-600">RERA Registered</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold">{property.displayOrder || index + 1}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-1">
            <button
              onClick={() => handleToggleFeatured(property._id)}
              className={`px-2 py-1 text-xs rounded-full ${
                property.isFeatured
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              disabled={isReordering}
            >
              {property.isFeatured ? '⭐ Featured' : '☆ Not Featured'}
            </button>
            <button
              onClick={() => handleToggleVerified(property._id)}
              className={`px-2 py-1 text-xs rounded-full ${
                property.isVerified
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              disabled={isReordering}
            >
              {property.isVerified ? '✓ Verified' : '○ Not Verified'}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewProperty(property._id)}
              className="text-blue-600 hover:text-blue-900 text-sm disabled:opacity-50"
              disabled={isReordering}
            >
              View
            </button>
            <button
              onClick={() => handleEditProperty(property._id)}
              className="text-green-600 hover:text-green-900 text-sm disabled:opacity-50"
              disabled={isReordering}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(property._id)}
              className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
              disabled={isReordering}
            >
              Delete
            </button>
          </div>
          <div className="flex space-x-1">
            {property.approvalStatus !== 'approved' && (
              <button
                onClick={() => handleIndividualAction(property._id, 'approved')}
                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50"
                disabled={isReordering}
              >
                Approve
              </button>
            )}
            {property.approvalStatus !== 'rejected' && (
              <button
                onClick={() => handleIndividualAction(property._id, 'rejected')}
                className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 disabled:opacity-50"
                disabled={isReordering}
              >
                Reject
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Views: {property.viewCount || 0} | Inquiries: {property.inquiryCount || 0}
          </div>
        </div>
      </td>
    </tr>
  );
};

// Main Admin Property Units Component
const AdminPropertyUnits = () => {
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    approvalStatus: '',
    propertyType: '',
    listingType: '',
    city: '',
    availability: '',
    isFeatured: '',
    isVerified: '',
    unitType: '',
    furnishing: '',
    possessionStatus: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'displayOrder',
    sortOrder: 'asc',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    featured: 0,
    verified: 0,
    reraRegistered: 0,
    propertyTypeStats: [],
    cityStats: [],
    unitTypeStats: [],
    furnishingStats: [],
    possessionStats: [],
    listingTypeStats: [],
    totalStats: {
      totalViews: 0,
      totalInquiries: 0,
      totalFavorites: 0,
      totalLikes: 0
    }
  });

  // CRUD operation states
  const [viewingProperty, setViewingProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [creatingProperty, setCreatingProperty] = useState(false);

  // Reordering states
  const [isReordering, setIsReordering] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Bulk operations
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    propertyTypes: [],
    unitTypes: [],
    furnishingOptions: ['unfurnished', 'semi-furnished', 'fully-furnished'],
    possessionStatuses: ['ready-to-move', 'under-construction', 'resale'],
    listingTypes: ['sale', 'rent', 'lease', 'pg']
  });

  // Debounced filter change
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [isFilterDirty, setIsFilterDirty] = useState(false);

  // Fetch property units (admin endpoint)
  const fetchPropertyUnits = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      
      // Clean up filters - remove empty strings
      const cleanedFilters = {};
      Object.keys(debouncedFilters).forEach(key => {
        if (debouncedFilters[key] !== '' && debouncedFilters[key] !== null && debouncedFilters[key] !== undefined) {
          cleanedFilters[key] = debouncedFilters[key];
        }
      });
      
      // For search, ensure it's properly formatted
      if (cleanedFilters.search) {
        cleanedFilters.search = cleanedFilters.search.trim();
      }
      
      // Ensure page is a number
      cleanedFilters.page = parseInt(cleanedFilters.page) || 1;
      cleanedFilters.limit = parseInt(cleanedFilters.limit) || 50;
      
      const response = await propertyUnitAPI.getAllPropertyUnits({
        ...cleanedFilters,
        ...params
      });
      
      if (response.success) {
        setPropertyUnits(response.data || []);
        setPagination({
          total: response.total || 0,
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || 1
        });
        
        // Update filter options if available
        if (response.filters) {
          setFilterOptions(prev => ({
            ...prev,
            cities: response.filters.cities || [],
            propertyTypes: response.filters.propertyTypes || [],
            unitTypes: response.filters.unitTypes || [],
            furnishingOptions: response.filters.furnishingOptions || prev.furnishingOptions,
            possessionStatuses: response.filters.possessionStatuses || prev.possessionStatuses
          }));
        }
      } else {
        toast.error(response.message || 'Failed to load properties');
      }
    } catch (error) {
      console.error('Error fetching property units:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to load property units');
    } finally {
      setLoading(false);
      setIsFilterDirty(false);
    }
  }, [debouncedFilters]);

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setIsFilterDirty(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters]);

  // Fetch stats (admin endpoint)
  const fetchStats = useCallback(async () => {
    try {
      const response = await propertyUnitAPI.getPropertyUnitStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Reset to page 1 when any filter changes (except page itself)
  useEffect(() => {
    if (filters.page !== 1) {
      setFilters(prev => ({ ...prev, page: 1 }));
    } else if (isFilterDirty) {
      fetchPropertyUnits();
    }
  }, [
    debouncedFilters.search,
    debouncedFilters.approvalStatus,
    debouncedFilters.propertyType,
    debouncedFilters.listingType,
    debouncedFilters.city,
    debouncedFilters.availability,
    debouncedFilters.isFeatured,
    debouncedFilters.isVerified,
    debouncedFilters.unitType,
    debouncedFilters.furnishing,
    debouncedFilters.possessionStatus,
    debouncedFilters.minPrice,
    debouncedFilters.maxPrice,
    debouncedFilters.sortBy,
    debouncedFilters.sortOrder,
    debouncedFilters.limit,
  ]);

  // Fetch when page changes
  useEffect(() => {
    if (!isFilterDirty && filters.page !== debouncedFilters.page) {
      setDebouncedFilters(prev => ({ ...prev, page: filters.page }));
    } else if (filters.page === debouncedFilters.page && !isFilterDirty) {
      fetchPropertyUnits();
    }
  }, [filters.page, fetchPropertyUnits, isFilterDirty, filters.page, debouncedFilters.page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle reordering
  const moveProperty = (fromIndex, toIndex) => {
    const updatedProperties = [...propertyUnits];
    const [movedProperty] = updatedProperties.splice(fromIndex, 1);
    updatedProperties.splice(toIndex, 0, movedProperty);
    
    // Update displayOrder based on new position (start from 1)
    const reorderedProperties = updatedProperties.map((property, index) => ({
      ...property,
      displayOrder: index + 1
    }));
    
    setPropertyUnits(reorderedProperties);
  };

  // Save reordered properties
  const savePropertyOrder = async () => {
    try {
      setIsSavingOrder(true);
      
      // Create array of orders to update
      const displayOrders = propertyUnits.map((property, index) => ({
        id: property._id,
        displayOrder: index + 1
      }));
      
      const response = await propertyUnitAPI.updateDisplayOrders(displayOrders);
      
      if (response.success) {
        setIsReordering(false);
        toast.success(`Property order saved for ${response.modifiedCount || displayOrders.length} properties`);
        fetchPropertyUnits();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error saving property order:', error);
      toast.error(error.message || 'Failed to save property order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Cancel reordering
  const cancelReordering = () => {
    setIsReordering(false);
    fetchPropertyUnits(); // Reset to original order from server
  };

  // Start reordering
  const startReordering = () => {
    setIsReordering(true);
    setSelectedProperties([]); // Clear selection when starting reorder
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  // Individual property actions
  const updateStatus = async (id, status) => {
    try {
      const response = await propertyUnitAPI.updateApprovalStatus(id, { 
        approvalStatus: status 
      });
      
      if (response.success) {
        toast.success(`Property ${status} successfully`);
        fetchPropertyUnits();
        fetchStats();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || `Failed to ${status} property`);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const response = await propertyUnitAPI.toggleFeatured(id);
      if (response.success) {
        toast.success(response.message || 'Featured status updated');
        fetchPropertyUnits();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update featured status');
    }
  };

  const handleToggleVerified = async (id) => {
    try {
      const response = await propertyUnitAPI.toggleVerified(id);
      if (response.success) {
        toast.success(response.message || 'Verified status updated');
        fetchPropertyUnits();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update verified status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        const response = await propertyUnitAPI.deletePropertyUnitAdmin(id);
        if (response.success) {
          toast.success(response.message || 'Property deleted successfully');
          fetchPropertyUnits();
          fetchStats();
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || 'Failed to delete property');
      }
    }
  };

  // View/Edit/Create property handlers
  const handleViewProperty = async (id) => {
    try {
      const response = await propertyUnitAPI.getPropertyUnitByIdAdmin(id);
      if (response.success) {
        setViewingProperty(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to load property details');
    }
  };

  const handleEditProperty = async (id) => {
    try {
      const response = await propertyUnitAPI.getPropertyUnitByIdAdmin(id);
      if (response.success) {
        setEditingProperty(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to load property for editing');
    }
  };

  const handleCreateProperty = () => {
    setCreatingProperty(true);
  };

  const handlePropertyUpdate = async (formData) => {
    try {
      let response;
      if (editingProperty) {
        response = await propertyUnitAPI.updatePropertyUnitAdmin(editingProperty._id, formData);
        if (response.success) {
          toast.success(response.message || 'Property updated successfully');
        } else {
          throw new Error(response.message);
        }
      } else {
        response = await propertyUnitAPI.createPropertyUnitAdmin(formData);
        if (response.success) {
          toast.success(response.message || 'Property created successfully');
        } else {
          throw new Error(response.message);
        }
      }
      
      fetchPropertyUnits();
      fetchStats();
      setEditingProperty(null);
      setCreatingProperty(false);
    } catch (error) {
      console.error('Save property error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save property');
    }
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedProperties.length === propertyUnits.length) {
      setSelectedProperties([]);
    } else {
      const allIds = propertyUnits.map(p => p._id);
      setSelectedProperties(allIds);
    }
  };

  const handleSelectProperty = (id, checked) => {
    if (checked) {
      setSelectedProperties(prev => [...prev, id]);
    } else {
      setSelectedProperties(prev => prev.filter(pid => pid !== id));
    }
  };

  const handleBulkActionComplete = () => {
    setSelectedProperties([]);
    setShowBulkPanel(false);
    fetchPropertyUnits();
    fetchStats();
  };

  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties first');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedProperties.length} properties? This action cannot be undone.`)) {
      return;
    }

    try {
      setBulkLoading(true);
      const response = await propertyUnitAPI.bulkDeletePropertyUnits({ 
        ids: selectedProperties 
      });
      
      if (response.success) {
        toast.success(`Deleted ${response.deletedCount || selectedProperties.length} properties`);
        handleBulkActionComplete();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete properties');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties first');
      return;
    }

    try {
      setBulkLoading(true);
      const response = await propertyUnitAPI.bulkUpdatePropertyUnits({ 
        ids: selectedProperties,
        approvalStatus: 'approved'
      });
      
      if (response.success) {
        toast.success(`Approved ${response.modifiedCount || selectedProperties.length} properties`);
        handleBulkActionComplete();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to approve properties');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties first');
      return;
    }

    const reason = window.prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      setBulkLoading(true);
      const response = await propertyUnitAPI.bulkUpdatePropertyUnits({ 
        ids: selectedProperties,
        approvalStatus: 'rejected',
        rejectionReason: reason
      });
      
      if (response.success) {
        toast.success(`Rejected ${response.modifiedCount || selectedProperties.length} properties`);
        handleBulkActionComplete();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to reject properties');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkUpdate = async (updateData) => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties first');
      return;
    }

    try {
      setBulkLoading(true);
      const response = await propertyUnitAPI.bulkUpdatePropertyUnits({ 
        ids: selectedProperties,
        ...updateData
      });
      
      if (response.success) {
        toast.success(`Updated ${response.modifiedCount || selectedProperties.length} properties`);
        handleBulkActionComplete();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update properties');
    } finally {
      setBulkLoading(false);
    }
  };

  // Export functionality
  const handleExportSelected = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties first');
      return;
    }

    try {
      setExportLoading(true);
      
      const selectedPropertiesData = propertyUnits.filter(p => 
        selectedProperties.includes(p._id)
      );
      
      const exportData = [];
      
      for (const property of selectedPropertiesData) {
        const getBuildingName = () => {
          return property.complexName || property.buildingName || property.title || 'N/A';
        };

        const getFullAddress = () => {
          const parts = [];
          if (property.address) parts.push(property.address);
          if (property.locality) parts.push(property.locality);
          if (property.city) parts.push(property.city);
          if (property.state) parts.push(property.state);
          if (property.pincode) parts.push(property.pincode);
          return parts.join(', ') || 'N/A';
        };

        const getLocation = () => {
          const parts = [];
          if (property.locality) parts.push(property.locality);
          if (property.city) parts.push(property.city);
          if (property.state) parts.push(property.state);
          return parts.join(', ') || 'N/A';
        };

        const websiteLink = `https://www.cleartitle1.com/property-units/${property._id}`;

        if (property.unitTypes && property.unitTypes.length > 0) {
          for (const unit of property.unitTypes) {
            const getUnitTypeName = () => {
              if (unit.type === 'plot') return 'Plot';
              if (unit.type === 'commercial') return 'Commercial Space';
              return unit.type || 'N/A';
            };

            const getUnitPrice = () => {
              if (unit.price?.amount) return `₹${unit.price.amount.toLocaleString('en-IN')}`;
              return 'N/A';
            };

            const getUnitArea = () => {
              if (unit.carpetArea) return `${unit.carpetArea.toLocaleString()} sq.ft`;
              if (unit.builtUpArea) return `${unit.builtUpArea.toLocaleString()} sq.ft`;
              if (unit.plotDetails?.area?.sqft) return `${unit.plotDetails.area.sqft.toLocaleString()} sq.ft`;
              return 'N/A';
            };

            exportData.push({
              'Property Title': property.title || 'N/A',
              'Building Name': getBuildingName(),
              'Address': getFullAddress(),
              'Location': getLocation(),
              'Property Type': property.propertyType || 'N/A',
              'Unit Type': getUnitTypeName(),
              'Unit Area': getUnitArea(),
              'Unit Price': getUnitPrice(),
              'Listing Type': property.listingType === 'sale' ? 'For Sale' : 
                              property.listingType === 'rent' ? 'For Rent' : 
                              property.listingType === 'lease' ? 'For Lease' : 'PG/Hostel',
              'Availability': unit.availability || property.availability || 'N/A',
              'Furnishing': unit.furnishing || property.commonSpecifications?.furnishing || 'N/A',
              'Approval Status': property.approvalStatus === 'approved' ? 'Approved' :
                                property.approvalStatus === 'pending' ? 'Pending' : 'Rejected',
              'Featured': property.isFeatured ? 'Yes' : 'No',
              'Website Link': websiteLink,
              'Property ID': property._id
            });
          }
        } else {
          exportData.push({
            'Property Title': property.title || 'N/A',
            'Building Name': getBuildingName(),
            'Address': getFullAddress(),
            'Location': getLocation(),
            'Property Type': property.propertyType || 'N/A',
            'Unit Type': property.propertyType || 'N/A',
            'Unit Area': property.specifications?.carpetArea ? `${property.specifications.carpetArea} sq.ft` : 'N/A',
            'Unit Price': property.price?.amount ? `₹${property.price.amount.toLocaleString('en-IN')}` : 'N/A',
            'Listing Type': property.listingType === 'sale' ? 'For Sale' : 
                            property.listingType === 'rent' ? 'For Rent' : 
                            property.listingType === 'lease' ? 'For Lease' : 'PG/Hostel',
            'Availability': property.availability || 'N/A',
            'Furnishing': property.commonSpecifications?.furnishing || 'N/A',
            'Approval Status': property.approvalStatus === 'approved' ? 'Approved' :
                              property.approvalStatus === 'pending' ? 'Pending' : 'Rejected',
            'Featured': property.isFeatured ? 'Yes' : 'No',
            'Website Link': websiteLink,
            'Property ID': property._id
          });
        }
      }

      exportToCSV(exportData, `property_units_export_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success(`Successfully exported ${exportData.length} unit rows from ${selectedPropertiesData.length} properties`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export properties');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        let value = row[header];
        if (value === undefined || value === null) value = '';
        let stringValue = String(value);
        stringValue = stringValue.replace(/"/g, '""');
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          stringValue = `"${stringValue}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (typeof price === 'number') return `₹${price.toLocaleString()}`;
    if (typeof price === 'string') return price;
    if (price.amount !== undefined) {
      return `₹${Number(price.amount).toLocaleString()}`;
    }
    return 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      approvalStatus: '',
      propertyType: '',
      listingType: '',
      city: '',
      availability: '',
      isFeatured: '',
      isVerified: '',
      unitType: '',
      furnishing: '',
      possessionStatus: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'displayOrder',
      sortOrder: 'asc',
      page: 1,
      limit: 50
    });
  };

  const clearPriceFilters = () => {
    setFilters(prev => ({
      ...prev,
      minPrice: '',
      maxPrice: ''
    }));
  };

  // Generate unique key for table to force re-render on sort/page change
  const tableKey = `${filters.sortBy}-${filters.sortOrder}-${filters.page}-${filters.limit}`;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Reordering Banner */}
        {isReordering && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Reordering Mode Active</h3>
                <p className="text-blue-600 text-sm">
                  Drag properties to reorder them. The display order numbers will update automatically.
                  Click "Save Order" to save changes to the database.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={savePropertyOrder}
                  disabled={isSavingOrder}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSavingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Order'
                  )}
                </button>
                <button
                  onClick={cancelReordering}
                  disabled={isSavingOrder}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Edit Panel */}
        {(selectedProperties.length > 0 || showBulkPanel) && (
          <BulkEditPanel
            selectedProperties={selectedProperties}
            setSelectedProperties={setSelectedProperties}
            onBulkActionComplete={handleBulkActionComplete}
            onBulkUpdate={handleBulkUpdate}
            propertyUnits={propertyUnits}
            onSelectAll={handleSelectAll}
            onBulkDelete={handleBulkDelete}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
            loading={bulkLoading}
            isReordering={isReordering}
            setShowBulkPanel={setShowBulkPanel}
          />
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
              <div className="text-sm text-gray-600">Total Properties</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.featured || 0}</div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{stats.verified || 0}</div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.reraRegistered || 0}</div>
              <div className="text-sm text-gray-600">RERA Registered</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.totalStats?.totalViews || 0}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Property Units</h1>
            <p className="text-gray-600">Manage all property unit listings</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            {!isReordering ? (
              <>
                {selectedProperties.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowBulkPanel(!showBulkPanel)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
                    >
                      <span className="mr-2">📋</span>
                      Bulk Edit ({selectedProperties.length})
                    </button>
                    <button
                      onClick={handleExportSelected}
                      disabled={exportLoading}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      {exportLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">📥</span>
                          Export ({selectedProperties.length})
                        </>
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={startReordering}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <span className="mr-2">↕️</span>
                  Reorder
                </button>
              </>
            ) : null}
            <button
              onClick={handleCreateProperty}
              disabled={isReordering}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">➕</span>
              Add New
            </button>
            <button
              onClick={() => fetchPropertyUnits()}
              disabled={isReordering || loading}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <div className="flex space-x-3">
              {(filters.search || filters.approvalStatus || filters.propertyType || filters.listingType || 
                filters.city || filters.availability || filters.isFeatured || filters.isVerified || 
                filters.unitType || filters.furnishing || filters.possessionStatus || filters.minPrice || filters.maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={() => setShowBulkPanel(!showBulkPanel)}
                className="text-sm text-yellow-600 hover:text-yellow-800 font-medium transition-colors"
              >
                {showBulkPanel ? 'Hide Bulk Panel' : 'Show Bulk Panel'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Enhanced Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, address, location, description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                disabled={isReordering}
                className="w-full px-4 py-2 pl-10 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={filters.approvalStatus}
              onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">All Property Types</option>
              {filterOptions.propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filters.unitType}
              onChange={(e) => handleFilterChange('unitType', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">All Unit Types</option>
              {filterOptions.unitTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filters.listingType}
              onChange={(e) => handleFilterChange('listingType', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">All Listing Types</option>
              {filterOptions.listingTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <div>
              <input
                list="cities"
                placeholder="City"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                disabled={isReordering}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
              <datalist id="cities">
                {filterOptions.cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </datalist>
            </div>
            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">All Availability</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="under-agreement">Under Agreement</option>
              <option value="hold">On Hold</option>
            </select>
            <select
              value={filters.furnishing}
              onChange={(e) => handleFilterChange('furnishing', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">All Furnishing</option>
              {filterOptions.furnishingOptions.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filters.possessionStatus}
              onChange={(e) => handleFilterChange('possessionStatus', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">All Possession Status</option>
              {filterOptions.possessionStatuses.map(status => (
                <option key={status} value={status}>
                  {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
            <select
              value={filters.isFeatured}
              onChange={(e) => handleFilterChange('isFeatured', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">Featured Status</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
            <select
              value={filters.isVerified}
              onChange={(e) => handleFilterChange('isVerified', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">Verified Status</option>
              <option value="true">Verified Only</option>
              <option value="false">Not Verified</option>
            </select>
            <div className="flex space-x-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Min Price (₹)</label>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  disabled={isReordering}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Max Price (₹)</label>
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  disabled={isReordering}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              {(filters.minPrice || filters.maxPrice) && (
                <button
                  onClick={clearPriceFilters}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Clear price filters"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {propertyUnits.length > 0 ? ((filters.page - 1) * filters.limit) + 1 : 0} to {Math.min(filters.page * filters.limit, pagination.total)} of {pagination.total} properties
            </div>
            <div className="flex space-x-4">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                disabled={isReordering}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-sm"
              >
                <option value="displayOrder">Sort by Display Order</option>
                <option value="createdAt">Sort by Creation Date</option>
                <option value="updatedAt">Sort by Update Date</option>
                <option value="title">Sort by Title</option>
                <option value="city">Sort by City</option>
                <option value="viewCount">Sort by Views</option>
                <option value="inquiryCount">Sort by Inquiries</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                disabled={isReordering}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-sm"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                disabled={isReordering}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-sm"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading property units...</p>
            </div>
          ) : propertyUnits.length > 0 ? (
            <div className="overflow-x-auto">
              <table key={tableKey} className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      {isReordering ? 'Drag' : (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProperties.length === propertyUnits.length && propertyUnits.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3">#</span>
                        </div>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Display Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {propertyUnits.map((property, index) => (
                    <DraggablePropertyRow
                      key={`${property._id}-${filters.page}-${index}`}
                      property={property}
                      index={index}
                      moveProperty={moveProperty}
                      handleToggleFeatured={handleToggleFeatured}
                      handleToggleVerified={handleToggleVerified}
                      handleViewProperty={handleViewProperty}
                      handleEditProperty={handleEditProperty}
                      handleDelete={handleDelete}
                      handleIndividualAction={(id, status) => updateStatus(id, status)}
                      formatPrice={formatPrice}
                      formatDate={formatDate}
                      isReordering={isReordering}
                      isSelected={selectedProperties.includes(property._id)}
                      onSelectProperty={handleSelectProperty}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No property units found</h3>
              <p className="text-gray-600">Try adjusting your filters or add a new property unit.</p>
              <div className="mt-4 space-x-4">
                <button
                  onClick={handleCreateProperty}
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add New Property Unit
                </button>
                <button
                  onClick={clearFilters}
                  className="inline-block bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || isReordering}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isReordering}
                        className={`px-3 py-1 border rounded-md text-sm font-medium ${
                          pagination.currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages || isReordering}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {viewingProperty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">View Property</h3>
              <button
                onClick={() => setViewingProperty(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <PropertyUnitView property={viewingProperty} />
            <div className="mt-4 flex justify-end">
              <button
                                onClick={() => setViewingProperty(null)}
                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors mr-2"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEditProperty(viewingProperty._id);
                  setViewingProperty(null);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Property
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProperty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Property</h3>
              <button
                onClick={() => setEditingProperty(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <PropertyUnitEdit 
              property={editingProperty} 
              onSubmit={handlePropertyUpdate}
              onCancel={() => setEditingProperty(null)}
            />
          </div>
        </div>
      )}

      {creatingProperty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Property</h3>
              <button
                onClick={() => setCreatingProperty(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <PropertyUnitEdit 
              onSubmit={handlePropertyUpdate}
              onCancel={() => setCreatingProperty(false)}
            />
          </div>
        </div>
      )}
    </DndProvider>
  );
};

export default AdminPropertyUnits;