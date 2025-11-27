import React, { useState, useEffect } from 'react';

const PropertyForm = ({ property, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    images: [],
    city: '',
    propertyLocation: '',
    coordinates: { latitude: '', longitude: '' },
    price: '',
    mapUrl: '',
    category: 'Commercial',
    approvalStatus: 'approved',
    displayOrder: 0,
    forSale: true,
    isFeatured: false,
    isVerified: false,
    rejectionReason: '',
    agentDetails: {
      name: '',
      phoneNumber: '',
      alternateNumber: '',
      email: '',
      company: '',
      designation: ''
    },
    attributes: {
      square: '',
      propertyLabel: '',
      leaseDuration: '',
      typeOfJV: '',
      expectedROI: '',
      irrigationAvailable: false,
      facing: '',
      roadWidth: '',
      waterSource: '',
      soilType: '',
      legalClearance: false
    },
    distanceKey: [],
    features: [],
    nearby: {
      Highway: '',
      Airport: '',
      BusStop: '',
      Metro: '',
      CityCenter: '',
      IndustrialArea: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [currentDistance, setCurrentDistance] = useState('');

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        content: property.content || '',
        images: property.images || [],
        city: property.city || '',
        propertyLocation: property.propertyLocation || '',
        coordinates: property.coordinates || { latitude: '', longitude: '' },
        price: property.price || '',
        mapUrl: property.mapUrl || '',
        category: property.category || 'Commercial',
        approvalStatus: property.approvalStatus || 'approved',
        displayOrder: property.displayOrder || 0,
        forSale: property.forSale !== undefined ? property.forSale : true,
        isFeatured: property.isFeatured || false,
        isVerified: property.isVerified || false,
        rejectionReason: property.rejectionReason || '',
        agentDetails: property.agentDetails || {
          name: '',
          phoneNumber: '',
          alternateNumber: '',
          email: '',
          company: '',
          designation: ''
        },
        attributes: property.attributes || {
          square: '',
          propertyLabel: '',
          leaseDuration: '',
          typeOfJV: '',
          expectedROI: '',
          irrigationAvailable: false,
          facing: '',
          roadWidth: '',
          waterSource: '',
          soilType: '',
          legalClearance: false
        },
        distanceKey: property.distanceKey || [],
        features: property.features || [],
        nearby: property.nearby || {
          Highway: '',
          Airport: '',
          BusStop: '',
          Metro: '',
          CityCenter: '',
          IndustrialArea: ''
        }
      });
    }
  }, [property]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('agent.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        agentDetails: {
          ...prev.agentDetails,
          [field]: value
        }
      }));
    } else if (name.startsWith('attributes.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('nearby.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        nearby: {
          ...prev.nearby,
          [field]: value
        }
      }));
    } else if (name.startsWith('coordinates.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddDistance = () => {
    if (currentDistance.trim()) {
      setFormData(prev => ({
        ...prev,
        distanceKey: [...prev.distanceKey, currentDistance.trim()]
      }));
      setCurrentDistance('');
    }
  };

  const handleRemoveDistance = (index) => {
    setFormData(prev => ({
      ...prev,
      distanceKey: prev.distanceKey.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert string values to appropriate types
      const submitData = {
        ...formData,
        price: Number(formData.price) || formData.price,
        displayOrder: Number(formData.displayOrder),
        coordinates: {
          latitude: Number(formData.coordinates.latitude) || null,
          longitude: Number(formData.coordinates.longitude) || null
        },
        attributes: {
          ...formData.attributes,
          expectedROI: Number(formData.attributes.expectedROI) || null,
          roadWidth: Number(formData.attributes.roadWidth) || null
        },
        nearby: Object.fromEntries(
          Object.entries(formData.nearby).map(([key, value]) => [
            key, 
            value ? Number(value) : null
          ])
        )
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const featureOptions = {
    Commercial: [
      "Conference Room", "CCTV Surveillance", "Power Backup", "Fire Safety",
      "Cafeteria", "Reception Area", "Parking", "Lift(s)"
    ],
    Farmland: [
      "Borewell", "Fencing", "Electricity Connection", "Water Source",
      "Drip Irrigation", "Storage Shed"
    ],
    Outright: [
      "Highway Access", "Legal Assistance", "Joint Development Approved",
      "Investor Friendly", "Gated Boundary"
    ],
    "JD/JV": [
      "Highway Access", "Legal Assistance", "Joint Development Approved",
      "Investor Friendly", "Gated Boundary"
    ]
  };

  const currentFeatures = featureOptions[formData.category] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {property ? 'Edit Property' : 'Add New Property'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Commercial">Commercial</option>
                <option value="Outright">Outright</option>
                <option value="Farmland">Farmland</option>
                <option value="JD/JV">JD/JV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5000000 or 'Contact for Price'"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Location *
            </label>
            <input
              type="text"
              name="propertyLocation"
              value={formData.propertyLocation}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="text"
                name="coordinates.latitude"
                value={formData.coordinates.latitude}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="text"
                name="coordinates.longitude"
                value={formData.coordinates.longitude}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Agent Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name
                </label>
                <input
                  type="text"
                  name="agent.name"
                  value={formData.agentDetails.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="agent.phoneNumber"
                  value={formData.agentDetails.phoneNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternate Number
                </label>
                <input
                  type="text"
                  name="agent.alternateNumber"
                  value={formData.agentDetails.alternateNumber}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="agent.email"
                  value={formData.agentDetails.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="agent.company"
                  value={formData.agentDetails.company}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="agent.designation"
                  value={formData.agentDetails.designation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Property Attributes */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Area
                </label>
                <input
                  type="text"
                  name="attributes.square"
                  value={formData.attributes.square}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Label
                </label>
                <input
                  type="text"
                  name="attributes.propertyLabel"
                  value={formData.attributes.propertyLabel}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facing
                </label>
                <input
                  type="text"
                  name="attributes.facing"
                  value={formData.attributes.facing}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Road Width (ft)
                </label>
                <input
                  type="number"
                  name="attributes.roadWidth"
                  value={formData.attributes.roadWidth}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {formData.category === 'Farmland' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Water Source
                    </label>
                    <input
                      type="text"
                      name="attributes.waterSource"
                      value={formData.attributes.waterSource}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soil Type
                    </label>
                    <input
                      type="text"
                      name="attributes.soilType"
                      value={formData.attributes.soilType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {formData.category === 'JD/JV' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of JV
                  </label>
                  <input
                    type="text"
                    name="attributes.typeOfJV"
                    value={formData.attributes.typeOfJV}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="attributes.irrigationAvailable"
                  checked={formData.attributes.irrigationAvailable}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Irrigation Available
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="attributes.legalClearance"
                  checked={formData.attributes.legalClearance}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Legal Clearance
                </label>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {currentFeatures.map(feature => (
                <label key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nearby Locations */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nearby Locations (km)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(formData.nearby).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {key}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name={`nearby.${key}`}
                    value={value}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Fields */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Featured Property
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={formData.isVerified}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Verified Property
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="forSale"
                    checked={formData.forSale}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    For Sale
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t pt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (property ? 'Update Property' : 'Create Property')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;