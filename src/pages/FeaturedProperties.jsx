import { useEffect, useState } from "react";
import { 
  Building2, 
  Star, 
  CheckCircle2, 
  Shield, 
  AlertCircle,
  Home
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";

export default function FeaturedProperties() {
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

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
      
      console.log("Fetching featured properties...");
      
      const res = await propertyUnitAPI.getFeaturedPropertyUnits();
      
      console.log("Featured properties response:", res.data);
      
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

  const handleRetry = () => {
    fetchFeaturedProperties();
  };

  // Loading skeleton for mobile (2 columns)
  const renderSkeleton = () => (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 animate-pulse">
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 w-24 h-7 rounded-full"></div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="h-8 md:h-10 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-lg w-3/4 mx-auto"></div>
            <div className="h-4 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-lg w-1/2 mx-auto"></div>
          </div>
          
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 animate-pulse">
            <div className="w-8 md:w-20 h-0.5 bg-gradient-to-r from-blue-200 to-transparent" />
            <div className="w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full" />
            <div className="w-8 md:w-20 h-0.5 bg-gradient-to-l from-blue-200 to-transparent" />
          </div>

          <div className="space-y-2 mb-4 max-w-2xl mx-auto">
            <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-full"></div>
            <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-5/6 mx-auto"></div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="bg-gradient-to-r from-blue-50 to-indigo-100 h-10 rounded-lg animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Mobile: 2 columns, Desktop: 3 columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i}
              className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-40 md:h-48 bg-gradient-to-r from-blue-200 to-indigo-300"></div>
              <div className="p-3 md:p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 md:h-4 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-3/4"></div>
                    <div className="h-2.5 md:h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 md:h-6 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-full w-8 md:w-12"></div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="h-2.5 md:h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-full"></div>
                  <div className="h-2.5 md:h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-5/6"></div>
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
      <div className="min-h-[60vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Failed to Load Properties</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (propertyUnits.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Star className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">No Featured Properties Available</h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto mb-4">
            Currently, there are no featured properties available. Check back later for premium listings.
          </p>
          <button 
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-8">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-3 md:mb-4 shadow-sm">
            <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Featured
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
            <span className="text-blue-600">Featured</span>{" "}
            <span className="text-gray-800">Properties</span>
          </h1>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-8 md:w-20 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            <Building2 className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600" />
            <div className="w-8 md:w-20 h-0.5 bg-gradient-to-l from-blue-600 to-transparent" />
          </div>

          {/* Subtitle */}
          <p className="text-gray-700 text-xs md:text-base max-w-2xl mx-auto leading-relaxed mb-3 md:mb-4">
            Handpicked properties with verified documentation and premium quality.
          </p>

          {/* Assurance Badges - Hide on mobile to save space */}
          <div className="hidden md:grid md:grid-cols-4 gap-2 md:gap-3 max-w-4xl mx-auto">
            {[
              { icon: Shield, text: "Verified Title", color: "blue" },
              { icon: CheckCircle2, text: "Approved", color: "green" },
              { icon: Star, text: "Featured", color: "yellow" },
              { icon: Home, text: "Premium", color: "purple" }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-center gap-1.5 md:gap-2 ${
                  feature.color === 'blue' ? 'bg-blue-50 border-blue-100' :
                  feature.color === 'green' ? 'bg-green-50 border-green-100' :
                  feature.color === 'yellow' ? 'bg-yellow-50 border-yellow-100' :
                  'bg-purple-50 border-purple-100'
                } px-3 py-2 rounded-lg border text-center`}
              >
                <feature.icon className={`w-4 h-4 ${
                  feature.color === 'blue' ? 'text-blue-600' :
                  feature.color === 'green' ? 'text-green-600' :
                  feature.color === 'yellow' ? 'text-yellow-600' :
                  'text-purple-600'
                }`} />
                <span className={`text-xs font-medium ${
                  feature.color === 'blue' ? 'text-blue-700' :
                  feature.color === 'green' ? 'text-green-700' :
                  feature.color === 'yellow' ? 'text-yellow-700' :
                  'text-purple-700'
                }`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Results Summary - Compact for mobile */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 bg-white p-3 rounded-xl shadow-sm">
          <div className="mb-2 md:mb-0">
            <h2 className="text-base md:text-xl font-bold text-gray-900">
              Featured Properties
            </h2>
            <p className="text-gray-600 text-xs md:text-sm">
              Showing {propertyUnits.length} premium properties
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Premium Selection
            </span>
          </div>
        </div>

        {/* Property Units Display - Mobile: 2 columns, Desktop: 3 columns */}
        <div className="mb-8">
          {propertyUnits.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {propertyUnits.map((unit, index) => (
                <div key={unit._id || index} className="relative group">
                  {/* Featured Badge */}
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full flex items-center gap-0.5 md:gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
                      <span className="hidden xs:inline">FEATURED</span>
                      <span className="xs:hidden">PREMIUM</span>
                    </span>
                  </div>
                  
                  {/* Verification Badge */}
                  {unit.isVerified && (
                    <div className="absolute top-1.5 right-1.5 z-10">
                      <span className="bg-white/90 backdrop-blur-sm text-green-700 text-[10px] md:text-xs font-medium px-1.5 py-0.5 md:px-2 md:py-1 rounded-full border border-green-200 flex items-center gap-0.5 md:gap-1 shadow-sm">
                        <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-600" />
                        <span className="hidden xs:inline">Verified</span>
                        <span className="xs:hidden">✓</span>
                      </span>
                    </div>
                  )}
                  
                  <div className="group-hover:shadow-md transition-all duration-300">
                    <PropertyUnitCard 
                      propertyUnit={unit} 
                      viewMode="compact"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base md:text-lg font-semibold text-gray-600 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                No featured properties available at the moment.
              </p>
              <button
                onClick={handleRetry}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}