import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { propertyUnitAPI } from '../api/propertyUnitAPI';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus, Trash2 } from 'lucide-react';

const PropertyUnitForm = ({ propertyUnitId, onSuccess, mode = 'create' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  
  // Basic Information
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [availability, setAvailability] = useState('available');
  const [listingType, setListingType] = useState('sale');
  
  // Unit Types Array (Multiple unit configurations)
  const [unitTypes, setUnitTypes] = useState([]);
  
  // Building Details
  const [buildingName, setBuildingName] = useState('');
  const [buildingTotalFloors, setBuildingTotalFloors] = useState('');
  const [buildingTotalUnits, setBuildingTotalUnits] = useState('');
  const [buildingYearBuilt, setBuildingYearBuilt] = useState('');
  const [buildingAmenities, setBuildingAmenities] = useState([]);
  
  // Unit Features
  const [unitFeatures, setUnitFeatures] = useState([]);
  
  // Common Specifications
  const [commonFurnishing, setCommonFurnishing] = useState('unfurnished');
  const [commonPossessionStatus, setCommonPossessionStatus] = useState('ready-to-move');
  const [commonAgeOfProperty, setCommonAgeOfProperty] = useState('');
  const [commonParkingCovered, setCommonParkingCovered] = useState(0);
  const [commonParkingOpen, setCommonParkingOpen] = useState(0);
  const [commonKitchenType, setCommonKitchenType] = useState('regular');
  
  // Location Nearby
  const [locationNearby, setLocationNearby] = useState([]);
  
  // Owner Details
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerReason, setOwnerReason] = useState('');
  
  // Legal Details - Complete Structure
  const [legalReraRegistered, setLegalReraRegistered] = useState(false);
  const [legalReraNumber, setLegalReraNumber] = useState('');
  const [legalReraWebsiteLink, setLegalReraWebsiteLink] = useState('');
  const [legalSanctioningAuthority, setLegalSanctioningAuthority] = useState('');
  const [legalSanctionNumber, setLegalSanctionNumber] = useState('');
  const [legalSanctionDate, setLegalSanctionDate] = useState('');
  const [legalOccupancyCertificate, setLegalOccupancyCertificate] = useState(false);
  const [legalOccupancyCertificateNumber, setLegalOccupancyCertificateNumber] = useState('');
  const [legalOccupancyCertificateDate, setLegalOccupancyCertificateDate] = useState('');
  const [legalCommencementCertificate, setLegalCommencementCertificate] = useState(false);
  const [legalCommencementCertificateNumber, setLegalCommencementCertificateNumber] = useState('');
  const [legalCommencementCertificateDate, setLegalCommencementCertificateDate] = useState('');
  const [legalKhataStatus, setLegalKhataStatus] = useState('Not Applicable');
  const [legalClearTitle, setLegalClearTitle] = useState(false);
  const [legalMotherDeedAvailable, setLegalMotherDeedAvailable] = useState(false);
  const [legalConversionCertificate, setLegalConversionCertificate] = useState(false);
  const [legalConversionType, setLegalConversionType] = useState('');
  const [legalEncumbranceCertificate, setLegalEncumbranceCertificate] = useState(false);
  const [legalEncumbranceYears, setLegalEncumbranceYears] = useState('');
  const [legalOwnershipType, setLegalOwnershipType] = useState('freehold');
  const [legalBankApprovals, setLegalBankApprovals] = useState([]);
  const [legalStatusSummary, setLegalStatusSummary] = useState('');
  const [legalVerified, setLegalVerified] = useState(false);
  const [legalVerificationDate, setLegalVerificationDate] = useState('');
  const [legalVerifier, setLegalVerifier] = useState('');
  
  // Bank Approvals Management
  const addBankApproval = () => {
    setLegalBankApprovals([
      ...legalBankApprovals,
      { bankName: '', approved: true, approvalDate: '', referenceNumber: '' }
    ]);
  };
  
  const updateBankApproval = (index, field, value) => {
    const updated = [...legalBankApprovals];
    updated[index][field] = value;
    setLegalBankApprovals(updated);
  };
  
  const removeBankApproval = (index) => {
    setLegalBankApprovals(legalBankApprovals.filter((_, i) => i !== index));
  };
  
  // Contact Preference
  const [contactPreference, setContactPreference] = useState(['call', 'whatsapp']);
  
  // Location Nearby Management
  const addLocationNearby = () => {
    setLocationNearby([
      ...locationNearby,
      { name: '', distance: '', type: 'other' }
    ]);
  };
  
  const updateLocationNearby = (index, field, value) => {
    const updated = [...locationNearby];
    updated[index][field] = value;
    setLocationNearby(updated);
  };
  
  const removeLocationNearby = (index) => {
    setLocationNearby(locationNearby.filter((_, i) => i !== index));
  };
  
  // Image Handling
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
    setImages(images.filter((_, i) => i !== index));
    setPreviewImages(previewImages.filter((_, i) => i !== index));
  }, [images, previewImages]);
  
  const handleCheckboxArray = useCallback((array, value, setArray) => {
    if (array.includes(value)) {
      setArray(array.filter(item => item !== value));
    } else {
      setArray([...array, value]);
    }
  }, []);
  
  // Unit Type Management
  const addUnitType = () => {
    setUnitTypes([
      ...unitTypes,
      {
        type: '2BHK',
        price: { amount: '', currency: 'INR', perUnit: 'total' },
        carpetArea: '',
        builtUpArea: '',
        superBuiltUpArea: '',
        floors: 1,
        floorNumber: '',
        availability: 'available',
        totalUnits: '',
        availableUnits: '',
        // Plot-specific fields (will only be used if type is 'Plot')
        plotDetails: {
          dimensions: { length: '', breadth: '', frontage: '' },
          area: { sqft: '', sqYards: '', grounds: '', acres: '', cents: '' },
          shape: 'rectangle',
          facing: '',
          isCornerPlot: false,
          cornerRoads: [],
          roadWidth: '',
          roadType: 'secondary',
          boundaryWalls: false,
          fencing: false,
          gate: false,
          elevationAvailable: false,
          soilType: '',
          landUse: 'residential',
          developmentStatus: 'developed',
          amenities: [],
          utilities: {
            electricity: false,
            waterConnection: false,
            sewageConnection: false,
            gasConnection: false,
            internetFiber: false
          },
          approvalDetails: {
            dtcpApproved: false,
            dtcpNumber: '',
            layoutApproved: false,
            layoutNumber: '',
            surveyNumber: '',
            pattaNumber: '',
            subdivisionApproved: false
          }
        }
      }
    ]);
  };
  
  const updateUnitType = (index, field, value) => {
    const updated = [...unitTypes];
    if (field.includes('.')) {
      const parts = field.split('.');
      let target = updated[index];
      for (let i = 0; i < parts.length - 1; i++) {
        if (!target[parts[i]]) target[parts[i]] = {};
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = value;
    } else {
      updated[index][field] = value;
    }
    setUnitTypes(updated);
  };
  
  const updatePlotDetail = (index, field, value) => {
    const updated = [...unitTypes];
    if (field.includes('.')) {
      const parts = field.split('.');
      let target = updated[index].plotDetails;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!target[parts[i]]) target[parts[i]] = {};
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = value;
    } else {
      updated[index].plotDetails[field] = value;
    }
    setUnitTypes(updated);
  };
  
  const removeUnitType = (index) => {
    setUnitTypes(unitTypes.filter((_, i) => i !== index));
  };
  
  // Format number with commas
  const formatNumberWithCommas = (number) => {
    if (!number) return '';
    const numStr = number.toString().replace(/,/g, '');
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',').replace(/(\d{2})(?=\d{2}$)/, '$1,');
  };
  
  const convertToIndianWords = (numberString) => {
    if (!numberString || numberString.trim() === '') return '';
    try {
      const num = parseFloat(numberString.replace(/,/g, ''));
      if (isNaN(num) || num <= 0) return '';
      
      const crore = 10000000;
      const lakh = 100000;
      
      if (num >= crore) {
        const crores = num / crore;
        return `₹ ${crores.toFixed(2).replace(/\.00$/, '')} Crore`;
      }
      if (num >= lakh) {
        const lakhs = num / lakh;
        return `₹ ${lakhs.toFixed(2).replace(/\.00$/, '')} Lakh`;
      }
      return `₹ ${num.toLocaleString('en-IN')}`;
    } catch (error) {
      return '';
    }
  };
  
  // Fetch property unit for edit mode
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
      setCity(data.city || '');
      setAddress(data.address || '');
      setMapUrl(data.mapUrl || '');
      setPropertyType(data.propertyType || 'Apartment');
      setAvailability(data.availability || 'available');
      setListingType(data.listingType || 'sale');
      
      setUnitTypes(data.unitTypes || []);
      setBuildingName(data.buildingDetails?.name || '');
      setBuildingTotalFloors(data.buildingDetails?.totalFloors?.toString() || '');
      setBuildingTotalUnits(data.buildingDetails?.totalUnits?.toString() || '');
      setBuildingYearBuilt(data.buildingDetails?.yearBuilt?.toString() || '');
      setBuildingAmenities(data.buildingDetails?.amenities || []);
      setUnitFeatures(data.unitFeatures || []);
      setCommonFurnishing(data.commonSpecifications?.furnishing || 'unfurnished');
      setCommonPossessionStatus(data.commonSpecifications?.possessionStatus || 'ready-to-move');
      setCommonAgeOfProperty(data.commonSpecifications?.ageOfProperty?.toString() || '');
      setCommonParkingCovered(data.commonSpecifications?.parking?.covered || 0);
      setCommonParkingOpen(data.commonSpecifications?.parking?.open || 0);
      setCommonKitchenType(data.commonSpecifications?.kitchenType || 'regular');
      setLocationNearby(data.locationNearby || []);
      setOwnerName(data.ownerDetails?.name || '');
      setOwnerPhone(data.ownerDetails?.phoneNumber || '');
      setOwnerEmail(data.ownerDetails?.email || '');
      setOwnerReason(data.ownerDetails?.reasonForSelling || '');
      
      // Legal Details
      setLegalReraRegistered(data.legalDetails?.reraRegistered || false);
      setLegalReraNumber(data.legalDetails?.reraNumber || '');
      setLegalReraWebsiteLink(data.legalDetails?.reraWebsiteLink || '');
      setLegalSanctioningAuthority(data.legalDetails?.sanctioningAuthority || '');
      setLegalSanctionNumber(data.legalDetails?.sanctionNumber || '');
      setLegalSanctionDate(data.legalDetails?.sanctionDate ? data.legalDetails.sanctionDate.split('T')[0] : '');
      setLegalOccupancyCertificate(data.legalDetails?.occupancyCertificate || false);
      setLegalOccupancyCertificateNumber(data.legalDetails?.occupancyCertificateNumber || '');
      setLegalOccupancyCertificateDate(data.legalDetails?.occupancyCertificateDate ? data.legalDetails.occupancyCertificateDate.split('T')[0] : '');
      setLegalCommencementCertificate(data.legalDetails?.commencementCertificate || false);
      setLegalCommencementCertificateNumber(data.legalDetails?.commencementCertificateNumber || '');
      setLegalCommencementCertificateDate(data.legalDetails?.commencementCertificateDate ? data.legalDetails.commencementCertificateDate.split('T')[0] : '');
      setLegalKhataStatus(data.legalDetails?.khataStatus || 'Not Applicable');
      setLegalClearTitle(data.legalDetails?.clearTitle || false);
      setLegalMotherDeedAvailable(data.legalDetails?.motherDeedAvailable || false);
      setLegalConversionCertificate(data.legalDetails?.conversionCertificate || false);
      setLegalConversionType(data.legalDetails?.conversionType || '');
      setLegalEncumbranceCertificate(data.legalDetails?.encumbranceCertificate || false);
      setLegalEncumbranceYears(data.legalDetails?.encumbranceYears?.toString() || '');
      setLegalOwnershipType(data.legalDetails?.ownershipType || 'freehold');
      setLegalBankApprovals(data.legalDetails?.bankApprovals || []);
      setLegalStatusSummary(data.legalDetails?.legalStatusSummary || '');
      setLegalVerified(data.legalDetails?.legalVerified || false);
      setLegalVerificationDate(data.legalDetails?.legalVerificationDate ? data.legalDetails.legalVerificationDate.split('T')[0] : '');
      setLegalVerifier(data.legalDetails?.legalVerifier || '');
      
      setContactPreference(data.contactPreference || ['call', 'whatsapp']);
      
    } catch (error) {
      toast.error('Failed to fetch property unit details');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const validateForm = useCallback(() => {
    const errors = [];
    
    if (!title.trim()) errors.push('Title is required');
    if (!city.trim()) errors.push('City is required');
    if (!address.trim()) errors.push('Address is required');
    
    if (unitTypes.length === 0) {
      errors.push('At least one unit type is required');
    }
    
    unitTypes.forEach((unit, index) => {
      if (!unit.type) errors.push(`Unit type ${index + 1}: Type is required`);
      if (!unit.price?.amount) errors.push(`Unit type ${index + 1}: Price amount is required`);
      
      // Validate based on unit type
      if (unit.type === 'Plot') {
        // For plots, either carpetArea or plotDetails.area.sqft must be provided
        if (!unit.carpetArea && !unit.plotDetails?.area?.sqft) {
          errors.push(`Unit type ${index + 1} (Plot): Either Carpet Area or Plot Area (sqft) is required`);
        }
        
        // Validate plot dimensions if provided partially
        if (unit.plotDetails?.dimensions) {
          const dims = unit.plotDetails.dimensions;
          if ((dims.length && !dims.breadth) || (!dims.length && dims.breadth)) {
            errors.push(`Unit type ${index + 1} (Plot): Both length and breadth are required if providing dimensions`);
          }
        }
        
        // Validate road width if road type is provided
        if (unit.plotDetails?.roadType && unit.plotDetails.roadType !== 'secondary' && !unit.plotDetails.roadWidth) {
          errors.push(`Unit type ${index + 1} (Plot): Road width is required for ${unit.plotDetails.roadType} road`);
        }
      } else {
        // For residential units
        if (!unit.carpetArea) errors.push(`Unit type ${index + 1}: Carpet area is required`);
        if (!unit.builtUpArea) errors.push(`Unit type ${index + 1}: Built-up area is required`);
      }
    });
    
    if (!images.length && mode === 'create') {
      errors.push('At least one image is required');
    }
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }
    return true;
  }, [title, city, address, unitTypes, images, mode]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      
      // Basic fields
      formDataToSend.append('title', title.trim());
      formDataToSend.append('description', description.trim());
      formDataToSend.append('city', city.trim());
      formDataToSend.append('address', address.trim());
      formDataToSend.append('mapUrl', mapUrl.trim());
      formDataToSend.append('propertyType', propertyType);
      formDataToSend.append('availability', availability);
      formDataToSend.append('listingType', listingType);
      
      // Unit Types - Process based on type
      const processedUnitTypes = unitTypes.map(unit => {
        const baseUnit = {
          type: unit.type,
          price: {
            amount: parseFloat(unit.price?.amount?.toString().replace(/,/g, '')) || 0,
            currency: unit.price?.currency || 'INR',
            perUnit: unit.price?.perUnit || 'total'
          },
          availability: unit.availability || 'available',
          totalUnits: unit.totalUnits ? parseInt(unit.totalUnits) : undefined,
          availableUnits: unit.availableUnits ? parseInt(unit.availableUnits) : undefined
        };
        
        if (unit.type === 'Plot') {
          // Handle plot-specific fields
          baseUnit.plotDetails = {
            dimensions: {
              length: unit.plotDetails?.dimensions?.length ? parseFloat(unit.plotDetails.dimensions.length) : undefined,
              breadth: unit.plotDetails?.dimensions?.breadth ? parseFloat(unit.plotDetails.dimensions.breadth) : undefined,
              frontage: unit.plotDetails?.dimensions?.frontage ? parseFloat(unit.plotDetails.dimensions.frontage) : undefined
            },
            area: {
              sqft: unit.plotDetails?.area?.sqft ? parseFloat(unit.plotDetails.area.sqft) : (unit.carpetArea ? parseFloat(unit.carpetArea) : undefined),
              sqYards: unit.plotDetails?.area?.sqYards ? parseFloat(unit.plotDetails.area.sqYards) : undefined,
              grounds: unit.plotDetails?.area?.grounds ? parseFloat(unit.plotDetails.area.grounds) : undefined,
              acres: unit.plotDetails?.area?.acres ? parseFloat(unit.plotDetails.area.acres) : undefined,
              cents: unit.plotDetails?.area?.cents ? parseFloat(unit.plotDetails.area.cents) : undefined
            },
            shape: unit.plotDetails?.shape || 'rectangle',
            facing: unit.plotDetails?.facing,
            isCornerPlot: unit.plotDetails?.isCornerPlot || false,
            cornerRoads: unit.plotDetails?.cornerRoads || [],
            roadWidth: unit.plotDetails?.roadWidth ? parseFloat(unit.plotDetails.roadWidth) : undefined,
            roadType: unit.plotDetails?.roadType || 'secondary',
            boundaryWalls: unit.plotDetails?.boundaryWalls || false,
            fencing: unit.plotDetails?.fencing || false,
            gate: unit.plotDetails?.gate || false,
            elevationAvailable: unit.plotDetails?.elevationAvailable || false,
            soilType: unit.plotDetails?.soilType,
            landUse: unit.plotDetails?.landUse || 'residential',
            developmentStatus: unit.plotDetails?.developmentStatus || 'developed',
            amenities: unit.plotDetails?.amenities || [],
            utilities: {
              electricity: unit.plotDetails?.utilities?.electricity || false,
              waterConnection: unit.plotDetails?.utilities?.waterConnection || false,
              sewageConnection: unit.plotDetails?.utilities?.sewageConnection || false,
              gasConnection: unit.plotDetails?.utilities?.gasConnection || false,
              internetFiber: unit.plotDetails?.utilities?.internetFiber || false
            },
            approvalDetails: {
              dtcpApproved: unit.plotDetails?.approvalDetails?.dtcpApproved || false,
              dtcpNumber: unit.plotDetails?.approvalDetails?.dtcpNumber || '',
              layoutApproved: unit.plotDetails?.approvalDetails?.layoutApproved || false,
              layoutNumber: unit.plotDetails?.approvalDetails?.layoutNumber || '',
              surveyNumber: unit.plotDetails?.approvalDetails?.surveyNumber || '',
              pattaNumber: unit.plotDetails?.approvalDetails?.pattaNumber || '',
              subdivisionApproved: unit.plotDetails?.approvalDetails?.subdivisionApproved || false
            }
          };
          
          // Remove empty values
          Object.keys(baseUnit.plotDetails).forEach(key => {
            if (baseUnit.plotDetails[key] === undefined || baseUnit.plotDetails[key] === '') {
              delete baseUnit.plotDetails[key];
            }
          });
        } else {
          // For residential units
          baseUnit.carpetArea = parseFloat(unit.carpetArea) || 0;
          baseUnit.builtUpArea = parseFloat(unit.builtUpArea) || 0;
          baseUnit.superBuiltUpArea = unit.superBuiltUpArea ? parseFloat(unit.superBuiltUpArea) : undefined;
          baseUnit.floors = parseInt(unit.floors) || 1;
          baseUnit.floorNumber = unit.floorNumber ? parseInt(unit.floorNumber) : undefined;
        }
        
        return baseUnit;
      });
      
      formDataToSend.append('unitTypes', JSON.stringify(processedUnitTypes));
      
      // Building Details (only for non-plot properties)
      if (propertyType !== 'Plot') {
        const buildingDetails = {
          name: buildingName.trim(),
          totalFloors: buildingTotalFloors ? parseInt(buildingTotalFloors) : undefined,
          totalUnits: buildingTotalUnits ? parseInt(buildingTotalUnits) : undefined,
          yearBuilt: buildingYearBuilt ? parseInt(buildingYearBuilt) : undefined,
          amenities: buildingAmenities
        };
        formDataToSend.append('buildingDetails', JSON.stringify(buildingDetails));
      } else {
        formDataToSend.append('buildingDetails', JSON.stringify({}));
      }
      
      // Unit Features
      formDataToSend.append('unitFeatures', JSON.stringify(unitFeatures));
      
      // Common Specifications
      const commonSpecifications = {
        furnishing: commonFurnishing,
        possessionStatus: commonPossessionStatus,
        ageOfProperty: commonAgeOfProperty ? parseInt(commonAgeOfProperty) : undefined,
        parking: {
          covered: parseInt(commonParkingCovered) || 0,
          open: parseInt(commonParkingOpen) || 0
        },
        kitchenType: commonKitchenType
      };
      formDataToSend.append('commonSpecifications', JSON.stringify(commonSpecifications));
      
      // Location Nearby
      const processedLocationNearby = locationNearby.filter(loc => loc.name && loc.distance);
      formDataToSend.append('locationNearby', JSON.stringify(processedLocationNearby));
      
      // Owner Details
      const ownerDetails = {
        name: ownerName.trim(),
        phoneNumber: ownerPhone.trim(),
        email: ownerEmail.trim(),
        reasonForSelling: ownerReason.trim()
      };
      formDataToSend.append('ownerDetails', JSON.stringify(ownerDetails));
      
      // Legal Details
      const legalDetails = {
        reraRegistered: legalReraRegistered,
        reraNumber: legalReraNumber.trim(),
        reraWebsiteLink: legalReraWebsiteLink.trim(),
        sanctioningAuthority: legalSanctioningAuthority.trim(),
        sanctionNumber: legalSanctionNumber.trim(),
        sanctionDate: legalSanctionDate ? new Date(legalSanctionDate) : undefined,
        occupancyCertificate: legalOccupancyCertificate,
        occupancyCertificateNumber: legalOccupancyCertificateNumber.trim(),
        occupancyCertificateDate: legalOccupancyCertificateDate ? new Date(legalOccupancyCertificateDate) : undefined,
        commencementCertificate: legalCommencementCertificate,
        commencementCertificateNumber: legalCommencementCertificateNumber.trim(),
        commencementCertificateDate: legalCommencementCertificateDate ? new Date(legalCommencementCertificateDate) : undefined,
        khataStatus: legalKhataStatus,
        clearTitle: legalClearTitle,
        motherDeedAvailable: legalMotherDeedAvailable,
        conversionCertificate: legalConversionCertificate,
        conversionType: legalConversionType.trim(),
        encumbranceCertificate: legalEncumbranceCertificate,
        encumbranceYears: legalEncumbranceYears ? parseInt(legalEncumbranceYears) : undefined,
        ownershipType: legalOwnershipType,
        bankApprovals: legalBankApprovals.filter(approval => approval.bankName).map(approval => ({
          bankName: approval.bankName,
          approved: approval.approved,
          approvalDate: approval.approvalDate ? new Date(approval.approvalDate) : undefined,
          referenceNumber: approval.referenceNumber
        })),
        legalStatusSummary: legalStatusSummary.trim(),
        legalVerified: legalVerified,
        legalVerificationDate: legalVerificationDate ? new Date(legalVerificationDate) : undefined,
        legalVerifier: legalVerifier.trim()
      };
      formDataToSend.append('legalDetails', JSON.stringify(legalDetails));
      
      // Contact Preference
      formDataToSend.append('contactPreference', JSON.stringify(contactPreference));
      
      // Images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });
      
      let response;
      if (mode === 'create') {
        response = await propertyUnitAPI.createPropertyUnit(formDataToSend);
        toast.success('Property unit created successfully! It will be visible after admin approval.');
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        response = await propertyUnitAPI.updatePropertyUnit(propertyUnitId, formDataToSend);
        toast.success('Property unit updated successfully!');
        if (onSuccess) onSuccess(response.data.propertyUnit);
      }
      
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err));
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save property unit');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Memoized options
  const propertyTypes = useMemo(() => [
    "Apartment", "Villa", "Independent House", "Studio", 
    "Penthouse", "Duplex", "Pg house", "Plot", "Commercial Space"
  ], []);
  
  const unitTypeOptions = useMemo(() => ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK", "Studio", "Penthouse", "Duplex", "Plot"], []);
  const furnishingOptions = useMemo(() => ["unfurnished", "semi-furnished", "fully-furnished"], []);
  const possessionOptions = useMemo(() => ["ready-to-move", "under-construction", "resale"], []);
  const kitchenTypes = useMemo(() => ["modular", "regular", "open", "closed", "none"], []);
  const listingTypes = useMemo(() => ["sale", "rent", "lease", "pg"], []);
  const availabilityOptions = useMemo(() => ["available", "sold", "rented", "under-agreement", "hold"], []);
  const perUnitOptions = useMemo(() => ["total", "sqft", "sqm", "month", "perSqYard", "perGround"], []);
  const currencies = useMemo(() => ["INR", "USD", "EUR", "GBP", "AED"], []);
  const contactPreferenceOptions = useMemo(() => ["call", "whatsapp", "email", "message"], []);
  const ownershipTypeOptions = useMemo(() => ["freehold", "leasehold", "cooperative", "power-of-attorney"], []);
  const khataStatusOptions = useMemo(() => ["A-Khata", "B-Khata", "E-Khata", "Not Applicable"], []);
  const locationTypeOptions = useMemo(() => [
    "transport", "education", "healthcare", "shopping", "entertainment", "banking", "religious", "park", "restaurant", "other"
  ], []);
  
  // Plot-specific options
  const plotShapeOptions = useMemo(() => ["square", "rectangle", "corner", "irregular", "triangular"], []);
  const facingOptions = useMemo(() => ["north", "south", "east", "west", "north-east", "north-west", "south-east", "south-west"], []);
  const roadTypeOptions = useMemo(() => ["main", "secondary", "internal", "service", "highway"], []);
  const soilTypeOptions = useMemo(() => ["black", "red", "clay", "loamy", "sandy", "rocky", "other"], []);
  const landUseOptions = useMemo(() => ["residential", "commercial", "agricultural", "industrial", "mixed-use", "institutional"], []);
  const developmentStatusOptions = useMemo(() => ["developed", "semi-developed", "undeveloped"], []);
  const plotAmenitiesOptions = useMemo(() => ["Electricity Connection", "Water Connection", "Sewage Connection", "Road Access", "Street Lights", "Drainage System"], []);
  
  const unitFeaturesOptions = useMemo(() => [
    "Air Conditioning", "Modular Kitchen", "Wardrobes", "Geyser", "Exhaust Fan", "Chimney",
    "Lighting", "Ceiling Fans", "Smart Home Automation", "Central AC", "bore water", "Walk-in Closet",
    "Study Room", "Pooja Room", "Utility Area", "Servant Room", "Private Garden", "Terrace",
    "Balcony", "Swimming Pool", "Video Door Phone", "Security Alarm", "Fire Safety", "CCTV",
    "Pet Friendly", "Wheelchair Access", "Natural Light", "View"
  ], []);
  
  const amenitiesOptions = useMemo(() => [
    "Swimming Pool", "Gym", "Club House", "Children Play Area", "Park", "Garden",
    "Power Backup", "Lift", "Security", "CCTV", "Fire Safety", "Intercom",
    "Visitor Parking", "Reserved Parking"
  ], []);
  
  const currentYear = new Date().getFullYear();
  
  // Render unit type form based on type
  const renderUnitTypeFields = (unit, index) => {
    const isPlot = unit.type === 'Plot';
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <ResponsiveSelect label="Type *" value={unit.type} onChange={(v) => updateUnitType(index, 'type', v)} options={unitTypeOptions} required />
        <ResponsiveInput label="Price Amount *" value={unit.price?.amount} onChange={(v) => updateUnitType(index, 'price.amount', v)} placeholder="e.g., 1,00,00,000" />
        <ResponsiveSelect label="Currency" value={unit.price?.currency} onChange={(v) => updateUnitType(index, 'price.currency', v)} options={currencies} />
        <ResponsiveSelect label="Per Unit" value={unit.price?.perUnit} onChange={(v) => updateUnitType(index, 'price.perUnit', v)} options={perUnitOptions} />
        
        {!isPlot ? (
          // Residential unit fields
          <>
            <ResponsiveInput label="Carpet Area (sq.ft.) *" type="number" value={unit.carpetArea} onChange={(v) => updateUnitType(index, 'carpetArea', v)} placeholder="e.g., 1200" required />
            <ResponsiveInput label="Built-up Area (sq.ft.) *" type="number" value={unit.builtUpArea} onChange={(v) => updateUnitType(index, 'builtUpArea', v)} placeholder="e.g., 1400" required />
            <ResponsiveInput label="Super Built-up Area" type="number" value={unit.superBuiltUpArea} onChange={(v) => updateUnitType(index, 'superBuiltUpArea', v)} placeholder="Optional" />
            <ResponsiveInput label="Floor Number" type="number" value={unit.floorNumber} onChange={(v) => updateUnitType(index, 'floorNumber', v)} placeholder="e.g., 3" />
          </>
        ) : (
          // Plot-specific fields
          <>
            {/* Area Information */}
            <div className="col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Plot Area (sq.ft.) *</label>
              <input type="number" value={unit.plotDetails?.area?.sqft || unit.carpetArea} onChange={(v) => {
                updatePlotDetail(index, 'area.sqft', v.target.value);
                updateUnitType(index, 'carpetArea', v.target.value);
              }} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="e.g., 2400" />
            </div>
            
            <ResponsiveInput label="Area (sq. yards)" type="number" value={unit.plotDetails?.area?.sqYards} onChange={(v) => updatePlotDetail(index, 'area.sqYards', v)} placeholder="Optional" />
            <ResponsiveInput label="Area (grounds)" type="number" value={unit.plotDetails?.area?.grounds} onChange={(v) => updatePlotDetail(index, 'area.grounds', v)} placeholder="Optional" />
            <ResponsiveInput label="Area (acres)" type="number" value={unit.plotDetails?.area?.acres} onChange={(v) => updatePlotDetail(index, 'area.acres', v)} placeholder="Optional" />
            <ResponsiveInput label="Area (cents)" type="number" value={unit.plotDetails?.area?.cents} onChange={(v) => updatePlotDetail(index, 'area.cents', v)} placeholder="Optional" />
            
            {/* Dimensions */}
            <ResponsiveInput label="Length (ft)" type="number" value={unit.plotDetails?.dimensions?.length} onChange={(v) => updatePlotDetail(index, 'dimensions.length', v)} placeholder="Optional" />
            <ResponsiveInput label="Breadth (ft)" type="number" value={unit.plotDetails?.dimensions?.breadth} onChange={(v) => updatePlotDetail(index, 'dimensions.breadth', v)} placeholder="Optional" />
            <ResponsiveInput label="Frontage (ft)" type="number" value={unit.plotDetails?.dimensions?.frontage} onChange={(v) => updatePlotDetail(index, 'dimensions.frontage', v)} placeholder="Optional" />
            
            {/* Plot Characteristics */}
            <ResponsiveSelect label="Shape" value={unit.plotDetails?.shape || 'rectangle'} onChange={(v) => updatePlotDetail(index, 'shape', v)} options={plotShapeOptions} />
            <ResponsiveSelect label="Facing" value={unit.plotDetails?.facing || ''} onChange={(v) => updatePlotDetail(index, 'facing', v)} options={facingOptions} />
            <div className="flex items-center">
              <input type="checkbox" checked={unit.plotDetails?.isCornerPlot || false} onChange={(e) => updatePlotDetail(index, 'isCornerPlot', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
              <label className="ml-2 text-sm text-gray-700">Corner Plot</label>
            </div>
            
            {/* Road Details */}
            <ResponsiveSelect label="Road Type" value={unit.plotDetails?.roadType || 'secondary'} onChange={(v) => updatePlotDetail(index, 'roadType', v)} options={roadTypeOptions} />
            <ResponsiveInput label="Road Width (ft)" type="number" value={unit.plotDetails?.roadWidth} onChange={(v) => updatePlotDetail(index, 'roadWidth', v)} placeholder="Optional" />
            
            {/* Utilities */}
            <div className="col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Utilities</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <input type="checkbox" checked={unit.plotDetails?.utilities?.electricity || false} onChange={(e) => updatePlotDetail(index, 'utilities.electricity', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                  <label className="ml-2 text-sm text-gray-700">Electricity</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={unit.plotDetails?.utilities?.waterConnection || false} onChange={(e) => updatePlotDetail(index, 'utilities.waterConnection', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                  <label className="ml-2 text-sm text-gray-700">Water Connection</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={unit.plotDetails?.utilities?.sewageConnection || false} onChange={(e) => updatePlotDetail(index, 'utilities.sewageConnection', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                  <label className="ml-2 text-sm text-gray-700">Sewage Connection</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={unit.plotDetails?.utilities?.gasConnection || false} onChange={(e) => updatePlotDetail(index, 'utilities.gasConnection', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                  <label className="ml-2 text-sm text-gray-700">Gas Connection</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={unit.plotDetails?.utilities?.internetFiber || false} onChange={(e) => updatePlotDetail(index, 'utilities.internetFiber', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                  <label className="ml-2 text-sm text-gray-700">Internet Fiber</label>
                </div>
              </div>
            </div>
            
            {/* Boundary Details */}
            <div className="col-span-2 grid grid-cols-3 gap-2">
              <div className="flex items-center">
                <input type="checkbox" checked={unit.plotDetails?.boundaryWalls || false} onChange={(e) => updatePlotDetail(index, 'boundaryWalls', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                <label className="ml-2 text-sm text-gray-700">Boundary Walls</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" checked={unit.plotDetails?.fencing || false} onChange={(e) => updatePlotDetail(index, 'fencing', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                <label className="ml-2 text-sm text-gray-700">Fencing</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" checked={unit.plotDetails?.gate || false} onChange={(e) => updatePlotDetail(index, 'gate', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                <label className="ml-2 text-sm text-gray-700">Gate</label>
              </div>
            </div>
            
            {/* Land Information */}
            <ResponsiveSelect label="Land Use" value={unit.plotDetails?.landUse || 'residential'} onChange={(v) => updatePlotDetail(index, 'landUse', v)} options={landUseOptions} />
            <ResponsiveSelect label="Soil Type" value={unit.plotDetails?.soilType || ''} onChange={(v) => updatePlotDetail(index, 'soilType', v)} options={soilTypeOptions} />
            <ResponsiveSelect label="Development Status" value={unit.plotDetails?.developmentStatus || 'developed'} onChange={(v) => updatePlotDetail(index, 'developmentStatus', v)} options={developmentStatusOptions} />
            
            {/* Approval Details */}
            <div className="col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Approval Details</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" checked={unit.plotDetails?.approvalDetails?.dtcpApproved || false} onChange={(e) => updatePlotDetail(index, 'approvalDetails.dtcpApproved', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                  <label className="ml-2 text-sm text-gray-700">DTCP Approved</label>
                </div>
                {unit.plotDetails?.approvalDetails?.dtcpApproved && (
                  <ResponsiveInput label="DTCP Number" value={unit.plotDetails?.approvalDetails?.dtcpNumber || ''} onChange={(v) => updatePlotDetail(index, 'approvalDetails.dtcpNumber', v)} placeholder="DTCP Number" />
                )}
                <div className="flex items-center">
                  <input type="checkbox" checked={unit.plotDetails?.approvalDetails?.layoutApproved || false} onChange={(e) => updatePlotDetail(index, 'approvalDetails.layoutApproved', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                  <label className="ml-2 text-sm text-gray-700">Layout Approved</label>
                </div>
                {unit.plotDetails?.approvalDetails?.layoutApproved && (
                  <ResponsiveInput label="Layout Number" value={unit.plotDetails?.approvalDetails?.layoutNumber || ''} onChange={(v) => updatePlotDetail(index, 'approvalDetails.layoutNumber', v)} placeholder="Layout Number" />
                )}
                <ResponsiveInput label="Survey Number" value={unit.plotDetails?.approvalDetails?.surveyNumber || ''} onChange={(v) => updatePlotDetail(index, 'approvalDetails.surveyNumber', v)} placeholder="Survey Number" />
                <ResponsiveInput label="Patta Number" value={unit.plotDetails?.approvalDetails?.pattaNumber || ''} onChange={(v) => updatePlotDetail(index, 'approvalDetails.pattaNumber', v)} placeholder="Patta Number" />
                <div className="flex items-center">
                  <input type="checkbox" checked={unit.plotDetails?.approvalDetails?.subdivisionApproved || false} onChange={(e) => updatePlotDetail(index, 'approvalDetails.subdivisionApproved', e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
                  <label className="ml-2 text-sm text-gray-700">Subdivision Approved</label>
                </div>
              </div>
            </div>
            
            {/* Plot Amenities */}
            <div className="col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Plot Amenities</label>
              <div className="grid grid-cols-2 gap-2">
                {plotAmenitiesOptions.map(amenity => (
                  <div key={amenity} className="flex items-center">
                    <input type="checkbox" checked={(unit.plotDetails?.amenities || []).includes(amenity)} onChange={(e) => {
                      const currentAmenities = unit.plotDetails?.amenities || [];
                      if (e.target.checked) {
                        updatePlotDetail(index, 'amenities', [...currentAmenities, amenity]);
                      } else {
                        updatePlotDetail(index, 'amenities', currentAmenities.filter(a => a !== amenity));
                      }
                    }} className="h-4 w-4 text-blue-600 rounded" />
                    <label className="ml-2 text-sm text-gray-700">{amenity}</label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        <ResponsiveSelect label="Unit Availability" value={unit.availability} onChange={(v) => updateUnitType(index, 'availability', v)} options={isPlot ? ["available", "sold", "limited", "coming-soon", "booked", "reserved"] : ["available", "sold", "limited", "coming-soon"]} />
        <ResponsiveInput label="Total Units" type="number" value={unit.totalUnits} onChange={(v) => updateUnitType(index, 'totalUnits', v)} placeholder="Total units of this type" />
        <ResponsiveInput label="Available Units" type="number" value={unit.availableUnits} onChange={(v) => updateUnitType(index, 'availableUnits', v)} placeholder="Available units" />
      </div>
    );
  };
  
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 lg:py-8">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg overflow-hidden p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 sm:gap-3 text-blue-600 hover:text-blue-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-wide text-sm sm:text-base">Back to Properties</span>
          </button>
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
              <ResponsiveInput label="Title *" value={title} onChange={setTitle} placeholder="e.g., Luxury 3BHK Apartment" required />
              <ResponsiveSelect label="Property Type *" value={propertyType} onChange={setPropertyType} options={propertyTypes} required />
              <div className="sm:col-span-2">
                <ResponsiveTextarea label="Description" value={description} onChange={setDescription} placeholder="Detailed description of the property" rows={3} />
              </div>
              <ResponsiveInput label="City *" value={city} onChange={setCity} placeholder="e.g., Mumbai" required />
              <ResponsiveInput label="Address *" value={address} onChange={setAddress} placeholder="Full address" required />
              <ResponsiveInput label="Map URL" value={mapUrl} onChange={setMapUrl} placeholder="Google Maps embed URL" />
              <ResponsiveSelect label="Listing Type" value={listingType} onChange={setListingType} options={listingTypes} />
              <ResponsiveSelect label="Availability" value={availability} onChange={setAvailability} options={availabilityOptions} />
            </div>
          </div>
          
          {/* Unit Types Section */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Unit Types *</h2>
              <button type="button" onClick={addUnitType} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add Unit Type
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">Add different unit configurations available in this property</p>
            
            {unitTypes.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No unit types added. Click "Add Unit Type" to get started.</p>
              </div>
            )}
            
            {unitTypes.map((unit, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold text-gray-700">
                    {unit.type === 'Plot' ? 'Plot Details' : `Unit Type ${index + 1}`}
                  </h3>
                  <button type="button" onClick={() => removeUnitType(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {renderUnitTypeFields(unit, index)}
                {unit.price?.amount && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                    Price in words: {convertToIndianWords(unit.price.amount)}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Building Details - Only show for non-plot properties */}
          {propertyType !== 'Plot' && (
            <div className="border-b pb-4 sm:pb-6 md:pb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Building Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <ResponsiveInput label="Building Name" value={buildingName} onChange={setBuildingName} placeholder="e.g., Skyline Towers" />
                <ResponsiveInput label="Total Floors" type="number" value={buildingTotalFloors} onChange={setBuildingTotalFloors} placeholder="e.g., 20" />
                <ResponsiveInput label="Total Units" type="number" value={buildingTotalUnits} onChange={setBuildingTotalUnits} placeholder="e.g., 80" />
                <ResponsiveYearSelect label="Year Built" value={buildingYearBuilt} onChange={setBuildingYearBuilt} />
              </div>
              <div className="mt-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Building Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {amenitiesOptions.map(amenity => (
                    <div key={amenity} className="flex items-center">
                      <input type="checkbox" checked={buildingAmenities.includes(amenity)} onChange={() => handleCheckboxArray(buildingAmenities, amenity, setBuildingAmenities)} className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 rounded" />
                      <label className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700 truncate">{amenity}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Unit Features */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Unit Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {unitFeaturesOptions.map(feature => (
                <div key={feature} className="flex items-center">
                  <input type="checkbox" checked={unitFeatures.includes(feature)} onChange={() => handleCheckboxArray(unitFeatures, feature, setUnitFeatures)} className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 rounded" />
                  <label className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700 truncate">{feature}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Common Specifications */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Common Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <ResponsiveSelect label="Furnishing" value={commonFurnishing} onChange={setCommonFurnishing} options={furnishingOptions} />
              <ResponsiveSelect label="Possession Status" value={commonPossessionStatus} onChange={setCommonPossessionStatus} options={possessionOptions} />
              <ResponsiveInput label="Age of Property (years)" type="number" value={commonAgeOfProperty} onChange={setCommonAgeOfProperty} placeholder="e.g., 5" min="0" />
              <ResponsiveSelect label="Kitchen Type" value={commonKitchenType} onChange={setCommonKitchenType} options={kitchenTypes} />
              <ResponsiveInput label="Covered Parking" type="number" value={commonParkingCovered} onChange={setCommonParkingCovered} placeholder="e.g., 1" min="0" />
              <ResponsiveInput label="Open Parking" type="number" value={commonParkingOpen} onChange={setCommonParkingOpen} placeholder="e.g., 1" min="0" />
            </div>
          </div>
          
          {/* Location Nearby */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Nearby Locations</h2>
              <button type="button" onClick={addLocationNearby} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs">
                <Plus className="w-3 h-3" /> Add Location
              </button>
            </div>
            {locationNearby.map((loc, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-end mb-2">
                  <button type="button" onClick={() => removeLocationNearby(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ResponsiveInput label="Name" value={loc.name} onChange={(v) => updateLocationNearby(index, 'name', v)} placeholder="e.g., Metro Station" />
                  <ResponsiveInput label="Distance" value={loc.distance} onChange={(v) => updateLocationNearby(index, 'distance', v)} placeholder="e.g., 500m" />
                  <ResponsiveSelect label="Type" value={loc.type} onChange={(v) => updateLocationNearby(index, 'type', v)} options={locationTypeOptions} />
                </div>
              </div>
            ))}
          </div>
          
          {/* Owner Details */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Owner Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ResponsiveInput label="Owner Name" value={ownerName} onChange={setOwnerName} placeholder="e.g., Ramesh Kumar" />
              <ResponsiveInput label="Phone Number" value={ownerPhone} onChange={setOwnerPhone} placeholder="e.g., +91 9876543210" />
              <ResponsiveInput label="Email" type="email" value={ownerEmail} onChange={setOwnerEmail} placeholder="e.g., owner@example.com" />
            </div>
          </div>
          
          {/* Legal Details */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Legal Details</h2>
            
            {/* RERA Information */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">RERA Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <ResponsiveCheckbox label="RERA Registered" checked={legalReraRegistered} onChange={setLegalReraRegistered} />
                <ResponsiveInput label="RERA Number" value={legalReraNumber} onChange={setLegalReraNumber} placeholder="e.g., PRM/KA/RERA/1251/..." />
                <div className="sm:col-span-2">
                  <ResponsiveInput label="RERA Website Link" value={legalReraWebsiteLink} onChange={setLegalReraWebsiteLink} placeholder="https://rera..." />
                </div>
              </div>
            </div>
            
            {/* Sanction Information */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Sanction Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <ResponsiveInput label="Sanctioning Authority" value={legalSanctioningAuthority} onChange={setLegalSanctioningAuthority} placeholder="e.g., BBMP, BMRDA" />
                <ResponsiveInput label="Sanction Number" value={legalSanctionNumber} onChange={setLegalSanctionNumber} placeholder="Sanction reference number" />
                <ResponsiveInput label="Sanction Date" type="date" value={legalSanctionDate} onChange={setLegalSanctionDate} />
              </div>
            </div>
            
            {/* Certificates */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Certificates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border p-3 rounded-lg">
                  <ResponsiveCheckbox label="Occupancy Certificate" checked={legalOccupancyCertificate} onChange={setLegalOccupancyCertificate} />
                  {legalOccupancyCertificate && (
                    <div className="mt-2 space-y-2">
                      <ResponsiveInput label="Certificate Number" value={legalOccupancyCertificateNumber} onChange={setLegalOccupancyCertificateNumber} placeholder="OC Number" />
                      <ResponsiveInput label="Certificate Date" type="date" value={legalOccupancyCertificateDate} onChange={setLegalOccupancyCertificateDate} />
                    </div>
                  )}
                </div>
                <div className="border p-3 rounded-lg">
                  <ResponsiveCheckbox label="Commencement Certificate" checked={legalCommencementCertificate} onChange={setLegalCommencementCertificate} />
                  {legalCommencementCertificate && (
                    <div className="mt-2 space-y-2">
                      <ResponsiveInput label="Certificate Number" value={legalCommencementCertificateNumber} onChange={setLegalCommencementCertificateNumber} placeholder="CC Number" />
                      <ResponsiveInput label="Certificate Date" type="date" value={legalCommencementCertificateDate} onChange={setLegalCommencementCertificateDate} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Title & Ownership */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Title & Ownership</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <ResponsiveSelect label="Khata Status" value={legalKhataStatus} onChange={setLegalKhataStatus} options={khataStatusOptions} />
                <ResponsiveSelect label="Ownership Type" value={legalOwnershipType} onChange={setLegalOwnershipType} options={ownershipTypeOptions} />
                <ResponsiveCheckbox label="Clear Title" checked={legalClearTitle} onChange={setLegalClearTitle} />
                <ResponsiveCheckbox label="Mother Deed Available" checked={legalMotherDeedAvailable} onChange={setLegalMotherDeedAvailable} />
                <ResponsiveCheckbox label="Conversion Certificate" checked={legalConversionCertificate} onChange={setLegalConversionCertificate} />
                {legalConversionCertificate && (
                  <ResponsiveInput label="Conversion Type" value={legalConversionType} onChange={setLegalConversionType} placeholder="e.g., Agricultural to Non-Agricultural" />
                )}
              </div>
            </div>
            
            {/* Encumbrance */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Encumbrance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ResponsiveCheckbox label="Encumbrance Certificate Available" checked={legalEncumbranceCertificate} onChange={setLegalEncumbranceCertificate} />
                <ResponsiveInput label="Encumbrance Years" type="number" value={legalEncumbranceYears} onChange={setLegalEncumbranceYears} placeholder="e.g., 12" min="0" />
              </div>
            </div>
            
            {/* Bank Approvals */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-md font-medium text-gray-700">Bank Approvals</h3>
                <button type="button" onClick={addBankApproval} className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                  <Plus className="w-3 h-3" /> Add Bank Approval
                </button>
              </div>
              {legalBankApprovals.map((approval, index) => (
                <div key={index} className="mb-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex justify-end mb-2">
                    <button type="button" onClick={() => removeBankApproval(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <ResponsiveInput label="Bank Name *" value={approval.bankName} onChange={(v) => updateBankApproval(index, 'bankName', v)} placeholder="e.g., SBI, HDFC" />
                    <ResponsiveCheckbox label="Approved" checked={approval.approved} onChange={(v) => updateBankApproval(index, 'approved', v)} />
                    <ResponsiveInput label="Approval Date" type="date" value={approval.approvalDate?.split('T')[0]} onChange={(v) => updateBankApproval(index, 'approvalDate', v)} />
                    <ResponsiveInput label="Reference Number" value={approval.referenceNumber} onChange={(v) => updateBankApproval(index, 'referenceNumber', v)} placeholder="Reference number" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legal Verification */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Legal Verification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <ResponsiveCheckbox label="Legally Verified" checked={legalVerified} onChange={setLegalVerified} />
                {legalVerified && (
                  <>
                    <ResponsiveInput label="Verification Date" type="date" value={legalVerificationDate} onChange={setLegalVerificationDate} />
                    <div className="sm:col-span-2">
                      <ResponsiveInput label="Verifier Name" value={legalVerifier} onChange={setLegalVerifier} placeholder="Name of the verifying authority" />
                    </div>
                  </>
                )}
                <div className="sm:col-span-2">
                  <ResponsiveTextarea label="Legal Status Summary" value={legalStatusSummary} onChange={setLegalStatusSummary} placeholder="Summary of legal status and any remarks" rows={2} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Preference */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Contact Preference</h2>
            <div className="flex flex-wrap gap-3">
              {contactPreferenceOptions.map(pref => (
                <div key={pref} className="flex items-center">
                  <input type="checkbox" checked={contactPreference.includes(pref)} onChange={() => handleCheckboxArray(contactPreference, pref, setContactPreference)} className="h-4 w-4 text-blue-600 rounded" />
                  <label className="ml-2 text-sm text-gray-700">{pref.charAt(0).toUpperCase() + pref.slice(1)}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Images */}
          <div className="border-b pb-4 sm:pb-6 md:pb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 md:mb-6">Property Images *</h2>
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Upload Images <span className="text-red-500">*</span>
                <span className="text-gray-500 ml-1">(Max 10 images, at least 1 required)</span>
              </label>
              <div className="mt-1 px-4 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex justify-center text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload files</span>
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" required={mode === 'create'} />
                    </label>
                    <span className="ml-1">or drag and drop</span>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
            </div>
            {previewImages.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Image Previews</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <button type="button" onClick={() => window.history.back()} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center">
              {loading ? (mode === 'create' ? 'Creating...' : 'Updating...') : `${mode === 'create' ? 'Create' : 'Update'} Property Unit`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper Components (same as before)
const ResponsiveInput = React.memo(({ label, value, onChange, type = 'text', placeholder = '', required = false, min = null }) => (
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={placeholder} required={required} min={min} />
  </div>
));

const ResponsiveTextarea = React.memo(({ label, value, onChange, placeholder = '', required = false, rows = 3 }) => (
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={placeholder} required={required} rows={rows} />
  </div>
));

const ResponsiveSelect = React.memo(({ label, value, onChange, options, required = false }) => (
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required={required}>
      {options.map(option => (<option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1).replace(/-/g, ' ')}</option>))}
    </select>
  </div>
));

const ResponsiveYearSelect = React.memo(({ label, value, onChange }) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
  return (
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        <option value="">Select Year</option>
        {yearOptions.map(year => (<option key={year} value={year}>{year}</option>))}
      </select>
    </div>
  );
});

const ResponsiveCheckbox = React.memo(({ label, checked, onChange }) => (
  <div className="flex items-center">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 text-blue-600 rounded" />
    <label className="ml-2 text-sm text-gray-700">{label}</label>
  </div>
));

export default PropertyUnitForm;