import { useEffect, useState, useRef } from "react";
import { 
  Building2, 
  Star, 
  CheckCircle2, 
  Shield, 
  AlertCircle,
  Home,
  ChevronLeft,
  ChevronRight
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
  const scrollContainerRef = useRef(null);

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
        setPropertyUnits(res.data.data || []);
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
      if (scrollContainerRef.current && isMobile) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [propertyUnits, isMobile]);

  const handleRetry = () => {
    fetchFeaturedProperties();
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current && isMobile) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && isMobile) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current && isMobile) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
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

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="bg-gradient-to-r from-blue-100 to-indigo-50 w-32 h-12 rounded-xl animate-pulse border border-blue-200"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
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

        {/* Mobile Horizontal Skeleton */}
        <div className="md:hidden flex space-x-8 pb-8 overflow-x-auto scrollbar-hide">
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

  if (loading) return renderSkeleton();

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
            <AlertCircle className="w-10 h-10 text-blue-600" />
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

  const PropertyCard = ({ unit, index }) => (
    <div className="relative group h-full">
      {/* Featured Badge */}
      {/* <div className="absolute top-5 left-5 z-20">
        <span className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-blue-500/20 uppercase tracking-wider">
          <Star className="w-3.5 h-3.5 fill-white" />
          <span>FEATURED</span>
        </span>
      </div> */}
      
      {/* Verification Badge */}
      {/* {unit.isVerified && (
        <div className="absolute top-5 right-5 z-20">
          <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium px-3.5 py-2 rounded-full border border-blue-200 flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-sans">Verified</span>
          </span>
        </div>
      )} */}
      
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

  return (
    <div className=" bg-white py-6 md:24">
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center  md:mb-20">
          {/* Premium Indicator */}
          {/* <div className=" items-center gap-2  hidden  sm:inline-flex  bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-2.5 rounded-full border border-blue-100 mb-8 shadow-sm">
            <Star className="w-4 h-4 text-blue-700 fill-blue-700" />
            <span className="text-blue-800  text-sm font-medium tracking-widest uppercase font-sans">
              Premium Selection
            </span>
          </div> */}

          {/* Main Title */}
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
          
     
          {/* <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 md:w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            <Building2 className="w-6 h-6 text-blue-500" />
            <div className="w-16 md:w-32 h-0.5 bg-gradient-to-l from-transparent via-blue-300 to-transparent" />
          </div> */}

          {/* Description */}
          {/* <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10 font-sans">
            Discover our curated collection of premium properties, each verified for authenticity 
            and selected for exceptional value and quality.
          </p> */}

          {/* Assurance Badges */}
          {/* <div className="hidden md:grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            {[
              { 
                icon: Shield, 
                text: "Verified Title", 
                subtext: "Legal documentation verified",
                color: "blue"
              },
              { 
                icon: CheckCircle2, 
                text: "Approved", 
                subtext: "Quality assurance passed",
                color: "indigo"
              },
              { 
                icon: Star, 
                text: "Featured", 
                subtext: "Handpicked selection",
                color: "blue"
              },
              { 
                icon: Home, 
                text: "Premium", 
                subtext: "High-value properties",
                color: "indigo"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl shadow-sm"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-3.5 rounded-xl bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 group-hover:from-${feature.color}-100 group-hover:to-${feature.color}-200 transition-all duration-300`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-700`} />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold text-base mb-1.5 font-sans">
                      {feature.text}
                    </h3>
                    <p className="text-gray-500 text-sm font-light">
                      {feature.subtext}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {propertyUnits.map((unit, index) => (
            <PropertyCard key={unit._id || index} unit={unit} index={index} />
          ))}
        </div>

        {/* Mobile Horizontal Scroll Layout */}
        <div className="md:hidden py-2 relative">
          {/* Scroll Navigation Buttons */}
          <div className="relative mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 font-sans">
                <span className="text-blue-700">Featured Properties</span> 
                {/* <span className="text-gray-600 text-lg ml-3 font-normal">
                  ({propertyUnits.length} available)
                </span> */}
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
              </div>
            </div>
          </div>

          {/* Mobile Scroll Container */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex space-x-8 pb-8 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {propertyUnits.map((unit, index) => (
              <div 
                key={unit._id || index} 
                className="flex-shrink-0 w-[320px] snap-start"
              >
                <PropertyCard unit={unit} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* Results Summary
        {propertyUnits.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-base font-light">
              Showing <span className="text-blue-700 font-medium">{propertyUnits.length}</span> 
              {' '}premium featured properties
            </p>
          </div>
        )} */}
      </div>

      {/* Custom scrollbar hide styles */}
      <style jsx>{`
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