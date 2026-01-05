import { useEffect, useState } from "react";
import { 
  Building2, 
  Star, 
  CheckCircle2, 
  Shield, 
  Grid, 
  List,
  AlertCircle
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";

// Main Component
export default function FeaturedProperties() {
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null);

const fetchFeaturedProperties = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log("Fetching featured properties...");
    
    // Remove all parameters from the call
    const res = await propertyUnitAPI.getFeaturedPropertyUnits(); // No parameters
    
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
      <div className="min-h-screen bg-gradient-to-br  via-white to-indigo-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-blue-600 tracking-wide uppercase text-sm font-semibold">
            Loading Featured Properties
          </p>
          <p className="text-gray-500 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br  via-white to-indigo-50 flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Properties</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
      <div className="bg-gradient-to-br from-blue-50 to-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Featured Properties Available</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Currently, there are no featured properties available. Check back later for premium listings.
          </p>
          <button 
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Refresh Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br  via-white  py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* Premium Badge */}
          {/* <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-full mb-6 shadow-lg">
            <Star className="w-5 h-5 fill-current" />
            <span className="text-sm font-semibold tracking-widest uppercase">
              Featured Properties
            </span>
          </div> */}

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            <span className="text-blue-600">Featured</span>{" "}
            <span className="text-gray-800">Properties</span>
          </h1>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-transparent" />
            <Building2 className="w-6 h-6 text-blue-600" />
            <div className="w-24 h-1 bg-gradient-to-l from-blue-600 to-transparent" />
          </div>

          {/* Subtitle */}
          <p className="text-gray-700 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Handpicked properties with verified documentation and premium quality.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
            {/* Total Units Count */}
            <div className="bg-white border-2 border-blue-600 px-6 py-3 rounded-xl shadow-md">
              <div className="text-3xl font-bold text-blue-600">{propertyUnits.length}</div>
              <div className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Featured Properties
              </div>
            </div>

            {/* View Mode Toggle */}
            {/* <div className="bg-white border-2 border-blue-600 rounded-xl p-2 inline-flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === "grid" 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <Grid className="w-4 h-4" />
                Grid View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  viewMode === "list" 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
            </div> */}
          </div>

          {/* Assurance Badges */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Shield, text: "Verified Title", color: "blue" },
              { icon: CheckCircle2, text: "Approved", color: "green" },
              { icon: Star, text: "Featured", color: "yellow" },
              { icon: Building2, text: "Premium Quality", color: "purple" }
            ].map((feature, index) => (
              <div key={index} className={`flex items-center justify-center gap-2 ${
                feature.color === 'blue' ? 'bg-blue-100/50 border-blue-200' :
                feature.color === 'green' ? 'bg-green-100/50 border-green-200' :
                feature.color === 'yellow' ? 'bg-yellow-100/50 border-yellow-200' :
                'bg-purple-100/50 border-purple-200'
              } px-4 py-3 rounded-lg border`}>
                <feature.icon className={`w-5 h-5 ${
                  feature.color === 'blue' ? 'text-blue-600' :
                  feature.color === 'green' ? 'text-green-600' :
                  feature.color === 'yellow' ? 'text-yellow-600' :
                  'text-purple-600'
                }`} />
                <span className={`text-sm font-medium ${
                  feature.color === 'blue' ? 'text-blue-800' :
                  feature.color === 'green' ? 'text-green-800' :
                  feature.color === 'yellow' ? 'text-yellow-800' :
                  'text-purple-800'
                }`}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex flex-wrap items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Properties
            </h2>
            <p className="text-gray-600">
              Showing {propertyUnits.length} premium properties
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {viewMode === "grid" ? "Grid View" : "List View"}
            </span>
            <span className="text-sm text-gray-500">
              Sorted by: Featured Order
            </span>
          </div>
        </div>

        {/* Property Units Display */}
        <div className="mb-12">
          {propertyUnits.length > 0 ? (
            <div className={viewMode === "grid" 
              ? "grid gap-8 md:grid-cols-2 lg:grid-cols-3" 
              : "space-y-6"
            }>
              {propertyUnits.map((unit, index) => (
                <PropertyUnitCard 
                  key={unit._id || index} 
                  propertyUnit={unit} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-sm">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                No featured properties available at the moment.
              </p>
              <button
                onClick={handleRetry}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
        </div>

        {/* Premium Assurance CTA */}
        {/* <div className="mt-20 text-center border-t-2 border-blue-200 pt-12">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-white max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full mb-4 shadow-md">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-sm font-semibold">WHY CHOOSE FEATURED PROPERTIES?</span>
            </div>
            
            <h3 className="text-2xl font-bold mb-4">Premium Quality Assurance</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Every featured property undergoes verification and offers exceptional value with complete peace of mind for your investment.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              {[
                "✓ Verified & Approved",
                "✓ Premium Quality", 
                "✓ Complete Documentation"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-blue-800/50 px-4 py-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-blue-700">
              <p className="text-blue-200 text-sm">
                All featured properties are handpicked by our real estate experts.
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}