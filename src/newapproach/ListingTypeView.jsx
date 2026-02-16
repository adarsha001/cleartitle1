import React, { useState, useEffect, useRef } from "react";
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
  Filter,
  Crown,
  MapPin,
  Target,
  ArrowRight,
  LayoutGrid,
  X
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";

const ListingTypeView = () => {
  const [selectedType, setSelectedType] = useState("sale");
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showViewMore, setShowViewMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const scrollContainerRef = useRef(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
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

  const ITEMS_PER_PAGE_MOBILE = 3; // Show 3 items on mobile initially

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current && isMobile && !showAllGrid) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        
        // Calculate current page based on scroll position
        const itemWidth = 280 + 16; // card width + gap
        const newPage = Math.floor(scrollLeft / itemWidth) + 1;
        if (newPage !== currentPage && newPage <= totalPages) {
          setCurrentPage(newPage);
        }

        // Show view more button when near the end
        const scrolledPercentage = (scrollLeft + clientWidth) / scrollWidth;
        if (scrolledPercentage > 0.8 && currentPage < totalPages) {
          setShowViewMore(true);
        } else {
          setShowViewMore(false);
        }
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [filteredUnits, isMobile, currentPage, totalPages, showAllGrid]);

  const scrollLeft = () => {
    if (scrollContainerRef.current && isMobile) {
      scrollContainerRef.current.scrollBy({
        left: -296, // card width + gap
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && isMobile) {
      scrollContainerRef.current.scrollBy({
        left: 296, // card width + gap
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current && isMobile && !showAllGrid) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      
      // Calculate current page based on scroll position
      const itemWidth = 280 + 16; // card width + gap
      const newPage = Math.floor(scrollLeft / itemWidth) + 1;
      if (newPage !== currentPage && newPage <= totalPages) {
        setCurrentPage(newPage);
      }

      // Show view more button when near the end
      const scrolledPercentage = (scrollLeft + clientWidth) / scrollWidth;
      if (scrolledPercentage > 0.8 && currentPage < totalPages) {
        setShowViewMore(true);
      } else {
        setShowViewMore(false);
      }
    }
  };

  const handleViewMore = () => {
    if (currentPage < totalPages && scrollContainerRef.current) {
      // Scroll to the next page
      const nextPage = currentPage + 1;
      const scrollPosition = (nextPage - 1) * (280 + 16); // (page-1) * (card width + gap)
      
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      setCurrentPage(nextPage);
      setShowViewMore(false);
    }
  };

  const handleViewAll = () => {
    setShowAllGrid(true);
  };

  const handleCloseGrid = () => {
    setShowAllGrid(false);
    setCurrentPage(1);
    setShowViewMore(false);
  };

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
      color: "blue"
    },
    {
      id: "lease",
      title: "Properties on Lease",
      subtitle: "Long term agreements",
      description: "Commercial and residential properties for lease",
      icon: <Building className="w-5 h-5" />,
      color: "indigo"
    },
    {
      id: "pg",
      title: "PG Buildings for Sale",
      subtitle: "Commercial PG properties",
      description: "Complete buildings suitable for Paying Guest business",
      icon: <Hotel className="w-5 h-5" />,
      color: "blue"
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
        
        // Update mobile pagination
        setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE_MOBILE));
        setCurrentPage(1);
        setShowAllGrid(false); // Exit grid view when type changes
        
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

  useEffect(() => {
    fetchPropertyStats();
  }, []);

  const renderSkeleton = () => (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-48 h-4 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="h-12 md:h-16 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl w-3/4 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl w-1/2 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Type Selector Skeleton - 4 items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="bg-gradient-to-r from-blue-100 to-indigo-50 w-full h-32 rounded-2xl animate-pulse border border-blue-200"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>

        {/* Desktop Grid Skeleton */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i}
              className="bg-white rounded-3xl overflow-hidden animate-pulse border border-blue-100 shadow-lg"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-64 bg-gradient-to-r from-blue-200 to-blue-300"></div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gradient-to-r from-blue-300 to-blue-400 rounded w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gradient-to-r from-blue-300 to-blue-400 rounded-2xl w-16"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-full"></div>
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Skeleton Horizontal Scroll */}
        <div className="md:hidden flex space-x-6 pb-8 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="flex-shrink-0 w-[320px] bg-white rounded-3xl overflow-hidden animate-pulse border border-blue-100 shadow-lg"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-56 bg-gradient-to-r from-blue-200 to-blue-300"></div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gradient-to-r from-blue-300 to-blue-400 rounded w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-7 bg-gradient-to-r from-blue-300 to-blue-400 rounded-2xl w-14"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-full"></div>
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-5/6"></div>
                </div>
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

  const PropertyCard = ({ unit, index }) => (
    <div className="relative group h-full">
      {/* Property Card Container - Removed listing type badge */}
      <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 group-hover:border-blue-200 transition-all duration-500 group-hover:shadow-2xl shadow-lg h-full">
        {/* Premium border effect on hover */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-100 rounded-3xl transition-all duration-500 pointer-events-none"></div>
        
        {/* Property Card */}
        <div className="transform group-hover:-translate-y-1 transition-transform duration-500 h-full">
          <PropertyUnitCard 
            propertyUnit={unit}
            viewMode="compact"
          />
        </div>
      </div>
    </div>
  );

  // Calculate visible items for mobile
  const visibleItems = isMobile && !showAllGrid
    ? filteredUnits.slice(0, currentPage * ITEMS_PER_PAGE_MOBILE)
    : filteredUnits;

  return (
    <div id="listing-type-view" className="bg-white md:py-24">
      <div className="relative max-w-7xl pt-4 mx-auto px-4">
        {/* Header Section */}
        <div className="text-center md:mb-20">
          {/* Main title */}
          <div className="mb-6 hidden sm:block">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-serif tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800">
                Find by Listing
              </span>
              <span className="text-gray-900 block md:inline md:ml-4">Type</span>
            </h1>
            <p className="hidden sm:block text-gray-500 text-lg font-light max-w-2xl mx-auto">
              Browse properties based on how you want to acquire them
            </p>
          </div>
          
          {/* Decorative separator */}
          <div className="hidden md:flex items-center justify-center gap-4 mb-8">
            <div className="w-16 md:w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            <Key className="w-6 h-6 text-blue-500" />
            <div className="w-16 md:w-32 h-0.5 bg-gradient-to-l from-transparent via-blue-300 to-transparent" />
          </div>
        </div>

        {/* Listing Type Selector - Compact for mobile */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          {/* Mobile filter buttons */}
          <div className="flex sm:hidden items-center justify-center gap-2 w-full max-w-xs mx-auto">
            {listingTypes.map((type) => {
              const isSelected = selectedType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`flex-1 min-w-[90px] flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl font-medium transition-all duration-300 text-sm ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${
                    isSelected ? "bg-white/20" : "bg-blue-50"
                  }`}>
                    {React.cloneElement(type.icon, {
                      className: `w-3.5 h-3.5 ${
                        isSelected ? "text-white" : "text-blue-600"
                      }`
                    })}
                  </div>
                  <span className="font-medium text-xs">
                    {type.id === "sale" ? "Sale" : 
                     type.id === "rent" ? "Rent" :
                     type.id === "lease" ? "Lease" : "PG"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
            {listingTypes.map((type) => {
              const isSelected = selectedType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`relative p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-lg transform -translate-y-1"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  {/* Icon */}
                  <div className={`mb-3 p-2 rounded-full inline-block ${
                    isSelected
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {React.cloneElement(type.icon, {
                      className: "w-5 h-5"
                    })}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${
                      isSelected ? "text-blue-700" : "text-gray-900"
                    }`}>
                      {type.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {type.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {filteredUnits.map((unit, index) => (
            <PropertyCard key={unit._id || index} unit={unit} index={index} />
          ))}
        </div>

        {/* Mobile Horizontal Scroll Layout */}
        {!showAllGrid ? (
          <div className="md:hidden relative">
            {/* Mobile Scroll Navigation Buttons */}
            <div className="relative mb-4">
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-700 font-sans">
                    <span className="text-blue-600">
                      {selectedType === "sale" ? "Properties for Sale" :
                       selectedType === "rent" ? "Properties for Rent" :
                       selectedType === "lease" ? "Properties for Lease" : "PG Buildings"}
                    </span>
                  </h3>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className={`p-2 rounded-full border ${
                      canScrollLeft 
                        ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    } transition-all duration-300`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className={`p-2 rounded-full border ${
                      canScrollRight 
                        ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    } transition-all duration-300`}
                  >
                    <RightIcon className="w-4 h-4" />
                  </button>

                  {/* View All Button */}
                  <button
                    onClick={handleViewAll}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg ml-1"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="text-sm">View</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Scroll Container */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex space-x-4 pb-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {visibleItems.map((unit, index) => (
                <div 
                  key={unit._id || index} 
                  className="flex-shrink-0 w-[280px] snap-start"
                >
                  <PropertyCard unit={unit} index={index} />
                </div>
              ))}
            </div>


            {/* View More Button */}
            {showViewMore && currentPage < totalPages && (
              <div className="flex justify-center mt-6 animate-fade-in">
                <button
                  onClick={handleViewMore}
                  className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span>View More Properties</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Mobile Grid View */
          <div className="md:hidden py-2 relative">
            {/* Grid Header */}
            <div className="relative mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 font-sans">
                  <span className="text-blue-700">
                    {selectedType === "sale" ? "All Sale Properties" :
                     selectedType === "rent" ? "All Rent Properties" :
                     selectedType === "lease" ? "All Lease Properties" : "All PG Buildings"}
                  </span> 
                </h2>
                
                <button
                  onClick={handleCloseGrid}
                  className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Back</span>
                </button>
              </div>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-2 gap-4 pb-8">
              {filteredUnits.map((unit, index) => (
                <div key={unit._id || index} className="w-full">
                  <PropertyCard unit={unit} index={index} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUnits.length === 0 && (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No {selectedType} properties available at the moment.
            </p>
          </div>
        )}

        {/* Load More Button for Desktop */}
        {filteredUnits.length > 0 && pagination.hasNextPage && (
          <div className="hidden md:flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all ${
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
          </div>
        )}
      </div>

      {/* Custom scrollbar hide styles */}
      <style >{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ListingTypeView;