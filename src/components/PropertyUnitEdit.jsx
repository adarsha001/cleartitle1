// components/PropertyUnitEdit.jsx (Complete Fixed Version with Image Deletion)
import React, { useState, useEffect } from 'react';

const PropertyUnitEdit = ({ property, onSubmit, onCancel }) => {
  const isEditing = !!property;
  
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    description: '',
    
    // Images
    images: [],
    
    // Location
    city: '',
    address: '',
    mapUrl: '',
    locationNearby: [],
    
    // Property Type
    propertyType: 'Apartment',
    
    // Unit Types (Multiple units per property)
    unitTypes: [
      {
        type: '2BHK',
        price: {
          amount: '',
          currency: 'INR',
          perUnit: 'total'
        },
        carpetArea: '',
        builtUpArea: '',
        superBuiltUpArea: '',
        availability: 'available',
        totalUnits: '',
        availableUnits: '',
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
    ],
    
    // Building/Project Details
    buildingDetails: {
      name: '',
      totalFloors: '',
      totalUnits: '',
      yearBuilt: '',
      amenities: []
    },
    
    // Unit Features
    unitFeatures: [],
    
    // Common Specifications
    commonSpecifications: {
      furnishing: 'unfurnished',
      possessionStatus: 'ready-to-move',
      ageOfProperty: '',
      parking: {
        covered: 0,
        open: 0
      },
      kitchenType: 'regular'
    },
    
    // Availability & Status
    availability: 'available',
    isFeatured: false,
    isVerified: false,
    approvalStatus: 'pending',
    listingType: 'sale',
    
    // Rejection Reason
    rejectionReason: '',
    
    // Owner Details
    ownerDetails: {
      name: '',
      phoneNumber: '',
      email: '',
      reasonForSelling: ''
    },
    
    // Legal Details
    legalDetails: {
      reraRegistered: false,
      reraNumber: '',
      reraWebsiteLink: '',
      sanctioningAuthority: '',
      sanctionNumber: '',
      sanctionDate: '',
      occupancyCertificate: false,
      occupancyCertificateNumber: '',
      occupancyCertificateDate: '',
      commencementCertificate: false,
      commencementCertificateNumber: '',
      commencementCertificateDate: '',
      khataStatus: 'Not Applicable',
      clearTitle: false,
      motherDeedAvailable: false,
      conversionCertificate: false,
      conversionType: '',
      encumbranceCertificate: false,
      encumbranceYears: '',
      ownershipType: 'freehold',
      bankApprovals: [],
      legalStatusSummary: '',
      legalVerified: false,
      legalVerificationDate: '',
      legalVerifier: ''
    },
    
    // Contact Preference
    contactPreference: ['call', 'whatsapp'],
    
    // Viewing Schedule
    viewingSchedule: [],
    
    // Statistics
    viewCount: 0,
    inquiryCount: 0,
    favoriteCount: 0,
    likes: 0,
    
    // Display
    displayOrder: 0
  });

  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buildingAmenityInput, setBuildingAmenityInput] = useState('');
  const [viewingSlot, setViewingSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    slotsAvailable: 1
  });

  // Track deleted images
  const [deletedImages, setDeletedImages] = useState([]); // Track public_ids for Cloudinary deletion
  const [deletedImageIds, setDeletedImageIds] = useState([]); // Track database IDs

  // Unit Types Management
  const [currentUnitType, setCurrentUnitType] = useState({
    type: '2BHK',
    price: { amount: '', currency: 'INR', perUnit: 'total' },
    carpetArea: '',
    builtUpArea: '',
    superBuiltUpArea: '',
    availability: 'available',
    totalUnits: '',
    availableUnits: '',
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
  });

  // Location Nearby Management
  const [currentLocationNearby, setCurrentLocationNearby] = useState({
    name: '',
    distance: '',
    type: 'other',
    icon: ''
  });

  // Bank Approval Management
  const [currentBankApproval, setCurrentBankApproval] = useState({
    bankName: '',
    approved: true,
    approvalDate: '',
    referenceNumber: ''
  });

  // Available options
  const propertyTypes = [
    'Apartment', 'Villa', 'Independent House', 'Studio', 
    'Penthouse', 'Duplex', 'Pg house', 'Plot', 'Commercial Space'
  ];

  const unitTypeOptions = ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Studio', 'Penthouse', 'Duplex', 'Plot'];
  const pricePerUnitOptions = ['total', 'sqft', 'sqm', 'month', 'perSqYard', 'perGround'];
  const unitAvailabilityOptions = ['available', 'sold', 'limited', 'coming-soon', 'booked', 'reserved'];
  
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

  const locationNearbyTypes = [
    { value: 'transport', label: 'Transport' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'banking', label: 'Banking' },
    { value: 'religious', label: 'Religious' },
    { value: 'park', label: 'Park' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'other', label: 'Other' }
  ];

  const khataStatusOptions = ['A-Khata', 'B-Khata', 'E-Khata', 'Not Applicable'];
  const ownershipTypeOptions = ['freehold', 'leasehold', 'cooperative', 'power-of-attorney'];

  const contactOptions = [
    { value: 'call', label: 'Phone Call' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
    { value: 'message', label: 'Message' }
  ];

  const unitFeatureOptions = [
    'Air Conditioning', 'Modular Kitchen', 'Wardrobes', 'Geyser',
    'Exhaust Fan', 'Chimney', 'Lighting', 'Ceiling Fans',
    'Smart Home Automation', 'Central AC', 'bore water', 'Walk-in Closet',
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
      setFormData({
        title: property.title || '',
        description: property.description || '',
        images: property.images || [],
        city: property.city || '',
        address: property.address || '',
        mapUrl: property.mapUrl || '',
        locationNearby: property.locationNearby || [],
        propertyType: property.propertyType || 'Apartment',
        unitTypes: property.unitTypes || [{
          type: '2BHK',
          price: { amount: '', currency: 'INR', perUnit: 'total' },
          carpetArea: '',
          builtUpArea: '',
          superBuiltUpArea: '',
          availability: 'available',
          totalUnits: '',
          availableUnits: '',
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
        }],
        buildingDetails: property.buildingDetails || {
          name: '',
          totalFloors: '',
          totalUnits: '',
          yearBuilt: '',
          amenities: []
        },
        unitFeatures: property.unitFeatures || [],
        commonSpecifications: property.commonSpecifications || {
          furnishing: 'unfurnished',
          possessionStatus: 'ready-to-move',
          ageOfProperty: '',
          parking: { covered: 0, open: 0 },
          kitchenType: 'regular'
        },
        availability: property.availability || 'available',
        isFeatured: property.isFeatured || false,
        isVerified: property.isVerified || false,
        approvalStatus: property.approvalStatus || 'pending',
        listingType: property.listingType || 'sale',
        rejectionReason: property.rejectionReason || '',
        ownerDetails: property.ownerDetails || {
          name: '',
          phoneNumber: '',
          email: '',
          reasonForSelling: ''
        },
        legalDetails: property.legalDetails || {
          reraRegistered: false,
          reraNumber: '',
          reraWebsiteLink: '',
          sanctioningAuthority: '',
          sanctionNumber: '',
          sanctionDate: '',
          occupancyCertificate: false,
          occupancyCertificateNumber: '',
          occupancyCertificateDate: '',
          commencementCertificate: false,
          commencementCertificateNumber: '',
          commencementCertificateDate: '',
          khataStatus: 'Not Applicable',
          clearTitle: false,
          motherDeedAvailable: false,
          conversionCertificate: false,
          conversionType: '',
          encumbranceCertificate: false,
          encumbranceYears: '',
          ownershipType: 'freehold',
          bankApprovals: [],
          legalStatusSummary: '',
          legalVerified: false,
          legalVerificationDate: '',
          legalVerifier: ''
        },
        contactPreference: property.contactPreference || ['call', 'whatsapp'],
        viewingSchedule: property.viewingSchedule || [],
        viewCount: property.viewCount || 0,
        inquiryCount: property.inquiryCount || 0,
        favoriteCount: property.favoriteCount || 0,
        likes: property.likes || 0,
        displayOrder: property.displayOrder || 0
      });
      
      // Reset deleted images tracking
      setDeletedImages([]);
      setDeletedImageIds([]);
    }
  }, [property]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      setFormData(prev => {
        let updated = { ...prev };
        let current = updated;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = type === 'checkbox' ? checked : 
                                              type === 'number' ? (value === '' ? '' : Number(value)) : 
                                              value;
        return updated;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                 type === 'number' ? (value === '' ? '' : Number(value)) : 
                 value
      }));
    }
  };

  // Update plot detail for a specific unit
  const updatePlotDetail = (unitIndex, path, value) => {
    setFormData(prev => {
      const updatedUnitTypes = [...prev.unitTypes];
      const unit = updatedUnitTypes[unitIndex];
      
      if (!unit.plotDetails) {
        unit.plotDetails = {};
      }
      
      const parts = path.split('.');
      let current = unit.plotDetails;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      current[parts[parts.length - 1]] = value;
      
      return { ...prev, unitTypes: updatedUnitTypes };
    });
  };

  // Unit Types Management
  const addUnitType = () => {
    if (currentUnitType.type && currentUnitType.price.amount) {
      setFormData(prev => ({
        ...prev,
        unitTypes: [...prev.unitTypes, { ...currentUnitType }]
      }));
      setCurrentUnitType({
        type: '2BHK',
        price: { amount: '', currency: 'INR', perUnit: 'total' },
        carpetArea: '',
        builtUpArea: '',
        superBuiltUpArea: '',
        availability: 'available',
        totalUnits: '',
        availableUnits: '',
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
      });
    }
  };

  const removeUnitType = (index) => {
    setFormData(prev => ({
      ...prev,
      unitTypes: prev.unitTypes.filter((_, i) => i !== index)
    }));
  };

  const updateUnitType = (index, field, value) => {
    setFormData(prev => {
      const updatedUnitTypes = [...prev.unitTypes];
      if (field.includes('price.')) {
        const priceField = field.split('.')[1];
        updatedUnitTypes[index].price[priceField] = value;
      } else {
        updatedUnitTypes[index][field] = value;
      }
      return { ...prev, unitTypes: updatedUnitTypes };
    });
  };

  // Location Nearby Management
  const addLocationNearby = () => {
    if (currentLocationNearby.name && currentLocationNearby.distance) {
      setFormData(prev => ({
        ...prev,
        locationNearby: [...prev.locationNearby, { ...currentLocationNearby }]
      }));
      setCurrentLocationNearby({
        name: '',
        distance: '',
        type: 'other',
        icon: ''
      });
    }
  };

  const removeLocationNearby = (index) => {
    setFormData(prev => ({
      ...prev,
      locationNearby: prev.locationNearby.filter((_, i) => i !== index)
    }));
  };

  // Bank Approval Management
  const addBankApproval = () => {
    if (currentBankApproval.bankName) {
      setFormData(prev => ({
        ...prev,
        legalDetails: {
          ...prev.legalDetails,
          bankApprovals: [...prev.legalDetails.bankApprovals, { ...currentBankApproval }]
        }
      }));
      setCurrentBankApproval({
        bankName: '',
        approved: true,
        approvalDate: '',
        referenceNumber: ''
      });
    }
  };

  const removeBankApproval = (index) => {
    setFormData(prev => ({
      ...prev,
      legalDetails: {
        ...prev.legalDetails,
        bankApprovals: prev.legalDetails.bankApprovals.filter((_, i) => i !== index)
      }
    }));
  };

  // Building Amenities
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

  // Unit Features
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

  // Viewing Schedule
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

  // Image Handling with deletion tracking
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setNewImages(prev => [...prev, ...newImageFiles]);
  };

  const removeImage = (index) => {
    const imageToDelete = formData.images[index];
    
    // Track the image for deletion on backend
    if (imageToDelete) {
      if (imageToDelete.public_id) {
        setDeletedImages(prev => [...prev, imageToDelete.public_id]);
      }
      if (imageToDelete._id) {
        setDeletedImageIds(prev => [...prev, imageToDelete._id]);
      }
    }
    
    // Remove from local state
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeNewImage = (index) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Form Submission with image deletion support
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formDataToSubmit = new FormData();
      
      // Prepare submit data - ensure all numeric fields are proper numbers
      const submitData = {
        title: formData.title,
        description: formData.description,
        city: formData.city,
        address: formData.address,
        mapUrl: formData.mapUrl,
        locationNearby: formData.locationNearby,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        availability: formData.availability,
        isFeatured: formData.isFeatured,
        isVerified: formData.isVerified,
        approvalStatus: formData.approvalStatus,
        rejectionReason: formData.rejectionReason,
        contactPreference: formData.contactPreference,
        displayOrder: Number(formData.displayOrder) || 0,
        unitFeatures: formData.unitFeatures,
        
        // Send remaining images
        images: formData.images,
        
        // Send deleted image information
        deletedImages: deletedImages,
        deletedImageIds: deletedImageIds,
        
        // Unit Types with proper number conversion
        unitTypes: formData.unitTypes.map(unit => {
          const unitData = {
            type: unit.type,
            price: {
              amount: unit.price?.amount ? Number(unit.price.amount) : 0,
              currency: unit.price?.currency || 'INR',
              perUnit: unit.price?.perUnit || 'total'
            },
            carpetArea: unit.carpetArea ? Number(unit.carpetArea) : 0,
            builtUpArea: unit.builtUpArea ? Number(unit.builtUpArea) : 0,
            superBuiltUpArea: unit.superBuiltUpArea ? Number(unit.superBuiltUpArea) : 0,
            availability: unit.availability || 'available',
            totalUnits: unit.totalUnits ? Number(unit.totalUnits) : 0,
            availableUnits: unit.availableUnits ? Number(unit.availableUnits) : 0
          };
          
          // Include plot details if this is a plot
          if (unit.type === 'Plot' && unit.plotDetails) {
            unitData.plotDetails = {
              dimensions: {
                length: unit.plotDetails.dimensions?.length ? Number(unit.plotDetails.dimensions.length) : 0,
                breadth: unit.plotDetails.dimensions?.breadth ? Number(unit.plotDetails.dimensions.breadth) : 0,
                frontage: unit.plotDetails.dimensions?.frontage ? Number(unit.plotDetails.dimensions.frontage) : 0
              },
              area: {
                sqft: unit.plotDetails.area?.sqft ? Number(unit.plotDetails.area.sqft) : (unit.carpetArea ? Number(unit.carpetArea) : 0),
                sqYards: unit.plotDetails.area?.sqYards ? Number(unit.plotDetails.area.sqYards) : 0,
                grounds: unit.plotDetails.area?.grounds ? Number(unit.plotDetails.area.grounds) : 0,
                acres: unit.plotDetails.area?.acres ? Number(unit.plotDetails.area.acres) : 0,
                cents: unit.plotDetails.area?.cents ? Number(unit.plotDetails.area.cents) : 0
              },
              shape: unit.plotDetails.shape || 'rectangle',
              facing: unit.plotDetails.facing || null,
              isCornerPlot: unit.plotDetails.isCornerPlot || false,
              cornerRoads: unit.plotDetails.cornerRoads || [],
              roadWidth: unit.plotDetails.roadWidth ? Number(unit.plotDetails.roadWidth) : 0,
              roadType: unit.plotDetails.roadType || 'secondary',
              boundaryWalls: unit.plotDetails.boundaryWalls || false,
              fencing: unit.plotDetails.fencing || false,
              gate: unit.plotDetails.gate || false,
              elevationAvailable: unit.plotDetails.elevationAvailable || false,
              soilType: unit.plotDetails.soilType || null,
              landUse: unit.plotDetails.landUse || 'residential',
              developmentStatus: unit.plotDetails.developmentStatus || 'developed',
              amenities: unit.plotDetails.amenities || [],
              utilities: {
                electricity: unit.plotDetails.utilities?.electricity || false,
                waterConnection: unit.plotDetails.utilities?.waterConnection || false,
                sewageConnection: unit.plotDetails.utilities?.sewageConnection || false,
                gasConnection: unit.plotDetails.utilities?.gasConnection || false,
                internetFiber: unit.plotDetails.utilities?.internetFiber || false
              },
              approvalDetails: {
                dtcpApproved: unit.plotDetails.approvalDetails?.dtcpApproved || false,
                dtcpNumber: unit.plotDetails.approvalDetails?.dtcpNumber || '',
                layoutApproved: unit.plotDetails.approvalDetails?.layoutApproved || false,
                layoutNumber: unit.plotDetails.approvalDetails?.layoutNumber || '',
                surveyNumber: unit.plotDetails.approvalDetails?.surveyNumber || '',
                pattaNumber: unit.plotDetails.approvalDetails?.pattaNumber || '',
                subdivisionApproved: unit.plotDetails.approvalDetails?.subdivisionApproved || false
              }
            };
          }
          
          return unitData;
        }),
        
        // Building Details
        buildingDetails: {
          name: formData.buildingDetails.name || '',
          totalFloors: formData.buildingDetails.totalFloors ? Number(formData.buildingDetails.totalFloors) : 0,
          totalUnits: formData.buildingDetails.totalUnits ? Number(formData.buildingDetails.totalUnits) : 0,
          yearBuilt: formData.buildingDetails.yearBuilt ? Number(formData.buildingDetails.yearBuilt) : 0,
          amenities: formData.buildingDetails.amenities || []
        },
        
        // Common Specifications
        commonSpecifications: {
          furnishing: formData.commonSpecifications.furnishing || 'unfurnished',
          possessionStatus: formData.commonSpecifications.possessionStatus || 'ready-to-move',
          ageOfProperty: formData.commonSpecifications.ageOfProperty ? Number(formData.commonSpecifications.ageOfProperty) : 0,
          parking: {
            covered: Number(formData.commonSpecifications.parking?.covered) || 0,
            open: Number(formData.commonSpecifications.parking?.open) || 0
          },
          kitchenType: formData.commonSpecifications.kitchenType || 'regular'
        },
        
        // Owner Details
        ownerDetails: {
          name: formData.ownerDetails.name || '',
          phoneNumber: formData.ownerDetails.phoneNumber || '',
          email: formData.ownerDetails.email || '',
          reasonForSelling: formData.ownerDetails.reasonForSelling || ''
        },
        
        // Legal Details
        legalDetails: {
          reraRegistered: formData.legalDetails.reraRegistered || false,
          reraNumber: formData.legalDetails.reraNumber || '',
          reraWebsiteLink: formData.legalDetails.reraWebsiteLink || '',
          sanctioningAuthority: formData.legalDetails.sanctioningAuthority || '',
          sanctionNumber: formData.legalDetails.sanctionNumber || '',
          sanctionDate: formData.legalDetails.sanctionDate || null,
          occupancyCertificate: formData.legalDetails.occupancyCertificate || false,
          occupancyCertificateNumber: formData.legalDetails.occupancyCertificateNumber || '',
          occupancyCertificateDate: formData.legalDetails.occupancyCertificateDate || null,
          commencementCertificate: formData.legalDetails.commencementCertificate || false,
          commencementCertificateNumber: formData.legalDetails.commencementCertificateNumber || '',
          commencementCertificateDate: formData.legalDetails.commencementCertificateDate || null,
          khataStatus: formData.legalDetails.khataStatus || 'Not Applicable',
          clearTitle: formData.legalDetails.clearTitle || false,
          motherDeedAvailable: formData.legalDetails.motherDeedAvailable || false,
          conversionCertificate: formData.legalDetails.conversionCertificate || false,
          conversionType: formData.legalDetails.conversionType || '',
          encumbranceCertificate: formData.legalDetails.encumbranceCertificate || false,
          encumbranceYears: formData.legalDetails.encumbranceYears ? Number(formData.legalDetails.encumbranceYears) : 0,
          ownershipType: formData.legalDetails.ownershipType || 'freehold',
          bankApprovals: formData.legalDetails.bankApprovals || [],
          legalStatusSummary: formData.legalDetails.legalStatusSummary || '',
          legalVerified: formData.legalDetails.legalVerified || false,
          legalVerificationDate: formData.legalDetails.legalVerificationDate || null,
          legalVerifier: formData.legalDetails.legalVerifier || ''
        },
        
        // Viewing Schedule
        viewingSchedule: formData.viewingSchedule.map(slot => ({
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          slotsAvailable: Number(slot.slotsAvailable) || 1
        }))
      };
      
      // Send as JSON
      formDataToSubmit.append('data', JSON.stringify(submitData));
      
      // Append new images
      newImages.forEach(image => {
        formDataToSubmit.append('images', image.file);
      });
      
      // Log what's being sent for debugging
      console.log('Sending data:', submitData);
      console.log('Deleted images:', deletedImages);
      console.log('Deleted image IDs:', deletedImageIds);
      
      await onSubmit(formDataToSubmit);
      
      // Clear deleted images tracking after successful submission
      setDeletedImages([]);
      setDeletedImageIds([]);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.response?.data?.message || 'Failed to save property. Please check all fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
      {/* Basic Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
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
            value={formData.propertyType || 'Apartment'}
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
            value={formData.listingType || 'sale'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ''}
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
              value={formData.mapUrl || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Google Maps embed URL"
            />
          </div>
        </div>

        {/* Location Nearby */}
        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-800 mb-3">Nearby Amenities</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Place name (e.g., Metro Station)"
              value={currentLocationNearby.name}
              onChange={(e) => setCurrentLocationNearby({...currentLocationNearby, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Distance (e.g., 500m, 1.2km)"
              value={currentLocationNearby.distance}
              onChange={(e) => setCurrentLocationNearby({...currentLocationNearby, distance: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={currentLocationNearby.type}
              onChange={(e) => setCurrentLocationNearby({...currentLocationNearby, type: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {locationNearbyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addLocationNearby}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Location
            </button>
          </div>
          
          {formData.locationNearby && formData.locationNearby.length > 0 && (
            <div className="space-y-2">
              {formData.locationNearby.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.distance} • {locationNearbyTypes.find(t => t.value === item.type)?.label}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLocationNearby(index)}
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

      {/* Unit Types */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Unit Types</h3>
        
        {/* Existing Unit Types */}
        {formData.unitTypes && formData.unitTypes.map((unit, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-800">Unit Type {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeUnitType(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <select
                value={unit.type || '2BHK'}
                onChange={(e) => updateUnitType(index, 'type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {unitTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price Amount"
                value={unit.price?.amount || ''}
                onChange={(e) => updateUnitType(index, 'price.amount', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit.price?.perUnit || 'total'}
                onChange={(e) => updateUnitType(index, 'price.perUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {pricePerUnitOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Carpet Area (sq.ft)"
                value={unit.carpetArea || ''}
                onChange={(e) => updateUnitType(index, 'carpetArea', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Built-up Area (sq.ft)"
                value={unit.builtUpArea || ''}
                onChange={(e) => updateUnitType(index, 'builtUpArea', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Super Built-up Area (sq.ft)"
                value={unit.superBuiltUpArea || ''}
                onChange={(e) => updateUnitType(index, 'superBuiltUpArea', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit.availability || 'available'}
                onChange={(e) => updateUnitType(index, 'availability', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {unitAvailabilityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Total Units"
                value={unit.totalUnits || ''}
                onChange={(e) => updateUnitType(index, 'totalUnits', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Available Units"
                value={unit.availableUnits || ''}
                onChange={(e) => updateUnitType(index, 'availableUnits', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Plot Details Section - Show only when unit type is Plot */}
            {unit.type === 'Plot' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-800 mb-3">Plot Details</h5>
                
                {/* Plot Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Length (ft)
                    </label>
                    <input
                      type="number"
                      value={unit.plotDetails?.dimensions?.length || ''}
                      onChange={(e) => updatePlotDetail(index, 'dimensions.length', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Breadth (ft)
                    </label>
                    <input
                      type="number"
                      value={unit.plotDetails?.dimensions?.breadth || ''}
                      onChange={(e) => updatePlotDetail(index, 'dimensions.breadth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frontage (ft)
                    </label>
                    <input
                      type="number"
                      value={unit.plotDetails?.dimensions?.frontage || ''}
                      onChange={(e) => updatePlotDetail(index, 'dimensions.frontage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Plot Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area (sq.ft)
                    </label>
                    <input
                      type="number"
                      value={unit.plotDetails?.area?.sqft || unit.carpetArea || ''}
                      onChange={(e) => {
                        updatePlotDetail(index, 'area.sqft', e.target.value);
                        updateUnitType(index, 'carpetArea', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area (sq.yards)
                    </label>
                    <input
                      type="number"
                      value={unit.plotDetails?.area?.sqYards || ''}
                      onChange={(e) => updatePlotDetail(index, 'area.sqYards', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area (cents)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={unit.plotDetails?.area?.cents || ''}
                      onChange={(e) => updatePlotDetail(index, 'area.cents', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Shape and Facing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plot Shape
                    </label>
                    <select
                      value={unit.plotDetails?.shape || 'rectangle'}
                      onChange={(e) => updatePlotDetail(index, 'shape', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="square">Square</option>
                      <option value="rectangle">Rectangle</option>
                      <option value="corner">Corner</option>
                      <option value="irregular">Irregular</option>
                      <option value="triangular">Triangular</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plot Facing
                    </label>
                    <select
                      value={unit.plotDetails?.facing || ''}
                      onChange={(e) => updatePlotDetail(index, 'facing', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Facing</option>
                      <option value="north">North</option>
                      <option value="south">South</option>
                      <option value="east">East</option>
                      <option value="west">West</option>
                      <option value="north-east">North-East</option>
                      <option value="north-west">North-West</option>
                      <option value="south-east">South-East</option>
                      <option value="south-west">South-West</option>
                    </select>
                  </div>
                </div>

                {/* Corner Plot */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`cornerPlot-${index}`}
                      checked={unit.plotDetails?.isCornerPlot || false}
                      onChange={(e) => updatePlotDetail(index, 'isCornerPlot', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`cornerPlot-${index}`} className="ml-2 text-sm text-gray-700">
                      Corner Plot
                    </label>
                  </div>
                  
                  {unit.plotDetails?.isCornerPlot && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Corner Roads
                      </label>
                      <input
                        type="text"
                        placeholder="Enter road names separated by commas"
                        value={unit.plotDetails?.cornerRoads?.join(', ') || ''}
                        onChange={(e) => {
                          const roads = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                          updatePlotDetail(index, 'cornerRoads', roads);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Land Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Land Use
                    </label>
                    <select
                      value={unit.plotDetails?.landUse || 'residential'}
                      onChange={(e) => updatePlotDetail(index, 'landUse', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="agricultural">Agricultural</option>
                      <option value="industrial">Industrial</option>
                      <option value="mixed-use">Mixed Use</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Development Status
                    </label>
                    <select
                      value={unit.plotDetails?.developmentStatus || 'developed'}
                      onChange={(e) => updatePlotDetail(index, 'developmentStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="developed">Developed</option>
                      <option value="semi-developed">Semi-Developed</option>
                      <option value="undeveloped">Undeveloped</option>
                    </select>
                  </div>
                </div>

                {/* Utilities */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Utilities Available
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`electricity-${index}`}
                        checked={unit.plotDetails?.utilities?.electricity || false}
                        onChange={(e) => updatePlotDetail(index, 'utilities.electricity', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`electricity-${index}`} className="ml-2 text-sm text-gray-700">
                        Electricity
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`water-${index}`}
                        checked={unit.plotDetails?.utilities?.waterConnection || false}
                        onChange={(e) => updatePlotDetail(index, 'utilities.waterConnection', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`water-${index}`} className="ml-2 text-sm text-gray-700">
                        Water Connection
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`sewage-${index}`}
                        checked={unit.plotDetails?.utilities?.sewageConnection || false}
                        onChange={(e) => updatePlotDetail(index, 'utilities.sewageConnection', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`sewage-${index}`} className="ml-2 text-sm text-gray-700">
                        Sewage Connection
                      </label>
                    </div>
                  </div>
                </div>

                {/* DTCP Approval */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`dtcp-${index}`}
                      checked={unit.plotDetails?.approvalDetails?.dtcpApproved || false}
                      onChange={(e) => updatePlotDetail(index, 'approvalDetails.dtcpApproved', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`dtcp-${index}`} className="ml-2 text-sm text-gray-700">
                      DTCP Approved
                    </label>
                  </div>
                  {unit.plotDetails?.approvalDetails?.dtcpApproved && (
                    <input
                      type="text"
                      placeholder="DTCP Number"
                      value={unit.plotDetails?.approvalDetails?.dtcpNumber || ''}
                      onChange={(e) => updatePlotDetail(index, 'approvalDetails.dtcpNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add New Unit Type */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="font-medium text-gray-800 mb-3">Add New Unit Type</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <select
              value={currentUnitType.type}
              onChange={(e) => setCurrentUnitType({...currentUnitType, type: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {unitTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price Amount"
              value={currentUnitType.price.amount}
              onChange={(e) => setCurrentUnitType({...currentUnitType, price: {...currentUnitType.price, amount: e.target.value}})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={currentUnitType.price.perUnit}
              onChange={(e) => setCurrentUnitType({...currentUnitType, price: {...currentUnitType.price, perUnit: e.target.value}})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {pricePerUnitOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Carpet Area (sq.ft)"
              value={currentUnitType.carpetArea}
              onChange={(e) => setCurrentUnitType({...currentUnitType, carpetArea: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addUnitType}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Unit Type
            </button>
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
              value={formData.buildingDetails?.name || ''}
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
              value={formData.buildingDetails?.totalFloors || ''}
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
              value={formData.buildingDetails?.totalUnits || ''}
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
              value={formData.buildingDetails?.yearBuilt || ''}
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
          
          {formData.buildingDetails?.amenities && formData.buildingDetails.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.buildingDetails.amenities.map((amenity, idx) => (
                <div
                  key={idx}
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
                checked={formData.unitFeatures?.includes(feature) || false}
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

      {/* Common Specifications */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Furnishing
            </label>
            <select
              name="commonSpecifications.furnishing"
              value={formData.commonSpecifications?.furnishing || 'unfurnished'}
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
              name="commonSpecifications.possessionStatus"
              value={formData.commonSpecifications?.possessionStatus || 'ready-to-move'}
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
              name="commonSpecifications.ageOfProperty"
              value={formData.commonSpecifications?.ageOfProperty || ''}
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
              name="commonSpecifications.parking.covered"
              value={formData.commonSpecifications?.parking?.covered || 0}
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
              name="commonSpecifications.parking.open"
              value={formData.commonSpecifications?.parking?.open || 0}
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
              name="commonSpecifications.kitchenType"
              value={formData.commonSpecifications?.kitchenType || 'regular'}
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
              value={formData.approvalStatus || 'pending'}
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
              value={formData.availability || 'available'}
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
                checked={formData.isFeatured || false}
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
                checked={formData.isVerified || false}
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
              value={formData.rejectionReason || ''}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name
            </label>
            <input
              type="text"
              name="ownerDetails.name"
              value={formData.ownerDetails?.name || ''}
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
              value={formData.ownerDetails?.phoneNumber || ''}
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
              value={formData.ownerDetails?.email || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Selling/Renting
            </label>
            <input
              type="text"
              name="ownerDetails.reasonForSelling"
              value={formData.ownerDetails?.reasonForSelling || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Legal Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Legal Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ownership Type
            </label>
            <select
              name="legalDetails.ownershipType"
              value={formData.legalDetails?.ownershipType || 'freehold'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ownershipTypeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khata Status
            </label>
            <select
              name="legalDetails.khataStatus"
              value={formData.legalDetails?.khataStatus || 'Not Applicable'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {khataStatusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="legalDetails.reraRegistered"
                checked={formData.legalDetails?.reraRegistered || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                RERA Registered
              </label>
            </div>
            {formData.legalDetails?.reraRegistered && (
              <input
                type="text"
                name="legalDetails.reraNumber"
                value={formData.legalDetails?.reraNumber || ''}
                onChange={handleChange}
                placeholder="RERA Number"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="legalDetails.occupancyCertificate"
                checked={formData.legalDetails?.occupancyCertificate || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Occupancy Certificate
              </label>
            </div>
            {formData.legalDetails?.occupancyCertificate && (
              <input
                type="text"
                name="legalDetails.occupancyCertificateNumber"
                value={formData.legalDetails?.occupancyCertificateNumber || ''}
                onChange={handleChange}
                placeholder="Certificate Number"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="legalDetails.clearTitle"
                checked={formData.legalDetails?.clearTitle || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Clear Title
              </label>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                name="legalDetails.encumbranceCertificate"
                checked={formData.legalDetails?.encumbranceCertificate || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Encumbrance Certificate
              </label>
            </div>
            {formData.legalDetails?.encumbranceCertificate && (
              <input
                type="number"
                name="legalDetails.encumbranceYears"
                value={formData.legalDetails?.encumbranceYears || ''}
                onChange={handleChange}
                placeholder="Years"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        {/* Bank Approvals */}
        <div className="mt-4">
          <h4 className="text-md font-medium text-gray-800 mb-3">Bank Approvals</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Bank Name"
              value={currentBankApproval.bankName}
              onChange={(e) => setCurrentBankApproval({...currentBankApproval, bankName: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              placeholder="Approval Date"
              value={currentBankApproval.approvalDate}
              onChange={(e) => setCurrentBankApproval({...currentBankApproval, approvalDate: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addBankApproval}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Bank Approval
            </button>
          </div>
          
          {formData.legalDetails?.bankApprovals && formData.legalDetails.bankApprovals.length > 0 && (
            <div className="space-y-2">
              {formData.legalDetails.bankApprovals.map((approval, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-3">
                  <div>
                    <p className="font-medium">{approval.bankName}</p>
                    <p className="text-sm text-gray-500">Approved: {approval.approved ? 'Yes' : 'No'}</p>
                    {approval.approvalDate && <p className="text-xs text-gray-400">Date: {approval.approvalDate}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBankApproval(idx)}
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
                    checked={formData.contactPreference?.includes(option.value) || false}
                    onChange={(e) => {
                      const updatedContacts = e.target.checked
                        ? [...(formData.contactPreference || []), option.value]
                        : (formData.contactPreference || []).filter(c => c !== option.value);
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
              
              {formData.viewingSchedule && formData.viewingSchedule.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.viewingSchedule.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium">{new Date(slot.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{slot.startTime} - {slot.endTime}</p>
                        <p className="text-xs text-gray-500">{slot.slotsAvailable} slots available</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeViewingSlot(idx)}
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

      {/* Display Order */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Display Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Order
          </label>
          <input
            type="number"
            name="displayOrder"
            value={formData.displayOrder || 0}
            onChange={handleChange}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Lower numbers appear first in listings
          </p>
        </div>
      </div>

      {/* Images */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
        
        {/* Existing Images */}
        {formData.images && formData.images.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Existing Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.images.map((image, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={image.url}
                    alt={`Property ${idx + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
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
              {newImages.map((image, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={image.preview}
                    alt={`New ${idx + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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