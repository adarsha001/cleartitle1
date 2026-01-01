import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { 
  Search, Filter, Grid, List, ChevronLeft, ChevronRight, 
  Home, MapPin, Building, Ruler, Bed, Bath, Car,
  CheckCircle, XCircle, Loader2, X, Menu, ChevronDown, ChevronUp,
  DollarSign, Calendar, Layers, CheckSquare, Square, Star,
  Maximize2, Minimize2, Hash, Building2, Globe, Target,
  TrendingUp, Clock, Shield, Award, Zap, Heart, Filter as FilterIcon,
  SlidersHorizontal, Sparkles, Crown, Trophy, TrendingDown,
  ArrowUpDown, Eye, EyeOff, BadgeCheck, Users, Zap as Lightning,
  Map, Navigation, Compass, Wind, Sunrise, Sunset,
  FileCheck, FileText, ShieldCheck
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
  const [allPropertyUnits, setAllPropertyUnits] = useState([]); // Store all units for category counts
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
    location: false,
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
    areaType: searchParams.get("areaType") || "carpet",
    
    // Property details
    furnishing: searchParams.get("furnishing") || "",
    possessionStatus: searchParams.get("possessionStatus") || "",
    ageOfProperty: searchParams.get("ageOfProperty") || "",
    floor: searchParams.get("floor") || "",
    totalFloors: searchParams.get("totalFloors") || "",
    parking: searchParams.get("parking") || "",
    balcony: searchParams.get("balcony") || "",
    
    // Location filters
    locality: searchParams.get("locality") || "",
    projectName: searchParams.get("projectName") || "",
    facing: searchParams.get("facing") || "",
    
    // Status filters
    availability: searchParams.get("availability") || "",
    approvalStatus: searchParams.get("approvalStatus") || "",
    isVerified: searchParams.get("isVerified") || "",
    isFeatured: searchParams.get("isFeatured") || "",
    isPremium: searchParams.get("isPremium") || "",
    
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
  const [availableLocalities, setAvailableLocalities] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  
  // Property categories for horizontal scroll - Initialize with counts
  const [propertyCategories, setPropertyCategories] = useState([
    { id: "all", name: "All Properties", icon: <Home className="w-5 h-5" />, count: 0 },
    { id: "apartment", name: "Apartments", icon: <Building className="w-5 h-5" />, count: 0 },
    { id: "villa", name: "Villas", icon: <Crown className="w-5 h-5" />, count: 0 },
    { id: "commercial", name: "Commercial  Space", icon: <Building2 className="w-5 h-5" />, count: 0 },
    { id: "plot", name: "Plots", icon: <Map className="w-5 h-5" />, count: 0 },
    { id: "penthouse", name: "Penthouses", icon: <TrendingUp className="w-5 h-5" />, count: 0 },
    { id: "farmhouse", name: "Farm Houses", icon: <Tree className="w-5 h-5" />, count: 0 },
    { id: "studio", name: "Studio", icon: <Maximize2 className="w-5 h-5" />, count: 0 },
    { id: "duplex", name: "Duplex", icon: <Layers className="w-5 h-5" />, count: 0 },
    { id: "bungalow", name: "Bungalows", icon: <Home className="w-5 h-5" />, count: 0 },
  ]);

  // Format number with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-IN');
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price && price !== 0) return '₹0';
    
    const numPrice = parseFloat(price) || 0;
    
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} L`;
    } else if (numPrice >= 1000) {
      return `₹${(numPrice / 1000).toFixed(2)} K`;
    }
    return `₹${numPrice.toLocaleString('en-IN')}`;
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
        if (value !== '' && value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0)) {
          if (key === 'isFeatured' || key === 'isVerified' || key === 'isPremium') {
            cleanFilters[key] = value === 'true';
          } else if (['bedrooms', 'bathrooms', 'floor', 'totalFloors', 'parking', 'balcony'].includes(key)) {
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
        setAvailableLocalities(response.data.filters?.availableLocalities || []);
        setAvailableProjects(response.data.filters?.availableProjects || []);
        
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

  // Update category counts - FIXED VERSION using allPropertyUnits
  const updateCategoryCounts = (units) => {
    const categoryCounts = {
      all: units.length,
      apartment: units.filter(p => {
        const type = p.propertyType?.toLowerCase() || '';
        return type.includes('apartment') || type === 'apartment';
      }).length,
      villa: units.filter(p => {
        const type = p.propertyType?.toLowerCase() || '';
        return type.includes('villa') || type === 'villa';
      }).length,
      commercial: units.filter(p => {
        const type = p.propertyType?.toLowerCase() || '';
        return type.includes('commercial') || 
               type.includes('office') || 
               type.includes('shop') ||
               type === 'commercial' ||
               type === 'office space' ||
               type === 'shop';
      }).length,
      plot: units.filter(p => {
        const type = p.propertyType?.toLowerCase() || '';
        return type.includes('plot') || 
               type === 'plot' ||
               type === 'land';
      }).length,
      penthouse: units.filter(p => {
        const type = p.propertyType?.toLowerCase() || '';
        return type.includes('penthouse') || type === 'penthouse';
      }).length,
      farmhouse: units.filter(p => {
        const type = p.propertyType?.toLowerCase() || '';
        return type.includes('farm') || 
               type.includes('farmhouse') ||
               type === 'farmhouse';
      }).length,
      studio: units.filter(p => {
        const type = p.propertyType?.toLowerCase() || '';
        return type.includes('studio') || type === 'studio';
      }).length,
      duplex: units.filter(p => {
        const type = p.propertyType?.toLowerCase() || '';
        return type.includes('duplex') || type === 'duplex';
      }).length,
      bungalow: units.filter(p => {
        const type = p.propertyType?.toLowerCase() || '';
        return type.includes('bungalow') || type === 'bungalow';
      }).length,
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
      if (value && value !== '' && value !== '0' && !(Array.isArray(value) && value.length === 0)) {
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
      // Map category IDs to property types - using capitalized values
      const typeMap = {
        apartment: 'Apartment',
        villa: 'Villa',
        commercial: 'Commercial',
        plot: 'Plot',
        penthouse: 'Penthouse',
        farmhouse: 'Farmhouse',
        studio: 'Studio',
        duplex: 'Duplex',
        bungalow: 'Bungalow'
      };
      
      handleFilterChange('propertyType', typeMap[categoryId] || '');
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
      areaType: "carpet",
      furnishing: "",
      possessionStatus: "",
      ageOfProperty: "",
      floor: "",
      totalFloors: "",
      parking: "",
      balcony: "",
      locality: "",
      projectName: "",
      facing: "",
      availability: "",
      approvalStatus: "",
      isVerified: "",
      isFeatured: "",
      isPremium: "",
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

  // Options arrays
  const listingTypes = ["Sale", "Rent", "Lease"];
  const furnishingOptions = ["Furnished", "Semi-Furnished", "Unfurnished"];
  const possessionOptions = ["Ready to Move", "Under Construction", "Pre Launch", "Resale"];
  const ageOptions = ["0-1 Years", "1-5 Years", "5-10 Years", "10+ Years", "New Launch"];
  const floorOptions = ["Ground", "1", "2", "3", "4", "5", "6-10", "11-20", "21+"];
  const facingOptions = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
  const parkingOptions = ["0", "1", "2", "3", "4+"];
  const balconyOptions = ["0", "1", "2", "3", "4+"];
  const areaTypes = ["carpet", "builtup", "super"];
  const availabilityOptions = ["Available", "Sold", "Rented", "Under Offer", "Hold"];
  const approvalOptions = ["Approved", "Pending", "Rejected"];

  // Sort options
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

  // Quick filters
  const quickFilters = [
    { label: "Ready to Move", value: "ready", icon: <CheckCircle className="w-4 h-4" /> },
    { label: "Furnished", value: "furnished", icon: <Home className="w-4 h-4" /> },
    { label: "Verified", value: "verified", icon: <BadgeCheck className="w-4 h-4" /> },
    { label: "Featured", value: "featured", icon: <Star className="w-4 h-4" /> },
    { label: "Premium", value: "premium", icon: <Crown className="w-4 h-4" /> },
    { label: "New Launch", value: "new", icon: <Zap className="w-4 h-4" /> },
  ];

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
          {quickFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                if (filter.value === 'ready') handleFilterChange('possessionStatus', 'Ready to Move');
                if (filter.value === 'furnished') handleFilterChange('furnishing', 'Furnished');
                if (filter.value === 'verified') handleFilterChange('isVerified', 'true');
                if (filter.value === 'featured') handleFilterChange('isFeatured', 'true');
                if (filter.value === 'premium') handleFilterChange('isPremium', 'true');
                if (filter.value === 'new') handleFilterChange('ageOfProperty', 'New Launch');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                (filter.value === 'ready' && filters.possessionStatus === 'Ready to Move') ||
                (filter.value === 'furnished' && filters.furnishing === 'Furnished') ||
                (filter.value === 'verified' && filters.isVerified === 'true') ||
                (filter.value === 'featured' && filters.isFeatured === 'true') ||
                (filter.value === 'premium' && filters.isPremium === 'true') ||
                (filter.value === 'new' && filters.ageOfProperty === 'New Launch')
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
              }`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
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
                    {type}
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

      {/* Area Range */}
      {renderFilterSection(
        "Area Range",
        <Ruler className="w-5 h-5" />,
        "area",
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Area (sq.ft.)</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minArea}
                onChange={(e) => handleFilterChange("minArea", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Area (sq.ft.)</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxArea}
                onChange={(e) => handleFilterChange("maxArea", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Area Type</label>
            <div className="flex gap-2">
              {areaTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange("areaType", type)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    filters.areaType === type
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type === 'carpet' ? 'Carpet' : type === 'builtup' ? 'Built-up' : 'Super'}
                </button>
              ))}
            </div>
          </div>
        </div>
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
                    {option}
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
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Age</label>
              <select
                value={filters.ageOfProperty}
                onChange={(e) => handleFilterChange("ageOfProperty", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                {ageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
              <select
                value={filters.floor}
                onChange={(e) => handleFilterChange("floor", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Floor</option>
                {floorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parking</label>
              <select
                value={filters.parking}
                onChange={(e) => handleFilterChange("parking", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                {parkingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Balcony</label>
              <select
                value={filters.balcony}
                onChange={(e) => handleFilterChange("balcony", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                {balconyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Location */}
      {renderFilterSection(
        "Location",
        <MapPin className="w-5 h-5" />,
        "location",
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locality</label>
            <select
              value={filters.locality}
              onChange={(e) => handleFilterChange("locality", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Localities</option>
              {availableLocalities.map((locality) => (
                <option key={locality} value={locality}>
                  {locality}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <select
              value={filters.projectName}
              onChange={(e) => handleFilterChange("projectName", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Projects</option>
              {availableProjects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facing</label>
            <select
              value={filters.facing}
              onChange={(e) => handleFilterChange("facing", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any Direction</option>
              {facingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
                    {option}
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
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
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

            <button
              onClick={() => handleFilterChange("isPremium", filters.isPremium === "true" ? "" : "true")}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                filters.isPremium === "true"
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Crown className="w-4 h-4" />
              Premium
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
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-10 left-4 w-48 h-48 sm:w-96 sm:h-96 bg-blue-400 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-400 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-6xl mx-auto w-full">
            {/* Hero Text */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 sm:px-6 sm:py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/30">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-semibold text-xs sm:text-sm tracking-wider">100% CLEAR TITLE PROPERTIES</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-white leading-tight tracking-tight">
                Clear Title,
                <span className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent mt-2">
                  Clear Future
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-blue-100 font-light mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                Invest with Confidence in Completely Verified Properties
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-6 mb-8 sm:mb-12 px-4">
                <div className="px-3 py-2 sm:px-6 sm:py-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/30">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                    <div className="text-xl sm:text-3xl font-bold text-white">{formatNumber(allPropertyUnits.length)}+</div>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100">Clear Title Properties</div>
                </div>
                
                <div className="px-3 py-2 sm:px-6 sm:py-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/30">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-300" />
                    <div className="text-xl sm:text-3xl font-bold text-white">100%</div>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100">Verification Rate</div>
                </div>
                
                <div className="px-3 py-2 sm:px-6 sm:py-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/30">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-red-300" />
                    <div className="text-xl sm:text-3xl font-bold text-white">{formatNumber(availableCities.length)}+</div>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100">Prime Locations</div>
                </div>
                
                <div className="px-3 py-2 sm:px-6 sm:py-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/30">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <Award className="w-4 h-4 sm:w-6 sm:h-6 text-purple-300" />
                    <div className="text-xl sm:text-3xl font-bold text-white">Legal</div>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100">Complete Documentation</div>
                </div>
              </div>

              {/* Clear Title Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30">
                  <FileCheck className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 mx-auto mb-2 sm:mb-3" />
                  <h3 className="text-white font-bold text-sm sm:text-base mb-1 sm:mb-2">Clear Title Guarantee</h3>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    Every property comes with verified clear title documentation
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-300 mx-auto mb-2 sm:mb-3" />
                  <h3 className="text-white font-bold text-sm sm:text-base mb-1 sm:mb-2">Legal Verification</h3>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    Thorough legal checks and complete compliance assurance
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-300 mx-auto mb-2 sm:mb-3" />
                  <h3 className="text-white font-bold text-sm sm:text-base mb-1 sm:mb-2">Complete Transparency</h3>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    No hidden clauses, full disclosure on every property
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30 lg:col-span-3">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300 mx-auto mb-2 sm:mb-3" />
                  <h3 className="text-white font-bold text-sm sm:text-base mb-1 sm:mb-2">Paperwork & Documentation</h3>
                  <p className="text-blue-100 text-xs sm:text-sm text-center max-w-md mx-auto">
                    Khata conversion, registration, legal paperwork, and complete documentation support.
                  </p>
                </div>
              </div>

              {/* Main Search Bar */}
              <div className="bg-white rounded-2xl shadow-2xl p-2 max-w-3xl mx-auto">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by location, project, amenities, or keyword..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="w-full pl-12 pr-4 py-4 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
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

          {/* Categories Container */}
          <div className="relative">
            {/* Scroll Indicators - Desktop */}
            <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            {/* Categories - Mobile & Desktop */}
            <div 
              ref={categoryScrollRef}
              className="flex space-x-2 sm:space-x-3 pb-3 sm:pb-4 px-3 sm:px-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
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
                    minWidth: isMobile ? '100px' : '120px',
                    maxWidth: isMobile ? '110px' : '140px',
                    padding: isMobile ? '0.75rem 1rem' : '1rem 1.5rem',
                    borderRadius: isMobile ? '0.75rem' : '1rem',
                    transform: activeCategory === category.id ? 'scale(1.05)' : 'scale(1)'
                  }}
                  disabled={category.count === 0}
                >
                  <div className="mb-1 sm:mb-2 flex-shrink-0">
                    {React.cloneElement(category.icon, {
                      className: `${
                        isMobile ? 'w-4 h-4' : 'w-5 h-5'
                      } ${
                        activeCategory === category.id 
                          ? 'text-white' 
                          : category.count === 0
                          ? 'text-gray-400'
                          : 'text-gray-500'
                      }`
                    })}
                  </div>
                  
                  <span className={`font-medium text-center ${
                    isMobile ? 'text-xs' : 'text-sm'
                  } truncate w-full`}>
                    {category.name}
                  </span>
                  
                  <span className={`mt-0.5 sm:mt-1 ${
                    isMobile ? 'text-[10px]' : 'text-xs'
                  } ${
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

            {/* Scroll Indicators - Mobile */}
            {isMobile && propertyCategories.length > 4 && (
              <div className="flex justify-center items-center gap-1 mt-2">
                <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                <div className="h-1 w-3 bg-gray-400 rounded-full"></div>
                <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Quick Filter Chips for Mobile */}
          {isMobile && (
            <div className="px-3 sm:px-4 pt-2 border-t border-gray-100 mt-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('isVerified', filters.isVerified === 'true' ? '' : 'true')}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border transition-colors ${
                    filters.isVerified === 'true'
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </button>
                <button
                  onClick={() => handleFilterChange('possessionStatus', 'Ready to Move')}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border transition-colors ${
                    filters.possessionStatus === 'Ready to Move'
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  Ready to Move
                </button>
                <button
                  onClick={() => handleFilterChange('furnishing', 'Furnished')}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border transition-colors ${
                    filters.furnishing === 'Furnished'
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
                    activeCategory === 'apartment' ? 'bg-blue-100' :
                    activeCategory === 'villa' ? 'bg-purple-100' :
                    activeCategory === 'commercial' ? 'bg-green-100' :
                    activeCategory === 'plot' ? 'bg-yellow-100' :
                    activeCategory === 'penthouse' ? 'bg-pink-100' :
                    activeCategory === 'farmhouse' ? 'bg-emerald-100' :
                    activeCategory === 'studio' ? 'bg-indigo-100' :
                    activeCategory === 'duplex' ? 'bg-cyan-100' :
                    'bg-gray-100'
                  }`}>
                    {React.cloneElement(propertyCategories.find(c => c.id === activeCategory)?.icon || <Home className="w-4 h-4" />, {
                      className: `w-4 h-4 ${
                        activeCategory === 'all' ? 'text-blue-600' :
                        activeCategory === 'apartment' ? 'text-blue-600' :
                        activeCategory === 'villa' ? 'text-purple-600' :
                        activeCategory === 'commercial' ? 'text-green-600' :
                        activeCategory === 'plot' ? 'text-yellow-600' :
                        activeCategory === 'penthouse' ? 'text-pink-600' :
                        activeCategory === 'farmhouse' ? 'text-emerald-600' :
                        activeCategory === 'studio' ? 'text-indigo-600' :
                        activeCategory === 'duplex' ? 'text-cyan-600' :
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
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="w-full bg-white rounded-xl shadow-lg p-4 flex items-center justify-between hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                    <Filter className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">Filters & Sort</h3>
                    <p className="text-sm text-gray-600">
                      {getActiveFilterCount() > 0 
                        ? `${getActiveFilterCount()} filters applied` 
                        : 'Customize your search'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {getActiveFilterCount()}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            </div>

            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 mb-4 lg:mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    Properties in {filters.city || "All Cities"}
                    {filters.propertyType && ` • ${filters.propertyType}s`}
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm lg:text-base">
                    Showing <span className="font-bold text-blue-600">{propertyUnits.length}</span> of{" "}
                    <span className="font-semibold">{formatNumber(totalResults)}</span> properties
                    {filters.search && ` matching "${filters.search}"`}
                  </p>
                </div>

                <div className="flex items-center gap-3 lg:gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg lg:rounded-xl p-0.5 lg:p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 lg:p-3 rounded-lg transition-all ${
                        viewMode === "grid" 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 lg:p-3 rounded-lg transition-all ${
                        viewMode === "list" 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative flex-shrink-0">
                    <select
                      value={getCurrentSortValue()}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="appearance-none bg-white border border-gray-200 rounded-lg lg:rounded-xl px-3 lg:px-4 py-2 lg:py-3 pr-8 lg:pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 font-medium lg:font-semibold text-sm lg:text-base min-w-[140px] lg:min-w-[180px] hover:border-gray-300 transition-colors"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ArrowUpDown className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {getActiveFilterCount() > 0 && (
                <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                    <span className="text-sm font-semibold text-gray-700">Active filters:</span>
                    <div className="flex flex-wrap gap-1 lg:gap-2">
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
                        } else if (key === 'isPremium' && value === 'true') {
                          displayValue = "Premium";
                          bgColor = "bg-purple-50";
                          textColor = "text-purple-700";
                          borderColor = "border-purple-100";
                        } else if (['minArea', 'maxArea'].includes(key) && value) {
                          displayValue = key === 'minArea' ? `Min: ${value} sq.ft.` : `Max: ${value} sq.ft.`;
                          bgColor = "bg-orange-50";
                          textColor = "text-orange-700";
                          borderColor = "border-orange-100";
                        }
                        
                        return (
                          <span
                            key={key}
                            className={`inline-flex items-center gap-1 ${bgColor} ${textColor} ${borderColor} text-xs lg:text-sm px-2 lg:px-3 py-1 lg:py-1.5 rounded-full border truncate max-w-[180px]`}
                          >
                            <Filter className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                            <span className="truncate">{displayValue}</span>
                            <button
                              onClick={() => handleFilterChange(key, "")}
                              className="ml-0.5 hover:opacity-80"
                            >
                              <XCircle className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="text-xs lg:text-sm font-semibold text-gray-600 hover:text-gray-900 hover:underline whitespace-nowrap"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Property Units */}
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