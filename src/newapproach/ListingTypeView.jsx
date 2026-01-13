import React, { useState, useEffect } from "react";
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
  Coffee
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";

const ListingTypeView = () => {
  const [selectedType, setSelectedType] = useState("sale");
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    sale: 0,
    rent: 0,
    lease: 0,
    pg: 0,
    total: 0
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      color: "green"
    },
    {
      id: "lease",
      title: "Properties on Lease",
      subtitle: "Long term agreements",
      description: "Commercial and residential properties for lease",
      icon: <Building className="w-5 h-5" />,
      color: "purple"
    },
    {
      id: "pg",
      title: "PG Buildings for Sale",
      subtitle: "Commercial PG properties",
      description: "Complete buildings suitable for Paying Guest business",
      icon: <Hotel className="w-5 h-5" />,
      color: "orange"
    }
  ];

  // Fetch property counts for each listing type
  const fetchPropertyStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all properties first
      const res = await propertyUnitAPI.getPropertyUnits({
        limit: 1000,
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      
      if (res.data && res.data.success) {
        const allUnits = res.data.data || [];
        setPropertyUnits(allUnits);
        
        // Calculate counts for each listing type
        const saleCount = allUnits.filter(unit => 
          unit.listingType === "sale"
        ).length;
        
        const rentCount = allUnits.filter(unit => 
          unit.listingType === "rent"
        ).length;
        
        const leaseCount = allUnits.filter(unit => 
          unit.listingType === "lease"
        ).length;
        
        const pgCount = allUnits.filter(unit => 
          unit.listingType === "pg"
        ).length;
        
        setStats({
          sale: saleCount,
          rent: rentCount,
          lease: leaseCount,
          pg: pgCount,
          total: allUnits.length
        });
        
        // Load initial properties for "sale" type
        filterPropertiesByType("sale", allUnits);
      }
    } catch (error) {
      console.error("Error fetching property stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter properties for selected type (client-side filtering)
  const filterPropertiesByType = (typeId, units = propertyUnits) => {
    setLoading(true);
    
    const filtered = units.filter(unit => 
      unit.listingType === typeId
    );
    
    setFilteredUnits(filtered);
    setLoading(false);
  };

  // Handle type selection
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    filterPropertiesByType(typeId);
  };

  useEffect(() => {
    fetchPropertyStats();
  }, []);

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex mb-4 animate-pulse">
            <div className="w-32 h-8 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-full"></div>
          </div>
          <div className="h-10 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-lg w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-lg w-1/2 mx-auto"></div>
        </div>

        {/* Type Selector Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 md:p-6 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-100 to-indigo-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-2/3"></div>
                  <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8 md:mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg p-3 md:p-4 shadow-sm animate-pulse">
              <div className="h-6 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Properties Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-40 md:h-48 bg-gradient-to-r from-blue-100 to-indigo-200"></div>
              <div className="p-3 md:p-4 space-y-3">
                <div className="h-4 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-3/4"></div>
                <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
                <div className="h-8 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && propertyUnits.length === 0) {
    return renderSkeleton();
  }

  return (
    <div className="bg-gradient-to-tl from-blue-50 via-white to-indigo-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Find Properties by <span className="text-blue-600">Listing Type</span>
          </h1>
          
          <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto mb-6">
            Browse properties based on how you want to acquire them. Choose from properties for sale, rent, lease, or PG buildings for sale.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 max-w-5xl mx-auto mb-8">
            {[
              { label: "Total Properties", value: stats.total, color: "gray" },
              { label: "For Sale", value: stats.sale, color: "blue" },
              { label: "For Rent", value: stats.rent, color: "green" },
              { label: "For Lease", value: stats.lease, color: "purple" },
              { label: "PG Buildings", value: stats.pg, color: "orange" }
            ].map((stat) => (
              <div 
                key={stat.label}
                className={`bg-white rounded-lg p-3 md:p-4 shadow-sm border-l-4 ${
                  stat.color === 'blue' ? 'border-blue-500' :
                  stat.color === 'green' ? 'border-green-500' :
                  stat.color === 'purple' ? 'border-purple-500' :
                  stat.color === 'orange' ? 'border-orange-500' :
                  'border-gray-500'
                }`}
              >
                <div className={`text-xl md:text-3xl font-bold ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  stat.color === 'orange' ? 'text-orange-600' :
                  'text-gray-600'
                }`}>
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listing Type Selector - 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {listingTypes.map((type) => {
            const isSelected = selectedType === type.id;
            const count = stats[type.id];
            
            return (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={`relative p-4 md:p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
                  isSelected
                    ? `border-${type.color}-500 bg-${type.color}-50 shadow-lg transform -translate-y-1`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 md:top-3 md:right-3 md:px-2 md:py-1 rounded-full text-xs font-semibold ${
                  isSelected
                    ? `bg-${type.color}-100 text-${type.color}-700`
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count} Properties
                </div>

                {/* Icon */}
                <div className={`mb-3 md:mb-4 p-2 md:p-3 rounded-full inline-block ${
                  isSelected
                    ? `bg-${type.color}-100 text-${type.color}-600`
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {React.cloneElement(type.icon, {
                    className: `w-5 h-5 md:w-6 md:h-6 ${isSelected ? '' : 'group-hover:scale-110 transition-transform'}`
                  })}
                </div>

                {/* Content */}
                <div>
                  <h3 className={`text-base md:text-xl font-bold mb-1 ${
                    isSelected ? `text-${type.color}-700` : 'text-gray-900'
                  }`}>
                    {type.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                    {type.subtitle}
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm">
                    {type.description}
                  </p>
                </div>

                {/* Arrow Indicator */}
                <div className={`mt-3 md:mt-4 flex items-center gap-1 text-xs md:text-sm font-medium ${
                  isSelected ? `text-${type.color}-600` : 'text-gray-500'
                }`}>
                  <span>View Properties</span>
                  <ChevronRight className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${
                    isSelected ? 'translate-x-1' : ''
                  }`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Type Details */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                  {
                    listingTypes.find(t => t.id === selectedType)?.title
                  }
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  {
                    listingTypes.find(t => t.id === selectedType)?.description
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium">
                  {stats[selectedType]} Properties Available
                </span>
              </div>
            </div>
          </div>

          {/* Features for selected type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            {selectedType === "sale" && [
              { icon: Home, text: "Ownership benefits", color: "blue" },
              { icon: TrendingUp, text: "Investment potential", color: "blue" },
              { icon: CheckCircle, text: "Permanent asset", color: "blue" }
            ].map((feature, index) => (
              <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="text-xs md:text-sm font-medium text-blue-700">{feature.text}</span>
              </div>
            ))}

            {selectedType === "rent" && [
              { icon: Key, text: "Flexible terms", color: "green" },
              { icon: Clock, text: "Short term options", color: "green" },
              { icon: Shield, text: "No maintenance worries", color: "green" }
            ].map((feature, index) => (
              <div key={index} className="bg-green-50 border border-green-100 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                <span className="text-xs md:text-sm font-medium text-green-700">{feature.text}</span>
              </div>
            ))}

            {selectedType === "lease" && [
              { icon: Building, text: "Commercial spaces", color: "purple" },
              { icon: Award, text: "Long term security", color: "purple" },
              { icon: Star, text: "Business stability", color: "purple" }
            ].map((feature, index) => (
              <div key={index} className="bg-purple-50 border border-purple-100 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                <span className="text-xs md:text-sm font-medium text-purple-700">{feature.text}</span>
              </div>
            ))}

            {selectedType === "pg" && [
              { icon: Hotel, text: "Ready for PG business", color: "orange" },
              { icon: Users, text: "Multiple room capacity", color: "orange" },
              { icon: Coffee, text: "Kitchen facilities", color: "orange" }
            ].map((feature, index) => (
              <div key={index} className="bg-orange-50 border border-orange-100 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                <span className="text-xs md:text-sm font-medium text-orange-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Properties Grid - REMOVED BADGES */}
        <div className="mb-8 md:mb-12">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-40 md:h-48 bg-gradient-to-r from-blue-100 to-indigo-200"></div>
                  <div className="p-3 md:p-4 space-y-3">
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUnits.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {filteredUnits.map((property) => (
                <div key={property._id}>
                  <PropertyUnitCard 
                    propertyUnit={property}
                    viewMode="compact"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Home className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base">
                No properties available for {selectedType === "sale" ? "sale" :
                selectedType === "rent" ? "rent" :
                selectedType === "lease" ? "lease" :
                "PG buildings"} at the moment.
              </p>
              <button
                onClick={() => handleTypeSelect("sale")}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                View Properties for Sale
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 text-white overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
              <div className="max-w-2xl">
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3">
                  Need Help Deciding?
                </h3>
                <p className="text-blue-100 mb-3 md:mb-4 text-sm md:text-base">
                  Our property experts can help you choose the right listing type based on your investment goals and requirements.
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 md:gap-3">
                  {["✓ Investment Analysis", "✓ Legal Guidance", "✓ Market Insights"].map((feature, index) => (
                    <div key={index} className="flex items-center gap-1 md:gap-2">
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button className="bg-white text-blue-700 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors whitespace-nowrap text-sm md:text-base mt-4 md:mt-0">
                Talk to an Expert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingTypeView;