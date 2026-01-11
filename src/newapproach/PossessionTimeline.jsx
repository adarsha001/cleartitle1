import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Home, 
  Building, 
  Building2,
  ChevronRight,
  MapPin,
  CheckCircle,
  CalendarDays,
  TrendingUp,
  Sparkles,
  Star,
  Shield,
  Award
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";

const PossessionTimeline = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("now");
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    now: 0,
    withinYear: 0,
    later: 0,
    total: 0
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Possession timeframes with descriptions
  const possessionTimeframes = [
    {
      id: "now",
      title: "Move-in Now",
      subtitle: "Ready to move properties",
      description: "Properties available for immediate possession",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "green",
      filters: { possessionStatus: "ready-to-move" }
    },
    {
      id: "withinYear",
      title: "Within 12 Months",
      subtitle: "Projects nearing completion",
      description: "Properties that will be ready within the next year",
      icon: <CalendarDays className="w-5 h-5" />,
      color: "blue",
      filters: { 
        possessionTimeline: "within-year",
        possessionStatus: { $nin: ["ready-to-move"] }
      }
    },
    {
      id: "later",
      title: "Later (1-3 Years)",
      subtitle: "Under construction projects",
      description: "New projects with future possession dates",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "purple",
      filters: { 
        possessionTimeline: "future",
        possessionStatus: "under-construction"
      }
    }
  ];

  // Fetch property counts for each timeframe
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
        
        // Calculate counts for each timeframe
        const nowCount = allUnits.filter(unit => 
          unit.possessionStatus === "ready-to-move"
        ).length;
        
        const withinYearCount = allUnits.filter(unit => 
          unit.possessionTimeline === "within-year" && 
          unit.possessionStatus !== "ready-to-move"
        ).length;
        
        const laterCount = allUnits.filter(unit => 
          unit.possessionTimeline === "future" ||
          unit.possessionStatus === "under-construction"
        ).length;
        
        setStats({
          now: nowCount,
          withinYear: withinYearCount,
          later: laterCount,
          total: allUnits.length
        });
        
        // Load initial properties for "now" timeframe
        fetchPropertiesForTimeframe("now");
      }
    } catch (error) {
      console.error("Error fetching property stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties for selected timeframe
  const fetchPropertiesForTimeframe = async (timeframeId) => {
    try {
      setLoading(true);
      
      const timeframe = possessionTimeframes.find(t => t.id === timeframeId);
      if (!timeframe) return;
      
      const res = await propertyUnitAPI.getPropertyUnits({
        ...timeframe.filters,
        limit: 12,
        sortBy: timeframeId === "now" ? "createdAt" : "price",
        sortOrder: "asc"
      });
      
      if (res.data && res.data.success) {
        setPropertyUnits(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle timeframe selection
  const handleTimeframeSelect = (timeframeId) => {
    setSelectedTimeframe(timeframeId);
    fetchPropertiesForTimeframe(timeframeId);
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

        {/* Timeframe Selector Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {[1, 2, 3].map((i) => (
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-3 md:p-4 shadow-sm animate-pulse">
              <div className="h-6 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Properties Grid Skeleton - Mobile: 2 columns, Desktop: 3 columns */}
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
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Find Your Perfect <span className="text-blue-600">Move-in Date</span>
          </h1>
          
          <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto mb-6">
            Browse properties based on when you want to move in. From ready-to-move homes to future projects.
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto mb-8">
            {[
              { label: "Total Properties", value: stats.total, color: "gray" },
              { label: "Ready Now", value: stats.now, color: "green" },
              { label: "Within Year", value: stats.withinYear, color: "blue" },
              { label: "Future Projects", value: stats.later, color: "purple" }
            ].map((stat) => (
              <div 
                key={stat.label}
                className={`bg-white rounded-lg p-3 md:p-4 shadow-sm border-l-4 ${
                  stat.color === 'green' ? 'border-green-500' :
                  stat.color === 'blue' ? 'border-blue-500' :
                  stat.color === 'purple' ? 'border-purple-500' :
                  'border-gray-500'
                }`}
              >
                <div className={`text-xl md:text-3xl font-bold ${
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
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

        {/* Possession Timeframe Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {possessionTimeframes.map((timeframe) => {
            const isSelected = selectedTimeframe === timeframe.id;
            const count = stats[timeframe.id];
            
            return (
              <button
                key={timeframe.id}
                onClick={() => handleTimeframeSelect(timeframe.id)}
                className={`relative p-4 md:p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
                  isSelected
                    ? `border-${timeframe.color}-500 bg-${timeframe.color}-50 shadow-lg transform -translate-y-1`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 md:top-3 md:right-3 md:px-2 md:py-1 rounded-full text-xs font-semibold ${
                  isSelected
                    ? `bg-${timeframe.color}-100 text-${timeframe.color}-700`
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count} Properties
                </div>

                {/* Icon */}
                <div className={`mb-3 md:mb-4 p-2 md:p-3 rounded-full inline-block ${
                  isSelected
                    ? `bg-${timeframe.color}-100 text-${timeframe.color}-600`
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {React.cloneElement(timeframe.icon, {
                    className: `w-5 h-5 md:w-6 md:h-6 ${isSelected ? '' : 'group-hover:scale-110 transition-transform'}`
                  })}
                </div>

                {/* Content */}
                <div>
                  <h3 className={`text-base md:text-xl font-bold mb-1 ${
                    isSelected ? `text-${timeframe.color}-700` : 'text-gray-900'
                  }`}>
                    {timeframe.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                    {timeframe.subtitle}
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm">
                    {timeframe.description}
                  </p>
                </div>

                {/* Arrow Indicator */}
                <div className={`mt-3 md:mt-4 flex items-center gap-1 text-xs md:text-sm font-medium ${
                  isSelected ? `text-${timeframe.color}-600` : 'text-gray-500'
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

        {/* Selected Timeframe Details */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                  {
                    possessionTimeframes.find(t => t.id === selectedTimeframe)?.title
                  } Properties
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  {
                    possessionTimeframes.find(t => t.id === selectedTimeframe)?.description
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium">
                  {stats[selectedTimeframe]} Properties Available
                </span>
              </div>
            </div>
          </div>

          {/* Features for selected timeframe */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            {selectedTimeframe === "now" && [
              { icon: CheckCircle, text: "No waiting period", color: "green" },
              { icon: Home, text: "Immediate occupancy", color: "green" },
              { icon: Shield, text: "No construction risks", color: "green" }
            ].map((feature, index) => (
              <div key={index} className="bg-green-50 border border-green-100 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                <span className="text-xs md:text-sm font-medium text-green-700">{feature.text}</span>
              </div>
            ))}

            {selectedTimeframe === "withinYear" && [
              { icon: CalendarDays, text: "Completion within 12 months", color: "blue" },
              { icon: Building, text: "Advance booking benefits", color: "blue" },
              { icon: TrendingUp, text: "Early bird pricing", color: "blue" }
            ].map((feature, index) => (
              <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="text-xs md:text-sm font-medium text-blue-700">{feature.text}</span>
              </div>
            ))}

            {selectedTimeframe === "later" && [
              { icon: Building2, text: "Modern architecture", color: "purple" },
              { icon: Award, text: "Future-ready amenities", color: "purple" },
              { icon: Sparkles, text: "Best price appreciation", color: "purple" }
            ].map((feature, index) => (
              <div key={index} className="bg-purple-50 border border-purple-100 rounded-lg p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                <span className="text-xs md:text-sm font-medium text-purple-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Properties Grid - Mobile: 2 columns, Desktop: 3 columns */}
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
          ) : propertyUnits.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
              {propertyUnits.map((property) => (
                <div key={property._id} className="relative">
                  {/* Possession Date Badge */}
                  {property.expectedPossession && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-1.5 py-0.5 md:px-2 md:py-1 rounded-full border border-gray-200 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span className="hidden xs:inline">
                          {selectedTimeframe === "now" ? "Available Now" :
                           property.expectedPossession}
                        </span>
                        <span className="xs:hidden">
                          {selectedTimeframe === "now" ? "Now" :
                           "Later"}
                        </span>
                      </span>
                    </div>
                  )}
                  
                  <PropertyUnitCard 
                    propertyUnit={property}
                    viewMode="compact"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Building2 className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
                No Properties Found
              </h3>
              <p className="text-gray-600 mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base">
                No properties available for {selectedTimeframe === "now" ? "immediate possession" :
                selectedTimeframe === "withinYear" ? "possession within 12 months" :
                "future possession"}.
              </p>
              <button
                onClick={() => handleTimeframeSelect("now")}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                View Ready Properties
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
                  Not Sure About Possession Timeline?
                </h3>
                <p className="text-blue-100 mb-3 md:mb-4 text-sm md:text-base">
                  Our property experts can help you find the perfect home based on your move-in requirements and preferences.
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 md:gap-3">
                  {["✓ Personalized Recommendations", "✓ Flexible Payment Plans", "✓ Construction Updates"].map((feature, index) => (
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
          
          {/* Decorative Elements */}
          <div className="absolute right-0 top-0 opacity-10">
            <Building className="w-32 h-32 md:w-64 md:h-64" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PossessionTimeline;