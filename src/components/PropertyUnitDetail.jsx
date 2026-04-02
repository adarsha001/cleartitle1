// PropertyUnitDetail.jsx - Updated with complete backend integration
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import { 
  ArrowLeft, 
  MapPin, 
  ArrowRight,
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
  LandPlot,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Check,
  X,
  Maximize2,
  Minus,
  Plus,
  ChefHat,
  DoorOpen,
  ThermometerSnowflake,
  Fan,
  Lamp,
  Cpu,
  Snowflake,
  Clover,
  BookOpen,
  Sofa,
  User,
  Trees,
  Mountain,
  Ship,
  Waves,
  Bell,
  Flame,
  Dog,
  Accessibility,
  Sun,
  Eye,
  Info,
  Scale,
  Gavel,
  FileSignature,
  Banknote,
  BuildingIcon,
  Map,
  Train,
  School,
  Hospital,
  ShoppingBag,
  Music,
  Coffee,
  Church,
  UtensilsCrossed,
  Briefcase,
  Heart,
  Eye as EyeIcon,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckSquare,
  FileText as FileTextIcon,
  Library,
  ScrollText,
  Landmark,
  HomeIcon,
  HelpCircle,
  Grid,
  List,
  RotateCcw,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  Sparkles,
  Gem,
  Crown,
  Trophy,
  Medal,
  ThumbsUp as LikeIcon
} from "lucide-react";
import Footer from "../pages/Footer";
import PossessionTimeline from "../newapproach/PossessionTimeline";
import NewlyLaunchedProperties from "../newapproach/NewlyLaunchedProperties";
import FeaturedProperties from "../pages/FeaturedProperties";

export default function PropertyUnitDetail() {
  const { id } = useParams();
  const [propertyUnit, setPropertyUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingStep, setBookingStep] = useState(1);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedUnitType, setSelectedUnitType] = useState(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const fullscreenRef = useRef(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for mobile expand/collapse
  const [expandedSections, setExpandedSections] = useState({
    features: true,
    specifications: true,
    amenities: true,
    buildingDetails: true,
    unitTypes: true,
    legalDetails: true,
    locationNearby: true,
    ownerDetails: true,
    plotDetails: true,
    rentalDetails: true
  });

  // Available time slots
  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  // Get today's date for min date
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  // Get date for 30 days from now for max date
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Toggle section for mobile
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Open image in fullscreen
  const openFullscreenImage = (index) => {
    setFullscreenImageIndex(index);
    setShowFullscreenImage(true);
    setZoomLevel(1);
    document.body.style.overflow = 'hidden';
  };

  // Close fullscreen image
  const closeFullscreenImage = () => {
    setShowFullscreenImage(false);
    document.body.style.overflow = 'auto';
  };

  // Navigate between fullscreen images
  const nextFullscreenImage = () => {
    setFullscreenImageIndex(prev => 
      prev === safeImages.length - 1 ? 0 : prev + 1
    );
    setZoomLevel(1);
  };

  const prevFullscreenImage = () => {
    setFullscreenImageIndex(prev => 
      prev === 0 ? safeImages.length - 1 : prev - 1
    );
    setZoomLevel(1);
  };

  // Zoom in/out
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  // Reset zoom
  const resetZoom = () => {
    setZoomLevel(1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareOptions && !event.target.closest('.share-button-container')) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareOptions]);

  // Handle keyboard shortcuts for fullscreen image
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showFullscreenImage) return;
      
      switch(e.key) {
        case 'Escape':
          closeFullscreenImage();
          break;
        case 'ArrowRight':
          nextFullscreenImage();
          break;
        case 'ArrowLeft':
          prevFullscreenImage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFullscreenImage]);

  // Fetch property unit details
  useEffect(() => {
    const fetchPropertyUnit = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await propertyUnitAPI.getPropertyUnit(id);
        
        if (response.data.success) {
          setPropertyUnit(response.data.data);
          setLikeCount(response.data.data.likes || 0);
          // Check if user has liked this property (if logged in)
          if (user && response.data.data.likedByUser) {
            setIsLiked(true);
          }
          // Select first unit type by default if available
          if (response.data.data.unitTypes && response.data.data.unitTypes.length > 0) {
            setSelectedUnitType(response.data.data.unitTypes[0]);
          }
        } else {
          console.error("Failed to fetch property unit:", response.data.message);
          setError(response.data.message || "Failed to fetch property details");
        }
      } catch (error) {
        console.error("Error fetching property unit:", error);
        
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
  }, [id, user]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/property-units/${id}` } });
      return;
    }
    
    try {
      const response = await propertyUnitAPI.toggleLike(id);
      if (response.data.success) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Handle inquiry
  const handleInquiry = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/property-units/${id}` } });
      return;
    }
    
    if (!inquiryMessage.trim()) {
      alert("Please enter your inquiry message");
      return;
    }
    
    try {
      const response = await propertyUnitAPI.sendInquiry(id, { message: inquiryMessage });
      if (response.data.success) {
        alert("Inquiry sent successfully! The owner will contact you soon.");
        setShowInquiryModal(false);
        setInquiryMessage("");
      } else {
        alert("Failed to send inquiry. Please try again.");
      }
    } catch (error) {
      console.error("Error sending inquiry:", error);
      alert("Failed to send inquiry. Please try again.");
    }
  };

  // Add null check functions
  const safeImages = propertyUnit?.images || [];
  const safeUnitTypes = propertyUnit?.unitTypes || [];
  const safeBuildingDetails = propertyUnit?.buildingDetails || {};
  const safeUnitFeatures = propertyUnit?.unitFeatures || [];
  const safeLegalDetails = propertyUnit?.legalDetails || {};
  const safeLocationNearby = propertyUnit?.locationNearby || [];
  const safeOwnerDetails = propertyUnit?.ownerDetails || {};
  const safeCommonSpecifications = propertyUnit?.commonSpecifications || {};
  const safeViewingSchedule = propertyUnit?.viewingSchedule || [];
  const safeContactPreference = propertyUnit?.contactPreference || [];
  const safePlotDetails = propertyUnit?.plotArea || null;
  const safeRentalDetails = propertyUnit?.rentalDetails || null;

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

  // BOOKING FUNCTIONS
  const handleBookAppointment = () => {
    if (!user) {
      navigate('/login', { state: { from: `/property-units/${id}` } });
      return;
    }
    setShowBookingModal(true);
    setBookingStep(1);
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setBookingStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setTimeout(() => {
      sendBookingToWhatsApp();
    }, 500);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sendBookingToWhatsApp = () => {
    if (!propertyUnit || !selectedDate || !selectedTime) return;
    
    const {
      title,
      address,
      city,
      description,
      propertyType,
    } = propertyUnit;

    const appointmentDate = formatDateForDisplay(selectedDate);
    
    let message = `*📅 PROPERTY VIEWING APPOINTMENT REQUEST*\n\n`;
    message += `*Property Details:*\n`;
    message += `🏢 *${title}*\n`;
    message += `📍 ${address}, ${city}\n`;
    message += `📐 ${propertyType}\n`;
    
    if (selectedUnitType) {
      message += `\n*Selected Unit:*\n`;
      message += `🏠 Type: ${selectedUnitType.type}\n`;
      message += `💰 Price: ${formatUnitPrice(selectedUnitType.price)}\n`;
      message += `📏 Area: ${selectedUnitType.carpetArea.toLocaleString()} sq.ft.\n`;
    }
    
    message += `\n*Appointment Details:*\n`;
    message += `📅 Date: ${appointmentDate}\n`;
    message += `⏰ Time: ${selectedTime}\n`;
    message += `\n*Client Information:*\n`;
    message += `👤 Name: ${user?.name || 'Not specified'}\n`;
    message += `📧 Email: ${user?.email || 'Not specified'}\n`;
    message += `📱 Phone: ${user?.phoneNumber || 'Not specified'}\n`;
    message += `\n_This appointment request was sent via Property Portal_\n`;
    message += `Property URL: ${window.location.href}`;

    const agentPhoneNumber = propertyUnit?.createdBy?.phoneNumber || "";
    const cleanPhoneNumber = agentPhoneNumber.replace(/\D/g, '');
    
    if (!cleanPhoneNumber) {
      alert('Agent phone number not available');
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    setShowBookingModal(false);
    setSelectedDate("");
    setSelectedTime("");
    setBookingStep(1);
    
    alert(`Appointment request sent to WhatsApp!\n\nDate: ${appointmentDate}\nTime: ${selectedTime}`);
  };

  // Format price with null checks
  const formatPrice = (price) => {
    if (!price) return "Price on request";
    
    try {
      let amount = 0;
      let currency = '₹';
      
      const extractNumericValue = (str) => {
        if (!str) return 0;
        const lowerStr = str.toString().toLowerCase().trim();
        if (lowerStr.includes('price on request') || 
            lowerStr.includes('contact for price') ||
            lowerStr.includes('negotiable') ||
            lowerStr === 'on request') {
          return null;
        }
        
        let cleanStr = str.toString()
          .replace(/[₹$,€£\s]/g, '')
          .replace(/[^\d,.-]/g, '');
        
        cleanStr = cleanStr.replace(/,/g, '');
        const parsed = parseFloat(cleanStr);
        return isNaN(parsed) ? 0 : parsed;
      };
      
      if (typeof price === 'object' && price !== null) {
        const priceValue = price.amount || price.value || 0;
        if (typeof priceValue === 'string' && priceValue.includes(',')) {
          amount = extractNumericValue(priceValue);
        } else {
          amount = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue;
        }
      } else if (typeof price === 'number') {
        amount = price;
      } else if (typeof price === 'string') {
        if (price.includes(',')) {
          amount = extractNumericValue(price);
          if (amount === null) return "Price on request";
        } else {
          const parsed = parseFloat(price.replace(/[^0-9.-]+/g, ""));
          amount = isNaN(parsed) ? 0 : parsed;
        }
      }
      
      if (!amount || isNaN(amount) || amount <= 0) return "Price on request";
      
      const formatToIndianWords = (num) => {
        const crore = 10000000;
        const lakh = 100000;
        const thousand = 1000;
        
        const cleanNumber = (n) => {
          const str = n.toFixed(2);
          return str.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
        };
        
        if (num >= crore) {
          const crores = num / crore;
          const croresInt = Math.floor(crores);
          const croresDecimal = crores - croresInt;
          
          if (croresDecimal === 0) {
            return `${croresInt.toLocaleString('en-IN')} Crore${croresInt > 1 ? 's' : ''}`;
          } else {
            return `${cleanNumber(crores)} Crore`;
          }
        }
        
        if (num >= lakh) {
          const lakhs = num / lakh;
          const lakhsInt = Math.floor(lakhs);
          const lakhsDecimal = lakhs - lakhsInt;
          
          if (lakhsDecimal === 0) {
            return `${lakhsInt.toLocaleString('en-IN')} Lakh${lakhsInt > 1 ? 's' : ''}`;
          } else {
            return `${cleanNumber(lakhs)} Lakh`;
          }
        }
        
        if (num >= thousand) {
          const thousands = num / thousand;
          if (thousands % 1 === 0) {
            return `${thousands.toLocaleString('en-IN')} Thousand`;
          } else {
            return `${cleanNumber(thousands)} Thousand`;
          }
        }
        
        return `${num.toLocaleString('en-IN')}`;
      };
      
      const formatted = formatToIndianWords(amount);
      return `${currency} ${formatted}`;
      
    } catch (err) {
      console.error("Error formatting price:", err);
      return "Price on request";
    }
  };

  // Format unit price
  const formatUnitPrice = (price) => {
    if (!price) return "Price on request";
    
    let amount = price.amount || price;
    let perUnit = price.perUnit || "total";
    
    const formattedAmount = formatPrice(amount);
    
    if (perUnit === "sqft") {
      return `${formattedAmount} per sq.ft.`;
    } else if (perUnit === "sqm") {
      return `${formattedAmount} per sq.m.`;
    } else if (perUnit === "month") {
      return `${formattedAmount} per month`;
    } else if (perUnit === "perSqYard") {
      return `${formattedAmount} per sq.yd.`;
    } else if (perUnit === "perGround") {
      return `${formattedAmount} per ground`;
    }
    
    return formattedAmount;
  };

  // Get property type icon
  const getPropertyTypeIcon = (type) => {
    const icons = {
      'Apartment': <Building className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Villa': <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Independent House': <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Studio': <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Penthouse': <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Duplex': <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Pg house': <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Plot': <LandPlot className="w-4 h-4 sm:w-5 sm:h-5" />,
      'Commercial Space': <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
    };
    
    return icons[type] || <Building className="w-4 h-4 sm:w-5 sm:h-5" />;
  };

  // Get listing type color
  const getListingTypeColor = (type) => {
    const colors = {
      'sale': 'from-green-600 to-green-700',
      'rent': 'from-blue-600 to-blue-700',
      'lease': 'from-purple-600 to-purple-700',
      'pg': 'from-orange-600 to-orange-700'
    };
    
    return colors[type] || 'from-gray-600 to-gray-700';
  };

  // Get listing type display text
  const getListingTypeText = (type) => {
    const texts = {
      'sale': 'For Sale',
      'rent': 'For Rent',
      'lease': 'For Lease',
      'pg': 'PG/Hostel'
    };
    
    return texts[type] || 'For Sale';
  };

  // Get availability color
  const getAvailabilityColor = (status) => {
    const colors = {
      'available': 'from-emerald-500 to-emerald-600',
      'sold': 'from-slate-600 to-slate-700',
      'rented': 'from-blue-500 to-blue-600',
      'under-agreement': 'from-yellow-500 to-yellow-600',
      'hold': 'from-amber-500 to-amber-600'
    };
    
    return colors[status] || 'from-gray-500 to-gray-600';
  };

  // Get availability display text
  const getAvailabilityText = (status) => {
    const texts = {
      'available': '✨ Available Now',
      'sold': '⭐ Sold',
      'rented': '🔐 Rented',
      'under-agreement': '📝 Under Agreement',
      'hold': '⏸️ On Hold'
    };
    
    return texts[status] || status;
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

  // Get location nearby icon
  const getLocationNearbyIcon = (type) => {
    const icons = {
      'transport': <Train className="w-4 h-4 sm:w-5 sm:h-5" />,
      'education': <School className="w-4 h-4 sm:w-5 sm:h-5" />,
      'healthcare': <Hospital className="w-4 h-4 sm:w-5 sm:h-5" />,
      'shopping': <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />,
      'entertainment': <Music className="w-4 h-4 sm:w-5 sm:h-5" />,
      'banking': <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />,
      'religious': <Church className="w-4 h-4 sm:w-5 sm:h-5" />,
      'park': <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />,
      'restaurant': <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />,
      'other': <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
    };
    
    return icons[type] || <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />;
  };

  // Get Google Maps embed URL
  const getGoogleMapsEmbedUrl = () => {
    if (!propertyUnit) return null;
    
    try {
      const { coordinates, mapUrl, address, city } = propertyUnit;
      if (address && city) {
        const query = encodeURIComponent(`${address}, ${city}`);
        return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
      }
          
      if (city) {
        const query = encodeURIComponent(city);
        return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
      }
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
      if (address && city) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', ' + city)}`;
      }
      if (city) {
        return `https://www.google.com/maps/place/${encodeURIComponent(city)}`;
      }
      if (mapUrl) return mapUrl;
      
      if (coordinates?.latitude && coordinates?.longitude) {
        return `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
      }
    } catch (err) {
      console.error("Error generating Google Maps view URL:", err);
    }
    
    return "#";
  };

  // Feature icons mapping
  const getFeatureIcon = (feature) => {
    const iconMap = {
      // Basic Amenities
      "Air Conditioning": <Wind className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Modular Kitchen": <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Wardrobes": <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Geyser": <ThermometerSnowflake className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Exhaust Fan": <Fan className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Chimney": <Wind className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Lighting": <Lamp className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Ceiling Fans": <Fan className="w-4 h-4 sm:w-5 sm:h-5" />,
      
      // Luxury
      "Smart Home Automation": <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Central AC": <Snowflake className="w-4 h-4 sm:w-5 sm:h-5" />,
      "bore water": <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Walk-in Closet": <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Study Room": <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Pooja Room": <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Utility Area": <Sofa className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Servant Room": <User className="w-4 h-4 sm:w-5 sm:h-5" />,
      
      // Outdoor
      "Private Garden": <Trees className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Terrace": <Mountain className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Balcony": <Ship className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Swimming Pool": <Waves className="w-4 h-4 sm:w-5 sm:h-5" />,
      
      // Safety & Security
      "Video Door Phone": <Camera className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Security Alarm": <Bell className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Fire Safety": <Flame className="w-4 h-4 sm:w-5 sm:h-5" />,
      "CCTV": <Camera className="w-4 h-4 sm:w-5 sm:h-5" />,
      
      // Additional
      "Pet Friendly": <Dog className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Wheelchair Access": <Accessibility className="w-4 h-4 sm:w-5 sm:h-5" />,
      "Natural Light": <Sun className="w-4 h-4 sm:w-5 sm:h-5" />,
      "View": <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
    };

    return iconMap[feature] || <Home className="w-4 h-4 sm:w-5 sm:h-5" />;
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
    city,
    address,
    propertyType,
    availability,
    isFeatured,
    isVerified,
    listingType,
    viewCount,
    createdAt,
    updatedAt,
    createdBy,
    fullAddress,
    commonSpecifications,
    buildingDetails,
    specifications,
    priceRange,
    hasMultipleUnitTypes,
    totalUnitTypes,
    availableUnitTypesCount,
    virtualTour,
    floorPlan,
    slug
  } = propertyUnit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 relative">
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

      <div className="bg-white border-b border-indigo-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 sm:gap-3 text-indigo-600 hover:text-indigo-800 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold tracking-wide text-sm sm:text-base">
                Back to Properties
              </span>
            </button>

            <div className="flex items-center gap-3">
              {/* Like Button */}
              {/* <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isLiked 
                    ? 'bg-red-50 text-red-600 border border-red-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <LikeIcon className={`w-5 h-5 ${isLiked ? 'fill-red-600' : ''}`} />
                <span>{likeCount}</span>
              </button> */}

              {/* Share Button */}
              {user && (
                <div className="relative share-button-container">
                  <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>

                  {/* Share Options Dropdown */}
                  {showShareOptions && (
                    <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl border border-indigo-200 z-50 overflow-hidden">
                      <button
                        onClick={shareOnWhatsApp}
                        className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-6 sm:py-4 text-left hover:bg-indigo-50 transition-colors border-b border-indigo-100"
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
                        className="w-full flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-6 sm:py-4 text-left hover:bg-indigo-50 transition-colors"
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

              {/* Inquiry Button */}
              {/* <button
                onClick={() => setShowInquiryModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Inquire</span>
              </button> */}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
                {isFeatured && (
                  <span className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                    <span className="hidden sm:inline">Featured</span>
                  </span>
                )}
                
                {isVerified && (
                  <span className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg">
                    <Verified className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Verified</span>
                  </span>
                )}
                
                <span className={`bg-gradient-to-r ${getListingTypeColor(listingType)} text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg flex items-center gap-1 sm:gap-2`}>
                  {listingType === 'sale' ? '💰' : listingType === 'rent' ? '🔑' : listingType === 'lease' ? '📄' : '🏠'}
                  <span className="hidden sm:inline">{getListingTypeText(listingType)}</span>
                </span>

                <span className={`bg-gradient-to-r ${getAvailabilityColor(availability)} text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg`}>
                  {getAvailabilityText(availability)}
                </span>
                
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg flex items-center gap-1 sm:gap-2">
                  {getPropertyTypeIcon(propertyType)}
                  <span className="hidden sm:inline">{propertyType}</span>
                </span>

                {hasMultipleUnitTypes && (
                  <span className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg flex items-center gap-1 sm:gap-2">
                    <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{totalUnitTypes} Unit Types</span>
                  </span>
                )}
              </div>
              
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
                {title || "Untitled Property"}
              </h1>
              
              <div className="flex items-center gap-2 sm:gap-3 text-indigo-600 mb-4 sm:mb-6">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-lg font-medium tracking-wide">
                  {fullAddress || `${address || ''}${address && city ? ', ' : ''}${city || ''}` || "Location not specified"}
                </span>
              </div>

              {/* Price Range Display */}
              {/* {priceRange && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-green-600">
    
                    <span>
                      {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">*Price varies by unit type</p>
                </div>
              )} */}

              {/* Mobile: Compact unit specifications */}
              <div className="sm:hidden">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {commonSpecifications?.furnishing && commonSpecifications.furnishing !== 'unfurnished' && (
                    <div className="flex flex-col items-center p-2 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200 shadow-sm">
                      <Home className="w-6 h-6 text-indigo-600 mb-1" />
                      <span className="text-xs text-indigo-700 font-medium capitalize">{commonSpecifications.furnishing}</span>
                    </div>
                  )}
                  {commonSpecifications?.possessionStatus && (
                    <div className="flex flex-col items-center p-2 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 shadow-sm">
                      <Key className="w-6 h-6 text-purple-600 mb-1" />
                      <span className="text-xs text-purple-700 font-medium capitalize">{commonSpecifications.possessionStatus.replace('-', ' ')}</span>
                    </div>
                  )}
                  {commonSpecifications?.parking?.covered > 0 && (
                    <div className="flex flex-col items-center p-2 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 shadow-sm">
                      <Car className="w-6 h-6 text-amber-600 mb-1" />
                      <span className="text-xs text-amber-700 font-medium">{commonSpecifications.parking.covered} Parking</span>
                    </div>
                  )}
                  {viewCount > 0 && (
                    <div className="flex flex-col items-center p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 shadow-sm">
                      <EyeIcon className="w-6 h-6 text-emerald-600 mb-1" />
                      <span className="text-xs text-emerald-700 font-medium">{viewCount} Views</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop: Redesigned unit specifications */}
              <div className="hidden sm:flex flex-wrap gap-3 sm:gap-4 md:gap-6">
                {specifications?.bedrooms > 0 && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-indigo-900">
                        {specifications.bedrooms}
                      </p>
                      <p className="text-xs sm:text-sm text-indigo-700 font-semibold">
                        Bedrooms
                      </p>
                    </div>
                  </div>
                )}

                {specifications?.carpetArea > 0 && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-blue-900">
                        {specifications.carpetArea.toLocaleString()}
                      </p>
                      <p className="text-xs sm:text-sm text-blue-700 font-semibold">
                        Carpet Area (sq.ft.)
                      </p>
                    </div>
                  </div>
                )}

                {commonSpecifications?.furnishing && commonSpecifications.furnishing !== 'unfurnished' && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-indigo-900 capitalize">
                        {commonSpecifications.furnishing}
                      </p>
                      <p className="text-xs sm:text-sm text-indigo-700 font-semibold">
                        Furnishing
                      </p>
                    </div>
                  </div>
                )}

                {commonSpecifications?.possessionStatus && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Key className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-purple-900 capitalize">
                        {commonSpecifications.possessionStatus.replace('-', ' ')}
                      </p>
                      <p className="text-xs sm:text-sm text-purple-700 font-semibold">
                        Possession
                      </p>
                    </div>
                  </div>
                )}

                {commonSpecifications?.parking?.covered > 0 && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-amber-900">
                        {commonSpecifications.parking.covered}
                      </p>
                      <p className="text-xs sm:text-sm text-amber-700 font-semibold">
                        Covered Parking
                      </p>
                    </div>
                  </div>
                )}

                {commonSpecifications?.parking?.open > 0 && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                      <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                        {commonSpecifications.parking.open}
                      </p>
                      <p className="text-xs sm:text-sm text-emerald-700 font-semibold">
                        Open Parking
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UNIT TYPES TABLE - New Section */}
   

      

      {/* BOOK YOUR APPOINTMENT BUTTON - Fixed at bottom for mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-blue-200 shadow-2xl p-4">
        <button
          onClick={handleBookAppointment}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-lg flex items-center justify-center gap-3"
        >
          <CalendarIcon className="w-6 h-6" />
          Book Your Appointment
        </button>
      </div>

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-blue-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {bookingStep === 1 ? "Select Date" : "Select Time"}
                </h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              {selectedUnitType && (
                <p className="text-sm text-blue-600 mt-2">
                  Selected Unit: {selectedUnitType.type}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${bookingStep === 1 ? 'bg-green-600' : 'bg-green-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${bookingStep === 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              </div>
            </div>

            <div className="p-6">
              {bookingStep === 1 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-bold text-gray-900">Choose a date</p>
                      <p className="text-sm text-gray-600">Select your preferred date for property viewing</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Select Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateSelect(e.target.value)}
                      min={todayString}
                      max={maxDateString}
                      className="w-full p-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Available dates: {today.toLocaleDateString()} - {maxDate.toLocaleDateString()}
                    </p>
                  </div>

                  {selectedDate && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-bold text-green-800">Selected Date</p>
                          <p className="text-green-700">{formatDateForDisplay(selectedDate)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-bold text-gray-900">Choose a time</p>
                      <p className="text-sm text-gray-600">Select your preferred time slot</p>
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="font-bold text-blue-800">Date: {formatDateForDisplay(selectedDate)}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Available Time Slots *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map((time, index) => (
                        <button
                          key={index}
                          onClick={() => handleTimeSelect(time)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedTime === time
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          <span className="font-bold">{time}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedTime && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-bold text-green-800">Selected Time</p>
                          <p className="text-green-700">{selectedTime}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white p-6 border-t border-blue-200 rounded-b-2xl">
              <div className="flex gap-3">
                {bookingStep === 2 && (
                  <button
                    onClick={() => setBookingStep(1)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (bookingStep === 1 && selectedDate) {
                      setBookingStep(2);
                    } else if (bookingStep === 2 && selectedTime) {
                      sendBookingToWhatsApp();
                    }
                  }}
                  disabled={(bookingStep === 1 && !selectedDate) || (bookingStep === 2 && !selectedTime)}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                    (bookingStep === 1 && selectedDate) || (bookingStep === 2 && selectedTime)
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {bookingStep === 1 ? "Continue" : "Confirm & Send to WhatsApp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INQUIRY MODAL */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Send Inquiry</h2>
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Ask any questions about this property
              </p>
            </div>

            <div className="p-6">
              <textarea
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder="I'm interested in this property. Could you provide more details about..."
                rows={5}
                className="w-full p-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                The property owner will receive your inquiry and contact you shortly.
              </p>
            </div>

            <div className="p-6 border-t border-blue-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInquiry}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-bold"
                >
                  Send Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE VIEWER */}
      {showFullscreenImage && (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={closeFullscreenImage}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {safeImages.length > 1 && (
              <>
                <button
                  onClick={prevFullscreenImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextFullscreenImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
              <button
                onClick={zoomOut}
                className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center"
                disabled={zoomLevel <= 0.5}
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={resetZoom}
                className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center text-sm font-medium"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={zoomIn}
                className="w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center"
                disabled={zoomLevel >= 3}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              {fullscreenImageIndex + 1} / {safeImages.length}
            </div>

            <div 
              ref={fullscreenRef}
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
            >
              <img
                src={safeImages[fullscreenImageIndex]?.url || "https://via.placeholder.com/600x400"}
                alt={`${title} - Image ${fullscreenImageIndex + 1}`}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
                draggable="false"
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 sm:pb-8">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Images Gallery */}
            {safeImages.length > 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => openFullscreenImage(selectedImage)}>
                  <div className="relative w-full max-h-[600px] overflow-hidden">
                    <img
                      src={safeImages[selectedImage]?.url || "https://via.placeholder.com/600x400"}
                      alt={title}
                      className="w-full h-auto max-h-[600px] object-contain bg-gray-100"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFullscreenImage(selectedImage);
                      }}
                      className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                    
                    {safeImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl border border-blue-200 hover:scale-110"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-14 sm:h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl border border-blue-200 hover:scale-110"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm font-bold tracking-wide">
                    {selectedImage + 1} / {safeImages.length}
                  </div>
                </div>
                
                {safeImages.length > 1 && (
                  <div className="p-3 sm:p-6">
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-4">
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
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 text-center border border-blue-200">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Images Available</h3>
                <p className="text-gray-600 text-sm sm:text-base">Images for this property will be added soon</p>
              </div>
            )}


       {/* Unit Types Section - Only show if there are residential unit types (not plots) */}
{safeUnitTypes.length > 0 && safeUnitTypes.some(unit => unit.type !== 'Plot') && (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
      <button
        onClick={() => toggleSection('unitTypes')}
        className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-blue-50 transition-colors"
      >
        <div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Available Unit Types
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {safeUnitTypes.filter(unit => unit.type !== 'Plot').length} different configurations available
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${
          expandedSections.unitTypes ? 'rotate-180' : ''
        }`} />
      </button>
      
      <div className={`${expandedSections.unitTypes ? 'block' : 'hidden'} px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8`}>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-blue-200 bg-blue-50">
                <th className="px-4 py-3 text-left font-bold text-gray-900">Unit Type</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Price</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Carpet Area</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Built-up Area</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Super Built-up</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Floors</th>
                <th className="px-4 py-3 text-left font-bold text-gray-900">Availability</th>
              </tr>
            </thead>
            <tbody>
              {safeUnitTypes.filter(unit => unit.type !== 'Plot').map((unit, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-blue-100 hover:bg-blue-50 transition-colors ${
                    selectedUnitType === unit ? 'bg-blue-100' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-gray-900">{unit.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-green-600">{formatUnitPrice(unit.price)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-700">{unit.carpetArea?.toLocaleString()} sq.ft.</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-700">{unit.builtUpArea?.toLocaleString()} sq.ft.</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-700">{unit.superBuiltUpArea?.toLocaleString() || 'N/A'} sq.ft.</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-medium text-gray-700">{unit.floors || 1}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      unit.availability === 'available' ? 'bg-green-100 text-green-700' :
                      unit.availability === 'sold' ? 'bg-gray-100 text-gray-700' :
                      unit.availability === 'limited' ? 'bg-amber-100 text-amber-700' :
                      unit.availability === 'booked' ? 'bg-orange-100 text-orange-700' :
                      unit.availability === 'reserved' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {unit.availability === 'available' ? '✓ Available' :
                       unit.availability === 'sold' ? 'Sold Out' :
                       unit.availability === 'limited' ? 'Limited Stock' :
                       unit.availability === 'booked' ? 'Booked' :
                       unit.availability === 'reserved' ? 'Reserved' :
                       'Coming Soon'}
                    </span>
                    {unit.availableUnits > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({unit.availableUnits} left)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {safeUnitTypes.filter(unit => unit.type !== 'Plot').map((unit, index) => (
            <div 
              key={index}
              className={`border rounded-xl p-4 transition-all ${
                selectedUnitType === unit 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-blue-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg text-gray-900">{unit.type}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  unit.availability === 'available' ? 'bg-green-100 text-green-700' :
                  unit.availability === 'sold' ? 'bg-gray-100 text-gray-700' :
                  unit.availability === 'limited' ? 'bg-amber-100 text-amber-700' :
                  unit.availability === 'booked' ? 'bg-orange-100 text-orange-700' :
                  unit.availability === 'reserved' ? 'bg-purple-100 text-purple-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {unit.availability === 'available' ? 'Available' :
                   unit.availability === 'sold' ? 'Sold' :
                   unit.availability === 'limited' ? 'Limited' :
                   unit.availability === 'booked' ? 'Booked' :
                   unit.availability === 'reserved' ? 'Reserved' :
                   'Coming Soon'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Price:</span>
                  <span className="font-bold text-green-600">{formatUnitPrice(unit.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Carpet Area:</span>
                  <span className="font-medium text-gray-700">{unit.carpetArea?.toLocaleString()} sq.ft.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Built-up Area:</span>
                  <span className="font-medium text-gray-700">{unit.builtUpArea?.toLocaleString()} sq.ft.</span>
                </div>
                {unit.superBuiltUpArea > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Super Built-up:</span>
                    <span className="font-medium text-gray-700">{unit.superBuiltUpArea.toLocaleString()} sq.ft.</span>
                  </div>
                )}
                {unit.floorNumber > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Floor:</span>
                    <span className="font-medium text-gray-700">{unit.floorNumber}</span>
                  </div>
                )}
                {unit.availableUnits > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Available:</span>
                    <span className="font-medium text-green-600">{unit.availableUnits} units</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

{/* Plot Details Section (if property is a plot) */}
{propertyType === 'Plot' && safePlotDetails && (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
      <button
        onClick={() => toggleSection('plotDetails')}
        className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-blue-50 transition-colors"
      >
        <div>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Plot Details
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Land specifications and dimensions
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${
          expandedSections.plotDetails ? 'rotate-180' : ''
        }`} />
      </button>
      
      <div className={`${expandedSections.plotDetails ? 'block' : 'hidden'} px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8`}>
        {/* Plot Pricing Information */}
        {safePlotDetails.prices && safePlotDetails.prices.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Pricing Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {safePlotDetails.prices.map((priceItem, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <p className="text-sm text-green-600 font-semibold mb-1">Price</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(priceItem.amount, priceItem.currency)}
                  </p>
                  {priceItem.perUnit !== 'total' && (
                    <p className="text-xs text-green-600 mt-1">
                      per {priceItem.perUnit === 'sqft' ? 'sq.ft.' : 
                             priceItem.perUnit === 'sqm' ? 'sq.m.' :
                             priceItem.perUnit === 'perSqYard' ? 'sq.yard' :
                             priceItem.perUnit === 'perGround' ? 'ground' : 
                             priceItem.perUnit}
                    </p>
                  )}
                  {priceItem.unitType && (
                    <p className="text-xs text-gray-600 mt-1">
                      Unit Type: {priceItem.unitType}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Area Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Area Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {safePlotDetails.sqft && (
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                <p className="text-sm text-amber-600 font-semibold mb-1">Area (sq.ft.)</p>
                <p className="text-2xl font-bold text-amber-900">{safePlotDetails.sqft.toLocaleString()}</p>
              </div>
            )}
            {safePlotDetails.sqYards && (
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <p className="text-sm text-green-600 font-semibold mb-1">Area (sq.yards)</p>
                <p className="text-2xl font-bold text-green-900">{safePlotDetails.sqYards.toLocaleString()}</p>
              </div>
            )}
            {safePlotDetails.grounds && (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-600 font-semibold mb-1">Area (grounds)</p>
                <p className="text-2xl font-bold text-purple-900">{safePlotDetails.grounds}</p>
              </div>
            )}
            {safePlotDetails.acres && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-600 font-semibold mb-1">Area (acres)</p>
                <p className="text-2xl font-bold text-blue-900">{safePlotDetails.acres}</p>
              </div>
            )}
            {safePlotDetails.cents && (
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                <p className="text-sm text-indigo-600 font-semibold mb-1">Area (cents)</p>
                <p className="text-2xl font-bold text-indigo-900">{safePlotDetails.cents}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Dimensions */}
        {safePlotDetails.dimensions && (safePlotDetails.dimensions.length || safePlotDetails.dimensions.breadth || safePlotDetails.dimensions.frontage) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="font-bold text-gray-900 mb-2">Dimensions</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {safePlotDetails.dimensions.length && (
                <div>
                  <p className="text-sm text-gray-600">Length</p>
                  <p className="font-semibold text-gray-900">{safePlotDetails.dimensions.length} ft</p>
                </div>
              )}
              {safePlotDetails.dimensions.breadth && (
                <div>
                  <p className="text-sm text-gray-600">Breadth</p>
                  <p className="font-semibold text-gray-900">{safePlotDetails.dimensions.breadth} ft</p>
                </div>
              )}
              {safePlotDetails.dimensions.frontage && (
                <div>
                  <p className="text-sm text-gray-600">Frontage</p>
                  <p className="font-semibold text-gray-900">{safePlotDetails.dimensions.frontage} ft</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Plot Characteristics */}
        {(safePlotDetails.shape || safePlotDetails.facing || safePlotDetails.isCornerPlot !== undefined || 
          safePlotDetails.roadWidth || safePlotDetails.roadType || safePlotDetails.landUse || 
          safePlotDetails.developmentStatus || safePlotDetails.soilType) && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Plot Characteristics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {safePlotDetails.shape && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Shape</p>
                  <p className="font-bold text-gray-900 capitalize">{safePlotDetails.shape}</p>
                </div>
              )}
              {safePlotDetails.facing && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Facing</p>
                  <p className="font-bold text-gray-900 capitalize">{safePlotDetails.facing}</p>
                </div>
              )}
              {safePlotDetails.isCornerPlot !== undefined && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Corner Plot</p>
                  <p className="font-bold text-gray-900">{safePlotDetails.isCornerPlot ? 'Yes' : 'No'}</p>
                </div>
              )}
              {safePlotDetails.roadWidth && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Road Width</p>
                  <p className="font-bold text-gray-900">{safePlotDetails.roadWidth} ft</p>
                </div>
              )}
              {safePlotDetails.roadType && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Road Type</p>
                  <p className="font-bold text-gray-900 capitalize">{safePlotDetails.roadType}</p>
                </div>
              )}
              {safePlotDetails.landUse && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Land Use</p>
                  <p className="font-bold text-gray-900 capitalize">{safePlotDetails.landUse}</p>
                </div>
              )}
              {safePlotDetails.developmentStatus && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Development Status</p>
                  <p className="font-bold text-gray-900 capitalize">{safePlotDetails.developmentStatus}</p>
                </div>
              )}
              {safePlotDetails.soilType && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold mb-1">Soil Type</p>
                  <p className="font-bold text-gray-900 capitalize">{safePlotDetails.soilType}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Boundary Details */}
        {(safePlotDetails.boundaryWalls !== undefined || safePlotDetails.fencing !== undefined || 
          safePlotDetails.gate !== undefined || safePlotDetails.elevationAvailable !== undefined) && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Boundary & Structure</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {safePlotDetails.boundaryWalls !== undefined && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Boundary Walls</p>
                  <p className="font-semibold text-gray-900">{safePlotDetails.boundaryWalls ? '✓ Available' : '✗ Not Available'}</p>
                </div>
              )}
              {safePlotDetails.fencing !== undefined && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Fencing</p>
                  <p className="font-semibold text-gray-900">{safePlotDetails.fencing ? '✓ Available' : '✗ Not Available'}</p>
                </div>
              )}
              {safePlotDetails.gate !== undefined && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Gate</p>
                  <p className="font-semibold text-gray-900">{safePlotDetails.gate ? '✓ Available' : '✗ Not Available'}</p>
                </div>
              )}
              {safePlotDetails.elevationAvailable !== undefined && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Elevation Available</p>
                  <p className="font-semibold text-gray-900">{safePlotDetails.elevationAvailable ? '✓ Yes' : '✗ No'}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Amenities */}
        {safePlotDetails.amenities && safePlotDetails.amenities.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Plot Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {safePlotDetails.amenities.map((amenity, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Utilities */}
        {safePlotDetails.utilities && Object.values(safePlotDetails.utilities).some(v => v === true) && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Utilities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {safePlotDetails.utilities.electricity && (
                <span className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <Zap className="w-3 h-3" /> Electricity
                </span>
              )}
              {safePlotDetails.utilities.waterConnection && (
                <span className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <Droplets className="w-3 h-3" /> Water Connection
                </span>
              )}
              {safePlotDetails.utilities.sewageConnection && (
                <span className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <Waves className="w-3 h-3" /> Sewage Connection
                </span>
              )}
              {safePlotDetails.utilities.gasConnection && (
                <span className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <Flame className="w-3 h-3" /> Gas Connection
                </span>
              )}
              {safePlotDetails.utilities.internetFiber && (
                <span className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  <Wifi className="w-3 h-3" /> Internet Fiber
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Approval Details */}
        {safePlotDetails.approvalDetails && Object.values(safePlotDetails.approvalDetails).some(v => v === true || v) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="font-bold text-gray-900 mb-2">Approval Details</p>
            <div className="space-y-2">
              {safePlotDetails.approvalDetails.dtcpApproved && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">DTCP Approved</span>
                  {safePlotDetails.approvalDetails.dtcpNumber && (
                    <span className="text-xs text-gray-500">({safePlotDetails.approvalDetails.dtcpNumber})</span>
                  )}
                </div>
              )}
              {safePlotDetails.approvalDetails.layoutApproved && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Layout Approved</span>
                  {safePlotDetails.approvalDetails.layoutNumber && (
                    <span className="text-xs text-gray-500">({safePlotDetails.approvalDetails.layoutNumber})</span>
                  )}
                </div>
              )}
              {safePlotDetails.approvalDetails.subdivisionApproved && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Subdivision Approved</span>
                </div>
              )}
              {safePlotDetails.approvalDetails.surveyNumber && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Survey Number: {safePlotDetails.approvalDetails.surveyNumber}</span>
                </div>
              )}
              {safePlotDetails.approvalDetails.pattaNumber && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Patta Number: {safePlotDetails.approvalDetails.pattaNumber}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

      {/* Rental Details Section (if property is for rent/lease) */}
      {(listingType === 'rent' || listingType === 'lease') && safeRentalDetails && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
            <button
              onClick={() => toggleSection('rentalDetails')}
              className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-blue-50 transition-colors"
            >
              <div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  Rental Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Lease terms and payment information
                </p>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${
                expandedSections.rentalDetails ? 'rotate-180' : ''
              }`} />
            </button>
            
            <div className={`${expandedSections.rentalDetails ? 'block' : 'hidden'} px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {safeRentalDetails.monthlyRent && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Monthly Rent</p>
                    <p className="text-2xl font-bold text-blue-900">{formatPrice(safeRentalDetails.monthlyRent)}</p>
                  </div>
                )}
                {safeRentalDetails.securityDeposit && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <p className="text-sm text-purple-600 font-semibold mb-1">Security Deposit</p>
                    <p className="text-2xl font-bold text-purple-900">{formatPrice(safeRentalDetails.securityDeposit)}</p>
                  </div>
                )}
                {safeRentalDetails.maintenanceCharges && (
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-600 font-semibold mb-1">Maintenance Charges</p>
                    <p className="text-2xl font-bold text-amber-900">{formatPrice(safeRentalDetails.maintenanceCharges)}</p>
                  </div>
                )}
                {safeRentalDetails.leaseTerms && (
                  <div className="col-span-full p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Lease Terms</p>
                    <p className="text-gray-800">{safeRentalDetails.leaseTerms}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Tour Section */}
      {virtualTour && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
            <div className="p-4 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                Virtual Tour
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={virtualTour}
                  className="w-full h-full"
                  allowFullScreen
                  title="Virtual Tour"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floor Plan Section */}
      {floorPlan && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
            <div className="p-4 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                Floor Plan
              </h2>
              <img
                src={floorPlan}
                alt="Floor Plan"
                className="w-full rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}
            {/* Description */}
            {description && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Property Description
                </h2>
                <p className="text-gray-700 leading-relaxed font-medium tracking-wide text-sm sm:text-lg">
                  {description}
                </p>
              </div>
            )}

            {/* Building Details */}
            {safeBuildingDetails && Object.keys(safeBuildingDetails).length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('buildingDetails')}
                  className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-blue-50 transition-colors"
                >
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Building Details
                  </h2>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedSections.buildingDetails ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <div className={`${expandedSections.buildingDetails ? 'block' : 'hidden'} px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {safeBuildingDetails.name && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Building Name</p>
                          <p className="text-gray-700">{safeBuildingDetails.name}</p>
                        </div>
                      </div>
                    )}
                    {safeBuildingDetails.totalFloors > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Total Floors</p>
                          <p className="text-gray-700">{safeBuildingDetails.totalFloors}</p>
                        </div>
                      </div>
                    )}
                    {safeBuildingDetails.totalUnits > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Total Units</p>
                          <p className="text-gray-700">{safeBuildingDetails.totalUnits}</p>
                        </div>
                      </div>
                    )}
                    {safeBuildingDetails.yearBuilt > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Year Built</p>
                          <p className="text-gray-700">{safeBuildingDetails.yearBuilt}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {safeBuildingDetails.amenities?.length > 0 && (
                    <div className="mt-4">
                      <p className="font-bold text-gray-900 mb-3">Building Amenities</p>
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

            {/* Unit Features */}
            {safeUnitFeatures.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-100/80 overflow-hidden backdrop-blur-sm relative group">
                <button
                  onClick={() => toggleSection('features')}
                  className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-gray-50 transition-colors lg:hidden"
                >
                  <div>
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                      Features & Amenities
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {safeUnitFeatures.length} premium features
                    </p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedSections.features ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <div className="hidden lg:block">
                  <div className="px-5 sm:px-7 md:px-9 pt-6 sm:pt-8">
                    <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                      Features & Amenities
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {safeUnitFeatures.length} premium features
                    </p>
                  </div>
                </div>
                
                <div className={`${expandedSections.features ? 'block' : 'hidden'} lg:block transition-all duration-500 ease-in-out relative z-10`}>
                  <div className="px-5 sm:px-7 md:px-9 pb-7 sm:pb-8 md:pb-10">
                    <div className="flex items-center gap-2 mb-6 sm:mb-8">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                        {safeUnitFeatures.length} Premium Amenities
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                      {(showAllFeatures ? safeUnitFeatures : safeUnitFeatures.slice(0, 10)).map((feature, index) => {
                        const premiumGradients = [
                          "from-amber-800/80 to-amber-700/70",
                          "from-rose-800/80 to-rose-700/70",
                          "from-indigo-800/80 to-indigo-700/70",
                          "from-emerald-800/80 to-emerald-700/70",
                          "from-slate-800/80 to-slate-700/70",
                          "from-stone-800/80 to-stone-700/70",
                          "from-teal-800/80 to-teal-700/70",
                          "from-purple-800/80 to-purple-700/70",
                          "from-cyan-800/80 to-cyan-700/70",
                          "from-pink-800/80 to-pink-700/70",
                          "from-blue-800/80 to-blue-700/70",
                          "from-orange-800/80 to-orange-700/70",
                        ];
                        
                        const gradientColor = premiumGradients[index % premiumGradients.length];
                        const baseColor = gradientColor.split(' ')[0].replace('from-', '').split('/')[0];
                        
                        return (
                          <div
                            key={index}
                            className="group/feature relative"
                            style={{
                              animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                            }}
                          >
                            <div className="relative bg-white rounded-xl sm:rounded-2xl border border-gray-200/60 hover:border-gray-300/80 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                              <div className={`absolute inset-0 bg-gradient-to-br from-${baseColor}-50/0 via-${baseColor}-50/0 to-${baseColor}-50/0 group-hover/feature:from-${baseColor}-50/30 group-hover/feature:via-${baseColor}-50/20 group-hover/feature:to-${baseColor}-50/10 transition-all duration-700`}></div>
                              <div className="absolute inset-0 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-1000">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/feature:translate-x-full transition-transform duration-1500"></div>
                              </div>
                              <div className="relative p-3 sm:p-4 md:p-5 flex flex-col items-center">
                                <div className="relative mb-2 sm:mb-3">
                                  <div className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${gradientColor} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-${baseColor}-900/20 group-hover/feature:shadow-xl group-hover/feature:shadow-${baseColor}-900/30 transition-all duration-500 transform group-hover/feature:scale-105`}>
                                    <div className="text-white/90 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-7 sm:[&>svg]:h-7 md:[&>svg]:w-8 md:[&>svg]:h-8">
                                      {getFeatureIcon(feature)}
                                    </div>
                                  </div>
                                  <div className={`absolute -inset-1 bg-gradient-to-br ${gradientColor} rounded-xl sm:rounded-2xl blur-md opacity-0 group-hover/feature:opacity-20 transition-opacity duration-500`}></div>
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-amber-300/80 to-amber-500/80 rounded-full opacity-0 group-hover/feature:opacity-100 transition-opacity duration-500 shadow-lg"></div>
                                </div>
                                <span className="font-medium text-gray-600 tracking-wide text-[10px] sm:text-xs md:text-sm text-center line-clamp-2 group-hover/feature:text-gray-900 transition-colors duration-300">
                                  {feature}
                                </span>
                                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-${baseColor}-400/60 rounded-full opacity-0 group-hover/feature:opacity-100 transition-all duration-300 scale-0 group-hover/feature:scale-100`}></div>
                              </div>
                            </div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900/90 text-white/90 text-[10px] sm:text-xs rounded opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20 shadow-xl backdrop-blur-sm">
                              {feature}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {safeUnitFeatures.length > 10 && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setShowAllFeatures(!showAllFeatures)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
                        >
                          {showAllFeatures ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Show All {safeUnitFeatures.length} Features
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              </div>
            )}

            {/* Common Specifications */}
            {safeCommonSpecifications && Object.keys(safeCommonSpecifications).length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {safeCommonSpecifications.furnishing && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      <div>
                        <p className="font-bold text-gray-900">Furnishing</p>
                        <p className="text-gray-700 capitalize">{safeCommonSpecifications.furnishing}</p>
                      </div>
                    </div>
                  )}
                  {safeCommonSpecifications.possessionStatus && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <Key className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      <div>
                        <p className="font-bold text-gray-900">Possession Status</p>
                        <p className="text-gray-700 capitalize">{safeCommonSpecifications.possessionStatus.replace('-', ' ')}</p>
                      </div>
                    </div>
                  )}
                  {safeCommonSpecifications.ageOfProperty > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      <div>
                        <p className="font-bold text-gray-900">Age of Property</p>
                        <p className="text-gray-700">{safeCommonSpecifications.ageOfProperty} years</p>
                      </div>
                    </div>
                  )}
                  {safeCommonSpecifications.parking && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <Car className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      <div>
                        <p className="font-bold text-gray-900">Parking</p>
                        <p className="text-gray-700">
                          {safeCommonSpecifications.parking.covered > 0 && `${safeCommonSpecifications.parking.covered} Covered`}
                          {safeCommonSpecifications.parking.covered > 0 && safeCommonSpecifications.parking.open > 0 && ' + '}
                          {safeCommonSpecifications.parking.open > 0 && `${safeCommonSpecifications.parking.open} Open`}
                          {safeCommonSpecifications.parking.covered === 0 && safeCommonSpecifications.parking.open === 0 && 'None'}
                        </p>
                      </div>
                    </div>
                  )}
                  {safeCommonSpecifications.kitchenType && safeCommonSpecifications.kitchenType !== 'regular' && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      <div>
                        <p className="font-bold text-gray-900">Kitchen Type</p>
                        <p className="text-gray-700 capitalize">{safeCommonSpecifications.kitchenType}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Nearby */}
            {safeLocationNearby.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('locationNearby')}
                  className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-blue-50 transition-colors"
                >
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Nearby Locations
                  </h2>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedSections.locationNearby ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <div className={`${expandedSections.locationNearby ? 'block' : 'hidden'} px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {safeLocationNearby.map((location, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                          {getLocationNearbyIcon(location.type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{location.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            <span className="text-sm text-gray-600">{location.distance}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Legal Details */}
            {safeLegalDetails && Object.keys(safeLegalDetails).length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('legalDetails')}
                  className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-blue-50 transition-colors"
                >
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Legal Details
                  </h2>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedSections.legalDetails ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <div className={`${expandedSections.legalDetails ? 'block' : 'hidden'} px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {safeLegalDetails.reraRegistered !== undefined && (
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                        {safeLegalDetails.reraRegistered ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                        )}
                        <div>
                          <p className="font-bold text-gray-900">RERA Registered</p>
                          <p className="text-gray-700">{safeLegalDetails.reraRegistered ? 'Yes' : 'No'}</p>
                          {safeLegalDetails.reraNumber && (
                            <p className="text-xs text-gray-500 mt-1">RERA: {safeLegalDetails.reraNumber}</p>
                          )}
                          {safeLegalDetails.reraWebsiteLink && (
                            <a 
                              href={safeLegalDetails.reraWebsiteLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                            >
                              View RERA Details
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.sanctioningAuthority && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <FileTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Sanctioning Authority</p>
                          <p className="text-gray-700">{safeLegalDetails.sanctioningAuthority}</p>
                          {safeLegalDetails.sanctionNumber && (
                            <p className="text-xs text-gray-500 mt-1">Sanction No: {safeLegalDetails.sanctionNumber}</p>
                          )}
                          {safeLegalDetails.sanctionDate && (
                            <p className="text-xs text-gray-500">Date: {formatDate(safeLegalDetails.sanctionDate)}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.khataStatus && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <FileTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Khata Status</p>
                          <p className="text-gray-700">{safeLegalDetails.khataStatus}</p>
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.clearTitle !== undefined && (
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                        {safeLegalDetails.clearTitle ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                        )}
                        <div>
                          <p className="font-bold text-gray-900">Clear Title</p>
                          <p className="text-gray-700">{safeLegalDetails.clearTitle ? 'Yes' : 'Verification Required'}</p>
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.ownershipType && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Ownership Type</p>
                          <p className="text-gray-700 capitalize">{safeLegalDetails.ownershipType.replace('-', ' ')}</p>
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.motherDeedAvailable !== undefined && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <FileTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Mother Deed</p>
                          <p className="text-gray-700">{safeLegalDetails.motherDeedAvailable ? 'Available' : 'Not Available'}</p>
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.conversionCertificate !== undefined && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Conversion Certificate</p>
                          <p className="text-gray-700">{safeLegalDetails.conversionCertificate ? 'Available' : 'Not Available'}</p>
                          {safeLegalDetails.conversionType && (
                            <p className="text-xs text-gray-500 mt-1">Type: {safeLegalDetails.conversionType}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.encumbranceCertificate && (
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        <div>
                          <p className="font-bold text-gray-900">Encumbrance Certificate</p>
                          <p className="text-gray-700">
                            Available {safeLegalDetails.encumbranceYears && `(Last ${safeLegalDetails.encumbranceYears} years)`}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.occupancyCertificate && (
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        <div>
                          <p className="font-bold text-gray-900">Occupancy Certificate</p>
                          <p className="text-gray-700">
                            Available
                            {safeLegalDetails.occupancyCertificateNumber && ` (${safeLegalDetails.occupancyCertificateNumber})`}
                          </p>
                          {safeLegalDetails.occupancyCertificateDate && (
                            <p className="text-xs text-gray-500 mt-1">Date: {formatDate(safeLegalDetails.occupancyCertificateDate)}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.commencementCertificate && (
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        <div>
                          <p className="font-bold text-gray-900">Commencement Certificate</p>
                          <p className="text-gray-700">
                            Available
                            {safeLegalDetails.commencementCertificateNumber && ` (${safeLegalDetails.commencementCertificateNumber})`}
                          </p>
                          {safeLegalDetails.commencementCertificateDate && (
                            <p className="text-xs text-gray-500 mt-1">Date: {formatDate(safeLegalDetails.commencementCertificateDate)}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.bankApprovals && safeLegalDetails.bankApprovals.length > 0 && (
                      <div className="col-span-1 sm:col-span-2">
                        <p className="font-bold text-gray-900 mb-3">Bank Approvals</p>
                        <div className="flex flex-wrap gap-2">
                          {safeLegalDetails.bankApprovals.map((bank, index) => (
                            <div key={index} className="inline-flex flex-col items-start gap-1 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                              <span className="flex items-center gap-1">
                                <Banknote className="w-3 h-3" />
                                {bank.bankName}
                              </span>
                              {bank.approvalDate && (
                                <span className="text-xs text-green-600">Approved: {formatDate(bank.approvalDate)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {safeLegalDetails.legalStatusSummary && (
                      <div className="col-span-1 sm:col-span-2">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="font-bold text-gray-900 mb-2">Legal Summary</p>
                          <p className="text-gray-700 text-sm">{safeLegalDetails.legalStatusSummary}</p>
                          {safeLegalDetails.legalVerified && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                              <BadgeCheck className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700 font-medium">
                                Legally Verified on {formatDate(safeLegalDetails.legalVerificationDate)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Owner Details */}
            {/* {safeOwnerDetails && Object.keys(safeOwnerDetails).length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('ownerDetails')}
                  className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-blue-50 transition-colors"
                >
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Owner Details
                  </h2>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${
                    expandedSections.ownerDetails ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <div className={`${expandedSections.ownerDetails ? 'block' : 'hidden'} px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {safeOwnerDetails.name && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Owner Name</p>
                          <p className="text-gray-700">{safeOwnerDetails.name}</p>
                        </div>
                      </div>
                    )}
                    {safeOwnerDetails.phoneNumber && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Contact Number</p>
                          <p className="text-gray-700">{safeOwnerDetails.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    {safeOwnerDetails.email && (
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-900">Email</p>
                          <p className="text-gray-700">{safeOwnerDetails.email}</p>
                        </div>
                      </div>
                    )}
                    {safeOwnerDetails.reasonForSelling && (
                      <div className="col-span-1 sm:col-span-2">
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-bold text-gray-900">Reason for Selling</p>
                            <p className="text-gray-700">{safeOwnerDetails.reasonForSelling}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )} */}

            {/* Location & Map */}
            {embedUrl && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Location
                </h2>
                
                <div className="rounded-xl overflow-hidden shadow-lg mb-4 sm:mb-6 border border-blue-200">
                  <iframe
                    width="100%"
                    height="250"
                    className="sm:h-[250px] md:h-[300px]"
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
                  </div>
                  
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base w-full lg:w-auto"
                  >
                    <Navigation className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Open in Maps</span>
                    <span className="sm:hidden">Maps</span>
                  </a>
                </div>
              </div>
            )}

            {/* BOOK YOUR APPOINTMENT CARD - Desktop Version */}
            <div className="hidden sm:block bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 md:p-8 border-2 border-green-200">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Schedule a Property Viewing
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Book an appointment to visit this property in person. Select your preferred date and time.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <CalendarIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Select Date</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Choose Time</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Send via WhatsApp</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleBookAppointment}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-lg flex items-center justify-center gap-3 whitespace-nowrap"
                >
                  <CalendarIcon className="w-5 h-5" />
                  Book Your Appointment
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Info */}
          <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-blue-200">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Contact Information
                </h3>
                
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
                      <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl">
                        {createdBy?.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">
                          Property Contact
                        </p>
                        <p className="font-bold text-base sm:text-xl text-gray-900 tracking-tight">
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
                          <span className="hidden sm:inline">Message on WhatsApp</span>
                          <span className="sm:hidden">WhatsApp</span>
                        </button>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl border-2 border-blue-300 text-center">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <Lock className="w-6 h-6 sm:w-9 sm:h-9 md:w-10 md:h-10 text-blue-600" />
                    </div>
                    <h4 className="text-base sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">
                      Sign In Required
                    </h4>
                    <p className="text-gray-600 mb-4 sm:mb-6 font-medium tracking-wide leading-relaxed text-sm sm:text-base">
                      Sign in to access contact details
                    </p>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <button 
                        onClick={() => navigate('/login', { state: { from: `/property-units/${id}` } })}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-bold tracking-wide text-sm sm:text-base"
                      >
                        Sign In
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
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Property Stats
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                    <span className="font-bold text-gray-700 tracking-wide text-sm sm:text-base mb-1">
                      Property ID
                    </span>
                    <span className="font-bold text-blue-600 text-sm sm:text-base">
                      #{id?.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                    <span className="font-bold text-gray-700 tracking-wide text-sm sm:text-base mb-1">
                      Views
                    </span>
                    <span className="font-bold text-blue-600 text-sm sm:text-base">
                      {viewCount || 0}
                    </span>
                  </div>
                  <div className="flex flex-col p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                    <span className="font-bold text-gray-700 tracking-wide text-sm sm:text-base mb-1">
                      Total Units
                    </span>
                    <span className="font-bold text-blue-600 text-sm sm:text-base">
                      {totalUnitTypes || 0}
                    </span>
                  </div>
                  <div className="flex flex-col p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                    <span className="font-bold text-gray-700 tracking-wide text-sm sm:text-base mb-1">
                      Available Units
                    </span>
                    <span className="font-bold text-blue-600 text-sm sm:text-base">
                      {availableUnitTypesCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Viewing Schedule */}
              {safeViewingSchedule && safeViewingSchedule.length > 0 && (
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-blue-200">
                  <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                    Viewing Schedule
                  </h3>
                  <div className="space-y-3">
                    {safeViewingSchedule.map((slot, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarIcon className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-gray-900">{formatDate(slot.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">{slot.startTime} - {slot.endTime}</span>
                        </div>
                        {slot.slotsAvailable > 0 && (
                          <p className="text-xs text-green-600 mt-1">{slot.slotsAvailable} slots available</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <FeaturedProperties/>
      <PossessionTimeline/>
      <Footer />
    </div>
  );
}