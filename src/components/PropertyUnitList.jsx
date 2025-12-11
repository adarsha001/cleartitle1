import { useEffect, useState, useRef } from "react";
import { 
  Search, SlidersHorizontal, Grid3x3, List, 
  MapPin, Home, DollarSign, Maximize, Building, 
  Bed, Bath, Car, Layers, ChevronDown, X, 
  Shield, CheckCircle, FileCheck, Award, Menu, 
  FileText, Filter, Building2, Store, Factory, Hotel, Trees,
  ChevronLeft
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PropertyUnitList() {
  const { user } = useAuth();
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");
const navigate=useNavigate()
  // Filters state
  const [filters, setFilters] = useState({
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
    availability: user?.userType === 'admin' ? "" : "available",
    isFeatured: "",
    isVerified: "",
    approvalStatus: user?.userType === 'admin' ? "" : "approved"
  });

  // Available filters options
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    propertyTypes: [],
    bedrooms: [],
    furnishingTypes: [],
    possessionStatuses: [],
    kitchenTypes: [],
    listingTypes: []
  });

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const propertyListRef = useRef(null);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch property units
  const fetchPropertyUnits = async (params = {}) => {
    try {
      setLoading(true);
      setError("");
      
      const response = await propertyUnitAPI.getPropertyUnits({
        ...filters,
        search,
        sortBy,
        sortOrder,
        page,
        limit: 12,
        ...params
      });
      
      if (response.data.success) {
        setPropertyUnits(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
        
        // Update filter options
        if (response.data.filters) {
          setFilterOptions({
            cities: response.data.filters.availableCities || [],
            propertyTypes: response.data.filters.availablePropertyTypes || [],
            bedrooms: response.data.filters.availableBedrooms || [],
            furnishingTypes: ['Furnished', 'Semi-Furnished', 'Unfurnished'],
            possessionStatuses: ['Ready to Move', 'Under Construction', 'New Launch'],
            kitchenTypes: ['Modular', 'Non-Modular', 'Open Kitchen'],
            listingTypes: ['Sale', 'Rent', 'Lease']
          });
        }
      } else {
        setError(response.data.message || "Failed to fetch properties");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch properties");
      console.error("Error fetching property units:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPropertyUnits();
  }, [page, sortBy, sortOrder]);

  // Fetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      fetchPropertyUnits();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters, search]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
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
      availability: user?.userType === 'admin' ? "" : "available",
      isFeatured: "",
      isVerified: "",
      approvalStatus: user?.userType === 'admin' ? "" : "approved"
    });
    setSearch("");
    setShowFilters(false);
    setShowMobileFilters(false);
  };

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(
    value => value !== "" && value !== undefined
  ).length + (search ? 1 : 0);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (propertyListRef.current) {
      propertyListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get property type icon
  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case "Apartment":
        return <Building className="w-4 h-4" />;
      case "Villa":
        return <Home className="w-4 h-4" />;
      case "Commercial Space":
        return <Building2 className="w-4 h-4" />;
      case "Shop":
        return <Store className="w-4 h-4" />;
      case "Industrial":
        return <Factory className="w-4 h-4" />;
      case "Hotel":
        return <Hotel className="w-4 h-4" />;
      case "Farmhouse":
        return <Trees className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  // Loading state
  if (loading && propertyUnits.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">Loading properties...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && propertyUnits.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Error Loading Properties</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => fetchPropertyUnits()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
 
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}></div>
          
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-6xl mx-auto">
            {/* Hero Text */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 sm:px-6 sm:py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/30">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-semibold text-xs sm:text-sm tracking-wider">
                  {user?.userType === 'admin' ? 'ADMIN DASHBOARD' : 'PREMIUM PROPERTIES'}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight">
                Find Your Perfect
                <span className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent mt-2">
                  Property Unit
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-blue-100 font-light mb-6 sm:mb-8 max-w-3xl mx-auto">
                Browse through our verified residential and commercial properties
              </p>
            </div>
            

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50">
                <div className="relative mb-4 sm:mb-6">
                  <Search className="absolute left-3 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-6 sm:h-6" />
                  <input
                    type="text"
                    placeholder="Search by location, property type, amenities, or building name..."
                    className="w-full pl-10 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchPropertyUnits()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Listings Section */}
<div ref={propertyListRef} id="property-unit-list" className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
          <div className="mb-6 sm:mb-8">
      <button
        onClick={() => navigate('/')} // Or your home/properties route
        className="inline-flex items-center gap-2 text-blue-400 hover:text-yellow-300 transition-colors group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">Back to Properties</span>
      </button>
    </div>
        {/* Active Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Mobile Filter Button */}
            {isMobile && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors shadow-md font-semibold text-blue-900 text-sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Menu className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}

            {/* Desktop Filter Button */}
            {!isMobile && (
              <button
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-blue-300 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-colors shadow-md font-semibold text-blue-900 text-sm sm:text-base"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors font-semibold border-2 border-red-200 text-sm sm:text-base"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                Clear All Filters
              </button>
            )}

            {/* Quick Stats */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <span className="font-semibold text-blue-700 text-sm">
                {total} properties found
              </span>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 items-center mt-3 sm:mt-0">
            {/* Sort Options */}
            <div className="flex gap-2">
              <select
                className="border-2 border-blue-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all shadow-md font-medium text-gray-700 text-sm sm:text-base"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Newest</option>
                <option value="isFeatured">Featured</option>
                <option value="specifications.carpetArea">Area</option>
                <option value="price">Price</option>
              </select>
              
              <select
                className="border-2 border-blue-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all shadow-md font-medium text-gray-700 text-sm sm:text-base"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-1 sm:gap-2 bg-white rounded-lg sm:rounded-xl p-1 shadow-md border-2 border-blue-300">
              <button
                className={`p-2 sm:px-4 sm:py-2 rounded-md sm:rounded-lg transition-all font-semibold ${
                  viewMode === "grid" ? "bg-blue-600 text-white shadow-lg scale-105" : "text-gray-600 hover:bg-blue-50"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                className={`p-2 sm:px-4 sm:py-2 rounded-md sm:rounded-lg transition-all font-semibold ${
                  viewMode === "list" ? "bg-blue-600 text-white shadow-lg scale-105" : "text-gray-600 hover:bg-blue-50"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filters Overlay */}
        {isMobile && showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Property Type</label>
                  <select
                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    {filterOptions.propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">City</label>
                  <select
                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  >
                    <option value="">All Cities</option>
                    {filterOptions.cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Bedrooms</label>
                  <select
                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  >
                    <option value="">Any</option>
                    {filterOptions.bedrooms.map((beds) => (
                      <option key={beds} value={beds}>{beds} Beds</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filters Panel */}
        {!isMobile && showFilters && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Refine Your Search</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Property Type</label>
                <select
                  className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                >
                  <option value="">All Types</option>
                  {filterOptions.propertyTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">City</label>
                <select
                  className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                >
                  <option value="">All Cities</option>
                  {filterOptions.cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Bedrooms</label>
                <select
                  className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                >
                  <option value="">Any</option>
                  {filterOptions.bedrooms.map((beds) => (
                    <option key={beds} value={beds}>{beds} Beds</option>
                  ))}
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Bathrooms</label>
                <select
                  className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                >
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5, 6].map((baths) => (
                    <option key={baths} value={baths}>{baths} Baths</option>
                  ))}
                </select>
              </div>

              {/* Area Range */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Area (sq.ft.)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-1/2 border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filters.minArea}
                    onChange={(e) => handleFilterChange('minArea', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-1/2 border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filters.maxArea}
                    onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                  />
                </div>
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Listing Type</label>
                <select
                  className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filters.listingType}
                  onChange={(e) => handleFilterChange('listingType', e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Sale">For Sale</option>
                  <option value="Rent">For Rent</option>
                  <option value="Lease">For Lease</option>
                </select>
              </div>

              {/* Furnishing */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Furnishing</label>
                <select
                  className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filters.furnishing}
                  onChange={(e) => handleFilterChange('furnishing', e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* Admin-only filters */}
              {user?.userType === 'admin' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Approval Status</label>
                    <select
                      className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={filters.approvalStatus}
                      onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Availability</label>
                    <select
                      className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={filters.availability}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                      <option value="under-negotiation">Under Negotiation</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors font-bold border-2 border-red-200"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Results Count with Trust Badge */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                {user?.userType === 'admin' ? 'All Property Units' : 'Verified Properties'}
              </h2>
              <p className="text-gray-700 font-medium flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                Showing {propertyUnits.length} of {total} properties
                {activeFiltersCount > 0 && " (filtered)"}
              </p>
            </div>
            {user?.userType !== 'admin' && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-white rounded-lg sm:rounded-xl border-2 border-green-300 shadow-md">
                <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span className="font-bold text-green-700 text-sm sm:text-base">100% Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Property Cards */}
        {loading && propertyUnits.length > 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading more properties...</p>
          </div>
        ) : (
          <div
            className={`grid gap-4 sm:gap-6 lg:gap-8 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            }`}
          >
            {propertyUnits.map((propertyUnit) => (
              <PropertyUnitCard
                key={propertyUnit._id}
                propertyUnit={propertyUnit}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {propertyUnits.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Home className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No properties found</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">
              {activeFiltersCount > 0 
                ? "Try adjusting your filters or search terms"
                : "No properties available at the moment. Check back soon!"}
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-bold text-sm sm:text-base lg:text-lg"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 sm:mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-300'
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="w-10 h-10 rounded-lg font-medium bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-300"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  page === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-blue-300'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}