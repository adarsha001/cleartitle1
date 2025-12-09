import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { 
  Search, Filter, Grid, List, ChevronLeft, ChevronRight, 
  Home, MapPin, Building, Ruler, Bed, Bath, Car,
  CheckCircle, XCircle, Loader2
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
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  
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

  // Fetch property units
  const fetchPropertyUnits = async () => {
    setLoading(true);
    try {
      // Clean up filters - remove empty strings
      const cleanFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          // Convert boolean strings to actual booleans
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

      // Handle sort separately
      const { sortBy, sortOrder, page, limit, ...otherFilters } = cleanFilters;
      
      // Build params
      const params = {
        ...otherFilters,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
        page: page || 1,
        limit: limit || 12
      };

      console.log("API Params:", params); // Debug log

      const response = await propertyUnitAPI.getPropertyUnits(params);
      
      if (response.data.success) {
        console.log("API Response:", response.data); // Debug log
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
      console.error("Error details:", error.response?.data);
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
      page: 1 // Reset to first page on filter change
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

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setFilters(prev => ({
        ...prev,
        page: currentPage - 1
      }));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setFilters(prev => ({
        ...prev,
        page: currentPage + 1
      }));
    }
  };

  // Go to page
  const goToPage = (page) => {
    setFilters(prev => ({
      ...prev,
      page: page
    }));
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
          <div className="h-56 bg-gray-300"></div>
          <div className="p-5 space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="flex gap-4">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Property</h1>
          <p className="text-blue-100 text-lg max-w-3xl">
            Browse through our curated selection of premium properties. Find exactly what you're looking for with our advanced filters.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Controls Bar */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            {/* View Toggle and Sort */}
            <div className="flex items-center gap-4 w-full lg:w-auto">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
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

              {/* Sort Dropdown */}
              <select
                value={getCurrentSortValue()}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filters.city || filters.propertyType || filters.bedrooms || filters.listingType || filters.search) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                {filters.city && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-3 py-1.5 rounded-full">
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
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm px-3 py-1.5 rounded-full">
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
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-sm px-3 py-1.5 rounded-full">
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
                {filters.listingType && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm px-3 py-1.5 rounded-full">
                    For {filters.listingType}
                    <button
                      onClick={() => handleFilterChange("listingType", "")}
                      className="ml-1 hover:text-yellow-900"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-sm px-3 py-1.5 rounded-full">
                    <Search className="w-3 h-3" />
                    Search: {filters.search}
                    <button
                      onClick={() => handleFilterChange("search", "")}
                      className="ml-1 hover:text-red-900"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  City
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  {availableBedrooms.map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bathrooms */}
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

              {/* Area Range */}
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

              {/* Furnishing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing
                </label>
                <select
                  value={filters.furnishing}
                  onChange={(e) => handleFilterChange("furnishing", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  {furnishingOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Possession Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Possession Status
                </label>
                <select
                  value={filters.possessionStatus}
                  onChange={(e) => handleFilterChange("possessionStatus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  {possessionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kitchen Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kitchen Type
                </label>
                <select
                  value={filters.kitchenType}
                  onChange={(e) => handleFilterChange("kitchenType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  {kitchenOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Only Filters */}
              {(user?.userType === 'admin' || user?.userType === 'superadmin') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Status
                    </label>
                    <select
                      value={filters.approvalStatus}
                      onChange={(e) => handleFilterChange("approvalStatus", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All</option>
                      <option value="true">Verified Only</option>
                      <option value="false">Non-Verified</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Filter Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Reset all filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Available Properties
            </h2>
            <p className="text-gray-600 mt-1">
              Showing {propertyUnits.length} of {totalResults} properties
              {filters.city && ` in ${filters.city}`}
              {filters.search && ` matching "${filters.search}"`}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Property Units Grid/List */}
        {loading ? (
          renderSkeleton()
        ) : propertyUnits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(v => v && v !== '12' && v !== 'desc') 
                ? "Try adjusting your filters to see more results"
                : "No properties are currently listed. Check back soon!"}
            </p>
            {Object.values(filters).some(v => v && v !== '12' && v !== 'desc') && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {propertyUnits.map((property) => (
              <PropertyUnitCard 
                key={property._id} 
                propertyUnit={property} 
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
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
          <div className="mt-12 flex items-center justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      currentPage === totalPages
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalResults.toLocaleString()}
              </div>
              <div className="text-gray-600">Total Properties</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {availableCities.length}
              </div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {availablePropertyTypes.length}
              </div>
              <div className="text-gray-600">Property Types</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyUnitsPage;