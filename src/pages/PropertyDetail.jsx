import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPropertyById } from "../api/axios";
import { useAuth } from "../context/AuthContext";
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
  Sprout,
  Handshake,
  LandPlot,
  Maximize,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Shield,
  FileCheck,
  BadgeCheck,
  Lock,
  Verified
} from "lucide-react";
import Footer from "./Footer";
import FeaturedProperties from "./FeaturedProperties";
import VerifiedProperties from "./VerifiedProperties";

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await getPropertyById(id);
        setProperty(res.data.property);
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // WhatsApp share function
  const shareOnWhatsApp = () => {
    if (!property) return;
    
    const { title, propertyLocation, city, price } = property;
    const propertyUrl = window.location.href;
    
    const message = `Check out this 100% legally verified property:\n\n🏠 ${title}\n📍 ${propertyLocation}, ${city}\n💰 ${price}\n\n✅ 100% Clear Title Verified\n🔒 Complete Legal Documentation\n\nView full details: ${propertyUrl}`;
    
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

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 text-base sm:text-lg font-medium tracking-wide">Loading legal property details...</p>
        </div>
      </div>
    );

  if (!property)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-6 sm:p-8 md:p-12 text-center max-w-md w-full border border-blue-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 font-medium leading-relaxed text-sm sm:text-base">
            This property doesn't exist or isn't available for legal verification.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base w-full sm:w-auto"
          >
            Back to Verified Properties
          </button>
        </div>
      </div>
    );

  const {
    title,
    description,
    content,
    city,
    category,
    images,
    attributes,
    features,
    distanceKey,
    nearby,
    mapUrl,
    coordinates,
    isFeatured,
    isVerified,
    forSale,
    price,
    propertyLocation,
    createdBy,
    createdAt,
    updatedAt
  } = property;

  // Category-specific configurations
  const categoryConfig = {
    Outright: { 
      color: "bg-gradient-to-r from-blue-600 to-blue-700", 
      icon: <LandPlot className="w-4 h-4 sm:w-5 sm:h-5" />, 
      label: "Outright",
      legal: "Complete title ownership"
    },
    Commercial: { 
      color: "bg-gradient-to-r from-blue-700 to-blue-800", 
      icon: <Building className="w-4 h-4 sm:w-5 sm:h-5" />, 
      label: "Commercial",
      legal: "Commercial use permitted"
    },
    Farmland: { 
      color: "bg-gradient-to-r from-green-600 to-green-700", 
      icon: <Sprout className="w-4 h-4 sm:w-5 sm:h-5" />, 
      label: "Farmland",
      legal: "Agricultural use certified"
    },
    "JD/JV": { 
      color: "bg-gradient-to-r from-purple-600 to-purple-700", 
      icon: <Handshake className="w-4 h-4 sm:w-5 sm:h-5" />, 
      label: "JD/JV",
      legal: "Joint development agreement"
    }
  };

  const categoryInfo = categoryConfig[category] || { 
    color: "bg-gradient-to-r from-gray-600 to-gray-700", 
    icon: <Building className="w-4 h-4 sm:w-5 sm:h-5" />, 
    label: "Property",
    legal: "Legally verified"
  };

  // Feature icons
  const featureIcons = {
    "Conference Room": "💼",
    "CCTV Surveillance": "📹",
    "Power Backup": "🔋",
    "Fire Safety": "🚒",
    "Cafeteria": "🍽️",
    "Reception Area": "🏢",
    "Parking": "🅿️",
    "Lift(s)": "🛗",
    "Borewell": "💧",
    "Fencing": "🚧",
    "Electricity Connection": "⚡",
    "Water Source": "🚰",
    "Drip Irrigation": "💦",
    "Storage Shed": "🏚️",
    "Highway Access": "🛣️",
    "Legal Assistance": "⚖️",
    "Joint Development Approved": "✅",
    "Investor Friendly": "💰",
    "Gated Boundary": "🚪",
    "Clear Title": "📋",
    "Legal Verification": "⚖️",
    "Encumbrance Free": "🔓",
    "Government Approved": "🏛️",
    "Complete Documentation": "📄",
    "No Legal Disputes": "⚖️"
  };

  // Nearby place icons and labels
  const nearbyConfig = {
    Highway: { icon: "🛣️", label: "Highway", unit: "km" },
    Airport: { icon: "✈️", label: "Airport", unit: "km" },
    BusStop: { icon: "🚌", label: "Bus Stop", unit: "km" },
    Metro: { icon: "🚇", label: "Metro Station", unit: "km" },
    CityCenter: { icon: "🏙️", label: "City Center", unit: "km" },
    IndustrialArea: { icon: "🏭", label: "Industrial Area", unit: "km" }
  };

  // Distance key icons
  const distanceKeyIcons = {
    "Prime Location": "⭐",
    "City Center": "🏙️",
    "Industrial Hub": "🏭",
    "Highway Access": "🛣️",
    "Developing Area": "🚧",
    "Rural Area": "🌾",
    "Commercial Zone": "🏢",
    "Agricultural Zone": "🌱",
    "Mixed Use": "🏘️",
    "Legally Approved": "✅",
    "Clear Title Area": "📋",
    "Verified Location": "⚖️"
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGoogleMapsEmbedUrl = () => {
    if (coordinates?.latitude && coordinates?.longitude) {
      return `https://maps.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15&output=embed`;
    }
    if (mapUrl) {
      const coordMatch = mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return `https://maps.google.comaps?q=${coordMatch[1]},${coordMatch[2]}&z=15&output=embed`;
      }
      if (mapUrl.includes('maps.google.com') || mapUrl.includes('goo.gl/maps')) {
        return mapUrl.replace('/?', '/embed?');
      }
    }
    if (propertyLocation && city) {
      const query = encodeURIComponent(`${propertyLocation}, ${city}`);
      return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
    }
    if (city) {
      const query = encodeURIComponent(city);
      return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
    }
    return null;
  };

  const getGoogleMapsViewUrl = () => {
    if (mapUrl) return mapUrl;
    if (coordinates?.latitude && coordinates?.longitude) {
      return `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
    }
    if (propertyLocation && city) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propertyLocation + ', ' + city)}`;
    }
    if (city) {
      return `https://www.google.com/maps/place/${encodeURIComponent(city)}`;
    }
    return "#";
  };

  const embedUrl = getGoogleMapsEmbedUrl();
  const viewUrl = getGoogleMapsViewUrl();

  // Check if nearby has any values
  const hasNearby = nearby && Object.values(nearby).some(value => value !== null && value !== undefined && value !== '');
  
  // Check if distanceKey has values
  const hasDistanceKey = distanceKey && distanceKey.length > 0;

  // Render category-specific attributes
  const renderCategoryAttributes = () => {
    switch (category) {
      case "Commercial":
        return (
          <>
            {attributes?.square && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-blue-200 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl text-white">📐</span>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{attributes.square.toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Square Feet</p>
                </div>
              </div>
            )}
            {attributes?.expectedROI && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-green-200 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{attributes.expectedROI}%</p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Expected ROI</p>
                </div>
              </div>
            )}
          </>
        );
      
      case "Farmland":
        return (
          <>
            {attributes?.square && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-green-200 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl text-white">🌾</span>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{attributes.square.toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Acres</p>
                </div>
              </div>
            )}
            {attributes?.waterSource && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-blue-200 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl text-white">💧</span>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{attributes.waterSource}</p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Water Source</p>
                </div>
              </div>
            )}
          </>
        );
      
      case "Outright":
      case "JD/JV":
        return (
          <>
            {attributes?.square && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-blue-200 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl text-white">📐</span>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{attributes.square.toLocaleString()}</p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Square Feet</p>
                </div>
              </div>
            )}
            {attributes?.roadWidth && (
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-yellow-200 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl text-white">🛣️</span>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-bold text-gray-900">{attributes.roadWidth} ft</p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">Road Width</p>
                </div>
              </div>
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Legal Verification Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 sm:py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
            <span className="font-bold text-sm sm:text-base">100% CLEAR TITLE VERIFIED</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-green-300" />
            <span className="text-sm font-medium">Complete Legal Documentation Available</span>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 sm:gap-3 text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold tracking-wide text-sm sm:text-base">Back to verified properties</span>
            </button>

            {/* Share Button - Only for logged-in users */}
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
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Share on WhatsApp</p>
                        <p className="text-xs text-gray-600 font-medium">Share with legal advisors</p>
                      </div>
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-6 sm:py-4 text-left hover:bg-blue-50 transition-colors"
                    >
                      <span className="text-2xl">🔗</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Copy Legal Link</p>
                        <p className="text-xs text-gray-600 font-medium">Copy verified property URL</p>
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
                  <span className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                    Featured
                  </span>
                )}
                {isVerified && (
                  <span className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg">
                    <Verified className="w-3 h-3 sm:w-4 sm:h-4" />
                    100% Verified
                  </span>
                )}
                <span className={`${categoryInfo.color} text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg flex items-center gap-1 sm:gap-2`}>
                  {categoryInfo.icon}
                  {categoryInfo.label}
                </span>
                <span className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg">
                  {forSale ? "For Sale" : "For Lease"}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
                {title}
              </h1>
              
              <div className="flex items-center gap-2 sm:gap-3 text-blue-600 mb-4 sm:mb-6">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-base sm:text-lg font-bold tracking-wide">{propertyLocation}, {city}</span>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6">
                {renderCategoryAttributes()}
                
                {/* Legal Verification Badge */}
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg sm:rounded-xl border-2 border-blue-300 shadow-sm">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold text-gray-900">Clear Title</p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">100% Legal Verification</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 lg:text-right">
              <div className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-1 sm:mb-2">
                Price:{price}
              </div>
              {attributes?.square && typeof price === "number" && (
                <p className="text-xs sm:text-sm text-blue-600 font-medium tracking-wide">
                  {category === "Farmland" 
                    ? `₹${(price / attributes.square).toFixed(0)}/acre`
                    : `₹${(price / attributes.square).toFixed(0)}/sqft`
                  }
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
            {images?.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-blue-200">
                {/* Main Image Container */}
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden" style={{ height: '500px', maxHeight: '600px' }}>
                  <img
                    src={images[selectedImage]?.url}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl border border-blue-200 hover:scale-110"
                      >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                      </button>
                      <button
                        onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl border border-blue-200 hover:scale-110"
                      >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-bold tracking-wide">
                    {selectedImage + 1} / {images.length}
                  </div>
                </div>
                
                {/* Thumbnail Grid */}
                {images.length > 1 && (
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 sm:gap-4">
                      {images.map((img, i) => (
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
                            src={img.url}
                            alt={`${title} ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Legal Verification Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">Legal Verification Status</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="font-bold text-white">Title Verification</span>
                  </div>
                  <p className="text-blue-100 text-sm">Complete property title verified</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="w-5 h-5 text-green-300" />
                    <span className="font-bold text-white">Encumbrance Free</span>
                  </div>
                  <p className="text-blue-100 text-sm">No loans or legal disputes</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Verified className="w-5 h-5 text-green-300" />
                    <span className="font-bold text-white">Regulatory Compliance</span>
                  </div>
                  <p className="text-blue-100 text-sm">All government approvals obtained</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {(description || content) && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">Property Overview</h2>
                {description && <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed font-medium tracking-wide text-base sm:text-lg">{description}</p>}
                {content && <p className="text-gray-700 leading-relaxed whitespace-pre-line font-medium tracking-wide text-base sm:text-lg">{content}</p>}
              </div>
            )}

            {/* Location Insights */}
            {hasDistanceKey && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">Location Insights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {distanceKey.map((key, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200 hover:border-blue-300 transition-all"
                    >
                      <span className="text-xl sm:text-2xl">{distanceKeyIcons[key] || "📍"}</span>
                      <span className="font-bold text-gray-800 tracking-wide text-sm sm:text-base">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Places */}
            {hasNearby && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">Nearby Places</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(nearby).map(([key, value]) => {
                    if (value === null || value === undefined || value === '') return null;
                    
                    const config = nearbyConfig[key];
                    if (!config) return null;

                    return (
                      <div
                        key={key}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-blue-200 hover:border-blue-300 transition-all shadow-sm"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-lg sm:text-xl text-white">{config.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-base sm:text-lg font-bold text-gray-900">{value} {config.unit}</p>
                          <p className="text-xs sm:text-sm text-gray-600 font-medium tracking-wide">{config.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Features */}
            {features?.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">Features & Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200 hover:border-blue-300 transition-all"
                    >
                      <span className="text-xl sm:text-2xl">{featureIcons[f] || "✨"}</span>
                      <span className="font-bold text-gray-800 tracking-wide text-sm sm:text-base">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Map */}
            {(mapUrl || coordinates || propertyLocation) && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">Location</h2>
                
                {embedUrl ? (
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
                ) : (
                  <div className="bg-blue-50 rounded-xl p-12 text-center mb-6 border border-blue-200">
                    <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-blue-600 font-bold tracking-wide">Location map not available</p>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 p-4 sm:p-6 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1 sm:mb-2 tracking-wide text-sm sm:text-base">Property Address</p>
                    <p className="text-gray-700 font-medium tracking-wide text-sm sm:text-base md:text-lg">
                      {propertyLocation}, {city}
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
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Legal Contact Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-blue-200 lg:top-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">Legal Contact Information</h3>
              
              {/* Property Listing Date */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="font-bold text-gray-900 tracking-wide text-sm sm:text-base">Listed on</span>
                </div>
                <p className="text-gray-700 font-medium tracking-wide text-sm sm:text-base pl-6 sm:pl-8">{formatDate(createdAt)}</p>
                {updatedAt && createdAt !== updatedAt && (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 mb-2 sm:mb-3">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className="font-bold text-gray-900 tracking-wide text-sm sm:text-base">Last updated</span>
                    </div>
                    <p className="text-gray-700 font-medium tracking-wide text-sm sm:text-base pl-6 sm:pl-8">{formatDate(updatedAt)}</p>
                  </>
                )}
              </div>
              
              {user ? (
                <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 border-blue-300 shadow-sm">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                      {createdBy?.name?.charAt(0)?.toUpperCase() || "P"}
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Legal Contact</p>
                      <p className="font-bold text-lg sm:text-xl text-gray-900 tracking-tight">{createdBy?.name || "Legal Representative"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {createdBy?.gmail && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1 sm:mb-2">EMAIL</p>
                        <a 
                          href={`mailto:${createdBy.gmail}`}
                          className="flex items-center gap-2 sm:gap-3 text-blue-700 hover:text-blue-900 group transition-colors"
                        >
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-bold tracking-wide text-sm sm:text-base group-hover:underline break-all">{createdBy.gmail}</span>
                        </a>
                      </div>
                    )}
                    
                    {createdBy?.phoneNumber && (
                      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1 sm:mb-2">PHONE</p>
                        <a 
                          href={`tel:${createdBy.phoneNumber}`}
                          className="flex items-center gap-2 sm:gap-3 text-blue-700 hover:text-blue-900 group transition-colors"
                        >
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-bold tracking-wide text-sm sm:text-base group-hover:underline">{createdBy.phoneNumber}</span>
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <a
                    href={`https://wa.me/${createdBy.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I'm interested in your legally verified property: ${title} (${propertyLocation}, ${city})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      Message on WhatsApp
                    </button>
                  </a>    
                </div>
              ) : (
                <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl border-2 border-blue-300 text-center">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Lock className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-blue-600" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Legal Access Required</h4>
                  <p className="text-gray-600 mb-4 sm:mb-6 font-medium tracking-wide leading-relaxed text-sm sm:text-base">
                    Sign in to access legal contact details and complete documentation
                  </p>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <button 
                      onClick={() => navigate('/login', { state: { from: `/property/${id}` } })}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base"
                    >
                      Sign In for Legal Access
                    </button>
                    <button 
                      onClick={() => navigate('/register', { state: { from: `/property/${id}` } })}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all border-2 border-yellow-400 font-bold tracking-wide text-sm sm:text-base"
                    >
                      Create Legal Account
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Legal Verification Stats */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-blue-500">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 tracking-tight">Legal Verification</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                  <span className="font-bold text-white tracking-wide text-sm sm:text-base">Verification Status</span>
                  <span className="flex items-center gap-1 sm:gap-2 font-bold text-green-300 text-sm sm:text-base">
                    <Verified className="w-4 h-4 sm:w-5 sm:h-5" />
                    100% Verified
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                  <span className="font-bold text-white tracking-wide text-sm sm:text-base">Title Status</span>
                  <span className="font-bold text-green-300 text-sm sm:text-base">Clear</span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                  <span className="font-bold text-white tracking-wide text-sm sm:text-base">Documentation</span>
                  <span className="font-bold text-green-300 text-sm sm:text-base">Complete</span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                  <span className="font-bold text-white tracking-wide text-sm sm:text-base">Legal ID</span>
                  <span className="font-bold text-yellow-300 text-sm sm:text-base">#{id?.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-blue-200">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">Property Details</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                  <span className="font-bold text-gray-700 tracking-wide text-sm sm:text-base">Property ID</span>
                  <span className="font-bold text-blue-600 text-sm sm:text-base">#{id?.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                  <span className="font-bold text-gray-700 tracking-wide text-sm sm:text-base">Type</span>
                  <span className="font-bold text-blue-600 text-sm sm:text-base">{category}</span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                  <span className="font-bold text-gray-700 tracking-wide text-sm sm:text-base">Status</span>
                  <span className={`font-bold text-sm sm:text-base ${forSale ? 'text-green-600' : 'text-blue-600'}`}>
                    {forSale ? 'For Sale' : 'For Lease'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl border border-green-200">
                  <span className="font-bold text-green-700 tracking-wide text-sm sm:text-base">Legal Status</span>
                  <span className="flex items-center gap-1 sm:gap-2 font-bold text-green-700 text-sm sm:text-base">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FeaturedProperties/>
      <VerifiedProperties/>
      <Footer/>
    </div>
  );
}