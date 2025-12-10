import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { propertyUnitAPI } from '../api/propertyUnitAPI';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const PropertyUnitForm = ({ propertyUnitId, onSuccess, mode = 'create' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  
  // All individual state fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [coordinatesLat, setCoordinatesLat] = useState('');
  const [coordinatesLng, setCoordinatesLng] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('INR');
  const [pricePerUnit, setPricePerUnit] = useState('total');
  const [maintenanceCharges, setMaintenanceCharges] = useState(0);
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [propertyType, setPropertyType] = useState('Apartment');
  const [availability, setAvailability] = useState('available');
  const [listingType, setListingType] = useState('sale');
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
  const [buildingName, setBuildingName] = useState('');
  const [buildingTotalFloors, setBuildingTotalFloors] = useState('');
  const [buildingTotalUnits, setBuildingTotalUnits] = useState('');
  const [buildingYearBuilt, setBuildingYearBuilt] = useState('');
  const [buildingAmenities, setBuildingAmenities] = useState([]);
  const [unitFeatures, setUnitFeatures] = useState([]);
  const [rentalAvailable, setRentalAvailable] = useState(false);
  const [rentalLeaseDurationValue, setRentalLeaseDurationValue] = useState(11);
  const [rentalLeaseDurationUnit, setRentalLeaseDurationUnit] = useState('months');
  const [rentalNegotiable, setRentalNegotiable] = useState(true);
  const [rentalPreferredTenants, setRentalPreferredTenants] = useState(['any']);
  const [rentalIncludedInRent, setRentalIncludedInRent] = useState([]);
  const [websiteAssignment, setWebsiteAssignment] = useState(['cleartitle']);
  const [virtualTour, setVirtualTour] = useState('');
  const [floorPlanImage, setFloorPlanImage] = useState('');
  const [floorPlanPublicId, setFloorPlanPublicId] = useState('');
  const [floorPlanDescription, setFloorPlanDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerReason, setOwnerReason] = useState('');
  const [legalOwnershipType, setLegalOwnershipType] = useState('');
  const [legalReraRegistered, setLegalReraRegistered] = useState(false);
  const [legalReraNumber, setLegalReraNumber] = useState('');
  const [legalKhataCertificate, setLegalKhataCertificate] = useState(false);
  const [legalEncumbranceCertificate, setLegalEncumbranceCertificate] = useState(false);
  const [legalOccupancyCertificate, setLegalOccupancyCertificate] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState([]);
  const [contactPreference, setContactPreference] = useState(['call', 'whatsapp']);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [parentProperty, setParentProperty] = useState('');

  // Memoized options arrays to prevent re-renders
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
      
      if (data.images && data.images.length > 0) {
        setPreviewImages(data.images.map(img => img.url));
      }
      
      setTitle(data.title || '');
      setDescription(data.description || '');
      setUnitNumber(data.unitNumber || '');
      setCity(data.city || '');
      setAddress(data.address || '');
      setCoordinatesLat(data.coordinates?.latitude || '');
      setCoordinatesLng(data.coordinates?.longitude || '');
      setMapUrl(data.mapUrl || '');
      setPriceAmount(data.price?.amount?.toString() || '');
      setPriceCurrency(data.price?.currency || 'INR');
      setPricePerUnit(data.price?.perUnit || 'total');
      setMaintenanceCharges(data.maintenanceCharges || 0);
      setSecurityDeposit(data.securityDeposit || 0);
      setPropertyType(data.propertyType || 'Apartment');
      setAvailability(data.availability || 'available');
      setListingType(data.listingType || 'sale');
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
      setBuildingName(data.buildingDetails?.name || '');
      setBuildingTotalFloors(data.buildingDetails?.totalFloors?.toString() || '');
      setBuildingTotalUnits(data.buildingDetails?.totalUnits?.toString() || '');
      setBuildingYearBuilt(data.buildingDetails?.yearBuilt?.toString() || '');
      setBuildingAmenities(data.buildingDetails?.amenities || []);
      setUnitFeatures(data.unitFeatures || []);
      setRentalAvailable(data.rentalDetails?.availableForRent || false);
      setRentalLeaseDurationValue(data.rentalDetails?.leaseDuration?.value || 11);
      setRentalLeaseDurationUnit(data.rentalDetails?.leaseDuration?.unit || 'months');
      setRentalNegotiable(data.rentalDetails?.rentNegotiable || true);
      setRentalPreferredTenants(data.rentalDetails?.preferredTenants || ['any']);
      setRentalIncludedInRent(data.rentalDetails?.includedInRent || []);
      setWebsiteAssignment(data.websiteAssignment || ['cleartitle']);
      setVirtualTour(data.virtualTour || '');
      setFloorPlanImage(data.floorPlan?.image || '');
      setFloorPlanPublicId(data.floorPlan?.public_id || '');
      setFloorPlanDescription(data.floorPlan?.description || '');
      setOwnerName(data.ownerDetails?.name || '');
      setOwnerPhone(data.ownerDetails?.phoneNumber || '');
      setOwnerEmail(data.ownerDetails?.email || '');
      setOwnerReason(data.ownerDetails?.reasonForSelling || '');
      setLegalOwnershipType(data.legalDetails?.ownershipType || '');
      setLegalReraRegistered(data.legalDetails?.reraRegistered || false);
      setLegalReraNumber(data.legalDetails?.reraNumber || '');
      setLegalKhataCertificate(data.legalDetails?.khataCertificate || false);
      setLegalEncumbranceCertificate(data.legalDetails?.encumbranceCertificate || false);
      setLegalOccupancyCertificate(data.legalDetails?.occupancyCertificate || false);
      setViewingSchedule(data.viewingSchedule || []);
      setContactPreference(data.contactPreference || ['call', 'whatsapp']);
      setMetaTitle(data.metaTitle || '');
      setMetaDescription(data.metaDescription || '');
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
    
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const removeImage = useCallback((index) => {
    const newImages = [...images];
    const newPreviews = [...previewImages];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setPreviewImages(newPreviews);
  }, [images, previewImages]);

  const handleCheckboxArray = useCallback((array, value, setArray) => {
    if (array.includes(value)) {
      setArray(array.filter(item => item !== value));
    } else {
      setArray([...array, value]);
    }
  }, []);

  const validateForm = useCallback(() => {
    const errors = [];
    
    if (!title.trim()) errors.push('Title is required');
    if (!city.trim()) errors.push('City is required');
    if (!address.trim()) errors.push('Address is required');
    if (!priceAmount || priceAmount.trim() === '') errors.push('Price amount is required');
    
    if (priceAmount) {
      const priceNum = parseFloat(priceAmount.replace(/,/g, ''));
      if (isNaN(priceNum)) {
        errors.push('Price amount must be a valid number');
      } else if (priceNum <= 0) {
        errors.push('Price amount must be greater than 0');
      }
    }
    
    if (propertyType === 'Plot') {
      if (!specPlotArea || specPlotArea.trim() === '' || parseFloat(specPlotArea) <= 0) {
        errors.push('Plot Area is required for Plot property type and must be greater than 0');
      }
    } else if (propertyType === 'Villa') {
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
      
      if (!specPlotArea || specPlotArea.trim() === '' || parseFloat(specPlotArea) <= 0) {
        errors.push('Plot Area is required for Villa property type and must be greater than 0');
      }
      
      if (specBuiltUpArea && specBuiltUpArea.trim() !== '') {
        const builtUpAreaNum = parseFloat(specBuiltUpArea);
        if (isNaN(builtUpAreaNum) || builtUpAreaNum <= 0) {
          errors.push('Built-up Area must be greater than 0 if provided');
        }
      }
    } else if (propertyType === 'Commercial Space') {
      const carpetAreaNum = parseFloat(specCarpetArea);
      if (isNaN(carpetAreaNum) || carpetAreaNum <= 0) {
        errors.push('Carpet Area is required and must be greater than 0');
      }
      
      const builtUpAreaNum = parseFloat(specBuiltUpArea);
      if (isNaN(builtUpAreaNum) || builtUpAreaNum <= 0) {
        errors.push('Built-up Area is required and must be greater than 0');
      }
      
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
      
      if (specPlotArea && specPlotArea.trim() !== '') {
        const plotAreaNum = parseFloat(specPlotArea);
        if (isNaN(plotAreaNum) || plotAreaNum <= 0) {
          errors.push('Plot Area must be greater than 0 if provided');
        }
      }
    }
    
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
    
    if (buildingYearBuilt && buildingYearBuilt !== '') {
      const yearNum = parseInt(buildingYearBuilt);
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
  }, [title, city, address, priceAmount, propertyType, specBedrooms, specBathrooms, specCarpetArea, 
      specBuiltUpArea, specPlotArea, maintenanceCharges, securityDeposit, specBalconies, specFloors, 
      specParkingCovered, specParkingOpen, specAgeOfProperty, buildingYearBuilt, images, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
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
          amount: priceAmount.trim(),
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

  // Helper Components - Moved outside main component to prevent re-renders
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
        
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <ResponsiveInput 
                label="Title *" 
                value={title} 
                onChange={setTitle} 
                placeholder="e.g., Luxury 3BHK Apartment" 
                required 
              />
              <ResponsiveInput 
                label="Unit Number" 
                value={unitNumber} 
                onChange={setUnitNumber} 
                placeholder="e.g., Unit 101, Villa A1" 
              />
              <div className="sm:col-span-2">
                <ResponsiveTextarea 
                  label="Description" 
                  value={description} 
                  onChange={setDescription} 
                  placeholder="Detailed description of the property" 
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2">
                <ResponsiveInput 
                  label="Parent Property ID" 
                  value={parentProperty} 
                  onChange={setParentProperty} 
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
                value={city} 
                onChange={setCity} 
                placeholder="e.g., Mumbai" 
                required 
              />
              <ResponsiveInput 
                label="Address *" 
                value={address} 
                onChange={setAddress} 
                placeholder="Full address" 
                required 
              />
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <ResponsiveInput 
                label="Latitude" 
                value={coordinatesLat} 
                onChange={setCoordinatesLat} 
                placeholder="e.g., 19.0760" 
              />
              <ResponsiveInput 
                label="Longitude" 
                value={coordinatesLng} 
                onChange={setCoordinatesLng} 
                placeholder="e.g., 72.8777" 
              />
            </div>
            <div className="mt-3 sm:mt-4">
              <ResponsiveInput 
                label="Map URL (Optional)" 
                value={mapUrl} 
                onChange={setMapUrl} 
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
                value={priceAmount} 
                onChange={setPriceAmount} 
                placeholder="e.g., 10000000" 
                required 
                min="1"
              />
              <ResponsiveSelect 
                label="Currency" 
                value={priceCurrency} 
                onChange={setPriceCurrency} 
                options={currencies} 
              />
              <ResponsiveSelect 
                label="Per Unit" 
                value={pricePerUnit} 
                onChange={setPricePerUnit} 
                options={perUnitOptions} 
              />
              <ResponsiveInput 
                label="Maintenance Charges" 
                value={maintenanceCharges} 
                onChange={setMaintenanceCharges} 
                type="number" 
                placeholder="Monthly charges" 
                min="0"
              />
              <ResponsiveInput 
                label="Security Deposit" 
                value={securityDeposit} 
                onChange={setSecurityDeposit} 
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
                value={propertyType} 
                onChange={setPropertyType} 
                options={propertyTypes} 
                required 
              />
              <ResponsiveSelect 
                label="Listing Type" 
                value={listingType} 
                onChange={setListingType} 
                options={listingTypes} 
              />
              <ResponsiveSelect 
                label="Availability" 
                value={availability} 
                onChange={setAvailability} 
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
                {propertyType === 'Plot' && ' Plot Area is required.'}
                {propertyType === 'Villa' && ' Bedrooms, Bathrooms, Carpet Area, and Plot Area are required.'}
                {propertyType === 'Commercial Space' && ' Carpet Area and Built-up Area are required.'}
                {propertyType !== 'Plot' && propertyType !== 'Villa' && propertyType !== 'Commercial Space' && 
                  ' Bedrooms, Bathrooms, Carpet Area, and Built-up Area are required.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {propertyType !== 'Plot' && (
                <ResponsiveInput
                  label={'Bedrooms' + (propertyType !== 'Commercial Space' ? ' *' : '')}
                  value={specBedrooms}
                  onChange={setSpecBedrooms}
                  type="number"
                  placeholder="e.g., 2"
                  required={propertyType !== 'Commercial Space'}
                  min="0"
                />
              )}
              
              {propertyType !== 'Plot' && (
                <ResponsiveInput
                  label={'Bathrooms' + (propertyType !== 'Commercial Space' ? ' *' : '')}
                  value={specBathrooms}
                  onChange={setSpecBathrooms}
                  type="number"
                  placeholder="e.g., 2"
                  required={propertyType !== 'Commercial Space'}
                  min="0"
                />
              )}
              
              {propertyType !== 'Plot' && (
                <ResponsiveInput
                  label="Carpet Area (sq.ft.) *"
                  value={specCarpetArea}
                  onChange={setSpecCarpetArea}
                  type="number"
                  placeholder="e.g., 1200"
                  required
                  min="1"
                />
              )}
              
              {propertyType !== 'Plot' && propertyType !== 'Villa' && (
                <ResponsiveInput
                  label="Built-up Area (sq.ft.) *"
                  value={specBuiltUpArea}
                  onChange={setSpecBuiltUpArea}
                  type="number"
                  placeholder="e.g., 1400"
                  required
                  min="1"
                />
              )}
              
              {propertyType === 'Villa' && (
                <ResponsiveInput
                  label="Built-up Area (sq.ft.)"
                  value={specBuiltUpArea}
                  onChange={setSpecBuiltUpArea}
                  type="number"
                  placeholder="e.g., 1400"
                />
              )}
              
              {(propertyType === 'Plot' || propertyType === 'Villa') && (
                <ResponsiveInput
                  label="Plot Area (sq.ft.) *"
                  value={specPlotArea}
                  onChange={setSpecPlotArea}
                  type="number"
                  placeholder="e.g., 500"
                  required
                  min="1"
                />
              )}
              
              {propertyType !== 'Plot' && propertyType !== 'Villa' && (
                <ResponsiveInput
                  label="Plot Area (sq.ft.)"
                  value={specPlotArea}
                  onChange={setSpecPlotArea}
                  type="number"
                  placeholder="e.g., 500"
                />
              )}
              
              {propertyType !== 'Plot' && (
                <ResponsiveInput
                  label="Super Built-up Area (sq.ft.)"
                  value={specSuperBuiltUpArea}
                  onChange={setSpecSuperBuiltUpArea}
                  type="number"
                  placeholder="e.g., 1500"
                />
              )}
              
              <ResponsiveInput
                label="Balconies"
                value={specBalconies}
                onChange={setSpecBalconies}
                type="number"
                placeholder="e.g., 2"
                min="0"
              />
              
              <ResponsiveInput
                label="Floors in Unit"
                value={specFloors}
                onChange={setSpecFloors}
                type="number"
                placeholder="e.g., 1"
                min="1"
              />
              
              <ResponsiveInput
                label="Floor Number"
                value={specFloorNumber}
                onChange={setSpecFloorNumber}
                type="number"
                placeholder="e.g., 3"
              />
              
              <ResponsiveSelect
                label="Furnishing"
                value={specFurnishing}
                onChange={setSpecFurnishing}
                options={furnishingOptions}
              />
              
              <ResponsiveSelect
                label="Possession Status"
                value={specPossessionStatus}
                onChange={setSpecPossessionStatus}
                options={possessionOptions}
              />
              
              <ResponsiveInput
                label="Age of Property (years)"
                value={specAgeOfProperty}
                onChange={setSpecAgeOfProperty}
                type="number"
                placeholder="e.g., 5"
                min="0"
              />
              
              <ResponsiveSelect
                label="Kitchen Type"
                value={specKitchenType}
                onChange={setSpecKitchenType}
                options={kitchenTypes}
              />
              
              <ResponsiveInput
                label="Covered Parking"
                value={specParkingCovered}
                onChange={setSpecParkingCovered}
                type="number"
                placeholder="e.g., 1"
                min="0"
              />
              
              <ResponsiveInput
                label="Open Parking"
                value={specParkingOpen}
                onChange={setSpecParkingOpen}
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
                value={buildingName}
                onChange={setBuildingName}
                placeholder="e.g., Skyline Towers"
              />
              
              <ResponsiveInput
                label="Total Floors"
                value={buildingTotalFloors}
                onChange={setBuildingTotalFloors}
                type="number"
                placeholder="e.g., 20"
              />
              
              <ResponsiveInput
                label="Total Units"
                value={buildingTotalUnits}
                onChange={setBuildingTotalUnits}
                type="number"
                placeholder="e.g., 80"
              />
              
              <ResponsiveYearSelect
                label="Year Built"
                value={buildingYearBuilt}
                onChange={setBuildingYearBuilt}
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
                      checked={buildingAmenities.includes(amenity)}
                      onChange={() => handleCheckboxArray(buildingAmenities, amenity, setBuildingAmenities)}
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
                    checked={unitFeatures.includes(feature)}
                    onChange={() => handleCheckboxArray(unitFeatures, feature, setUnitFeatures)}
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
                  checked={rentalAvailable} 
                  onChange={setRentalAvailable} 
                />
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Lease Duration
                  </label>
                  <div className="flex gap-2 sm:gap-4">
                    <input
                      type="number"
                      value={rentalLeaseDurationValue}
                      onChange={(e) => setRentalLeaseDurationValue(e.target.value)}
                      className="w-20 sm:w-24 px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                    <select
                      value={rentalLeaseDurationUnit}
                      onChange={(e) => setRentalLeaseDurationUnit(e.target.value)}
                      className="w-24 sm:w-32 px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
                
                <ResponsiveCheckbox 
                  label="Rent Negotiable" 
                  checked={rentalNegotiable} 
                  onChange={setRentalNegotiable} 
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
                          checked={rentalPreferredTenants.includes(tenant)}
                          onChange={() => handleCheckboxArray(rentalPreferredTenants, tenant, setRentalPreferredTenants)}
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
                          checked={rentalIncludedInRent.includes(item)}
                          onChange={() => handleCheckboxArray(rentalIncludedInRent, item, setRentalIncludedInRent)}
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
                        checked={websiteAssignment.includes(website)}
                        onChange={() => handleCheckboxArray(websiteAssignment, website, setWebsiteAssignment)}
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
                value={virtualTour} 
                onChange={setVirtualTour} 
                placeholder="https://matterport.com/..." 
              />
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Floor Plan Image URL
                </label>
                <input
                  type="text"
                  value={floorPlanImage}
                  onChange={(e) => setFloorPlanImage(e.target.value)}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Floor plan image URL"
                />
              </div>
              
              <div className="sm:col-span-2">
                <ResponsiveTextarea 
                  label="Floor Plan Description" 
                  value={floorPlanDescription} 
                  onChange={setFloorPlanDescription} 
                  placeholder="Description of floor plan" 
                  rows={2}
                />
              </div>
              
              <ResponsiveInput 
                label="Meta Title" 
                value={metaTitle} 
                onChange={setMetaTitle} 
                placeholder="SEO title (optional)" 
              />
              
              <div className="sm:col-span-2">
                <ResponsiveTextarea 
                  label="Meta Description" 
                  value={metaDescription} 
                  onChange={setMetaDescription} 
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
                value={ownerName} 
                onChange={setOwnerName} 
                placeholder="e.g., Ramesh Kumar" 
              />
              <ResponsiveInput 
                label="Phone Number" 
                value={ownerPhone} 
                onChange={setOwnerPhone} 
                type="tel" 
                placeholder="e.g., +91 9876543210" 
              />
              <ResponsiveInput 
                label="Email" 
                value={ownerEmail} 
                onChange={setOwnerEmail} 
                type="email" 
                placeholder="e.g., owner@example.com" 
              />
              <div className="sm:col-span-2">
                <ResponsiveTextarea 
                  label="Reason for Selling" 
                  value={ownerReason} 
                  onChange={setOwnerReason} 
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
                  value={legalOwnershipType}
                  onChange={(e) => setLegalOwnershipType(e.target.value)}
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
                value={legalReraNumber} 
                onChange={setLegalReraNumber} 
                placeholder="e.g., PRM/KA/RERA/1251/..." 
              />
              
              <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                <ResponsiveCheckbox 
                  label="RERA Registered" 
                  checked={legalReraRegistered} 
                  onChange={setLegalReraRegistered} 
                />
              </div>
              
              <ResponsiveCheckbox 
                label="Khata Certificate" 
                checked={legalKhataCertificate} 
                onChange={setLegalKhataCertificate} 
              />
              
              <ResponsiveCheckbox 
                label="Encumbrance Certificate" 
                checked={legalEncumbranceCertificate} 
                onChange={setLegalEncumbranceCertificate} 
              />
              
              <ResponsiveCheckbox 
                label="Occupancy Certificate" 
                checked={legalOccupancyCertificate} 
                onChange={setLegalOccupancyCertificate} 
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
                    checked={contactPreference.includes(pref)}
                    onChange={() => handleCheckboxArray(contactPreference, pref, setContactPreference)}
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

// Helper Components - Defined outside to prevent re-renders
const ResponsiveInput = React.memo(({ label, value, onChange, type = 'text', placeholder = '', required = false, min = null, max = null }) => (
  <div className="mb-3 sm:mb-4">
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
      onChange={(e) => onChange(e.target.value)}
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
      onChange={(e) => onChange(e.target.value)}
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

const ResponsiveYearSelect = React.memo(({ label, value, onChange, required = false }) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1949 },
    (_, i) => currentYear - i
  );
  
  return (
    <div className="mb-3 sm:mb-4">
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required={required}
      >
        <option value="">Select Year</option>
        {yearOptions.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
});

const ResponsiveCheckbox = React.memo(({ label, checked, onChange }) => (
  <div className="flex items-center mb-2 sm:mb-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label className="ml-2 block text-xs sm:text-sm text-gray-700">
      {label}
    </label>
  </div>
));

export default PropertyUnitForm;