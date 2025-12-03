// components/AdminWebsiteAssignment.jsx
import React, { useState, useEffect } from 'react';
import {
  assignPropertiesToWebsites,
  getPropertiesForAdmin
} from '../api/adminApi';
import { 
  Search, Filter, RefreshCw, CheckSquare, 
  Square, Globe, Home, Building, Tag,
  ChevronDown, ChevronUp, X
} from 'lucide-react';

const AdminWebsiteAssignment = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [action, setAction] = useState('assign');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedProperty, setExpandedProperty] = useState(null);

  const websites = [
    { id: 'cleartitle', name: 'ClearTitle', color: 'bg-blue-100 text-blue-800', icon: Building },
    { id: 'saimr', name: 'SAIMR', color: 'bg-green-100 text-green-800', icon: Home },
    { id: 'both', name: 'Both', color: 'bg-purple-100 text-purple-800', icon: Globe }
  ];

  // Fetch ALL properties with filters
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 1000, // Fetch all properties
        ...(search && { search }),
        ...(websiteFilter && { website: websiteFilter })
      };
      
      const response = await getPropertiesForAdmin(params);
      if (response.data.success) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      alert('Error fetching properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search, websiteFilter]);

  // Handle property selection
  const togglePropertySelection = (propertyId) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  // Handle website selection
  const toggleWebsiteSelection = (websiteId) => {
    setSelectedWebsites(prev => {
      if (websiteId === 'both') {
        return ['both'];
      } else if (prev.includes('both')) {
        return [websiteId];
      } else {
        return prev.includes(websiteId)
          ? prev.filter(id => id !== websiteId)
          : [...prev, websiteId];
      }
    });
  };

  // Select all properties
  const selectAllProperties = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p._id));
    }
  };

  // Prepare websites for API
  const prepareWebsitesForAPI = () => {
    if (selectedWebsites.includes('both')) {
      return ['both'];
    } else if (selectedWebsites.includes('cleartitle') && selectedWebsites.includes('saimr')) {
      return ['both'];
    } else {
      return selectedWebsites;
    }
  };

  // Assign properties to websites
  const handleAssign = async () => {
    if (selectedProperties.length === 0) {
      alert('Please select at least one property');
      return;
    }

    if (selectedWebsites.length === 0) {
      alert('Please select at least one website');
      return;
    }

    const websitesToSend = prepareWebsitesForAPI();
    
    setLoading(true);
    try {
      const response = await assignPropertiesToWebsites({
        propertyIds: selectedProperties,
        websites: websitesToSend,
        action: action
      });

      if (response.data.success) {
        alert(`✅ ${response.data.message}`);
        fetchProperties();
        setSelectedProperties([]);
        setSelectedWebsites([]);
        setAction('assign');
      }
    } catch (error) {
      console.error('Error assigning properties:', error);
      alert(error.response?.data?.message || 'Error assigning properties');
    } finally {
      setLoading(false);
    }
  };

  // Get website badges for display
  const getWebsiteBadges = (property) => {
    if (!property.websiteAssignment || property.websiteAssignment.length === 0) {
      return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">Unassigned</span>;
    }
    
    if (property.websiteAssignment.includes('both')) {
      return (
        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
          Both
        </span>
      );
    }
    
    return property.websiteAssignment.map(website => {
      const websiteInfo = websites.find(w => w.id === website);
      return websiteInfo ? (
        <span key={website} className={`px-2 py-1 rounded text-xs ${websiteInfo.color}`}>
          {websiteInfo.name}
        </span>
      ) : null;
    }).filter(Boolean);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedProperties([]);
    setSelectedWebsites([]);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format price
  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `₹${price.toLocaleString()}`;
    }
    return price || 'Price on Request';
  };

  // Toggle property details on mobile
  const togglePropertyDetails = (propertyId) => {
    if (expandedProperty === propertyId) {
      setExpandedProperty(null);
    } else {
      setExpandedProperty(propertyId);
    }
  };

  // Render property card for mobile
  const renderMobilePropertyCard = (property) => {
    const isExpanded = expandedProperty === property._id;
    const isSelected = selectedProperties.includes(property._id);

    return (
      <div key={property._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-3">
        {/* Property Header */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {/* Checkbox */}
              <div className="mt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePropertySelection(property._id)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </div>
              
              {/* Property Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                <p className="text-sm text-gray-600 mt-1 truncate">{property.propertyLocation}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{property.city}</span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{property.category}</span>
                </div>
              </div>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => togglePropertyDetails(property._id)}
              className="ml-2 text-gray-400"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {/* Quick Info */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium text-gray-900">{formatPrice(property.price)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(property.approvalStatus)}`}>
                {property.approvalStatus}
              </span>
            </div>
          </div>

          {/* Website Assignment */}
          <div className="mt-3">
            <p className="text-sm text-gray-500 mb-1">Websites</p>
            <div className="flex flex-wrap gap-1">
              {getWebsiteBadges(property)}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 pt-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{property.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{property.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Property ID</p>
                <p className="font-medium text-xs text-gray-600 truncate">{property._id}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Website Assignment</h1>
              <p className="text-gray-600 mt-1">Assign properties to ClearTitle (parent) and SAIMR (child) websites</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {properties.length} properties
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Filter */}
            <div className="hidden md:block">
              <select
                value={websiteFilter}
                onChange={(e) => setWebsiteFilter(e.target.value)}
                className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Filter by Website</option>
                <option value="cleartitle">ClearTitle Only</option>
                <option value="saimr">SAIMR Only</option>
                <option value="both">Both Websites</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white"
            >
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchProperties}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>

          {/* Mobile Filters Panel */}
          {showMobileFilters && (
            <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg md:hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Filter Options</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <select
                value={websiteFilter}
                onChange={(e) => setWebsiteFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="">All Websites</option>
                <option value="cleartitle">ClearTitle Only</option>
                <option value="saimr">SAIMR Only</option>
                <option value="both">Both Websites</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {websites.map(website => {
            const Icon = website.icon;
            const count = properties.filter(p => p.websiteAssignment?.includes(website.id)).length;
            return (
              <div key={website.id} className={`p-4 rounded-lg ${website.color} border border-transparent`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm mt-1">{website.name}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-50" />
                </div>
              </div>
            );
          })}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-700">
                  {properties.filter(p => !p.websiteAssignment || p.websiteAssignment.length === 0).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Unassigned</p>
              </div>
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Selected Properties Bar */}
        {selectedProperties.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-blue-900">
                  {selectedProperties.length} properties selected
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Ready for bulk assignment
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearAllSelections}
                  className="px-4 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Bulk Assignment</h3>
            
            {/* Website Selection */}
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">Select Websites:</label>
              <div className="flex flex-wrap gap-2">
                {websites.map(website => {
                  const Icon = website.icon;
                  const isSelected = selectedWebsites.includes(website.id);
                  return (
                    <button
                      key={website.id}
                      onClick={() => toggleWebsiteSelection(website.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        isSelected
                          ? `${website.color} border-blue-500`
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{website.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Selection */}
            <div className="mb-6">
              <label className="block mb-2 font-medium text-gray-700">Action:</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="assign"
                    checked={action === 'assign'}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-4 h-4 text-blue-600 mr-2"
                  />
                  <span>Add to websites</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="remove"
                    checked={action === 'remove'}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-4 h-4 text-blue-600 mr-2"
                  />
                  <span>Remove from websites</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="action"
                    value="replace"
                    checked={action === 'replace'}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-4 h-4 text-blue-600 mr-2"
                  />
                  <span>Replace websites</span>
                </label>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end">
              <button
                onClick={handleAssign}
                disabled={loading || selectedProperties.length === 0 || selectedWebsites.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Apply to {selectedProperties.length} Properties
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Properties - Mobile View */}
        <div className="md:hidden">
          {/* Selection Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAllProperties}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                {selectedProperties.length === properties.length ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
                <span>Select All</span>
              </button>
              {selectedProperties.length > 0 && (
                <span className="text-sm text-gray-600">
                  ({selectedProperties.length} selected)
                </span>
              )}
            </div>
          </div>

          {/* Mobile Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
              <p className="text-gray-600 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            properties.map(renderMobilePropertyCard)
          )}
        </div>

        {/* Properties - Desktop View */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={properties.length > 0 && selectedProperties.length === properties.length}
                        onChange={selectAllProperties}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 font-medium text-gray-700">Select All</span>
                    </div>
                  </th>
                  <th className="p-4 text-left font-medium text-gray-700">Property</th>
                  <th className="p-4 text-left font-medium text-gray-700">City</th>
                  <th className="p-4 text-left font-medium text-gray-700">Category</th>
                  <th className="p-4 text-left font-medium text-gray-700">Price</th>
                  <th className="p-4 text-left font-medium text-gray-700">Websites</th>
                  <th className="p-4 text-left font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Loading properties...</p>
                    </td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center">
                      <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
                      <p className="text-gray-600 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  properties.map(property => {
                    const isSelected = selectedProperties.includes(property._id);
                    return (
                      <tr key={property._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePropertySelection(property._id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{property.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{property.propertyLocation}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{property.city}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                            {property.category}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-gray-900">
                          {formatPrice(property.price)}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {getWebsiteBadges(property)}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(property.approvalStatus)}`}>
                            {property.approvalStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 p-4 md:p-6 bg-white rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">How to use:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <p className="font-medium text-gray-700">1. Select Properties</p>
              <p>• Click checkboxes to select multiple properties</p>
              <p>• Use "Select All" for bulk selection</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-gray-700">2. Assign Websites</p>
              <p>• Choose websites (ClearTitle, SAIMR, or Both)</p>
              <p>• Select action type: Add, Remove, or Replace</p>
              <p>• Click "Apply" to save changes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWebsiteAssignment;