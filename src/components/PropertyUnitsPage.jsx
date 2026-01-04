import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { 
  Search, Filter, Grid, List, ChevronLeft, ChevronRight, 
  Home, MapPin, Building, Ruler, Bed, Bath,
  CheckCircle, XCircle, Loader2, X, ChevronDown, ChevronUp,
  DollarSign, Calendar, Layers, Star,
  Maximize2, Minimize2, Building2,
  TrendingUp, Clock, Shield, Award, Zap, Filter as FilterIcon,
  SlidersHorizontal, Crown, Trophy, TrendingDown,
  ArrowUpDown, BadgeCheck, Zap as Lightning,
  Map, FileCheck, FileText, ShieldCheck
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { propertyUnitAPI } from "../api/propertyUnitAPI";

const PropertyUnitsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Refs
  const categoryScrollRef = useRef(null);
  const propertyGridRef = useRef(null);
  
  // State
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [allPropertyUnits, setAllPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    area: false,
    details: false,
    status: false,
    admin: false
  });
  const [activeCategory, setActiveCategory] = useState("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [clearTitleStats, setClearTitleStats] = useState({
    total: 0,
    verified: 0,
    cities: 0,
    properties: 0
  });

  // Filter state - UPDATED to match backend schema
  const [filters, setFilters] = useState({
    // Basic filters
    search: searchParams.get("search") || "",
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || "",
    listingType: searchParams.get("listingType") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    
    // Area filters - FIXED: Using minArea and maxArea as per backend
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    
    // Property details
    furnishing: searchParams.get("furnishing") || "",
    possessionStatus: searchParams.get("possessionStatus") || "",
    kitchenType: searchParams.get("kitchenType") || "",
    
    // Status filters
    availability: searchParams.get("availability") || "",
    approvalStatus: searchParams.get("approvalStatus") || "",
    isVerified: searchParams.get("isVerified") || "",
    isFeatured: searchParams.get("isFeatured") || "",
    
    // Sort and pagination
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
    page: parseInt(searchParams.get("page")) || 1,
    limit: parseInt(searchParams.get("limit")) || 12,
  });
  
  // Available options from API
  const [availableCities, setAvailableCities] = useState([]);
  const [availablePropertyTypes, setAvailablePropertyTypes] = useState([]);
  const [availableBedrooms, setAvailableBedrooms] = useState([]);
  
  // Property categories for horizontal scroll - UPDATED to match backend
  const [propertyCategories, setPropertyCategories] = useState([
    { id: "all", name: "All Properties", icon: <Home className="w-5 h-5" />, count: 0 },
    { id: "Apartment", name: "Apartments", icon: <Building className="w-5 h-5" />, count: 0 },
    { id: "Villa", name: "Villas", icon: <Crown className="w-5 h-5" />, count: 0 },
    { id: "Independent House", name: "Independent Houses", icon: <Home className="w-5 h-5" />, count: 0 },
    { id: "Studio", name: "Studio", icon: <Maximize2 className="w-5 h-5" />, count: 0 },
    { id: "Penthouse", name: "Penthouses", icon: <TrendingUp className="w-5 h-5" />, count: 0 },
    { id: "Duplex", name: "Duplex", icon: <Layers className="w-5 h-5" />, count: 0 },
    { id: "Row House", name: "Row Houses", icon: <Building2 className="w-5 h-5" />, count: 0 },
    { id: "Plot", name: "Plots", icon: <Map className="w-5 h-5" />, count: 0 },
    { id: "Commercial Space", name: "Commercial", icon: <Building2 className="w-5 h-5" />, count: 0 },
  ]);

  // Format number with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-IN');
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Check for property scroll from URL
    const scrollToProperty = location.state?.scrollToProperty;
    if (scrollToProperty && propertyGridRef.current) {
      setTimeout(() => {
        const element = document.getElementById(`property-${scrollToProperty}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-blue-500');
          setTimeout(() => element.classList.remove('ring-2', 'ring-blue-500'), 2000);
        }
      }, 500);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [location]);

  // Fetch all properties for category counts
  const fetchAllPropertiesForCategories = async () => {
    try {
      const response = await propertyUnitAPI.getPropertyUnits({ 
        limit: 1000 // Fetch more properties for accurate category counts
      });
      
      if (response.data.success) {
        const allUnits = response.data.data || [];
        setAllPropertyUnits(allUnits);
        updateCategoryCounts(allUnits);
      }
    } catch (error) {
      console.error("Error fetching all properties:", error);
    }
  };

  // Fetch property units with filters
  const fetchPropertyUnits = async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (key === 'isFeatured' || key === 'isVerified') {
            cleanFilters[key] = value === 'true';
          } else if (key === 'bedrooms' || key === 'bathrooms') {
            cleanFilters[key] = parseInt(value);
          } else if (key === 'minArea' || key === 'maxArea') {
            cleanFilters[key] = parseFloat(value);
          } else {
            cleanFilters[key] = value;
          }
        }
      });

      const { sortBy, sortOrder, page, limit, ...otherFilters } = cleanFilters;
      
      const params = {
        ...otherFilters,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
        page: page || 1,
        limit: limit || 12
      };

      console.log("Fetching with params:", params); // Debug log

      const response = await propertyUnitAPI.getPropertyUnits(params);
      
      if (response.data.success) {
        const units = response.data.data || [];
        
        setPropertyUnits(units);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
        setTotalResults(response.data.total || 0);
        
        // Set available options
        setAvailableCities(response.data.filters?.availableCities || []);
        setAvailablePropertyTypes(response.data.filters?.availablePropertyTypes || []);
        setAvailableBedrooms(response.data.filters?.availableBedrooms || []);
        
        // Update clear title stats
        const verifiedCount = units.filter(p => p.isVerified).length;
        setClearTitleStats({
          total: units.length,
          verified: verifiedCount,
          cities: response.data.filters?.availableCities?.length || 0,
          properties: response.data.total || 0
        });
        
      } else {
        toast.error(response.data.message || "Failed to fetch properties");
      }
    } catch (error) {
      console.error("Error fetching property units:", error);
      toast.error(error.response?.data?.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  // Update category counts - FIXED to match backend propertyType values
  const updateCategoryCounts = (units) => {
    const categoryCounts = {
      all: units.length,
      "Apartment": units.filter(p => p.propertyType === "Apartment").length,
      "Villa": units.filter(p => p.propertyType === "Villa").length,
      "Independent House": units.filter(p => p.propertyType === "Independent House").length,
      "Studio": units.filter(p => p.propertyType === "Studio").length,
      "Penthouse": units.filter(p => p.propertyType === "Penthouse").length,
      "Duplex": units.filter(p => p.propertyType === "Duplex").length,
      "Row House": units.filter(p => p.propertyType === "Row House").length,
      "Plot": units.filter(p => p.propertyType === "Plot").length,
      "Commercial Space": units.filter(p => p.propertyType === "Commercial Space").length,
    };
    
    // Update categories with counts
    setPropertyCategories(prev => prev.map(cat => ({
      ...cat,
      count: categoryCounts[cat.id] || 0
    })));
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchAllPropertiesForCategories();
    fetchPropertyUnits();
  }, []);

  // Fetch when filters change
  useEffect(() => {
    // Don't fetch on initial mount
    if (!loading) {
      fetchPropertyUnits();
    }
  }, [filters]);

  // Update URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== '0') {
        newParams.set(key, value.toString());
      }
    });
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    
    if (categoryId === 'all') {
      // Clear propertyType filter
      handleFilterChange('propertyType', '');
    } else {
      handleFilterChange('propertyType', categoryId);
    }
    
    // Scroll to property grid
    if (propertyGridRef.current) {
      propertyGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      city: "",
      propertyType: "",
      listingType: "",
      bedrooms: "",
      bathrooms: "",
      minArea: "",
      maxArea: "",
      furnishing: "",
      possessionStatus: "",
      kitchenType: "",
      availability: "",
      approvalStatus: "",
      isVerified: "",
      isFeatured: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 12,
    });
    setActiveCategory("all");
    setShowMobileFilters(false);
    setIsFilterPanelOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPropertyUnits();
    
    // Scroll to property grid after a short delay to allow data to load
    setTimeout(() => {
      if (propertyGridRef.current) {
        propertyGridRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 300);
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Apply filters and close mobile
  const handleApplyFilters = () => {
    if (isMobile) {
      setShowMobileFilters(false);
    }
    setIsFilterPanelOpen(false);
    fetchPropertyUnits();
  };

  // Handle pagination
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setFilters(prev => ({ ...prev, page: prev.page - 1 }));
      // Scroll to top of property grid
      if (propertyGridRef.current) {
        propertyGridRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
      // Scroll to top of property grid
      if (propertyGridRef.current) {
        propertyGridRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [currentPage, totalPages]);

  // Options arrays - UPDATED to match backend schema
  const listingTypes = ["sale", "rent", "lease", "pg"];
  const furnishingOptions = ["unfurnished", "semi-furnished", "fully-furnished"];
  const possessionOptions = ["ready-to-move", "under-construction", "resale"];
  const kitchenOptions = ["modular", "regular", "open", "closed", "none"];
  const availabilityOptions = ["available", "sold", "rented", "under-agreement", "hold"];
  const approvalOptions = ["pending", "approved", "rejected"];

  // Sort options - UPDATED to match backend allowed sort fields
  const sortOptions = [
    { value: "createdAt:desc", label: "Newest First", icon: <Calendar className="w-4 h-4" /> },
    { value: "price:asc", label: "Price: Low to High", icon: <TrendingUp className="w-4 h-4" /> },
    { value: "price:desc", label: "Price: High to Low", icon: <TrendingDown className="w-4 h-4" /> },
    { value: "carpetArea:desc", label: "Largest Area", icon: <Maximize2 className="w-4 h-4" /> },
    { value: "carpetArea:asc", label: "Smallest Area", icon: <Minimize2 className="w-4 h-4" /> },
    { value: "bedrooms:desc", label: "Most Bedrooms", icon: <Bed className="w-4 h-4" /> },
    { value: "verified:desc", label: "Verified First", icon: <BadgeCheck className="w-4 h-4" /> },
    { value: "featured:desc", label: "Featured First", icon: <Star className="w-4 h-4" /> },
  ];

  // Handle sort change
  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split(":");
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
      page: 1
    }));
  };

  // Get current sort value
  const getCurrentSortValue = () => {
    return `${filters.sortBy || 'createdAt'}:${filters.sortOrder || 'desc'}`;
  };

  // Active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'sortBy' && key !== 'sortOrder' && key !== 'page' && key !== 'limit') {
        if (value && value !== '' && value !== '0') {
          count++;
        }
      }
    });
    return count;
  };

  // Render filter section
  const renderFilterSection = (title, icon, sectionKey, children, badge = null) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            {icon}
          </div>
          <div className="text-left">
            <span className="font-semibold text-gray-900 block">{title}</span>
            {badge && (
              <span className="text-xs text-gray-500">{badge}</span>
            )}
          </div>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );

  // Quick filters - UPDATED to match backend values
  const quickFilters = [
    { 
      label: "Ready to Move", 
      value: "ready", 
      icon: <CheckCircle className="w-4 h-4" />,
      filterKey: "possessionStatus",
      filterValue: "ready-to-move"
    },
    { 
      label: "Furnished", 
      value: "furnished", 
      icon: <Home className="w-4 h-4" />,
      filterKey: "furnishing",
      filterValue: "fully-furnished"
    },
    { 
      label: "Verified", 
      value: "verified", 
      icon: <BadgeCheck className="w-4 h-4" />,
      filterKey: "isVerified",
      filterValue: "true"
    },
    // { 
    //   label: "Featured", 
    //   value: "featured", 
    //   icon: <Star className="w-4 h-4" />,
    //   filterKey: "isFeatured",
    //   filterValue: "true"
    // },
    { 
      label: "For Sale", 
      value: "sale", 
      icon: <DollarSign className="w-4 h-4" />,
      filterKey: "listingType",
      filterValue: "sale"
    },
    { 
      label: "For Rent", 
      value: "rent", 
      icon: <Calendar className="w-4 h-4" />,
      filterKey: "listingType",
      filterValue: "rent"
    },
  ];

  // Handle quick filter click
  const handleQuickFilterClick = (filterKey, filterValue) => {
    handleFilterChange(filterKey, filterValue);
  };

  // Area range presets for quick selection
  const areaPresets = [
    { label: "0-500 sq.ft.", min: 0, max: 500 },
    { label: "500-1000 sq.ft.", min: 500, max: 1000 },
    { label: "1000-1500 sq.ft.", min: 1000, max: 1500 },
    { label: "1500-2000 sq.ft.", min: 1500, max: 2000 },
    { label: "2000+ sq.ft.", min: 2000, max: 10000 },
  ];

  // Handle area preset click
  const handleAreaPresetClick = (min, max) => {
    handleFilterChange("minArea", min);
    handleFilterChange("maxArea", max);
  };

  // Render filter panel
  const renderFilterPanel = () => (
    <div className="space-y-6">
      {/* Quick Filters */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Lightning className="w-4 h-4" />
          Quick Filters
        </h4>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => {
            const isActive = filters[filter.filterKey] === filter.filterValue;
            return (
              <button
                key={filter.value}
                onClick={() => handleQuickFilterClick(filter.filterKey, isActive ? "" : filter.filterValue)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Basic Filters */}
      {renderFilterSection(
        "Basic Filters",
        <FilterIcon className="w-5 h-5" />,
        "basic",
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Cities</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <div className="relative">
                <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  {availableBedrooms.map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Bed' : 'Beds'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
              <select
                value={filters.listingType}
                onChange={(e) => handleFilterChange("listingType", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {listingTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'pg' ? 'PG' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
              <div className="relative">
                <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange("bathrooms", e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Bath' : 'Baths'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Area Range - FIXED: Uses minArea and maxArea */}
      {renderFilterSection(
        "Area Range (sq.ft.)",
        <Ruler className="w-5 h-5" />,
        "area",
        <div className="space-y-4">
          {/* Area Presets */}
          <div className="flex flex-wrap gap-2 mb-4">
            {areaPresets.map((preset) => {
              const isActive = filters.minArea === preset.min.toString() && filters.maxArea === preset.max.toString();
              return (
                <button
                  key={preset.label}
                  onClick={() => handleAreaPresetClick(preset.min, preset.max)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Manual Input */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Area</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minArea}
                  onChange={(e) => handleFilterChange("minArea", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Area</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxArea}
                  onChange={(e) => handleFilterChange("maxArea", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Clear Area Filter Button */}
          {(filters.minArea || filters.maxArea) && (
            <button
              onClick={() => {
                handleFilterChange("minArea", "");
                handleFilterChange("maxArea", "");
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border-t border-gray-100 pt-4"
            >
              Clear Area Filter
            </button>
          )}
        </div>,
        (filters.minArea || filters.maxArea) 
          ? `${filters.minArea || '0'} - ${filters.maxArea || '∞'} sq.ft.`
          : null
      )}

      {/* Property Details */}
      {renderFilterSection(
        "Property Details",
        <Building2 className="w-5 h-5" />,
        "details",
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
              <select
                value={filters.furnishing}
                onChange={(e) => handleFilterChange("furnishing", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                {furnishingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Possession</label>
              <select
                value={filters.possessionStatus}
                onChange={(e) => handleFilterChange("possessionStatus", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                {possessionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kitchen Type</label>
              <select
                value={filters.kitchenType}
                onChange={(e) => handleFilterChange("kitchenType", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                {kitchenOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Admin Filters */}
      {(user?.userType === 'admin' || user?.userType === 'superadmin') && renderFilterSection(
        "Admin Filters",
        <Shield className="w-5 h-5" />,
        "admin",
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Approval Status</label>
              <select
                value={filters.approvalStatus}
                onChange={(e) => handleFilterChange("approvalStatus", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                {approvalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange("availability", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleFilterChange("isVerified", filters.isVerified === "true" ? "" : "true")}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                filters.isVerified === "true"
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Verified
            </button>

            <button
              onClick={() => handleFilterChange("isFeatured", filters.isFeatured === "true" ? "" : "true")}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                filters.isFeatured === "true"
                  ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Star className="w-4 h-4" />
              Featured
            </button>
          </div>
        </div>
      )}

      {/* Filter Actions */}
      <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
        <div className="space-y-3">
          <button
            onClick={handleApplyFilters}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      </div>
    </div>
  );

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
          <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Clear Title Hero Section */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
{/* Glowing Orbs */}
{/* Glowing Orbs */}
<div className="absolute top-4 sm:top-8 md:top-10 lg:top-12 xl:top-14 left-2 sm:left-4 md:left-6 lg:left-8 xl:left-10 
                w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 
                bg-blue-400 rounded-full filter blur-3xl opacity-25 sm:opacity-30 animate-pulse"></div>
<div className="absolute bottom-4 sm:bottom-8 md:bottom-10 lg:bottom-12 xl:bottom-14 right-2 sm:right-4 md:right-6 lg:right-8 xl:right-10 
                w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 
                bg-purple-400 rounded-full filter blur-3xl opacity-25 sm:opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

{/* Animated Clouds */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  {/* Cloud 1 */}
  <svg className="absolute top-8 sm:top-10 md:top-12 lg:top-14 xl:top-16 
                  w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 
                  opacity-35 sm:opacity-40" 
       viewBox="0 0 250 80" 
       style={{ left: '-15%' }}>
    <defs>
      <filter id="cloud-blur-1">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>
    </defs>
    <g filter="url(#cloud-blur-1)">
      <ellipse cx="60" cy="45" rx="45" ry="28" fill="white" className="opacity-60 sm:opacity-70"/>
      <ellipse cx="95" cy="38" rx="38" ry="25" fill="white" className="opacity-50 sm:opacity-60"/>
      <ellipse cx="125" cy="42" rx="35" ry="22" fill="white" className="opacity-55 sm:opacity-65"/>
      <ellipse cx="75" cy="52" rx="32" ry="20" fill="white" className="opacity-45 sm:opacity-55"/>
      <ellipse cx="105" cy="50" rx="40" ry="26" fill="white" className="opacity-50 sm:opacity-60"/>
      <ellipse cx="140" cy="48" rx="30" ry="18" fill="white" className="opacity-40 sm:opacity-50"/>
    </g>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="2000 0" dur="50s" repeatCount="indefinite"/>
  </svg>

  {/* Cloud 2 */}
  <svg className="absolute top-20 sm:top-24 md:top-28 lg:top-32 xl:top-36 
                  w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 
                  opacity-30 sm:opacity-35" 
       viewBox="0 0 280 90" 
       style={{ right: '-20%' }}>
    <defs>
      <filter id="cloud-blur-2">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
      </filter>
    </defs>
    <g filter="url(#cloud-blur-2)">
      <ellipse cx="65" cy="50" rx="50" ry="30" fill="white" className="opacity-55 sm:opacity-65"/>
      <ellipse cx="105" cy="42" rx="42" ry="26" fill="white" className="opacity-60 sm:opacity-70"/>
      <ellipse cx="140" cy="48" rx="45" ry="28" fill="white" className="opacity-50 sm:opacity-60"/>
      <ellipse cx="80" cy="58" rx="38" ry="24" fill="white" className="opacity-45 sm:opacity-55"/>
      <ellipse cx="115" cy="55" rx="36" ry="22" fill="white" className="opacity-50 sm:opacity-60"/>
      <ellipse cx="150" cy="52" rx="32" ry="20" fill="white" className="opacity-40 sm:opacity-50"/>
      <ellipse cx="95" cy="48" rx="28" ry="18" fill="white" className="opacity-45 sm:opacity-55"/>
    </g>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="-2200 0" dur="60s" repeatCount="indefinite"/>
  </svg>

  {/* Cloud 3 */}
  <svg className="absolute top-36 sm:top-40 md:top-44 lg:top-48 xl:top-52 
                  w-44 sm:w-52 md:w-60 lg:w-68 xl:w-76 
                  opacity-32 sm:opacity-38" 
       viewBox="0 0 260 85" 
       style={{ left: '-18%' }}>
    <defs>
      <filter id="cloud-blur-3">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" />
      </filter>
    </defs>
    <g filter="url(#cloud-blur-3)">
      <ellipse cx="70" cy="48" rx="48" ry="30" fill="white" className="opacity-58 sm:opacity-68"/>
      <ellipse cx="110" cy="40" rx="40" ry="24" fill="white" className="opacity-52 sm:opacity-62"/>
      <ellipse cx="140" cy="45" rx="38" ry="26" fill="white" className="opacity-48 sm:opacity-58"/>
      <ellipse cx="85" cy="55" rx="35" ry="22" fill="white" className="opacity-50 sm:opacity-60"/>
      <ellipse cx="120" cy="52" rx="42" ry="28" fill="white" className="opacity-55 sm:opacity-65"/>
      <ellipse cx="155" cy="50" rx="28" ry="18" fill="white" className="opacity-42 sm:opacity-52"/>
    </g>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="2100 0" dur="70s" repeatCount="indefinite"/>
  </svg>

  {/* Cloud 4 */}
  <svg className="absolute top-52 sm:top-56 md:top-60 lg:top-64 xl:top-68 
                  w-52 sm:w-60 md:w-68 lg:w-76 xl:w-84 
                  opacity-28 sm:opacity-32" 
       viewBox="0 0 290 95" 
       style={{ right: '-22%' }}>
    <defs>
      <filter id="cloud-blur-4">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" />
      </filter>
    </defs>
    <g filter="url(#cloud-blur-4)">
      <ellipse cx="75" cy="52" rx="52" ry="32" fill="white" className="opacity-56 sm:opacity-66"/>
      <ellipse cx="115" cy="45" rx="45" ry="28" fill="white" className="opacity-60 sm:opacity-70"/>
      <ellipse cx="150" cy="50" rx="48" ry="30" fill="white" className="opacity-53 sm:opacity-63"/>
      <ellipse cx="90" cy="60" rx="40" ry="25" fill="white" className="opacity-48 sm:opacity-58"/>
      <ellipse cx="125" cy="58" rx="38" ry="24" fill="white" className="opacity-52 sm:opacity-62"/>
    </g>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="-2300 0" dur="55s" repeatCount="indefinite"/>
  </svg>

  {/* Additional Cloud 5 for more coverage */}
  <svg className="absolute top-64 sm:top-68 md:top-72 lg:top-76 xl:top-80 
                  w-36 sm:w-44 md:w-52 lg:w-60 xl:w-68 
                  opacity-25 sm:opacity-30" 
       viewBox="0 0 240 75" 
       style={{ left: '-12%' }}>
    <defs>
      <filter id="cloud-blur-5">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
      </filter>
    </defs>
    <g filter="url(#cloud-blur-5)">
      <ellipse cx="50" cy="40" rx="40" ry="25" fill="white" className="opacity-55 sm:opacity-65"/>
      <ellipse cx="85" cy="35" rx="35" ry="22" fill="white" className="opacity-50 sm:opacity-60"/>
      <ellipse cx="115" cy="38" rx="32" ry="20" fill="white" className="opacity-45 sm:opacity-55"/>
      <ellipse cx="65" cy="45" rx="28" ry="18" fill="white" className="opacity-40 sm:opacity-50"/>
      <ellipse cx="95" cy="43" rx="30" ry="19" fill="white" className="opacity-48 sm:opacity-58"/>
      <ellipse cx="125" cy="42" rx="25" ry="16" fill="white" className="opacity-38 sm:opacity-48"/>
    </g>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="1900 0" dur="65s" repeatCount="indefinite"/>
  </svg>
</div>

{/* Flying Birds */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  {/* Bird 1 */}
  <svg className="absolute top-12 sm:top-16 md:top-20 lg:top-24 xl:top-28 
                  w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9" 
       viewBox="0 0 24 24" fill="none" style={{ left: '-5%' }}>
    <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
          stroke="white" 
          strokeWidth="1.2 sm:stroke-width-1.4 md:stroke-width-1.5" 
          strokeLinecap="round" 
          className="opacity-60 sm:opacity-65 md:opacity-70">
      <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.5s" repeatCount="indefinite"/>
    </path>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="1800 -30" dur="40s" repeatCount="indefinite"/>
  </svg>

  {/* Bird 2 */}
  <svg className="absolute top-28 sm:top-32 md:top-36 lg:top-40 xl:top-44 
                  w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" 
       viewBox="0 0 24 24" fill="none" style={{ right: '-5%' }}>
    <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
          stroke="white" 
          strokeWidth="1.1 sm:stroke-width-1.3 md:stroke-width-1.5" 
          strokeLinecap="round" 
          className="opacity-55 sm:opacity-58 md:opacity-60">
      <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.4s" repeatCount="indefinite"/>
    </path>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="-1900 -20" dur="45s" repeatCount="indefinite"/>
  </svg>

  {/* Bird 3 */}
  <svg className="absolute top-16 sm:top-20 md:top-24 lg:top-28 xl:top-32 
                  w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" 
       viewBox="0 0 24 24" fill="none" style={{ left: '-5%' }}>
    <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
          stroke="white" 
          strokeWidth="1.1 sm:stroke-width-1.3 md:stroke-width-1.5" 
          strokeLinecap="round" 
          className="opacity-45 sm:opacity-48 md:opacity-50">
      <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.45s" repeatCount="indefinite"/>
    </path>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="2000 -40" dur="52s" repeatCount="indefinite"/>
  </svg>

  {/* Bird 4 */}
  <svg className="absolute top-24 sm:top-28 md:top-32 lg:top-36 xl:top-40 
                  w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9" 
       viewBox="0 0 24 24" fill="none" style={{ right: '-5%' }}>
    <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
          stroke="white" 
          strokeWidth="1.2 sm:stroke-width-1.4 md:stroke-width-1.5" 
          strokeLinecap="round" 
          className="opacity-60 sm:opacity-62 md:opacity-65">
      <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.42s" repeatCount="indefinite"/>
    </path>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="-1850 -25" dur="42s" repeatCount="indefinite"/>
  </svg>

  {/* Bird 5 */}
  <svg className="absolute top-32 sm:top-36 md:top-40 lg:top-44 xl:top-48 
                  w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" 
       viewBox="0 0 24 24" fill="none" style={{ left: '-5%' }}>
    <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
          stroke="white" 
          strokeWidth="0.8 sm:stroke-width-1.0 md:stroke-width-1.2 lg:stroke-width-1.5" 
          strokeLinecap="round" 
          className="opacity-50 sm:opacity-52 md:opacity-55">
      <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.48s" repeatCount="indefinite"/>
    </path>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="1950 -35" dur="58s" repeatCount="indefinite"/>
  </svg>

  {/* Bird 6 */}
  <svg className="absolute top-40 sm:top-44 md:top-48 lg:top-52 xl:top-56 
                  w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" 
       viewBox="0 0 24 24" fill="none" style={{ right: '-5%' }}>
    <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
          stroke="white" 
          strokeWidth="1.1 sm:stroke-width-1.3 md:stroke-width-1.5" 
          strokeLinecap="round" 
          className="opacity-57 sm:opacity-60 md:opacity-62">
      <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.46s" repeatCount="indefinite"/>
    </path>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="-2000 -28" dur="48s" repeatCount="indefinite"/>
  </svg>

  {/* Bird 7 - Extra for larger screens */}
  <svg className="absolute top-48 sm:top-52 md:top-56 lg:top-60 xl:top-64 
                  w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 hidden sm:block" 
       viewBox="0 0 24 24" fill="none" style={{ left: '-5%' }}>
    <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
          stroke="white" 
          strokeWidth="0.8 sm:stroke-width-1.0 md:stroke-width-1.2" 
          strokeLinecap="round" 
          className="opacity-40 sm:opacity-45">
      <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.47s" repeatCount="indefinite"/>
    </path>
    <animateTransform attributeName="transform" type="translate" from="0 0" to="1850 -45" dur="50s" repeatCount="indefinite"/>
  </svg>
</div>
        {/* Glowing Orbs */}
        <div className="absolute top-10 left-4 w-48 h-48 sm:w-96 sm:h-96 bg-blue-400 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-400 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* City Skyline Silhouette Background */}
        <div className="absolute bottom-0 left-0 right-0 w-full opacity-15">
          <svg viewBox="0 0 600 200" className="w-full h-auto" preserveAspectRatio="xMidYMid slice">
            {/* Trees on left */}
            <circle cx="15" cy="180" r="12" fill="rgba(255,255,255,0.8)"/>
            <rect x="12" y="180" width="6" height="20" fill="rgba(255,255,255,0.8)"/>
            
            <circle cx="35" cy="175" r="10" fill="rgba(255,255,255,0.8)"/>
            <rect x="32" y="175" width="6" height="25" fill="rgba(255,255,255,0.8)"/>
            
            {/* Building 1 - Short left */}
            <rect x="50" y="120" width="40" height="80" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(8)].map((_, i) => (
                <g key={`b1-${i}`}>
                  <rect x="55" y={125 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="63" y={125 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="71" y={125 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="79" y={125 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 2 - Curved top */}
            <path d="M 95 90 Q 115 85 135 90 L 135 200 L 95 200 Z" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(11)].map((_, i) => (
                <g key={`b2-${i}`}>
                  <rect x="100" y={95 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="110" y={95 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="120" y={95 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 3 - Tall antenna tower */}
            <rect x="145" y="60" width="15" height="140" fill="rgba(255,255,255,0.9)"/>
            <rect x="150" y="40" width="5" height="25" fill="rgba(255,255,255,0.9)"/>
            <circle cx="152.5" cy="38" r="3" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(14)].map((_, i) => (
                <rect key={`b3-${i}`} x="148" y={65 + i * 10} width="9" height="6" fill="rgba(100,150,200,0.6)"/>
              ))}
            </g>
            
            {/* Building 4 - Medium */}
            <rect x="165" y="110" width="30" height="90" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(9)].map((_, i) => (
                <g key={`b4-${i}`}>
                  <rect x="169" y={115 + i * 10} width="4" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="176" y={115 + i * 10} width="4" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="183" y={115 + i * 10} width="4" height="6" fill="rgba(100,150,200,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 5 - Tallest center */}
            <rect x="200" y="20" width="50" height="180" fill="rgba(255,255,255,0.95)"/>
            <g>
              {[...Array(18)].map((_, i) => (
                <g key={`b5-${i}`}>
                  <rect x="205" y={25 + i * 10} width="6" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="214" y={25 + i * 10} width="6" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="223" y={25 + i * 10} width="6" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="232" y={25 + i * 10} width="6" height="6" fill="rgba(100,150,200,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 6 - Diagonal top */}
            <path d="M 255 50 L 295 70 L 295 200 L 255 200 Z" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(13)].map((_, i) => (
                <g key={`b6-${i}`}>
                  <rect x="260" y={75 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="268" y={75 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="276" y={75 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 7 - Small with horizontal lines */}
            <rect x="300" y="130" width="35" height="70" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(14)].map((_, i) => (
                <rect key={`b7-${i}`} x="303" y={133 + i * 5} width="29" height="2" fill="rgba(100,150,200,0.5)"/>
              ))}
            </g>
            
            {/* Building 8 - Stepped top */}
            <rect x="340" y="80" width="40" height="120" fill="rgba(255,255,255,0.9)"/>
            <rect x="345" y="65" width="30" height="15" fill="rgba(255,255,255,0.9)"/>
            <rect x="350" y="55" width="20" height="10" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(12)].map((_, i) => (
                <g key={`b8-${i}`}>
                  <rect x="345" y={85 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="353" y={85 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="361" y={85 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="369" y={85 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 9 - Tall right */}
            <rect x="385" y="40" width="45" height="160" fill="rgba(255,255,255,0.95)"/>
            <g>
              {[...Array(16)].map((_, i) => (
                <g key={`b9-${i}`}>
                  <rect x="390" y={45 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="398" y={45 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="406" y={45 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="414" y={45 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                  <rect x="422" y={45 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Building 10 - Modern slanted */}
            <path d="M 435 90 L 470 70 L 470 200 L 435 200 Z" fill="rgba(255,255,255,0.9)"/>
            <g>
              {[...Array(13)].map((_, i) => (
                <g key={`b10-${i}`}>
                  <rect x="440" y={95 + i * 8} width="5" height="5" fill="rgba(100,150,200,0.6)"/>
                  <rect x="448" y={90 + i * 8} width="5" height="5" fill="rgba(100,150,200,0.6)"/>
                  <rect x="456" y={85 + i * 8} width="5" height="5" fill="rgba(100,150,200,0.6)"/>
                </g>
              ))}
            </g>
            
            {/* Trees on right */}
            <circle cx="485" cy="178" r="11" fill="rgba(255,255,255,0.8)"/>
            <rect x="482" y="178" width="6" height="22" fill="rgba(255,255,255,0.8)"/>
            
            <circle cx="505" cy="175" r="13" fill="rgba(255,255,255,0.8)"/>
            <rect x="501" y="175" width="8" height="25" fill="rgba(255,255,255,0.8)"/>
            
            <circle cx="530" cy="180" r="12" fill="rgba(255, 255, 255, 0.8)"/>
            <rect x="527" y="180" width="6" height="20" fill="rgba(255,255,255,0.8)"/>
                <circle cx="560" cy="180" r="12" fill="rgba(255,255,255,0.8)"/>
            <rect x="557" y="185" width="6" height="20" fill="rgba(255,255,255,0.8)"/>
          </svg>
        </div>

        {/* Large Building Illustration - Fully at Bottom, Proportional & Responsive */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-32 sm:h-40 md:h-56 lg:h-72 xl:h-80">
          <svg viewBox="0 0 1200 300" className="w-full h-full opacity-30" preserveAspectRatio="xMidYMax meet">
            <defs>
              <linearGradient id="mainBuildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.5)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.15)"/>
              </linearGradient>
              <linearGradient id="leftBuildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.45)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.12)"/>
              </linearGradient>
              <linearGradient id="rightBuildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.48)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.18)"/>
              </linearGradient>
            </defs>

            {/* Floating Property Icons */}
            <circle cx="200" cy="30" r="4" fill="rgba(255,255,255,0.6)">
              <animate attributeName="cy" values="30;20;30" dur="4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite"/>
            </circle>
            <circle cx="620" cy="20" r="5" fill="rgba(255,255,255,0.7)">
              <animate attributeName="cy" values="20;10;20" dur="5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.7;1;0.7" dur="5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="850" cy="40" r="4" fill="rgba(255,255,255,0.6)">
              <animate attributeName="cy" values="40;30;40" dur="4.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;1;0.6" dur="4.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="1050" cy="50" r="3" fill="rgba(255,255,255,0.5)">
              <animate attributeName="cy" values="50;40;50" dur="4.2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0.9;0.5" dur="4.2s" repeatCount="indefinite"/>
            </circle>

            {/* Building Skyline - Adjusted for bottom positioning */}
            {/* Left Building Group */}
       

            {/* Center Tall Building */}
     

  





          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto w-full">
            {/* Hero Text */}
            <div className="text-center mb-6 sm:mb-10 lg:mb-12">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 lg:mb-6 px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/20 transition-all duration-300">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="5" fill="#FCD34D" className="animate-pulse"/>
                  <g stroke="#FCD34D" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="1" x2="12" y2="3">
                      <animate attributeName="y2" values="3;4;3" dur="2s" repeatCount="indefinite"/>
                    </line>
                    <line x1="12" y1="21" x2="12" y2="23">
                      <animate attributeName="y1" values="21;20;21" dur="2s" repeatCount="indefinite"/>
                    </line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64">
                      <animate attributeName="x2" values="5.64;6.44;5.64" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="y2" values="5.64;6.44;5.64" dur="2s" repeatCount="indefinite"/>
                    </line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78">
                      <animate attributeName="x1" values="18.36;17.56;18.36" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="y1" values="18.36;17.56;18.36" dur="2s" repeatCount="indefinite"/>
                    </line>
                    <line x1="1" y1="12" x2="3" y2="12">
                      <animate attributeName="x2" values="3;4;3" dur="2s" repeatCount="indefinite"/>
                    </line>
                    <line x1="21" y1="12" x2="23" y2="12">
                      <animate attributeName="x1" values="21;20;21" dur="2s" repeatCount="indefinite"/>
                    </line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36">
                      <animate attributeName="x2" values="5.64;6.44;5.64" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="y2" values="18.36;17.56;18.36" dur="2s" repeatCount="indefinite"/>
                    </line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22">
                      <animate attributeName="x1" values="18.36;17.56;18.36" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="y1" values="5.64;6.44;5.64" dur="2s" repeatCount="indefinite"/>
                    </line>
                  </g>
                </svg>
                <span className="text-white font-semibold text-xs sm:text-xs lg:text-sm tracking-wider">100% CLEAR TITLE PROPERTIES</span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 lg:mb-6 text-white leading-tight tracking-tight px-2">
                Clear Title,
                <span className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent mt-1 sm:mt-2">
                  Clear Future
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 font-light mb-4 sm:mb-6 lg:mb-8 max-w-3xl mx-auto px-4">
                Invest with Confidence in Completely Verified Properties
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4">
                <div className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-yellow-300" />
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">{formatNumber(allPropertyUnits.length)}+</div>
                  </div>
                  <div className="text-xs sm:text-xs lg:text-sm text-blue-100">Clear Title Properties</div>
                </div>
                
                <div className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-300" />
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">100%</div>
                  </div>
                  <div className="text-xs sm:text-xs lg:text-sm text-blue-100">Verification Rate</div>
                </div>
                
                <div className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-red-300" />
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">{formatNumber(availableCities.length)}+</div>
                  </div>
                  <div className="text-xs sm:text-xs lg:text-sm text-blue-100">Prime Locations</div>
                </div>
                
                <div className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 mb-1">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-purple-300" />
                    <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">Legal</div>
                  </div>
                  <div className="text-xs sm:text-xs lg:text-sm text-blue-100">Complete Documentation</div>
                </div>
              </div>

              {/* Clear Title Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 max-w-4xl mx-auto mb-6 sm:mb-8 lg:mb-12 px-2 sm:px-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-yellow-300 mx-auto mb-1 sm:mb-2 lg:mb-3" />
                  <h3 className="text-white font-bold text-xs sm:text-sm lg:text-base mb-1">Clear Title Guarantee</h3>
                  <p className="text-blue-100 text-xs sm:text-xs lg:text-sm">
                    Every property comes with verified clear title documentation
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-300 mx-auto mb-1 sm:mb-2 lg:mb-3" />
                  <h3 className="text-white font-bold text-xs sm:text-sm lg:text-base mb-1">Legal Verification</h3>
                  <p className="text-blue-100 text-xs sm:text-xs lg:text-sm">
                    Thorough legal checks and complete compliance assurance
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-300 mx-auto mb-1 sm:mb-2 lg:mb-3" />
                  <h3 className="text-white font-bold text-xs sm:text-sm lg:text-base mb-1">Complete Transparency</h3>
                  <p className="text-blue-100 text-xs sm:text-xs lg:text-sm">
                    No hidden clauses, full disclosure on every property
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300 lg:col-span-3">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-300 mx-auto mb-1 sm:mb-2 lg:mb-3" />
                  <h3 className="text-white font-bold text-xs sm:text-sm lg:text-base mb-1">Paperwork & Documentation</h3>
                  <p className="text-blue-100 text-xs sm:text-xs lg:text-sm text-center max-w-md mx-auto">
                    Khata conversion, registration, legal paperwork, and complete documentation support.
                  </p>
                </div>
              </div>

              {/* Main Search Bar */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-2 max-w-3xl mx-auto hover:shadow-3xl transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="text"
                        placeholder="Search by location, project, or keyword..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-gray-900 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base lg:text-lg"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-2 sm:bottom-4 lg:bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
          </div>
        </div>
      </div>

{/* Property Categories */}
<div className="container mx-auto px-3 sm:px-4 lg:px-6 -mt-6 sm:-mt-8 relative z-20">
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-1 sm:p-2">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 px-3 sm:px-4 pt-3 sm:pt-4">
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Property Categories</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Browse properties by type
        </p>
      </div>
      <div className="text-xs sm:text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg">
        {formatNumber(allPropertyUnits.length)} properties
      </div>
    </div>

    {/* Categories Grid - Mobile (2 columns) */}
    <div className="lg:hidden px-2 pb-2">
      <div className="grid grid-cols-2 gap-2">
        {propertyCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`flex flex-col items-center justify-center transition-all duration-300 ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
            } ${
              category.count === 0 ? 'opacity-60' : ''
            }`}
            style={{
              padding: '1rem 0.5rem',
              borderRadius: '0.75rem',
            }}
            disabled={category.count === 0}
          >
            <div className="mb-2 flex-shrink-0">
              {React.cloneElement(category.icon, {
                className: `w-5 h-5 ${
                  activeCategory === category.id 
                    ? 'text-white' 
                    : category.count === 0
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`
              })}
            </div>
            
            <span className={`font-medium text-center ${
              activeCategory === category.id ? 'text-white' : 'text-gray-800'
            } text-sm truncate w-full px-1`}>
              {category.name}
            </span>
            
            <span className={`mt-1 ${
              activeCategory === category.id 
                ? 'text-blue-100' 
                : category.count === 0
                ? 'text-gray-400'
                : 'text-gray-600'
            } text-xs font-medium`}>
              {category.count === 0 ? 'No properties' : `${formatNumber(category.count)} ${category.count === 1 ? 'property' : 'properties'}`}
            </span>
          </button>
        ))}
      </div>
    </div>

    {/* Categories - Desktop (Horizontal Scroll) */}
    <div className="hidden lg:block relative">
      {/* Scroll Indicators - Desktop */}
      <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

      {/* Categories Container - Desktop */}
      <div 
        ref={categoryScrollRef}
        className="hidden lg:flex space-x-3 pb-4 px-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {propertyCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300 whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
            } ${
              category.count === 0 ? 'opacity-60' : ''
            }`}
            style={{
              minWidth: '120px',
              maxWidth: '140px',
              padding: '1rem 1.5rem',
              borderRadius: '1rem',
              transform: activeCategory === category.id ? 'scale(1.05)' : 'scale(1)'
            }}
            disabled={category.count === 0}
          >
            <div className="mb-2 flex-shrink-0">
              {React.cloneElement(category.icon, {
                className: `w-5 h-5 ${
                  activeCategory === category.id 
                    ? 'text-white' 
                    : category.count === 0
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`
              })}
            </div>
            
            <span className={`font-medium text-center text-sm truncate w-full`}>
              {category.name}
            </span>
            
            <span className={`mt-1 text-xs ${
              activeCategory === category.id 
                ? 'text-blue-100' 
                : category.count === 0
                ? 'text-gray-400'
                : 'text-gray-500'
            } font-medium`}>
              {category.count === 0 ? 'No properties' : `${formatNumber(category.count)} ${category.count === 1 ? 'property' : 'properties'}`}
            </span>
          </button>
        ))}
      </div>
    </div>

    {/* Quick Filter Chips for Mobile */}
    {isMobile && (
      <div className="px-3 pt-3 border-t border-gray-100 mt-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('isVerified', filters.isVerified === 'true' ? '' : 'true')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              filters.isVerified === 'true'
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            Verified
          </button>
          <button
            onClick={() => handleFilterChange('possessionStatus', 'ready-to-move')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              filters.possessionStatus === 'ready-to-move'
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-3 h-3" />
            Ready to Move
          </button>
          <button
            onClick={() => handleFilterChange('furnishing', 'fully-furnished')}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              filters.furnishing === 'fully-furnished'
                ? 'bg-orange-100 border-orange-300 text-orange-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-3 h-3" />
            Furnished
          </button>
        </div>
      </div>
    )}

    {/* Selected Category Info */}
    {activeCategory !== 'all' && (
      <div className="px-3 sm:px-4 pt-3 border-t border-gray-200 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              activeCategory === 'all' ? 'bg-blue-100' :
              activeCategory === 'Apartment' ? 'bg-blue-100' :
              activeCategory === 'Villa' ? 'bg-purple-100' :
              activeCategory === 'Independent House' ? 'bg-green-100' :
              activeCategory === 'Plot' ? 'bg-yellow-100' :
              activeCategory === 'Penthouse' ? 'bg-pink-100' :
              activeCategory === 'Studio' ? 'bg-indigo-100' :
              activeCategory === 'Duplex' ? 'bg-cyan-100' :
              'bg-gray-100'
            }`}>
              {React.cloneElement(propertyCategories.find(c => c.id === activeCategory)?.icon || <Home className="w-4 h-4" />, {
                className: `w-4 h-4 ${
                  activeCategory === 'all' ? 'text-blue-600' :
                  activeCategory === 'Apartment' ? 'text-blue-600' :
                  activeCategory === 'Villa' ? 'text-purple-600' :
                  activeCategory === 'Independent House' ? 'text-green-600' :
                  activeCategory === 'Plot' ? 'text-yellow-600' :
                  activeCategory === 'Penthouse' ? 'text-pink-600' :
                  activeCategory === 'Studio' ? 'text-indigo-600' :
                  activeCategory === 'Duplex' ? 'text-cyan-600' :
                  'text-gray-600'
                }`
              })}
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">
                {propertyCategories.find(c => c.id === activeCategory)?.name}
              </span>
              <span className="block text-xs text-gray-600">
                {formatNumber(propertyCategories.find(c => c.id === activeCategory)?.count)} properties available
              </span>
            </div>
          </div>
          <button
            onClick={() => handleCategoryClick('all')}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            View All
          </button>
        </div>
      </div>
    )}
  </div>
</div>
      {/* Main Content */}
<div className="px-0 lg:px-4 py-4 lg:py-8">
  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-[1920px] mx-auto">
    {/* Filters Sidebar - Desktop */}
    <div className={`hidden lg:block transition-all duration-300 ${
      isFilterPanelOpen ? 'lg:w-72 xl:w-80' : 'lg:w-16'
    }`}>
      <div className="sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Filters Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
              </button>
              {isFilterPanelOpen && (
                <>
                  <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {getActiveFilterCount()} active
                    </span>
                  )}
                </>
              )}
            </div>
            {isFilterPanelOpen && getActiveFilterCount() > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {isFilterPanelOpen && (
          <div className="bg-white rounded-xl shadow-lg p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {renderFilterPanel()}
          </div>
        )}
      </div>
    </div>

    {/* Main Content Area */}
    <div className="flex-1 lg:min-w-0 px-4 lg:px-0" ref={propertyGridRef}>
      {/* Mobile Header with Integrated Filter Button */}
      <div className="lg:hidden mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                Properties in {filters.city || "All Cities"}
                {filters.propertyType && ` • ${filters.propertyType}`}
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Showing <span className="font-bold text-blue-600">{propertyUnits.length}</span> of{" "}
                <span className="font-semibold">{formatNumber(totalResults)}</span> properties
              </p>
            </div>
            
            {/* Filter Button for Mobile */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span className="font-semibold text-sm">Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-white text-blue-600 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px]">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>

          {/* Sort Dropdown Only - Mobile (View Toggle Removed) */}
          <div className="flex items-center justify-end pt-3 border-t border-gray-100">
            {/* Sort Dropdown - Mobile */}
            <div className="relative">
              <select
                value={getCurrentSortValue()}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 font-medium text-sm min-w-[140px] hover:border-gray-300 transition-colors"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Active Filters Display - Mobile */}
          {getActiveFilterCount() > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Active filters:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(filters).map(([key, value]) => {
                    if (!value || key === 'sortBy' || key === 'sortOrder' || key === 'page' || key === 'limit') return null;
                    
                    let displayValue = value;
                    let bgColor = "bg-blue-50";
                    let textColor = "text-blue-700";
                    let borderColor = "border-blue-100";
                    
                    if (key === 'city') {
                      displayValue = `${value}`;
                    } else if (key === 'propertyType') {
                      displayValue = `Type: ${value}`;
                      bgColor = "bg-green-50";
                      textColor = "text-green-700";
                      borderColor = "border-green-100";
                    } else if (key === 'bedrooms') {
                      displayValue = `${value} Beds`;
                      bgColor = "bg-purple-50";
                      textColor = "text-purple-700";
                      borderColor = "border-purple-100";
                    } else if (key === 'bathrooms') {
                      displayValue = `${value} Baths`;
                      bgColor = "bg-indigo-50";
                      textColor = "text-indigo-700";
                      borderColor = "border-indigo-100";
                    } else if (key === 'listingType') {
                      displayValue = `Listing: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
                      bgColor = "bg-orange-50";
                      textColor = "text-orange-700";
                      borderColor = "border-orange-100";
                    } else if (key === 'isVerified' && value === 'true') {
                      displayValue = "Verified";
                      bgColor = "bg-green-50";
                      textColor = "text-green-700";
                      borderColor = "border-green-100";
                    } else if (key === 'isFeatured' && value === 'true') {
                      displayValue = "Featured";
                      bgColor = "bg-yellow-50";
                      textColor = "text-yellow-700";
                      borderColor = "border-yellow-100";
                    } else if (key === 'minArea' && value) {
                      displayValue = `Min: ${value} sq.ft.`;
                      bgColor = "bg-orange-50";
                      textColor = "text-orange-700";
                      borderColor = "border-orange-100";
                    } else if (key === 'maxArea' && value) {
                      displayValue = `Max: ${value} sq.ft.`;
                      bgColor = "bg-orange-50";
                      textColor = "text-orange-700";
                      borderColor = "border-orange-100";
                    } else if (key === 'furnishing' && value) {
                      displayValue = `${value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}`;
                      bgColor = "bg-pink-50";
                      textColor = "text-pink-700";
                      borderColor = "border-pink-100";
                    } else if (key === 'possessionStatus' && value) {
                      displayValue = `${value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}`;
                      bgColor = "bg-teal-50";
                      textColor = "text-teal-700";
                      borderColor = "border-teal-100";
                    }
                    
                    return (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-1 ${bgColor} ${textColor} ${borderColor} text-xs px-2 py-1 rounded-full border truncate max-w-[150px]`}
                      >
                        <Filter className="w-3 h-3" />
                        <span className="truncate">{displayValue}</span>
                        <button
                          onClick={() => handleFilterChange(key, "")}
                          className="ml-0.5 hover:opacity-80"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Header - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">
              Properties in {filters.city || "All Cities"}
              {filters.propertyType && ` • ${filters.propertyType}`}
            </h2>
            <p className="text-gray-600 mt-1 text-base">
              Showing <span className="font-bold text-blue-600">{propertyUnits.length}</span> of{" "}
              <span className="font-semibold">{formatNumber(totalResults)}</span> properties
              {filters.search && ` matching "${filters.search}"`}
              {(filters.minArea || filters.maxArea) && ` • Area: ${filters.minArea || '0'} - ${filters.maxArea || '∞'} sq.ft.`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle - Desktop Only */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === "grid" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === "list" 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Dropdown - Desktop */}
            <div className="relative">
              <select
                value={getCurrentSortValue()}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 font-semibold text-base min-w-[180px] hover:border-gray-300 transition-colors"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Display - Desktop */}
        {getActiveFilterCount() > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || key === 'sortBy' || key === 'sortOrder' || key === 'page' || key === 'limit') return null;
                  
                  let displayValue = value;
                  let bgColor = "bg-blue-50";
                  let textColor = "text-blue-700";
                  let borderColor = "border-blue-100";
                  
                  if (key === 'city') {
                    displayValue = `${value}`;
                  } else if (key === 'propertyType') {
                    displayValue = `Type: ${value}`;
                    bgColor = "bg-green-50";
                    textColor = "text-green-700";
                    borderColor = "border-green-100";
                  } else if (key === 'bedrooms') {
                    displayValue = `${value} Beds`;
                    bgColor = "bg-purple-50";
                    textColor = "text-purple-700";
                    borderColor = "border-purple-100";
                  } else if (key === 'bathrooms') {
                    displayValue = `${value} Baths`;
                    bgColor = "bg-indigo-50";
                    textColor = "text-indigo-700";
                    borderColor = "border-indigo-100";
                  } else if (key === 'listingType') {
                    displayValue = `Listing: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
                    bgColor = "bg-orange-50";
                    textColor = "text-orange-700";
                    borderColor = "border-orange-100";
                  } else if (key === 'isVerified' && value === 'true') {
                    displayValue = "Verified";
                    bgColor = "bg-green-50";
                    textColor = "text-green-700";
                    borderColor = "border-green-100";
                  } else if (key === 'isFeatured' && value === 'true') {
                    displayValue = "Featured";
                    bgColor = "bg-yellow-50";
                    textColor = "text-yellow-700";
                    borderColor = "border-yellow-100";
                  } else if (key === 'minArea' && value) {
                    displayValue = `Min Area: ${value} sq.ft.`;
                    bgColor = "bg-orange-50";
                    textColor = "text-orange-700";
                    borderColor = "border-orange-100";
                  } else if (key === 'maxArea' && value) {
                    displayValue = `Max Area: ${value} sq.ft.`;
                    bgColor = "bg-orange-50";
                    textColor = "text-orange-700";
                    borderColor = "border-orange-100";
                  } else if (key === 'furnishing' && value) {
                    displayValue = `Furnishing: ${value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}`;
                    bgColor = "bg-pink-50";
                    textColor = "text-pink-700";
                    borderColor = "border-pink-100";
                  } else if (key === 'possessionStatus' && value) {
                    displayValue = `Possession: ${value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}`;
                    bgColor = "bg-teal-50";
                    textColor = "text-teal-700";
                    borderColor = "border-teal-100";
                  }
                  
                  return (
                    <span
                      key={key}
                      className={`inline-flex items-center gap-1 ${bgColor} ${textColor} ${borderColor} text-sm px-3 py-1.5 rounded-full border truncate max-w-[180px]`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span className="truncate">{displayValue}</span>
                      <button
                        onClick={() => handleFilterChange(key, "")}
                        className="ml-0.5 hover:opacity-80"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
              <button
                onClick={handleResetFilters}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:underline whitespace-nowrap"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Units - Mobile & Desktop */}
      {loading ? (
        renderSkeleton()
      ) : propertyUnits.length === 0 ? (
        <div className="text-center py-12 lg:py-16 bg-white rounded-xl lg:rounded-2xl shadow-lg">
          <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4 lg:mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center">
            <Home className="w-12 h-12 lg:w-16 lg:h-16 text-blue-600" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 lg:mb-3">No properties found</h3>
          <p className="text-gray-600 mb-4 lg:mb-6 max-w-md mx-auto text-sm lg:text-base">
            {getActiveFilterCount() > 0
              ? "Try adjusting your filters to see more results"
              : "No properties are currently listed. Check back soon!"}
          </p>
          {getActiveFilterCount() > 0 && (
            <button
              onClick={handleResetFilters}
              className="px-6 lg:px-8 py-2 lg:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg lg:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-sm lg:text-base shadow-lg hover:shadow-xl"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6" id="property-grid">
          {propertyUnits.map((property, index) => (
            <div key={property._id} id={`property-${property._id}`}>
              <PropertyUnitCard 
                propertyUnit={property} 
                viewMode="grid"
                index={index}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-6" id="property-list">
          {propertyUnits.map((property, index) => (
            <div key={property._id} id={`property-${property._id}`}>
              <PropertyUnitCard 
                propertyUnit={property} 
                viewMode="list"
                index={index}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="mt-8 lg:mt-12">
          <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 lg:p-6">
            <nav className="flex items-center justify-between gap-2 lg:gap-0">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 lg:gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-semibold text-sm lg:text-base transition-all ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                }`}
              >
                <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-1 lg:gap-2">
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  
                  // Always show first page
                  pages.push(1);
                  
                  // Calculate range
                  let start = Math.max(2, currentPage - 1);
                  let end = Math.min(totalPages - 1, currentPage + 1);
                  
                  // Adjust if near edges
                  if (currentPage <= 3) {
                    end = Math.min(4, totalPages - 1);
                  }
                  if (currentPage >= totalPages - 2) {
                    start = Math.max(2, totalPages - 3);
                  }
                  
                  // Add ellipsis after first if needed
                  if (start > 2) {
                    pages.push('...');
                  }
                  
                  // Add middle pages
                  for (let i = start; i <= end; i++) {
                    if (i > 1 && i < totalPages) {
                      pages.push(i);
                    }
                  }
                  
                  // Add ellipsis before last if needed
                  if (end < totalPages - 1) {
                    pages.push('...');
                  }
                  
                  // Always show last page if more than 1 page
                  if (totalPages > 1) {
                    pages.push(totalPages);
                  }
                  
                  return pages.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${index}`} className="px-2 lg:px-4 py-1 lg:py-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setFilters(prev => ({ ...prev, page }));
                          // Scroll to top of property grid
                          if (propertyGridRef.current) {
                            propertyGridRef.current.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl font-semibold text-sm lg:text-base transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                            : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 lg:gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-semibold text-sm lg:text-base transition-all ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-gray-700 hover:bg-gray-100 hover:shadow-md"
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </nav>
            
            <div className="text-center mt-4 lg:mt-6 text-xs lg:text-sm text-gray-600">
              Page {currentPage} of {totalPages} • {formatNumber(totalResults)} properties total
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Filters & Sort</h3>
                  <p className="text-sm text-gray-600">
                    {getActiveFilterCount() > 0 
                      ? `${getActiveFilterCount()} filters applied` 
                      : 'Customize your search'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {renderFilterPanel()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add Tree icon component
const Tree = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M13 17a5 5 0 0 0-10 0" />
    <path d="M18 16a6 6 0 0 0-12 0" />
    <path d="M8 16a1 1 0 0 1-1-1v-4a5 5 0 0 1 10 0v4a1 1 0 0 1-1 1Z" />
    <path d="M13 11h-2" />
  </svg>
);

export default PropertyUnitsPage;