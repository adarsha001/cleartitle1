import React, { useState, useEffect } from 'react';

const PropertyUnitEdit = ({ property, onSubmit, onCancel }) => {
  const isEditing = !!property;
  
const [formData, setFormData] = useState({
  // Basic Information
  title: '',
  description: '',
  unitNumber: '',
  
  // Property Type
  propertyType: 'Apartment',
  listingType: 'sale',
  
  // Location
  city: '',
  address: '',
  area: '',
  mapUrl: '',
  coordinates: {
    latitude: '',
    longitude: ''
  },
  
  // Price - BACKEND EXPECTS STRING AMOUNT
  price: {
    amount: '', // String as per backend
    currency: 'INR',
    perUnit: 'total'
  },
  maintenanceCharges: 0, // Changed from '' to 0 for number
  securityDeposit: 0, // Changed from '' to 0 for number
  
  // Specifications - match backend defaults
  specifications: {
    bedrooms: 0, // Changed from '' to 0
    bathrooms: 0, // Changed from '' to 0
    balconies: 0, // Changed from '' to 0
    floors: 1, // Changed from '' to 1
    floorNumber: '',
    carpetArea: 0, // Changed from '' to 0
    builtUpArea: 0, // Changed from '' to 0
    superBuiltUpArea: '',
    plotArea: '',
    furnishing: 'unfurnished',
    possessionStatus: 'ready-to-move',
    ageOfProperty: '',
    parking: {
      covered: 0, // Changed from '' to 0
      open: 0 // Changed from '' to 0
    },
    kitchenType: 'regular'
  },
  
  // Building Details
  buildingDetails: {
    name: '',
    totalFloors: '',
    totalUnits: '',
    yearBuilt: '',
    amenities: []
  },
  
  // Unit Features
  unitFeatures: [],
  
  // Rental Details - match backend structure
  rentalDetails: {
    availableForRent: false,
    leaseDuration: { value: 11, unit: 'months' },
    rentNegotiable: true,
    preferredTenants: ['any'],
    includedInRent: []
  },
  
  // Status
  availability: 'available',
  isFeatured: false,
  isVerified: false,
  approvalStatus: 'pending',
  rejectionReason: '',
  
  // Virtual Tour
  virtualTour: '',
  
  // Floor Plan
  floorPlan: {
    image: '',
    description: ''
  },
  
  // Owner Details
  ownerDetails: {
    name: '',
    phoneNumber: '',
    email: '',
    reasonForSelling: ''
  },
  
  // Legal Details
  legalDetails: {
    ownershipType: 'freehold',
    reraRegistered: false,
    reraNumber: '',
    khataCertificate: false,
    encumbranceCertificate: false,
    occupancyCertificate: false
  },
  
  // Contact Preference
  contactPreference: ['call', 'whatsapp'],
  
  // Viewing Schedule
  viewingSchedule: [],
  
  // Website Assignment
  websiteAssignment: ['cleartitle'],
  
  // SEO
  metaTitle: '',
  metaDescription: '',
  displayOrder: 0,
  
  // Images
  images: []
});

  const [newImages, setNewImages] = useState([]);
  const [newFloorPlan, setNewFloorPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unitFeatureInput, setUnitFeatureInput] = useState('');
  const [buildingAmenityInput, setBuildingAmenityInput] = useState('');
  const [includedInRentInput, setIncludedInRentInput] = useState('');
  const [viewingSlot, setViewingSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    slotsAvailable: 1
  });

  // Available options
  const propertyTypes = [
    'Apartment', 'Villa', 'Independent House', 'Studio', 
    'Penthouse', 'Duplex', 'Row House', 'Plot', 'Commercial Space'
  ];

  const listingTypes = [
    { value: 'sale', label: 'For Sale' },
    { value: 'rent', label: 'For Rent' },
    { value: 'lease', label: 'For Lease' },
    { value: 'pg', label: 'PG' }
  ];

  const furnishingOptions = [
    { value: 'unfurnished', label: 'Unfurnished' },
    { value: 'semi-furnished', label: 'Semi-Furnished' },
    { value: 'fully-furnished', label: 'Fully Furnished' }
  ];

  const possessionOptions = [
    { value: 'ready-to-move', label: 'Ready to Move' },
    { value: 'under-construction', label: 'Under Construction' },
    { value: 'resale', label: 'Resale' }
  ];

  const kitchenTypes = [
    { value: 'modular', label: 'Modular' },
    { value: 'regular', label: 'Regular' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'none', label: 'None' }
  ];

  const availabilityOptions = [
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' },
    { value: 'rented', label: 'Rented' },
    { value: 'under-agreement', label: 'Under Agreement' },
    { value: 'hold', label: 'Hold' }
  ];

  const ownershipTypes = [
    { value: 'freehold', label: 'Freehold' },
    { value: 'leasehold', label: 'Leasehold' },
    { value: 'cooperative', label: 'Cooperative' },
    { value: 'power-of-attorney', label: 'Power of Attorney' }
  ];

  const tenantTypes = [
    { value: 'family', label: 'Family' },
    { value: 'bachelors', label: 'Bachelors' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'students', label: 'Students' },
    { value: 'any', label: 'Any' }
  ];

  const contactOptions = [
    { value: 'call', label: 'Phone Call' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
    { value: 'message', label: 'Message' }
  ];

  const websiteOptions = [
    { value: 'cleartitle', label: 'ClearTitle' },
    { value: 'partner1', label: 'Partner Site 1' },
    { value: 'partner2', label: 'Partner Site 2' }
  ];

  const unitFeatureOptions = [
    'Air Conditioning', 'Modular Kitchen', 'Wardrobes', 'Geyser',
    'Exhaust Fan', 'Chimney', 'Lighting', 'Ceiling Fans',
    'Smart Home Automation', 'Central AC', 'Jacuzzi', 'Walk-in Closet',
    'Study Room', 'Pooja Room', 'Utility Area', 'Servant Room',
    'Private Garden', 'Terrace', 'Balcony', 'Swimming Pool',
    'Video Door Phone', 'Security Alarm', 'Fire Safety', 'CCTV',
    'Pet Friendly', 'Wheelchair Access', 'Natural Light', 'View'
  ];

  const approvalStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

 useEffect(() => {
  if (property) {
    // Convert number fields to ensure proper types
    const propertyData = { ...property };
    
    // Ensure price.amount is string
    if (propertyData.price && typeof propertyData.price.amount !== 'string') {
      propertyData.price.amount = propertyData.price.amount.toString();
    }
    
    // Ensure number fields are numbers, not strings
    const ensureNumber = (value) => {
      if (value === '' || value === null || value === undefined) return 0;
      return Number(value);
    };

    setFormData({
      // Basic Information
      title: propertyData.title || '',
      description: propertyData.description || '',
      unitNumber: propertyData.unitNumber || '',
      propertyType: propertyData.propertyType || 'Apartment',
      listingType: propertyData.listingType || 'sale',
      city: propertyData.city || '',
      address: propertyData.address || '',
      area: propertyData.area || '',
      mapUrl: propertyData.mapUrl || '',
      coordinates: propertyData.coordinates || { latitude: '', longitude: '' },
      
      // Price
      price: propertyData.price || { amount: '', currency: 'INR', perUnit: 'total' },
      maintenanceCharges: ensureNumber(propertyData.maintenanceCharges),
      securityDeposit: ensureNumber(propertyData.securityDeposit),
      
      // Specifications
      specifications: {
        bedrooms: ensureNumber(propertyData.specifications?.bedrooms),
        bathrooms: ensureNumber(propertyData.specifications?.bathrooms),
        balconies: ensureNumber(propertyData.specifications?.balconies),
        floors: ensureNumber(propertyData.specifications?.floors) || 1,
        floorNumber: propertyData.specifications?.floorNumber || '',
        carpetArea: ensureNumber(propertyData.specifications?.carpetArea),
        builtUpArea: ensureNumber(propertyData.specifications?.builtUpArea),
        superBuiltUpArea: propertyData.specifications?.superBuiltUpArea || '',
        plotArea: propertyData.specifications?.plotArea || '',
        furnishing: propertyData.specifications?.furnishing || 'unfurnished',
        possessionStatus: propertyData.specifications?.possessionStatus || 'ready-to-move',
        ageOfProperty: propertyData.specifications?.ageOfProperty || '',
        parking: {
          covered: ensureNumber(propertyData.specifications?.parking?.covered),
          open: ensureNumber(propertyData.specifications?.parking?.open)
        },
        kitchenType: propertyData.specifications?.kitchenType || 'regular'
      },
      
      // Other fields remain the same...
      buildingDetails: propertyData.buildingDetails || {
        name: '',
        totalFloors: '',
        totalUnits: '',
        yearBuilt: '',
        amenities: []
      },
      unitFeatures: propertyData.unitFeatures || [],
      rentalDetails: propertyData.rentalDetails || {
        availableForRent: false,
        leaseDuration: { value: 11, unit: 'months' },
        rentNegotiable: true,
        preferredTenants: ['any'],
        includedInRent: []
      },
      availability: propertyData.availability || 'available',
      isFeatured: propertyData.isFeatured || false,
      isVerified: propertyData.isVerified || false,
      approvalStatus: propertyData.approvalStatus || 'pending',
      rejectionReason: propertyData.rejectionReason || '',
      virtualTour: propertyData.virtualTour || '',
      floorPlan: propertyData.floorPlan || { image: '', description: '' },
      ownerDetails: propertyData.ownerDetails || {
        name: '',
        phoneNumber: '',
        email: '',
        reasonForSelling: ''
      },
      legalDetails: propertyData.legalDetails || {
        ownershipType: 'freehold',
        reraRegistered: false,
        reraNumber: '',
        khataCertificate: false,
        encumbranceCertificate: false,
        occupancyCertificate: false
      },
      contactPreference: propertyData.contactPreference || ['call', 'whatsapp'],
      viewingSchedule: propertyData.viewingSchedule || [],
      websiteAssignment: propertyData.websiteAssignment || ['cleartitle'],
      metaTitle: propertyData.metaTitle || '',
      metaDescription: propertyData.metaDescription || '',
      displayOrder: propertyData.displayOrder || 0,
      images: propertyData.images || []
    });
  }
}, [property]);

const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  if (name.includes('.')) {
    const [parent, child] = name.split('.');
    
    // Handle deeply nested objects (e.g., specifications.parking.covered)
    if (parent.includes('.')) {
      const [grandParent, middle] = parent.split('.');
      setFormData(prev => ({
        ...prev,
        [grandParent]: {
          ...prev[grandParent],
          [middle]: {
            ...prev[grandParent][middle],
            [child]: type === 'number' ? Number(value) || 0 : value
          }
        }
      }));
    } else {
      // Handle price.amount separately to keep as string
      if (parent === 'price' && child === 'amount') {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value // Keep as string
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'number' ? Number(value) || 0 : value
          }
        }));
      }
    }
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               type === 'number' ? Number(value) || 0 : 
               value
    }));
  }
};

// Keep price amount as string
const handlePriceAmountChange = (e) => {
  const { value } = e.target;
  setFormData(prev => ({
    ...prev,
    price: {
      ...prev.price,
      amount: value // Keep as string
    }
  }));
};



  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setNewImages(prev => [...prev, ...newImageFiles]);
  };

  const handleFloorPlanUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFloorPlan({
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const addUnitFeature = (feature) => {
    if (!formData.unitFeatures.includes(feature)) {
      setFormData(prev => ({
        ...prev,
        unitFeatures: [...prev.unitFeatures, feature]
      }));
    }
  };

  const removeUnitFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      unitFeatures: prev.unitFeatures.filter(f => f !== feature)
    }));
  };

  const addBuildingAmenity = () => {
    if (buildingAmenityInput.trim() && !formData.buildingDetails.amenities.includes(buildingAmenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        buildingDetails: {
          ...prev.buildingDetails,
          amenities: [...prev.buildingDetails.amenities, buildingAmenityInput.trim()]
        }
      }));
      setBuildingAmenityInput('');
    }
  };

  const removeBuildingAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      buildingDetails: {
        ...prev.buildingDetails,
        amenities: prev.buildingDetails.amenities.filter(a => a !== amenity)
      }
    }));
  };

  const addIncludedInRent = () => {
    if (includedInRentInput.trim() && !formData.rentalDetails.includedInRent.includes(includedInRentInput.trim())) {
      setFormData(prev => ({
        ...prev,
        rentalDetails: {
          ...prev.rentalDetails,
          includedInRent: [...prev.rentalDetails.includedInRent, includedInRentInput.trim()]
        }
      }));
      setIncludedInRentInput('');
    }
  };

  const removeIncludedInRent = (item) => {
    setFormData(prev => ({
      ...prev,
      rentalDetails: {
        ...prev.rentalDetails,
        includedInRent: prev.rentalDetails.includedInRent.filter(i => i !== item)
      }
    }));
  };

  const addViewingSlot = () => {
    if (viewingSlot.date && viewingSlot.startTime && viewingSlot.endTime) {
      setFormData(prev => ({
        ...prev,
        viewingSchedule: [...prev.viewingSchedule, { ...viewingSlot }]
      }));
      setViewingSlot({
        date: '',
        startTime: '',
        endTime: '',
        slotsAvailable: 1
      });
    }
  };

  const removeViewingSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      viewingSchedule: prev.viewingSchedule.filter((_, i) => i !== index)
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const formDataToSubmit = new FormData();
    
    // 1. Basic Information
    formDataToSubmit.append('title', formData.title);
    formDataToSubmit.append('description', formData.description);
    formDataToSubmit.append('unitNumber', formData.unitNumber);
    formDataToSubmit.append('propertyType', formData.propertyType);
    formDataToSubmit.append('listingType', formData.listingType);
    
    // 2. Location
    formDataToSubmit.append('city', formData.city);
    formDataToSubmit.append('address', formData.address);
    formDataToSubmit.append('area', formData.area);
    formDataToSubmit.append('mapUrl', formData.mapUrl || '');
    
    // 3. Coordinates
    if (formData.coordinates.latitude && formData.coordinates.longitude) {
      formDataToSubmit.append('coordinates', JSON.stringify({
        latitude: Number(formData.coordinates.latitude),
        longitude: Number(formData.coordinates.longitude)
      }));
    }
    
    // 4. Price - IMPORTANT: Backend expects amount as string
    const priceData = {
      amount: formData.price.amount.toString(), // Ensure string
      currency: formData.price.currency,
      perUnit: formData.price.perUnit
    };
    formDataToSubmit.append('price', JSON.stringify(priceData));
    
    // 5. Additional financials
    formDataToSubmit.append('maintenanceCharges', formData.maintenanceCharges.toString());
    formDataToSubmit.append('securityDeposit', formData.securityDeposit.toString());
    
    // 6. Specifications
    const specs = {
      bedrooms: Number(formData.specifications.bedrooms),
      bathrooms: Number(formData.specifications.bathrooms),
      balconies: Number(formData.specifications.balconies),
      floors: Number(formData.specifications.floors),
      floorNumber: formData.specifications.floorNumber,
      carpetArea: Number(formData.specifications.carpetArea),
      builtUpArea: Number(formData.specifications.builtUpArea),
      superBuiltUpArea: formData.specifications.superBuiltUpArea,
      plotArea: formData.specifications.plotArea,
      furnishing: formData.specifications.furnishing,
      possessionStatus: formData.specifications.possessionStatus,
      ageOfProperty: formData.specifications.ageOfProperty,
      parking: {
        covered: Number(formData.specifications.parking.covered),
        open: Number(formData.specifications.parking.open)
      },
      kitchenType: formData.specifications.kitchenType
    };
    formDataToSubmit.append('specifications', JSON.stringify(specs));
    
    // 7. Building Details
    formDataToSubmit.append('buildingDetails', JSON.stringify(formData.buildingDetails));
    
    // 8. Unit Features
    formDataToSubmit.append('unitFeatures', JSON.stringify(formData.unitFeatures));
    
    // 9. Rental Details
    formDataToSubmit.append('rentalDetails', JSON.stringify(formData.rentalDetails));
    
    // 10. Status & Admin
    formDataToSubmit.append('availability', formData.availability);
    formDataToSubmit.append('isFeatured', formData.isFeatured.toString());
    formDataToSubmit.append('isVerified', formData.isVerified.toString());
    formDataToSubmit.append('approvalStatus', formData.approvalStatus);
    if (formData.rejectionReason) {
      formDataToSubmit.append('rejectionReason', formData.rejectionReason);
    }
    
    // 11. Virtual Tour
    formDataToSubmit.append('virtualTour', formData.virtualTour || '');
    
    // 12. Floor Plan
    formDataToSubmit.append('floorPlan', JSON.stringify(formData.floorPlan));
    
    // 13. Owner Details
    formDataToSubmit.append('ownerDetails', JSON.stringify(formData.ownerDetails));
    
    // 14. Legal Details
    formDataToSubmit.append('legalDetails', JSON.stringify(formData.legalDetails));
    
    // 15. Contact Preference
    formDataToSubmit.append('contactPreference', formData.contactPreference.join(','));
    
    // 16. Viewing Schedule
    formDataToSubmit.append('viewingSchedule', JSON.stringify(formData.viewingSchedule));
    
    // 17. Website Assignment
    formDataToSubmit.append('websiteAssignment', formData.websiteAssignment.join(','));
    
    // 18. SEO
    formDataToSubmit.append('metaTitle', formData.metaTitle || '');
    formDataToSubmit.append('metaDescription', formData.metaDescription || '');
    formDataToSubmit.append('displayOrder', formData.displayOrder.toString());
    
    // 19. Images - handle existing images
    if (formData.images.length > 0) {
      const existingImageUrls = formData.images.map(img => img.url);
      formDataToSubmit.append('existingImages', JSON.stringify(existingImageUrls));
    }
    
    // 20. Add new images
    newImages.forEach(image => {
      formDataToSubmit.append('images', image.file);
    });
    
    // 21. Add floor plan image if exists
    if (newFloorPlan) {
      formDataToSubmit.append('floorPlanImage', newFloorPlan.file);
    }
    
    // 22. For admin, you might want to add admin notes or creator
    if (formData.createdBy) {
      formDataToSubmit.append('createdBy', formData.createdBy);
    }
    
    // Submit
    await onSubmit(formDataToSubmit);
    
  } catch (error) {
    console.error('Error submitting form:', error);
    // You might want to show an error message to the user
  } finally {
    setLoading(false);
  }
};
const validateForm = () => {
  const errors = [];
  
  // Required basic fields
  if (!formData.title) errors.push('Title is required');
  if (!formData.city) errors.push('City is required');
  if (!formData.address) errors.push('Address is required');
  if (!formData.price.amount) errors.push('Price amount is required');
  if (!formData.propertyType) errors.push('Property type is required');
  
  // Required specifications based on property type
  if (formData.propertyType === 'Apartment') {
    if (!formData.specifications.bedrooms) errors.push('Bedrooms is required for Apartments');
    if (!formData.specifications.bathrooms) errors.push('Bathrooms is required for Apartments');
    if (!formData.specifications.carpetArea) errors.push('Carpet area is required for Apartments');
    if (!formData.specifications.builtUpArea) errors.push('Built-up area is required for Apartments');
  }
  
  // Add more validations as needed
  
  return errors;
};
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Number
            </label>
            <input
              type="text"
              name="unitNumber"
              value={formData.unitNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Unit 101, Villa A1"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Property Type & Listing Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Type *
          </label>
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Listing Type *
          </label>
          <select
            name="listingType"
            value={formData.listingType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {listingTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area/Locality *
            </label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
   
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Map URL
            </label>
            <input
              type="text"
              name="mapUrl"
              value={formData.mapUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Google Maps embed URL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              name="coordinates.latitude"
              value={formData.coordinates.latitude}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              name="coordinates.longitude"
              value={formData.coordinates.longitude}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Price Details - String Amount */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Price Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Amount *
            </label>
       <input
  type="text" // Use text instead of number for price amount
  name="price.amount"
  value={formData.price.amount}
  onChange={handlePriceAmountChange}
  required
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  placeholder="Enter price"
/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              name="price.currency"
              value={formData.price.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Unit
            </label>
            <select
              name="price.perUnit"
              value={formData.price.perUnit}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="total">Total Price</option>
              <option value="sqft">Per Sq. Ft</option>
              <option value="month">Per Month</option>
              <option value="year">Per Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Charges (per month)
            </label>
            <input
              type="number"
              name="maintenanceCharges"
              value={formData.maintenanceCharges}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Security Deposit
            </label>
            <input
              type="number"
              name="securityDeposit"
              value={formData.securityDeposit}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms *
            </label>
            <input
              type="number"
              name="specifications.bedrooms"
              value={formData.specifications.bedrooms}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms *
            </label>
            <input
              type="number"
              name="specifications.bathrooms"
              value={formData.specifications.bathrooms}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Balconies
            </label>
            <input
              type="number"
              name="specifications.balconies"
              value={formData.specifications.balconies}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floors in Unit
            </label>
            <input
              type="number"
              name="specifications.floors"
              value={formData.specifications.floors}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Number
            </label>
            <input
              type="number"
              name="specifications.floorNumber"
              value={formData.specifications.floorNumber}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carpet Area (sq.ft) *
            </label>
            <input
              type="number"
              name="specifications.carpetArea"
              value={formData.specifications.carpetArea}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Built-up Area (sq.ft) *
            </label>
            <input
              type="number"
              name="specifications.builtUpArea"
              value={formData.specifications.builtUpArea}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Super Built-up Area (sq.ft)
            </label>
            <input
              type="number"
              name="specifications.superBuiltUpArea"
              value={formData.specifications.superBuiltUpArea}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {formData.propertyType === 'Plot' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plot Area (sq.ft)
              </label>
              <input
                type="number"
                name="specifications.plotArea"
                value={formData.specifications.plotArea}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Furnishing
            </label>
            <select
              name="specifications.furnishing"
              value={formData.specifications.furnishing}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {furnishingOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Possession Status
            </label>
            <select
              name="specifications.possessionStatus"
              value={formData.specifications.possessionStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {possessionOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age of Property (years)
            </label>
            <input
              type="number"
              name="specifications.ageOfProperty"
              value={formData.specifications.ageOfProperty}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Covered Parking
            </label>
            <input
              type="number"
              name="specifications.parking.covered"
              value={formData.specifications.parking.covered}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Open Parking
            </label>
            <input
              type="number"
              name="specifications.parking.open"
              value={formData.specifications.parking.open}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kitchen Type
            </label>
            <select
              name="specifications.kitchenType"
              value={formData.specifications.kitchenType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {kitchenTypes.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Building Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Building Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Building Name
            </label>
            <input
              type="text"
              name="buildingDetails.name"
              value={formData.buildingDetails.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Floors
            </label>
            <input
              type="number"
              name="buildingDetails.totalFloors"
              value={formData.buildingDetails.totalFloors}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Units
            </label>
            <input
              type="number"
              name="buildingDetails.totalUnits"
              value={formData.buildingDetails.totalUnits}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Built
            </label>
            <input
              type="number"
              name="buildingDetails.yearBuilt"
              value={formData.buildingDetails.yearBuilt}
              onChange={handleChange}
              min="1900"
              max="2100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Building Amenities */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Building Amenities
          </label>
          <div className="flex items-center mb-3">
            <input
              type="text"
              value={buildingAmenityInput}
              onChange={(e) => setBuildingAmenityInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBuildingAmenity())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a building amenity"
            />
            <button
              type="button"
              onClick={addBuildingAmenity}
              className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          
          {formData.buildingDetails.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.buildingDetails.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1"
                >
                  <span className="mr-2">{amenity}</span>
                  <button
                    type="button"
                    onClick={() => removeBuildingAmenity(amenity)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unit Features */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Unit Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {unitFeatureOptions.map(feature => (
            <div key={feature} className="flex items-center">
              <input
                type="checkbox"
                id={`feature-${feature}`}
                checked={formData.unitFeatures.includes(feature)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addUnitFeature(feature);
                  } else {
                    removeUnitFeature(feature);
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`feature-${feature}`} className="ml-2 text-sm text-gray-700">
                {feature}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Rental Details (if for rent) */}
      {formData.listingType === 'rent' && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rental Details</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rentalDetails.availableForRent"
                checked={formData.rentalDetails.availableForRent}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Available for Rent
              </label>
            </div>
            
            {formData.rentalDetails.availableForRent && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Lease (months)
                    </label>
                    <input
                      type="number"
                      name="rentalDetails.leaseDuration.value"
                      value={formData.rentalDetails.leaseDuration.value}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rent Negotiable
                    </label>
                    <select
                      name="rentalDetails.rentNegotiable"
                      value={formData.rentalDetails.rentNegotiable}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Tenants
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tenantTypes.map(tenant => (
                      <div key={tenant.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`tenant-${tenant.value}`}
                          checked={formData.rentalDetails.preferredTenants.includes(tenant.value)}
                          onChange={(e) => {
                            const updatedTenants = e.target.checked
                              ? [...formData.rentalDetails.preferredTenants, tenant.value]
                              : formData.rentalDetails.preferredTenants.filter(t => t !== tenant.value);
                            setFormData(prev => ({
                              ...prev,
                              rentalDetails: {
                                ...prev.rentalDetails,
                                preferredTenants: updatedTenants
                              }
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`tenant-${tenant.value}`} className="ml-1 text-sm text-gray-700">
                          {tenant.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Included in Rent
                  </label>
                  <div className="flex items-center mb-3">
                    <input
                      type="text"
                      value={includedInRentInput}
                      onChange={(e) => setIncludedInRentInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIncludedInRent())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Maintenance, Electricity"
                    />
                    <button
                      type="button"
                      onClick={addIncludedInRent}
                      className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.rentalDetails.includedInRent.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.rentalDetails.includedInRent.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-1"
                        >
                          <span className="mr-2">{item}</span>
                          <button
                            type="button"
                            onClick={() => removeIncludedInRent(item)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Status & Admin Controls */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Admin Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Status
            </label>
            <select
              name="approvalStatus"
              value={formData.approvalStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {approvalStatusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availabilityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Featured Property
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isVerified"
                checked={formData.isVerified}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Verified Property
              </label>
            </div>
          </div>
        </div>
        {formData.approvalStatus === 'rejected' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason
            </label>
            <textarea
              name="rejectionReason"
              value={formData.rejectionReason}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide reason for rejection..."
            />
          </div>
        )}
      </div>

      {/* Owner Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Owner Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name
            </label>
            <input
              type="text"
              name="ownerDetails.name"
              value={formData.ownerDetails.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="ownerDetails.phoneNumber"
              value={formData.ownerDetails.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="ownerDetails.email"
              value={formData.ownerDetails.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Selling/Renting
            </label>
            <input
              type="text"
              name="ownerDetails.reasonForSelling"
              value={formData.ownerDetails.reasonForSelling}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Legal Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ownership Type
            </label>
            <select
              name="legalDetails.ownershipType"
              value={formData.legalDetails.ownershipType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ownershipTypes.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RERA Number
            </label>
            <input
              type="text"
              name="legalDetails.reraNumber"
              value={formData.legalDetails.reraNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="legalDetails.reraRegistered"
                checked={formData.legalDetails.reraRegistered}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                RERA Registered
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="legalDetails.khataCertificate"
                checked={formData.legalDetails.khataCertificate}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Khata Certificate
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="legalDetails.encumbranceCertificate"
                checked={formData.legalDetails.encumbranceCertificate}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Encumbrance Certificate
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="legalDetails.occupancyCertificate"
                checked={formData.legalDetails.occupancyCertificate}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Occupancy Certificate
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Viewing */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact & Viewing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Preference
            </label>
            <div className="space-y-2">
              {contactOptions.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`contact-${option.value}`}
                    checked={formData.contactPreference.includes(option.value)}
                    onChange={(e) => {
                      const updatedContacts = e.target.checked
                        ? [...formData.contactPreference, option.value]
                        : formData.contactPreference.filter(c => c !== option.value);
                      setFormData(prev => ({
                        ...prev,
                        contactPreference: updatedContacts
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`contact-${option.value}`} className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Viewing Schedule</label>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="date"
                  value={viewingSlot.date}
                  onChange={(e) => setViewingSlot(prev => ({ ...prev, date: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="time"
                  value={viewingSlot.startTime}
                  onChange={(e) => setViewingSlot(prev => ({ ...prev, startTime: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="time"
                  value={viewingSlot.endTime}
                  onChange={(e) => setViewingSlot(prev => ({ ...prev, endTime: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  value={viewingSlot.slotsAvailable}
                  onChange={(e) => setViewingSlot(prev => ({ ...prev, slotsAvailable: Number(e.target.value) }))}
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Slots available"
                />
                <button
                  type="button"
                  onClick={addViewingSlot}
                  className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Slot
                </button>
              </div>
              
              {formData.viewingSchedule.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.viewingSchedule.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium">{new Date(slot.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{slot.startTime} - {slot.endTime}</p>
                        <p className="text-xs text-gray-500">{slot.slotsAvailable} slots available</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeViewingSlot(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Website Assignment & SEO */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Website & SEO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website Assignment
            </label>
            <div className="space-y-2">
              {websiteOptions.map(option => (
                <div key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`website-${option.value}`}
                    checked={formData.websiteAssignment.includes(option.value)}
                    onChange={(e) => {
                      const updatedWebsites = e.target.checked
                        ? [...formData.websiteAssignment, option.value]
                        : formData.websiteAssignment.filter(w => w !== option.value);
                      setFormData(prev => ({
                        ...prev,
                        websiteAssignment: updatedWebsites
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`website-${option.value}`} className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SEO meta title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="SEO meta description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Tour */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Virtual Tour</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Virtual Tour URL
          </label>
          <input
            type="text"
            name="virtualTour"
            value={formData.virtualTour}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter 360° tour or video URL"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter a URL for virtual tour (360° image or video)
          </p>
        </div>
      </div>

      {/* Images */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
        
        {/* Existing Images */}
        {formData.images.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Property ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        {newImages.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Images to Upload
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {newImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.preview}
                    alt={`New ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floor Plan */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Floor Plan
          </label>
          {formData.floorPlan.image && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">Existing Floor Plan:</p>
              <img
                src={formData.floorPlan.image}
                alt="Floor plan"
                className="max-w-full h-auto max-h-48 rounded-lg"
              />
            </div>
          )}
          {newFloorPlan && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">New Floor Plan:</p>
              <img
                src={newFloorPlan.preview}
                alt="New floor plan"
                className="max-w-full h-auto max-h-48 rounded-lg"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor Plan Description
              </label>
              <input
                type="text"
                value={formData.floorPlan.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  floorPlan: { ...prev.floorPlan, description: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description of floor plan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Floor Plan
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFloorPlanUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Upload Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Property Images
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB each)</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white pb-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-100 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : isEditing ? (
            'Update Property'
          ) : (
            'Create Property'
          )}
        </button>
      </div>
    </form>
  );
};

export default PropertyUnitEdit;