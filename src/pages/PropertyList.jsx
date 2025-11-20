import { useEffect, useState, useRef } from "react";
import { Search, SlidersHorizontal, Grid3x3, List, MapPin, Home, DollarSign, Maximize, Building, Sprout, Handshake, LandPlot, ChevronDown, X, Shield, CheckCircle, FileCheck, Award } from "lucide-react";
import { getProperties } from "../api/axios";
import PropertyCard from "../components/PropertyCard";
export default function PropertyList() {

  const [properties, setProperties] = useState([]);  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [areaRange, setAreaRange] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("displayOrder");
  
  const propertyListRef = useRef(null);
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await getProperties();
        setProperties(response.data.properties || []);
      } catch (err) {
        setError("Failed to fetch properties");
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (search && propertyListRef.current) {
      setTimeout(() => {
        const element = propertyListRef.current;
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - (window.innerHeight * 0.4);
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [search]);

  useEffect(() => {
    if (categoryFilter && propertyListRef.current) {
      setTimeout(() => {
        propertyListRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [categoryFilter]);

  const cities = [...new Set(properties.map((p) => p.city).filter(Boolean))];

  const filtered = properties
    .filter((p) => {
      const matchesSearch =
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.city?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase()) ||
        p.propertyLocation?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
      const matchesCity = cityFilter ? p.city === cityFilter : true;

      const matchesPriceRange = priceRange
        ? (() => {
            const price = p.price;
            if (price === "Price on Request") return priceRange === "on-request";
            const priceNum = typeof price === 'number' ? price : parseFloat(price) || 0;
            if (priceRange === "0-50") return priceNum <= 5000000;
            if (priceRange === "50-100") return priceNum > 5000000 && priceNum <= 10000000;
            if (priceRange === "100-200") return priceNum > 10000000 && priceNum <= 20000000;
            if (priceRange === "200+") return priceNum > 20000000;
            if (priceRange === "on-request") return price === "Price on Request";
            return true;
          })()
        : true;

      const matchesArea = areaRange
        ? (() => {
            const area = p.attributes?.square || 0;
            if (areaRange === "0-10") return area <= 10;
            if (areaRange === "10-50") return area > 10 && area <= 50;
            if (areaRange === "50-100") return area > 50 && area <= 100;
            if (areaRange === "100+") return area > 1000;
            return true;
          })()
        : true;

      return matchesSearch && matchesCategory && matchesCity && matchesPriceRange && matchesArea;
    })
    .sort((a, b) => {
      if (sort === "displayOrder") {
        const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sort === "price-low") {
        const priceA = a.price === "Price on Request" ? Infinity : (typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0);
        const priceB = b.price === "Price on Request" ? Infinity : (typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0);
        return priceA - priceB;
      }
      if (sort === "price-high") {
        const priceA = a.price === "Price on Request" ? -1 : (typeof a.price === 'number' ? a.price : parseFloat(a.price) || 0);
        const priceB = b.price === "Price on Request" ? -1 : (typeof b.price === 'number' ? b.price : parseFloat(b.price) || 0);
        return priceB - priceA;
      }
      if (sort === "name") return a.title?.localeCompare(b.title) || 0;
      if (sort === "area-low") return (a.attributes?.square || 0) - (b.attributes?.square || 0);
      if (sort === "area-high") return (b.attributes?.square || 0) - (a.attributes?.square || 0);
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  const clearFilters = () => {
    setSearch("");
    setSort("displayOrder");
    setCategoryFilter("");
    setCityFilter("");
    setPriceRange("");
    setAreaRange("");
  };

  const clearCategoryFilter = () => {
    setCategoryFilter("");
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleCategorySelect = (category) => {
    setCategoryFilter(categoryFilter === category ? "" : category);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && propertyListRef.current) {
      propertyListRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const activeFiltersCount = [categoryFilter, cityFilter, priceRange, areaRange].filter(Boolean).length;

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Commercial": return <Building className="w-4 h-4" />;
      case "Farmland": return <Sprout className="w-4 h-4" />;
      case "JD/JV": return <Handshake className="w-4 h-4" />;
      case "Outright": return <LandPlot className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Properties</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Modern Hero Section */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Industrial SVG Illustration */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-5xl opacity-30">
          <svg viewBox="0 0 1000 500" className="w-full h-auto">
            {/* Factory Building 1 */}
            <rect x="50" y="250" width="200" height="250" fill="url(#factoryGradient1)" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
            <polygon points="50,250 150,180 250,250" fill="url(#roofGradient)" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
            
            {/* Smokestack 1 */}
            <rect x="120" y="120" width="30" height="130" fill="url(#stackGradient)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
            <ellipse cx="135" cy="120" rx="20" ry="8" fill="rgba(255,255,255,0.3)"/>
            {/* Smoke */}
            <circle cx="135" cy="80" r="15" fill="rgba(255,255,255,0.2)" className="animate-pulse"/>
            <circle cx="145" cy="60" r="20" fill="rgba(255,255,255,0.15)" className="animate-pulse" style={{ animationDelay: '0.5s' }}/>
            <circle cx="125" cy="50" r="18" fill="rgba(255,255,255,0.1)" className="animate-pulse" style={{ animationDelay: '1s' }}/>
            
            {/* Windows Factory 1 */}
            {[...Array(8)].map((_, i) => (
              <g key={`f1-${i}`}>
                <rect x="70" y={280 + i * 25} width="40" height="20" fill="rgba(255,255,255,0.8)" className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}/>
                <rect x="130" y={280 + i * 25} width="40" height="20" fill="rgba(255,255,255,0.8)" className="animate-pulse" style={{ animationDelay: `${i * 0.2 + 0.1}s` }}/>
                <rect x="190" y={280 + i * 25} width="40" height="20" fill="rgba(255,255,255,0.8)" className="animate-pulse" style={{ animationDelay: `${i * 0.2 + 0.05}s` }}/>
              </g>
            ))}
            
            {/* Factory Building 2 */}
            <rect x="300" y="200" width="250" height="300" fill="url(#factoryGradient2)" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
            <polygon points="300,200 425,120 550,200" fill="url(#roofGradient2)" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
            
            {/* Smokestack 2 */}
            <rect x="400" y="60" width="35" height="140" fill="url(#stackGradient)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
            <ellipse cx="417.5" cy="60" rx="22" ry="10" fill="rgba(255,255,255,0.3)"/>
            {/* Smoke */}
            <circle cx="417.5" cy="20" r="18" fill="rgba(255,255,255,0.2)" className="animate-pulse" style={{ animationDelay: '0.3s' }}/>
            <circle cx="430" cy="5" r="22" fill="rgba(255,255,255,0.15)" className="animate-pulse" style={{ animationDelay: '0.8s' }}/>
            
            {/* Large Industrial Door */}
            <rect x="350" y="380" width="80" height="120" fill="rgba(255,255,255,0.6)" stroke="rgba(255,255,255,0.5)" strokeWidth="3"/>
            <line x1="390" y1="380" x2="390" y2="500" stroke="rgba(0,0,0,0.2)" strokeWidth="2"/>
            
            {/* Windows Factory 2 */}
            {[...Array(6)].map((_, i) => (
              <g key={`f2-${i}`}>
                <rect x="320" y={230 + i * 35} width="50" height="25" fill="rgba(255,255,255,0.8)" className="animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}/>
                <rect x="470" y={230 + i * 35} width="50" height="25" fill="rgba(255,255,255,0.8)" className="animate-pulse" style={{ animationDelay: `${i * 0.15 + 0.1}s` }}/>
              </g>
            ))}
            
            {/* Factory Building 3 (Smaller) */}
            <rect x="600" y="280" width="180" height="220" fill="url(#factoryGradient3)" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
            <rect x="625" y="240" width="50" height="40" fill="url(#stackGradient)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
            <ellipse cx="650" cy="240" rx="30" ry="10" fill="rgba(255,255,255,0.3)"/>
            
            {/* Conveyor Belt */}
            <rect x="800" y="450" width="150" height="15" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
            <circle cx="815" cy="457" r="10" fill="rgba(255,255,255,0.5)"/>
            <circle cx="935" cy="457" r="10" fill="rgba(255,255,255,0.5)"/>
            
            {/* Storage Tanks */}
            <ellipse cx="850" cy="350" rx="40" ry="50" fill="url(#tankGradient)" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
            <rect x="810" y="350" width="80" height="150" fill="url(#tankGradient)"/>
            <ellipse cx="850" cy="500" rx="40" ry="10" fill="rgba(255,255,255,0.2)"/>
            
            <defs>
              <linearGradient id="factoryGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(96,165,250,0.8)"/>
                <stop offset="100%" stopColor="rgba(59,130,246,0.9)"/>
              </linearGradient>
              <linearGradient id="factoryGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(99,102,241,0.8)"/>
                <stop offset="100%" stopColor="rgba(79,70,229,0.9)"/>
              </linearGradient>
              <linearGradient id="factoryGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(139,92,246,0.8)"/>
                <stop offset="100%" stopColor="rgba(124,58,237,0.9)"/>
              </linearGradient>
              <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(239,68,68,0.8)"/>
                <stop offset="100%" stopColor="rgba(220,38,38,0.9)"/>
              </linearGradient>
              <linearGradient id="roofGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(239,68,68,0.8)"/>
                <stop offset="100%" stopColor="rgba(220,38,38,0.9)"/>
              </linearGradient>
              <linearGradient id="stackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(156,163,175,0.9)"/>
                <stop offset="100%" stopColor="rgba(107,114,128,0.9)"/>
              </linearGradient>
              <linearGradient id="tankGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(209,213,219,0.8)"/>
                <stop offset="100%" stopColor="rgba(156,163,175,0.9)"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-6xl mx-auto w-full">
            {/* Hero Text */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-6 px-6 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/30">
                <Shield className="w-5 h-5 text-white" />
                <span className="text-white font-semibold text-sm tracking-wider">100% VERIFIED PROPERTIES</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight tracking-tight">
                Clear Title,
                <span className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                  Clear Future
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl md:text-3xl text-blue-100 font-light mb-8 max-w-3xl mx-auto">
                Invest with Confidence in Completely Verified Properties
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-6 h-6 text-yellow-300" />
                    <div className="text-3xl font-bold text-white">{properties.length}+</div>
                  </div>
                  <div className="text-sm text-blue-100">Clear Title Properties</div>
                </div>
                
                <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-300" />
                    <div className="text-3xl font-bold text-white">100%</div>
                  </div>
                  <div className="text-sm text-blue-100">Verification Rate</div>
                </div>
                
                <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-6 h-6 text-red-300" />
                    <div className="text-3xl font-bold text-white">{cities.length}+</div>
                  </div>
                  <div className="text-sm text-blue-100">Prime Locations</div>
                </div>
                
                <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-6 h-6 text-purple-300" />
                    <div className="text-3xl font-bold text-white">Legal</div>
                  </div>
                  <div className="text-sm text-blue-100">Complete Documentation</div>
                </div>
              </div>

              {/* ClearTitle1 Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <FileCheck className="w-10 h-10 text-yellow-300 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-lg mb-2">Clear Title Guarantee</h3>
                  <p className="text-blue-100 text-sm">Every property comes with verified clear title documentation</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <Shield className="w-10 h-10 text-green-300 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-lg mb-2">Legal Verification</h3>
                  <p className="text-blue-100 text-sm">Thorough legal checks and complete compliance assurance</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <CheckCircle className="w-10 h-10 text-blue-300 mx-auto mb-3" />
                  <h3 className="text-white font-bold text-lg mb-2">Complete Transparency</h3>
                  <p className="text-blue-100 text-sm">No hidden clauses, full disclosure on every property</p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50">
                <div className="relative mb-6">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    placeholder="Search by location, property type, or keyword..."
                    className="w-full pl-16 pr-6 py-5 text-lg border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all bg-white"
                    value={search}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchSubmit}
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => handleCategorySelect("Commercial")}
                    className={`px-4 py-3 rounded-xl transition-all font-semibold shadow-md ${
                      categoryFilter === "Commercial" 
                        ? "bg-blue-600 text-white hover:bg-blue-700 scale-105" 
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200"
                    }`}
                  >
                    <Building className="w-5 h-5 inline mr-2" />
                    Commercial
                  </button>
                  
                  <button 
                    onClick={() => handleCategorySelect("Outright")}
                    className={`px-4 py-3 rounded-xl transition-all font-semibold shadow-md ${
                      categoryFilter === "Outright" 
                        ? "bg-blue-600 text-white hover:bg-blue-700 scale-105" 
                        : "bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200"
                    }`}
                  >
                    <LandPlot className="w-5 h-5 inline mr-2" />
                    Outright
                  </button>
                  
                  <button 
                    onClick={() => handleCategorySelect("Farmland")}
                    className={`px-4 py-3 rounded-xl transition-all font-semibold shadow-md ${
                      categoryFilter === "Farmland" 
                        ? "bg-blue-600 text-white hover:bg-blue-700 scale-105" 
                        : "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 hover:from-amber-100 hover:to-yellow-100 border-2 border-amber-200"
                    }`}
                  >
                    <Sprout className="w-5 h-5 inline mr-2" />
                    Farmland
                  </button>
                  
                  <button 
                    onClick={() => handleCategorySelect("JD/JV")}
                    className={`px-4 py-3 rounded-xl transition-all font-semibold shadow-md ${
                      categoryFilter === "JD/JV" 
                        ? "bg-blue-600 text-white hover:bg-blue-700 scale-105" 
                        : "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200"
                    }`}
                  >
                    <Handshake className="w-5 h-5 inline mr-2" />
                    JD/JV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <ChevronDown className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Property Listings Section */}
      <div ref={propertyListRef} className="max-w-7xl mx-auto px-4 py-16">
        {/* Active Filters and Controls */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <button
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-300 rounded-xl hover:bg-blue-50 transition-colors shadow-md font-semibold text-blue-900"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2.5 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {categoryFilter && (
              <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg border-2 border-blue-400">
                <span className="font-semibold">{categoryFilter}</span>
                <button
                  onClick={clearCategoryFilter}
                  className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-5 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors font-semibold border-2 border-red-200"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <select
              className="border-2 border-blue-300 rounded-xl px-5 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all shadow-md font-semibold text-gray-700"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="displayOrder">Featured Order</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-md border-2 border-blue-300">
              <button
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  viewMode === "grid" ? "bg-blue-600 text-white shadow-lg scale-105" : "text-gray-600 hover:bg-blue-50"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  viewMode === "list" ? "bg-blue-600 text-white shadow-lg scale-105" : "text-gray-600 hover:bg-blue-50"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Refine Your Search</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Property Type
                </label>
                <select
                  className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all font-medium"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  {["Outright", "Commercial", "Farmland", "JD/JV"].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  City
                </label>
                <select
                  className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all font-medium"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Count with Trust Badge */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                Verified Premium Properties
              </h2>
              <p className="text-gray-700 font-medium flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Showing {filtered.length} {filtered.length === 1 ? "property" : "properties"}
                {activeFiltersCount > 0 && " (filtered)"} with clear titles
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-green-300 shadow-md">
              <FileCheck className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-700">100% Legal</span>
            </div>
          </div>
        </div>

        {/* Property Cards */}
        <div
          className={`grid gap-8 ${
            viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          }`}
        >
          {filtered.filter(property => property && property._id).map((property) => (
            <PropertyCard
              key={property._id || property.id} 
              property={property} 
              viewMode={viewMode}
            />
          ))}
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No properties found</h3>
            <p className="text-gray-600 mb-6 text-lg">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-bold text-lg"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}