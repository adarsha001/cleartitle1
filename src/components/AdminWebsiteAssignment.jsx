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
    { id: 'cleartitle', name: 'ClearTitle (Parent)', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { id: 'saimr', name: 'SAIMR (Child)', color: 'bg-green-100 text-green-800 border-green-300' },
    { id: 'both', name: 'Both Websites', color: 'bg-purple-100 text-purple-800 border-purple-300' }
  ];

  // Fetch properties with filters
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (websiteFilter) params.website = websiteFilter;
      
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

  // Handle website selection for assignment
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
      return (
        <div className="flex flex-col">
          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">Unassigned</span>
          <span className="text-xs text-gray-500 mt-1">Click to assign</span>
        </div>
      );
    }
    
    if (property.websiteAssignment.includes('both')) {
      return (
        <div className="flex flex-col">
          <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
            Both Websites
          </span>
          <span className="text-xs text-gray-500 mt-1">On ClearTitle & SAIMR</span>
        </div>
      );
    }
    
    return property.websiteAssignment.map(website => {
      const websiteInfo = websites.find(w => w.id === website);
      return websiteInfo ? (
        <div key={website} className="flex flex-col">
          <span className={`px-2 py-1 rounded text-xs ${websiteInfo.color}`}>
            {websiteInfo.name}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {website === 'cleartitle' ? 'Parent Website' : 'Child Website'}
          </span>
        </div>
      ) : null;
    }).filter(Boolean);
  };

  // Quick action buttons
  const handleQuickAction = (websites, actionType) => {
    if (selectedProperties.length === 0) {
      alert('Please select properties first');
      return;
    }
    
    setSelectedWebsites(websites);
    setAction(actionType);
    
    // Auto-submit after confirming
    if (window.confirm(`Are you sure you want to ${actionType} selected properties to ${websites.includes('both') ? 'Both Websites' : websites.map(w => websites.find(ws => ws.id === w)?.name).join(' & ')}?`)) {
      handleAssign();
    } else {
      setSelectedWebsites([]);
    }
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedProperties([]);
    setSelectedWebsites([]);
    setAction('assign');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Website Assignment Management</h2>
          <p className="text-gray-600 mt-1">Bulk assign properties to ClearTitle (parent) and/or SAIMR (child) websites</p>
        </div>
        <div className="text-sm">
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full">
            {properties.length} Total Properties
          </span>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div>
          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Filter by Website</option>
            <option value="cleartitle">ClearTitle Only</option>
            <option value="saimr">SAIMR Only</option>
            <option value="both">Both Websites</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchProperties}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="text-2xl font-bold text-blue-700">
            {properties.filter(p => p.websiteAssignment?.includes('cleartitle')).length}
          </div>
          <div className="text-sm text-blue-600">ClearTitle</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="text-2xl font-bold text-green-700">
            {properties.filter(p => p.websiteAssignment?.includes('saimr')).length}
          </div>
          <div className="text-sm text-green-600">SAIMR</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="text-2xl font-bold text-purple-700">
            {properties.filter(p => p.websiteAssignment?.includes('both')).length}
          </div>
          <div className="text-sm text-purple-600">Both</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="text-2xl font-bold text-gray-700">
            {properties.filter(p => !p.websiteAssignment || p.websiteAssignment.length === 0).length}
          </div>
          <div className="text-sm text-gray-600">Unassigned</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Bulk Actions
        </h3>
        <p className="text-sm text-gray-600 mb-3">Select properties first, then click an action:</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <button
            onClick={() => handleQuickAction(['cleartitle'], 'replace')}
            className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 flex flex-col items-center"
          >
            <span className="font-medium">Assign to ClearTitle</span>
            <span className="text-xs text-blue-600 mt-1">Parent Website Only</span>
          </button>
          <button
            onClick={() => handleQuickAction(['saimr'], 'replace')}
            className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 flex flex-col items-center"
          >
            <span className="font-medium">Assign to SAIMR</span>
            <span className="text-xs text-green-600 mt-1">Child Website Only</span>
          </button>
          <button
            onClick={() => handleQuickAction(['both'], 'replace')}
            className="px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200 flex flex-col items-center"
          >
            <span className="font-medium">Assign to Both</span>
            <span className="text-xs text-purple-600 mt-1">Both Websites</span>
          </button>
          <button
            onClick={() => handleQuickAction(['cleartitle', 'saimr'], 'remove')}
            className="px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 flex flex-col items-center"
          >
            <span className="font-medium">Remove from All</span>
            <span className="text-xs text-red-600 mt-1">Make Unassigned</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      <div className="mb-6 p-5 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">Selected: {selectedProperties.length} properties</h3>
            {selectedProperties.length > 0 && (
              <p className="text-sm text-blue-700">
                Ready for bulk assignment. Choose websites and action below.
              </p>
            )}
          </div>
          
          {selectedProperties.length > 0 && (
            <button
              onClick={clearAllSelections}
              className="px-4 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Selection
            </button>
          )}
        </div>

        {selectedProperties.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Website Selection */}
              <div>
                <label className="block mb-2 font-medium text-gray-900">Select Websites:</label>
                <div className="flex gap-2">
                  {websites.map(website => (
                    <button
                      key={website.id}
                      onClick={() => toggleWebsiteSelection(website.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedWebsites.includes(website.id)
                          ? `${website.color} border-2 border-blue-500`
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {website.name}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {selectedWebsites.length > 0 
                    ? `Selected: ${selectedWebsites.map(w => websites.find(ws => ws.id === w)?.name).join(', ')}`
                    : 'No websites selected'}
                  {selectedWebsites.includes('cleartitle') && selectedWebsites.includes('saimr') && ' → Will save as "Both Websites"'}
                </p>
              </div>

              {/* Action Selection */}
              <div>
                <label className="block mb-2 font-medium text-gray-900">Action Type:</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="assign"
                      checked={action === 'assign'}
                      onChange={(e) => setAction(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2">Add to websites</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="remove"
                      checked={action === 'remove'}
                      onChange={(e) => setAction(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2">Remove from websites</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="action"
                      value="replace"
                      checked={action === 'replace'}
                      onChange={(e) => setAction(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2">Replace websites</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAssign}
                disabled={loading || selectedWebsites.length === 0}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center shadow-md"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Apply {action} to {selectedProperties.length} Properties
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">All Properties ({properties.length})</h3>
          <div className="text-sm text-gray-600">
            Click checkboxes to select multiple properties
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={properties.length > 0 && selectedProperties.length === properties.length}
                      onChange={selectAllProperties}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 font-medium text-gray-700">Select All</span>
                  </div>
                </th>
                <th className="p-4 text-left font-medium text-gray-700">Property Details</th>
                <th className="p-4 text-left font-medium text-gray-700">City</th>
                <th className="p-4 text-left font-medium text-gray-700">Category</th>
                <th className="p-4 text-left font-medium text-gray-700">Price</th>
                <th className="p-4 text-left font-medium text-gray-700">Website Assignment</th>
                <th className="p-4 text-left font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(property => (
                <tr 
                  key={property._id} 
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property._id)}
                      onChange={() => togglePropertySelection(property._id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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
                    {typeof property.price === 'number' 
                      ? `₹${property.price.toLocaleString()}`
                      : property.price}
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      {getWebsiteBadges(property)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.approvalStatus === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : property.approvalStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {property.approvalStatus.charAt(0).toUpperCase() + property.approvalStatus.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {properties.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">No properties found</p>
              <p className="mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}
          
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How to Use
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use search and filter to find properties</li>
          <li>• Select properties using checkboxes</li>
          <li>• Choose websites (ClearTitle, SAIMR, or Both)</li>
          <li>• Select action: Add, Remove, or Replace</li>
          <li>• Click "Apply" to save changes</li>
          <li>• Changes take effect immediately on websites</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminWebsiteAssignment;