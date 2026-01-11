import React, { useEffect, useState } from "react";
import { 
  Clock,
  Calendar,
  Zap,
  Sparkles,
  Target,
  Award,
  ArrowRight
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";
import { useNavigate } from "react-router-dom";

export default function NewlyLaunchedProperties() {
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [timePeriod, setTimePeriod] = useState("14");
  const navigate = useNavigate();

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

  const handleRetry = () => {
    fetchNewlyLaunchedProperties();
  };

  const handleViewAll = () => {
    navigate('/properties');
  };

  const handleTimePeriodChange = (days) => {
    setTimePeriod(days);
  };

  const renderSkeleton = () => (
    <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4 animate-pulse">
            <div className="bg-gradient-to-r from-blue-200 to-cyan-300 w-32 h-8 rounded-full"></div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="h-8 md:h-10 bg-gradient-to-r from-blue-200 to-cyan-300 rounded-lg w-3/4 mx-auto"></div>
            <div className="h-6 bg-gradient-to-r from-blue-100 to-cyan-200 rounded-lg w-1/2 mx-auto"></div>
          </div>
          
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 animate-pulse">
            <div className="w-12 md:w-20 h-0.5 bg-gradient-to-r from-blue-200 to-transparent" />
            <div className="w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r from-blue-300 to-cyan-400 rounded-full" />
            <div className="w-12 md:w-20 h-0.5 bg-gradient-to-l from-blue-200 to-transparent" />
          </div>

          <div className="space-y-2 mb-4 max-w-2xl mx-auto">
            <div className="h-4 bg-gradient-to-r from-blue-100 to-cyan-200 rounded w-full"></div>
            <div className="h-4 bg-gradient-to-r from-blue-100 to-cyan-200 rounded w-5/6 mx-auto"></div>
            <div className="h-4 bg-gradient-to-r from-blue-100 to-cyan-200 rounded w-4/6 mx-auto"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="bg-gradient-to-r from-blue-100 to-cyan-200 w-32 h-10 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i}
              className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl overflow-hidden animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-40 md:h-48 bg-gradient-to-r from-blue-200 to-cyan-300"></div>
              <div className="p-3 md:p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 md:h-4 bg-gradient-to-r from-blue-200 to-cyan-300 rounded w-3/4"></div>
                    <div className="h-2.5 md:h-3 bg-gradient-to-r from-blue-100 to-cyan-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 md:h-6 bg-gradient-to-r from-blue-200 to-cyan-300 rounded-full w-8 md:w-12"></div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="h-2.5 md:h-3 bg-gradient-to-r from-blue-100 to-cyan-200 rounded w-full"></div>
                  <div className="h-2.5 md:h-3 bg-gradient-to-r from-blue-100 to-cyan-200 rounded w-5/6"></div>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-blue-100">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gradient-to-r from-blue-200 to-cyan-300 rounded-full"></div>
                      <div className="h-2 md:h-3 bg-gradient-to-r from-blue-100 to-cyan-200 rounded flex-1"></div>
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
      <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-red-600" />
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
      <div className="bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">No Newly Launched Properties</h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto mb-4">
            Currently, there are no newly launched properties in the last {timePeriod} days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh Properties
            </button>
            <button 
              onClick={handleViewAll}
              className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
            >
              View All Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-tr from-blue-50 via-white to-indigo-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            <span className="text-blue-600">Newly Launched</span>{" "}
            <span className="text-gray-800">Properties</span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="w-8 md:w-20 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            <Zap className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600 animate-pulse" />
            <div className="w-8 md:w-20 h-0.5 bg-gradient-to-l from-blue-600 to-transparent" />
          </div>

          <p className="text-gray-700 text-xs md:text-base max-w-2xl mx-auto leading-relaxed mb-3 md:mb-4">
            Discover the latest additions to our portfolio. Fresh opportunities with modern amenities.
          </p>

          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4 md:mb-6">
            {[
              { days: "7", label: "Last 7 Days" },
              { days: "14", label: "Last 14 Days" },
              { days: "30", label: "Last 30 Days" }
            ].map((period) => (
              <button
                key={period.days}
                onClick={() => handleTimePeriodChange(period.days)}
                className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full font-medium transition-all text-xs md:text-sm ${
                  timePeriod === period.days
                    ? "bg-blue-600 text-white shadow-sm hover:shadow"
                    : "bg-white text-gray-700 border border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{period.label}</span>
                <span className="sm:hidden">{period.days} Days</span>
              </button>
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-4 gap-2 md:gap-3 max-w-4xl mx-auto mb-6">
            {[
              { icon: Clock, text: "Freshly Added", color: "blue" },
              { icon: Target, text: "Modern Design", color: "cyan" },
              { icon: Award, text: "Latest Amenities", color: "indigo" },
              { icon: Calendar, text: "Ready Soon", color: "sky" }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-center gap-1.5 md:gap-2 ${
                  feature.color === 'blue' ? 'bg-blue-50 border-blue-100' :
                  feature.color === 'cyan' ? 'bg-cyan-50 border-cyan-100' :
                  feature.color === 'indigo' ? 'bg-indigo-50 border-indigo-100' :
                  'bg-sky-50 border-sky-100'
                } px-3 py-2 rounded-lg border text-center hover:shadow-sm transition-shadow duration-300`}
              >
                <feature.icon className={`w-4 h-4 ${
                  feature.color === 'blue' ? 'text-blue-600' :
                  feature.color === 'cyan' ? 'text-cyan-600' :
                  feature.color === 'indigo' ? 'text-indigo-600' :
                  'text-sky-600'
                }`} />
                <span className={`text-xs font-medium ${
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
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {propertyUnits.map((unit, index) => (
            <div key={unit._id || index} className="relative group">
              {index < 3 && (
                <div className="absolute top-1.5 left-1.5 z-10">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full flex items-center gap-0.5 md:gap-1 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span className="hidden xs:inline">NEW</span>
                  </span>
                </div>
              )}
              
              <div className="absolute top-1.5 right-1.5 z-10">
                <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] md:text-xs font-medium px-1.5 py-0.5 md:px-2 md:py-1 rounded-full border border-blue-200 flex items-center gap-0.5 md:gap-1 shadow-sm">
                  <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-600" />
                  <span className="hidden xs:inline">
                    {(() => {
                      const unitDate = new Date(unit.createdAt || unit.updatedAt);
                      const today = new Date();
                      const diffTime = Math.abs(today - unitDate);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 1 ? "Today" : `${diffDays}d ago`;
                    })()}
                  </span>
                  <span className="xs:hidden">
                    {(() => {
                      const unitDate = new Date(unit.createdAt || unit.updatedAt);
                      const today = new Date();
                      const diffTime = Math.abs(today - unitDate);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 1 ? "Today" : `${diffDays}d`;
                    })()}
                  </span>
                </span>
              </div>
              
              <div className="group-hover:shadow-md transition-all duration-300">
                <PropertyUnitCard 
                  propertyUnit={unit} 
                  viewMode="compact"
                />
              </div>
            </div>
          ))}
        </div>

        {propertyUnits.length > 6 && (
          <div className="mt-6 text-center md:hidden">
            <button
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
            >
              View All Properties
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}