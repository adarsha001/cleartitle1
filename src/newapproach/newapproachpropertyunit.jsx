import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { 
  Search, Filter, Grid, List, ChevronLeft, ChevronRight, 
  Home, Building, MapPin, Ruler, Bed, Bath,
  CheckCircle, XCircle, Loader2, X, ChevronDown, ChevronUp,
  DollarSign, Calendar, Layers, Star, SlidersHorizontal,
  ArrowUpDown, Maximize2, Minimize2, Building2, Building as BuildingIcon
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import CarouselSlider from './CarouselSlider';

const PropertyUnitsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Refs
  const categoryScrollRef = useRef(null);
  const propertyGridRef = useRef(null);
  const carouselRef = useRef(null);
  
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
  const [activeListingCategory, setActiveListingCategory] = useState("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    // Basic filters
    search: searchParams.get("search") || "",
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || "",
    listingType: searchParams.get("listingType") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    
    // Area filters
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
  
  // Property type categories - COMPLETE LIST from original code
  const [propertyCategories, setPropertyCategories] = useState([
    { id: "all", name: "All Properties", icon: <Home className="w-5 h-5" />, count: 0 },
    { id: "Apartment", name: "Apartments", icon: <Building className="w-5 h-5" />, count: 0 },
    { id: "Villa", name: "Villas", icon: <Home className="w-5 h-5" />, count: 0 },
    { id: "Independent House", name: "Independent", icon: <Building2 className="w-5 h-5" />, count: 0 },
    { id: "Studio", name: "Studio", icon: <Maximize2 className="w-5 h-5" />, count: 0 },
    { id: "Penthouse", name: "Penthouses", icon: <Layers className="w-5 h-5" />, count: 0 },
    { id: "Duplex", name: "Duplex", icon: <Building2 className="w-5 h-5" />, count: 0 },
    { id: "Pg house", name: "Pg house", icon: <BuildingIcon className="w-5 h-5" />, count: 0 },
    { id: "Plot", name: "Plots", icon: <Ruler className="w-5 h-5" />, count: 0 },
    { id: "Commercial Space", name: "Commercial", icon: <Building2 className="w-5 h-5" />, count: 0 },
  ]);

  // Listing type categories
  const [listingCategories] = useState([
    { id: "all", name: "Mixed", icon: <Home className="w-5 h-5" />, count: 0 },
    { id: "rent", name: "For Rent", icon: <Calendar className="w-5 h-5" />, count: 0 },
    { id: "lease", name: "For Lease", icon: <DollarSign className="w-5 h-5" />, count: 0 },
    { id: "sale", name: "For Sale", icon: <DollarSign className="w-5 h-5" />, count: 0 },
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
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch all properties for category counts
  const fetchAllPropertiesForCategories = async () => {
    try {
      const response = await propertyUnitAPI.getPropertyUnits({ 
        limit: 1000
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
        
      } else {
        toast.error(response.data.message || "Failed to fetch properties");
      }
    } catch (error) {
      console.error("Error fetching property units:", error);
      toast.error(error.response?.data?.message || "Failed to load properties");
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Update category counts - COMPLETE from original code
  const updateCategoryCounts = (units) => {
    const propertyCategoryCounts = {
      all: units.length,
      "Apartment": units.filter(p => p.propertyType === "Apartment").length,
      "Villa": units.filter(p => p.propertyType === "Villa").length,
      "Independent House": units.filter(p => p.propertyType === "Independent House").length,
      "Studio": units.filter(p => p.propertyType === "Studio").length,
      "Penthouse": units.filter(p => p.propertyType === "Penthouse").length,
      "Duplex": units.filter(p => p.propertyType === "Duplex").length,
      "Pg house": units.filter(p => p.propertyType === "Pg house").length,
      "Plot": units.filter(p => p.propertyType === "Plot").length,
      "Commercial Space": units.filter(p => p.propertyType === "Commercial Space").length,
    };
    
    setPropertyCategories(prev => prev.map(cat => ({
      ...cat,
      count: propertyCategoryCounts[cat.id] || 0
    })));
  };

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoading(true);
      await Promise.all([
        fetchAllPropertiesForCategories(),
        fetchPropertyUnits()
      ]);
    };
    fetchData();
  }, []);

  // Fetch when filters change
  useEffect(() => {
    if (!isInitialLoading) {
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

  // Handle property category click
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    
    if (categoryId === 'all') {
      handleFilterChange('propertyType', '');
    } else {
      handleFilterChange('propertyType', categoryId);
    }
    
    if (propertyGridRef.current) {
      propertyGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle listing category click
  const handleListingCategoryClick = (categoryId) => {
    setActiveListingCategory(categoryId);
    
    if (categoryId === 'all') {
      handleFilterChange('listingType', '');
    } else {
      handleFilterChange('listingType', categoryId);
    }
    
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
    setActiveListingCategory("all");
    setShowMobileFilters(false);
    setIsFilterPanelOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPropertyUnits();
    
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
      if (propertyGridRef.current) {
        propertyGridRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
      if (propertyGridRef.current) {
        propertyGridRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [currentPage, totalPages]);

  // Options arrays
  const listingTypes = ["sale", "rent", "lease", "pg"];
  const furnishingOptions = ["unfurnished", "semi-furnished", "fully-furnished"];
  const possessionOptions = ["ready-to-move", "under-construction", "resale"];
  const kitchenOptions = ["modular", "regular", "open", "closed", "none"];
  const availabilityOptions = ["available", "sold", "rented", "under-agreement", "hold"];
  const approvalOptions = ["pending", "approved", "rejected"];

  // Sort options
  const sortOptions = [
    { value: "createdAt:desc", label: "Newest First" },
    { value: "price:asc", label: "Price: Low to High" },
    { value: "price:desc", label: "Price: High to Low" },
    { value: "carpetArea:desc", label: "Largest Area" },
    { value: "carpetArea:asc", label: "Smallest Area" },
    { value: "bedrooms:desc", label: "Most Bedrooms" },
    { value: "verified:desc", label: "Verified First" },
    { value: "featured:desc", label: "Featured First" },
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-3">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-gray-100 text-gray-600">
            {icon}
          </div>
          <span className="font-medium text-gray-900 text-sm">{title}</span>
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-3 pt-1 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );

  // Quick filters
  const quickFilters = [
    { 
      label: "Verified", 
      value: "verified",
      filterKey: "isVerified",
      filterValue: "true"
    },
    { 
      label: "Ready to Move", 
      value: "ready",
      filterKey: "possessionStatus",
      filterValue: "ready-to-move"
    },
    { 
      label: "Furnished", 
      value: "furnished",
      filterKey: "furnishing",
      filterValue: "fully-furnished"
    },
  ];

  // Handle quick filter click
  const handleQuickFilterClick = (filterKey, filterValue) => {
    handleFilterChange(filterKey, filterValue);
  };

  // Area range presets
  const areaPresets = [
    { label: "0-500", min: 0, max: 500 },
    { label: "500-1000", min: 500, max: 1000 },
    { label: "1000-1500", min: 1000, max: 1500 },
    { label: "1500-2000", min: 1500, max: 2000 },
    { label: "2000+", min: 2000, max: 10000 },
  ];

  // Handle area preset click
  const handleAreaPresetClick = (min, max) => {
    handleFilterChange("minArea", min);
    handleFilterChange("maxArea", max);
  };

  // Render filter panel
  const renderFilterPanel = () => (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search properties..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2 text-sm">Quick Filters</h4>
        <div className="flex flex-wrap gap-1">
          {quickFilters.map((filter) => {
            const isActive = filters[filter.filterKey] === filter.filterValue;
            return (
              <button
                key={filter.value}
                onClick={() => handleQuickFilterClick(filter.filterKey, isActive ? "" : filter.filterValue)}
                className={`px-2.5 py-1 text-xs border rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* City */}
      {renderFilterSection(
        "Location",
        <MapPin className="w-4 h-4" />,
        "basic",
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                {availableBedrooms.map((num) => (
                  <option key={num} value={num}>
                    {num} Beds
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Listing Type</label>
              <select
                value={filters.listingType}
                onChange={(e) => handleFilterChange("listingType", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {listingTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'pg' ? 'PG' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Area Range */}
      {renderFilterSection(
        "Area (sq.ft.)",
        <Ruler className="w-4 h-4" />,
        "area",
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {areaPresets.map((preset) => {
              const isActive = filters.minArea === preset.min.toString() && filters.maxArea === preset.max.toString();
              return (
                <button
                  key={preset.label}
                  onClick={() => handleAreaPresetClick(preset.min, preset.max)}
                  className={`px-2 py-1 text-xs border rounded transition-colors ${
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

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Area</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minArea}
                onChange={(e) => handleFilterChange("minArea", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Area</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxArea}
                onChange={(e) => handleFilterChange("maxArea", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Property Details */}
      {renderFilterSection(
        "Details",
        <Building2 className="w-4 h-4" />,
        "details",
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Furnishing</label>
            <select
              value={filters.furnishing}
              onChange={(e) => handleFilterChange("furnishing", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Possession</label>
            <select
              value={filters.possessionStatus}
              onChange={(e) => handleFilterChange("possessionStatus", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any</option>
              {possessionOptions.map((option) => (
                <option key={option} value={option}>
                  {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Admin Filters */}
      {(user?.userType === 'admin' || user?.userType === 'superadmin') && renderFilterSection(
        "Admin",
        <CheckCircle className="w-4 h-4" />,
        "admin",
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Approval Status</label>
            <select
              value={filters.approvalStatus}
              onChange={(e) => handleFilterChange("approvalStatus", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All</option>
              {approvalOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange("isVerified", filters.isVerified === "true" ? "" : "true")}
              className={`flex-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                filters.isVerified === "true"
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => handleFilterChange("isFeatured", filters.isFeatured === "true" ? "" : "true")}
              className={`flex-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                filters.isFeatured === "true"
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Featured
            </button>
          </div>
        </div>
      )}

      {/* Filter Actions */}
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <button
          onClick={handleApplyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          Apply Filters
        </button>
        <button
          onClick={handleResetFilters}
          className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          Reset All
        </button>
      </div>
    </div>
  );

  // Render loading skeleton - Updated for mobile 2-column layout
  const renderSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
          <div className="h-36 md:h-48 bg-gray-200"></div>
          <div className="p-3 md:p-4 space-y-2 md:space-y-3">
            <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2.5 md:h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="flex gap-2 md:gap-4">
              <div className="h-2.5 md:h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-2.5 md:h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render carousel skeleton
  const renderCarouselSkeleton = () => (
    <div className="h-[45vh] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-32 bg-gray-400 rounded mx-auto mb-2"></div>
          <div className="h-4 w-48 bg-gray-400 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  );

  // Render categories skeleton for mobile
  const renderMobileCategoriesSkeleton = () => (
    <div className="animate-pulse overflow-x-auto">
      <div className="flex space-x-2 pb-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex-shrink-0 px-3 py-2 rounded-lg border border-gray-200 bg-gray-100" style={{ minWidth: '90px' }}>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 w-16 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render categories skeleton for desktop
  const renderDesktopCategoriesSkeleton = () => (
    <div className="hidden md:block animate-pulse">
      <div className="flex space-x-2 pb-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex-shrink-0 px-4 py-3 rounded-lg border border-gray-200 bg-gray-100" style={{ minWidth: '100px' }}>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mb-1"></div>
              <div className="h-3 w-16 bg-gray-300 rounded mb-1"></div>
              <div className="h-2 w-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render search bar skeleton
  const renderSearchSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1">
          <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-24 h-12 bg-gray-300 rounded-lg"></div>
          <div className="md:hidden w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Carousel and Search Overlay */}
      <div className="relative mb-24 md:mb-32">
        {/* Mobile Categories Section - ABOVE THE CAROUSEL */}
        <div className="block md:hidden">
          {/* Categories Section - Positioned ABOVE carousel */}
          <div className="bg-white  px-4">
            {/* <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Browse Properties</h2>
              <p className="text-sm text-gray-600">
                {isInitialLoading ? 'Loading...' : `${formatNumber(allPropertyUnits.length)} properties available`}
              </p>
            </div> */}

            {/* Property Type Categories - Mobile Horizontal Scrollable */}
            <div className="">
              <div className="relative">
                {isInitialLoading ? renderMobileCategoriesSkeleton() : (
                  <div 
                    ref={categoryScrollRef}
                    className="flex space-x-2 pb-2 overflow-x-auto scrollbar-none -mx-4 px-4"
                    style={{ 
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                  >
                    <style>
                      {`
                        .scrollbar-none::-webkit-scrollbar {
                          display: none;
                        }
                      `}
                    </style>
                    {propertyCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`flex flex-col items-center flex-shrink-0 px-3 py-2 rounded-lg transition-all border min-w-[90px] ${
                          activeCategory === category.id
                            ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                            : 'text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="mb-1">
                          {React.cloneElement(category.icon, {
                            className: `w-4 h-4 ${
                              activeCategory === category.id ? 'text-blue-600' : 'text-gray-500'
                            }`
                          })}
                        </div>
                        <span className="text-xs font-medium truncate w-full text-center">
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel - For mobile, it comes AFTER categories */}
        <div className="h-[45vh] overflow-hidden">
          {isInitialLoading ? renderCarouselSkeleton() : <CarouselSlider />}
        </div>

        {/* Mobile Search Bar - Positioned at bottom of carousel */}
        <div className="block md:hidden">
    <div className="absolute bottom-0 left-0 right-0 z-10" style={{ transform: 'translateY(-49%)' }}>
  <div className="container mx-auto px-4">
    <div className="bg-white rounded-xl shadow-lg p-3 border-t-2 border-blue-600">
      {isInitialLoading ? renderSearchSkeleton() : (
        <div className="flex items-center gap-2">
          {/* Search Input - More compact */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search properties..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              className="w-full pl-9 pr-3 py-2.5 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          {/* Action Buttons - More compact */}
          <div className="flex gap-1.5">
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-lg font-medium transition-colors whitespace-nowrap text-sm"
            >
              Search
            </button>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-1 px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              {getActiveFilterCount() > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-1 py-0.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
        </div>

        {/* Desktop Layout - Original Design */}
        <div className="hidden md:block">
          {/* Search and Categories Overlay - Positioned 75% from bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10" style={{ transform: 'translateY(75%)' }}>
            <div className="container mx-auto px-4">
              {/* Main Search Card - No margin at bottom */}
              <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 border-t-4 border-blue-600">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
                  Find Your Dream Property
                </h2>
                
                {/* Search Bar */}
                {isInitialLoading ? renderSearchSkeleton() : (
                  <>
                    <div className="flex flex-col md:flex-row gap-3 mb-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search properties by location, project, or keyword..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                            className="w-full pl-10 pr-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSearch}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    {/* Property Type Categories - Compact Grid */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Browse by Property Type</h3>
                      {isInitialLoading ? renderDesktopCategoriesSkeleton() : (
                        <div className="relative">
                          <div className="flex space-x-2 pb-2 overflow-x-auto scrollbar-thin">
                            {propertyCategories.map((category) => (
                              <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`flex flex-col items-center flex-shrink-0 px-4 py-3 rounded-lg transition-all border ${
                                  activeCategory === category.id
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                                style={{ minWidth: '100px' }}
                              >
                                <div className="mb-1">
                                  {React.cloneElement(category.icon, {
                                    className: `w-4 h-4 ${
                                      activeCategory === category.id ? 'text-blue-600' : 'text-gray-500'
                                    }`
                                  })}
                                </div>
                                <span className="text-xs font-medium truncate w-full text-center">
                                  {category.name}
                                </span>
                                <span className="text-xs text-gray-500 mt-0.5">
                                  {category.count}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Listing Type Categories */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Listing Types</h3>
                      {isInitialLoading ? (
                        <div className="flex space-x-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-100">
                              <div className="w-4 h-4 bg-gray-300 rounded"></div>
                              <div className="h-3 w-16 bg-gray-300 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          {listingCategories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleListingCategoryClick(category.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                                activeListingCategory === category.id
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'text-gray-700 border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <div>
                                {React.cloneElement(category.icon, {
                                  className: `w-4 h-4 ${
                                    activeListingCategory === category.id ? 'text-green-600' : 'text-gray-500'
                                  }`
                                })}
                              </div>
                              <span className="text-sm font-medium">
                                {category.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
<div className=" mt-[-120px] sm:mt-80 " ref={propertyGridRef}>
        <div className="container mx-auto px-4">
          {isInitialLoading ? (
            <div className="space-y-6">
              {/* Results Header Skeleton */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              
              {/* Property Units Skeleton */}
              {renderSkeleton()}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Sidebar - Desktop */}
              <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Filters</h3>
                      {getActiveFilterCount() > 0 && (
                        <button
                          onClick={handleResetFilters}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    {getActiveFilterCount() > 0 && (
                      <div className="text-sm text-gray-600 mb-3">
                        {getActiveFilterCount()} active filter(s)
                      </div>
                    )}
                    {renderFilterPanel()}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 lg:min-w-0">
                {/* Results Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {filters.propertyType || "All Properties"} {filters.listingType ? `for ${filters.listingType}` : ""} in {filters.city || "All Cities"}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Showing {propertyUnits.length} of {formatNumber(totalResults)} properties
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* View Toggle */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`p-2 rounded transition-colors ${
                            viewMode === "grid" 
                              ? "bg-white text-blue-600 shadow-sm" 
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode("list")}
                          className={`p-2 rounded transition-colors ${
                            viewMode === "list" 
                              ? "bg-white text-blue-600 shadow-sm" 
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Sort Dropdown */}
                      <div className="relative">
                        <select
                          value={getCurrentSortValue()}
                          onChange={(e) => handleSortChange(e.target.value)}
                          className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium min-w-[140px]"
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
                  </div>

                  {/* Active Filters Display */}
                  {getActiveFilterCount() > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-gray-700">Active:</span>
                        {Object.entries(filters).map(([key, value]) => {
                          if (!value || key === 'sortBy' || key === 'sortOrder' || key === 'page' || key === 'limit') return null;
                          
                          let displayValue = value;
                          if (key === 'city') displayValue = `${value}`;
                          else if (key === 'propertyType') displayValue = `Type: ${value}`;
                          else if (key === 'bedrooms') displayValue = `${value} Beds`;
                          else if (key === 'bathrooms') displayValue = `${value} Baths`;
                          else if (key === 'listingType') displayValue = `For ${value}`;
                          else if (key === 'isVerified' && value === 'true') displayValue = "Verified";
                          else if (key === 'minArea' && value) displayValue = `Min: ${value} sq.ft.`;
                          else if (key === 'maxArea' && value) displayValue = `Max: ${value} sq.ft.`;
                          else if (key === 'furnishing' && value) displayValue = `${value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}`;
                          
                          return (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full border border-gray-200"
                            >
                              <span>{displayValue}</span>
                              <button
                                onClick={() => handleFilterChange(key, "")}
                                className="hover:text-red-600"
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Units */}
                {loading ? (
                  renderSkeleton()
                ) : propertyUnits.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                    <p className="text-gray-600 mb-4">
                      {getActiveFilterCount() > 0
                        ? "Try adjusting your filters"
                        : "No properties available"}
                    </p>
                    {getActiveFilterCount() > 0 && (
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : viewMode === "grid" ? (
                  // UPDATED: Mobile 2-column, Desktop 4-column layout
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {propertyUnits.map((property) => (
                      <PropertyUnitCard 
                        key={property._id}
                        propertyUnit={property} 
                        viewMode="compact" // New view mode for mobile
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {propertyUnits.map((property) => (
                      <PropertyUnitCard 
                        key={property._id}
                        propertyUnit={property} 
                        viewMode="list"
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !loading && (
                  <div className="mt-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <nav className="flex items-center justify-between">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            currentPage === 1
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                                className={`w-8 h-8 rounded-lg font-medium text-sm transition-colors ${
                                  currentPage === pageNum
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            currentPage === totalPages
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </nav>
                      <div className="text-center mt-3 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 h-[calc(100vh-64px)] overflow-y-auto">
              {renderFilterPanel()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyUnitsPage;