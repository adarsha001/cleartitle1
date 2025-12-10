import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import { propertyUnitAPI } from '../api/adminpropertyUnitAPI';
import PropertyUnitEdit from './PropertyUnitEdit';
import PropertyUnitView from './PropertyUnitView';

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
  isReordering
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
      rented: 'bg-purple-100 text-purple-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <tr 
      ref={ref}
      style={{ opacity, cursor: isReordering ? 'move' : 'default' }}
      className="hover:bg-gray-50 transition-all duration-200"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        {isReordering ? (
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        ) : (
          <span className="text-sm text-gray-500">{index + 1}</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          {property.images?.[0]?.url ? (
            <img
              src={property.images[0].url}
              alt={property.title}
              className="w-16 h-16 rounded-lg object-cover mr-4"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
              <span className="text-gray-400">🏠</span>
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{property.title}</div>
            <div className="text-sm text-gray-500">{property.city}</div>
            <div className="text-xs text-gray-400 mt-1">
              {formatDate(property.createdAt)}
            </div>
            {property.unitNumber && (
              <div className="text-xs text-gray-500">Unit: {property.unitNumber}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
              {property.propertyType}
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {property.listingType}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {property.specifications?.bedrooms || 0} Beds • {property.specifications?.bathrooms || 0} Baths
          </div>
          <div className="text-sm text-gray-600">
            Area: {property.specifications?.carpetArea || property.specifications?.plotArea || 0} sq.ft
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">
          {formatPrice(property.price)}
        </div>
        <div className="text-sm text-gray-500">
          {property.price?.perUnit || 'total'}
        </div>
        {property.maintenanceCharges > 0 && (
          <div className="text-xs text-gray-500">
            Maintenance: ₹{property.maintenanceCharges}/month
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          <div>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(property.approvalStatus)}`}>
              {property.approvalStatus}
            </span>
          </div>
          <div>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(property.availability)}`}>
              {property.availability}
            </span>
          </div>
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
              {property.isFeatured ? '⭐' : '☆'}
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
              {property.isVerified ? '✓' : '○'}
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
    sortBy: 'displayOrder',
    sortOrder: 'asc'
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    featured: 0,
    verified: 0
  });

  // CRUD operation states
  const [viewingProperty, setViewingProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [creatingProperty, setCreatingProperty] = useState(false);

  // Reordering states
  const [isReordering, setIsReordering] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Fetch ALL property units (no pagination)
  const fetchPropertyUnits = async () => {
    try {
      setLoading(true);
      
      // Set limit to a high number to get all properties
      const response = await propertyUnitAPI.getAllPropertyUnits({
        ...filters,
        page: 1,
        limit: 1000 // High limit to get all properties
      });
      
      const processedData = (response.data || []).map(property => ({
        ...property,
        price: property.price ? {
          ...property.price,
          amount: property.price.amount ? property.price.amount.toString() : '0'
        } : { amount: '0', currency: 'INR', perUnit: 'total' }
      }));
      
      // Sort by displayOrder (ascending)
      processedData.sort((a, b) => {
        const orderA = a.displayOrder || 9999; // Default high number for items without displayOrder
        const orderB = b.displayOrder || 9999;
        return orderA - orderB;
      });
      
      setPropertyUnits(processedData);
      
      if (response.stats) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error fetching property units:', error);
      toast.error('Failed to load property units');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await propertyUnitAPI.getPropertyUnitStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchPropertyUnits();
    fetchStats();
  }, [filters]);

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
      const orders = propertyUnits.map((property, index) => ({
        id: property._id,
        displayOrder: index + 1
      }));

      // Call API to update display orders
      await propertyUnitAPI.updateDisplayOrders(orders);
      
      setIsReordering(false);
      setIsSavingOrder(false);
      toast.success('Property order saved successfully!');
      
      // Refresh to get updated data
      fetchPropertyUnits();
    } catch (error) {
      console.error('Error saving property order:', error);
      setIsSavingOrder(false);
      toast.error('Failed to save property order');
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
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Individual property actions
  const updateStatus = async (id, status) => {
    try {
      await propertyUnitAPI.updateApprovalStatus(id, { approvalStatus: status });
      toast.success(`Property ${status} successfully`);
      fetchPropertyUnits();
      fetchStats();
    } catch (error) {
      toast.error(`Failed to ${status} property`);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await propertyUnitAPI.toggleFeatured(id);
      toast.success('Featured status updated');
      fetchPropertyUnits();
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const handleToggleVerified = async (id) => {
    try {
      await propertyUnitAPI.toggleVerified(id);
      toast.success('Verified status updated');
      fetchPropertyUnits();
    } catch (error) {
      toast.error('Failed to update verified status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyUnitAPI.deletePropertyUnitAdmin(id);
        toast.success('Property deleted successfully');
        fetchPropertyUnits();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete property');
      }
    }
  };

  // View/Edit/Create property handlers
  const handleViewProperty = async (id) => {
    try {
      const response = await propertyUnitAPI.getPropertyUnitByIdAdmin(id);
      const propertyWithStringPrice = {
        ...response.data,
        price: response.data.price ? {
          ...response.data.price,
          amount: response.data.price.amount ? response.data.price.amount.toString() : '0'
        } : { amount: '0', currency: 'INR', perUnit: 'total' }
      };
      setViewingProperty(propertyWithStringPrice);
    } catch (error) {
      toast.error('Failed to load property details');
    }
  };

  const handleEditProperty = async (id) => {
    try {
      const response = await propertyUnitAPI.getPropertyUnitByIdAdmin(id);
      const propertyWithStringPrice = {
        ...response.data,
        price: response.data.price ? {
          ...response.data.price,
          amount: response.data.price.amount ? response.data.price.amount.toString() : '0'
        } : { amount: '0', currency: 'INR', perUnit: 'total' }
      };
      setEditingProperty(propertyWithStringPrice);
    } catch (error) {
      toast.error('Failed to load property for editing');
    }
  };

  const handleCreateProperty = () => {
    setCreatingProperty(true);
  };

  const handlePropertyUpdate = async (formData) => {
    try {
      if (editingProperty) {
        await propertyUnitAPI.updatePropertyUnitAdmin(editingProperty._id, formData);
        toast.success('Property updated successfully');
      } else {
        await propertyUnitAPI.createPropertyUnitAdmin(formData);
        toast.success('Property created successfully');
      }
      
      fetchPropertyUnits();
      fetchStats();
      setEditingProperty(null);
      setCreatingProperty(false);
    } catch (error) {
      console.error('Save property error:', error);
      toast.error(error.response?.data?.message || 'Failed to save property');
    }
  };

  // Utility functions
  const formatPrice = (price) => {
    if (!price || !price.amount) return 'N/A';
    const amount = typeof price.amount === 'string' 
      ? parseFloat(price.amount) || 0 
      : price.amount;
    const formattedAmount = amount.toLocaleString('en-IN');
    const currencySymbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€'
    };
    const symbol = currencySymbols[price.currency] || price.currency || '₹';
    return `${symbol} ${formattedAmount}`;
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
      sortBy: 'displayOrder',
      sortOrder: 'asc'
    });
  };

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

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
              <div className="text-sm text-gray-600">Total</div>
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
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Property Units</h1>
            <p className="text-gray-600">Manage all property unit listings</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            {!isReordering ? (
              <button
                onClick={startReordering}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <span className="mr-2">📋</span>
                Reorder Properties
              </button>
            ) : null}
            <button
              onClick={handleCreateProperty}
              disabled={isReordering}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">➕</span>
              Add New Unit
            </button>
            <button
              onClick={fetchPropertyUnits}
              disabled={isReordering || isSavingOrder}
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
            {(filters.approvalStatus || filters.isFeatured || filters.isVerified || filters.search) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search properties..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
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
              <option value="">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Plot">Plot</option>
              <option value="Commercial Space">Commercial Space</option>
              <option value="Independent House">Independent House</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Duplex">Duplex</option>
              <option value="Row House">Row House</option>
              <option value="Studio">Studio</option>
            </select>
            <select
              value={filters.listingType}
              onChange={(e) => handleFilterChange('listingType', e.target.value)}
              disabled={isReordering}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">All Listing Types</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="lease">For Lease</option>
              <option value="pg">PG</option>
            </select>
          </div>
        </div>

        {/* Properties Table - Shows all properties at once */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading property units...</p>
            </div>
          ) : propertyUnits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      {isReordering ? 'Drag' : '#'}
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
                      key={property._id}
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
          
          {/* Show total count */}
          {!loading && propertyUnits.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-700">
                Showing all <span className="font-medium">{propertyUnits.length}</span> properties
                {isReordering && (
                  <span className="ml-4 text-blue-600 font-medium">
                    ⚠️ Drag properties to reorder. Display order updates automatically.
                  </span>
                )}
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