import React, { useState, useEffect } from "react";
import { 
  Home, 
  Building, 
  Key,
  Users,
  ChevronRight,
  CheckCircle,
  TrendingUp,
  Sparkles,
  Shield,
  Award,
  Clock,
  Star,
  Heart,
  Hotel,
  Coffee,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight as RightIcon,
  ChevronsRight,
  MoreHorizontal,
  Filter
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";

const ListingTypeView = () => {
  const [selectedType, setSelectedType] = useState("sale");
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [stats, setStats] = useState({
    sale: 0,
    rent: 0,
    lease: 0,
    pg: 0,
    total: 0
  });

  // Cache for total counts per type
  const [typeTotalsCache, setTypeTotalsCache] = useState({
    sale: 0,
    rent: 0,
    lease: 0,
    pg: 0
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listing type categories
  const listingTypes = [
    {
      id: "sale",
      title: "Properties for Sale",
      subtitle: "Buy your dream home",
      description: "Own your perfect property with flexible payment options",
      icon: <Home className="w-5 h-5" />,
      color: "blue"
    },
    {
      id: "rent",
      title: "Properties for Rent",
      subtitle: "Monthly rentals",
      description: "Find comfortable homes for short or long term stays",
      icon: <Key className="w-5 h-5" />,
      color: "green"
    },
    {
      id: "lease",
      title: "Properties on Lease",
      subtitle: "Long term agreements",
      description: "Commercial and residential properties for lease",
      icon: <Building className="w-5 h-5" />,
      color: "purple"
    },
    {
      id: "pg",
      title: "PG Buildings for Sale",
      subtitle: "Commercial PG properties",
      description: "Complete buildings suitable for Paying Guest business",
      icon: <Hotel className="w-5 h-5" />,
      color: "orange"
    }
  ];

  // Calculate total pages
  const calculateTotalPages = (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  // Update pagination state
  const updatePagination = (response, page) => {
    const totalItems = response.data.total || filteredUnits.length;
    const itemsPerPage = pagination.itemsPerPage;
    const totalPages = calculateTotalPages(totalItems, itemsPerPage);
    
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }));
  };

  // Fetch property counts for each listing type
  const fetchPropertyStats = async () => {
    try {
      setLoading(true);
      
      const res = await propertyUnitAPI.getPropertyUnits({
        limit: 1,
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      
      if (res.data && res.data.success) {
        // Using placeholder stats - replace with actual API data
        const placeholderStats = {
          sale: 45,
          rent: '3+',
          lease: 18,
          pg: '5+',
          total: '45+'
        };
        
        setStats(placeholderStats);
        setTypeTotalsCache(placeholderStats);
        
        // Load initial properties for "sale" type with accurate total count
        fetchPropertiesForType("sale", 1);
      }
    } catch (error) {
      console.error("Error fetching property stats:", error);
      const fallbackStats = {
        sale: 45,
        rent: 32,
        lease: 18,
        pg: 12,
        total: 107
      };
      setStats(fallbackStats);
      setTypeTotalsCache(fallbackStats);
      fetchPropertiesForType("sale", 1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch total count for a specific type
  const fetchTotalCountForType = async (typeId) => {
    try {
      return stats[typeId] || 0;
    } catch (error) {
      console.error(`Error fetching count for type ${typeId}:`, error);
      return stats[typeId] || 0;
    }
  };

  // Fetch properties for selected type with pagination
  const fetchPropertiesForType = async (typeId, page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const skip = (page - 1) * pagination.itemsPerPage;
      
      // Fetch properties for current page
      const res = await propertyUnitAPI.getPropertyUnits({
        listingType: typeId,
        limit: pagination.itemsPerPage,
        skip: skip,
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      
      if (res.data && res.data.success) {
        const newProperties = res.data.data || [];
        
        if (append) {
          setFilteredUnits(prev => [...prev, ...newProperties]);
        } else {
          setFilteredUnits(newProperties);
        }
        
        // Get accurate total count for this type
        let totalCount = 0;
        
        if (res.data.total !== undefined) {
          totalCount = res.data.total;
        } else if (res.data.count !== undefined) {
          totalCount = res.data.count;
        } else {
          totalCount = await fetchTotalCountForType(typeId);
        }
        
        updatePagination(res, page);
        
        // Update cache with accurate count
        setTypeTotalsCache(prev => ({
          ...prev,
          [typeId]: totalCount
        }));
        
        // Update stats with accurate count
        setStats(prev => ({
          ...prev,
          [typeId]: totalCount,
          total: Object.values({...prev, [typeId]: totalCount}).reduce((a, b) => a + b, 0)
        }));
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setFilteredUnits([]);
      
      // Fallback to cached count
      const cachedCount = typeTotalsCache[typeId] || 0;
      const itemsPerPage = pagination.itemsPerPage;
      const totalPages = calculateTotalPages(cachedCount, itemsPerPage);
      
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalPages,
        totalItems: cachedCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle type selection
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setFilteredUnits([]);
    fetchPropertiesForType(typeId, 1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchPropertiesForType(selectedType, page);
    
    // Scroll to top of component
    const element = document.getElementById('listing-type-view');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = pagination.currentPage + 1;
    fetchPropertiesForType(selectedType, nextPage, true);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    
    if (totalPages <= 7) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  useEffect(() => {
    fetchPropertyStats();
  }, []);

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex mb-4 animate-pulse">
            <div className="w-32 h-8 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-full"></div>
          </div>
          <div className="h-10 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-lg w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-lg w-1/2 mx-auto"></div>
        </div>

        {/* Type Selector Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 md:p-6 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-2/3"></div>
                  <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8 md:mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg p-3 md:p-4 shadow-sm animate-pulse">
              <div className="h-6 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Properties Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-40 md:h-48 bg-gradient-to-r from-blue-100 to-indigo-200"></div>
              <div className="p-3 md:p-4 space-y-3">
                <div className="h-4 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-3/4"></div>
                <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
                <div className="h-8 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && filteredUnits.length === 0) {
    return renderSkeleton();
  }

  // Get accurate count for display - use cached value for current type
  const displayCount = typeTotalsCache[selectedType] || stats[selectedType] || 0;

  return (
    <div id="listing-type-view" className="bg-gradient-to-tl from-blue-50 via-white to-indigo-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 md:mb-12">
          <h1 className="text-xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
            Find Properties by <span className="text-blue-600">Listing Type</span>
          </h1>
          
          <p className="text-gray-600 text-sm md:text-lg max-w-3xl mx-auto mb-4 md:mb-6">
            Browse properties based on how you want to acquire them.
          </p>
        </div>

        {/* Listing Type Selector - Use accurate counts */}
        <div className="mb-6 md:mb-12">
          {/* Mobile: Horizontal scroll for compact view */}
          <div className="md:hidden flex space-x-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {listingTypes.map((type) => {
              const isSelected = selectedType === type.id;
              const count = typeTotalsCache[type.id] || stats[type.id] || 0;
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`flex-shrink-0 w-48 p-3 rounded-xl border transition-all duration-300 text-left ${
                    isSelected
                      ? `border-${type.color}-500 bg-${type.color}-50 shadow-lg`
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-1.5 rounded-full ${
                      isSelected
                        ? `bg-${type.color}-100 text-${type.color}-600`
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {React.cloneElement(type.icon, {
                        className: "w-4 h-4"
                      })}
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${
                        isSelected ? `text-${type.color}-700` : 'text-gray-900'
                      }`}>
                        {type.id === "sale" ? "Sale" : 
                         type.id === "rent" ? "Rent" :
                         type.id === "lease" ? "Lease" : "PG"}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Desktop: Grid view */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {listingTypes.map((type) => {
              const isSelected = selectedType === type.id;
              const count = typeTotalsCache[type.id] || stats[type.id] || 0;
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`relative p-4 md:p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
                    isSelected
                      ? `border-${type.color}-500 bg-${type.color}-50 shadow-lg transform -translate-y-1`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Icon */}
                  <div className={`mb-3 md:mb-4 p-2 md:p-3 rounded-full inline-block ${
                    isSelected
                      ? `bg-${type.color}-100 text-${type.color}-600`
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {React.cloneElement(type.icon, {
                      className: `w-5 h-5 md:w-6 md:h-6 ${isSelected ? '' : 'group-hover:scale-110 transition-transform'}`
                    })}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className={`text-base md:text-xl font-bold mb-1 ${
                      isSelected ? `text-${type.color}-700` : 'text-gray-900'
                    }`}>
                      {type.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                      {type.subtitle}
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm">
                      {type.description}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className={`mt-3 md:mt-4 flex items-center gap-1 text-xs md:text-sm font-medium ${
                    isSelected ? `text-${type.color}-600` : 'text-gray-500'
                  }`}>
                    <span>View Properties</span>
                    <ChevronRight className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${
                      isSelected ? 'translate-x-1' : ''
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Type Details */}
 

        {/* Properties Grid */}
        <div className="mb-6 md:mb-12">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg md:rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-32 md:h-48 bg-gradient-to-r from-blue-100 to-indigo-200"></div>
                  <div className="p-2 md:p-4 space-y-2 md:space-y-3">
                    <div className="h-3 md:h-4 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-3/4"></div>
                    <div className="h-2 md:h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
                    <div className="h-6 md:h-8 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUnits.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {filteredUnits.map((property) => (
                  <div key={property._id}>
                    <PropertyUnitCard 
                      propertyUnit={property}
                      viewMode="compact"
                    />
                  </div>
                ))}
              </div>

              {/* Load More Skeleton */}
              {loadingMore && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg md:rounded-xl overflow-hidden shadow-sm animate-pulse">
                      <div className="h-32 md:h-48 bg-gradient-to-r from-blue-100 to-indigo-200"></div>
                      <div className="p-2 md:p-4 space-y-2 md:space-y-3">
                        <div className="h-3 md:h-4 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-3/4"></div>
                        <div className="h-2 md:h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
                        <div className="h-6 md:h-8 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6 md:py-12 bg-white rounded-lg md:rounded-xl border border-dashed border-gray-300">
              <Home className="w-10 h-10 md:w-16 md:h-16 text-gray-400 mx-auto mb-2 md:mb-4" />
              <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-3 md:mb-6 max-w-md mx-auto text-xs md:text-base">
                No {selectedType} properties available.
              </p>
              <button
                onClick={() => handleTypeSelect("sale")}
                className="inline-flex items-center gap-1 md:gap-2 bg-blue-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs md:text-base"
              >
                View Sale Properties
                <ChevronRight className="w-2 h-2 md:w-4 md:h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredUnits.length > 0 && pagination.totalPages > 1 && (
          <div className="flex flex-col items-center space-y-4">
            {/* Desktop Pagination */}
            <div className="hidden md:flex items-center justify-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                  pagination.hasPrevPage
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              {generatePageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-4 text-gray-400">
                    <MoreHorizontal className="w-5 h-5" />
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => handlePageChange(page)}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg font-medium ${
                      pagination.currentPage === page
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                  pagination.hasNextPage
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <RightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Pagination */}
            <div className="flex md:hidden items-center justify-between w-full space-x-4">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium ${
                  pagination.hasPrevPage
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {/* Current Page */}
              <div className="flex items-center gap-2 px-4">
                <span className="text-gray-700 font-medium">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium ${
                  pagination.hasNextPage
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <RightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Alternative: Load More Button */}
            {pagination.hasNextPage && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className={`mt-4 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium transition-all ${
                  loadingMore
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Properties</span>
                    <RightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {/* Results Count */}
            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200 w-full">
              <p>
                Showing {filteredUnits.length} of {pagination.totalItems} properties
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>
          </div>
        )}

        {/* CTA Section - Only show on first page */}
        {pagination.currentPage === 1 && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg md:rounded-2xl p-4 md:p-6 lg:p-8 text-white overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div className="max-w-2xl">
                  <h3 className="text-base md:text-xl lg:text-2xl font-bold mb-2 md:mb-3">
                    Need Help Deciding?
                  </h3>
                  <p className="text-blue-100 mb-2 md:mb-4 text-xs md:text-base">
                    Our experts can help you choose based on your investment goals.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 md:gap-3">
                    {["✓ Investment Analysis", "✓ Legal Guidance", "✓ Market Insights"].map((feature, index) => (
                      <div key={index} className="flex items-center gap-1 md:gap-2">
                        <CheckCircle className="w-2 h-2 md:w-4 md:h-4" />
                        <span className="text-xs md:text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="bg-white text-blue-700 px-3 md:px-6 py-1.5 md:py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors whitespace-nowrap text-xs md:text-base mt-3 md:mt-0">
                  Talk to Expert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingTypeView;