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
  LayoutGrid,
  X,
  Loader2
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";

const ListingTypeView = () => {
  const [selectedType, setSelectedType] = useState("sale");
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showAllGrid, setShowAllGrid] = useState(false);
  
  // Refs
  const scrollContainerRef = useRef(null);
  const headerRef = useRef(null);
  const gridContainerRef = useRef(null);
  
  // Store loaded pages data to cache results
  const [pagesCache, setPagesCache] = useState({});

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

  const MOBILE_CARD_WIDTH = 280;
  const MOBILE_GAP = 16;

  // Listing type categories with rich metadata
  const listingTypes = [
    {
      id: "sale",
      title: "Properties for Sale",
      shortTitle: "Sale",
      subtitle: "Buy your dream home",
      description: "Own your perfect property with flexible payment options",
      icon: <Home className="w-4 h-4 md:w-5 md:h-5" />,
      color: "blue",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      features: [
        { icon: Home, text: "Ownership", color: "blue" },
        { icon: CheckCircle, text: "Ready to move", color: "blue" },
        { icon: Shield, text: "Legal verified", color: "blue" }
      ]
    },
    {
      id: "rent",
      title: "Properties for Rent",
      shortTitle: "Rent",
      subtitle: "Monthly rentals",
      description: "Find comfortable homes for short or long term stays",
      icon: <Key className="w-4 h-4 md:w-5 md:h-5" />,
      color: "emerald",
      bgColor: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      features: [
        { icon: Key, text: "Flexible terms", color: "emerald" },
        { icon: Clock, text: "Quick move-in", color: "emerald" },
        { icon: Star, text: "Furnished options", color: "emerald" }
      ]
    },
    {
      id: "lease",
      title: "Properties on Lease",
      shortTitle: "Lease",
      subtitle: "Long term agreements",
      description: "Commercial and residential properties for lease",
      icon: <Building className="w-4 h-4 md:w-5 md:h-5" />,
      color: "purple",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      features: [
        { icon: Building, text: "Commercial", color: "purple" },
        { icon: TrendingUp, text: "Investment", color: "purple" },
        { icon: Award, text: "Long term", color: "purple" }
      ]
    },
    // {
    //   id: "pg",
    //   title: "PG Buildings for Sale",
    //   shortTitle: "PG",
    //   subtitle: "Commercial PG properties",
    //   description: "Complete buildings suitable for Paying Guest business",
    //   icon: <Hotel className="w-4 h-4 md:w-5 md:h-5" />,
    //   color: "amber",
    //   bgColor: "from-amber-50 to-orange-50",
    //   borderColor: "border-amber-200",
    //   textColor: "text-amber-700",
    //   iconBg: "bg-amber-100",
    //   iconColor: "text-amber-600",
    //   features: [
    //     { icon: Hotel, text: "PG business", color: "amber" },
    //     { icon: Users, text: "High ROI", color: "amber" },
    //     { icon: Target, text: "Commercial zone", color: "amber" }
    //   ]
    // }
  ];

  const currentCategory = listingTypes.find(c => c.id === selectedType);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset cache when type changes
  useEffect(() => {
    setPagesCache({});
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setFilteredUnits([]);
  }, [selectedType]);

  // Calculate total pages
  const calculateTotalPages = (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  // Update pagination state
  const updatePagination = (response, page) => {
    if (response.data?.pagination) {
      // If API returns pagination object
      setPagination({
        currentPage: response.data.pagination.currentPage || page,
        totalPages: response.data.pagination.totalPages || 1,
        totalItems: response.data.pagination.total || 0,
        itemsPerPage: pagination.itemsPerPage,
        hasNextPage: response.data.pagination.hasNextPage || false,
        hasPrevPage: response.data.pagination.hasPrevPage || false
      });
    } else {
      // Fallback calculation
      const totalItems = response.data?.total || filteredUnits.length || 0;
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
    }
  };

  // Fetch property counts for each listing type
  const fetchPropertyStats = async () => {
    try {
      const res = await propertyUnitAPI.getPropertyUnits({
        limit: 1000,
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      
      if (res.data && res.data.success) {
        const allUnits = res.data.data || [];
        
        const stats = {
          sale: allUnits.filter(unit => unit.listingType === "sale").length,
          rent: allUnits.filter(unit => unit.listingType === "rent").length,
          lease: allUnits.filter(unit => unit.listingType === "lease").length,
          pg: allUnits.filter(unit => unit.listingType === "pg").length,
          total: allUnits.length
        };
        
        // setStats(stats);
        
        // Load initial properties for selected type
       
      }
    } catch (error) {
      console.error("Error fetching property stats:", error);
      // Fallback stats
      const fallbackStats = {
        sale: 45,
        rent: 32,
        lease: 18,
        pg: 12,
        total: 107
      };
      setStats(fallbackStats);
      fetchPropertiesForType(selectedType, 1, false);
    }
  };

  // Fetch properties for selected type with pagination
  const fetchPropertiesForType = async (typeId, page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      
      // Check cache for non-append operations
      const cacheKey = `${typeId}-${page}`;
      if (!append && pagesCache[cacheKey]) {
        setFilteredUnits(pagesCache[cacheKey]);
        setPagination(prev => ({
          ...prev,
          currentPage: page
        }));
        setLoading(false);
        return;
      }
      
      const res = await propertyUnitAPI.getPropertyUnits({
        listingType: typeId,
        page: page,
        limit: pagination.itemsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      
      if (res.data && res.data.success) {
        const newProperties = res.data.data || [];
        
        // Cache the page data
        setPagesCache(prev => ({
          ...prev,
          [cacheKey]: newProperties
        }));
        
        if (append) {
          // For load more, append to existing data
          setFilteredUnits(prev => {
            const existingIds = new Set(prev.map(p => p._id));
            const uniqueNewProperties = newProperties.filter(p => !existingIds.has(p._id));
            return [...prev, ...uniqueNewProperties];
          });
          
          // Update pagination for append mode
          setPagination(prev => ({
            ...prev,
            currentPage: page,
            hasNextPage: page < prev.totalPages
          }));
        } else {
          // For page change, replace with new page data
          setFilteredUnits(newProperties);
          setShowAllGrid(false);
          
          // Update full pagination info
          updatePagination(res, page);
        }
      } else {
        if (!append) {
          setFilteredUnits([]);
          setError("Failed to load properties");
        }
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      if (!append) {
        setFilteredUnits([]);
        setError(error.response?.data?.message || "Failed to fetch properties");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle type selection
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    fetchPropertiesForType(typeId, 1, false);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages || loading) return;
    
    // Scroll to top
    const element = document.getElementById('listing-type-view');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Fetch the selected page (replace mode)
    fetchPropertiesForType(selectedType, page, false);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!pagination.hasNextPage || loadingMore || loading) return;
    
    const nextPage = pagination.currentPage + 1;
    fetchPropertiesForType(selectedType, nextPage, true);
  };

  // Handle retry
  const handleRetry = () => {
    fetchPropertiesForType(selectedType, 1, false);
  };

  // Scroll handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const newScrollLeft = Math.max(0, scrollContainerRef.current.scrollLeft - (MOBILE_CARD_WIDTH + MOBILE_GAP));
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const newScrollLeft = Math.min(maxScroll, scrollContainerRef.current.scrollLeft + (MOBILE_CARD_WIDTH + MOBILE_GAP));
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const handleGridToggle = () => {
    setShowAllGrid(!showAllGrid);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 3) {
        start = 2;
        end = 4;
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
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
    
    return pages;
  };

  useEffect(() => {
   fetchPropertiesForType(selectedType, 1, false);
  }, []);

  // Mobile Compact Category Selector
  const MobileCategorySelector = () => (
    <div className="md:hidden mb-4">
      <div className="flex gap-1.5">
        {listingTypes.map((category) => {
          const isSelected = selectedType === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => handleTypeSelect(category.id)}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all ${
                isSelected
                  ? `bg-gradient-to-r ${category.bgColor} border border-${category.color}-200 shadow-sm`
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className={`p-1.5 rounded-full mb-1 ${
                isSelected ? category.iconBg : 'bg-gray-100'
              }`}>
                {React.cloneElement(category.icon, {
                  className: `w-3.5 h-3.5 ${isSelected ? category.iconColor : 'text-gray-500'}`
                })}
              </div>
              <span className={`text-[10px] font-medium ${
                isSelected ? category.textColor : 'text-gray-600'
              }`}>
                {category.shortTitle}
              </span>
        
            </button>
          );
        })}
      </div>
    </div>
  );

  // Mobile Features
  const MobileFeatures = () => (
    currentCategory && (
      <div className="md:hidden grid grid-cols-3 gap-1 mb-3">
        {currentCategory.features.map((feature, index) => (
          <div 
            key={index}
            className={`bg-${feature.color}-50 rounded-lg py-1.5 px-1 text-center`}
          >
            <feature.icon className={`w-3 h-3 text-${feature.color}-600 mx-auto mb-0.5`} />
            <span className={`text-[8px] font-medium text-${feature.color}-700 block truncate`}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    )
  );

  // Mobile View Toggle
  const MobileViewToggle = () => (
    filteredUnits.length > 0 && (
      <div className="md:hidden flex justify-end ">
        <button
          onClick={handleGridToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showAllGrid
              ? 'bg-gray-100 text-gray-700'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
          }`}
        >
          {showAllGrid ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Back</span>
            </>
          ) : (
            <>
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>View</span>
            </>
          )}
        </button>
      </div>
    )
  );

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="bg-white py-8 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile Skeleton */}
        <div className="md:hidden">
          <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto mb-4 animate-pulse"></div>
          <div className="flex gap-2 mb-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex-1 h-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Desktop Skeleton */}
        <div className="hidden md:block">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-200 rounded-xl w-96 mx-auto mb-4 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-4 gap-6 mb-12">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && filteredUnits.length === 0) {
    return renderSkeleton();
  }

  if (error && filteredUnits.length === 0) {
    return (
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Properties</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const PropertyCard = ({ unit, index }) => (
    <div className="relative group h-full">
      {/* Listing Type Badge */}
   
      
      {/* Property Card Container */}
      <div className="relative overflow-hidden border border-gray-100 group-hover:border-blue-200 transition-all duration-500 group-hover:shadow-2xl shadow-lg ">
      
        <div className="transform group-hover:-translate-y-1 transition-transform duration-500 h-full">
          <PropertyUnitCard 
            propertyUnit={unit}
            viewMode="compact"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div id="listing-type-view" className="bg-white py-8 md:pb-10">
      <div className="relative max-w-7xl mx-auto px-3 md:px-4">
        {/* Header - Desktop Only */}
        <div ref={headerRef} className="hidden md:block text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-2.5 rounded-full border border-blue-100 mb-8 shadow-sm">
            <Crown className="w-4 h-4 text-blue-700" />
            <span className="text-blue-800 text-sm font-medium tracking-widest uppercase font-sans">
              Premium Selection
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-serif tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800">
              Find by Listing
            </span>
            <span className="text-gray-900 ml-4">Type</span>
          </h1>
          <p className="text-gray-500 text-lg font-light max-w-2xl mx-auto">
            Browse properties based on how you want to acquire them
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="w-16 md:w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            <Key className="w-6 h-6 text-blue-500" />
            <div className="w-16 md:w-32 h-0.5 bg-gradient-to-l from-transparent via-blue-300 to-transparent" />
          </div>
        </div>

        {/* Mobile Category Selector */}
        <MobileCategorySelector />
        
        {/* Mobile Features */}
        {/* <MobileFeatures /> */}
        
        {/* Mobile View Toggle */}
    

        {/* Desktop Category Selector */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {listingTypes.map((category) => {
            const isSelected = selectedType === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleTypeSelect(category.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-500 text-left group ${
                  isSelected
                    ? `border-${category.color}-500 bg-gradient-to-br ${category.bgColor} shadow-xl transform -translate-y-1`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                <div className={`mb-4 p-3 rounded-xl inline-block transition-all duration-500 ${
                  isSelected
                    ? `${category.iconBg} ${category.iconColor} scale-110`
                    : 'bg-gray-100 text-gray-500 group-hover:scale-110 group-hover:bg-gray-200'
                }`}>
                  {React.cloneElement(category.icon, {
                    className: "w-6 h-6"
                  })}
                </div>

                <div>
                  <h3 className={`text-xl font-bold mb-1 transition-colors duration-500 ${
                    isSelected ? category.textColor : 'text-gray-900'
                  }`}>
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {category.subtitle}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {category.description}
                  </p>
                </div>

         

                <div className={`mt-4 flex items-center gap-1 text-sm font-medium transition-all duration-500 ${
                  isSelected ? category.textColor : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  <span>Browse Properties</span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-500 ${
                    isSelected ? 'translate-x-1' : 'group-hover:translate-x-1'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop Features */}
        {currentCategory && (
          <div className="hidden md:block mb-12">
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              {currentCategory.features.map((feature, index) => (
                <div 
                  key={index}
                  className={`bg-${feature.color}-50 border border-${feature.color}-100 rounded-xl p-4 text-center hover:shadow-md transition-shadow`}
                >
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600 mx-auto mb-2`} />
                  <span className={`text-sm font-medium text-${feature.color}-700`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties Display */}
        <div className="mb-8 md:mb-12">
          {filteredUnits.length > 0 ? (
            <>
              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-3 gap-8">
                {filteredUnits.map((unit, index) => (
                  <PropertyCard key={unit._id} unit={unit} index={index} />
                ))}
              </div>

              {/* Mobile Views */}
              <div className="md:hidden">
                {!showAllGrid  ? (
                  /* Horizontal Scroll View */
               <div>
                                 <div ref={gridContainerRef} className="relative">

                    {/* Mobile Scroll Navigation */}
                    <div className="relative mb-4">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-gray-700">
                            <span className="text-blue-600">{currentCategory?.title}</span>
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
                            <MobileViewToggle />
                        </div>
                      </div>
                    </div>
  
                    </div>
                    <div 
                      ref={scrollContainerRef}
                      onScroll={handleScroll}
                      className="flex space-x-3 pb-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {filteredUnits.map((unit, index) => (
                        <div 
                          key={unit._id} 
                          className="flex-shrink-0 w-[240px] snap-start"
                        >
                          <PropertyCard unit={unit} index={index} />
                        </div>
                      ))}

                      {/* Load More Trigger */}
                      {pagination.hasNextPage && !loadingMore && (
                        <div className="flex-shrink-0 w-[100px] flex items-center justify-center">
                          <button
                            onClick={handleLoadMore}
                            className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
                          >
                            <RightIcon className="w-5 h-5 text-blue-600" />
                          </button>
                        </div>
                      )}

                      {/* Loading Indicator */}
                      {loadingMore && (
                        <div className="flex-shrink-0 w-[100px] flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Grid View */
                  
                <div>
                  
                 <MobileViewToggle />
                  <div ref={gridContainerRef} className="grid grid-cols-2 gap-2">
                    {filteredUnits.map((unit, index) => (
                      <div key={unit._id}>
                        <PropertyCard unit={unit} index={index} />
                      </div>
                    ))}
                    </div>   

                    {/* Load More in Grid View */}
                    {pagination.hasNextPage && (
                      <div className="col-span-2 flex justify-center mt-4">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <span>Load More</span>
                              <RightIcon className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="hidden md:grid md:grid-cols-3 gap-8 mt-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
                      <div className="h-64 bg-gradient-to-r from-gray-100 to-gray-200"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-6">
                No {selectedType} properties available at the moment.
              </p>
              <button
                onClick={() => handleTypeSelect("sale")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium"
              >
                <Home className="w-4 h-4" />
                View Sale Properties
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredUnits.length > 0 && pagination.totalPages > 1 && (
          <div className="space-y-4 md:space-y-6">
            {/* Desktop Pagination */}
            <div className="hidden md:flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrevPage || loading}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  pagination.hasPrevPage && !loading
                    ? 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  pagination.hasPrevPage && !loading
                    ? 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {generatePageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
                    <MoreHorizontal className="w-4 h-4" />
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`flex items-center justify-center w-10 h-10 rounded-xl font-medium transition-all ${
                      pagination.currentPage === page
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                        : loading
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  pagination.hasNextPage && !loading
                    ? 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <RightIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage || loading}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  pagination.hasNextPage && !loading
                    ? 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Pagination */}
       

            {/* Desktop Load More */}
            {!isMobile && pagination.hasNextPage && !loadingMore && !loading && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={`flex items-center justify-center gap-3 py-4 px-8 rounded-xl font-medium transition-all ${
                    loadingMore
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading More Properties...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Properties</span>
                      <RightIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading page {pagination.currentPage}...</span>
                </div>
              </div>
            )}

            {/* Results Count */}
            {/* <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
              <p>
                Showing page {pagination.currentPage} of {pagination.totalPages} • {filteredUnits.length} of {pagination.totalItems} properties
              </p>
            </div> */}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ListingTypeView;