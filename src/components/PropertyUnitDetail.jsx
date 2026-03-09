// PropertyUnitDetail.jsx - Updated with all requested changes
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
// Add this line
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
  const fullscreenRef = useRef(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for mobile expand/collapse
  const [expandedSections, setExpandedSections] = useState({
    features: true,
    specifications: true,
    amenities: true,
    buildingDetails: true
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
    // Prevent scrolling on body when fullscreen is open
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
        
      //("Fetching property unit with ID:", id);
        const response = await propertyUnitAPI.getPropertyUnit(id);
        
      //("API Response:", response);
        
        if (response.data.success) {
        //("Property unit data:", response.data.data);
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
    // Auto-proceed to WhatsApp after time selection
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
      price,
      description,
      unitNumber,
      propertyType,
      specifications
    } = propertyUnit;

    // Format selected date
    const appointmentDate = formatDateForDisplay(selectedDate);
    
    // Create the WhatsApp message
    let message = `*📅 PROPERTY VIEWING APPOINTMENT REQUEST*\n\n`;
    message += `*Property Details:*\n`;
    message += `🏢 *${title}*${unitNumber ? ` #${unitNumber}` : ''}\n`;
    message += `📍 ${address}, ${city}\n`;
    message += `💰 ${formatPrice(price)}\n`;
    message += `📐 ${propertyType}\n`;
    
    if (specifications?.bedrooms > 0) {
      message += `🛏️ ${specifications.bedrooms} BHK\n`;
    }
    
    if (specifications?.carpetArea > 0) {
      message += `📏 ${specifications.carpetArea.toLocaleString()} sq.ft.\n`;
    }
    
    message += `\n`;
    message += `*Appointment Details:*\n`;
    message += `📅 Date: ${appointmentDate}\n`;
    message += `⏰ Time: ${selectedTime}\n`;
    message += `\n`;
    message += `*Client Information:*\n`;
    message += `👤 Name: ${user?.name || 'Not specified'}\n`;
    message += `📧 Email: ${user?.email || 'Not specified'}\n`;
    message += `📱 Phone: ${user?.phoneNumber || 'Not specified'}\n`;
    message += `\n`;
    message += `_This appointment request was sent via Property Portal_\n`;
    message += `Property URL: ${window.location.href}`;

    // Clean phone number (remove non-numeric characters)
    const agentPhoneNumber = propertyUnit?.createdBy?.phoneNumber || "";
    const cleanPhoneNumber = agentPhoneNumber.replace(/\D/g, '');
    
    if (!cleanPhoneNumber) {
      alert('Agent phone number not available');
      return;
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/9019067239?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    // Close modal
    setShowBookingModal(false);
    setSelectedDate("");
    setSelectedTime("");
    setBookingStep(1);
    
    // Show confirmation message
    alert(`Appointment request sent to WhatsApp!\n\nDate: ${appointmentDate}\nTime: ${selectedTime}`);
  };

  // Format price with null checks
const formatPrice = (price) => {
  if (!price) return "Price on request";
  
  try {
    let amount = 0;
    let currency = '₹';
    
    // Helper function to extract numeric value from string with commas
    const extractNumericValue = (str) => {
      if (!str) return 0;
      
      // Check for special cases
      const lowerStr = str.toString().toLowerCase().trim();
      if (lowerStr.includes('price on request') || 
          lowerStr.includes('contact for price') ||
          lowerStr.includes('negotiable') ||
          lowerStr === 'on request') {
        return null; // Special marker
      }
      
      // Remove currency symbols, spaces, and other non-numeric characters except commas, dots, and minus
      let cleanStr = str.toString()
        .replace(/[₹$,€£\s]/g, '')  // Remove currency symbols
        .replace(/[^\d,.-]/g, '');  // Keep only digits, commas, dots, and minus
      
      // If string contains commas, remove them for parsing
      cleanStr = cleanStr.replace(/,/g, '');
      
      // Parse as float
      const parsed = parseFloat(cleanStr);
      return isNaN(parsed) ? 0 : parsed;
    };
    
    // Extract amount from different price formats
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
      // Handle comma-separated values
      if (price.includes(',')) {
        amount = extractNumericValue(price);
        if (amount === null) return "Price on request";
      } else {
        // Try to parse normally
        const parsed = parseFloat(price.replace(/[^0-9.-]+/g, ""));
        amount = isNaN(parsed) ? 0 : parsed;
      }
    }
    
    // If amount is 0, NaN, or invalid
    if (!amount || isNaN(amount) || amount <= 0) return "Price on request";
    
    // Format number to words with proper Indian numbering system
    const formatToIndianWords = (num) => {
      const crore = 10000000;
      const lakh = 100000;
      const thousand = 1000;
      
      // Format function to remove trailing zeros
      const cleanNumber = (n) => {
        const str = n.toFixed(2);
        return str.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
      };
      
      // For crores with lakhs
      if (num >= crore) {
        const crores = num / crore;
        const croresInt = Math.floor(crores);
        const croresDecimal = crores - croresInt;
        
        if (croresDecimal === 0) {
          // Whole crores
          return `${croresInt.toLocaleString('en-IN')} Crore${croresInt > 1 ? 's' : ''}`;
        } else {
          // Crores with decimal
          return `${cleanNumber(crores)} Crore`;
        }
      }
      
      // For lakhs
      if (num >= lakh) {
        const lakhs = num / lakh;
        const lakhsInt = Math.floor(lakhs);
        const lakhsDecimal = lakhs - lakhsInt;
        
        if (lakhsDecimal === 0) {
          // Whole lakhs
          return `${lakhsInt.toLocaleString('en-IN')} Lakh${lakhsInt > 1 ? 's' : ''}`;
        } else {
          // Lakhs with decimal (like 1.50 Lakh)
          return `${cleanNumber(lakhs)} Lakh`;
        }
      }
      
      // For thousands
      if (num >= thousand) {
        const thousands = num / thousand;
        if (thousands % 1 === 0) {
          return `${thousands.toLocaleString('en-IN')} Thousand`;
        } else {
          return `${cleanNumber(thousands)} Thousand`;
        }
      }
      
      // For amounts less than 1000
      return `${num.toLocaleString('en-IN')}`;
    };
    
    const formatted = formatToIndianWords(amount);
    return `${currency} ${formatted}`;
    
  } catch (err) {
    console.error("Error formatting price:", err);
    return "Price on request";
  }
};

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
  const featureIcons = {
    // ... (keep your existing featureIcons object)
  };

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
          
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg flex items-center gap-1 sm:gap-2">
            {listingType === 'sale' ? '💰' : '🔑'}
            <span className="hidden sm:inline">{listingType === 'sale' ? 'For Sale' : 'For Rent'}</span>
          </span>

          <span className={`bg-gradient-to-r ${
            availability === 'available' ? 'from-emerald-500 to-teal-500' :
            availability === 'sold' ? 'from-slate-600 to-slate-700' :
            availability === 'rented' ? 'from-blue-500 to-cyan-500' :
            'from-amber-500 to-orange-500'
          } text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg`}>
            {availability === 'available' ? '✨ Available Now' : 
             availability === 'sold' ? '⭐ Sold' : 
             availability === 'rented' ? '🔐 Rented' : 
             '⚡ Under Negotiation'}
          </span>
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-lg flex items-center gap-1 sm:gap-2">
            {getPropertyTypeIcon(propertyType)}
            <span className="hidden sm:inline">{propertyType}</span>
          </span>
        </div>
        
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
          {title || "Untitled Property"}
          {unitNumber && (
            <span className="text-indigo-600 ml-2 text-base sm:text-xl font-medium">#{unitNumber}</span>
          )}
        </h1>
        
        <div className="flex items-center gap-2 sm:gap-3 text-indigo-600 mb-4 sm:mb-6">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-lg font-medium tracking-wide">
            {fullAddress || `${address || ''}${address && city ? ', ' : ''}${city || ''}` || "Location not specified"}
          </span>
        </div>

        {/* Mobile: Compact unit specifications with new design */}
        <div className="sm:hidden">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {safeSpecifications.bedrooms > 0 && (
              <div className="flex flex-col items-center p-2 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200 shadow-sm">
                <Bed className="w-6 h-6 text-indigo-600 mb-1" />
                <span className="text-lg font-bold text-indigo-900">{safeSpecifications.bedrooms}</span>
                <span className="text-xs text-indigo-700 font-medium">Beds</span>
              </div>
            )}
            {safeSpecifications.bathrooms > 0 && (
              <div className="flex flex-col items-center p-2 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 shadow-sm">
                <Bath className="w-6 h-6 text-purple-600 mb-1" />
                <span className="text-lg font-bold text-purple-900">{safeSpecifications.bathrooms}</span>
                <span className="text-xs text-purple-700 font-medium">Baths</span>
              </div>
            )}
            {safeSpecifications.carpetArea > 0 && (
              <div className="flex flex-col items-center p-2 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 shadow-sm">
                <Maximize className="w-6 h-6 text-amber-600 mb-1" />
                <span className="text-lg font-bold text-amber-900">{safeSpecifications.carpetArea.toLocaleString()}</span>
                <span className="text-xs text-amber-700 font-medium">Sq.ft</span>
              </div>
            )}
            {safeSpecifications.floorNumber > 0 && (
              <div className="flex flex-col items-center p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 shadow-sm">
                <Layers className="w-6 h-6 text-emerald-600 mb-1" />
                <span className="text-lg font-bold text-emerald-900">{safeSpecifications.floorNumber}</span>
                <span className="text-xs text-emerald-700 font-medium">Floor</span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Redesigned unit specifications with unique styling */}
        <div className="hidden sm:flex flex-wrap gap-3 sm:gap-4 md:gap-6">
          {safeSpecifications.bedrooms > 0 && (
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl border border-indigo-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-indigo-900">
                  {safeSpecifications.bedrooms}
                </p>
                <p className="text-xs sm:text-sm text-indigo-700 font-semibold">
                  Bedrooms
                </p>
              </div>
            </div>
          )}

          {safeSpecifications.bathrooms > 0 && (
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Bath className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">
                  {safeSpecifications.bathrooms}
                </p>
                <p className="text-xs sm:text-sm text-purple-700 font-semibold">
                  Bathrooms
                </p>
              </div>
            </div>
          )}

          {safeSpecifications.carpetArea > 0 && (
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Maximize className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-amber-900">
                  {safeSpecifications.carpetArea.toLocaleString()} <span className="text-sm">sq.ft</span>
                </p>
                <p className="text-xs sm:text-sm text-amber-700 font-semibold">
                  Carpet Area
                </p>
              </div>
            </div>
          )}

          {safeSpecifications.floorNumber > 0 && (
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                  {safeSpecifications.floorNumber}
                </p>
                <p className="text-xs sm:text-sm text-emerald-700 font-semibold">
                  Floor
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 sm:mt-0 lg:text-right">
        {/* Premium Pricing Card - Unique variation */}
        <div className="hidden md:block max-w-sm w-full group perspective">
          {/* Pricing Header - Unique gradient with pattern */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-t-xl sm:rounded-t-2xl p-5 sm:p-7 relative overflow-hidden">
            {/* Unique pattern overlay - different from original */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                    Premium Listing
                  </span>
                </div>
                <div className="px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/30">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {listingType === 'sale' ? 'EXCLUSIVE' : listingType === 'rent' ? 'AVAILABLE' : 'LEASE'}
                  </span>
                </div>
              </div>
              
              {/* Main Price with unique gradient */}
              <div className="relative">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                    {formatPrice(price)}
                  </span>
                </div>
                {/* Unique decorative element */}
                <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
              </div>
              
              {/* Property Type Indicator - Unique styling */}
              <div className="mt-4 flex items-center justify-end">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <Verified className="w-3 h-3 text-indigo-300" />
                  <span className="text-xs font-medium text-white/90">
                    {propertyType} • Premium
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Details - Unique card design */}
          <div className="bg-gradient-to-b from-white to-indigo-50/30 rounded-b-xl sm:rounded-b-2xl border border-indigo-100 shadow-xl shadow-indigo-900/5">
            <div className="p-5 sm:p-7 space-y-4">
              {/* Price per sq.ft - Unique styling */}
              {safeSpecifications.carpetArea > 0 && price?.amount && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-50/70 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-all hover:shadow-md group/item">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover/item:scale-110 transition-transform">
                      <Maximize className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Price Breakdown</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(price.amount / safeSpecifications.carpetArea).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        <span className="text-sm font-medium text-gray-600 ml-1">/sq.ft</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-1 h-10 bg-gradient-to-b from-indigo-400 to-purple-600 rounded-full"></div>
                </div>
              )}

              {/* Maintenance Charges - Unique styling */}
              {maintenanceCharges > 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-50/70 rounded-xl border border-purple-200 hover:border-purple-300 transition-all hover:shadow-md group/item">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md group-hover/item:scale-110 transition-transform">
                      <Building className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Maintenance</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{maintenanceCharges.toLocaleString('en-IN')}
                        <span className="text-sm font-medium text-gray-600 ml-1">/month</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-1 h-10 bg-gradient-to-b from-purple-400 to-pink-600 rounded-full"></div>
                </div>
              )}

              {/* Security Deposit - Unique styling */}
              {securityDeposit > 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-50/70 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-all hover:shadow-md group/item">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover/item:scale-110 transition-transform">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Security Deposit</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{securityDeposit.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="w-1 h-10 bg-gradient-to-b from-indigo-400 to-blue-600 rounded-full"></div>
                </div>
              )}

              {/* Call to Action - Unique design */}
              <div className="pt-4">
                <button 
                  onClick={handleBookAppointment}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <CalendarIcon className="w-5 h-5" />
                    <span className="tracking-wide">Schedule Viewing</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  {/* Unique shine effect with double gradient */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <div className="absolute inset-0 translate-x-full group-hover:-translate-x-full transition-transform duration-1000 bg-gradient-to-l from-transparent via-white/10 to-transparent"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

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
            {/* Modal Header */}
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
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${bookingStep === 1 ? 'bg-green-600' : 'bg-green-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${bookingStep === 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {bookingStep === 1 ? (
                // Date Selection
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
                // Time Selection
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

            {/* Modal Footer */}
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

      {/* FULLSCREEN IMAGE VIEWER */}
      {showFullscreenImage && (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeFullscreenImage}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
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

            {/* Zoom controls */}
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

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              {fullscreenImageIndex + 1} / {safeImages.length}
            </div>

       {/* Watermark */}
<div className="absolute bottom-70 left-1/2 -translate-x-1/2 z-10 text-white/50 text-4xl font-bold tracking-wider pointer-events-none">
  cleartitle1
</div>

            {/* Image container */}
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
                {/* Main Image Container - Maintain aspect ratio */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer"
     onClick={() => openFullscreenImage(selectedImage)}>
  {/* REMOVED forced aspect ratio - Images display in original size */}
  <div className="relative w-full max-h-[600px] overflow-hidden">
    <img
      src={safeImages[selectedImage]?.url || "https://via.placeholder.com/600x400"}
      alt={title}
      className="w-full h-auto max-h-[600px] object-contain bg-gray-100"
    />
                    {/* Watermark overlay */}
             {/* Watermark overlay */}
{/* Watermark overlay - DARKER for better download protection */}
<div className="absolute inset-0 pointer-events-none flex items-center justify-center">
  <div className="text-black/60 text-7xl font-bold tracking-wider rotate-[-30deg] opacity-70">
    cleartitle1
  </div>
</div>         
                    {/* Fullscreen button */}
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
                
                {/* Thumbnail Grid - Mobile compact */}
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
                          {/* Watermark on thumbnails */}
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="text-white/20 text-xs font-bold tracking-wider opacity-50">
                              ct1
                            </div>
                          </div>
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
  <div className=" md:hidden max-w-sm w-full group">
    {/* Pricing Header - Professional Real Estate Gradient */}
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-t-xl sm:rounded-t-2xl p-5 sm:p-7 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px'
        }}></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-white/90 uppercase tracking-[0.15em]">
              Clear Title Value
            </span>
          </div>
          <div className="px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/30">
            <span className="text-xs font-bold text-white tracking-wide">
              {listingType === 'sale' ? 'FOR SALE' : listingType === 'rent' ? 'FOR RENT' : 'lease'}
            </span>
          </div>
        </div>
        
        {/* Main Price with subtle shine effect */}
        <div className="relative">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
              {formatPrice(price)}
            </span>
          </div>
          {/* Subtle glow effect */}
          <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        </div>
        
        {/* Property Type Indicator */}
        <div className="mt-4 flex items-center justify-end">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Verified className="w-3 h-3 text-emerald-300" />
            <span className="text-xs font-medium text-white/90">
              Verified {propertyType}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Pricing Details - Clean Professional Card */}
    <div className="bg-gradient-to-b from-white to-blue-50/30 rounded-b-xl sm:rounded-b-2xl border border-blue-100 shadow-xl shadow-blue-900/5">
      <div className="p-5 sm:p-7 space-y-4">
        {/* Price per sq.ft - Premium Styling */}
        {safeSpecifications.carpetArea > 0 && price?.amount && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50/70 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors group/item">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <Maximize className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Unit Rate</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{(price.amount / safeSpecifications.carpetArea).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  <span className="text-sm font-medium text-gray-600 ml-1">/sq.ft</span>
                </p>
              </div>
            </div>
            <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full opacity-70"></div>
          </div>
        )}

        {/* Maintenance Charges - Elegant Card */}
        {maintenanceCharges > 0 && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-cyan-50/70 rounded-xl border border-cyan-200 hover:border-cyan-300 transition-colors group/item">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover/item:scale-105 transition-transform">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">Maintenance</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{maintenanceCharges.toLocaleString('en-IN')}
                  <span className="text-sm font-medium text-gray-600 ml-1">/month</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Deposit - Elegant Card */}
        {securityDeposit > 0 && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-50/70 rounded-xl border border-emerald-200 hover:border-emerald-300 transition-colors group/item">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover/item:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Security Deposit</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{securityDeposit.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registration Charges */}

 
        {/* Call to Action */}
        <div className="pt-4">
          <button 
            onClick={handleBookAppointment}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              <CalendarIcon className="w-5 h-5" />
              <span className="tracking-wide">Schedule Property Tour</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </button>
          
    
        </div>
      </div>
    </div>
  </div>
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

            {/* Specifications - Mobile compact with expand/collapse */}
            {(safeSpecifications.bedrooms > 0 || safeSpecifications.bathrooms > 0 || safeSpecifications.carpetArea > 0) && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('specifications')}
                  className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-blue-50 transition-colors sm:cursor-default"
                >
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Specifications
                  </h2>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform sm:hidden ${
                    expandedSections.specifications ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <div className={`${expandedSections.specifications ? 'block' : 'hidden'} sm:block px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8`}>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                    {/* Mobile: Compact specification cards */}
                    {safeSpecifications.bedrooms > 0 && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Bedrooms</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.bedrooms}</p>
                        </div>
                      </div>
                    )}

                    {safeSpecifications.bathrooms > 0 && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Bath className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Bathrooms</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.bathrooms}</p>
                        </div>
                      </div>
                    )}

                    {safeSpecifications.balconies > 0 && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Balconies</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.balconies}</p>
                        </div>
                      </div>
                    )}

                    {safeSpecifications.floorNumber > 0 && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Floor</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.floorNumber}</p>
                        </div>
                      </div>
                    )}

                    {safeSpecifications.carpetArea > 0 && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Maximize className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Carpet Area</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.carpetArea.toLocaleString()} sq.ft.</p>
                        </div>
                      </div>
                    )}

                    {safeSpecifications.builtUpArea > 0 && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Built-up Area</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.builtUpArea.toLocaleString()} sq.ft.</p>
                        </div>
                      </div>
                    )}

                    {safeSpecifications.superBuiltUpArea > 0 && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Super Built-up</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.superBuiltUpArea.toLocaleString()} sq.ft.</p>
                        </div>
                      </div>
                    )}

                    {safeSpecifications.furnishing && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Furnishing</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.furnishing}</p>
                        </div>
                      </div>
                    )}

                    {safeSpecifications.possessionStatus && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Key className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Possession</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeSpecifications.possessionStatus}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Unit Features - Mobile compact with expand/collapse */}
{safeUnitFeatures.length > 0 && (
  <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-100/80 overflow-hidden backdrop-blur-sm relative group">
    {/* Premium gradient background effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-stone-50/20 to-amber-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    
    {/* Decorative elements */}
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-gray-200/20 to-stone-200/20 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-amber-200/10 to-stone-200/20 rounded-full blur-3xl"></div>
    
    <div className={`${expandedSections.features ? 'block' : 'hidden'} sm:block transition-all duration-500 ease-in-out relative z-10`}>
      <div className="px-5 sm:px-7 md:px-9 pb-7 sm:pb-8 md:pb-10">
        {/* Feature count badge */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
            {safeUnitFeatures.length} Premium Amenities
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
        
        {/* Premium features grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {safeUnitFeatures.map((feature, index) => {
            // Sophisticated muted color palette - premium and elegant
            const premiumGradients = [
              "from-amber-800/80 to-amber-700/70",      // Warm gold
              "from-rose-800/80 to-rose-700/70",        // Dusty rose
              "from-indigo-800/80 to-indigo-700/70",    // Deep indigo
              "from-emerald-800/80 to-emerald-700/70",  // Forest green
              "from-slate-800/80 to-slate-700/70",      // Charcoal
              "from-stone-800/80 to-stone-700/70",      // Warm gray
              "from-teal-800/80 to-teal-700/70",        // Deep teal
              "from-purple-800/80 to-purple-700/70",    // Royal purple
              "from-cyan-800/80 to-cyan-700/70",        // Deep cyan
              "from-pink-800/80 to-pink-700/70",        // Mauve
              "from-blue-800/80 to-blue-700/70",        // Navy
              "from-orange-800/80 to-orange-700/70",    // Burnt orange
              "from-lime-800/80 to-lime-700/70",        // Olive
              "from-red-800/80 to-red-700/70",          // Burgundy
              "from-violet-800/80 to-violet-700/70",    // Deep violet
              "from-fuchsia-800/80 to-fuchsia-700/70",  // Deep fuchsia
            ];
            
            // Get muted color based on index
            const gradientColor = premiumGradients[index % premiumGradients.length];
            
            // Extract base color for effects
            const baseColor = gradientColor.split(' ')[0].replace('from-', '').split('/')[0];
            
            return (
              <div
                key={index}
                className="group/feature relative"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Premium card with subtle background */}
                <div className="relative bg-white rounded-xl sm:rounded-2xl border border-gray-200/60 hover:border-gray-300/80 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
                  
                  {/* Subtle background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${baseColor}-50/0 via-${baseColor}-50/0 to-${baseColor}-50/0 group-hover/feature:from-${baseColor}-50/30 group-hover/feature:via-${baseColor}-50/20 group-hover/feature:to-${baseColor}-50/10 transition-all duration-700`}></div>
                  
                  {/* Elegant shine effect - more subtle */}
                  <div className="absolute inset-0 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-1000">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/feature:translate-x-full transition-transform duration-1500"></div>
                  </div>
                  
                  <div className="relative p-3 sm:p-4 md:p-5 flex flex-col items-center">
                    {/* Icon container with muted premium gradient */}
                    <div className="relative mb-2 sm:mb-3">
                      <div className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br ${gradientColor} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-${baseColor}-900/20 group-hover/feature:shadow-xl group-hover/feature:shadow-${baseColor}-900/30 transition-all duration-500 transform group-hover/feature:scale-105`}>
                        <div className="text-white/90 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-7 sm:[&>svg]:h-7 md:[&>svg]:w-8 md:[&>svg]:h-8">
                          {featureIcons[feature] || getFeatureIcon(feature)}
                        </div>
                      </div>
                      
                      {/* Subtle glow effect - very soft */}
                      <div className={`absolute -inset-1 bg-gradient-to-br ${gradientColor} rounded-xl sm:rounded-2xl blur-md opacity-0 group-hover/feature:opacity-20 transition-opacity duration-500`}></div>
                      
                      {/* Premium metallic corner accent */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-amber-300/80 to-amber-500/80 rounded-full opacity-0 group-hover/feature:opacity-100 transition-opacity duration-500 shadow-lg"></div>
                    </div>
                    
                    {/* Feature name with elegant typography */}
                    <span className="font-medium text-gray-600 tracking-wide text-[10px] sm:text-xs md:text-sm text-center line-clamp-2 group-hover/feature:text-gray-900 transition-colors duration-300">
                      {feature}
                    </span>
                    
                    {/* Subtle indicator dot */}
                    <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-${baseColor}-400/60 rounded-full opacity-0 group-hover/feature:opacity-100 transition-all duration-300 scale-0 group-hover/feature:scale-100`}></div>
                  </div>
                </div>
                
                {/* Elegant tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900/90 text-white/90 text-[10px] sm:text-xs rounded opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20 shadow-xl backdrop-blur-sm">
                  {feature}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 rotate-45"></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Optional elegant CTA */}
    
      </div>
    </div>
    
    {/* Elegant bottom border */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
  </div>
)}
            {/* Building Details - Mobile compact with expand/collapse */}
            {safeBuildingDetails.name && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-200 overflow-hidden">
                <button
                  onClick={() => toggleSection('buildingDetails')}
                  className="w-full flex items-center justify-between p-4 sm:p-6 md:p-8 text-left hover:bg-blue-50 transition-colors sm:cursor-default"
                >
                  <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Building Details
                  </h2>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform sm:hidden ${
                    expandedSections.buildingDetails ? 'rotate-180' : ''
                  }`} />
                </button>
                
                <div className={`${expandedSections.buildingDetails ? 'block' : 'hidden'} sm:block px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8`}>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                    {safeBuildingDetails.name && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Building Name</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeBuildingDetails.name}</p>
                        </div>
                      </div>
                    )}

                    {safeBuildingDetails.totalFloors > 0 && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Total Floors</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeBuildingDetails.totalFloors}</p>
                        </div>
                      </div>
                    )}

                    {safeBuildingDetails.totalUnits > 0 && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Total Units</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeBuildingDetails.totalUnits}</p>
                        </div>
                      </div>
                    )}

                    {safeBuildingDetails.yearBuilt && (
                      <div className="flex items-center gap-3 sm:gap-4 p-3 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-200">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">Year Built</p>
                          <p className="text-gray-700 text-sm sm:text-base">{safeBuildingDetails.yearBuilt}</p>
                        </div>
                      </div>
                    )}

                    {safeBuildingDetails.amenities?.length > 0 && (
                      <div className="col-span-2 sm:col-span-2 md:col-span-3">
                        <p className="font-bold text-gray-900 text-sm sm:text-base mb-2">Building Amenities</p>
                        <div className="flex flex-wrap gap-2">
                          {safeBuildingDetails.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
                            >
                              {amenity}
                            </span>
                          ))}
                         
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Location & Map - Reduced height for desktop */}
            {embedUrl && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-blue-200">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
                  Location
                </h2>
                
                <div className="rounded-xl overflow-hidden shadow-lg mb-4 sm:mb-6 border border-blue-200">
                  <iframe
                    width="100%"
                    height="250" // Reduced from 300/400
                    className="sm:h-[250px] md:h-[300px]" // Reduced height for desktop
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
                    <span className="hidden sm:inline">Open in Maps</span>
                    <span className="sm:hidden">Maps</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Info - Mobile optimized */}




  {/* Fixed Sidebar */}
  <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0">
    <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
      {/* Contact Information */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 border border-blue-200">
        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight">
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

      {/* Property Stats - Mobile compact */}
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
        </div>
      </div>
    </div>
  </div>
 </div>
      </div>
<FeaturedProperties/>
      <PossessionTimeline/>

      {/* Footer */}
      <Footer />
    </div>
  );
}