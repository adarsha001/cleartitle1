import { useEffect, useState } from "react";
import { 
  Building2, 
  Star, 
  CheckCircle2, 
  Shield, 
  Grid, 
  List,
  AlertCircle,
  Home,
  TrendingUp
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";

// Main Component
export default function FeaturedProperties() {
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
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

  // Retry loading
  const handleRetry = () => {
    fetchFeaturedProperties();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12">
        <div className="text-center px-4">
          <div className="inline-block w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-blue-600 tracking-wide uppercase text-xs md:text-sm font-semibold">
            Loading Featured Properties
          </p>
          <p className="text-gray-500 text-xs mt-1">Please wait...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // Empty state
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
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section - Compact */}
        <div className="text-center mb-8">
          {/* Premium Badge - Compact */}
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-full mb-4 md:mb-6 shadow-sm">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              Featured
            </span>
          </div>

          {/* Main Title - Responsive */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-3 tracking-tight">
            <span className="text-blue-600">Featured</span>{" "}
            <span className="text-gray-800">Properties</span>
          </h1>
          
          {/* Decorative Line - Responsive */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
            <div className="w-12 md:w-20 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            <Building2 className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            <div className="w-12 md:w-20 h-0.5 bg-gradient-to-l from-blue-600 to-transparent" />
          </div>

          {/* Subtitle - Responsive */}
          <p className="text-gray-700 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-4 md:mb-6">
            Handpicked properties with verified documentation and premium quality.
          </p>

          {/* Stats - Compact Grid */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 mb-6">
            {/* Total Units Count */}
            <div className="bg-white border border-blue-600 px-4 py-2 rounded-xl shadow-sm w-full md:w-auto">
              <div className="text-xl md:text-2xl font-bold text-blue-600">{propertyUnits.length}</div>
              <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                Featured Properties
              </div>
            </div>

            {/* View Mode Toggle - Compact */}
            {/* <div className="bg-white border border-blue-600 rounded-xl p-1 inline-flex w-full md:w-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-1.5 md:px-5 md:py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs md:text-sm ${
                  viewMode === "grid" 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-1.5 md:px-5 md:py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs md:text-sm ${
                  viewMode === "list" 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div> */}
          </div>

          {/* Assurance Badges - Responsive Grid */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-4xl mx-auto">
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

        {/* Results Summary - Compact */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 bg-white p-3 md:p-4 rounded-xl shadow-sm">
          <div className="mb-2 md:mb-0">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              Featured Properties
            </h2>
            <p className="text-gray-600 text-sm">
              Showing {propertyUnits.length} premium properties
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {viewMode === "grid" ? "Grid View" : "List View"}
            </span>
            <span className="text-xs text-gray-500 hidden md:inline">
              Sorted by: Featured
            </span>
          </div>
        </div>

        {/* Property Units Display - Responsive Grid */}
        <div className="mb-8">
          {propertyUnits.length > 0 ? (
            <div className={
              viewMode === "grid" 
                ? `grid gap-4 md:gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}` 
                : "space-y-4"
            }>
              {propertyUnits.map((unit, index) => (
                <PropertyUnitCard 
                  key={unit._id || index} 
                  propertyUnit={unit} 
                  viewMode={isMobile ? "compact" : viewMode}
                />
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

        {/* CTA Section - Compact */}
        {/* <div className="mt-8 md:mt-12 text-center border-t border-blue-100 pt-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 md:p-6 text-white max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-full mb-3 shadow-sm">
              <TrendingUp className="w-4 h-4 fill-current" />
              <span className="text-xs font-semibold">WHY CHOOSE FEATURED?</span>
            </div>
            
            <h3 className="text-lg md:text-xl font-bold mb-3">Premium Quality Assurance</h3>
            <p className="text-blue-100 text-sm mb-4 max-w-2xl mx-auto">
              Every featured property undergoes verification and offers exceptional value with complete peace of mind.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 max-w-3xl mx-auto mb-4">
              {[
                "✓ Verified & Approved",
                "✓ Premium Quality", 
                "✓ Complete Docs"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-blue-800/50 px-3 py-2 rounded-lg justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-medium">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-500">
              <p className="text-blue-200 text-xs">
                All featured properties are handpicked by our real estate experts.
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}