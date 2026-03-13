// pages/CategoryPropertiesPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Search,
  X,
  Grid,
  List,
  Filter,
  ChevronDown,
  Bath,
  CheckCircle,
  Home,
  DollarSign,
  Building,
  Building2,
  Warehouse,
  Ruler,
  BedDouble,
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  Home as HomeIcon,
  Coffee,
  Gem,
  RefreshCw,
  Droplet,
  FileText
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { motion, AnimatePresence } from "framer-motion";
import CategoryBanner from "./CategoryBanner";

// Category Icons
const categoryIcons = {
  'Apartment': <Building className="w-8 h-8" strokeWidth={1.5} />,
  'Commercial Space': <Building2 className="w-8 h-8" strokeWidth={1.5} />,
  'Villa': <Home className="w-8 h-8" strokeWidth={1.5} />,
  'Independent House': <Warehouse className="w-8 h-8" strokeWidth={1.5} />,
  'Plot': <Ruler className="w-8 h-8" strokeWidth={1.5} />,
  'Pg house': <BedDouble className="w-8 h-8" strokeWidth={1.5} />
};

// Category Themes
const categoryThemes = {
  'Apartment': {
    primary: 'from-blue-600 to-indigo-600',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  'Commercial Space': {
    primary: 'from-blue-600 to-indigo-600',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  'Villa': {
    primary: 'from-blue-600 to-indigo-600',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  'Independent House': {
    primary: 'from-blue-600 to-indigo-600',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  'Plot': {
    primary: 'from-blue-600 to-indigo-600',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  },
  'Pg house': {
    primary: 'from-blue-600 to-indigo-600',
    accent: 'bg-blue-600',
    text: 'text-blue-600',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
  }
};

// Filter Options
const filterOptions = {
  furnishing: [
    { value: 'unfurnished', label: 'Unfurnished', icon: Home },
    { value: 'semi-furnished', label: 'Semi-Furnished', icon: Coffee },
    { value: 'fully-furnished', label: 'Fully Furnished', icon: Sparkles }
  ],
  possessionStatus: [
    { value: 'ready-to-move', label: 'Ready to Move', icon: CheckCircle },
    { value: 'under-construction', label: 'Under Construction', icon: RefreshCw },
    { value: 'resale', label: 'Resale', icon: RefreshCw }
  ],
  bedrooms: [1, 2, 3, 4, '5+'],
  bathrooms: [1, 2, 3, '4+'],
  listingType: [
    { value: 'sale', label: 'Buy', icon: Gem },
    { value: 'rent', label: 'Rent', icon: Calendar },
    { value: 'lease', label: 'Lease', icon: FileText }
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

// Filter Chip Component
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

// Skeleton Loader for Grid View
const GridSkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
    <div className="relative h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
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

// Skeleton Loader for List View
const ListSkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex">
    <div className="w-48 h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
    <div className="flex-1 p-6 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      <div className="flex gap-4">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  </div>
);

const CategoryPropertiesPage = () => {
  const { categoryId } = useParams();
  const location = useLocation();

  const isInitialMount = useRef(true);
  const debounceTimeout = useRef(null);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('propertyViewMode') || "grid";
  });
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    furnishing: "",
    possessionStatus: "",
    listingType: "",
    sortBy: "displayOrder",
    sortOrder: "asc"
  });

  const [priceError, setPriceError] = useState("");

  const categoryName =
    location.state?.categoryName || decodeURIComponent(categoryId);
  const theme = categoryThemes[categoryId] || categoryThemes['Apartment'];

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('propertyViewMode', viewMode);
  }, [viewMode]);

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
      value !== ''
    ).length;
    setActiveFilterCount(count);
  }, [filters]);

  // ---------------------------
  // API CALL
  // ---------------------------

  const fetchProperties = useCallback(
    async (currentPage, currentFilters) => {
      try {
        setLoading(true);

        const params = {
          propertyType: categoryId,
          page: currentPage,
          limit: isMobile ? 10 : 12,
          sortBy: currentFilters.sortBy,
          sortOrder: currentFilters.sortOrder
        };

        if (currentFilters.search?.trim()) {
          params.search = currentFilters.search.trim();
        }

        if (currentFilters.listingType) {
          params.listingType = currentFilters.listingType;
        }

        if (currentFilters.bedrooms) {
          params.bedrooms = currentFilters.bedrooms === "5+" ? 5 : Number(currentFilters.bedrooms);
        }

        if (currentFilters.bathrooms) {
          params.bathrooms = currentFilters.bathrooms === "4+" ? 4 : Number(currentFilters.bathrooms);
        }

        if (currentFilters.furnishing) {
          params.furnishing = currentFilters.furnishing;
        }

        if (currentFilters.possessionStatus) {
          params.possessionStatus = currentFilters.possessionStatus;
        }

        // FIXED: Price filter handling - ensure numbers are sent correctly
        if (currentFilters.minPrice && currentFilters.minPrice !== '') {
          const minPriceNum = Number(currentFilters.minPrice);
          if (!isNaN(minPriceNum) && minPriceNum > 0) {
            params.minPrice = minPriceNum;
            console.log('Setting minPrice:', minPriceNum);
          }
        }

        if (currentFilters.maxPrice && currentFilters.maxPrice !== '') {
          const maxPriceNum = Number(currentFilters.maxPrice);
          if (!isNaN(maxPriceNum) && maxPriceNum > 0) {
            params.maxPrice = maxPriceNum;
            console.log('Setting maxPrice:', maxPriceNum);
          }
        }

        console.log('Fetching with params:', params);

        const response = await propertyUnitAPI.getPropertyUnits(params);

        if (response.data.success) {
          setProperties(response.data.data || []);
          setTotalCount(response.data.total || 0);
          setTotalPages(response.data.totalPages || 1);
          
          // Log the first few properties to check prices
          console.log('First property prices:', response.data.data.slice(0, 3).map(p => ({
            title: p.title,
            price: p.price,
            priceType: typeof p.price
          })));
        }
      } catch (err) {
        console.error("Error fetching properties", err);
        setProperties([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [categoryId, isMobile]
  );

  // ---------------------------
  // INITIAL LOAD
  // ---------------------------

  useEffect(() => {
    if (isInitialMount.current) {
      fetchProperties(page, filters);
      isInitialMount.current = false;
    }
  }, []);

  // ---------------------------
  // FILTER CHANGE
  // ---------------------------

  useEffect(() => {
    if (isInitialMount.current) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      setPage(1);
      fetchProperties(1, filters);
    }, 500);
  }, [
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
    filters.bathrooms,
    filters.furnishing,
    filters.possessionStatus,
    filters.listingType,
    filters.search,
    filters.sortBy,
    filters.sortOrder
  ]);

  // ---------------------------
  // HANDLERS
  // ---------------------------

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === prev[key] ? '' : value
    }));
  };

  const handlePriceChange = (type, value) => {
    setPriceError('');
    
    // Allow only numbers
    const numericValue = value.replace(/[^\d]/g, '');
    
    setFilters(prev => ({
      ...prev,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numericValue
    }));

    // Validate price range
    if (type === 'min' && prev.maxPrice && numericValue && Number(numericValue) > Number(prev.maxPrice)) {
      setPriceError('Min price cannot exceed max price');
    } else if (type === 'max' && prev.minPrice && numericValue && Number(numericValue) < Number(prev.minPrice)) {
      setPriceError('Max price cannot be less than min price');
    } else {
      setPriceError('');
    }
  };

  const clearFilters = () => {
    const reset = {
      search: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      furnishing: "",
      possessionStatus: "",
      listingType: "",
      sortBy: "displayOrder",
      sortOrder: "asc"
    };

    setFilters(reset);
    setPriceError('');
    setPage(1);
    fetchProperties(1, reset);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      fetchProperties(newPage, filters);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatPrice = (price) => {
    if (!price || price === '') return '';
    const numPrice = Number(price);
    if (isNaN(numPrice)) return '';
    
    if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    if (numPrice >= 100000) return `₹${(numPrice / 100000).toFixed(2)} L`;
    if (numPrice >= 1000) return `₹${(numPrice / 1000).toFixed(2)} K`;
    return `₹${numPrice.toLocaleString()}`;
  };

  // ---------------------------
  // PAGE NUMBER LOGIC
  // ---------------------------

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // ---------------------------
  // UI
  // ---------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryBanner categoryId={categoryId} categoryName={categoryName} />

      {/* STICKY SEARCH BAR */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search in ${categoryName}...`}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange("search", "")}
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
                const [sortBy, sortOrder] = e.target.value.split(":");
                setFilters(prev => ({
                  ...prev,
                  sortBy,
                  sortOrder
                }));
              }}
              className="hidden md:block px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white focus:outline-none text-sm cursor-pointer min-w-[160px]"
            >
              <option value="displayOrder:asc">Featured First</option>
              <option value="createdAt:desc">Newest First</option>
              {/* <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option> */}
            </select>

            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* DESKTOP FILTERS */}
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
                <div className="space-y-3">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Min Price (in ₹)"
                      value={filters.minPrice}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Max Price (in ₹)"
                      value={filters.maxPrice}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  {priceError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {priceError}
                    </p>
                  )}
                  {(filters.minPrice || filters.maxPrice) && (
                    <p className="text-xs text-gray-500">
                      Range: {formatPrice(filters.minPrice || 0)} - {filters.maxPrice ? formatPrice(filters.maxPrice) : 'Any'}
                    </p>
                  )}
                </div>
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
                      label={`${num}${num === '5+' ? '+' : ' BHK'}`}
                      active={filters.bedrooms === num}
                      onClick={() => handleFilterChange('bedrooms', num)}
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
                      onClick={() => handleFilterChange('bathrooms', num)}
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
                    <button
                      key={value}
                      onClick={() => handleFilterChange('furnishing', value)}
                      className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        filters.furnishing === value
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

              {/* Possession Status */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Possession</h4>
                <div className="space-y-2">
                  {filterOptions.possessionStatus.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleFilterChange('possessionStatus', value)}
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
            </div>
          </div>

          {/* PROPERTIES GRID/LIST */}
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
              <button
                onClick={clearFilters}
                className="text-blue-600 text-sm font-medium hover:text-blue-800"
              >
                Clear Filters
              </button>
            </div>

            {/* LOADING SKELETONS */}
            {loading ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <GridSkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <ListSkeletonCard key={i} />
                  ))}
                </div>
              )
            ) : properties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                <Home size={60} className="mx-auto text-gray-300 mb-4" />
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
                className={viewMode === "grid" 
                  ? "grid grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
                }
              >
                {properties.map((property) => (
                  <motion.div
                    key={property._id}
                    variants={fadeUp}
                    whileHover={{ y: viewMode === "grid" ? -4 : -2 }}
                    className="transform transition-all duration-300"
                  >
                    <PropertyUnitCard 
                      propertyUnit={property} 
                      viewMode={viewMode === "grid" ? "compact" : "detailed"} 
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && !loading && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      page === 1 
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePageChange(num)}
                        className={`min-w-[40px] h-10 rounded-lg font-medium transition-all ${
                          page === num
                            ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg`
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      page === totalPages 
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTERS MODAL */}
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
                {/* Sort By */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Sort By
                  </h4>
                  <select
                    value={`${filters.sortBy}:${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split(':');
                      setFilters(prev => ({
                        ...prev,
                        sortBy,
                        sortOrder
                      }));
                      setShowMobileFilters(false);
                    }}
                    className="w-full p-3 bg-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  >
                    <option value="displayOrder:asc">Featured First</option>
                    <option value="createdAt:desc">Newest First</option>
                    {/* <option value="price:asc">Price: Low to High</option>
                    <option value="price:desc">Price: High to Low</option> */}
                  </select>
                </div>

                {/* Price Range */}
                {/* <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={(e) => handlePriceChange('min', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={(e) => handlePriceChange('max', e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      />
                    </div>
                  </div>
                </div> */}

                {/* Listing Type */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    I want to
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {filterOptions.listingType.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          handleFilterChange('listingType', value);
                          setShowMobileFilters(false);
                        }}
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

                {/* Bedrooms */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <HomeIcon className="w-4 h-4 text-blue-500" />
                    Bedrooms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.bedrooms.map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          handleFilterChange('bedrooms', num);
                          setShowMobileFilters(false);
                        }}
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

                {/* Bathrooms */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Bath className="w-4 h-4 text-blue-500" />
                    Bathrooms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.bathrooms.map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          handleFilterChange('bathrooms', num);
                          setShowMobileFilters(false);
                        }}
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

                {/* Furnishing */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-blue-500" />
                    Furnishing
                  </h4>
                  <div className="space-y-2">
                    {filterOptions.furnishing.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          handleFilterChange('furnishing', value);
                          setShowMobileFilters(false);
                        }}
                        className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                          filters.furnishing === value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-gray-100 border-transparent text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" strokeWidth={1.5} />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        {filters.furnishing === value && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Possession Status */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Possession Status
                  </h4>
                  <div className="space-y-2">
                    {filterOptions.possessionStatus.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => {
                          handleFilterChange('possessionStatus', value);
                          setShowMobileFilters(false);
                        }}
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
              </div>

              {/* Apply Button */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/30 transition-colors"
                >
                  Show {totalCount} Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryPropertiesPage;