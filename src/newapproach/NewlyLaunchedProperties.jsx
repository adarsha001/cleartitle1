import React, { useEffect, useState, useRef } from "react";
import {
  Clock,
  Calendar,
  Zap,
  Sparkles,
  Target,
  Award,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
  Loader2,
  TrendingUp,
  CheckCircle,
  Home,
  Star,
  Shield,
  MoreHorizontal
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { useNavigate } from "react-router-dom";

export default function NewlyLaunchedProperties() {
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [timePeriod, setTimePeriod] = useState("14");
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [stats, setStats] = useState({
    "7": 0,
    "14": 0,
    "30": 0,
    total: 0
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Refs for animations
  const gridContainerRef = useRef(null);
  const mobileViewRef = useRef(null);
  const headerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const navigate = useNavigate();
  const MOBILE_CARD_WIDTH = 240;
  const MOBILE_GAP = 12;

  // Time period categories
  const timeCategories = [
    {
      days: "7",
      title: "Last 7 Days",
      shortTitle: "7 Days",
      subtitle: "Fresh listings",
      description: "Properties added in the last week",
      icon: <Zap className="w-4 h-4 md:w-5 md:h-5" />,
      color: "amber",
      bgColor: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      features: [
        { icon: Zap, text: "Fresh listings", color: "amber" },
        { icon: TrendingUp, text: "Just launched", color: "amber" },
        { icon: Star, text: "First to view", color: "amber" }
      ]
    },
    {
      days: "14",
      title: "Last 14 Days",
      shortTitle: "14 Days",
      subtitle: "Recent additions",
      description: "Properties added in the last two weeks",
      icon: <Clock className="w-4 h-4 md:w-5 md:h-5" />,
      color: "blue",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      features: [
        { icon: Clock, text: "Recent launches", color: "blue" },
        { icon: CheckCircle, text: "New inventory", color: "blue" },
        { icon: Home, text: "Modern designs", color: "blue" }
      ]
    },
    {
      days: "30",
      title: "Last 30 Days",
      shortTitle: "30 Days",
      subtitle: "This month",
      description: "All properties launched this month",
      icon: <Calendar className="w-4 h-4 md:w-5 md:h-5" />,
      color: "purple",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      features: [
        { icon: Calendar, text: "Monthly updates", color: "purple" },
        { icon: Award, text: "Curated picks", color: "purple" },
        { icon: Shield, text: "Verified listings", color: "purple" }
      ]
    }
  ];

  const currentCategory = timeCategories.find(c => c.days === timePeriod);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate total pages
  const calculateTotalPages = (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  // Update pagination state
  const updatePagination = (response, page) => {
    const totalItems = response.data.total || propertyUnits.length;
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

  const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Fetch property counts for each time period
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
          "7": 0,
          "14": 0,
          "30": 0,
          total: allUnits.length
        };

        allUnits.forEach(unit => {
          const unitDate = new Date(unit.createdAt || unit.updatedAt);
          const now = new Date();
          
          [7, 14, 30].forEach(days => {
            const cutoffDate = new Date();
            cutoffDate.setDate(now.getDate() - days);
            if (unitDate >= cutoffDate) {
              stats[days.toString()]++;
            }
          });
        });

        setStats(stats);
        
        // Load initial properties
        fetchNewlyLaunchedProperties("14", 1);
      }
    } catch (error) {
      console.error("Error fetching property stats:", error);
    }
  };

  const fetchNewlyLaunchedProperties = async (days = timePeriod, page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const { startDate } = getDateRange(parseInt(days));
      
      const res = await propertyUnitAPI.getPropertyUnits({
        startDate: startDate,
        sortBy: "createdAt",
        sortOrder: "desc",
        page,
        limit: pagination.itemsPerPage
      });
      
      if (res.data && res.data.success) {
        let units = res.data.data || [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        
        units = units.filter(unit => {
          const unitDate = new Date(unit.createdAt || unit.updatedAt);
          return unitDate >= cutoffDate;
        });
        
        if (append) {
          setPropertyUnits(prev => [...prev, ...units]);
        } else {
          setPropertyUnits(units);
          setShowAllGrid(false);
        }
        
        updatePagination(res, page);
      } else {
        setPropertyUnits([]);
        setError("Failed to load newly launched properties");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to fetch properties");
      setPropertyUnits([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPropertyStats();
  }, []);

  const handleTimePeriodChange = (days) => {
    setTimePeriod(days);
    setPropertyUnits([]);
    fetchNewlyLaunchedProperties(days, 1);
  };

  const handleRetry = () => {
    fetchNewlyLaunchedProperties(timePeriod, 1);
  };

  const handleViewAll = () => {
    navigate('/properties');
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchNewlyLaunchedProperties(timePeriod, page);
    
    const element = document.getElementById('newly-launched');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = pagination.currentPage + 1;
    fetchNewlyLaunchedProperties(timePeriod, nextPage, true);
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
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Mobile Compact Category Selector
  const MobileCategorySelector = () => (
    <div className="md:hidden mb-4">
      <div className="flex gap-1.5">
        {timeCategories.map((category) => {
          const isSelected = timePeriod === category.days;
          
          return (
            <button
              key={category.days}
              onClick={() => handleTimePeriodChange(category.days)}
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
    propertyUnits.length > 0 && (
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
              <span>Grid</span>
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
            {[1,2,3].map(i => (
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
          <div className="grid grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && propertyUnits.length === 0) {
    return renderSkeleton();
  }

  if (error && propertyUnits.length === 0) {
    return (
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-red-600" />
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

  return (
    <div id="newly-launched" className="bg-white py-4 md:py-24">
      <div className="relative max-w-7xl mx-auto px-3 md:px-4">
        {/* Header - Desktop Only */}
        <div ref={headerRef} className="hidden md:block text-center mb-20">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-serif tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800">
              Newly Launched
            </span>
            <span className="text-gray-900 ml-4">Properties</span>
          </h1>
          <p className="text-gray-500 text-lg font-light max-w-2xl mx-auto">
            Discover the latest additions to our portfolio. Fresh opportunities with modern amenities.
          </p>
        </div>

        {/* Mobile Category Selector */}
        <MobileCategorySelector />
        
        {/* Mobile Features */}
        {/* <MobileFeatures /> */}
        
        {/* Mobile View Toggle */}
        

        {/* Desktop Category Selector */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {timeCategories.map((category) => {
            const isSelected = timePeriod === category.days;
            
            return (
              <button
                key={category.days}
                onClick={() => handleTimePeriodChange(category.days)}
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

                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
                  isSelected
                    ? `bg-${category.color}-200 text-${category.color}-800`
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {stats[category.days]} Properties
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
            <div className="grid grid-cols-3 gap-6">
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
          {propertyUnits.length > 0 ? (
            <>
              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-3 gap-8">
                {propertyUnits.map((unit, index) => (
                  <div key={unit._id || index} className="relative group transform hover:-translate-y-2 transition-all duration-500">
                    {/* {index < 3 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <Sparkles className="w-3 h-3" />
                          <span>NEW</span>
                        </span>
                      </div>
                    )} */}
                    
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full border border-gray-200 flex items-center gap-1 shadow-sm">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>
                          {(() => {
                            const unitDate = new Date(unit.createdAt || unit.updatedAt);
                            const today = new Date();
                            const diffTime = Math.abs(today - unitDate);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays <= 1 ? "Today" : `${diffDays}d ago`;
                          })()}
                        </span>
                      </span>
                    </div>
                    
                    <PropertyUnitCard 
                      propertyUnit={unit} 
                      viewMode="compact"
                    />
                  </div>
                ))}
              </div>

              {/* Mobile Views */}
              <div className="md:hidden">
                {!showAllGrid ? (
                  /* Horizontal Scroll View */
                  <div ref={mobileViewRef} className="relative">
                    {/* Mobile Scroll Navigation */}
                    <div className="relative mb-4">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-gray-700">
                            <span className="text-blue-600">Latest Properties</span>
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
                            <ChevronRight className="w-4 h-4" />
                          </button>
                      <MobileViewToggle />
                        </div>
                      </div>
                    </div>

                    <div 
                      ref={scrollContainerRef}
                      onScroll={handleScroll}
                      className="flex space-x-3 pb-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {propertyUnits.map((unit, index) => (
                        <div 
                          key={unit._id || index} 
                          className="flex-shrink-0 w-[240px] snap-start relative"
                        >
                          {/* {index < 3 && (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                <Sparkles className="w-2 h-2" />
                                <span>NEW</span>
                              </span>
                            </div>
                          )} */}
                          
                          <div className="absolute top-2 right-2 z-10">
                            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-gray-200 flex items-center gap-0.5 shadow-sm">
                              <Clock className="w-2 h-2 text-blue-600" />
                              <span>
                                {(() => {
                                  const unitDate = new Date(unit.createdAt || unit.updatedAt);
                                  const today = new Date();
                                  const diffTime = Math.abs(today - unitDate);
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  return diffDays <= 1 ? "Today" : `${diffDays}d`;
                                })()}
                              </span>
                            </span>
                          </div>
                          
                          <PropertyUnitCard propertyUnit={unit} viewMode="compact" />
                        </div>
                      ))}

                      {/* Load More Trigger */}
                      {pagination.hasNextPage && (
                        <div className="flex-shrink-0 w-[100px] flex items-center justify-center">
                          <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center"
                          >
                            {loadingMore ? (
                              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-blue-600" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Grid View */
                  <div ref={gridContainerRef} className="grid grid-cols-2 gap-2">
                    {propertyUnits.map((unit, index) => (
                      <div key={unit._id || index} className="relative">
                        {index < 3 && (
                          <div className="absolute top-1 left-1 z-10">
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full flex items-center gap-0.5">
                              <Sparkles className="w-2 h-2" />
                              <span>NEW</span>
                            </span>
                          </div>
                        )}
                        
                        <div className="absolute top-1 right-1 z-10">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[8px] font-medium px-1 py-0.5 rounded-full border border-gray-200 flex items-center gap-0.5">
                            <Clock className="w-2 h-2 text-blue-600" />
                            <span>
                              {(() => {
                                const unitDate = new Date(unit.createdAt || unit.updatedAt);
                                const today = new Date();
                                const diffTime = Math.abs(today - unitDate);
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                return diffDays <= 1 ? "Today" : `${diffDays}d`;
                              })()}
                            </span>
                          </span>
                        </div>
                        
                        <PropertyUnitCard propertyUnit={unit} viewMode="compact" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Loading More Indicator */}
              {loadingMore && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
                      <div className="h-32 md:h-64 bg-gradient-to-r from-gray-100 to-gray-200"></div>
                      <div className="p-2 md:p-6 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-6">
                No newly launched properties in the last {timePeriod} days.
              </p>
              <button
                onClick={() => handleTimePeriodChange("30")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium"
              >
                <Calendar className="w-4 h-4" />
                View Last 30 Days
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {propertyUnits.length > 0 && pagination.totalPages > 1 && (
          <div className="space-y-4 md:space-y-6">
            {/* Desktop Pagination */}
            <div className="hidden md:flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                  pagination.hasPrevPage
                    ? 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {generatePageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="w-12 h-12 flex items-center justify-center text-gray-400">
                    <MoreHorizontal className="w-5 h-5" />
                  </span>
                ) : (
                  <button
                    key={`page-${page}`}
                    onClick={() => handlePageChange(page)}
                    className={`flex items-center justify-center w-12 h-12 rounded-xl font-medium transition-all ${
                      pagination.currentPage === page
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                  pagination.hasNextPage
                    ? 'bg-white text-blue-600 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Pagination */}
            {/* <div className="md:hidden">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium ${
                    pagination.hasPrevPage
                      ? 'bg-white text-blue-600 border border-gray-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs font-medium text-blue-700">
                    {pagination.currentPage}/{pagination.totalPages}
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs font-medium ${
                    pagination.hasNextPage
                      ? 'bg-white text-blue-600 border border-gray-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

         
              {pagination.hasNextPage && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={`w-full mt-2 flex items-center justify-center gap-1 py-2.5 rounded-lg text-xs font-medium ${
                    loadingMore
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  }`}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div> */}

            {/* Desktop Load More */}
            {!isMobile && pagination.hasNextPage && (
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
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
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
}