// pages/CategoryPropertiesPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Building2,
  Home,
  Warehouse,
  Ruler,
  BedDouble,
  Search,
  X,
  DollarSign,
  Calendar,
  Grid,
  List,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  Bath,
  Clock,
  Zap,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Home as HomeIcon,
  MapPin,
  Heart,
  Share2,
  Maximize2,
  Users,
  Wifi,
  Car,
  Dumbbell,
  Shield,
  Waves,
  Coffee,
  Gem,
  Rocket,
  RefreshCw,
  Sun,
  Thermometer,
  Droplet,
  Target,
  Flower,FileText
} from 'lucide-react';
import { propertyUnitAPI } from '../api/propertyUnitAPI';
import PropertyUnitCard from '../components/PropertyUnitCard';
import { motion, AnimatePresence } from 'framer-motion';

// Premium Category Icons
const categoryIcons = {
  'Apartment': <Building className="w-8 h-8" strokeWidth={1.5} />,
  'Commercial Space': <Building2 className="w-8 h-8" strokeWidth={1.5} />,
  'Villa': <Home className="w-8 h-8" strokeWidth={1.5} />,
  'Independent House': <Warehouse className="w-8 h-8" strokeWidth={1.5} />,
  'Plot': <Ruler className="w-8 h-8" strokeWidth={1.5} />,
  'Pg house': <BedDouble className="w-8 h-8" strokeWidth={1.5} />
};

// Premium Themes
// Category Themes - Blue theme works perfectly
const categoryThemes = {
  'Apartment': {
    primary: 'from-blue-600 to-indigo-600',
    secondary: 'from-blue-50 to-indigo-50',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    light: 'bg-blue-50',
    icon: 'text-blue-500',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    gradientLight: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    shadow: 'shadow-blue-500/20',
    ring: 'ring-blue-500',
    hover: 'hover:shadow-blue-500/30',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  'Commercial Space': {
  primary: 'from-blue-600 to-indigo-600',
    secondary: 'from-blue-50 to-indigo-50',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    light: 'bg-blue-50',
    icon: 'text-blue-500',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    gradientLight: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    shadow: 'shadow-blue-500/20',
    ring: 'ring-blue-500',
    hover: 'hover:shadow-blue-500/30',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  'Villa': {
    primary: 'from-blue-600 to-indigo-600',
    secondary: 'from-blue-50 to-indigo-50',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    light: 'bg-blue-50',
    icon: 'text-blue-500',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    gradientLight: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    shadow: 'shadow-blue-500/20',
    ring: 'ring-blue-500',
    hover: 'hover:shadow-blue-500/30',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  'Independent House': {
    primary: 'from-blue-600 to-indigo-600',
    secondary: 'from-blue-50 to-indigo-50',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    light: 'bg-blue-50',
    icon: 'text-blue-500',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    gradientLight: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    shadow: 'shadow-blue-500/20',
    ring: 'ring-blue-500',
    hover: 'hover:shadow-blue-500/30',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  'Plot': {
  primary: 'from-blue-600 to-indigo-600',
    secondary: 'from-blue-50 to-indigo-50',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    light: 'bg-blue-50',
    icon: 'text-blue-500',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    gradientLight: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    shadow: 'shadow-blue-500/20',
    ring: 'ring-blue-500',
    hover: 'hover:shadow-blue-500/30',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  'Pg house': {
  primary: 'from-blue-600 to-indigo-600',
    secondary: 'from-blue-50 to-indigo-50',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    border: 'border-blue-200',
    light: 'bg-blue-50',
    icon: 'text-blue-500',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    gradientLight: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    shadow: 'shadow-blue-500/20',
    ring: 'ring-blue-500',
    hover: 'hover:shadow-blue-500/30',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  }
};

// Filter Options
const filterOptions = {
  furnishing: [
    { value: 'unfurnished', label: 'Unfurnished', icon: Home, color: 'gray' },
    { value: 'semi-furnished', label: 'Semi-Furnished', icon: Coffee, color: 'blue' },
    { value: 'fully-furnished', label: 'Fully Furnished', icon: Sparkles, color: 'purple' }
  ],
  possessionStatus: [
    { value: 'ready-to-move', label: 'Ready to Move', icon: CheckCircle, color: 'green' },
    { value: 'under-construction', label: 'Under Construction', icon: Rocket, color: 'orange' },
    { value: 'resale', label: 'Resale', icon: RefreshCw, color: 'blue' }
  ],
  bedrooms: [1, 2, 3, 4, '5+'],
  bathrooms: [1, 2, 3, '4+'],
  listingType: [
    { value: 'sale', label: 'Buy', icon: Gem, color: 'emerald' },
    { value: 'rent', label: 'Rent', icon: Calendar, color: 'amber' },
    { value: 'lease', label: 'Lease', icon: FileText, color: 'indigo' }
  ],
  amenities: [
    { id: 'parking', label: 'Parking', icon: Car, category: 'essential' },
    { id: 'gym', label: 'Gym', icon: Dumbbell, category: 'lifestyle' },
    { id: 'pool', label: 'Pool', icon: Waves, category: 'luxury' },
    { id: 'security', label: 'Security', icon: Shield, category: 'essential' },
    { id: 'power', label: 'Power Backup', icon: Zap, category: 'essential' },
    { id: 'lift', label: 'Lift', icon: Maximize2, category: 'essential' },
    { id: 'garden', label: 'Garden', icon: Flower, category: 'lifestyle' },
    { id: 'club', label: 'Clubhouse', icon: Users, category: 'luxury' },
    { id: 'sports', label: 'Sports', icon: Target, category: 'lifestyle' },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi, category: 'technology' },
    { id: 'ac', label: 'A/C', icon: Thermometer, category: 'comfort' },
    { id: 'heating', label: 'Heating', icon: Sun, category: 'comfort' }
  ]
};

// Animation Variants
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const CategoryPropertiesPage = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Refs
  const searchTimeout = useRef(null);
  const priceTimeout = useRef(null);
  
  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  
  // Filter state with instant updates
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    furnishing: '',
    possessionStatus: '',
    listingType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    amenities: []
  });

  // UI State
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [priceError, setPriceError] = useState('');

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update active filter count
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => 
      key !== 'sortBy' && 
      key !== 'sortOrder' && 
      key !== 'search' && 
      value && 
      (Array.isArray(value) ? value.length > 0 : value !== '')
    ).length;
    setActiveFilterCount(count);
  }, [filters]);

  // Fetch properties instantly
  const fetchProperties = useCallback(async (searchParams) => {
    try {
      setLoading(true);
      
      const params = {
        propertyType: categoryId,
        approvalStatus: 'approved',
        availability: 'available',
        page,
        limit: isMobile ? 10 : 12,
        sortBy: searchParams.sortBy,
        sortOrder: searchParams.sortOrder
      };

      // Add filters
      if (searchParams.search?.trim()) params.search = searchParams.search.trim();
      
      // Price filters - immediate numeric conversion
      if (searchParams.minPrice && !isNaN(Number(searchParams.minPrice))) {
        params.minPrice = Number(searchParams.minPrice);
      }
      if (searchParams.maxPrice && !isNaN(Number(searchParams.maxPrice))) {
        params.maxPrice = Number(searchParams.maxPrice);
      }
      
      // Validate price range
      if (params.minPrice && params.maxPrice && params.minPrice > params.maxPrice) {
        params.minPrice = params.maxPrice;
      }

      // Other filters
      if (searchParams.bedrooms) {
        params.bedrooms = searchParams.bedrooms === '5+' ? { $gte: 5 } : Number(searchParams.bedrooms);
      }
      if (searchParams.bathrooms) {
        params.bathrooms = searchParams.bathrooms === '4+' ? { $gte: 4 } : Number(searchParams.bathrooms);
      }
      if (searchParams.furnishing) params.furnishing = searchParams.furnishing;
      if (searchParams.possessionStatus) params.possessionStatus = searchParams.possessionStatus;
      if (searchParams.listingType) params.listingType = searchParams.listingType;

      const response = await propertyUnitAPI.getPropertyUnits(params);

      if (response.data.success) {
        setProperties(response.data.data || []);
        setTotalCount(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [categoryId, page, isMobile]);

  // Debounced fetch for search only
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchProperties(filters);
    }, 300);

    return () => clearTimeout(searchTimeout.current);
  }, [filters.search]);

  // Instant fetch for other filters
  useEffect(() => {
    if (filters.search) return; // Skip if search is debounced
    
    setPage(1);
    fetchProperties(filters);
  }, [
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.bathrooms,
    filters.furnishing,
    filters.possessionStatus,
    filters.listingType,
    JSON.stringify(filters.amenities),
    filters.sortBy,
    filters.sortOrder
  ]);

  // Handle filter change instantly
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  // Handle price change with validation
  const handlePriceChange = (type, value) => {
    setPriceError('');
    const numValue = value ? Number(value) : '';
    
    setFilters(prev => ({
      ...prev,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue
    }));

    // Validate
    if (type === 'min' && filters.maxPrice && numValue > filters.maxPrice) {
      setPriceError('Min price cannot exceed max price');
    } else if (type === 'max' && filters.minPrice && numValue < filters.minPrice) {
      setPriceError('Max price cannot be less than min price');
    }
  };

  // Handle amenity toggle
  const handleAmenityToggle = (amenityId) => {
    setFilters(prev => {
      const current = prev.amenities || [];
      const updated = current.includes(amenityId)
        ? current.filter(id => id !== amenityId)
        : [...current, amenityId];
      
      return {
        ...prev,
        amenities: updated.length ? updated : undefined
      };
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      furnishing: '',
      possessionStatus: '',
      listingType: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      amenities: []
    });
    setPriceError('');
    setPage(1);
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(2)} K`;
    return `₹${price.toLocaleString()}`;
  };

  const categoryName = location.state?.categoryName || decodeURIComponent(categoryId);
  const theme = categoryThemes[categoryId] || categoryThemes['Apartment'];

  // Premium Price Range Selector
  const PriceRangeSelector = () => {
    const presetRanges = [
      { label: 'Under ₹50L', min: 0, max: 5000000 },
      { label: '₹50L - ₹1Cr', min: 5000000, max: 10000000 },
      { label: '₹1Cr - ₹2Cr', min: 10000000, max: 20000000 },
      { label: 'Above ₹2Cr', min: 20000000, max: 100000000 }
    ];

    return (
      <div className="relative">
        <button
          onClick={() => setShowPriceDropdown(!showPriceDropdown)}
          className={`w-full px-4 py-3 bg-white border rounded-xl flex items-center justify-between transition-all ${
            filters.minPrice || filters.maxPrice
              ? 'border-blue-500 ring-2 ring-blue-200'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <DollarSign className={`w-5 h-5 ${filters.minPrice || filters.maxPrice ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">
              {filters.minPrice || filters.maxPrice
                ? `${filters.minPrice ? formatPrice(filters.minPrice) : 'Any'} - ${filters.maxPrice ? formatPrice(filters.maxPrice) : 'Any'}`
                : 'Any Price'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showPriceDropdown ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showPriceDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5"
            >
              <h4 className="font-semibold text-gray-900 mb-4">Select Price Range</h4>
              
              <div className="space-y-4">
                {/* Range Slider */}
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="100000000"
                    step="100000"
                    value={filters.maxPrice || 100000000}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹5Cr</span>
                    <span>₹10Cr+</span>
                  </div>
                </div>

                {/* Input fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Min (₹)</label>
                    <input
                      type="text"
                      value={filters.minPrice || ''}
                      onChange={(e) => handlePriceChange('min', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max (₹)</label>
                    <input
                      type="text"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handlePriceChange('max', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Any"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                </div>

                {priceError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {priceError}
                  </p>
                )}

                {/* Preset ranges */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Quick Select</p>
                  <div className="grid grid-cols-2 gap-2">
                    {presetRanges.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handlePriceChange('min', preset.min);
                          handlePriceChange('max', preset.max);
                          setShowPriceDropdown(false);
                        }}
                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Premium Filter Chip
  const FilterChip = ({ label, active, onClick, icon: Icon }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${
        active
          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" strokeWidth={1.5} />}
      {label}
      {active && <CheckCircle className="w-4 h-4 ml-1" />}
    </motion.button>
  );

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="relative h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer bg-[length:200%_100%]">
        <div className="absolute top-3 left-3 w-16 h-6 bg-white/50 backdrop-blur-sm rounded-full"></div>
      </div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Hero Section */}
      <div className={`relative bg-gradient-to-r ${theme.primary} overflow-hidden`}>
        {/* Abstract Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Geometric Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0 L0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect x="0" y="0" width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </motion.button>

          <div className="flex items-start gap-6">
            {/* Premium Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white blur-2xl opacity-30 rounded-2xl"></div>
              <div className="relative p-5 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30">
                {categoryIcons[categoryId] || <Building className="w-10 h-10 text-white" />}
              </div>
            </motion.div>

            {/* Category Info */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex-1"
            >
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold text-white">{categoryName}</h1>
                {/* <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full border border-white/30">
                  {totalCount} properties
                </span> */}
              </div>
              
              <p className="text-white/80 text-lg max-w-2xl">
                Discover premium {categoryName} with world-class amenities
              </p>

              {/* Quick Stats */}
              <div className="flex gap-4 mt-6">
                {/* <div className="flex items-center gap-2 text-white/70 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Avg. ₹75L</span>
                </div> */}
                {/* <div className="flex items-center gap-2 text-white/70 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Prime Locations</span>
                </div> */}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search in ${categoryName}...`}
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden relative p-3 bg-blue-600 text-white rounded-xl"
            >
              <Filter className="w-5 h-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full ring-2 ring-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(':');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="hidden md:block px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none text-sm cursor-pointer min-w-[160px]"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option>
              <option value="carpetArea:desc">Largest Area</option>
              <option value="bedrooms:desc">Most Bedrooms</option>
            </select>

            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden md:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Price Range */}
              {/* <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <PriceRangeSelector />
              </div> */}

              {/* Listing Type */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">I want to</h4>
                <div className="grid grid-cols-3 gap-2">
                  {filterOptions.listingType.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleFilterChange('listingType', value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        filters.listingType === value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" strokeWidth={1.5} />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Bedrooms</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.bedrooms.map((num) => (
                    <FilterChip
                      key={num}
                      label={`${num}${num === '5+' ? '' : ' BHK'}`}
                      active={filters.bedrooms === num}
                      onClick={() => handleFilterChange('bedrooms', filters.bedrooms === num ? '' : num)}
                    />
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Bathrooms</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.bathrooms.map((num) => (
                    <FilterChip
                      key={num}
                      label={`${num}`}
                      active={filters.bathrooms === num}
                      onClick={() => handleFilterChange('bathrooms', filters.bathrooms === num ? '' : num)}
                      icon={Droplet}
                    />
                  ))}
                </div>
              </div>

              {/* Furnishing */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Furnishing</h4>
                <div className="space-y-2">
                  {filterOptions.furnishing.map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        filters.furnishing === value
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="furnishing"
                        checked={filters.furnishing === value}
                        onChange={() => handleFilterChange('furnishing', value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Possession Status */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Possession</h4>
                <div className="space-y-2">
                  {filterOptions.possessionStatus.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleFilterChange('possessionStatus', filters.possessionStatus === value ? '' : value)}
                      className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        filters.possessionStatus === value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {/* <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.amenities.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => handleAmenityToggle(id)}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                        filters.amenities?.includes(id)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div> */}
            </div>
          </div>

          {/* Properties Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {totalCount} Properties Found
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Page {page} of {totalPages}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                <div className="text-8xl mb-6">🏠</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No properties found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try adjusting your filters
                </p>
                <button
                  onClick={clearFilters}
                  className={`px-8 py-3 bg-gradient-to-r ${theme.primary} text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all`}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div 
                variants={stagger}
                initial="initial"
                animate="animate"
                className="grid grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {properties.map((property) => (
                  <motion.div
                    key={property._id}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    className="transform transition-all duration-300"
                  >
                    <PropertyUnitCard propertyUnit={property} viewMode="compact" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2 bg-white rounded-xl shadow-lg p-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      page === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ←
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum = page <= 3 
                      ? i + 1 
                      : page >= totalPages - 2 
                        ? totalPages - 4 + i 
                        : page - 2 + i;

                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          page === pageNum
                            ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg`
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      page === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
 <AnimatePresence>
  {showMobileFilters && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 md:hidden"
    >
      <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileFilters(false)} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 font-medium"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-6 pb-24">
          {/* Mobile Price Range - Enhanced */}
          {/* <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />
              Price Range
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min Price (₹)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  min="0"
                  step="100000"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Max Price (₹)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  min="0"
                  step="100000"
                />
              </div>
            </div>
            
        
            {priceError && (
              <p className="text-xs text-red-500 flex items-center gap-1 mb-2">
                <X className="w-3 h-3" />
                {priceError}
              </p>
            )}

         
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Under ₹50L', min: 0, max: 5000000 },
                { label: '₹50L-1Cr', min: 5000000, max: 10000000 },
                { label: '₹1Cr-2Cr', min: 10000000, max: 20000000 },
                { label: 'Above ₹2Cr', min: 20000000, max: 100000000 }
              ].map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handlePriceChange('min', preset.min);
                    handlePriceChange('max', preset.max);
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div> */}
        <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Sort By
            </h4>
            <select
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(':');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="w-full p-3 bg-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option>
              <option value="carpetArea:desc">Largest Area</option>
              <option value="bedrooms:desc">Most Bedrooms</option>
            </select>
          </div>
          {/* Mobile Listing Type */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              I want to
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {filterOptions.listingType.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleFilterChange('listingType', value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    filters.listingType === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 border-transparent text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" strokeWidth={1.5} />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Bedrooms */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-500" />
              Bedrooms
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.bedrooms.map((num) => (
                <button
                  key={num}
                  onClick={() => handleFilterChange('bedrooms', filters.bedrooms === num ? '' : num)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    filters.bedrooms === num
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {num} {num === '5+' ? '+' : 'BHK'}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Bathrooms */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Bath className="w-4 h-4 text-blue-500" />
              Bathrooms
            </h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions.bathrooms.map((num) => (
                <button
                  key={num}
                  onClick={() => handleFilterChange('bathrooms', filters.bathrooms === num ? '' : num)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    filters.bathrooms === num
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Furnishing */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-blue-500" />
              Furnishing
            </h4>
            <div className="space-y-2">
              {filterOptions.furnishing.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    filters.furnishing === value
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="mobileFurnishing"
                    checked={filters.furnishing === value}
                    onChange={() => handleFilterChange('furnishing', value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-sm flex-1">{label}</span>
                  {filters.furnishing === value && (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Mobile Possession Status */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Possession Status
            </h4>
            <div className="space-y-2">
              {filterOptions.possessionStatus.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => handleFilterChange('possessionStatus', filters.possessionStatus === value ? '' : value)}
                  className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                    filters.possessionStatus === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 border-transparent text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {filters.possessionStatus === value && (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Amenities */}
          {/* <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              Amenities
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.amenities.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleAmenityToggle(id)}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    filters.amenities?.includes(id)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-100 border-transparent text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div> */}

          {/* Mobile Sort Options */}
  
        </div>

        {/* Apply Button - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors"
            >
              Show {totalCount} Results
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default CategoryPropertiesPage;