import React, { useEffect, useState, useRef } from "react";
import { 
  Clock,
  Calendar,
  Zap,
  Sparkles,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  X,
  Gem,
  ArrowRight
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { useNavigate } from "react-router-dom";

export default function NewlyLaunchedProperties() {
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState("14");
  const [showMobileGrid, setShowMobileGrid] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  // Fetch properties
  useEffect(() => {
    fetchNewlyLaunchedProperties();
  }, [timePeriod]);

  const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const fetchNewlyLaunchedProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { startDate } = getDateRange(parseInt(timePeriod));
      
      const res = await propertyUnitAPI.getPropertyUnits({
        startDate: startDate,
        sortBy: "createdAt",
        sortOrder: "desc",
        limit: 100
      });
      
      if (res.data && res.data.success) {
        let units = res.data.data || [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(timePeriod));
        
        units = units.filter(unit => {
          const unitDate = new Date(unit.createdAt || unit.updatedAt);
          return unitDate >= cutoffDate;
        });
        
        setPropertyUnits(units);
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
    }
  };

  // Scroll handlers
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  const handleScroll = () => {
    setScrollPosition(scrollContainerRef.current?.scrollLeft || 0);
    checkScrollButtons();
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Time period change handler
  const handleTimePeriodChange = (days) => {
    setTimePeriod(days);
    setShowMobileGrid(false);
  };

  const handleRetry = () => {
    fetchNewlyLaunchedProperties();
  };

  const handleViewAll = () => {
    navigate('/properties');
  };

  const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Render skeleton with second code styling
  const renderSkeleton = () => (
    <div className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-48 h-4 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="h-12 md:h-16 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl w-3/4 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl w-1/2 mx-auto animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-20 md:w-32 h-0.5 bg-gradient-to-r from-blue-100 to-transparent animate-pulse" />
            <div className="w-6 h-6 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full animate-pulse" />
            <div className="w-20 md:w-32 h-0.5 bg-gradient-to-l from-blue-100 to-transparent animate-pulse" />
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="bg-gradient-to-r from-blue-100 to-indigo-50 w-40 h-14 rounded-2xl animate-pulse border border-blue-200"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Desktop Skeleton Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i}
              className="bg-white rounded-3xl overflow-hidden animate-pulse border border-blue-100 shadow-sm"
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

        {/* Mobile Skeleton */}
        <div className="md:hidden flex space-x-4 pb-8 overflow-x-auto">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="flex-shrink-0 w-[280px] bg-white rounded-2xl overflow-hidden animate-pulse border border-blue-100"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-48 bg-gradient-to-r from-blue-200 to-blue-300"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gradient-to-r from-blue-300 to-blue-400 rounded w-3/4"></div>
                <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-1/2"></div>
                <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) return renderSkeleton();

  if (error) {
    return (
      <div className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
            <Gem className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Unable to Load Properties</h2>
          <p className="text-gray-600 text-base mb-8">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (propertyUnits.length === 0) {
    return (
      <div className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Gem className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">No Newly Launched Properties</h2>
          <p className="text-gray-600 text-base max-w-md mx-auto mb-8">
            Currently, there are no newly launched properties in the last {timePeriod} days.
          </p>
          <button 
            onClick={() => handleTimePeriodChange('30')}
            className="bg-white border-2 border-blue-600 text-blue-700 px-8 py-3.5 rounded-xl font-medium hover:bg-blue-50 transition-all duration-300"
          >
            Try Different Time Period
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-serif tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800">
              Newly Launched
            </span>
            <span className="text-gray-900 block md:inline md:ml-4">Properties</span>
          </h1>
          
          <p className="text-gray-500 text-base md:text-lg font-light max-w-2xl mx-auto mb-8">
            Fresh opportunities curated for discerning investors
          </p>

          {/* Feature Badges - Hidden on mobile */}
          <div className="hidden md:flex justify-center gap-3 max-w-4xl mx-auto mb-10">
            {[
              { icon: Clock, text: "Freshly Added", color: "blue" },
              { icon: Target, text: "Modern Design", color: "cyan" },
              { icon: Award, text: "Latest Amenities", color: "indigo" },
              { icon: Calendar, text: "Ready Soon", color: "sky" }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  feature.color === 'blue' ? 'bg-blue-50 border-blue-100' :
                  feature.color === 'cyan' ? 'bg-cyan-50 border-cyan-100' :
                  feature.color === 'indigo' ? 'bg-indigo-50 border-indigo-100' :
                  'bg-sky-50 border-sky-100'
                }`}
              >
                <feature.icon className={`w-4 h-4 ${
                  feature.color === 'blue' ? 'text-blue-600' :
                  feature.color === 'cyan' ? 'text-cyan-600' :
                  feature.color === 'indigo' ? 'text-indigo-600' :
                  'text-sky-600'
                }`} />
                <span className={`text-sm font-medium ${
                  feature.color === 'blue' ? 'text-blue-700' :
                  feature.color === 'cyan' ? 'text-cyan-700' :
                  feature.color === 'indigo' ? 'text-indigo-700' :
                  'text-sky-700'
                }`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* Time Period Filters */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {[
              { days: "7", label: "Last 7 Days", icon: Clock },
              { days: "14", label: "Last 14 Days", icon: Calendar },
              { days: "30", label: "Last 30 Days", icon: Target }
            ].map((period) => (
              <button
                key={period.days}
                onClick={() => handleTimePeriodChange(period.days)}
                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-medium transition-all duration-300 text-sm md:text-base ${
                  timePeriod === period.days
                    ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg hover:shadow-xl transform -translate-y-0.5"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <period.icon className={`w-4 h-5 md:w-5 md:h-5 ${
                  timePeriod === period.days ? 'text-white' : 'text-blue-600'
                }`} />
                <span className="hidden sm:inline">{period.label}</span>
                <span className="sm:hidden">{period.days} Days</span>
                {timePeriod === period.days && (
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 ml-1 text-white/80" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Grid (md and above) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {propertyUnits.map((unit, index) => (
            <div key={unit._id || index} className="relative group">
              {/* New Badge */}
              {index < 3 && (
                <div className="absolute top-5 left-5 z-20">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    NEW LAUNCH
                  </span>
                </div>
              )}
              
              {/* Days ago badge */}
              <div className="absolute top-5 right-5 z-20">
                <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-1.5 shadow-md">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {getDaysAgo(unit.createdAt || unit.updatedAt)} days ago
                </span>
              </div>
              
              {/* Property Card Container with hover effect */}
              <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 group-hover:border-blue-200 transition-all duration-500 group-hover:shadow-2xl shadow-lg h-full">
                <div className="transform group-hover:-translate-y-1 transition-transform duration-500 h-full">
                  <PropertyUnitCard propertyUnit={unit} viewMode="compact" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {/* View Toggle */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowMobileGrid(!showMobileGrid)}
              className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
            >
              {showMobileGrid ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Show Scroll</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" />
                  <span>Show Grid</span>
                </>
              )}
            </button>
          </div>

          {/* Scroll View */}
          {!showMobileGrid && (
            <div className="relative">
              {/* Scroll Buttons */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 text-blue-600 hover:bg-blue-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              {canScrollRight && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 text-blue-600 hover:bg-blue-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Scroll Container */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto gap-4 pb-6 scroll-smooth scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {propertyUnits.map((unit, index) => (
                  <div key={unit._id || index} className="flex-shrink-0 w-[280px]">
                    <div className="relative group">
                      {/* New Badge */}
                      {index < 3 && (
                        <div className="absolute top-3 left-3 z-20">
                          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Sparkles className="w-2.5 h-2.5" />
                            NEW
                          </span>
                        </div>
                      )}
                      
                      {/* Days ago badge */}
                      <div className="absolute top-3 right-3 z-20">
                        <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-[10px] font-medium px-2 py-1 rounded-full border border-gray-200 flex items-center gap-1 shadow-md">
                          <Clock className="w-2.5 h-2.5 text-blue-600" />
                          {getDaysAgo(unit.createdAt || unit.updatedAt)}d
                        </span>
                      </div>
                      
                      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md">
                        <PropertyUnitCard propertyUnit={unit} viewMode="compact" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll Indicator */}
              {propertyUnits.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-2">
                  {propertyUnits.slice(0, Math.min(6, propertyUnits.length)).map((_, i) => {
                    const cardWidth = 296; // card width + gap
                    const isActive = 
                      scrollPosition >= i * cardWidth - 50 && 
                      scrollPosition < (i + 1) * cardWidth - 50;
                    
                    return (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          isActive ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-300'
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Grid View */}
          {showMobileGrid && (
            <div className="grid grid-cols-2 gap-3">
              {propertyUnits.map((unit, index) => (
                <div key={unit._id || index} className="relative group">
                  {/* New Badge */}
                  {index < 3 && (
                    <div className="absolute top-2 left-2 z-20">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg">
                        <Sparkles className="w-2 h-2" />
                        NEW
                      </span>
                    </div>
                  )}
                  
                  {/* Days ago badge */}
                  <div className="absolute top-2 right-2 z-20">
                    <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-[8px] font-medium px-1.5 py-0.5 rounded-full border border-gray-200 flex items-center gap-0.5 shadow-md">
                      <Clock className="w-2 h-2 text-blue-600" />
                      {getDaysAgo(unit.createdAt || unit.updatedAt)}d
                    </span>
                  </div>
                  
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <PropertyUnitCard propertyUnit={unit} viewMode="compact" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        {propertyUnits.length > 6 && (
          <div className="text-center mt-10 md:mt-12">
            <button
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}