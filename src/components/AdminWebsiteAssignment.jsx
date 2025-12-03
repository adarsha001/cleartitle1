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

  const websites = [
    { id: 'cleartitle', name: 'ClearTitle (Parent)', color: 'bg-blue-100 text-blue-800' },
    { id: 'saimr', name: 'SAIMR (Child)', color: 'bg-green-100 text-green-800' }
  ];

  // Fetch properties
  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await getPropertiesForAdmin({ search });
      if (response.data.success) {
        setProperties(response.data.properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      alert('Error fetching properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search]);

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
    setSelectedWebsites(prev =>
      prev.includes(websiteId)
        ? prev.filter(id => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  // Select all properties
  const selectAllProperties = () => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p._id));
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

    if (!action) {
      alert('Please select an action (Assign/Remove/Replace)');
      return;
    }

    setLoading(true);
    try {
      const response = await assignPropertiesToWebsites({
        propertyIds: selectedProperties,
        websites: selectedWebsites,
        action: action
      });

      if (response.data.success) {
        alert(`✅ ${response.data.message}`);
        // Refresh properties
        fetchProperties();
        // Clear selections
        setSelectedProperties([]);
        setSelectedWebsites([]);
      }
    } catch (error) {
      console.error('Error assigning properties:', error);
      alert(error.response?.data?.message || 'Error assigning properties');
    } finally {
      setLoading(false);
    }
  };

  // Get website badges
  const getWebsiteBadges = (property) => {
    return websites.map(website => {
      const isAssigned = property.websiteAssignment?.includes(website.id) || 
                        (website.id === 'cleartitle' && property.visibleOnCleartitle) ||
                        (website.id === 'saimr' && property.visibleOnSaimr);
      
      return isAssigned ? (
        <span key={website.id} className={`px-2 py-1 rounded text-xs ${website.color}`}>
          {website.name}
        </span>
      ) : null;
    }).filter(Boolean);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Website Assignment Management</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search properties by title, city, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Control Panel */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Bulk Actions</h3>
        
        {/* Website Selection */}
        <div className="mb-4">
          <label className="block mb-2">Select Websites:</label>
          <div className="flex gap-2 mb-3">
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
              Assign (Add to websites)
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
              Remove (Remove from websites)
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
              Replace (Set exact websites)
            </label>
          </div>
        </div>

        {/* Selected Count and Apply Button */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {selectedProperties.length} properties selected
            </p>
            <p className="text-sm text-gray-600">
              Websites: {selectedWebsites.map(w => websites.find(ws => ws.id === w)?.name).join(', ') || 'None'}
            </p>
          </div>
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
                  {typeof property.price === 'number' 
                    ? `₹${property.price.toLocaleString()}`
                    : property.price}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {getWebsiteBadges(property)}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    property.approvalStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : property.approvalStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
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
    </div>
  );
};

export default AdminWebsiteAssignment;