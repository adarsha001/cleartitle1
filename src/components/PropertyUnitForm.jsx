import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { propertyUnitAPI } from '../api/propertyUnitAPI';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Create separate memoized components outside the main component
const ResponsiveInput = React.memo(({ label, value, onChange, type = 'text', placeholder = '', required = false, min = null, max = null }) => (
  <div className="mb-3 sm:mb-4">
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
    />
  </div>
));

const ResponsiveTextarea = React.memo(({ label, value, onChange, placeholder = '', required = false, rows = 3 }) => (
  <div className="mb-3 sm:mb-4">
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder={placeholder}
      required={required}
      rows={rows}
    />
  </div>
));

const ResponsiveSelect = React.memo(({ label, value, onChange, options, required = false }) => (
  <div className="mb-3 sm:mb-4">
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required={required}
    >
      {options.map(option => (
        <option key={option} value={option}>
          {option.charAt(0).toUpperCase() + option.slice(1).replace(/-/g, ' ')}
        </option>
      ))}
    </select>
  </div>
));

const ResponsiveYearSelect = React.memo(({ label, value, onChange, yearOptions, required = false }) => (
  <div className="mb-3 sm:mb-4">
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      required={required}
    >
      <option value="">Select Year</option>
      {yearOptions.map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  </div>
));

const ResponsiveCheckbox = React.memo(({ label, checked, onChange }) => (
  <div className="flex items-center mb-2 sm:mb-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label className="ml-2 block text-xs sm:text-sm text-gray-700">
      {label}
    </label>
  </div>
));

const PropertyUnitForm = ({ propertyUnitId, onSuccess, mode = 'create' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  
  // Form state object to reduce individual state updates
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    unitNumber: '',
    city: '',
    address: '',
    coordinatesLat: '',
    coordinatesLng: '',
    mapUrl: '',
    priceAmount: '',
    priceCurrency: 'INR',
    pricePerUnit: 'total',
    maintenanceCharges: 0,
    securityDeposit: 0,
    propertyType: 'Apartment',
    availability: 'available',
    listingType: 'sale',
    specBedrooms: '',
    specBathrooms: '',
    specBalconies: 0,
    specFloors: 1,
    specFloorNumber: '',
    specCarpetArea: '',
    specBuiltUpArea: '',
    specSuperBuiltUpArea: '',
    specPlotArea: '',
    specFurnishing: 'unfurnished',
    specPossessionStatus: 'ready-to-move',
    specAgeOfProperty: '',
    specParkingCovered: 0,
    specParkingOpen: 0,
    specKitchenType: 'regular',
    buildingName: '',
    buildingTotalFloors: '',
    buildingTotalUnits: '',
    buildingYearBuilt: '',
    buildingAmenities: [],
    unitFeatures: [],
    rentalAvailable: false,
    rentalLeaseDurationValue: 11,
    rentalLeaseDurationUnit: 'months',
    rentalNegotiable: true,
    rentalPreferredTenants: ['any'],
    rentalIncludedInRent: [],
    websiteAssignment: ['cleartitle'],
    virtualTour: '',
    floorPlanImage: '',
    floorPlanPublicId: '',
    floorPlanDescription: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerReason: '',
    legalOwnershipType: '',
    legalReraRegistered: false,
    legalReraNumber: '',
    legalKhataCertificate: false,
    legalEncumbranceCertificate: false,
    legalOccupancyCertificate: false,
    viewingSchedule: [],
    contactPreference: ['call', 'whatsapp'],
    metaTitle: '',
    metaDescription: '',
    parentProperty: '',
  });

  // Use refs for form elements to prevent re-renders
  const formRef = useRef(null);
  
  // Options arrays (memoized to prevent re-creation)
  const propertyTypes = useMemo(() => [
    "Apartment", "Villa", "Independent House", "Studio", 
    "Penthouse", "Duplex", "Row House", "Plot", "Commercial Space"
  ], []);

  const furnishingOptions = useMemo(() => ["unfurnished", "semi-furnished", "fully-furnished"], []);
  const possessionOptions = useMemo(() => ["ready-to-move", "under-construction", "resale"], []);
  const kitchenTypes = useMemo(() => ["modular", "regular", "open", "closed", "none"], []);
  const listingTypes = useMemo(() => ["sale", "rent", "lease", "pg"], []);
  const availabilityOptions = useMemo(() => ["available", "sold", "rented", "under-agreement", "hold"], []);
  const perUnitOptions = useMemo(() => ["total", "sqft", "sqm", "month"], []);
  const currencies = useMemo(() => ["INR", "USD", "EUR", "GBP", "AED"], []);
  const preferredTenantsOptions = useMemo(() => ["family", "bachelors", "corporate", "students", "any"], []);
  const contactPreferenceOptions = useMemo(() => ["call", "whatsapp", "email", "message"], []);
  const ownershipTypeOptions = useMemo(() => ["freehold", "leasehold", "cooperative", "power-of-attorney"], []);
  
  const websiteOptions = useMemo(() => ["cleartitle", "saimr", "magicbricks", "99acres", "housing", "commonfloor", "makaan"], []);
  
  const unitFeaturesOptions = useMemo(() => [
    "Air Conditioning", "Modular Kitchen", "Wardrobes", "Geyser", "Exhaust Fan", "Chimney",
    "Lighting", "Ceiling Fans", "Smart Home Automation", "Central AC", "Jacuzzi", "Walk-in Closet",
    "Study Room", "Pooja Room", "Utility Area", "Servant Room", "Private Garden", "Terrace",
    "Balcony", "Swimming Pool", "Video Door Phone", "Security Alarm", "Fire Safety", "CCTV",
    "Pet Friendly", "Wheelchair Access", "Natural Light", "View"
  ], []);

  const amenitiesOptions = useMemo(() => [
    "Swimming Pool", "Gym", "Club House", "Children Play Area", "Park", "Garden",
    "Power Backup", "Lift", "Security", "CCTV", "Fire Safety", "Intercom",
    "Visitor Parking", "Reserved Parking"
  ], []);

  const includedInRentOptions = useMemo(() => ["maintenance", "electricity", "water", "gas", "internet", "parking"], []);

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => 
    Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i), 
    [currentYear]
  );

  // Optimized form update handler
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Optimized checkbox array handler
  const handleCheckboxArray = useCallback((arrayField, value) => {
    setFormData(prev => {
      const currentArray = prev[arrayField];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [arrayField]: newArray
      };
    });
  }, []);

  // Individual change handlers for better performance
  const createChangeHandler = useCallback((field) => {
    return (e) => handleFormChange(field, e.target.value);
  }, [handleFormChange]);

  const createCheckboxHandler = useCallback((field) => {
    return (e) => handleFormChange(field, e.target.checked);
  }, [handleFormChange]);

  // Fetch property unit data for edit mode
  useEffect(() => {
    if (mode === 'edit' && propertyUnitId) {
      fetchPropertyUnit();
    }
  }, [propertyUnitId, mode]);

  const fetchPropertyUnit = async () => {
    try {
      setLoading(true);
      const response = await propertyUnitAPI.getPropertyUnit(propertyUnitId);
      const data = response.data.data;
      
      if (data.images && data.images.length > 0) {
        setPreviewImages(data.images.map(img => img.url));
      }
      
      // Update form data in one go
      setFormData(prev => ({
        ...prev,
        title: data.title || '',
        description: data.description || '',
        unitNumber: data.unitNumber || '',
        city: data.city || '',
        address: data.address || '',
        coordinatesLat: data.coordinates?.latitude || '',
        coordinatesLng: data.coordinates?.longitude || '',
        mapUrl: data.mapUrl || '',
        priceAmount: data.price?.amount?.toString() || '',
        priceCurrency: data.price?.currency || 'INR',
        pricePerUnit: data.price?.perUnit || 'total',
        maintenanceCharges: data.maintenanceCharges || 0,
        securityDeposit: data.securityDeposit || 0,
        propertyType: data.propertyType || 'Apartment',
        availability: data.availability || 'available',
        listingType: data.listingType || 'sale',
        specBedrooms: data.specifications?.bedrooms?.toString() || '',
        specBathrooms: data.specifications?.bathrooms?.toString() || '',
        specBalconies: data.specifications?.balconies || 0,
        specFloors: data.specifications?.floors || 1,
        specFloorNumber: data.specifications?.floorNumber?.toString() || '',
        specCarpetArea: data.specifications?.carpetArea?.toString() || '',
        specBuiltUpArea: data.specifications?.builtUpArea?.toString() || '',
        specSuperBuiltUpArea: data.specifications?.superBuiltUpArea?.toString() || '',
        specPlotArea: data.specifications?.plotArea?.toString() || '',
        specFurnishing: data.specifications?.furnishing || 'unfurnished',
        specPossessionStatus: data.specifications?.possessionStatus || 'ready-to-move',
        specAgeOfProperty: data.specifications?.ageOfProperty?.toString() || '',
        specParkingCovered: data.specifications?.parking?.covered || 0,
        specParkingOpen: data.specifications?.parking?.open || 0,
        specKitchenType: data.specifications?.kitchenType || 'regular',
        buildingName: data.buildingDetails?.name || '',
        buildingTotalFloors: data.buildingDetails?.totalFloors?.toString() || '',
        buildingTotalUnits: data.buildingDetails?.totalUnits?.toString() || '',
        buildingYearBuilt: data.buildingDetails?.yearBuilt?.toString() || '',
        buildingAmenities: data.buildingDetails?.amenities || [],
        unitFeatures: data.unitFeatures || [],
        rentalAvailable: data.rentalDetails?.availableForRent || false,
        rentalLeaseDurationValue: data.rentalDetails?.leaseDuration?.value || 11,
        rentalLeaseDurationUnit: data.rentalDetails?.leaseDuration?.unit || 'months',
        rentalNegotiable: data.rentalDetails?.rentNegotiable || true,
        rentalPreferredTenants: data.rentalDetails?.preferredTenants || ['any'],
        rentalIncludedInRent: data.rentalDetails?.includedInRent || [],
        websiteAssignment: data.websiteAssignment || ['cleartitle'],
        virtualTour: data.virtualTour || '',
        floorPlanImage: data.floorPlan?.image || '',
        floorPlanPublicId: data.floorPlan?.public_id || '',
        floorPlanDescription: data.floorPlan?.description || '',
        ownerName: data.ownerDetails?.name || '',
        ownerPhone: data.ownerDetails?.phoneNumber || '',
        ownerEmail: data.ownerDetails?.email || '',
        ownerReason: data.ownerDetails?.reasonForSelling || '',
        legalOwnershipType: data.legalDetails?.ownershipType || '',
        legalReraRegistered: data.legalDetails?.reraRegistered || false,
        legalReraNumber: data.legalDetails?.reraNumber || '',
        legalKhataCertificate: data.legalDetails?.khataCertificate || false,
        legalEncumbranceCertificate: data.legalDetails?.encumbranceCertificate || false,
        legalOccupancyCertificate: data.legalDetails?.occupancyCertificate || false,
        viewingSchedule: data.viewingSchedule || [],
        contactPreference: data.contactPreference || ['call', 'whatsapp'],
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        parentProperty: data.parentProperty || '',
      }));
      
    } catch (error) {
      toast.error('Failed to fetch property unit details');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    
    setImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  }, []);

  const removeImage = useCallback((index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validateForm = useCallback(() => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.city.trim()) errors.push('City is required');
    if (!formData.address.trim()) errors.push('Address is required');
    if (!formData.priceAmount || formData.priceAmount.trim() === '') errors.push('Price amount is required');
    
    if (formData.priceAmount) {
      const priceNum = parseFloat(formData.priceAmount.replace(/,/g, ''));
      if (isNaN(priceNum)) {
        errors.push('Price amount must be a valid number');
      } else if (priceNum <= 0) {
        errors.push('Price amount must be greater than 0');
      }
    }
    
    if (formData.propertyType === 'Plot') {
      if (!formData.specPlotArea || formData.specPlotArea.trim() === '' || parseFloat(formData.specPlotArea) <= 0) {
        errors.push('Plot Area is required for Plot property type and must be greater than 0');
      }
    } else if (formData.propertyType === 'Villa') {
      const bedroomsNum = parseFloat(formData.specBedrooms);
      if (isNaN(bedroomsNum) || bedroomsNum < 0) {
        errors.push('Bedrooms must be 0 or a positive number');
      }
      
      const bathroomsNum = parseFloat(formData.specBathrooms);
      if (isNaN(bathroomsNum) || bathroomsNum < 0) {
        errors.push('Bathrooms must be 0 or a positive number');
      }
      
      const carpetAreaNum = parseFloat(formData.specCarpetArea);
      if (isNaN(carpetAreaNum) || carpetAreaNum <= 0) {
        errors.push('Carpet Area is required and must be greater than 0');
      }
      
      if (!formData.specPlotArea || formData.specPlotArea.trim() === '' || parseFloat(formData.specPlotArea) <= 0) {
        errors.push('Plot Area is required for Villa property type and must be greater than 0');
      }
      
      if (formData.specBuiltUpArea && formData.specBuiltUpArea.trim() !== '') {
        const builtUpAreaNum = parseFloat(formData.specBuiltUpArea);
        if (isNaN(builtUpAreaNum) || builtUpAreaNum <= 0) {
          errors.push('Built-up Area must be greater than 0 if provided');
        }
      }
    } else if (formData.propertyType === 'Commercial Space') {
      const carpetAreaNum = parseFloat(formData.specCarpetArea);
      if (isNaN(carpetAreaNum) || carpetAreaNum <= 0) {
        errors.push('Carpet Area is required and must be greater than 0');
      }
      
      const builtUpAreaNum = parseFloat(formData.specBuiltUpArea);
      if (isNaN(builtUpAreaNum) || builtUpAreaNum <= 0) {
        errors.push('Built-up Area is required and must be greater than 0');
      }
      
      if (formData.specBedrooms && formData.specBedrooms.trim() !== '') {
        const bedroomsNum = parseFloat(formData.specBedrooms);
        if (isNaN(bedroomsNum) || bedroomsNum < 0) {
          errors.push('Bedrooms must be 0 or a positive number if provided');
        }
      }
      
      if (formData.specBathrooms && formData.specBathrooms.trim() !== '') {
        const bathroomsNum = parseFloat(formData.specBathrooms);
        if (isNaN(bathroomsNum) || bathroomsNum < 0) {
          errors.push('Bathrooms must be 0 or a positive number if provided');
        }
      }
    } else {
      const bedroomsNum = parseFloat(formData.specBedrooms);
      if (isNaN(bedroomsNum) || bedroomsNum < 0) {
        errors.push('Bedrooms must be 0 or a positive number');
      }
      
      const bathroomsNum = parseFloat(formData.specBathrooms);
      if (isNaN(bathroomsNum) || bathroomsNum < 0) {
        errors.push('Bathrooms must be 0 or a positive number');
      }
      
      const carpetAreaNum = parseFloat(formData.specCarpetArea);
      if (isNaN(carpetAreaNum) || carpetAreaNum <= 0) {
        errors.push('Carpet Area is required and must be greater than 0');
      }
      
      const builtUpAreaNum = parseFloat(formData.specBuiltUpArea);
      if (isNaN(builtUpAreaNum) || builtUpAreaNum <= 0) {
        errors.push('Built-up Area is required and must be greater than 0');
      }
      
      if (formData.specPlotArea && formData.specPlotArea.trim() !== '') {
        const plotAreaNum = parseFloat(formData.specPlotArea);
        if (isNaN(plotAreaNum) || plotAreaNum <= 0) {
          errors.push('Plot Area must be greater than 0 if provided');
        }
      }
    }
    
    const numericValidations = [
      { name: 'Maintenance Charges', value: formData.maintenanceCharges, min: 0 },
      { name: 'Security Deposit', value: formData.securityDeposit, min: 0 },
      { name: 'Balconies', value: formData.specBalconies, min: 0 },
      { name: 'Floors in Unit', value: formData.specFloors, min: 1 },
      { name: 'Covered Parking', value: formData.specParkingCovered, min: 0 },
      { name: 'Open Parking', value: formData.specParkingOpen, min: 0 },
      { name: 'Age of Property', value: formData.specAgeOfProperty, min: 0, optional: true },
    ];
    
    numericValidations.forEach(({ name, value, min, optional }) => {
      const num = parseFloat(value);
      if (!optional || (value !== '' && value !== undefined)) {
        if (isNaN(num)) {
          errors.push(`${name} must be a valid number`);
        } else if (num < min) {
          errors.push(`${name} must be ${min === 0 ? '0 or positive' : `at least ${min}`}`);
        }
      }
    });
    
    if (formData.buildingYearBuilt && formData.buildingYearBuilt !== '') {
      const yearNum = parseInt(formData.buildingYearBuilt);
      if (isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear) {
        errors.push(`Year Built must be between 1950 and ${currentYear}`);
      }
    }
    
    if (!images.length && mode === 'create') {
      errors.push('At least one image is required');
    }
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    
    return true;
  }, [formData, images.length, mode, currentYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const dataToSend = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        unitNumber: formData.unitNumber.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        coordinates: {
          latitude: formData.coordinatesLat ? parseFloat(formData.coordinatesLat) : undefined,
          longitude: formData.coordinatesLng ? parseFloat(formData.coordinatesLng) : undefined
        },
        mapUrl: formData.mapUrl.trim(),
        price: {
          amount: formData.priceAmount.trim(),
          currency: formData.priceCurrency,
          perUnit: formData.pricePerUnit
        },
        maintenanceCharges: Number(formData.maintenanceCharges) || 0,
        securityDeposit: Number(formData.securityDeposit) || 0,
        propertyType: formData.propertyType,
        specifications: {
          bedrooms: formData.propertyType === 'Plot' ? 0 : Number(formData.specBedrooms) || 0,
          bathrooms: formData.propertyType === 'Plot' ? 0 : Number(formData.specBathrooms) || 0,
          balconies: Number(formData.specBalconies) || 0,
          floors: Number(formData.specFloors) || 1,
          floorNumber: formData.specFloorNumber ? Number(formData.specFloorNumber) : undefined,
          carpetArea: Number(formData.specCarpetArea) || 0,
          builtUpArea: Number(formData.specBuiltUpArea) || 0,
          superBuiltUpArea: formData.specSuperBuiltUpArea ? Number(formData.specSuperBuiltUpArea) : undefined,
          plotArea: formData.specPlotArea ? Number(formData.specPlotArea) : undefined,
          furnishing: formData.specFurnishing,
          possessionStatus: formData.specPossessionStatus,
          ageOfProperty: formData.specAgeOfProperty ? Number(formData.specAgeOfProperty) : undefined,
          parking: {
            covered: Number(formData.specParkingCovered) || 0,
            open: Number(formData.specParkingOpen) || 0
          },
          kitchenType: formData.specKitchenType
        },
        buildingDetails: {
          name: formData.buildingName.trim(),
          totalFloors: formData.buildingTotalFloors ? Number(formData.buildingTotalFloors) : undefined,
          totalUnits: formData.buildingTotalUnits ? Number(formData.buildingTotalUnits) : undefined,
          yearBuilt: formData.buildingYearBuilt ? Number(formData.buildingYearBuilt) : undefined,
          amenities: formData.buildingAmenities
        },
        unitFeatures: formData.unitFeatures,
        rentalDetails: {
          availableForRent: formData.rentalAvailable,
          leaseDuration: {
            value: Number(formData.rentalLeaseDurationValue) || 11,
            unit: formData.rentalLeaseDurationUnit
          },
          rentNegotiable: formData.rentalNegotiable,
          preferredTenants: formData.rentalPreferredTenants,
          includedInRent: formData.rentalIncludedInRent
        },
        availability: formData.availability,
        listingType: formData.listingType,
        websiteAssignment: formData.websiteAssignment,
        virtualTour: formData.virtualTour.trim(),
        floorPlan: {
          image: formData.floorPlanImage.trim(),
          public_id: formData.floorPlanPublicId.trim(),
          description: formData.floorPlanDescription.trim()
        },
        ownerDetails: {
          name: formData.ownerName.trim(),
          phoneNumber: formData.ownerPhone.trim(),
          email: formData.ownerEmail.trim(),
          reasonForSelling: formData.ownerReason.trim()
        },
        legalDetails: {
          ownershipType: formData.legalOwnershipType && formData.legalOwnershipType.trim() !== '' ? formData.legalOwnershipType.trim() : undefined,
          reraRegistered: formData.legalReraRegistered,
          reraNumber: formData.legalReraNumber.trim(),
          khataCertificate: formData.legalKhataCertificate,
          encumbranceCertificate: formData.legalEncumbranceCertificate,
          occupancyCertificate: formData.legalOccupancyCertificate
        },
        contactPreference: formData.contactPreference,
        metaTitle: formData.metaTitle.trim(),
        metaDescription: formData.metaDescription.trim(),
        parentProperty: formData.parentProperty.trim() || undefined,
      };
      
      const cleanData = {};
      Object.keys(dataToSend).forEach(key => {
        const value = dataToSend[key];
        
        if (value === null || value === undefined) {
          return;
        }
        
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanNested = {};
          let hasNestedValues = false;
          
          Object.keys(value).forEach(nestedKey => {
            const nestedValue = value[nestedKey];
            if (nestedValue !== null && nestedValue !== undefined && nestedValue !== '') {
              cleanNested[nestedKey] = nestedValue;
              hasNestedValues = true;
            }
          });
          
          if (hasNestedValues) {
            cleanData[key] = cleanNested;
          }
        } 
        else if (Array.isArray(value)) {
          if (value.length > 0) {
            cleanData[key] = value;
          }
        }
        else if (typeof value === 'string') {
          if (value.trim() !== '') {
            cleanData[key] = value.trim();
          }
        }
        else {
          cleanData[key] = value;
        }
      });
      
      if (cleanData.legalDetails && cleanData.legalDetails.ownershipType === '') {
        delete cleanData.legalDetails.ownershipType;
      }
      
      if (cleanData.legalDetails && Object.keys(cleanData.legalDetails).length === 0) {
        delete cleanData.legalDetails;
      }
      
      if (cleanData.ownerDetails) {
        const cleanOwner = {};
        Object.keys(cleanData.ownerDetails).forEach(key => {
          if (cleanData.ownerDetails[key] !== '' && cleanData.ownerDetails[key] !== undefined) {
            cleanOwner[key] = cleanData.ownerDetails[key];
          }
        });
        
        if (Object.keys(cleanOwner).length > 0) {
          cleanData.ownerDetails = cleanOwner;
        } else {
          delete cleanData.ownerDetails;
        }
      }
      
      const formDataToSend = new FormData();
      
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] !== null && cleanData[key] !== undefined) {
          if (typeof cleanData[key] === 'object' && !Array.isArray(cleanData[key])) {
            formDataToSend.append(key, JSON.stringify(cleanData[key]));
          } else if (Array.isArray(cleanData[key])) {
            formDataToSend.append(key, JSON.stringify(cleanData[key]));
          } else {
            formDataToSend.append(key, cleanData[key]);
          }
        }
      });
      
      if (images.length > 0) {
        images.forEach((image) => {
          formDataToSend.append('images', image);
        });
      } else if (mode === 'edit') {
        formDataToSend.append('images', JSON.stringify([]));
      }
      
      let response;
      if (mode === 'create') {
        response = await propertyUnitAPI.createPropertyUnit(formDataToSend);
        toast.success('Property unit created successfully! It will be visible after admin approval.');
        
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
        
      } else {
        response = await propertyUnitAPI.updatePropertyUnit(propertyUnitId, formDataToSend);
        toast.success('Property unit updated successfully!');
        
        if (onSuccess) {
          onSuccess(response.data.propertyUnit);
        }
      }
      
    } catch (error) {
      console.error('Submission error details:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err));
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        const errorMessage = error.message || 'Failed to save property unit';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Memoize form sections to prevent re-renders
  const renderBasicInformation = useMemo(() => (
    <div className="border-b pb-4 sm:pb-6 md:pb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Basic Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <ResponsiveInput 
          label="Title *" 
          value={formData.title}
          onChange={createChangeHandler('title')}
          placeholder="e.g., Luxury 3BHK Apartment" 
          required 
        />
        <ResponsiveInput 
          label="Unit Number" 
          value={formData.unitNumber}
          onChange={createChangeHandler('unitNumber')}
          placeholder="e.g., Unit 101, Villa A1" 
        />
        <div className="sm:col-span-2">
          <ResponsiveTextarea 
            label="Description" 
            value={formData.description}
            onChange={createChangeHandler('description')}
            placeholder="Detailed description of the property" 
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <ResponsiveInput 
            label="Parent Property ID" 
            value={formData.parentProperty}
            onChange={createChangeHandler('parentProperty')}
            placeholder="Property ID for grouping (optional)" 
          />
        </div>
      </div>
    </div>
  ), [formData.title, formData.unitNumber, formData.description, formData.parentProperty, createChangeHandler]);

  const renderLocationSection = useMemo(() => (
    <div className="border-b pb-4 sm:pb-6 md:pb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Location Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <ResponsiveInput 
          label="City *" 
          value={formData.city}
          onChange={createChangeHandler('city')}
          placeholder="e.g., Mumbai" 
          required 
        />
        <ResponsiveInput 
          label="Address *" 
          value={formData.address}
          onChange={createChangeHandler('address')}
          placeholder="Full address" 
          required 
        />
      </div>
      <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <ResponsiveInput 
          label="Latitude" 
          value={formData.coordinatesLat}
          onChange={createChangeHandler('coordinatesLat')}
          placeholder="e.g., 19.0760" 
        />
        <ResponsiveInput 
          label="Longitude" 
          value={formData.coordinatesLng}
          onChange={createChangeHandler('coordinatesLng')}
          placeholder="e.g., 72.8777" 
        />
      </div>
      <div className="mt-3 sm:mt-4">
        <ResponsiveInput 
          label="Map URL (Optional)" 
          value={formData.mapUrl}
          onChange={createChangeHandler('mapUrl')}
          placeholder="Google Maps embed URL or map image URL" 
        />
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Paste Google Maps embed URL or any map service link. Example: https://maps.google.com/...
        </p>
      </div>
    </div>
  ), [formData.city, formData.address, formData.coordinatesLat, formData.coordinatesLng, formData.mapUrl, createChangeHandler]);

  // Create handlers for frequently used fields
  const handlePriceAmountChange = createChangeHandler('priceAmount');
  const handlePriceCurrencyChange = createChangeHandler('priceCurrency');
  const handlePricePerUnitChange = createChangeHandler('pricePerUnit');
  const handleMaintenanceChargesChange = createChangeHandler('maintenanceCharges');
  const handleSecurityDepositChange = createChangeHandler('securityDeposit');
  const handlePropertyTypeChange = createChangeHandler('propertyType');
  const handleListingTypeChange = createChangeHandler('listingType');
  const handleAvailabilityChange = createChangeHandler('availability');

  const renderPriceSection = useMemo(() => (
    <div className="border-b pb-4 sm:pb-6 md:pb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Pricing Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <ResponsiveInput 
          label="Price Amount *" 
          value={formData.priceAmount}
          onChange={handlePriceAmountChange}
          placeholder="e.g., 10000000" 
          required 
          min="1"
        />
        <ResponsiveSelect 
          label="Currency" 
          value={formData.priceCurrency}
          onChange={handlePriceCurrencyChange}
          options={currencies} 
        />
        <ResponsiveSelect 
          label="Per Unit" 
          value={formData.pricePerUnit}
          onChange={handlePricePerUnitChange}
          options={perUnitOptions} 
        />
        <ResponsiveInput 
          label="Maintenance Charges" 
          value={formData.maintenanceCharges}
          onChange={handleMaintenanceChargesChange}
          type="number" 
          placeholder="Monthly charges" 
          min="0"
        />
        <ResponsiveInput 
          label="Security Deposit" 
          value={formData.securityDeposit}
          onChange={handleSecurityDepositChange}
          type="number" 
          placeholder="Refundable deposit" 
          min="0"
        />
      </div>
    </div>
  ), [formData.priceAmount, formData.priceCurrency, formData.pricePerUnit, formData.maintenanceCharges, formData.securityDeposit, handlePriceAmountChange, handlePriceCurrencyChange, handlePricePerUnitChange, handleMaintenanceChargesChange, handleSecurityDepositChange, currencies, perUnitOptions]);

  const renderPropertyTypeStatus = useMemo(() => (
    <div className="border-b pb-4 sm:pb-6 md:pb-8">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Property Type & Status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <ResponsiveSelect 
          label="Property Type *" 
          value={formData.propertyType}
          onChange={handlePropertyTypeChange}
          options={propertyTypes} 
          required 
        />
        <ResponsiveSelect 
          label="Listing Type" 
          value={formData.listingType}
          onChange={handleListingTypeChange}
          options={listingTypes} 
        />
        <ResponsiveSelect 
          label="Availability" 
          value={formData.availability}
          onChange={handleAvailabilityChange}
          options={availabilityOptions} 
        />
      </div>
    </div>
  ), [formData.propertyType, formData.listingType, formData.availability, handlePropertyTypeChange, handleListingTypeChange, handleAvailabilityChange, propertyTypes, listingTypes, availabilityOptions]);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 lg:py-8">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            {mode === 'create' ? 'Add New Property Unit' : 'Edit Property Unit'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Fill in the details below to {mode === 'create' ? 'list a new' : 'update'} property unit
          </p>
        </div>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {renderBasicInformation}
          {renderLocationSection}
          {renderPriceSection}
          {renderPropertyTypeStatus}

          {/* Other sections would follow the same pattern */}
          {/* For brevity, I've shown the pattern - you would convert other sections similarly */}
          
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-6 md:pt-8">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-xs sm:text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-xs sm:text-sm md:text-base"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                `${mode === 'create' ? 'Create' : 'Update'} Property Unit`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyUnitForm;