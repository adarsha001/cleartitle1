import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { propertyUnitAPI } from '../api/propertyUnitAPI';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

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
  const titleRef = useRef(null);
  
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

  // Memoized helper components
  const ResponsiveInput = useMemo(() => 
    ({ label, field, type = 'text', placeholder = '', required = false, min = null, max = null }) => (
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => handleFormChange(field, e.target.value)}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
        />
      </div>
    ), [formData, handleFormChange]);

  const ResponsiveTextarea = useMemo(() => 
    ({ label, field, placeholder = '', required = false, rows = 3 }) => (
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={formData[field]}
          onChange={(e) => handleFormChange(field, e.target.value)}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          required={required}
          rows={rows}
        />
      </div>
    ), [formData, handleFormChange]);

  const ResponsiveSelect = useMemo(() => 
    ({ label, field, options, required = false }) => (
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={formData[field]}
          onChange={(e) => handleFormChange(field, e.target.value)}
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
    ), [formData, handleFormChange]);

  const ResponsiveYearSelect = useMemo(() => 
    ({ label, field, required = false }) => (
      <div className="mb-3 sm:mb-4">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={formData[field]}
          onChange={(e) => handleFormChange(field, e.target.value)}
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required={required}
        >
          <option value="">Select Year</option>
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    ), [formData, handleFormChange, yearOptions]);

  const ResponsiveCheckbox = useMemo(() => 
    ({ label, field }) => (
      <div className="flex items-center mb-2 sm:mb-3">
        <input
          type="checkbox"
          checked={formData[field]}
          onChange={(e) => handleFormChange(field, e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-xs sm:text-sm text-gray-700">
          {label}
        </label>
      </div>
    ), [formData, handleFormChange]);

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
          {/* Basic Information */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <ResponsiveInput 
                label="Title *" 
                field="title"
                placeholder="e.g., Luxury 3BHK Apartment" 
                required 
              />
              <ResponsiveInput 
                label="Unit Number" 
                field="unitNumber"
                placeholder="e.g., Unit 101, Villa A1" 
              />
              <div className="sm:col-span-2">
                <ResponsiveTextarea 
                  label="Description" 
                  field="description"
                  placeholder="Detailed description of the property" 
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2">
                <ResponsiveInput 
                  label="Parent Property ID" 
                  field="parentProperty"
                  placeholder="Property ID for grouping (optional)" 
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Location Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <ResponsiveInput 
                label="City *" 
                field="city"
                placeholder="e.g., Mumbai" 
                required 
              />
              <ResponsiveInput 
                label="Address *" 
                field="address"
                placeholder="Full address" 
                required 
              />
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <ResponsiveInput 
                label="Latitude" 
                field="coordinatesLat"
                placeholder="e.g., 19.0760" 
              />
              <ResponsiveInput 
                label="Longitude" 
                field="coordinatesLng"
                placeholder="e.g., 72.8777" 
              />
            </div>
            <div className="mt-3 sm:mt-4">
              <ResponsiveInput 
                label="Map URL (Optional)" 
                field="mapUrl"
                placeholder="Google Maps embed URL or map image URL" 
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Paste Google Maps embed URL or any map service link. Example: https://maps.google.com/...
              </p>
            </div>
          </div>

          {/* Price Section */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Pricing Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <ResponsiveInput 
                label="Price Amount *" 
                field="priceAmount"
                placeholder="e.g., 10000000" 
                required 
                min="1"
              />
              <ResponsiveSelect 
                label="Currency" 
                field="priceCurrency"
                options={currencies} 
              />
              <ResponsiveSelect 
                label="Per Unit" 
                field="pricePerUnit"
                options={perUnitOptions} 
              />
              <ResponsiveInput 
                label="Maintenance Charges" 
                field="maintenanceCharges"
                type="number" 
                placeholder="Monthly charges" 
                min="0"
              />
              <ResponsiveInput 
                label="Security Deposit" 
                field="securityDeposit"
                type="number" 
                placeholder="Refundable deposit" 
                min="0"
              />
            </div>
          </div>

          {/* Property Type & Status */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Property Type & Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <ResponsiveSelect 
                label="Property Type *" 
                field="propertyType"
                options={propertyTypes} 
                required 
              />
              <ResponsiveSelect 
                label="Listing Type" 
                field="listingType"
                options={listingTypes} 
              />
              <ResponsiveSelect 
                label="Availability" 
                field="availability"
                options={availabilityOptions} 
              />
            </div>
          </div>

          {/* Specifications Section */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Property Specifications</h2>
            
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-700">
                <span className="font-medium">Requirements based on property type:</span>
                {formData.propertyType === 'Plot' && ' Plot Area is required.'}
                {formData.propertyType === 'Villa' && ' Bedrooms, Bathrooms, Carpet Area, and Plot Area are required.'}
                {formData.propertyType === 'Commercial Space' && ' Carpet Area and Built-up Area are required.'}
                {formData.propertyType !== 'Plot' && formData.propertyType !== 'Villa' && formData.propertyType !== 'Commercial Space' && 
                  ' Bedrooms, Bathrooms, Carpet Area, and Built-up Area are required.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {formData.propertyType !== 'Plot' && (
                <ResponsiveInput
                  label={'Bedrooms' + (formData.propertyType !== 'Commercial Space' ? ' *' : '')}
                  field="specBedrooms"
                  type="number"
                  placeholder="e.g., 2"
                  required={formData.propertyType !== 'Commercial Space'}
                  min="0"
                />
              )}
              
              {formData.propertyType !== 'Plot' && (
                <ResponsiveInput
                  label={'Bathrooms' + (formData.propertyType !== 'Commercial Space' ? ' *' : '')}
                  field="specBathrooms"
                  type="number"
                  placeholder="e.g., 2"
                  required={formData.propertyType !== 'Commercial Space'}
                  min="0"
                />
              )}
              
              {formData.propertyType !== 'Plot' && (
                <ResponsiveInput
                  label="Carpet Area (sq.ft.) *"
                  field="specCarpetArea"
                  type="number"
                  placeholder="e.g., 1200"
                  required
                  min="1"
                />
              )}
              
              {formData.propertyType !== 'Plot' && formData.propertyType !== 'Villa' && (
                <ResponsiveInput
                  label="Built-up Area (sq.ft.) *"
                  field="specBuiltUpArea"
                  type="number"
                  placeholder="e.g., 1400"
                  required
                  min="1"
                />
              )}
              
              {formData.propertyType === 'Villa' && (
                <ResponsiveInput
                  label="Built-up Area (sq.ft.)"
                  field="specBuiltUpArea"
                  type="number"
                  placeholder="e.g., 1400"
                />
              )}
              
              {(formData.propertyType === 'Plot' || formData.propertyType === 'Villa') && (
                <ResponsiveInput
                  label="Plot Area (sq.ft.) *"
                  field="specPlotArea"
                  type="number"
                  placeholder="e.g., 500"
                  required
                  min="1"
                />
              )}
              
              {formData.propertyType !== 'Plot' && formData.propertyType !== 'Villa' && (
                <ResponsiveInput
                  label="Plot Area (sq.ft.)"
                  field="specPlotArea"
                  type="number"
                  placeholder="e.g., 500"
                />
              )}
              
              {formData.propertyType !== 'Plot' && (
                <ResponsiveInput
                  label="Super Built-up Area (sq.ft.)"
                  field="specSuperBuiltUpArea"
                  type="number"
                  placeholder="e.g., 1500"
                />
              )}
              
              <ResponsiveInput
                label="Balconies"
                field="specBalconies"
                type="number"
                placeholder="e.g., 2"
                min="0"
              />
              
              <ResponsiveInput
                label="Floors in Unit"
                field="specFloors"
                type="number"
                placeholder="e.g., 1"
                min="1"
              />
              
              <ResponsiveInput
                label="Floor Number"
                field="specFloorNumber"
                type="number"
                placeholder="e.g., 3"
              />
              
              <ResponsiveSelect
                label="Furnishing"
                field="specFurnishing"
                options={furnishingOptions}
              />
              
              <ResponsiveSelect
                label="Possession Status"
                field="specPossessionStatus"
                options={possessionOptions}
              />
              
              <ResponsiveInput
                label="Age of Property (years)"
                field="specAgeOfProperty"
                type="number"
                placeholder="e.g., 5"
                min="0"
              />
              
              <ResponsiveSelect
                label="Kitchen Type"
                field="specKitchenType"
                options={kitchenTypes}
              />
              
              <ResponsiveInput
                label="Covered Parking"
                field="specParkingCovered"
                type="number"
                placeholder="e.g., 1"
                min="0"
              />
              
              <ResponsiveInput
                label="Open Parking"
                field="specParkingOpen"
                type="number"
                placeholder="e.g., 1"
                min="0"
              />
            </div>
          </div>

          {/* Building Details */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Building Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <ResponsiveInput
                label="Building Name"
                field="buildingName"
                placeholder="e.g., Skyline Towers"
              />
              
              <ResponsiveInput
                label="Total Floors"
                field="buildingTotalFloors"
                type="number"
                placeholder="e.g., 20"
              />
              
              <ResponsiveInput
                label="Total Units"
                field="buildingTotalUnits"
                type="number"
                placeholder="e.g., 80"
              />
              
              <ResponsiveYearSelect
                label="Year Built"
                field="buildingYearBuilt"
              />
            </div>
            
            {/* Building Amenities */}
            <div className="mt-4 sm:mt-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Building Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {amenitiesOptions.map(amenity => (
                  <div key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.buildingAmenities.includes(amenity)}
                      onChange={() => handleCheckboxArray('buildingAmenities', amenity)}
                      className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700 truncate">{amenity}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Unit Features */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Unit Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {unitFeaturesOptions.map(feature => (
                <div key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.unitFeatures.includes(feature)}
                    onChange={() => handleCheckboxArray('unitFeatures', feature)}
                    className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700 truncate">{feature}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Rental Details */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Rental Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <ResponsiveCheckbox 
                  label="Available for Rent" 
                  field="rentalAvailable"
                />
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Lease Duration
                  </label>
                  <div className="flex gap-2 sm:gap-4">
                    <input
                      type="number"
                      value={formData.rentalLeaseDurationValue}
                      onChange={(e) => handleFormChange('rentalLeaseDurationValue', e.target.value)}
                      className="w-20 sm:w-24 px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                    <select
                      value={formData.rentalLeaseDurationUnit}
                      onChange={(e) => handleFormChange('rentalLeaseDurationUnit', e.target.value)}
                      className="w-24 sm:w-32 px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
                
                <ResponsiveCheckbox 
                  label="Rent Negotiable" 
                  field="rentalNegotiable"
                />
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Preferred Tenants
                  </label>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {preferredTenantsOptions.map(tenant => (
                      <div key={tenant} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.rentalPreferredTenants.includes(tenant)}
                          onChange={() => handleCheckboxArray('rentalPreferredTenants', tenant)}
                          className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700">
                          {tenant.charAt(0).toUpperCase() + tenant.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Included in Rent
                  </label>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {includedInRentOptions.map(item => (
                      <div key={item} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.rentalIncludedInRent.includes(item)}
                          onChange={() => handleCheckboxArray('rentalIncludedInRent', item)}
                          className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700">
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Website Assignment */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Website Assignment</h2>
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Select websites where this property should be listed. Default is ClearTitle.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                {websiteOptions.map(website => {
                  const displayName = website.charAt(0).toUpperCase() + website.slice(1);
                  
                  return (
                    <div key={website} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.websiteAssignment.includes(website)}
                        onChange={() => handleCheckboxArray('websiteAssignment', website)}
                        className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-medium text-gray-700">
                        {displayName}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Property Images</h2>
            
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Upload Images <span className="text-red-500">*</span>
                <span className="text-gray-500 text-xs sm:text-sm ml-1 sm:ml-2">(Max 10 images, at least 1 required)</span>
              </label>
              <div className="mt-1 sm:mt-2 px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 sm:space-y-2 text-center">
                  <svg className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex flex-col sm:flex-row justify-center text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload files</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                        required={mode === 'create'}
                      />
                    </label>
                    <span className="sm:ml-1">or drag and drop</span>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
            </div>
            
            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-sm sm:text-lg font-medium text-gray-700 mb-2 sm:mb-4">Image Previews</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 sm:h-24 md:h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full p-0.5 sm:p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                  {images.length} image(s) selected
                </p>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Additional Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <ResponsiveInput 
                label="Virtual Tour URL" 
                field="virtualTour"
                placeholder="https://matterport.com/..." 
              />
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Floor Plan Image URL
                </label>
                <input
                  type="text"
                  value={formData.floorPlanImage}
                  onChange={(e) => handleFormChange('floorPlanImage', e.target.value)}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Floor plan image URL"
                />
              </div>
              
              <div className="sm:col-span-2">
                <ResponsiveTextarea 
                  label="Floor Plan Description" 
                  field="floorPlanDescription"
                  placeholder="Description of floor plan" 
                  rows={2}
                />
              </div>
              
              <ResponsiveInput 
                label="Meta Title" 
                field="metaTitle"
                placeholder="SEO title (optional)" 
              />
              
              <div className="sm:col-span-2">
                <ResponsiveTextarea 
                  label="Meta Description" 
                  field="metaDescription"
                  placeholder="SEO description (optional)" 
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Owner Details */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Owner Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <ResponsiveInput 
                label="Owner Name" 
                field="ownerName"
                placeholder="e.g., Ramesh Kumar" 
              />
              <ResponsiveInput 
                label="Phone Number" 
                field="ownerPhone"
                type="tel" 
                placeholder="e.g., +91 9876543210" 
              />
              <ResponsiveInput 
                label="Email" 
                field="ownerEmail"
                type="email" 
                placeholder="e.g., owner@example.com" 
              />
              <div className="sm:col-span-2">
                <ResponsiveTextarea 
                  label="Reason for Selling" 
                  field="ownerReason"
                  placeholder="e.g., Moving abroad, upgrading, etc." 
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Legal Details */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Legal Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="mb-2 sm:mb-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Ownership Type
                </label>
                <select
                  value={formData.legalOwnershipType}
                  onChange={(e) => handleFormChange('legalOwnershipType', e.target.value)}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Ownership Type</option>
                  {ownershipTypeOptions.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1).replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <ResponsiveInput 
                label="RERA Number" 
                field="legalReraNumber"
                placeholder="e.g., PRM/KA/RERA/1251/..." 
              />
              
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <ResponsiveCheckbox 
                  label="RERA Registered" 
                  field="legalReraRegistered"
                />
              </div>
              
              <ResponsiveCheckbox 
                label="Khata Certificate" 
                field="legalKhataCertificate"
              />
              
              <ResponsiveCheckbox 
                label="Encumbrance Certificate" 
                field="legalEncumbranceCertificate"
              />
              
              <ResponsiveCheckbox 
                label="Occupancy Certificate" 
                field="legalOccupancyCertificate"
              />
            </div>
          </div>

          {/* Contact Preference */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Contact Preference</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
              {contactPreferenceOptions.map(pref => (
                <div key={pref} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.contactPreference.includes(pref)}
                    onChange={() => handleCheckboxArray('contactPreference', pref)}
                    className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700">
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
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