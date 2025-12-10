import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { 
  fetchAllProperties, 
  bulkUpdateProperties, 
  updatePropertyOrder,
  fetchPropertyStats 
} from '../api/adminApi';

// Drag and Drop Types
const ItemTypes = {
  PROPERTY: 'property',
};

// Draggable Property Row Component
const DraggablePropertyRow = ({ 
  property, 
  index, 
  moveProperty, 
  handlePropertySelect, 
  selectedProperties, 
  handleFeatureToggle, 
  handleOrderChange, 
  handleIndividualAction, 
  getStatusBadge,
  onEditProperty
}) => {
  const ref = React.useRef(null);
  const navigate = useNavigate();

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
      if (!ref.current) return;
      
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveProperty(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const opacity = isDragging ? 0.4 : 1;

  const handlePropertyClick = (e) => {
    // Don't navigate if clicking on interactive elements
    if (e.target.tagName === 'INPUT' || 
        e.target.tagName === 'BUTTON' || 
        e.target.closest('button') || 
        e.target.closest('input')) {
      return;
    }
    
    // Smooth scroll to top first, then navigate
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Small delay to allow scroll to complete
    setTimeout(() => {
      navigate(`/property/${property._id}`);
    }, 300);
  };

  return (
    <tr 
      ref={ref}
      style={{ opacity, cursor: 'move' }}
      className="hover:bg-gray-50 transition-all duration-200 group"
    >
      <td 
        className="px-6 py-4 whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selectedProperties.has(property._id)}
          onChange={() => handlePropertySelect(property._id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td 
        className="px-6 py-4 cursor-pointer"
        onClick={handlePropertyClick}
      >
        <div className="flex items-center">
          <div className="mr-2 text-gray-400 group-hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          <img
            src={property.images?.[0]?.url || "https://via.placeholder.com/60x40?text=No+Image"}
            alt={property.title}
            className="w-12 h-8 object-cover rounded mr-3 group-hover:scale-105 transition-transform"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {property.title}
            </div>
            <div className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
              {property.city} • {property.category}
            </div>
            <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
              {property.price === "Price on Request" 
                ? "Price on Request" 
                : `₹${typeof property.price === 'number' ? property.price.toLocaleString() : property.price}`
              }
            </div>
          </div>
          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(property.approvalStatus)}`}>
          {property.approvalStatus}
        </span>
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleFeatureToggle(property._id, property.isFeatured)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            property.isFeatured
              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {property.isFeatured ? '⭐ Featured' : '☆ Feature'}
        </button>
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 font-medium">
            {index + 1}
          </span>
          <input
            type="number"
            min="1"
            value={property.displayOrder || index + 1}
            onChange={(e) => handleOrderChange(property._id, e.target.value)}
            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </td>
      <td 
        className="px-6 py-4 whitespace-nowrap text-sm font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex space-x-2">
          {/* Edit Button */}
          <button
            onClick={() => onEditProperty(property._id)}
            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1"
            title="Edit Property"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>

          {property.approvalStatus !== 'approved' && (
            <button
              onClick={() => handleIndividualAction(property._id, 'approvalStatus', 'approved')}
              className="text-green-600 hover:text-green-900 transition-colors"
            >
              Approve
            </button>
          )}
          {property.approvalStatus !== 'rejected' && (
            <button
              onClick={() => {
                const reason = prompt('Enter rejection reason:');
                if (reason !== null) {
                  handleIndividualAction(property._id, 'approvalStatus', 'rejected', reason);
                }
              }}
              className="text-red-600 hover:text-red-900 transition-colors"
            >
              Reject
            </button>
          )}
          {property.approvalStatus === 'approved' && (
            <button
              onClick={() => handleIndividualAction(property._id, 'approvalStatus', 'pending')}
              className="text-yellow-600 hover:text-yellow-900 transition-colors"
            >
              Mark Pending
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// Bulk Edit Modal Component
const BulkEditModal = ({ isOpen, onClose, selectedCount, onBulkUpdate }) => {
  const [editData, setEditData] = useState({
    category: '',
    city: '',
    forSale: '',
    isFeatured: '',
    isVerified: '',
    approvalStatus: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty values
    const updates = Object.fromEntries(
      Object.entries(editData).filter(([_, value]) => value !== '')
    );

    if (Object.keys(updates).length === 0) {
      alert('Please select at least one field to update');
      return;
    }

    onBulkUpdate(updates);
    setEditData({
      category: '',
      city: '',
      forSale: '',
      isFeatured: '',
      isVerified: '',
      approvalStatus: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          Bulk Edit ({selectedCount} Properties)
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={editData.category}
                onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">No Change</option>
                <option value="Outright">Outright</option>
                <option value="Commercial">Commercial</option>
                <option value="Farmland">Farmland</option>
                <option value="JD/JV">JD/JV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={editData.city}
                onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Leave empty for no change"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                For Sale
              </label>
              <select
                value={editData.forSale}
                onChange={(e) => setEditData(prev => ({ ...prev, forSale: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">No Change</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured
              </label>
              <select
                value={editData.isFeatured}
                onChange={(e) => setEditData(prev => ({ ...prev, isFeatured: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">No Change</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verified
              </label>
              <select
                value={editData.isVerified}
                onChange={(e) => setEditData(prev => ({ ...prev, isVerified: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">No Change</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Status
              </label>
              <select
                value={editData.approvalStatus}
                onChange={(e) => setEditData(prev => ({ ...prev, approvalStatus: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">No Change</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Update Properties
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Admin Properties Component
const AdminProperties = ({ onEditProperty }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedProperties, setSelectedProperties] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    approvalStatus: '',
    isFeatured: '',
    sortBy: 'displayOrder',
    sortOrder: 'asc'
  });
  const [isReordering, setIsReordering] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);

  const getProperties = async () => {
    setLoading(true);
    try {
      // Remove pagination parameters and fetch all properties
      const params = {
        ...filters,
        limit: 1000 // Set a high limit to get all properties
      };
      
      const { data } = await fetchAllProperties(params);
      
      setProperties(data.properties || []);
      
    } catch (error) {
      console.error('Error fetching properties:', error);
      alert('Error fetching properties');
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    try {
      const { data } = await fetchPropertyStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    getProperties();
    getStats();
  }, [filters]);

  const moveProperty = (fromIndex, toIndex) => {
    setIsReordering(true);
    
    const updatedProperties = [...properties];
    const [movedProperty] = updatedProperties.splice(fromIndex, 1);
    updatedProperties.splice(toIndex, 0, movedProperty);
    
    const reorderedProperties = updatedProperties.map((property, index) => ({
      ...property,
      displayOrder: index + 1
    }));
    
    setProperties(reorderedProperties);
  };

  const savePropertyOrder = async () => {
    try {
      const updatePromises = properties.map((property, index) => 
        updatePropertyOrder(property._id, { 
          displayOrder: index + 1 
        })
      );
      
      await Promise.all(updatePromises);
      setIsReordering(false);
      alert('Property order saved successfully!');
    } catch (error) {
      console.error('Error saving property order:', error);
      alert('Error saving property order');
    }
  };

  const resetPropertyOrder = async () => {
    setIsReordering(false);
    await getProperties();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setSelectedProperties(new Set());
  };

  const handlePropertySelect = (propertyId) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedProperties(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProperties.size === properties.length) {
      setSelectedProperties(new Set());
    } else {
      const allIds = new Set(properties.map(p => p._id));
      setSelectedProperties(allIds);
    }
  };

  const handleFeatureToggle = async (propertyId, currentStatus) => {
    try {
      const { data } = await updatePropertyOrder(propertyId, { 
        isFeatured: !currentStatus 
      });
      
      setProperties(prevProperties =>
        prevProperties.map(property =>
          property._id === propertyId ? data.property : property
        )
      );
      
      if (stats) {
        const newStats = { ...stats };
        if (!currentStatus) {
          newStats.featured += 1;
        } else {
          newStats.featured -= 1;
        }
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
      alert('Error updating property');
    }
  };

  const handleOrderChange = async (propertyId, newOrder) => {
    try {
      const { data } = await updatePropertyOrder(propertyId, { 
        displayOrder: parseInt(newOrder) 
      });
      
      setProperties(prevProperties =>
        prevProperties.map(property =>
          property._id === propertyId ? data.property : property
        )
      );
      
      await getProperties();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating property order');
    }
  };

  const handleIndividualAction = async (propertyId, action, value, reason = '') => {
    try {
      const { data } = await bulkUpdateProperties({
        propertyIds: [propertyId],
        action,
        value,
        reason
      });
      
      const updatedProperty = data.properties[0];
      setProperties(prevProperties =>
        prevProperties.map(property =>
          property._id === propertyId ? updatedProperty : property
        )
      );
      
      if (stats && action === 'approvalStatus') {
        const newStats = { ...stats };
        const currentProperty = properties.find(p => p._id === propertyId);
        
        if (currentProperty) {
          if (currentProperty.approvalStatus === 'pending') newStats.pending -= 1;
          if (currentProperty.approvalStatus === 'approved') newStats.approved -= 1;
          
          if (value === 'pending') newStats.pending += 1;
          if (value === 'approved') newStats.approved += 1;
        }
        setStats(newStats);
      }
      
      alert(`Property ${action === 'approvalStatus' ? value : 'updated'} successfully`);
      
    } catch (error) {
      console.error('Error in individual action:', error);
      alert('Error updating property');
    }
  };

  const handleBulkEdit = async (updates) => {
    try {
      const bulkUpdates = [];
      
      Object.entries(updates).forEach(([field, value]) => {
        if (value !== '') {
          let processedValue = value;
          if (field === 'forSale' || field === 'isFeatured' || field === 'isVerified') {
            processedValue = value === 'true';
          }
          
          bulkUpdates.push({
            action: field,
            value: processedValue
          });
        }
      });

      for (const update of bulkUpdates) {
        const { data } = await bulkUpdateProperties({
          propertyIds: Array.from(selectedProperties),
          action: update.action,
          value: update.value
        });

        const updatedPropertiesMap = new Map();
        data.properties.forEach(property => {
          updatedPropertiesMap.set(property._id, property);
        });

        setProperties(prevProperties => 
          prevProperties.map(property => 
            updatedPropertiesMap.get(property._id) || property
          )
        );
      }

      if (stats) {
        const newStats = { ...stats };
        
        if (updates.approvalStatus) {
          const selectedCount = selectedProperties.size;
          if (updates.approvalStatus === 'approved') {
            newStats.approved += selectedCount;
            newStats.pending -= selectedCount;
          } else if (updates.approvalStatus === 'pending') {
            newStats.pending += selectedCount;
            newStats.approved -= selectedCount;
          }
        }
        
        if (updates.isFeatured === 'true') {
          newStats.featured += selectedProperties.size;
        } else if (updates.isFeatured === 'false') {
          newStats.featured -= selectedProperties.size;
        }
        
        setStats(newStats);
      }

      alert(`Successfully updated ${selectedProperties.size} properties`);
      setSelectedProperties(new Set());
      
    } catch (error) {
      console.error('Error in bulk edit:', error);
      alert('Error updating properties');
    }
  };

  const handleBulkAction = async (action, value, reason = '') => {
    if (selectedProperties.size === 0) {
      alert('Please select at least one property');
      return;
    }

    try {
      const { data } = await bulkUpdateProperties({
        propertyIds: Array.from(selectedProperties),
        action,
        value,
        reason
      });
      
      const updatedPropertiesMap = new Map();
      data.properties.forEach(property => {
        updatedPropertiesMap.set(property._id, property);
      });

      setProperties(prevProperties => 
        prevProperties.map(property => 
          updatedPropertiesMap.get(property._id) || property
        )
      );

      if (stats) {
        const newStats = { ...stats };
        if (action === 'approvalStatus') {
          if (value === 'approved') {
            newStats.approved += selectedProperties.size;
            newStats.pending -= selectedProperties.size;
          } else if (value === 'pending') {
            newStats.pending += selectedProperties.size;
            newStats.approved -= selectedProperties.size;
          } else if (value === 'rejected') {
            newStats.pending -= selectedProperties.size;
          }
        } else if (action === 'isFeatured' && value === true) {
          newStats.featured += selectedProperties.size;
        } else if (action === 'isFeatured' && value === false) {
          newStats.featured -= selectedProperties.size;
        }
        setStats(newStats);
      }
      
      alert(`Successfully updated ${selectedProperties.size} properties`);
      setSelectedProperties(new Set());
      
    } catch (error) {
      console.error('Error in bulk action:', error);
      alert('Error updating properties');
    }
  };

  const clearStatusFilter = () => {
    setFilters(prev => ({
      ...prev,
      approvalStatus: '',
      isFeatured: ''
    }));
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !properties.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
            <p className="text-gray-600 mt-2">Manage, verify, and feature properties</p>
            <p className="text-sm text-gray-500 mt-1">
              Showing {properties.length} properties
            </p>
          </div>

          {/* Drag & Drop Controls */}
          {isReordering && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Reordering Mode Active</h3>
                  <p className="text-blue-600 text-sm">
                    Drag properties to reorder them. Changes will be saved when you click "Save Order".
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={savePropertyOrder}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Order
                  </button>
                  <button
                    onClick={resetPropertyOrder}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Properties</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-purple-600">{stats.featured}</div>
                <div className="text-sm text-gray-600">Featured</div>
              </div>
            </div>
          )}

          {/* Filters with Reorder Button */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex gap-2">
                {!isReordering && (
                  <button
                    onClick={() => setIsReordering(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Reorder Properties
                  </button>
                )}
                {(filters.approvalStatus || filters.isFeatured) && (
                  <button
                    onClick={clearStatusFilter}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Clear Status Filters
                  </button>
                )}
                <button
                  onClick={() => {
                    setFilters({
                      search: '',
                      category: '',
                      city: '',
                      approvalStatus: '',
                      isFeatured: '',
                      sortBy: 'displayOrder',
                      sortOrder: 'asc'
                    });
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <input
                type="text"
                placeholder="Search properties..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
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
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <select
                value={filters.approvalStatus}
                onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filters.isFeatured}
                onChange={(e) => handleFilterChange('isFeatured', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">All Featured</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="displayOrder">Display Order</option>
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProperties.size > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-yellow-800">
                    {selectedProperties.size} properties selected
                  </h4>
                  <p className="text-yellow-700 text-sm">
                    Choose an action to perform on all selected properties
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowBulkEdit(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Bulk Edit
                  </button>
                  <button
                    onClick={() => handleBulkAction('approvalStatus', 'approved')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Approve All
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason for all properties:');
                      if (reason !== null) {
                        handleBulkAction('approvalStatus', 'rejected', reason);
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => handleBulkAction('isFeatured', true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Feature All
                  </button>
                  <button
                    onClick={() => handleBulkAction('isFeatured', false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Unfeature All
                  </button>
                  <button
                    onClick={() => setSelectedProperties(new Set())}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Properties Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedProperties.size === properties.length && properties.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property, index) => (
                    <DraggablePropertyRow
                      key={property._id}
                      property={property}
                      index={index}
                      moveProperty={moveProperty}
                      handlePropertySelect={handlePropertySelect}
                      selectedProperties={selectedProperties}
                      handleFeatureToggle={handleFeatureToggle}
                      handleOrderChange={handleOrderChange}
                      handleIndividualAction={handleIndividualAction}
                      getStatusBadge={getStatusBadge}
                      onEditProperty={onEditProperty}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {properties.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No properties found matching your criteria.</p>
              <button
                onClick={clearStatusFilter}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Bulk Edit Modal */}
        <BulkEditModal
          isOpen={showBulkEdit}
          onClose={() => setShowBulkEdit(false)}
          selectedCount={selectedProperties.size}
          onBulkUpdate={handleBulkEdit}
        />
      </div>
    </DndProvider>
  );
};

export default AdminProperties;