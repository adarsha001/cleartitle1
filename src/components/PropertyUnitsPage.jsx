import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { 
  Search, Filter, Grid, List, ChevronLeft, ChevronRight, 
  Home, MapPin, Building, Ruler, Bed, Bath, Car,
  CheckCircle, XCircle, Loader2, X, Menu, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { propertyUnitAPI } from "../api/propertyUnitAPI";

const PropertyUnitsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilterSections, setExpandedFilterSections] = useState({});
  
  // Filter state
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    furnishing: searchParams.get("furnishing") || "",
    possessionStatus: searchParams.get("possessionStatus") || "",
    kitchenType: searchParams.get("kitchenType") || "",
    listingType: searchParams.get("listingType") || "",
    search: searchParams.get("search") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
    page: parseInt(searchParams.get("page")) || 1,
    limit: parseInt(searchParams.get("limit")) || 12,
    approvalStatus: searchParams.get("approvalStatus") || "",
    availability: searchParams.get("availability") || "",
    isFeatured: searchParams.get("isFeatured") || "",
    isVerified: searchParams.get("isVerified") || "",
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Available options from API
  const [availableCities, setAvailableCities] = useState([]);
  const [availablePropertyTypes, setAvailablePropertyTypes] = useState([]);
  const [availableBedrooms, setAvailableBedrooms] = useState([]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch property units
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
        setPropertyUnits(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
        setTotalResults(response.data.total || 0);
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
    }
  };

  // Initial fetch on component mount and filter changes
  useEffect(() => {
    fetchPropertyUnits();
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

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      city: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      minArea: "",
      maxArea: "",
      furnishing: "",
      possessionStatus: "",
      kitchenType: "",
      listingType: "",
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 12,
      approvalStatus: "",
      availability: "",
      isFeatured: "",
      isVerified: "",
    });
    setShowFilters(false);
    setShowMobileFilters(false);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPropertyUnits();
  };

  // Handle Enter key in search
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchPropertyUnits();
    }
  };

  // Toggle filter section on mobile
  const toggleFilterSection = (section) => {
    setExpandedFilterSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Close mobile filters
  const closeMobileFilters = () => {
    setShowMobileFilters(false);
  };

  // Apply filters and close on mobile
  const handleApplyFilters = () => {
    if (isMobile) {
      setShowMobileFilters(false);
    }
  };

  // Property type options
  const propertyTypes = [
    "Apartment", "Villa", "Commercial Space", "Office Space",
    "Shop", "Warehouse", "Industrial", "Hotel", "Farmhouse", "Plot"
  ];

  // Listing type options
  const listingTypes = ["Sale", "Rent", "Lease"];

  // Furnishing options
  const furnishingOptions = ["Furnished", "Semi-Furnished", "Unfurnished"];

  // Possession status options
  const possessionOptions = ["Ready to Move", "Under Construction", "Pre Launch"];

  // Kitchen type options
  const kitchenOptions = ["Modular", "Non-Modular", "Open Kitchen", "Closed Kitchen"];

  // Availability options
  const availabilityOptions = [
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
    { value: "rented", label: "Rented" },
    { value: "under-negotiation", label: "Under Negotiation" }
  ];

  // Approval status options
  const approvalOptions = [
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" }
  ];

  // Sort options
  const sortOptions = [
    { value: "createdAt:desc", label: "Newest First" },
    { value: "createdAt:asc", label: "Oldest First" },
    { value: "price:asc", label: "Price: Low to High" },
    { value: "price:desc", label: "Price: High to Low" },
    { value: "carpetArea:desc", label: "Largest Area" },
    { value: "carpetArea:asc", label: "Smallest Area" },
    { value: "bedrooms:desc", label: "Most Bedrooms" },
    { value: "bedrooms:asc", label: "Fewest Bedrooms" },
  ];

  // Parse sort value
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

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(isMobile ? 2 : 8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
          <div className="h-48 sm:h-56 bg-gray-300"></div>
          <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="flex gap-3 sm:gap-4">
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render filter panel
  const renderFilterPanel = () => (
    <div className="space-y-6">
      {/* Basic Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building className="inline w-4 h-4 mr-1" />
              Property Type
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange("propertyType", e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {availablePropertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listing Type
            </label>
            <select
              value={filters.listingType}
              onChange={(e) => handleFilterChange("listingType", e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {listingTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bed className="inline w-4 h-4 mr-1" />
              Bedrooms
            </label>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any</option>
              {availableBedrooms.map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Filters with accordion on mobile */}
        <div className="space-y-4">
          {/* Bathrooms & Area - Mobile accordion */}
          <div className="lg:hidden">
            <button
              onClick={() => toggleFilterSection('additional')}
              className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-gray-700">Additional Filters</span>
              {expandedFilterSections.additional ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {expandedFilterSections.additional && (
              <div className="mt-2 space-y-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Bath className="inline w-4 h-4 mr-1" />
                    Bathrooms
                  </label>
                  <select
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange("bathrooms", e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any</option>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="inline w-4 h-4 mr-1" />
                    Area (sq.ft.)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minArea}
                      onChange={(e) => handleFilterChange("minArea", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="self-center text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxArea}
                      onChange={(e) => handleFilterChange("maxArea", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bathrooms & Area - Desktop always visible */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bath className="inline w-4 h-4 mr-1" />
                Bathrooms
              </label>
              <select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange("bathrooms", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ruler className="inline w-4 h-4 mr-1" />
                Area (sq.ft.)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minArea}
                  onChange={(e) => handleFilterChange("minArea", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="self-center text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxArea}
                  onChange={(e) => handleFilterChange("maxArea", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Other filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Furnishing
              </label>
              <select
                value={filters.furnishing}
                onChange={(e) => handleFilterChange("furnishing", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Possession Status
              </label>
              <select
                value={filters.possessionStatus}
                onChange={(e) => handleFilterChange("possessionStatus", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kitchen Type
              </label>
              <select
                value={filters.kitchenType}
                onChange={(e) => handleFilterChange("kitchenType", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                {kitchenOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Properties per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange("limit", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="36">36</option>
                <option value="48">48</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admin Only Filters */}
        {(user?.userType === 'admin' || user?.userType === 'superadmin') && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-700 mb-4">Admin Filters</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Status
                </label>
                <select
                  value={filters.approvalStatus}
                  onChange={(e) => handleFilterChange("approvalStatus", e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  {approvalOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange("availability", e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  {availabilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured
                </label>
                <select
                  value={filters.isFeatured}
                  onChange={(e) => handleFilterChange("isFeatured", e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Featured Only</option>
                  <option value="false">Non-Featured</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verified
                </label>
                <select
                  value={filters.isVerified}
                  onChange={(e) => handleFilterChange("isVerified", e.target.value)}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Non-Verified</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Actions */}
      <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-between">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          Reset all filters
        </button>
        <div className="flex gap-3">
          {isMobile && (
            <button
              onClick={closeMobileFilters}
              className="px-4 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Find Your Perfect Property</h1>
          <p className="text-blue-100 text-sm sm:text-base md:text-lg max-w-3xl">
            Browse through our curated selection of premium properties. Find exactly what you're looking for with our advanced filters.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Search and Controls Bar */}
        <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by location, property name, or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            {/* View Toggle and Sort - Mobile optimized */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* View Mode Toggle and Filter Button for mobile */}
              <div className="flex items-center justify-between sm:justify-start gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                      viewMode === "grid" 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                      viewMode === "list" 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Filter Toggle Button for mobile */}
                <button
                  onClick={() => isMobile ? setShowMobileFilters(true) : setShowFilters(!showFilters)}
                  className={`sm:hidden flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    showFilters 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                  {(filters.city || filters.propertyType || filters.bedrooms || filters.listingType) && (
                    <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={getCurrentSortValue()}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Filter Toggle Button for desktop */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`hidden sm:flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  showFilters 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filters</span>
                {(filters.city || filters.propertyType || filters.bedrooms || filters.listingType) && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.city || filters.propertyType || filters.bedrooms || filters.listingType || filters.search) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Active filters:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.city && (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      <MapPin className="w-3 h-3" />
                      City: {filters.city}
                      <button
                        onClick={() => handleFilterChange("city", "")}
                        className="ml-1 hover:text-blue-900"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.propertyType && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      <Home className="w-3 h-3" />
                      Type: {filters.propertyType}
                      <button
                        onClick={() => handleFilterChange("propertyType", "")}
                        className="ml-1 hover:text-green-900"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.bedrooms && (
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      <Bed className="w-3 h-3" />
                      Beds: {filters.bedrooms}+
                      <button
                        onClick={() => handleFilterChange("bedrooms", "")}
                        className="ml-1 hover:text-purple-900"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                      <Search className="w-3 h-3" />
                      Search: {filters.search.length > 10 ? filters.search.substring(0, 10) + '...' : filters.search}
                      <button
                        onClick={() => handleFilterChange("search", "")}
                        className="ml-1 hover:text-red-900"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 underline ml-1 sm:ml-2"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Filters Panel */}
        {showFilters && !isMobile && (
          <div className="mb-6 sm:mb-8 bg-white rounded-xl shadow-md p-4 sm:p-6">
            {renderFilterPanel()}
          </div>
        )}

        {/* Mobile Filters Overlay */}
        {showMobileFilters && isMobile && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeMobileFilters} />
            <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={closeMobileFilters}
                  className="p-1 hover:bg-gray-100 rounded-full"
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

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Available Properties
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Showing {propertyUnits.length} of {totalResults} properties
              {filters.city && ` in ${filters.city}`}
              {filters.search && ` matching "${filters.search}"`}
            </p>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Property Units Grid/List */}
        {loading ? (
          renderSkeleton()
        ) : propertyUnits.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
            <Home className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
              {Object.values(filters).some(v => v && v !== '12' && v !== 'desc') 
                ? "Try adjusting your filters to see more results"
                : "No properties are currently listed. Check back soon!"}
            </p>
            {Object.values(filters).some(v => v && v !== '12' && v !== 'desc') && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {propertyUnits.map((property) => (
              <PropertyUnitCard 
                key={property._id} 
                propertyUnit={property} 
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
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
          <div className="mt-8 sm:mt-12">
            <nav className="flex items-center justify-center space-x-1 sm:space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-1.5 sm:p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Page Numbers - Responsive */}
              {(() => {
                const pages = [];
                const maxVisible = isMobile ? 3 : 5;
                
                if (totalPages <= maxVisible) {
                  // Show all pages
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Always show first page
                  pages.push(1);
                  
                  // Calculate start and end
                  let start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
                  let end = Math.min(totalPages - 1, start + maxVisible - 3);
                  
                  // Adjust if we're near the end
                  if (end === totalPages - 1) {
                    start = totalPages - maxVisible + 2;
                  }
                  
                  // Add ellipsis after first page if needed
                  if (start > 2) {
                    pages.push('...');
                  }
                  
                  // Add middle pages
                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }
                  
                  // Add ellipsis before last page if needed
                  if (end < totalPages - 1) {
                    pages.push('...');
                  }
                  
                  // Always show last page
                  if (totalPages > 1) {
                    pages.push(totalPages);
                  }
                }
                
                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-sm sm:text-base ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-1.5 sm:p-2 rounded-lg ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </nav>
            
            {/* Mobile page info */}
            {isMobile && (
              <div className="text-center mt-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-white border-t border-gray-200 mt-8 sm:mt-12">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                {totalResults.toLocaleString()}
              </div>
              <div className="text-sm sm:text-base text-gray-600">Total Properties</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                {availableCities.length}
              </div>
              <div className="text-sm sm:text-base text-gray-600">Cities Covered</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">
                {availablePropertyTypes.length}
              </div>
              <div className="text-sm sm:text-base text-gray-600">Property Types</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyUnitsPage;