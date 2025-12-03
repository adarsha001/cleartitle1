// components/AdminWebsiteAssignment.jsx
import React, { useState, useEffect } from 'react';
import {
  assignPropertiesToWebsites,
  getPropertiesForAdmin
} from '../api/adminApi';

const AdminWebsiteAssignment = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [action, setAction] = useState('assign');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState('');

  const websites = [
    { id: 'cleartitle', name: 'ClearTitle (Parent)', color: 'bg-blue-100 text-blue-800' },
    { id: 'saimr', name: 'SAIMR (Child)', color: 'bg-green-100 text-green-800' },
    { id: 'both', name: 'Both Websites', color: 'bg-purple-100 text-purple-800' }
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
        // If selecting "both", just use ["both"]
        return ['both'];
      } else if (prev.includes('both')) {
        // If "both" is selected and we're selecting individual, remove "both"
        return [websiteId];
      } else {
        // Normal toggle
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
        // Refresh properties
        fetchProperties();
        // Clear selections
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
          Both Websites
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

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Website Assignment Management</h2>
      
      {/* Search and Filter Bar */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">All Websites</option>
            <option value="cleartitle">ClearTitle Only</option>
            <option value="saimr">SAIMR Only</option>
            <option value="both">Both Websites</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
        <div>
          <button
            onClick={fetchProperties}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh ({properties.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">
            {properties.filter(p => p.websiteAssignment?.includes('cleartitle')).length}
          </div>
          <div className="text-sm text-blue-600">ClearTitle</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-700">
            {properties.filter(p => p.websiteAssignment?.includes('saimr')).length}
          </div>
          <div className="text-sm text-green-600">SAIMR</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-700">
            {properties.filter(p => p.websiteAssignment?.includes('both')).length}
          </div>
          <div className="text-sm text-purple-600">Both</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-700">
            {properties.filter(p => !p.websiteAssignment || p.websiteAssignment.length === 0).length}
          </div>
          <div className="text-sm text-gray-600">Unassigned</div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Bulk Actions</h3>
        
        {/* Selected Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {selectedProperties.length} properties selected
          </p>
          {selectedProperties.length > 0 && (
            <button
              onClick={clearAllSelections}
              className="text-sm text-red-600 hover:text-red-800 mt-1"
            >
              Clear Selection
            </button>
          )}
        </div>

        {/* Website Selection */}
        <div className="mb-4">
          <label className="block mb-2">Select Websites:</label>
          <div className="flex gap-2">
            {websites.map(website => (
              <button
                key={website.id}
                onClick={() => toggleWebsiteSelection(website.id)}
                className={`px-4 py-2 rounded ${selectedWebsites.includes(website.id) ? website.color : 'bg-gray-200'}`}
              >
                {website.name}
              </button>
            ))}
          </div>
        </div>

        {/* Action Selection */}
        <div className="mb-4">
          <label className="block mb-2">Action:</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="assign"
                checked={action === 'assign'}
                onChange={(e) => setAction(e.target.value)}
                className="mr-2"
              />
              Add to websites
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="remove"
                checked={action === 'remove'}
                onChange={(e) => setAction(e.target.value)}
                className="mr-2"
              />
              Remove from websites
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="action"
                value="replace"
                checked={action === 'replace'}
                onChange={(e) => setAction(e.target.value)}
                className="mr-2"
              />
              Replace websites
            </label>
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-end">
          <button
            onClick={handleAssign}
            disabled={loading || selectedProperties.length === 0 || selectedWebsites.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Apply Changes'}
          </button>
        </div>
      </div>

      {/* Properties Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={properties.length > 0 && selectedProperties.length === properties.length}
                  onChange={selectAllProperties}
                  className="mr-2"
                />
                Select All
              </th>
              <th className="p-3 text-left">Property</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Websites</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(property => (
              <tr key={property._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedProperties.includes(property._id)}
                    onChange={() => togglePropertySelection(property._id)}
                  />
                </td>
                <td className="p-3">
                  <div className="font-medium">{property.title}</div>
                  <div className="text-sm text-gray-500">{property.propertyLocation}</div>
                </td>
                <td className="p-3">{property.city}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {property.category}
                  </span>
                </td>
                <td className="p-3 font-medium">
                  {formatPrice(property.price)}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {getWebsiteBadges(property)}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(property.approvalStatus)}`}>
                    {property.approvalStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {properties.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No properties found
          </div>
        )}
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">How to Use</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Search or filter to find properties</li>
          <li>• Select properties using checkboxes</li>
          <li>• Choose websites (ClearTitle, SAIMR, or Both)</li>
          <li>• Select action: Add, Remove, or Replace</li>
          <li>• Click "Apply Changes" to save</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminWebsiteAssignment;