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
  const [selectedTimeframe, setSelectedTimeframe] = useState("ready-to-move");
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    "ready-to-move": 0,
    "under-construction": 0,
    "resale": 0,
    total: 0
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Possession status categories
  const possessionCategories = [
    {
      id: "ready-to-move",
      title: "Ready to Move",
      subtitle: "Immediate possession",
      description: "Properties available for immediate occupancy",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "green"
    },
    {
      id: "under-construction",
      title: "Under Construction",
      subtitle: "New projects",
      description: "Properties that are currently being built",
      icon: <Building className="w-5 h-5" />,
      color: "blue"
    },
    {
      id: "resale",
      title: "Resale Properties",
      subtitle: "Pre-owned homes",
      description: "Previously owned properties available for sale",
      icon: <Home className="w-5 h-5" />,
      color: "purple"
    }
  ];

  // Fetch property counts for each category
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
        
        // Calculate counts for each status
        const readyToMoveCount = allUnits.filter(unit => 
          unit.possessionStatus === "ready-to-move"
        ).length;
        
        const underConstructionCount = allUnits.filter(unit => 
          unit.possessionStatus === "under-construction"
        ).length;
        
        const resaleCount = allUnits.filter(unit => 
          unit.possessionStatus === "resale"
        ).length;
        
        setStats({
          "ready-to-move": readyToMoveCount,
          "under-construction": underConstructionCount,
          "resale": resaleCount,
          total: allUnits.length
        });
        
        // Load initial properties for "ready-to-move" category
        fetchPropertiesForCategory("ready-to-move");
      }
    } catch (error) {
      console.error("Error fetching property stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties for selected category
  const fetchPropertiesForCategory = async (categoryId) => {
    try {
      setLoading(true);
      
      const category = possessionCategories.find(c => c.id === categoryId);
      if (!category) return;
      
      const res = await propertyUnitAPI.getPropertyUnits({
        possessionStatus: categoryId,
        limit: 12,
        sortBy: categoryId === "ready-to-move" ? "createdAt" : "price",
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

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedTimeframe(categoryId);
    fetchPropertiesForCategory(categoryId);
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

        {/* Category Selector Skeleton */}
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
 <div className="bg-gradient-to-tr from-blue-50 via-white to-indigo-50 py-8 md:py-16">
  <div className="max-w-7xl mx-auto px-4">
    {/* Header */}
    <div className="text-center mb-6 md:mb-12">
      <h1 className="text-xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
        Find by <span className="text-blue-600">Possession Status</span>
      </h1>
      
      <p className="text-gray-600 text-sm md:text-lg max-w-3xl mx-auto mb-4 md:mb-6">
        Browse properties based on availability and construction status.
      </p>

      {/* Stats Bar - Compact on mobile */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 max-w-4xl mx-auto mb-6 md:mb-8">
        {[
          { label: "Total", value: stats.total, color: "gray" },
          { label: "Ready", value: stats["ready-to-move"], color: "green" },
          { label: "Under Const.", value: stats["under-construction"], color: "blue" },
          { label: "Resale", value: stats["resale"], color: "purple" }
        ].map((stat) => (
          <div 
            key={stat.label}
            className={`bg-white rounded-lg p-2 md:p-4 shadow-sm border-l-2 md:border-l-4 ${
              stat.color === 'green' ? 'border-green-500' :
              stat.color === 'blue' ? 'border-blue-500' :
              stat.color === 'purple' ? 'border-purple-500' :
              'border-gray-500'
            }`}
          >
            <div className={`text-base md:text-3xl font-bold ${
              stat.color === 'green' ? 'text-green-600' :
              stat.color === 'blue' ? 'text-blue-600' :
              stat.color === 'purple' ? 'text-purple-600' :
              'text-gray-600'
            }`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 font-medium mt-0.5 md:mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div> */}
    </div>

    {/* Possession Category Selector - Compact mobile view */}
    <div className="mb-6 md:mb-12">
      {/* Mobile: Horizontal scroll for compact view */}
      <div className="md:hidden flex space-x-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {possessionCategories.map((category) => {
          const isSelected = selectedTimeframe === category.id;
          const count = stats[category.id];
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`flex-shrink-0 w-40 p-3 rounded-xl border transition-all duration-300 text-left ${
                isSelected
                  ? `border-${category.color}-500 bg-${category.color}-50 shadow-lg`
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-1.5 rounded-full ${
                  isSelected
                    ? `bg-${category.color}-100 text-${category.color}-600`
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {React.cloneElement(category.icon, {
                    className: "w-4 h-4"
                  })}
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${
                    isSelected ? `text-${category.color}-700` : 'text-gray-900'
                  }`}>
                    {category.id === "ready-to-move" ? "Ready Now" : 
                     category.id === "under-construction" ? "Under Const." : "Resale"}
                  </h3>
                  {/* <p className="text-xs text-gray-500">
                    {count} properties
                  </p> */}
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {category.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Desktop: Grid view */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {possessionCategories.map((category) => {
          const isSelected = selectedTimeframe === category.id;
          const count = stats[category.id];
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`relative p-4 md:p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
                isSelected
                  ? `border-${category.color}-500 bg-${category.color}-50 shadow-lg transform -translate-y-1`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {/* Icon */}
              <div className={`mb-3 md:mb-4 p-2 md:p-3 rounded-full inline-block ${
                isSelected
                  ? `bg-${category.color}-100 text-${category.color}-600`
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {React.cloneElement(category.icon, {
                  className: `w-5 h-5 md:w-6 md:h-6 ${isSelected ? '' : 'group-hover:scale-110 transition-transform'}`
                })}
              </div>

              {/* Content */}
              <div>
                <h3 className={`text-base md:text-xl font-bold mb-1 ${
                  isSelected ? `text-${category.color}-700` : 'text-gray-900'
                }`}>
                  {category.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                  {category.subtitle}
                </p>
                <p className="text-gray-500 text-xs md:text-sm">
                  {category.description}
                </p>
              </div>

              {/* Arrow Indicator */}
              <div className={`mt-3 md:mt-4 flex items-center gap-1 text-xs md:text-sm font-medium ${
                isSelected ? `text-${category.color}-600` : 'text-gray-500'
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
    </div>

    {/* Features for selected category - Compact on mobile */}
    <div className="mb-4 md:mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
        {selectedTimeframe === "ready-to-move" && [
          { icon: CheckCircle, text: "No waiting", color: "green" },
          { icon: Home, text: "Move-in ready", color: "green" },
          { icon: Shield, text: "No risks", color: "green" }
        ].map((feature, index) => (
          <div key={index} className="bg-green-50 border border-green-100 rounded-lg p-2 md:p-4 flex items-center gap-2">
            <feature.icon className="w-3 h-3 md:w-5 md:h-5 text-green-600" />
            <span className="text-xs md:text-sm font-medium text-green-700">{feature.text}</span>
          </div>
        ))}

        {selectedTimeframe === "under-construction" && [
          { icon: Building, text: "New build", color: "blue" },
          { icon: CalendarDays, text: "Customizable", color: "blue" },
          { icon: TrendingUp, text: "Appreciation", color: "blue" }
        ].map((feature, index) => (
          <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-2 md:p-4 flex items-center gap-2">
            <feature.icon className="w-3 h-3 md:w-5 md:h-5 text-blue-600" />
            <span className="text-xs md:text-sm font-medium text-blue-700">{feature.text}</span>
          </div>
        ))}

        {selectedTimeframe === "resale" && [
          { icon: Home, text: "Established", color: "purple" },
          { icon: Star, text: "Proven quality", color: "purple" },
          { icon: Award, text: "Negotiable", color: "purple" }
        ].map((feature, index) => (
          <div key={index} className="bg-purple-50 border border-purple-100 rounded-lg p-2 md:p-4 flex items-center gap-2">
            <feature.icon className="w-3 h-3 md:w-5 md:h-5 text-purple-600" />
            <span className="text-xs md:text-sm font-medium text-purple-700">{feature.text}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Properties Grid */}
    <div className="mb-6 md:mb-12">
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg md:rounded-xl overflow-hidden shadow-sm animate-pulse">
              <div className="h-32 md:h-48 bg-gradient-to-r from-blue-100 to-indigo-200"></div>
              <div className="p-2 md:p-4 space-y-2 md:space-y-3">
                <div className="h-3 md:h-4 bg-gradient-to-r from-blue-200 to-indigo-300 rounded w-3/4"></div>
                <div className="h-2 md:h-3 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-1/2"></div>
                <div className="h-6 md:h-8 bg-gradient-to-r from-blue-100 to-indigo-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : propertyUnits.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {propertyUnits.map((property) => (
            <div key={property._id}>
              <PropertyUnitCard 
                propertyUnit={property}
                viewMode="compact"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 md:py-12 bg-white rounded-lg md:rounded-xl border border-dashed border-gray-300">
          <Building2 className="w-10 h-10 md:w-16 md:h-16 text-gray-400 mx-auto mb-2 md:mb-4" />
          <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
            No Properties Found
          </h3>
          <p className="text-gray-600 mb-3 md:mb-6 max-w-md mx-auto text-xs md:text-base">
            No {selectedTimeframe === "ready-to-move" ? "ready" :
            selectedTimeframe === "under-construction" ? "under construction" :
            "resale"} properties available.
          </p>
          <button
            onClick={() => handleCategorySelect("ready-to-move")}
            className="inline-flex items-center gap-1 md:gap-2 bg-blue-600 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs md:text-base"
          >
            View Ready Properties
            <ChevronRight className="w-2 h-2 md:w-4 md:h-4" />
          </button>
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default PossessionTimeline;