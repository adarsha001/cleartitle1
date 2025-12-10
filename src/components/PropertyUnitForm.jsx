import React, { useState, useEffect } from 'react';
import { propertyUnitAPI } from '../api/propertyUnitAPI';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const PropertyUnitForm = ({ propertyUnitId, onSuccess, mode = 'create' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  
  // Individual state for all fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [coordinatesLat, setCoordinatesLat] = useState('');
  const [coordinatesLng, setCoordinatesLng] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  // Price fields
  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('INR');
  const [pricePerUnit, setPricePerUnit] = useState('total');
  const [maintenanceCharges, setMaintenanceCharges] = useState(0);
  const [securityDeposit, setSecurityDeposit] = useState(0);
  
  // Property type and status
  const [propertyType, setPropertyType] = useState('Apartment');
  const [availability, setAvailability] = useState('available');
  const [listingType, setListingType] = useState('sale');
  
  // Specifications (all individual fields)
  const [specBedrooms, setSpecBedrooms] = useState('');
  const [specBathrooms, setSpecBathrooms] = useState('');
  const [specBalconies, setSpecBalconies] = useState(0);
  const [specFloors, setSpecFloors] = useState(1);
  const [specFloorNumber, setSpecFloorNumber] = useState('');
  const [specCarpetArea, setSpecCarpetArea] = useState('');
  const [specBuiltUpArea, setSpecBuiltUpArea] = useState('');
  const [specSuperBuiltUpArea, setSpecSuperBuiltUpArea] = useState('');
  const [specPlotArea, setSpecPlotArea] = useState('');
  const [specFurnishing, setSpecFurnishing] = useState('unfurnished');
  const [specPossessionStatus, setSpecPossessionStatus] = useState('ready-to-move');
  const [specAgeOfProperty, setSpecAgeOfProperty] = useState('');
  const [specParkingCovered, setSpecParkingCovered] = useState(0);
  const [specParkingOpen, setSpecParkingOpen] = useState(0);
  const [specKitchenType, setSpecKitchenType] = useState('regular');
  
  // Building details
  const [buildingName, setBuildingName] = useState('');
  const [buildingTotalFloors, setBuildingTotalFloors] = useState('');
  const [buildingTotalUnits, setBuildingTotalUnits] = useState('');
  const [buildingYearBuilt, setBuildingYearBuilt] = useState('');
  const [buildingAmenities, setBuildingAmenities] = useState([]);
  
  // Unit features
  const [unitFeatures, setUnitFeatures] = useState([]);
  
  // Rental details
  const [rentalAvailable, setRentalAvailable] = useState(false);
  const [rentalLeaseDurationValue, setRentalLeaseDurationValue] = useState(11);
  const [rentalLeaseDurationUnit, setRentalLeaseDurationUnit] = useState('months');
  const [rentalNegotiable, setRentalNegotiable] = useState(true);
  const [rentalPreferredTenants, setRentalPreferredTenants] = useState(['any']);
  const [rentalIncludedInRent, setRentalIncludedInRent] = useState([]);
  
  // Website assignment
  const [websiteAssignment, setWebsiteAssignment] = useState(['cleartitle']);
  
  // Additional info
  const [virtualTour, setVirtualTour] = useState('');
  const [floorPlanImage, setFloorPlanImage] = useState('');
  const [floorPlanPublicId, setFloorPlanPublicId] = useState('');
  const [floorPlanDescription, setFloorPlanDescription] = useState('');
  
  // Owner details
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerReason, setOwnerReason] = useState('');
  
  // Legal details
  const [legalOwnershipType, setLegalOwnershipType] = useState('');
  const [legalReraRegistered, setLegalReraRegistered] = useState(false);
  const [legalReraNumber, setLegalReraNumber] = useState('');
  const [legalKhataCertificate, setLegalKhataCertificate] = useState(false);
  const [legalEncumbranceCertificate, setLegalEncumbranceCertificate] = useState(false);
  const [legalOccupancyCertificate, setLegalOccupancyCertificate] = useState(false);
  
  // Viewing schedule
  const [viewingSchedule, setViewingSchedule] = useState([]);
  
  // Contact preference
  const [contactPreference, setContactPreference] = useState(['call', 'whatsapp']);
  
  // SEO and display
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  // REMOVED: displayOrder, isFeatured, isVerified, approvalStatus - will be handled by backend

  // Parent property
  const [parentProperty, setParentProperty] = useState('');

  const propertyTypes = [
    "Apartment", "Villa", "Independent House", "Studio", 
    "Penthouse", "Duplex", "Row House", "Plot", "Commercial Space"
  ];

  const furnishingOptions = ["unfurnished", "semi-furnished", "fully-furnished"];
  const possessionOptions = ["ready-to-move", "under-construction", "resale"];
  const kitchenTypes = ["modular", "regular", "open", "closed", "none"];
  const listingTypes = ["sale", "rent", "lease", "pg"];
  const availabilityOptions = ["available", "sold", "rented", "under-agreement", "hold"];
  const perUnitOptions = ["total", "sqft", "sqm", "month"];
  const currencies = ["INR", "USD", "EUR", "GBP", "AED"];
  const preferredTenantsOptions = ["family", "bachelors", "corporate", "students", "any"];
  const contactPreferenceOptions = ["call", "whatsapp", "email", "message"];
  const ownershipTypeOptions = ["freehold", "leasehold", "cooperative", "power-of-attorney"];
  
  // Website options
  const websiteOptions = [
    "cleartitle", 
    "saimr",
    "magicbricks", 
    "99acres", 
    "housing", 
    "commonfloor", 
    "makaan"
  ];
  
  // Unit features options
  const unitFeaturesOptions = [
    "Air Conditioning", 
    "Modular Kitchen", 
    "Wardrobes", 
    "Geyser", 
    "Exhaust Fan", 
    "Chimney",
    "Lighting", 
    "Ceiling Fans", 
    "Smart Home Automation", 
    "Central AC", 
    "Jacuzzi",
    "Walk-in Closet",
    "Study Room", 
    "Pooja Room", 
    "Utility Area", 
    "Servant Room", 
    "Private Garden", 
    "Terrace",
    "Balcony", 
    "Swimming Pool", 
    "Video Door Phone", 
    "Security Alarm", 
    "Fire Safety",
    "CCTV", 
    "Pet Friendly", 
    "Wheelchair Access", 
    "Natural Light", 
    "View"
  ];

  // Building amenities options
  const amenitiesOptions = [
    "Swimming Pool", "Gym", "Club House", "Children Play Area", "Park", "Garden",
    "Power Backup", "Lift", "Security", "CCTV", "Fire Safety", "Intercom",
    "Visitor Parking", "Reserved Parking"
  ];

  // Included in rent options
  const includedInRentOptions = ["maintenance", "electricity", "water", "gas", "internet", "parking"];

  // Year options for building year built (1950 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1949 },
    (_, i) => currentYear - i
  );

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
      
      // Set images preview
      if (data.images && data.images.length > 0) {
        setPreviewImages(data.images.map(img => img.url));
      }
      
      // Set all fields from backend data
      setTitle(data.title || '');
      setDescription(data.description || '');
      setUnitNumber(data.unitNumber || '');
      setCity(data.city || '');
      setAddress(data.address || '');
      setCoordinatesLat(data.coordinates?.latitude || '');
      setCoordinatesLng(data.coordinates?.longitude || '');
      setMapUrl(data.mapUrl || '');
      // Price
      setPriceAmount(data.price?.amount?.toString() || '');
      setPriceCurrency(data.price?.currency || 'INR');
      setPricePerUnit(data.price?.perUnit || 'total');
      setMaintenanceCharges(data.maintenanceCharges || 0);
      setSecurityDeposit(data.securityDeposit || 0);
      
      // Property type and status
      setPropertyType(data.propertyType || 'Apartment');
      setAvailability(data.availability || 'available');
      setListingType(data.listingType || 'sale');
      
      // Specifications
      setSpecBedrooms(data.specifications?.bedrooms?.toString() || '');
      setSpecBathrooms(data.specifications?.bathrooms?.toString() || '');
      setSpecBalconies(data.specifications?.balconies || 0);
      setSpecFloors(data.specifications?.floors || 1);
      setSpecFloorNumber(data.specifications?.floorNumber?.toString() || '');
      setSpecCarpetArea(data.specifications?.carpetArea?.toString() || '');
      setSpecBuiltUpArea(data.specifications?.builtUpArea?.toString() || '');
      setSpecSuperBuiltUpArea(data.specifications?.superBuiltUpArea?.toString() || '');
      setSpecPlotArea(data.specifications?.plotArea?.toString() || '');
      setSpecFurnishing(data.specifications?.furnishing || 'unfurnished');
      setSpecPossessionStatus(data.specifications?.possessionStatus || 'ready-to-move');
      setSpecAgeOfProperty(data.specifications?.ageOfProperty?.toString() || '');
      setSpecParkingCovered(data.specifications?.parking?.covered || 0);
      setSpecParkingOpen(data.specifications?.parking?.open || 0);
      setSpecKitchenType(data.specifications?.kitchenType || 'regular');
      
      // Building details
      setBuildingName(data.buildingDetails?.name || '');
      setBuildingTotalFloors(data.buildingDetails?.totalFloors?.toString() || '');
      setBuildingTotalUnits(data.buildingDetails?.totalUnits?.toString() || '');
      setBuildingYearBuilt(data.buildingDetails?.yearBuilt?.toString() || '');
      setBuildingAmenities(data.buildingDetails?.amenities || []);
      
      // Unit features
      setUnitFeatures(data.unitFeatures || []);
      
      // Rental details
      setRentalAvailable(data.rentalDetails?.availableForRent || false);
      setRentalLeaseDurationValue(data.rentalDetails?.leaseDuration?.value || 11);
      setRentalLeaseDurationUnit(data.rentalDetails?.leaseDuration?.unit || 'months');
      setRentalNegotiable(data.rentalDetails?.rentNegotiable || true);
      setRentalPreferredTenants(data.rentalDetails?.preferredTenants || ['any']);
      setRentalIncludedInRent(data.rentalDetails?.includedInRent || []);
      
      // Website assignment
      setWebsiteAssignment(data.websiteAssignment || ['cleartitle']);
      
      // Additional info
      setVirtualTour(data.virtualTour || '');
      setFloorPlanImage(data.floorPlan?.image || '');
      setFloorPlanPublicId(data.floorPlan?.public_id || '');
      setFloorPlanDescription(data.floorPlan?.description || '');
      
      // Owner details
      setOwnerName(data.ownerDetails?.name || '');
      setOwnerPhone(data.ownerDetails?.phoneNumber || '');
      setOwnerEmail(data.ownerDetails?.email || '');
      setOwnerReason(data.ownerDetails?.reasonForSelling || '');
      
      // Legal details
      setLegalOwnershipType(data.legalDetails?.ownershipType || '');
      setLegalReraRegistered(data.legalDetails?.reraRegistered || false);
      setLegalReraNumber(data.legalDetails?.reraNumber || '');
      setLegalKhataCertificate(data.legalDetails?.khataCertificate || false);
      setLegalEncumbranceCertificate(data.legalDetails?.encumbranceCertificate || false);
      setLegalOccupancyCertificate(data.legalDetails?.occupancyCertificate || false);
      
      // Viewing schedule
      setViewingSchedule(data.viewingSchedule || []);
      
      // Contact preference
      setContactPreference(data.contactPreference || ['call', 'whatsapp']);
      
      // SEO and display
      setMetaTitle(data.metaTitle || '');
      setMetaDescription(data.metaDescription || '');
      
      // Parent property
      setParentProperty(data.parentProperty || '');
      
    } catch (error) {
      toast.error('Failed to fetch property unit details');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    
    setImages(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewImages];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  // Handle checkbox arrays
  const handleCheckboxArray = (array, value, setArray) => {
    if (array.includes(value)) {
      setArray(array.filter(item => item !== value));
    } else {
      setArray([...array, value]);
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = [];
    
    // Basic required fields
    if (!title.trim()) errors.push('Title is required');
    if (!city.trim()) errors.push('City is required');
    if (!address.trim()) errors.push('Address is required');
    if (!priceAmount || priceAmount.trim() === '') errors.push('Price amount is required');
    
    // Validate price amount is a valid positive number
    if (priceAmount) {
      const priceNum = parseFloat(priceAmount.replace(/,/g, ''));
      if (isNaN(priceNum)) {
        errors.push('Price amount must be a valid number');
      } else if (priceNum <= 0) {
        errors.push('Price amount must be greater than 0');
      }
    }
    
    // Property type specific validations
    if (propertyType === 'Plot') {
      if (!specPlotArea || specPlotArea.trim() === '' || parseFloat(specPlotArea) <= 0) {
        errors.push('Plot Area is required for Plot property type and must be greater than 0');
      }
    } else if (propertyType === 'Villa') {
      // For Villa properties - require bedrooms, bathrooms, carpetArea, and plotArea
      const bedroomsNum = parseFloat(specBedrooms);
      if (isNaN(bedroomsNum) || bedroomsNum < 0) {
        errors.push('Bedrooms must be 0 or a positive number');
      }
      
      const bathroomsNum = parseFloat(specBathrooms);
      if (isNaN(bathroomsNum) || bathroomsNum < 0) {
        errors.push('Bathrooms must be 0 or a positive number');
      }
      
      const carpetAreaNum = parseFloat(specCarpetArea);
      if (isNaN(carpetAreaNum) || carpetAreaNum <= 0) {
        errors.push('Carpet Area is required and must be greater than 0');
      }
      
      // Plot Area is REQUIRED for Villa
      if (!specPlotArea || specPlotArea.trim() === '' || parseFloat(specPlotArea) <= 0) {
        errors.push('Plot Area is required for Villa property type and must be greater than 0');
      }
      
      // Built-up Area is optional for Villa but validate if provided
      if (specBuiltUpArea && specBuiltUpArea.trim() !== '') {
        const builtUpAreaNum = parseFloat(specBuiltUpArea);
        if (isNaN(builtUpAreaNum) || builtUpAreaNum <= 0) {
          errors.push('Built-up Area must be greater than 0 if provided');
        }
      }
    } else if (propertyType === 'Commercial Space') {
      // For Commercial Space - require carpetArea and builtUpArea
      const carpetAreaNum = parseFloat(specCarpetArea);
      if (isNaN(carpetAreaNum) || carpetAreaNum <= 0) {
        errors.push('Carpet Area is required and must be greater than 0');
      }
      
      const builtUpAreaNum = parseFloat(specBuiltUpArea);
      if (isNaN(builtUpAreaNum) || builtUpAreaNum <= 0) {
        errors.push('Built-up Area is required and must be greater than 0');
      }
      
      // Bedrooms and bathrooms are optional for Commercial Space
      if (specBedrooms && specBedrooms.trim() !== '') {
        const bedroomsNum = parseFloat(specBedrooms);
        if (isNaN(bedroomsNum) || bedroomsNum < 0) {
          errors.push('Bedrooms must be 0 or a positive number if provided');
        }
      }
      
      if (specBathrooms && specBathrooms.trim() !== '') {
        const bathroomsNum = parseFloat(specBathrooms);
        if (isNaN(bathroomsNum) || bathroomsNum < 0) {
          errors.push('Bathrooms must be 0 or a positive number if provided');
        }
      }
    } else {
      // For other non-Plot properties (Apartment, Independent House, etc.)
      const bedroomsNum = parseFloat(specBedrooms);
      if (isNaN(bedroomsNum) || bedroomsNum < 0) {
        errors.push('Bedrooms must be 0 or a positive number');
      }
      
      const bathroomsNum = parseFloat(specBathrooms);
      if (isNaN(bathroomsNum) || bathroomsNum < 0) {
        errors.push('Bathrooms must be 0 or a positive number');
      }
      
      const carpetAreaNum = parseFloat(specCarpetArea);
      if (isNaN(carpetAreaNum) || carpetAreaNum <= 0) {
        errors.push('Carpet Area is required and must be greater than 0');
      }
      
      const builtUpAreaNum = parseFloat(specBuiltUpArea);
      if (isNaN(builtUpAreaNum) || builtUpAreaNum <= 0) {
        errors.push('Built-up Area is required and must be greater than 0');
      }
      
      // Plot Area is optional for other properties but validate if provided
      if (specPlotArea && specPlotArea.trim() !== '') {
        const plotAreaNum = parseFloat(specPlotArea);
        if (isNaN(plotAreaNum) || plotAreaNum <= 0) {
          errors.push('Plot Area must be greater than 0 if provided');
        }
      }
    }
    
    // Validate other numeric fields
    const numericValidations = [
      { name: 'Maintenance Charges', value: maintenanceCharges, min: 0 },
      { name: 'Security Deposit', value: securityDeposit, min: 0 },
      { name: 'Balconies', value: specBalconies, min: 0 },
      { name: 'Floors in Unit', value: specFloors, min: 1 },
      { name: 'Covered Parking', value: specParkingCovered, min: 0 },
      { name: 'Open Parking', value: specParkingOpen, min: 0 },
      { name: 'Age of Property', value: specAgeOfProperty, min: 0, optional: true },
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
    
    // Validate building year
    if (buildingYearBuilt && buildingYearBuilt !== '') {
      const yearNum = parseInt(buildingYearBuilt);
      if (isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear) {
        errors.push(`Year Built must be between 1950 and ${currentYear}`);
      }
    }
    
    // Validate images
    if (!images.length && mode === 'create') {
      errors.push('At least one image is required');
    }
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Prepare data exactly as backend expects
      const dataToSend = {
        title: title.trim(),
        description: description.trim(),
        unitNumber: unitNumber.trim(),
        city: city.trim(),
        address: address.trim(),
        coordinates: {
          latitude: coordinatesLat ? parseFloat(coordinatesLat) : undefined,
          longitude: coordinatesLng ? parseFloat(coordinatesLng) : undefined
        },
        mapUrl: mapUrl.trim(),
        price: {
          amount: priceAmount.trim(), // Backend expects string for amount
          currency: priceCurrency,
          perUnit: pricePerUnit
        },
        maintenanceCharges: Number(maintenanceCharges) || 0,
        securityDeposit: Number(securityDeposit) || 0,
        propertyType,
        specifications: {
          bedrooms: propertyType === 'Plot' ? 0 : Number(specBedrooms) || 0,
          bathrooms: propertyType === 'Plot' ? 0 : Number(specBathrooms) || 0,
          balconies: Number(specBalconies) || 0,
          floors: Number(specFloors) || 1,
          floorNumber: specFloorNumber ? Number(specFloorNumber) : undefined,
          carpetArea: Number(specCarpetArea) || 0,
          builtUpArea: Number(specBuiltUpArea) || 0,
          superBuiltUpArea: specSuperBuiltUpArea ? Number(specSuperBuiltUpArea) : undefined,
          plotArea: specPlotArea ? Number(specPlotArea) : undefined,
          furnishing: specFurnishing,
          possessionStatus: specPossessionStatus,
          ageOfProperty: specAgeOfProperty ? Number(specAgeOfProperty) : undefined,
          parking: {
            covered: Number(specParkingCovered) || 0,
            open: Number(specParkingOpen) || 0
          },
          kitchenType: specKitchenType
        },
        buildingDetails: {
          name: buildingName.trim(),
          totalFloors: buildingTotalFloors ? Number(buildingTotalFloors) : undefined,
          totalUnits: buildingTotalUnits ? Number(buildingTotalUnits) : undefined,
          yearBuilt: buildingYearBuilt ? Number(buildingYearBuilt) : undefined,
          amenities: buildingAmenities
        },
        unitFeatures,
        rentalDetails: {
          availableForRent: rentalAvailable,
          leaseDuration: {
            value: Number(rentalLeaseDurationValue) || 11,
            unit: rentalLeaseDurationUnit
          },
          rentNegotiable: rentalNegotiable,
          preferredTenants: rentalPreferredTenants,
          includedInRent: rentalIncludedInRent
        },
        availability,
        listingType,
        websiteAssignment,
        virtualTour: virtualTour.trim(),
        floorPlan: {
          image: floorPlanImage.trim(),
          public_id: floorPlanPublicId.trim(),
          description: floorPlanDescription.trim()
        },
        ownerDetails: {
          name: ownerName.trim(),
          phoneNumber: ownerPhone.trim(),
          email: ownerEmail.trim(),
          reasonForSelling: ownerReason.trim()
        },
        legalDetails: {
          ownershipType: legalOwnershipType && legalOwnershipType.trim() !== '' ? legalOwnershipType.trim() : undefined,
          reraRegistered: legalReraRegistered,
          reraNumber: legalReraNumber.trim(),
          khataCertificate: legalKhataCertificate,
          encumbranceCertificate: legalEncumbranceCertificate,
          occupancyCertificate: legalOccupancyCertificate
        },
        contactPreference,
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        parentProperty: parentProperty.trim() || undefined,
        // REMOVED: displayOrder, isFeatured, isVerified, approvalStatus - backend will set defaults
      };
      
      // Clean up empty strings and undefined values
      const cleanData = {};
      Object.keys(dataToSend).forEach(key => {
        const value = dataToSend[key];
        
        // Skip completely undefined/null values
        if (value === null || value === undefined) {
          return;
        }
        
        // Handle objects
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Clean nested objects
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
        // Handle arrays
        else if (Array.isArray(value)) {
          // Only include non-empty arrays
          if (value.length > 0) {
            cleanData[key] = value;
          }
        }
        // Handle strings
        else if (typeof value === 'string') {
          // Only include non-empty strings
          if (value.trim() !== '') {
            cleanData[key] = value.trim();
          }
        }
        // Handle other types (numbers, booleans)
        else {
          cleanData[key] = value;
        }
      });
      
      // Special handling for legalDetails.ownershipType
      if (cleanData.legalDetails && cleanData.legalDetails.ownershipType === '') {
        delete cleanData.legalDetails.ownershipType;
      }
      
      // If legalDetails ends up empty, remove it completely
      if (cleanData.legalDetails && Object.keys(cleanData.legalDetails).length === 0) {
        delete cleanData.legalDetails;
      }
      
      // Special handling for ownerDetails
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
      
      // Create FormData
      const formDataToSend = new FormData();
      
      // Append all data as JSON strings (backend expects JSON strings for nested objects)
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] !== null && cleanData[key] !== undefined) {
          if (typeof cleanData[key] === 'object' && !Array.isArray(cleanData[key])) {
            // Stringify nested objects for backend to parse
            formDataToSend.append(key, JSON.stringify(cleanData[key]));
          } else if (Array.isArray(cleanData[key])) {
            // Stringify arrays for backend to parse
            formDataToSend.append(key, JSON.stringify(cleanData[key]));
          } else {
            formDataToSend.append(key, cleanData[key]);
          }
        }
      });
      
      // Append images
      if (images.length > 0) {
        images.forEach((image, index) => {
          formDataToSend.append('images', image);
        });
      } else if (mode === 'edit') {
        // For edit mode, if no new images, send empty array
        formDataToSend.append('images', JSON.stringify([]));
      }
      
      let response;
      if (mode === 'create') {
        response = await propertyUnitAPI.createPropertyUnit(formDataToSend);
        toast.success('Property unit created successfully! It will be visible after admin approval.');
        
        // Navigate to profile page after successful creation
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
      
      // More detailed error messages
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

  // Helper function to render input
  const renderInput = (label, value, onChange, type = 'text', placeholder = '', required = false, min = null, max = null) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
      />
    </div>
  );

  // Helper function to render textarea
  const renderTextarea = (label, value, onChange, placeholder = '', required = false, rows = 3) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
    </div>
  );

  // Helper function to render select
  const renderSelect = (label, value, onChange, options, required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option.charAt(0).toUpperCase() + option.slice(1).replace(/-/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  );

  // Helper function to render year select
  const renderYearSelect = (label, value, onChange, required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
      >
        <option value="">Select Year</option>
        {yearOptions.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );

  // Helper function to render checkbox
  const renderCheckbox = (label, checked, onChange) => (
    <div className="flex items-center mb-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );

  // Helper function to render checkbox group
  const renderCheckboxGroup = (label, options, selectedValues, onChange) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="space-y-2">
        {options.map(option => (
          <div key={option} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={() => onChange(option)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {mode === 'create' ? 'Add New Property Unit' : 'Edit Property Unit'}
        </h1>
        <p className="text-gray-600 mb-8">
          Fill in the details below to {mode === 'create' ? 'list a new' : 'update'} property unit
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('Title *', title, setTitle, 'text', 'e.g., Luxury 3BHK Apartment', true)}
              {renderInput('Unit Number', unitNumber, setUnitNumber, 'text', 'e.g., Unit 101, Villa A1')}
              <div className="md:col-span-2">
                {renderTextarea('Description', description, setDescription, 'Detailed description of the property')}
              </div>
              {renderInput('Parent Property ID', parentProperty, setParentProperty, 'text', 'Property ID for grouping (optional)')}
            </div>
          </div>
          
          {/* Location Section */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('City *', city, setCity, 'text', 'e.g., Mumbai', true)}
              {renderInput('Address *', address, setAddress, 'text', 'Full address', true)}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('Latitude', coordinatesLat, setCoordinatesLat, 'text', 'e.g., 19.0760')}
              {renderInput('Longitude', coordinatesLng, setCoordinatesLng, 'text', 'e.g., 72.8777')}
            </div>
            {/* Add Map URL field */}
            <div className="mt-4">
              {renderInput('Map URL (Optional)', mapUrl, setMapUrl, 'text', 'Google Maps embed URL or map image URL')}
              <p className="text-sm text-gray-500 mt-1">
                Paste Google Maps embed URL or any map service link. Example: https://maps.google.com/...
              </p>
            </div>
          </div>
          
          {/* Price Section */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Pricing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderInput('Price Amount *', priceAmount, setPriceAmount, 'text', 'e.g., 10000000', true, 1)}
              {renderSelect('Currency', priceCurrency, setPriceCurrency, currencies)}
              {renderSelect('Per Unit', pricePerUnit, setPricePerUnit, perUnitOptions)}
              {renderInput('Maintenance Charges', maintenanceCharges, setMaintenanceCharges, 'number', 'Monthly charges', false, 0)}
              {renderInput('Security Deposit', securityDeposit, setSecurityDeposit, 'number', 'Refundable deposit', false, 0)}
            </div>
          </div>
          
          {/* Property Type & Status */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Property Type & Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderSelect('Property Type *', propertyType, setPropertyType, propertyTypes, true)}
              {renderSelect('Listing Type', listingType, setListingType, listingTypes)}
              {renderSelect('Availability', availability, setAvailability, availabilityOptions)}
            </div>
          </div>
          
          {/* Specifications Section */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Property Specifications</h2>
            
            {/* Helper text based on property type */}
            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Requirements based on property type:</span>
                {propertyType === 'Plot' && ' Plot Area is required.'}
                {propertyType === 'Villa' && ' Bedrooms, Bathrooms, Carpet Area, and Plot Area are required.'}
                {propertyType === 'Commercial Space' && ' Carpet Area and Built-up Area are required.'}
                {propertyType !== 'Plot' && propertyType !== 'Villa' && propertyType !== 'Commercial Space' && 
                  ' Bedrooms, Bathrooms, Carpet Area, and Built-up Area are required.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Bedrooms - required for most properties except Plot and optional for Commercial Space */}
              {propertyType !== 'Plot' && (
                renderInput(
                  'Bedrooms' + (propertyType !== 'Commercial Space' ? ' *' : ''), 
                  specBedrooms, 
                  setSpecBedrooms, 
                  'number', 
                  'e.g., 2', 
                  propertyType !== 'Commercial Space',
                  0
                )
              )}
              
              {/* Bathrooms - required for most properties except Plot and optional for Commercial Space */}
              {propertyType !== 'Plot' && (
                renderInput(
                  'Bathrooms' + (propertyType !== 'Commercial Space' ? ' *' : ''), 
                  specBathrooms, 
                  setSpecBathrooms, 
                  'number', 
                  'e.g., 2', 
                  propertyType !== 'Commercial Space',
                  0
                )
              )}
              
              {/* Carpet Area - required for all properties except Plot */}
              {propertyType !== 'Plot' && renderInput(
                'Carpet Area (sq.ft.) *', 
                specCarpetArea, 
                setSpecCarpetArea, 
                'number', 
                'e.g., 1200', 
                true,
                1
              )}
              
              {/* Built-up Area - required for non-Plot and non-Villa properties */}
              {propertyType !== 'Plot' && propertyType !== 'Villa' && renderInput(
                'Built-up Area (sq.ft.) *', 
                specBuiltUpArea, 
                setSpecBuiltUpArea, 
                'number', 
                'e.g., 1400', 
                true,
                1
              )}
              
              {/* Built-up Area - optional for Villa */}
              {propertyType === 'Villa' && renderInput(
                'Built-up Area (sq.ft.)', 
                specBuiltUpArea, 
                setSpecBuiltUpArea, 
                'number', 
                'e.g., 1400'
              )}
              
              {/* Plot Area - required for Plot and Villa properties */}
              {(propertyType === 'Plot' || propertyType === 'Villa') && renderInput(
                'Plot Area (sq.ft.) *', 
                specPlotArea, 
                setSpecPlotArea, 
                'number', 
                'e.g., 500', 
                true,
                1
              )}
              
              {/* Plot Area - optional for other property types */}
              {propertyType !== 'Plot' && propertyType !== 'Villa' && renderInput(
                'Plot Area (sq.ft.)', 
                specPlotArea, 
                setSpecPlotArea, 
                'number', 
                'e.g., 500'
              )}
              
              {/* Super Built-up Area - optional for all except Plot */}
              {propertyType !== 'Plot' && renderInput(
                'Super Built-up Area (sq.ft.)', 
                specSuperBuiltUpArea, 
                setSpecSuperBuiltUpArea, 
                'number', 
                'e.g., 1500'
              )}
              
              {renderInput('Balconies', specBalconies, setSpecBalconies, 'number', 'e.g., 2', false, 0)}
              {renderInput('Floors in Unit', specFloors, setSpecFloors, 'number', 'e.g., 1', false, 1)}
              {renderInput('Floor Number', specFloorNumber, setSpecFloorNumber, 'number', 'e.g., 3')}
              {renderSelect('Furnishing', specFurnishing, setSpecFurnishing, furnishingOptions)}
              {renderSelect('Possession Status', specPossessionStatus, setSpecPossessionStatus, possessionOptions)}
              {renderInput('Age of Property (years)', specAgeOfProperty, setSpecAgeOfProperty, 'number', 'e.g., 5', false, 0)}
              {renderSelect('Kitchen Type', specKitchenType, setSpecKitchenType, kitchenTypes)}
              {renderInput('Covered Parking', specParkingCovered, setSpecParkingCovered, 'number', 'e.g., 1', false, 0)}
              {renderInput('Open Parking', specParkingOpen, setSpecParkingOpen, 'number', 'e.g., 1', false, 0)}
            </div>
          </div>
          
          {/* Building Details */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Building Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderInput('Building Name', buildingName, setBuildingName, 'text', 'e.g., Skyline Towers')}
              {renderInput('Total Floors', buildingTotalFloors, setBuildingTotalFloors, 'number', 'e.g., 20')}
              {renderInput('Total Units', buildingTotalUnits, setBuildingTotalUnits, 'number', 'e.g., 80')}
              {renderYearSelect('Year Built', buildingYearBuilt, setBuildingYearBuilt)}
            </div>
            
            {/* Building Amenities */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Building Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenitiesOptions.map(amenity => (
                  <div key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={buildingAmenities.includes(amenity)}
                      onChange={() => handleCheckboxArray(buildingAmenities, amenity, setBuildingAmenities)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">{amenity}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Unit Features */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Unit Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {unitFeaturesOptions.map(feature => (
                <div key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={unitFeatures.includes(feature)}
                    onChange={() => handleCheckboxArray(unitFeatures, feature, setUnitFeatures)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">{feature}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rental Details */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Rental Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {renderCheckbox('Available for Rent', rentalAvailable, setRentalAvailable)}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Duration
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={rentalLeaseDurationValue}
                      onChange={(e) => setRentalLeaseDurationValue(e.target.value)}
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                    <select
                      value={rentalLeaseDurationUnit}
                      onChange={(e) => setRentalLeaseDurationUnit(e.target.value)}
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
                
                {renderCheckbox('Rent Negotiable', rentalNegotiable, setRentalNegotiable)}
              </div>
              
              <div className="space-y-4">
                {renderCheckboxGroup('Preferred Tenants', preferredTenantsOptions, rentalPreferredTenants, 
                  (tenant) => handleCheckboxArray(rentalPreferredTenants, tenant, setRentalPreferredTenants)
                )}
                
                {renderCheckboxGroup('Included in Rent', includedInRentOptions, rentalIncludedInRent,
                  (item) => handleCheckboxArray(rentalIncludedInRent, item, setRentalIncludedInRent)
                )}
              </div>
            </div>
          </div>
          
          {/* Website Assignment */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Website Assignment</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select websites where this property should be listed. Default is ClearTitle.
              </p>
              <div className="flex flex-wrap gap-4">
                {websiteOptions.map(website => {
                  const displayName = website.charAt(0).toUpperCase() + website.slice(1);
                  
                  return (
                    <div key={website} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={websiteAssignment.includes(website)}
                        onChange={() => handleCheckboxArray(websiteAssignment, website, setWebsiteAssignment)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700">
                        {displayName}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Image Upload Section */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Property Images</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images <span className="text-red-500">*</span>
                <span className="text-gray-500 text-sm ml-2">(Max 10 images, at least 1 required)</span>
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-2 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
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
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
            </div>
            
            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Image Previews</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {images.length} image(s) selected
                </p>
              </div>
            )}
          </div>
          
          {/* Additional Information */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('Virtual Tour URL', virtualTour, setVirtualTour, 'text', 'https://matterport.com/...')}
              
              {/* Floor Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Plan Image URL
                </label>
                <input
                  type="text"
                  value={floorPlanImage}
                  onChange={(e) => setFloorPlanImage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Floor plan image URL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Plan Description
                </label>
                <textarea
                  value={floorPlanDescription}
                  onChange={(e) => setFloorPlanDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description of floor plan"
                  rows={2}
                />
              </div>
              
              {renderInput('Meta Title', metaTitle, setMetaTitle, 'text', 'SEO title (optional)')}
              {renderTextarea('Meta Description', metaDescription, setMetaDescription, 'SEO description (optional)')}
            </div>
          </div>
          
          {/* Owner Details */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Owner Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('Owner Name', ownerName, setOwnerName, 'text', 'e.g., Ramesh Kumar')}
              {renderInput('Phone Number', ownerPhone, setOwnerPhone, 'tel', 'e.g., +91 9876543210')}
              {renderInput('Email', ownerEmail, setOwnerEmail, 'email', 'e.g., owner@example.com')}
              <div className="md:col-span-2">
                {renderTextarea('Reason for Selling', ownerReason, setOwnerReason, 'e.g., Moving abroad, upgrading, etc.')}
              </div>
            </div>
          </div>
          
          {/* Legal Details */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Legal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Ownership Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ownership Type
                </label>
                <select
                  value={legalOwnershipType}
                  onChange={(e) => setLegalOwnershipType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Ownership Type</option>
                  {ownershipTypeOptions.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1).replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              {renderInput('RERA Number', legalReraNumber, setLegalReraNumber, 'text', 'e.g., PRM/KA/RERA/1251/...')}
              {renderCheckbox('RERA Registered', legalReraRegistered, setLegalReraRegistered)}
              {renderCheckbox('Khata Certificate', legalKhataCertificate, setLegalKhataCertificate)}
              {renderCheckbox('Encumbrance Certificate', legalEncumbranceCertificate, setLegalEncumbranceCertificate)}
              {renderCheckbox('Occupancy Certificate', legalOccupancyCertificate, setLegalOccupancyCertificate)}
            </div>
          </div>
          
          {/* Contact Preference */}
          <div className="border-b pb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Contact Preference</h2>
            <div className="flex flex-wrap gap-4">
              {contactPreferenceOptions.map(pref => (
                <div key={pref} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contactPreference.includes(pref)}
                    onChange={() => handleCheckboxArray(contactPreference, pref, setContactPreference)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-8">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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