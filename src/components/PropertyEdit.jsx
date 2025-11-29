import React, { useState, useEffect } from 'react';
import { getsPropertyById, updateProperty } from './../api/adminApi';

const PropertyEdit = ({ propertyId, onClose, onUpdate }) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    city: '',
    propertyLocation: '',
    price: '',
    category: '',
    forSale: true,
    isFeatured: false,
    isVerified: false,
    approvalStatus: 'pending',
    displayOrder: 0,
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

  // Debug form data changes
  useEffect(() => {
    console.log('🔄 Form data updated:', formData);
  }, [formData]);

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      console.log('📥 Loading property with ID:', propertyId);
      
      const response = await getsPropertyById(propertyId);
      
      if (response.data.success) {
        const foundProperty = response.data.property;
        console.log('✅ Property loaded successfully:', {
          title: foundProperty.title,
          category: foundProperty.category,
          price: foundProperty.price,
          hasAttributes: !!foundProperty.attributes,
          hasNearby: !!foundProperty.nearby
        });
        setProperty(foundProperty);
        initializeFormData(foundProperty);
      } else {
        throw new Error(response.data.message || 'Failed to load property');
      }
    } catch (error) {
      console.error('❌ Error loading property:', error);
      alert('Error loading property details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (propertyData) => {
    // Ensure nested objects exist
    const attributes = propertyData.attributes || {};
    const nearby = propertyData.nearby || {};
    
    const initialFormData = {
      title: propertyData.title || '',
      description: propertyData.description || '',
      content: propertyData.content || '',
      city: propertyData.city || '',
      propertyLocation: propertyData.propertyLocation || '',
      price: propertyData.price || '',
      category: propertyData.category || '',
      forSale: propertyData.forSale !== undefined ? propertyData.forSale : true,
      isFeatured: propertyData.isFeatured || false,
      isVerified: propertyData.isVerified || false,
      approvalStatus: propertyData.approvalStatus || 'pending',
      displayOrder: propertyData.displayOrder || 0,
      attributes: {
        square: attributes.square || '',
        propertyLabel: attributes.propertyLabel || '',
        leaseDuration: attributes.leaseDuration || '',
        typeOfJV: attributes.typeOfJV || '',
        expectedROI: attributes.expectedROI || '',
        irrigationAvailable: attributes.irrigationAvailable || false,
        facing: attributes.facing || '',
        roadWidth: attributes.roadWidth || '',
        waterSource: attributes.waterSource || '',
        soilType: attributes.soilType || '',
        legalClearance: attributes.legalClearance || false
      },
      features: Array.isArray(propertyData.features) ? propertyData.features : [],
      nearby: {
        Highway: nearby.Highway || '',
        Airport: nearby.Airport || '',
        BusStop: nearby.BusStop || '',
        Metro: nearby.Metro || '',
        CityCenter: nearby.CityCenter || '',
        IndustrialArea: nearby.IndustrialArea || ''
      }
    };
    
    setFormData(initialFormData);
    
    console.log('📝 Form data initialized:', {
      category: propertyData.category,
      price: initialFormData.price,
      attributes: initialFormData.attributes,
      features: initialFormData.features,
      nearby: initialFormData.nearby
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAttributeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleNearbyChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nearby: {
        ...prev.nearby,
        [name]: value
      }
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

  const cleanFormData = (data) => {
    // Create a deep copy
    const cleanedData = JSON.parse(JSON.stringify(data));
    
    // Keep price exactly as entered - no conversion
    // Only ensure it's a string
    if (typeof cleanedData.price !== 'string') {
      cleanedData.price = String(cleanedData.price || '');
    }
    
    // Basic field cleaning
    cleanedData.displayOrder = data.displayOrder === '' ? 0 : Number(data.displayOrder);
    
    // Ensure attributes object exists
    cleanedData.attributes = cleanedData.attributes || {};
    
    // Clean individual attributes - convert empty strings to undefined
    const attributeFields = [
      'square', 'propertyLabel', 'leaseDuration', 'typeOfJV', 
      'facing', 'roadWidth', 'waterSource', 'soilType'
    ];
    
    attributeFields.forEach(field => {
      if (cleanedData.attributes[field] === '') {
        cleanedData.attributes[field] = undefined;
      }
    });
    
    // Handle numeric fields for expectedROI - keep as string if it contains text
    if (cleanedData.attributes.expectedROI === '') {
      cleanedData.attributes.expectedROI = undefined;
    }
    
    // Handle acre field conversion - keep as string if it contains text
    if (cleanedData.attributes.square) {
      // Only convert to number if it's purely numeric
      if (!isNaN(cleanedData.attributes.square) && cleanedData.attributes.square !== '') {
        cleanedData.attributes.square = Number(cleanedData.attributes.square);
      }
      // Otherwise keep as string (e.g., "5 acres", "10 hectares")
    }
    
    // Handle boolean fields
    cleanedData.attributes.irrigationAvailable = Boolean(cleanedData.attributes.irrigationAvailable);
    cleanedData.attributes.legalClearance = Boolean(cleanedData.attributes.legalClearance);

    // CRITICAL: Ensure typeOfJV for JD/JV properties
    if (cleanedData.category === 'JD/JV') {
      cleanedData.attributes.typeOfJV = cleanedData.attributes.typeOfJV || 'General Partnership';
    }

    // Clean nearby distances - convert to numbers if they are numeric
    cleanedData.nearby = {};
    Object.entries(data.nearby).forEach(([key, value]) => {
      if (value === '' || value === undefined) {
        cleanedData.nearby[key] = undefined;
      } else if (!isNaN(value) && value !== '') {
        cleanedData.nearby[key] = Number(value);
      } else {
        cleanedData.nearby[key] = value; // Keep as string if not numeric
      }
    });

    // Clean features array
    if (!Array.isArray(cleanedData.features)) {
      cleanedData.features = [];
    }

    console.log('🧹 Final cleaned data:', {
      category: cleanedData.category,
      price: cleanedData.price,
      priceType: typeof cleanedData.price,
      attributes: cleanedData.attributes,
      nearby: cleanedData.nearby,
      features: cleanedData.features
    });

    return cleanedData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const cleanedData = cleanFormData(formData);
      console.log('📤 Sending update data:', cleanedData);
      
      const response = await updateProperty(propertyId, cleanedData);
      
      if (response.data.success) {
        console.log('✅ Property updated successfully:', response.data.property);
        alert('Property updated successfully!');
        onUpdate?.();
        onClose?.();
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      
      // Show specific error messages
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join('\n');
        alert(`Update failed:\n${errorMessages}`);
      } else {
        alert(`Error updating property: ${error.message}`);
      }
    } finally {
      setSaving(false);
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

  const getCurrentFeatures = () => {
    return featureOptions[formData.category] || [];
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Property</h2>
            <p className="text-sm text-gray-600 mt-1">
              {property ? `${property.title} - ${property.city}` : 'Loading property...'}
            </p>
            <p className="text-xs text-gray-500">ID: {propertyId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            disabled={saving}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <Section title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Property Title *"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter property title"
                />
                
                <FormField
                  label="Category *"
                  name="category"
                  type="select"
                  value={formData.category}
                  onChange={handleInputChange}
                  options={[
                    { value: '', label: 'Select Category' },
                    { value: 'Commercial', label: 'Commercial' },
                    { value: 'Farmland', label: 'Farmland' },
                    { value: 'Outright', label: 'Outright' },
                    { value: 'JD/JV', label: 'JD/JV' }
                  ]}
                  required
                />

                <FormField
                  label="City *"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter city"
                />

                <FormField
                  label="Price *"
                  name="price"
                  type="text"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 30 Crore, 50 Lakh, $1.5 Million"
                />

                <div className="md:col-span-2">
                  <FormField
                    label="Description"
                    name="description"
                    type="textarea"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter property description"
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    label="Full Address"
                    name="propertyLocation"
                    type="text"
                    value={formData.propertyLocation}
                    onChange={handleInputChange}
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            </Section>

            {/* Property Attributes Section */}
            <Section title="Property Attributes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Area/Size"
                  name="square"
                  type="text"
                  value={formData.attributes.square}
                  onChange={handleAttributeChange}
                  placeholder="e.g., 5 acres, 10 hectares, 2000 sq ft"
                />

                <FormField
                  label="Property Label"
                  name="propertyLabel"
                  type="text"
                  value={formData.attributes.propertyLabel}
                  onChange={handleAttributeChange}
                  placeholder="e.g., Premium, Budget, Luxury"
                />

                {formData.category === 'JD/JV' && (
                  <div className="md:col-span-2">
                    <FormField
                      label="Type of JV *"
                      name="typeOfJV"
                      type="text"
                      value={formData.attributes.typeOfJV}
                      onChange={handleAttributeChange}
                      required
                      placeholder="e.g., General Partnership, LLC, Joint Development"
                    />
                  </div>
                )}

                {(formData.category === 'Commercial' || formData.category === 'JD/JV') && (
                  <FormField
                    label="Expected ROI (%)"
                    name="expectedROI"
                    type="number"
                    step="0.1"
                    value={formData.attributes.expectedROI}
                    onChange={handleAttributeChange}
                    placeholder="Expected return on investment percentage"
                  />
                )}

                {formData.category === 'Farmland' && (
                  <>
                    <FormField
                      label="Soil Type"
                      name="soilType"
                      type="text"
                      value={formData.attributes.soilType}
                      onChange={handleAttributeChange}
                      placeholder="e.g., Loamy, Clay, Sandy, Black Soil"
                    />
                    <CheckboxField
                      label="Irrigation Available"
                      name="irrigationAvailable"
                      checked={formData.attributes.irrigationAvailable}
                      onChange={handleAttributeChange}
                    />
                  </>
                )}

                {(formData.category === 'Outright' || formData.category === 'JD/JV') && (
                  <CheckboxField
                    label="Legal Clearance"
                    name="legalClearance"
                    checked={formData.attributes.legalClearance}
                    onChange={handleAttributeChange}
                  />
                )}

                <FormField
                  label="Facing Direction"
                  name="facing"
                  type="text"
                  value={formData.attributes.facing}
                  onChange={handleAttributeChange}
                  placeholder="e.g., East, North, Road-facing"
                />

                <FormField
                  label="Road Width"
                  name="roadWidth"
                  type="text"
                  value={formData.attributes.roadWidth}
                  onChange={handleAttributeChange}
                  placeholder="e.g., 40 ft, 60 ft, Wide Road"
                />

                <FormField
                  label="Water Source"
                  name="waterSource"
                  type="text"
                  value={formData.attributes.waterSource}
                  onChange={handleAttributeChange}
                  placeholder="e.g., Municipal, Borewell, Canal, Well"
                />

                <FormField
                  label="Lease Duration"
                  name="leaseDuration"
                  type="text"
                  value={formData.attributes.leaseDuration}
                  onChange={handleAttributeChange}
                  placeholder="e.g., 5 years, 10 years, 99 years"
                />
              </div>
            </Section>

            {/* Features Section */}
            <Section title="Features">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getCurrentFeatures().map(feature => (
                  <CheckboxField
                    key={feature}
                    label={feature}
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                  />
                ))}
              </div>
              {getCurrentFeatures().length === 0 && (
                <p className="text-gray-500 text-sm">No features available for {formData.category} category</p>
              )}
            </Section>

            {/* Nearby Locations Section */}
            <Section title="Nearby Locations">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(formData.nearby).map(([key, value]) => (
                  <FormField
                    key={key}
                    label={`${key} Distance`}
                    name={key}
                    type="text"
                    value={value}
                    onChange={handleNearbyChange}
                    placeholder={`e.g., 5 km, 2 miles, Nearby`}
                  />
                ))}
              </div>
            </Section>

            {/* Admin Controls Section */}
            <Section title="Admin Controls">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Approval Status"
                  name="approvalStatus"
                  type="select"
                  value={formData.approvalStatus}
                  onChange={handleInputChange}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' }
                  ]}
                />

                <FormField
                  label="Display Order"
                  name="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  placeholder="Lower numbers show first"
                />

                <div className="flex flex-col space-y-3">
                  <CheckboxField
                    label="Featured Property"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  <CheckboxField
                    label="Verified Property"
                    name="isVerified"
                    checked={formData.isVerified}
                    onChange={handleInputChange}
                  />
                  <CheckboxField
                    label="For Sale"
                    name="forSale"
                    checked={formData.forSale}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </Section>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{saving ? 'Saving...' : 'Update Property'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reusable Section Component
const Section = ({ title, children }) => (
  <div className="border-t border-gray-200 pt-6 first:border-t-0 first:pt-0">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

// Reusable Form Field Component
const FormField = ({ label, name, type = 'text', value, onChange, options = [], required = false, placeholder, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {type === 'select' ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required={required}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={props.rows || 3}
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required={required}
        placeholder={placeholder}
        {...props}
      />
    )}
  </div>
);

// Reusable Checkbox Component
const CheckboxField = ({ label, name, checked, onChange }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label className="ml-2 block text-sm text-gray-700">
      {label}
    </label>
  </div>
);

export default PropertyEdit;