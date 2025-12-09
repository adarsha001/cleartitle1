// PropertyUnitDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  MessageCircle, 
  Share2, 
  Star,
  CheckCircle,
  Building,
  Home,
  Bed,
  Bath,
  Car,
  Maximize,
  Ruler,
  Layers,
  Clock,
  Shield,
  FileCheck,
  BadgeCheck,
  Lock,
  Verified,
  Users,
  DollarSign,
  TrendingUp,
  Key,
  Camera,
  Wifi,
  Tv,
  Droplets,
  Wind,
  Utensils,
  Dumbbell,
  TreePine,
  Watch,
  Award,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Building2,
  ClipboardCheck,
  FileText,
  LandPlot // Added missing import
} from "lucide-react";
import Footer from "../pages/Footer";

export default function PropertyUnitDetail() {
  const { id } = useParams();
  const [propertyUnit, setPropertyUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch property unit details
  useEffect(() => {
    const fetchPropertyUnit = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching property unit with ID:", id);
        const response = await propertyUnitAPI.getPropertyUnit(id);
        
        console.log("API Response:", response);
        
        if (response.data.success) {
          console.log("Property unit data:", response.data.data);
          setPropertyUnit(response.data.data);
        } else {
          console.error("Failed to fetch property unit:", response.data.message);
          setError(response.data.message || "Failed to fetch property details");
        }
      } catch (error) {
        console.error("Error fetching property unit:", error);
        console.error("Error response:", error.response);
        
        // Handle different error scenarios
        if (error.response) {
          switch (error.response.status) {
            case 400:
              setError("Invalid property ID format");
              break;
            case 404:
              setError("Property not found or not available");
              break;
            case 401:
              setError("Unauthorized access");
              break;
            case 403:
              setError("You don't have permission to view this property");
              break;
            case 500:
              setError("Server error. Please try again later");
              break;
            default:
              setError(error.response.data?.message || "Failed to load property details");
          }
        } else if (error.request) {
          setError("Network error. Please check your connection");
        } else {
          setError(error.message || "An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPropertyUnit();
    } else {
      setError("Invalid property ID");
      setLoading(false);
    }
  }, [id]);

  // Add null check functions
  const safeImages = propertyUnit?.images || [];
  const safeSpecifications = propertyUnit?.specifications || {};
  const safeBuildingDetails = propertyUnit?.buildingDetails || {};
  const safeUnitFeatures = propertyUnit?.unitFeatures || [];
  const safeRentalDetails = propertyUnit?.rentalDetails || {};
  const safeLegalDetails = propertyUnit?.legalDetails || {};
  const safeViewingSchedule = propertyUnit?.viewingSchedule || {};
  const safeContactPreference = propertyUnit?.contactPreference || {};
  const safeParentProperty = propertyUnit?.parentProperty || {};

  // WhatsApp share function
  const shareOnWhatsApp = () => {
    if (!propertyUnit) return;
    
    const { title, address, city, price } = propertyUnit;
    const propertyUrl = window.location.href;
    
    const message = `Check out this premium property unit:\n\n🏢 ${title}\n📍 ${address}, ${city}\n💰 ${formatPrice(price)}\n\nView full details: ${propertyUrl}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setShowShareOptions(false);
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
      setShowShareOptions(false);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Property link copied to clipboard!');
      setShowShareOptions(false);
    }
  };

  // Format price with null checks
  const formatPrice = (price) => {
    if (!price) return "Price on request";
    
    try {
      // If price is an object with amount and currency
      if (typeof price === 'object' && price !== null) {
        const amount = price.amount || price.value || 0;
        const currency = price.currency || '₹';
        const formattedAmount = amount.toLocaleString('en-IN');
        
        return `${currency}${formattedAmount}`;
      }
      
      // If price is a number
      if (typeof price === 'number') {
        return `₹${price.toLocaleString('en-IN')}`;
      }
      
      // If price is a string
      if (typeof price === 'string') {
        return price;
      }
    } catch (err) {
      console.error("Error formatting price:", err);
    }
    
    return "Price on request";
  };

  // Calculate price per sqft with null checks


  // Get property type icon
  const getPropertyTypeIcon = (type) => {
    const icons = {
      'Apartment': <Building className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Villa': <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Commercial': <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Office': <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Shop': <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Warehouse': <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Industrial': <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Hotel': <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Farmhouse': <TreePine className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Plot': <LandPlot className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Commercial Space': <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Office Space': <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
    };
    
    return icons[type] || <Building className="w-4 h-4 sm:w-5 sm:h-5" />;
  };

  // Get listing type color
  const getListingTypeColor = (type) => {
    const colors = {
      'Sale': 'from-green-600 to-green-700',
      'Rent': 'from-blue-600 to-blue-700',
      'Lease': 'from-purple-600 to-purple-700'
    };
    
    return colors[type] || 'from-gray-600 to-gray-700';
  };

  // Get availability color
  const getAvailabilityColor = (status) => {
    const colors = {
      'available': 'from-green-500 to-green-600',
      'sold': 'from-red-500 to-red-600',
      'rented': 'from-blue-500 to-blue-600',
      'under-negotiation': 'from-yellow-500 to-yellow-600'
    };
    
    return colors[status] || 'from-gray-500 to-gray-600';
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  // Get Google Maps embed URL
  const getGoogleMapsEmbedUrl = () => {
    if (!propertyUnit) return null;
    
    try {
      const { coordinates, mapUrl, address, city } = propertyUnit;
      
      if (coordinates?.latitude && coordinates?.longitude) {
        return `https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15&output=embed`;
      }
      
      if (mapUrl) {
        const coordMatch = mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
        }
        
        if (mapUrl.includes('maps.google.com') || mapUrl.includes('goo.gl/maps')) {
          return mapUrl.replace('/?', '/embed?');
        }
      }
      
      if (address && city) {
        const query = encodeURIComponent(`${address}, ${city}`);
        return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
      }
      
      if (city) {
        const query = encodeURIComponent(city);
        return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
      }
    } catch (err) {
      console.error("Error generating Google Maps URL:", err);
    }
    
    return null;
  };

  // Get Google Maps view URL
  const getGoogleMapsViewUrl = () => {
    if (!propertyUnit) return "#";
    
    try {
      const { mapUrl, coordinates, address, city } = propertyUnit;
      
      if (mapUrl) return mapUrl;
      
      if (coordinates?.latitude && coordinates?.longitude) {
        return `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
      }
      
      if (address && city) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', ' + city)}`;
      }
      
      if (city) {
        return `https://www.google.com/maps/place/${encodeURIComponent(city)}`;
      }
    } catch (err) {
      console.error("Error generating Google Maps view URL:", err);
    }
    
    return "#";
  };

  // Feature icons mapping
// Feature icons mapping - UPDATED with unique icons
const featureIcons = {
  // Basic Amenities
  "24/7 Water Supply": <Droplets className="w-5 h-5" />,
  "Power Backup": <Watch className="w-5 h-5" />,
  "Lift/Elevator": <Layers className="w-5 h-5" />,
  "Parking": <Car className="w-5 h-5" />,
  "Security": <Shield className="w-5 h-5" />,
  "CCTV Surveillance": <Camera className="w-5 h-5" />,
  "WiFi/Internet": <Wifi className="w-5 h-5" />,
  
  // Unit Features
  "Modular Kitchen": <Utensils className="w-5 h-5" />,
  "Built-in Wardrobes": <Building className="w-5 h-5" />,
  "Air Conditioning": <Wind className="w-5 h-5" />,
  "TV": <Tv className="w-5 h-5" />,
  "Geyser": <Droplets className="w-5 h-5" />,
  "False Ceiling": <Layers className="w-5 h-5" />,
  "Wooden Flooring": <Home className="w-5 h-5" />,
  "Marble Flooring": <Award className="w-5 h-5" />,
  "Vitrified Tiles": <Home className="w-5 h-5" />,
  "Piped Gas": <Wind className="w-5 h-5" />,
  "Intercom": <Phone className="w-5 h-5" />,
  
  // Building Amenities
  "Swimming Pool": <Droplets className="w-5 h-5" />,
  "Gym/Fitness Center": <Dumbbell className="w-5 h-5" />,
  "Club House": <Users className="w-5 h-5" />,
  "Children's Play Area": <Home className="w-5 h-5" />,
  "Garden/Lawn": <TreePine className="w-5 h-5" />,
  "Jogging Track": <Navigation className="w-5 h-5" />,
  "Tennis Court": <Award className="w-5 h-5" />,
  "Basketball Court": <Award className="w-5 h-5" />,
  "Badminton Court": <Award className="w-5 h-5" />,
  "Squash Court": <Award className="w-5 h-5" />,
  "Yoga/Meditation Area": <Users className="w-5 h-5" />,
  "Party Hall": <Users className="w-5 h-5" />,
  "Guest Rooms": <Building2 className="w-5 h-5" />,
  "Library": <FileText className="w-5 h-5" />,
  "Indoor Games": <Home className="w-5 h-5" />,
  
  // Kitchen & Bathroom
  "Chimney": <Wind className="w-5 h-5" />,
  "Water Purifier": <Droplets className="w-5 h-5" />,
  "Microwave": <Utensils className="w-5 h-5" />,
  "Refrigerator": <Home className="w-5 h-5" />,
  "Dishwasher": <Utensils className="w-5 h-5" />,
  "Washing Machine": <Home className="w-5 h-5" />,
  "Jacuzzi": <Droplets className="w-5 h-5" />,
  "Shower Cubicle": <Droplets className="w-5 h-5" />,
  
  // Safety & Security
  "Fire Safety": <Shield className="w-5 h-5" />,
  "RERA Registered": <Award className="w-5 h-5" />,
  "Clear Title": <FileCheck className="w-5 h-5" />,
  "Legal Documentation": <FileText className="w-5 h-5" />,
  "Security Guard": <Shield className="w-5 h-5" />,
  "Video Door Phone": <Camera className="w-5 h-5" />,
  "Burglar Alarm": <Shield className="w-5 h-5" />,
  "Fire Extinguisher": <Shield className="w-5 h-5" />,
  "Earthquake Resistant": <Shield className="w-5 h-5" />,
  
  // Additional Features
  "Main Road Facing": <Navigation className="w-5 h-5" />,
  "Corner Location": <MapPin className="w-5 h-5" />,
  "Natural Light/Ventilation": <Wind className="w-5 h-5" />,
  "Park Facing": <TreePine className="w-5 h-5" />,
  "Lake/River View": <Droplets className="w-5 h-5" />,
  "Mountain View": <TreePine className="w-5 h-5" />,
  "Sea View": <Droplets className="w-5 h-5" />,
  "Pet Friendly": <Home className="w-5 h-5" />,
  "Wheelchair Access": <Home className="w-5 h-5" />,
  "Servant Room": <Building2 className="w-5 h-5" />,
  "Pooja Room": <Home className="w-5 h-5" />,
  "Study Room": <FileText className="w-5 h-5" />,
  "Store Room": <Building2 className="w-5 h-5" />,
  
  // Utilities
  "Solar Water Heating": <Wind className="w-5 h-5" />,
  "Rain Water Harvesting": <Droplets className="w-5 h-5" />,
  "Sewage Treatment Plant": <Droplets className="w-5 h-5" />,
  "Water Storage": <Droplets className="w-5 h-5" />,
  
  // Infrastructure
  "Wide Roads": <Navigation className="w-5 h-5" />,
  "Street Lights": <Watch className="w-5 h-5" />,
  "Drainage System": <Droplets className="w-5 h-5" />,
  "Waste Management": <Home className="w-5 h-5" />,
  
  // Commercial Features
  "Basement Parking": <Car className="w-5 h-5" />,
  "Conference Room": <Users className="w-5 h-5" />,
  "Pantry": <Utensils className="w-5 h-5" />,
  "Reception Area": <Building2 className="w-5 h-5" />,
  "Modular Office": <Building className="w-5 h-5" />,
  "Cafeteria": <Utensils className="w-5 h-5" />,
};

// Fallback icon mapping for unknown features
const getFeatureIcon = (feature) => {
  const featureLower = feature.toLowerCase();
  
  if (featureLower.includes('water') || featureLower.includes('pool') || featureLower.includes('rain')) {
    return <Droplets className="w-5 h-5" />;
  }
  if (featureLower.includes('security') || featureLower.includes('safety') || featureLower.includes('guard')) {
    return <Shield className="w-5 h-5" />;
  }
  if (featureLower.includes('gym') || featureLower.includes('fitness') || featureLower.includes('sports')) {
    return <Dumbbell className="w-5 h-5" />;
  }
  if (featureLower.includes('park') || featureLower.includes('garden') || featureLower.includes('tree')) {
    return <TreePine className="w-5 h-5" />;
  }
  if (featureLower.includes('kitchen') || featureLower.includes('food') || featureLower.includes('cooking')) {
    return <Utensils className="w-5 h-5" />;
  }
  if (featureLower.includes('document') || featureLower.includes('legal') || featureLower.includes('paper')) {
    return <FileText className="w-5 h-5" />;
  }
  if (featureLower.includes('certificate') || featureLower.includes('award') || featureLower.includes('registered')) {
    return <Award className="w-5 h-5" />;
  }
  if (featureLower.includes('camera') || featureLower.includes('cctv') || featureLower.includes('surveillance')) {
    return <Camera className="w-5 h-5" />;
  }
  if (featureLower.includes('wifi') || featureLower.includes('internet') || featureLower.includes('network')) {
    return <Wifi className="w-5 h-5" />;
  }
  if (featureLower.includes('phone') || featureLower.includes('call') || featureLower.includes('communication')) {
    return <Phone className="w-5 h-5" />;
  }
  if (featureLower.includes('navigation') || featureLower.includes('direction') || featureLower.includes('road')) {
    return <Navigation className="w-5 h-5" />;
  }
  if (featureLower.includes('building') || featureLower.includes('structure') || featureLower.includes('construction')) {
    return <Building className="w-5 h-5" />;
  }
  if (featureLower.includes('people') || featureLower.includes('users') || featureLower.includes('community')) {
    return <Users className="w-5 h-5" />;
  }
  if (featureLower.includes('clock') || featureLower.includes('time') || featureLower.includes('schedule')) {
    return <Watch className="w-5 h-5" />;
  }
  if (featureLower.includes('air') || featureLower.includes('wind') || featureLower.includes('ventilation')) {
    return <Wind className="w-5 h-5" />;
  }
  if (featureLower.includes('layer') || featureLower.includes('floor') || featureLower.includes('level')) {
    return <Layers className="w-5 h-5" />;
  }
  if (featureLower.includes('tv') || featureLower.includes('television') || featureLower.includes('entertainment')) {
    return <Tv className="w-5 h-5" />;
  }
  if (featureLower.includes('car') || featureLower.includes('vehicle') || featureLower.includes('transport')) {
    return <Car className="w-5 h-5" />;
  }
  if (featureLower.includes('map') || featureLower.includes('location') || featureLower.includes('address')) {
    return <MapPin className="w-5 h-5" />;
  }
  
  // Default icon
  return <Home className="w-5 h-5" />;
};

  const embedUrl = getGoogleMapsEmbedUrl();
  const viewUrl = getGoogleMapsViewUrl();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 text-base sm:text-lg font-medium tracking-wide">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !propertyUnit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-6 sm:p-8 md:p-12 text-center max-w-md w-full border border-blue-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Home className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {error ? "Error Loading Property" : "Property Not Found"}
          </h2>
          <p className="text-gray-600 mb-6 sm:mb-8 font-medium leading-relaxed text-sm sm:text-base">
            {error || "This property unit doesn't exist or is not available for viewing."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/property-units')}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base"
            >
              Browse Available Properties
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg sm:rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-bold tracking-wide text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    unitNumber,
    city,
    address,
    coordinates,
    mapUrl,
    price,
    maintenanceCharges,
    securityDeposit,
    propertyType,
    availability,
    isFeatured,
    isVerified,
    listingType,
    virtualTour,
    floorPlan,
    viewCount,
    favoriteCount,
    slug,
    createdAt,
    updatedAt,
    createdBy,
    fullAddress
  } = propertyUnit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Verification Banner */}
      {isVerified && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 sm:py-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
              <span className="font-bold text-sm sm:text-base">
                100% VERIFIED PROPERTY
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-sm font-medium">
                All documents verified and legal
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => navigate('/property-units')}
              className="flex items-center gap-2 sm:gap-3 text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold tracking-wide text-sm sm:text-base">
                Back to Properties
              </span>
            </button>

            {/* Share Button */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Share
                </button>

                {/* Share Options Dropdown */}
                {showShareOptions && (
                  <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl border border-blue-200 z-50 overflow-hidden">
                    <button
                      onClick={shareOnWhatsApp}
                      className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-6 sm:py-4 text-left hover:bg-green-50 transition-colors border-b border-blue-100"
                    >
                      <span className="text-2xl">💚</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">
                          Share on WhatsApp
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                          Share with friends & family
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-6 sm:py-4 text-left hover:bg-blue-50 transition-colors"
                    >
                      <span className="text-2xl">🔗</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">
                          Copy Property Link
                        </p>
                        <p className="text-xs text-gray-600 font-medium">
                          Copy property URL
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

     <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
<div className="flex-1">
  <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
    {isFeatured && (
      <span className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg">
        <Star className="w-3 h-3 sm:w-4 sm:h-4" />
        Featured
      </span>
    )}
    
    {isVerified && (
      <span className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg">
        <Verified className="w-3 h-3 sm:w-4 sm:h-4" />
        Verified
      </span>
    )}
    
<span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg flex items-center gap-1 sm:gap-2">
  {listingType === 'Sale' ? '🏷️' : '📋'}
  {listingType}
</span>

<span className={`bg-gradient-to-r from-amber-700 to-yellow-100 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg`}>
  {availability === 'available' ? '🌟 Available' : 
   availability === 'sold' ? '🏆 Sold' : 
   availability === 'rented' ? '🔑 Rented' : 
   '🤝 Under Negotiation'}
</span>
    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg flex items-center gap-1 sm:gap-2">
      {getPropertyTypeIcon(propertyType)}
      {propertyType}
    </span>
  </div>
  
  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
    {title || "Untitled Property"}
    {unitNumber && (
      <span className="text-indigo-600 ml-2 text-lg sm:text-xl">#{unitNumber}</span>
    )}
  </h1>
  
  <div className="flex items-center gap-2 sm:gap-3 text-indigo-600 mb-4 sm:mb-6">
    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
    <span className="text-base sm:text-lg font-bold tracking-wide">
      {fullAddress || `${address || ''}${address && city ? ', ' : ''}${city || ''}` || "Location not specified"}
    </span>
  </div>

  <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6">
    {/* Unit Specifications */}
    {safeSpecifications.bedrooms > 0 && (
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border border-indigo-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-indigo-900">
            {safeSpecifications.bedrooms}
          </p>
          <p className="text-xs sm:text-sm text-indigo-700 font-medium">
            Bedrooms
          </p>
        </div>
      </div>
    )}

    {safeSpecifications.bathrooms > 0 && (
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg sm:rounded-xl border border-teal-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Bath className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-teal-900">
            {safeSpecifications.bathrooms}
          </p>
          <p className="text-xs sm:text-sm text-teal-700 font-medium">
            Bathrooms
          </p>
        </div>
      </div>
    )}

    {safeSpecifications.carpetArea > 0 && (
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Maximize className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-amber-900">
            {safeSpecifications.carpetArea.toLocaleString()} sq.ft.
          </p>
          <p className="text-xs sm:text-sm text-amber-700 font-medium">
            Carpet Area
          </p>
        </div>
      </div>
    )}

    {safeSpecifications.floorNumber > 0 && (
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg sm:rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-900">
            {safeSpecifications.floorNumber}
          </p>
          <p className="text-xs sm:text-sm text-emerald-700 font-medium">
            Floor
          </p>
        </div>
      </div>
    )}
  </div>
</div>
  <div className="mt-4 sm:mt-0 lg:text-right">
    <div className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
      {formatPrice(price)}
    </div>
    
    {maintenanceCharges > 0 && (
      <p className="text-sm text-gray-600 mb-1">
        Maintenance: ₹{maintenanceCharges.toLocaleString()}/month
      </p>
    )}
    
    {securityDeposit > 0 && (
      <p className="text-sm text-gray-600">
        Security Deposit: ₹{securityDeposit.toLocaleString()}
      </p>
    )}
  </div>
</div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showShareOptions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareOptions(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Images Gallery */}
            {safeImages.length > 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-blue-200">
                {/* Main Image Container */}
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden" style={{ height: '500px', maxHeight: '600px' }}>
                  <img
                    src={safeImages[selectedImage]?.url || "https://via.placeholder.com/600x400"}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  {safeImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))}
                        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl border border-blue-200 hover:scale-110"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                      </button>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl border border-blue-200 hover:scale-110"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-bold tracking-wide">
                    {selectedImage + 1} / {safeImages.length}
                  </div>
                </div>
                
                {/* Thumbnail Grid */}
                {safeImages.length > 1 && (
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 sm:gap-4">
                      {safeImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`relative aspect-square rounded-lg sm:rounded-xl overflow-hidden transition-all border-2 ${
                            selectedImage === i
                              ? 'border-blue-600 scale-110 shadow-lg'
                              : 'border-blue-200 hover:border-blue-400 hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img.url || "https://via.placeholder.com/150"}
                            alt={`${title} ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-8 text-center border border-blue-200">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Images Available</h3>
                <p className="text-gray-600">Images for this property will be added soon</p>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Property Description
                </h2>
                <p className="text-gray-700 leading-relaxed font-medium tracking-wide text-base sm:text-lg">
                  {description}
                </p>
              </div>
            )}

            {/* Specifications - Show only if we have any */}
            {(safeSpecifications.bedrooms > 0 || safeSpecifications.bathrooms > 0 || safeSpecifications.carpetArea > 0) && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Basic Specifications */}
                  {safeSpecifications.bedrooms > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Bedrooms</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.bedrooms}</p>
                      </div>
                    </div>
                  )}

                  {safeSpecifications.bathrooms > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Bath className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Bathrooms</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.bathrooms}</p>
                      </div>
                    </div>
                  )}

                  {safeSpecifications.balconies > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Balconies</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.balconies}</p>
                      </div>
                    </div>
                  )}

                  {safeSpecifications.floorNumber > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Floor Number</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.floorNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Area Specifications */}
                  {safeSpecifications.carpetArea > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Maximize className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Carpet Area</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.carpetArea.toLocaleString()} sq.ft.</p>
                      </div>
                    </div>
                  )}

                  {safeSpecifications.builtUpArea > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Built-up Area</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.builtUpArea.toLocaleString()} sq.ft.</p>
                      </div>
                    </div>
                  )}

                  {safeSpecifications.superBuiltUpArea > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Super Built-up Area</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.superBuiltUpArea.toLocaleString()} sq.ft.</p>
                      </div>
                    </div>
                  )}

                  {safeSpecifications.plotArea > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <TreePine className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Plot Area</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.plotArea.toLocaleString()} sq.yd.</p>
                      </div>
                    </div>
                  )}

                  {/* Additional Specifications */}
                  {safeSpecifications.furnishing && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Furnishing</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.furnishing}</p>
                      </div>
                    </div>
                  )}

                  {safeSpecifications.possessionStatus && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Key className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Possession Status</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.possessionStatus}</p>
                      </div>
                    </div>
                  )}

                  {safeSpecifications.ageOfProperty && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Age of Property</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.ageOfProperty} years</p>
                      </div>
                    </div>
                  )}

                  {safeSpecifications.kitchenType && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Kitchen Type</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.kitchenType}</p>
                      </div>
                    </div>
                  )}

                  {/* Parking */}
                  {(safeSpecifications.parking?.covered > 0 || safeSpecifications.parking?.open > 0) && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Parking</p>
                        <p className="text-gray-700 text-sm sm:text-base">
                          {safeSpecifications.parking.covered > 0 && `Covered: ${safeSpecifications.parking.covered}`}
                          {safeSpecifications.parking.covered > 0 && safeSpecifications.parking.open > 0 && ', '}
                          {safeSpecifications.parking.open > 0 && `Open: ${safeSpecifications.parking.open}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Unit Features */}
{safeUnitFeatures.length > 0 && (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
      Unit Features
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      {safeUnitFeatures.map((feature, index) => (
        <div
          key={index}
          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl border border-indigo-200 hover:border-indigo-300 transition-all hover:shadow-md"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            {featureIcons[feature] || getFeatureIcon(feature)}
          </div>
          <span className="font-bold text-gray-800 tracking-wide text-sm sm:text-base">
            {feature}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

            {/* Building Details */}
            {safeBuildingDetails.name && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Building Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {safeBuildingDetails.name && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Building Name</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeBuildingDetails.name}</p>
                      </div>
                    </div>
                  )}

                  {safeBuildingDetails.totalFloors > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Total Floors</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeBuildingDetails.totalFloors}</p>
                      </div>
                    </div>
                  )}

                  {safeBuildingDetails.totalUnits > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Total Units</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeBuildingDetails.totalUnits}</p>
                      </div>
                    </div>
                  )}

                  {safeBuildingDetails.yearBuilt && (
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Year Built</p>
                        <p className="text-gray-700 text-sm sm:text-base">{safeBuildingDetails.yearBuilt}</p>
                      </div>
                    </div>
                  )}

                  {safeBuildingDetails.amenities?.length > 0 && (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3">
                      <p className="font-bold text-gray-900 text-sm sm:text-base mb-2">Building Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {safeBuildingDetails.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location & Map */}
            {embedUrl && (
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Location
                </h2>
                
                <div className="rounded-xl overflow-hidden shadow-lg mb-6 border border-blue-200">
                  <iframe
                    width="100%"
                    height="400"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={embedUrl}
                    allowFullScreen
                    title="Property Location"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 p-4 sm:p-6 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1 sm:mb-2 tracking-wide text-sm sm:text-base">
                      Property Address
                    </p>
                    <p className="text-gray-700 font-medium tracking-wide text-sm sm:text-base md:text-lg">
                      {fullAddress || `${address || ''}${address && city ? ', ' : ''}${city || ''}`}
                    </p>
                    {coordinates && (
                      <p className="text-xs sm:text-sm text-blue-600 mt-2 font-medium tracking-wide">
                        📍 Coordinates: {coordinates.latitude}, {coordinates.longitude}
                      </p>
                    )}
                  </div>
                  
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base w-full lg:w-auto"
                  >
                    <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                    Open in Maps
                  </a>
                </div>
              </div>
            )}

            {/* Virtual Tour */}
            {/* {virtualTour && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Virtual Tour
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={virtualTour}
                    title="Virtual Tour"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )} */}
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-blue-200 lg:top-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                Contact Information
              </h3>
              
              {/* Property Listing Date */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="font-bold text-gray-900 tracking-wide text-sm sm:text-base">
                    Listed on
                  </span>
                </div>
                <p className="text-gray-700 font-medium tracking-wide text-sm sm:text-base pl-6 sm:pl-8">
                  {formatDate(createdAt)}
                </p>
                {updatedAt && createdAt !== updatedAt && (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 mb-2 sm:mb-3">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className="font-bold text-gray-900 tracking-wide text-sm sm:text-base">
                        Last updated
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium tracking-wide text-sm sm:text-base pl-6 sm:pl-8">
                      {formatDate(updatedAt)}
                    </p>
                  </>
                )}
              </div>
              
              {user ? (
                <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-blue-300 shadow-sm">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                      {createdBy?.name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">
                        Property Contact
                      </p>
                      <p className="font-bold text-lg sm:text-xl text-gray-900 tracking-tight">
                        {createdBy?.name || "Property Agent"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {createdBy?.email && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1 sm:mb-2">
                          EMAIL
                        </p>
                        <a 
                          href={`mailto:${createdBy.email}`}
                          className="flex items-center gap-2 sm:gap-3 text-blue-700 hover:text-blue-900 group transition-colors"
                        >
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-bold tracking-wide text-sm sm:text-base group-hover:underline break-all">
                            {createdBy.email}
                          </span>
                        </a>
                      </div>
                    )}
                    
                    {createdBy?.phoneNumber && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1 sm:mb-2">
                          PHONE
                        </p>
                        <a 
                          href={`tel:${createdBy.phoneNumber}`}
                          className="flex items-center gap-2 sm:gap-3 text-blue-700 hover:text-blue-900 group transition-colors"
                        >
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-bold tracking-wide text-sm sm:text-base group-hover:underline">
                            {createdBy.phoneNumber}
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {createdBy?.phoneNumber && (
                    <a
                      href={`https://wa.me/${createdBy.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I'm interested in your property: ${title} (${address}, ${city})`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3">
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        Message on WhatsApp
                      </button>
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl border-2 border-blue-300 text-center">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Lock className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-blue-600" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
                    Sign In Required
                  </h4>
                  <p className="text-gray-600 mb-4 sm:mb-6 font-medium tracking-wide leading-relaxed text-sm sm:text-base">
                    Sign in to access contact details and schedule viewings
                  </p>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <button 
                      onClick={() => navigate('/login', { state: { from: `/property-units/${id}` } })}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base"
                    >
                      Sign In for Details
                    </button>
                    <button 
                      onClick={() => navigate('/register', { state: { from: `/property-units/${id}` } })}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all border-2 border-yellow-400 font-bold tracking-wide text-sm sm:text-base"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Property Stats */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-blue-200">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                Property Stats
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                  <span className="font-bold text-gray-700 tracking-wide text-sm sm:text-base">
                    Property ID
                  </span>
                  <span className="font-bold text-blue-600 text-sm sm:text-base">
                    #{id?.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                  <span className="font-bold text-gray-700 tracking-wide text-sm sm:text-base">
                    Views
                  </span>
                  <span className="font-bold text-blue-600 text-sm sm:text-base">
                    {viewCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                  <span className="font-bold text-gray-700 tracking-wide text-sm sm:text-base">
                    Favorites
                  </span>
                  <span className="font-bold text-blue-600 text-sm sm:text-base">
                    {favoriteCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl border border-green-200">
                  <span className="font-bold text-green-700 tracking-wide text-sm sm:text-base">
                    Status
                  </span>
                  <span className={`font-bold text-sm sm:text-base ${getAvailabilityColor(availability)} bg-clip-text text-transparent`}>
                    {availability === 'available' ? '✅ Available' : 
                     availability === 'sold' ? '❌ Sold' : 
                     availability === 'rented' ? '🏠 Rented' : 
                     '🤝 Under Negotiation'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}