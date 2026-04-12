// FeaturedProperties.jsx
import { useEffect, useState, useRef } from "react";
import { 
  Star, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  LayoutGrid,
  X,
  Home,
  Shield,
  CheckCircle2
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";

export default function FeaturedProperties() {
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showViewMore, setShowViewMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const scrollContainerRef = useRef(null);

  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await propertyUnitAPI.getFeaturedPropertyUnits();
      
      if (res.data && res.data.success) {
        const featuredProperties = res.data.data || [];
        setPropertyUnits(featuredProperties);
        setTotalPages(Math.ceil(featuredProperties.length / ITEMS_PER_PAGE));
      } else {
        setPropertyUnits([]);
        setError("Failed to load featured properties");
      }
    } catch (err) {
      console.error("Error fetching featured properties:", err);
      setError(err.response?.data?.message || "Failed to fetch featured properties");
      setPropertyUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current && isMobile && !showAllGrid) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        
        const scrolledPercentage = (scrollLeft + clientWidth) / scrollWidth;
        if (scrolledPercentage > 0.7 && currentPage < totalPages) {
          setShowViewMore(true);
        } else {
          setShowViewMore(false);
        }
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [propertyUnits, isMobile, currentPage, totalPages, showAllGrid]);

  const handleRetry = () => {
    fetchFeaturedProperties();
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current && isMobile) {
      scrollContainerRef.current.scrollBy({
        left: -320,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && isMobile) {
      scrollContainerRef.current.scrollBy({
        left: 320,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current && isMobile && !showAllGrid) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      
      const itemWidth = 320 + 32;
      const newPage = Math.floor(scrollLeft / itemWidth) + 1;
      if (newPage !== currentPage && newPage <= totalPages) {
        setCurrentPage(newPage);
      }

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
      const nextPage = currentPage + 1;
      const scrollPosition = (nextPage - 1) * (320 + 32);
      
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

  const renderSkeleton = () => (
    <div className="min-h-screen bg-white py-16 md:py-24">
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
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={`desktop-skel-${i}`}
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

        <div className="md:hidden flex space-x-8 pb-8 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={`mobile-skel-${i}`}
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

  if (loading) return renderSkeleton();

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
            <AlertCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-sans">Unable to Load Featured Properties</h2>
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
      <div className="min-h-screen bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Star className="w-20 h-20 text-blue-500 mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-sans">No Featured Properties Available</h2>
          <p className="text-gray-600 text-base max-w-md mx-auto mb-8">
            Currently, there are no featured properties available. Check back later for premium listings.
          </p>
          <button 
            onClick={handleRetry}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Refresh Properties
          </button>
        </div>
      </div>
    );
  }

  const PropertyCard = ({ unit }) => (
    <div className="relative group">
      <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 group-hover:border-blue-200 transition-all duration-500 group-hover:shadow-2xl shadow-lg">
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-100 rounded-3xl transition-all duration-500 pointer-events-none"></div>
        <div className="transform group-hover:-translate-y-1 transition-transform duration-500">
          <PropertyUnitCard 
            propertyUnit={unit} 
            viewMode="compact"
          />
        </div>
      </div>
    </div>
  );

  const visibleItems = isMobile && !showAllGrid
    ? propertyUnits.slice(0, currentPage * ITEMS_PER_PAGE)
    : propertyUnits;

  return (
    <div className="bg-white py-6 md:py-24">
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center md:mb-20">
          <div className="mb-6 hidden sm:block">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-serif tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800">
                Featured
              </span>
              <span className="text-gray-900 block md:inline md:ml-4">Properties</span>
            </h1>
            <p className="text-gray-500 text-lg font-light max-w-2xl mx-auto">
              Handpicked properties with verified documentation and premium quality
            </p>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {propertyUnits.map((unit) => (
            <PropertyCard key={unit._id || `featured-card-${unit.slug || Math.random()}`} unit={unit} />
          ))}
        </div>

        {/* Mobile Horizontal Scroll Layout */}
        {!showAllGrid ? (
          <div className="md:hidden py-2 relative">
            <div className="relative mb-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 font-sans">
                  <span className="text-blue-700">Featured Properties</span> 
                </h2>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className={`p-3 rounded-full border ${
                      canScrollLeft 
                        ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    } transition-all duration-300 shadow-sm`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className={`p-3 rounded-full border ${
                      canScrollRight 
                        ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    } transition-all duration-300 shadow-sm`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {propertyUnits.length > ITEMS_PER_PAGE && (
                    <button
                      onClick={handleViewAll}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-sm">View All</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex space-x-8 pb-8 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {visibleItems.map((unit) => (
                <div 
                  key={unit._id || `featured-mobile-${unit.slug || Math.random()}`} 
                  className="flex-shrink-0 w-[320px] snap-start"
                >
                  <PropertyCard unit={unit} />
                </div>
              ))}
            </div>

            {showViewMore && currentPage < totalPages && propertyUnits.length > currentPage * ITEMS_PER_PAGE && (
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
          <div className="md:hidden py-2 relative">
            <div className="relative mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 font-sans">
                  <span className="text-blue-700">All Featured Properties</span> 
                  <span className="text-sm text-gray-500 ml-2">({propertyUnits.length})</span>
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

            <div className="grid grid-cols-2 gap-4 pb-8">
              {propertyUnits.map((unit) => (
                <div key={unit._id || `featured-grid-${unit.slug || Math.random()}`} className="w-full">
                  <PropertyCard unit={unit} />
                </div>
              ))}
            </div>
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