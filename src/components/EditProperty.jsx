import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Loader,
  Image as ImageIcon,
  MapPin,
  Home,
  Building,
  DollarSign,
  FileText,
  Users,
  Scale,
  Clock,
  Car,
  Wifi,
  Shield,
  Droplet,
  Zap,
  Thermometer,
  Key,
  Bed,
  Bath,
  Maximize,
  ChevronDown,
  ChevronUp,Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyService } from '../api/mypropertyApi';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    location: true,
    units: true,
    features: true,
    media: true,
    owner: true,
    legal: true,
    documents: true
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    address: '',
    mapUrl: '',
    propertyType: 'Apartment',
    listingType: 'sale',
    availability: 'available',
    isFeatured: false,
    isVerified: false,
    unitTypes: [],
    images: [],
    locationNearby: [],
    unitFeatures: [],
    buildingDetails: {
      name: '',
      totalFloors: 0,
      totalUnits: 0,
      yearBuilt: 0,
      amenities: []
    },
    commonSpecifications: {
      furnishing: 'unfurnished',
      possessionStatus: 'ready-to-move',
      ageOfProperty: 0,
      parking: { covered: 0, open: 0 },
      kitchenType: 'regular'
    },
    ownerDetails: {
      name: '',
      phoneNumber: '',
      email: '',
      reasonForSelling: ''
    },
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
      encumbranceYears: 0,
      ownershipType: 'freehold',
      bankApprovals: [],
      legalStatusSummary: '',
      legalVerified: false,
      legalVerificationDate: '',
      legalVerifier: ''
    },
    viewingSchedule: [],
    contactPreference: ['call', 'whatsapp']
  });

  // Unit features list for dropdown
  const availableFeatures = [
    "Air Conditioning", "Modular Kitchen", "Wardrobes", "Geyser", "Exhaust Fan",
    "Chimney", "Lighting", "Ceiling Fans", "Smart Home Automation", "Central AC",
    "bore water", "Walk-in Closet", "Study Room", "Pooja Room", "Utility Area",
    "Servant Room", "Private Garden", "Terrace", "Balcony", "Swimming Pool",
    "Video Door Phone", "Security Alarm", "Fire Safety", "CCTV", "Pet Friendly",
    "Wheelchair Access", "Natural Light", "View"
  ];

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await propertyService.getPropertyById(id);
      setFormData(response.property);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load property');
      navigate('/my-properties');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleDeepNestedChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    const updatedArray = [...formData[section]];
    updatedArray[index][field] = value;
    setFormData(prev => ({ ...prev, [section]: updatedArray }));
  };

  // Unit Types Management
  const addUnitType = () => {
    setFormData(prev => ({
      ...prev,
      unitTypes: [
        ...prev.unitTypes,
        {
          type: '2BHK',
          price: { amount: 0, currency: 'INR', perUnit: 'total' },
          carpetArea: 0,
          builtUpArea: 0,
          superBuiltUpArea: 0,
          floors: 1,
          floorNumber: 1,
          availability: 'available',
          totalUnits: 1,
          availableUnits: 1,
          plotDetails: {
            dimensions: { length: 0, breadth: 0, frontage: 0 },
            area: { sqft: 0, sqYards: 0, grounds: 0, acres: 0, cents: 0 },
            shape: 'rectangle',
            facing: '',
            isCornerPlot: false,
            cornerRoads: [],
            roadWidth: 0,
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
      ]
    }));
  };

  const removeUnitType = (index) => {
    const updatedUnits = formData.unitTypes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, unitTypes: updatedUnits }));
  };

  const handleUnitChange = (index, field, value) => {
    const updatedUnits = [...formData.unitTypes];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedUnits[index][parent][child] = value;
    } else if (field.includes('plotDetails.')) {
      const path = field.split('.');
      if (path.length === 2) {
        updatedUnits[index].plotDetails[path[1]] = value;
      } else if (path.length === 3) {
        updatedUnits[index].plotDetails[path[1]][path[2]] = value;
      } else if (path.length === 4) {
        updatedUnits[index].plotDetails[path[1]][path[2]][path[3]] = value;
      }
    } else {
      updatedUnits[index][field] = value;
    }
    setFormData(prev => ({ ...prev, unitTypes: updatedUnits }));
  };

  // Location Nearby Management
  const addLocationNearby = () => {
    setFormData(prev => ({
      ...prev,
      locationNearby: [
        ...prev.locationNearby,
        { name: '', distance: '', type: 'other', icon: '', coordinates: { latitude: 0, longitude: 0 } }
      ]
    }));
  };

  const removeLocationNearby = (index) => {
    const updated = formData.locationNearby.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, locationNearby: updated }));
  };

  // Features Management
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      unitFeatures: [...prev.unitFeatures, '']
    }));
  };

  const removeFeature = (index) => {
    const updated = formData.unitFeatures.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, unitFeatures: updated }));
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...formData.unitFeatures];
    updated[index] = value;
    setFormData(prev => ({ ...prev, unitFeatures: updated }));
  };

  // Images Management
  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', public_id: '', caption: '' }]
    }));
  };

  const removeImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: updated }));
  };

  const handleImageChange = (index, field, value) => {
    const updated = [...formData.images];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, images: updated }));
  };

  // Building Amenities Management
  const addBuildingAmenity = () => {
    setFormData(prev => ({
      ...prev,
      buildingDetails: {
        ...prev.buildingDetails,
        amenities: [...(prev.buildingDetails.amenities || []), '']
      }
    }));
  };

  const removeBuildingAmenity = (index) => {
    const updated = [...(formData.buildingDetails.amenities || [])];
    updated.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      buildingDetails: {
        ...prev.buildingDetails,
        amenities: updated
      }
    }));
  };

  const handleBuildingAmenityChange = (index, value) => {
    const updated = [...(formData.buildingDetails.amenities || [])];
    updated[index] = value;
    setFormData(prev => ({
      ...prev,
      buildingDetails: {
        ...prev.buildingDetails,
        amenities: updated
      }
    }));
  };

  // Bank Approvals Management
  const addBankApproval = () => {
    setFormData(prev => ({
      ...prev,
      legalDetails: {
        ...prev.legalDetails,
        bankApprovals: [
          ...(prev.legalDetails.bankApprovals || []),
          { bankName: '', approved: true, approvalDate: '', referenceNumber: '' }
        ]
      }
    }));
  };

  const removeBankApproval = (index) => {
    const updated = [...(formData.legalDetails.bankApprovals || [])];
    updated.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      legalDetails: {
        ...prev.legalDetails,
        bankApprovals: updated
      }
    }));
  };

  const handleBankApprovalChange = (index, field, value) => {
    const updated = [...(formData.legalDetails.bankApprovals || [])];
    updated[index][field] = value;
    setFormData(prev => ({
      ...prev,
      legalDetails: {
        ...prev.legalDetails,
        bankApprovals: updated
      }
    }));
  };

  // Viewing Schedule Management
  const addViewingSlot = () => {
    setFormData(prev => ({
      ...prev,
      viewingSchedule: [
        ...prev.viewingSchedule,
        { date: '', startTime: '', endTime: '', slotsAvailable: 1 }
      ]
    }));
  };

  const removeViewingSlot = (index) => {
    const updated = formData.viewingSchedule.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, viewingSchedule: updated }));
  };

  const handleViewingSlotChange = (index, field, value) => {
    const updated = [...formData.viewingSchedule];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, viewingSchedule: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await propertyService.updateProperty(id, formData);
      toast.success('Property updated successfully');
      navigate('/my-properties');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Edit Property</h1>
                <p className="text-blue-100 text-sm mt-1">Update your property details</p>
              </div>
              <button
                onClick={() => navigate('/my-properties')}
                className="text-white hover:text-gray-200 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
            <nav className="flex px-6">
              {[
                { id: 'basic', label: 'Basic Info', icon: Home },
                { id: 'location', label: 'Location', icon: MapPin },
                { id: 'units', label: 'Units & Pricing', icon: Building },
                { id: 'features', label: 'Features', icon: Star },
                { id: 'media', label: 'Media', icon: ImageIcon },
                { id: 'owner', label: 'Owner Details', icon: Users },
                { id: 'legal', label: 'Legal Info', icon: Scale },
                { id: 'documents', label: 'Documents', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-4 font-medium text-sm transition-all ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Luxury 3BHK Apartment in Downtown"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your property in detail..."
                  />
                </div>

                {/* Property Type and Listing Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Property Type *
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Independent House">Independent House</option>
                      <option value="Studio">Studio</option>
                      <option value="Penthouse">Penthouse</option>
                      <option value="Duplex">Duplex</option>
                      <option value="Plot">Plot/Land</option>
                      <option value="Commercial Space">Commercial Space</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Listing Type *
                    </label>
                    <select
                      name="listingType"
                      value={formData.listingType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sale">For Sale</option>
                      <option value="rent">For Rent</option>
                      <option value="lease">For Lease</option>
                      <option value="pg">PG/Hostel</option>
                    </select>
                  </div>
                </div>

                {/* Availability and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Availability Status *
                    </label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                      <option value="under-agreement">Under Agreement</option>
                      <option value="hold">On Hold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Featured & Verification
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Feature this property</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="isVerified"
                          checked={formData.isVerified}
                          onChange={handleChange}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm">Mark as Verified</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Common Specifications */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Common Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Furnishing Status
                      </label>
                      <select
                        value={formData.commonSpecifications.furnishing}
                        onChange={(e) => handleNestedChange('commonSpecifications', 'furnishing', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="unfurnished">Unfurnished</option>
                        <option value="semi-furnished">Semi-Furnished</option>
                        <option value="fully-furnished">Fully Furnished</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Possession Status
                      </label>
                      <select
                        value={formData.commonSpecifications.possessionStatus}
                        onChange={(e) => handleNestedChange('commonSpecifications', 'possessionStatus', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="ready-to-move">Ready to Move</option>
                        <option value="under-construction">Under Construction</option>
                        <option value="resale">Resale</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age of Property (Years)
                      </label>
                      <input
                        type="number"
                        value={formData.commonSpecifications.ageOfProperty || 0}
                        onChange={(e) => handleNestedChange('commonSpecifications', 'ageOfProperty', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kitchen Type
                      </label>
                      <select
                        value={formData.commonSpecifications.kitchenType || 'regular'}
                        onChange={(e) => handleNestedChange('commonSpecifications', 'kitchenType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="regular">Regular</option>
                        <option value="modular">Modular</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="none">None</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Covered Parking
                      </label>
                      <input
                        type="number"
                        value={formData.commonSpecifications.parking?.covered || 0}
                        onChange={(e) => handleDeepNestedChange('commonSpecifications', 'parking', 'covered', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Open Parking
                      </label>
                      <input
                        type="number"
                        value={formData.commonSpecifications.parking?.open || 0}
                        onChange={(e) => handleDeepNestedChange('commonSpecifications', 'parking', 'open', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Building Details */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Building/Project Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Building/Project Name
                      </label>
                      <input
                        type="text"
                        value={formData.buildingDetails?.name || ''}
                        onChange={(e) => handleNestedChange('buildingDetails', 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Floors
                      </label>
                      <input
                        type="number"
                        value={formData.buildingDetails?.totalFloors || 0}
                        onChange={(e) => handleNestedChange('buildingDetails', 'totalFloors', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Units in Building
                      </label>
                      <input
                        type="number"
                        value={formData.buildingDetails?.totalUnits || 0}
                        onChange={(e) => handleNestedChange('buildingDetails', 'totalUnits', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year Built
                      </label>
                      <input
                        type="number"
                        value={formData.buildingDetails?.yearBuilt || 0}
                        onChange={(e) => handleNestedChange('buildingDetails', 'yearBuilt', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Preference */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Preferences
                  </label>
                  <div className="flex gap-4">
                    {['call', 'whatsapp', 'email', 'message'].map(pref => (
                      <label key={pref} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.contactPreference?.includes(pref)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...(formData.contactPreference || []), pref]
                              : (formData.contactPreference || []).filter(p => p !== pref);
                            setFormData(prev => ({ ...prev, contactPreference: updated }));
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm capitalize">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Google Maps Embed URL
                  </label>
                  <input
                    type="text"
                    name="mapUrl"
                    value={formData.mapUrl || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Paste Google Maps embed link here"
                  />
                </div>

                {/* Nearby Places */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Nearby Places & Amenities</h3>
                    <button
                      type="button"
                      onClick={addLocationNearby}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Place
                    </button>
                  </div>

                  {formData.locationNearby?.map((location, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Nearby Place {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeLocationNearby(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Place name"
                          value={location.name}
                          onChange={(e) => handleArrayChange('locationNearby', index, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Distance (e.g., 500m, 1.2km)"
                          value={location.distance}
                          onChange={(e) => handleArrayChange('locationNearby', index, 'distance', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <select
                          value={location.type}
                          onChange={(e) => handleArrayChange('locationNearby', index, 'type', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="transport">Transport (Metro/Bus/Railway)</option>
                          <option value="education">Education (School/College)</option>
                          <option value="healthcare">Healthcare (Hospital/Clinic)</option>
                          <option value="shopping">Shopping (Mall/Market)</option>
                          <option value="entertainment">Entertainment (Cinema/Park)</option>
                          <option value="banking">Banking (Bank/ATM)</option>
                          <option value="religious">Religious (Temple/Mosque/Church)</option>
                          <option value="restaurant">Restaurant/Cafe</option>
                          <option value="other">Other</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Icon (optional)"
                          value={location.icon || ''}
                          onChange={(e) => handleArrayChange('locationNearby', index, 'icon', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}

                  {(!formData.locationNearby || formData.locationNearby.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No nearby places added. Click "Add Place" to get started.</p>
                  )}
                </div>
              </div>
            )}

            {/* Units & Pricing Tab */}
            {activeTab === 'units' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Unit Types & Pricing</h3>
                  <button
                    type="button"
                    onClick={addUnitType}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Unit Type
                  </button>
                </div>

                {formData.unitTypes?.map((unit, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-lg">Unit Type {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeUnitType(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Type
                        </label>
                        <select
                          value={unit.type}
                          onChange={(e) => handleUnitChange(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="1BHK">1 BHK</option>
                          <option value="2BHK">2 BHK</option>
                          <option value="3BHK">3 BHK</option>
                          <option value="4BHK">4 BHK</option>
                          <option value="5BHK">5 BHK</option>
                          <option value="Studio">Studio</option>
                          <option value="Penthouse">Penthouse</option>
                          <option value="Duplex">Duplex</option>
                          <option value="Plot">Plot/Land</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          value={unit.price?.amount || 0}
                          onChange={(e) => handleUnitChange(index, 'price.amount', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price Per
                        </label>
                        <select
                          value={unit.price?.perUnit || 'total'}
                          onChange={(e) => handleUnitChange(index, 'price.perUnit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="total">Total Price</option>
                          <option value="sqft">Per Sq Ft</option>
                          <option value="sqm">Per Sq M</option>
                          <option value="month">Per Month</option>
                          <option value="perSqYard">Per Sq Yard</option>
                          <option value="perGround">Per Ground</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Carpet Area (sq ft)
                        </label>
                        <input
                          type="number"
                          value={unit.carpetArea || 0}
                          onChange={(e) => handleUnitChange(index, 'carpetArea', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Built-up Area (sq ft)
                        </label>
                        <input
                          type="number"
                          value={unit.builtUpArea || 0}
                          onChange={(e) => handleUnitChange(index, 'builtUpArea', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Super Built-up Area (sq ft)
                        </label>
                        <input
                          type="number"
                          value={unit.superBuiltUpArea || 0}
                          onChange={(e) => handleUnitChange(index, 'superBuiltUpArea', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Floor Number
                        </label>
                        <input
                          type="number"
                          value={unit.floorNumber || 1}
                          onChange={(e) => handleUnitChange(index, 'floorNumber', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Floors in Building
                        </label>
                        <input
                          type="number"
                          value={unit.floors || 1}
                          onChange={(e) => handleUnitChange(index, 'floors', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Units
                        </label>
                        <input
                          type="number"
                          value={unit.totalUnits || 1}
                          onChange={(e) => handleUnitChange(index, 'totalUnits', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Available Units
                        </label>
                        <input
                          type="number"
                          value={unit.availableUnits || 1}
                          onChange={(e) => handleUnitChange(index, 'availableUnits', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Availability
                        </label>
                        <select
                          value={unit.availability || 'available'}
                          onChange={(e) => handleUnitChange(index, 'availability', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="available">Available</option>
                          <option value="sold">Sold</option>
                          <option value="limited">Limited</option>
                          <option value="coming-soon">Coming Soon</option>
                          <option value="booked">Booked</option>
                          <option value="reserved">Reserved</option>
                        </select>
                      </div>
                    </div>

                    {/* Plot Specific Details */}
                    {formData.propertyType === 'Plot' && unit.type === 'Plot' && (
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium mb-3">Plot Details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Length (ft)</label>
                            <input
                              type="number"
                              value={unit.plotDetails?.dimensions?.length || 0}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.dimensions.length', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Breadth (ft)</label>
                            <input
                              type="number"
                              value={unit.plotDetails?.dimensions?.breadth || 0}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.dimensions.breadth', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Frontage (ft)</label>
                            <input
                              type="number"
                              value={unit.plotDetails?.dimensions?.frontage || 0}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.dimensions.frontage', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Area (Sq Ft)</label>
                            <input
                              type="number"
                              value={unit.plotDetails?.area?.sqft || 0}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.area.sqft', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Area (Sq Yards)</label>
                            <input
                              type="number"
                              value={unit.plotDetails?.area?.sqYards || 0}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.area.sqYards', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Area (Grounds)</label>
                            <input
                              type="number"
                              value={unit.plotDetails?.area?.grounds || 0}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.area.grounds', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Plot Shape</label>
                            <select
                              value={unit.plotDetails?.shape || 'rectangle'}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.shape', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="square">Square</option>
                              <option value="rectangle">Rectangle</option>
                              <option value="corner">Corner Plot</option>
                              <option value="irregular">Irregular</option>
                              <option value="triangular">Triangular</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Facing Direction</label>
                            <select
                              value={unit.plotDetails?.facing || ''}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.facing', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="">Select Direction</option>
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
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Road Width (ft)</label>
                            <input
                              type="number"
                              value={unit.plotDetails?.roadWidth || 0}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.roadWidth', parseFloat(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Land Use</label>
                            <select
                              value={unit.plotDetails?.landUse || 'residential'}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.landUse', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="residential">Residential</option>
                              <option value="commercial">Commercial</option>
                              <option value="agricultural">Agricultural</option>
                              <option value="industrial">Industrial</option>
                              <option value="mixed-use">Mixed Use</option>
                              <option value="institutional">Institutional</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Development Status</label>
                            <select
                              value={unit.plotDetails?.developmentStatus || 'developed'}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.developmentStatus', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="developed">Developed</option>
                              <option value="semi-developed">Semi-Developed</option>
                              <option value="undeveloped">Undeveloped</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={unit.plotDetails?.isCornerPlot || false}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.isCornerPlot', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Corner Plot</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={unit.plotDetails?.boundaryWalls || false}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.boundaryWalls', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Boundary Walls</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={unit.plotDetails?.fencing || false}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.fencing', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Fencing</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={unit.plotDetails?.gate || false}
                              onChange={(e) => handleUnitChange(index, 'plotDetails.gate', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">Gate</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {(!formData.unitTypes || formData.unitTypes.length === 0) && (
                  <p className="text-gray-500 text-center py-8">No unit types added. Click "Add Unit Type" to add pricing and unit details.</p>
                )}
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Unit Features</h3>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </button>
                  </div>

                  {formData.unitFeatures?.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select a feature</option>
                        {availableFeatures.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                        <option value="other">Other (type manually)</option>
                      </select>
                      {feature === 'other' && (
                        <input
                          type="text"
                          placeholder="Enter feature name"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {(!formData.unitFeatures || formData.unitFeatures.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No features added yet. Add features to highlight your property.</p>
                  )}
                </div>

                {/* Building Amenities */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Building/Society Amenities</h3>
                    <button
                      type="button"
                      onClick={addBuildingAmenity}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Amenity
                    </button>
                  </div>

                  {formData.buildingDetails?.amenities?.map((amenity, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={amenity}
                        onChange={(e) => handleBuildingAmenityChange(index, e.target.value)}
                        placeholder="e.g., Swimming Pool, Gym, Club House"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeBuildingAmenity(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Property Images</h3>
                    <button
                      type="button"
                      onClick={addImage}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Image
                    </button>
                  </div>

                  {formData.images?.map((image, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Image {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={image.url}
                          onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Caption (optional)"
                          value={image.caption || ''}
                          onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        {image.url && (
                          <div className="mt-2">
                            <img src={image.url} alt={`Preview ${index}`} className="h-32 w-auto object-cover rounded" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {(!formData.images || formData.images.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No images added. Add images to showcase your property.</p>
                  )}
                </div>
              </div>
            )}

            {/* Owner Details Tab */}
            {activeTab === 'owner' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      value={formData.ownerDetails?.name || ''}
                      onChange={(e) => handleNestedChange('ownerDetails', 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.ownerDetails?.phoneNumber || ''}
                      onChange={(e) => handleNestedChange('ownerDetails', 'phoneNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.ownerDetails?.email || ''}
                      onChange={(e) => handleNestedChange('ownerDetails', 'email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason for Selling/Renting
                    </label>
                    <textarea
                      value={formData.ownerDetails?.reasonForSelling || ''}
                      onChange={(e) => handleNestedChange('ownerDetails', 'reasonForSelling', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., Moving to another city, Upgrading to a bigger home, etc."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Legal Info Tab */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.legalDetails?.reraRegistered || false}
                        onChange={(e) => handleNestedChange('legalDetails', 'reraRegistered', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-semibold text-gray-700">RERA Registered</span>
                    </label>
                    {formData.legalDetails?.reraRegistered && (
                      <input
                        type="text"
                        placeholder="RERA Number"
                        value={formData.legalDetails?.reraNumber || ''}
                        onChange={(e) => handleNestedChange('legalDetails', 'reraNumber', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
                      />
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.legalDetails?.clearTitle || false}
                        onChange={(e) => handleNestedChange('legalDetails', 'clearTitle', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-semibold text-gray-700">Clear Title</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Khata Status
                    </label>
                    <select
                      value={formData.legalDetails?.khataStatus || 'Not Applicable'}
                      onChange={(e) => handleNestedChange('legalDetails', 'khataStatus', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="A-Khata">A-Khata</option>
                      <option value="B-Khata">B-Khata</option>
                      <option value="E-Khata">E-Khata</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ownership Type
                    </label>
                    <select
                      value={formData.legalDetails?.ownershipType || 'freehold'}
                      onChange={(e) => handleNestedChange('legalDetails', 'ownershipType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="freehold">Freehold</option>
                      <option value="leasehold">Leasehold</option>
                      <option value="cooperative">Cooperative Society</option>
                      <option value="power-of-attorney">Power of Attorney</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Encumbrance Certificate
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.legalDetails?.encumbranceCertificate || false}
                          onChange={(e) => handleNestedChange('legalDetails', 'encumbranceCertificate', e.target.checked)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Available</span>
                      </label>
                      {formData.legalDetails?.encumbranceCertificate && (
                        <input
                          type="number"
                          placeholder="Years"
                          value={formData.legalDetails?.encumbranceYears || 0}
                          onChange={(e) => handleNestedChange('legalDetails', 'encumbranceYears', parseInt(e.target.value))}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.legalDetails?.motherDeedAvailable || false}
                        onChange={(e) => handleNestedChange('legalDetails', 'motherDeedAvailable', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-semibold text-gray-700">Mother Deed Available</span>
                    </label>
                  </div>
                </div>

                {/* Sanction Details */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Sanction Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Sanctioning Authority</label>
                      <input
                        type="text"
                        value={formData.legalDetails?.sanctioningAuthority || ''}
                        onChange={(e) => handleNestedChange('legalDetails', 'sanctioningAuthority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Sanction Number</label>
                      <input
                        type="text"
                        value={formData.legalDetails?.sanctionNumber || ''}
                        onChange={(e) => handleNestedChange('legalDetails', 'sanctionNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Sanction Date</label>
                      <input
                        type="date"
                        value={formData.legalDetails?.sanctionDate ? new Date(formData.legalDetails.sanctionDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleNestedChange('legalDetails', 'sanctionDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Certificates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={formData.legalDetails?.occupancyCertificate || false}
                          onChange={(e) => handleNestedChange('legalDetails', 'occupancyCertificate', e.target.checked)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Occupancy Certificate</span>
                      </label>
                      {formData.legalDetails?.occupancyCertificate && (
                        <>
                          <input
                            type="text"
                            placeholder="Certificate Number"
                            value={formData.legalDetails?.occupancyCertificateNumber || ''}
                            onChange={(e) => handleNestedChange('legalDetails', 'occupancyCertificateNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2"
                          />
                          <input
                            type="date"
                            placeholder="Date"
                            value={formData.legalDetails?.occupancyCertificateDate ? new Date(formData.legalDetails.occupancyCertificateDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleNestedChange('legalDetails', 'occupancyCertificateDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2"
                          />
                        </>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={formData.legalDetails?.commencementCertificate || false}
                          onChange={(e) => handleNestedChange('legalDetails', 'commencementCertificate', e.target.checked)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Commencement Certificate</span>
                      </label>
                      {formData.legalDetails?.commencementCertificate && (
                        <>
                          <input
                            type="text"
                            placeholder="Certificate Number"
                            value={formData.legalDetails?.commencementCertificateNumber || ''}
                            onChange={(e) => handleNestedChange('legalDetails', 'commencementCertificateNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2"
                          />
                          <input
                            type="date"
                            placeholder="Date"
                            value={formData.legalDetails?.commencementCertificateDate ? new Date(formData.legalDetails.commencementCertificateDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleNestedChange('legalDetails', 'commencementCertificateDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bank Approvals */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Bank Approvals</h4>
                    <button
                      type="button"
                      onClick={addBankApproval}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Bank
                    </button>
                  </div>
                  {formData.legalDetails?.bankApprovals?.map((bank, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Bank Name"
                          value={bank.bankName}
                          onChange={(e) => handleBankApprovalChange(index, 'bankName', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={bank.approved}
                            onChange={(e) => handleBankApprovalChange(index, 'approved', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Approved</span>
                        </label>
                        <input
                          type="date"
                          placeholder="Approval Date"
                          value={bank.approvalDate ? new Date(bank.approvalDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleBankApprovalChange(index, 'approvalDate', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="Reference Number"
                          value={bank.referenceNumber || ''}
                          onChange={(e) => handleBankApprovalChange(index, 'referenceNumber', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeBankApproval(index)}
                          className="mt-2 text-red-600 text-sm hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legal Status Summary */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Legal Status Summary
                  </label>
                  <textarea
                    value={formData.legalDetails?.legalStatusSummary || ''}
                    onChange={(e) => handleNestedChange('legalDetails', 'legalStatusSummary', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Provide any additional legal information or disclosures"
                  />
                </div>

                {/* Legal Verification */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Legal Verification Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={formData.legalDetails?.legalVerified || false}
                          onChange={(e) => handleNestedChange('legalDetails', 'legalVerified', e.target.checked)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Legally Verified</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Legal Verifier Name</label>
                      <input
                        type="text"
                        value={formData.legalDetails?.legalVerifier || ''}
                        onChange={(e) => handleNestedChange('legalDetails', 'legalVerifier', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Name of verifier or firm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Legal Verification Date</label>
                      <input
                        type="date"
                        value={formData.legalDetails?.legalVerificationDate ? new Date(formData.legalDetails.legalVerificationDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleNestedChange('legalDetails', 'legalVerificationDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Document upload functionality will be available soon. For now, please add document references or links in the legal status summary.
                  </p>
                </div>

                {/* Viewing Schedule */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Viewing Schedule</h3>
                    <button
                      type="button"
                      onClick={addViewingSlot}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Viewing Slot
                    </button>
                  </div>

                  {formData.viewingSchedule?.map((slot, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Viewing Slot {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeViewingSlot(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <input
                          type="date"
                          value={slot.date ? new Date(slot.date).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleViewingSlotChange(index, 'date', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="time"
                          value={slot.startTime || ''}
                          onChange={(e) => handleViewingSlotChange(index, 'startTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="time"
                          value={slot.endTime || ''}
                          onChange={(e) => handleViewingSlotChange(index, 'endTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="number"
                          placeholder="Slots Available"
                          value={slot.slotsAvailable || 1}
                          onChange={(e) => handleViewingSlotChange(index, 'slotsAvailable', parseInt(e.target.value))}
                          className="px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}

                  {(!formData.viewingSchedule || formData.viewingSchedule.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No viewing slots scheduled. Add slots for potential buyers to schedule visits.</p>
                  )}
                </div>

                {/* Document Checklist */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Required Documents Checklist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.legalDetails?.motherDeedAvailable || false}
                        onChange={(e) => handleNestedChange('legalDetails', 'motherDeedAvailable', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Mother Deed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.legalDetails?.conversionCertificate || false}
                        onChange={(e) => handleNestedChange('legalDetails', 'conversionCertificate', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Conversion Certificate</span>
                    </div>
                    {formData.legalDetails?.conversionCertificate && (
                      <div className="md:col-span-2 ml-6">
                        <input
                          type="text"
                          placeholder="Conversion Type"
                          value={formData.legalDetails?.conversionType || ''}
                          onChange={(e) => handleNestedChange('legalDetails', 'conversionType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.legalDetails?.encumbranceCertificate || false}
                        onChange={(e) => handleNestedChange('legalDetails', 'encumbranceCertificate', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Encumbrance Certificate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.legalDetails?.occupancyCertificate || false}
                        onChange={(e) => handleNestedChange('legalDetails', 'occupancyCertificate', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Occupancy Certificate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.legalDetails?.commencementCertificate || false}
                        onChange={(e) => handleNestedChange('legalDetails', 'commencementCertificate', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Commencement Certificate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.legalDetails?.clearTitle || false}
                        onChange={(e) => handleNestedChange('legalDetails', 'clearTitle', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">Clear Title Document</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.legalDetails?.reraRegistered || false}
                        onChange={(e) => handleNestedChange('legalDetails', 'reraRegistered', e.target.checked)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">RERA Registration</span>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Age (Years)
                      </label>
                      <input
                        type="number"
                        value={formData.commonSpecifications?.ageOfProperty || 0}
                        onChange={(e) => handleNestedChange('commonSpecifications', 'ageOfProperty', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Views
                      </label>
                      <input
                        type="number"
                        value={formData.viewCount || 0}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Inquiries
                      </label>
                      <input
                        type="number"
                        value={formData.inquiryCount || 0}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="displayOrder"
                        value={formData.displayOrder || 0}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save All Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/my-properties')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>

            {/* Auto-save indicator (optional) */}
            {saving && (
              <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slideUp">
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EditProperty;