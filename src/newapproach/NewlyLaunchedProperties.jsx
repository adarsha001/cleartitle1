import React, { useEffect, useState, useRef } from "react";
import { 
  Clock,
  Calendar,
  Zap,
  Sparkles,
  Target,
  Award,
  ArrowRight,
  Star,
  ChevronRight,
  TrendingUp,
  Crown,
  Gem,
  Building2,
  Home,
  MapPin,
  ChevronLeft,
  ChevronRight as RightChevron
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { useNavigate } from "react-router-dom";

export default function NewlyLaunchedProperties() {
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [timePeriod, setTimePeriod] = useState("30");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showViewMore, setShowViewMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const ITEMS_PER_PAGE = 3; // Show 3 items on mobile initially

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        setTotalPages(Math.ceil(units.length / ITEMS_PER_PAGE));
        setCurrentPage(1); // Reset to first page when time period changes
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

  useEffect(() => {
    fetchNewlyLaunchedProperties();
  }, [timePeriod]);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current && isMobile) {
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
  }, [propertyUnits, isMobile, currentPage, totalPages]);

  const handleRetry = () => {
    fetchNewlyLaunchedProperties();
  };

  const handleViewAll = () => {
    setTimePeriod('30');
  };

  const handleTimePeriodChange = (days) => {
    setTimePeriod(days);
  };

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
    if (scrollContainerRef.current && isMobile) {
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

  const renderSkeleton = () => (
    <div className="min-h-screen py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
              className="bg-white rounded-3xl overflow-hidden animate-pulse border border-blue-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
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
                
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-100">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full"></div>
                      <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Skeleton Horizontal Scroll */}
        <div className="md:hidden flex space-x-8 pb-8 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i}
              className="flex-shrink-0 w-[380px] bg-white rounded-3xl overflow-hidden animate-pulse border border-blue-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
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
                
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-100">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full"></div>
                      <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
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
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
            <Gem className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-sans">Unable to Load Properties</h2>
          <p className="text-gray-600 text-base mb-8">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (propertyUnits.length === 0) {
    return (
      <div className="bg-white md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Gem className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-sans">No Newly Launched Properties</h2>
          <p className="text-gray-600 text-base max-w-md mx-auto mb-8">
            Currently, there are no newly launched properties in the last {timePeriod} days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleViewAll}
              className="bg-white border-2 border-blue-600 text-blue-700 px-8 py-3.5 rounded-xl font-medium hover:bg-blue-50 transition-all duration-300 text-base hover:border-blue-700"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const PropertyCard = ({ unit, index }) => (
    <div className="relative group h-full">
      {/* Time indicator */}
      <div className="absolute top-5 right-5 z-20">
        <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium px-3.5 py-2 rounded-full border border-gray-200 flex items-center gap-2 shadow-md">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-sans">
            {(() => {
              const unitDate = new Date(unit.createdAt || unit.updatedAt);
              const today = new Date();
              const diffTime = Math.abs(today - unitDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 1 ? "Today" : diffDays <= 7 ? "This Week" : `${diffDays} Days`;
            })()}
          </span>
        </span>
      </div>
      
      {/* Property Card Container */}
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
  const visibleItems = isMobile 
    ? propertyUnits.slice(0, currentPage * ITEMS_PER_PAGE)
    : propertyUnits;

  return (
    <div className="bg-white md:py-24">
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center md:mb-20">
          {/* Main title - hidden on mobile */}
          <div className="">
            <h1 className="hidden sm:block text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-serif tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800">
                Newly Launched
              </span>
              <span className="text-gray-900 block md:inline md:ml-4">Properties</span>
            </h1>
            <p className="hidden sm:block text-gray-500 text-lg font-light max-w-2xl mx-auto">
              Fresh opportunities curated for discerning investors
            </p>
          </div>

          {/* Time period filters - Compact for mobile */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {/* Mobile Title */}
            <h2 className="sm:hidden text-2xl font-bold text-gray-900 mb-2 font-sans">
              <span className="text-blue-700">Newly Launched</span>
            </h2>
            
            {/* Compact filter buttons for mobile */}
            <div className="flex sm:hidden items-center justify-center gap-2 w-full max-w-xs mx-auto">
              {[
                { days: "7", label: "7D", icon: Clock },
                { days: "14", label: "14D", icon: Calendar },
                { days: "30", label: "30D", icon: Target }
              ].map((period) => (
                <button
                  key={period.days}
                  onClick={() => handleTimePeriodChange(period.days)}
                  className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm ${
                    timePeriod === period.days
                      ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <period.icon className={`w-3.5 h-3.5 ${
                    timePeriod === period.days ? 'text-white' : 'text-blue-600'
                  }`} />
                  <span className="font-medium">{period.label}</span>
                  {timePeriod === period.days && (
                    <Sparkles className="w-3 h-3 ml-0.5 text-white/80" />
                  )}
                </button>
              ))}
            </div>

            {/* Desktop filter buttons */}
            <div className="hidden pt-6 sm:flex flex-wrap justify-center gap-3">
              {[
                { days: "7", label: "Last 7 Days", icon: Clock },
                { days: "14", label: "Last 14 Days", icon: Calendar },
                { days: "30", label: "Last 30 Days", icon: Target }
              ].map((period) => (
                <button
                  key={period.days}
                  onClick={() => handleTimePeriodChange(period.days)}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-medium transition-all duration-300 text-base group ${
                    timePeriod === period.days
                      ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg hover:shadow-xl transform -translate-y-1"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                  }`}
                >
                  <period.icon className={`w-5 h-5 transition-colors ${
                    timePeriod === period.days ? 'text-white' : 'text-blue-600 group-hover:text-blue-700'
                  }`} />
                  <span className="font-medium">{period.label}</span>
                  {timePeriod === period.days && (
                    <Sparkles className="w-4 h-4 ml-1 text-white/80" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {propertyUnits.map((unit, index) => (
            <PropertyCard key={unit._id || index} unit={unit} index={index} />
          ))}
        </div>

        {/* Mobile Horizontal Scroll Layout */}
        <div className="md:hidden relative">
          {/* Mobile Scroll Navigation Buttons - More compact */}
          <div className="relative mb-4">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-700 font-sans">
                  <span className="text-blue-600">Properties</span>
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
                  <RightChevron className="w-4 h-4" />
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

          {/* Page Indicator */}
         

          {/* View More Button */}

        </div>
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
}