import { useEffect, useState, useRef } from "react";
import { Search, SlidersHorizontal, Grid3x3, List, MapPin, Home, DollarSign, Maximize, Building, Sprout, Handshake, LandPlot, ChevronDown, X, Shield, CheckCircle, FileCheck, Award, Menu, FileText } from "lucide-react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const propertyListRef = useRef(null);

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    setShowMobileFilters(false);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Error Loading Properties</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md text-sm sm:text-base"
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
        {/* Animated Background - Simplified for Mobile */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Glowing Orbs - Smaller on Mobile */}
        <div className="absolute top-10 left-4 w-48 h-48 sm:w-96 sm:h-96 bg-blue-400 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-400 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Industrial SVG Illustration - Hidden on Mobile */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-5xl opacity-30 hidden lg:block">
          <svg viewBox="0 0 1000 500" className="w-full h-auto">
            {/* Factory illustrations remain the same */}
            {/* ... (keep the existing SVG code) ... */}
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="max-w-6xl mx-auto w-full">
            {/* Hero Text */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-4 py-2 sm:px-6 sm:py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/30">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white font-semibold text-xs sm:text-sm tracking-wider">100% VERIFIED PROPERTIES</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 text-white leading-tight tracking-tight">
                Clear Title,
                <span className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-400 bg-clip-text text-transparent mt-2">
                  Clear Future
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-100 font-light mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                Invest with Confidence in Completely Verified Properties
              </p>

              {/* Trust Badges - Responsive Grid */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-6 mb-8 sm:mb-12 px-4">
                <div className="px-3 py-2 sm:px-6 sm:py-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/30">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                    <div className="text-xl sm:text-3xl font-bold text-white">{properties.length}+</div>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100">Clear Title Properties</div>
                </div>
                
                <div className="px-3 py-2 sm:px-6 sm:py-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/30">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-300" />
                    <div className="text-xl sm:text-3xl font-bold text-white">100%</div>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100">Verification Rate</div>
                </div>
                
                <div className="px-3 py-2 sm:px-6 sm:py-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/30">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-red-300" />
                    <div className="text-xl sm:text-3xl font-bold text-white">{cities.length}+</div>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100">Prime Locations</div>
                </div>
                
                <div className="px-3 py-2 sm:px-6 sm:py-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/30">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <Award className="w-4 h-4 sm:w-6 sm:h-6 text-purple-300" />
                    <div className="text-xl sm:text-3xl font-bold text-white">Legal</div>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-100">Complete Documentation</div>
                </div>
              </div>

         {/* ClearTitle1 Features - Responsive Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto mb-8 sm:mb-12 px-4">

  {/* Clear Title Guarantee */}
  <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30">
    <FileCheck className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-yellow-300 mx-auto mb-2 sm:mb-3" />
    <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">Clear Title Guarantee</h3>
    <p className="text-blue-100 text-xs sm:text-sm">
      Every property comes with verified clear title documentation
    </p>
  </div>

  {/* Legal Verification */}
  <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30">
    <Shield className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-green-300 mx-auto mb-2 sm:mb-3" />
    <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">Legal Verification</h3>
    <p className="text-blue-100 text-xs sm:text-sm">
      Thorough legal checks and complete compliance assurance
    </p>
  </div>

  {/* Complete Transparency */}
  <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30">
    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 lg:h-10 lg:w-10 text-blue-300 mx-auto mb-2 sm:mb-3" />
    <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">Complete Transparency</h3>
    <p className="text-blue-100 text-xs sm:text-sm">
      No hidden clauses, full disclosure on every property
    </p>
  </div>

  {/* Paperwork & Documentation Services */}
  <div className="bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/30 lg:col-span-3">
    <FileText className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-300 mx-auto mb-2 sm:mb-3" />
    <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">Paperwork & Documentation</h3>
    <p className="text-blue-100 text-xs sm:text-sm text-center max-w-md mx-auto">
      Khata conversion, registration, legal paperwork, and complete documentation support.
    </p>
  </div>

</div>


            {/* Search Bar */}
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/50">
                <div className="relative mb-4 sm:mb-6">
                  <Search className="absolute left-3 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-6 sm:h-6" />
                  <input
                    type="text"
                    placeholder="Search by location, property type, or keyword..."
                    className="w-full pl-10 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all bg-white"
                    value={search}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchSubmit}
                  />
                </div>
                
                {/* Category Buttons - Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  <button 
                    onClick={() => handleCategorySelect("Commercial")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-semibold shadow-md text-xs sm:text-sm ${
                      categoryFilter === "Commercial" 
                        ? "bg-blue-600 text-white hover:bg-blue-700 scale-105" 
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200"
                    }`}
                  >
                    <Building className="w-3 h-3 sm:w-4 sm:h-5 inline mr-1 sm:mr-2" />
                    Commercial
                  </button>
                  
                  <button 
                    onClick={() => handleCategorySelect("Outright")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-semibold shadow-md text-xs sm:text-sm ${
                      categoryFilter === "Outright" 
                        ? "bg-blue-600 text-white hover:bg-blue-700 scale-105" 
                        : "bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200"
                    }`}
                  >
                    <LandPlot className="w-3 h-3 sm:w-4 sm:h-5 inline mr-1 sm:mr-2" />
                    Outright
                  </button>
                  
                  <button 
                    onClick={() => handleCategorySelect("Farmland")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-semibold shadow-md text-xs sm:text-sm ${
                      categoryFilter === "Farmland" 
                        ? "bg-blue-600 text-white hover:bg-blue-700 scale-105" 
                        : "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 hover:from-amber-100 hover:to-yellow-100 border-2 border-amber-200"
                    }`}
                  >
                    <Sprout className="w-3 h-3 sm:w-4 sm:h-5 inline mr-1 sm:mr-2" />
                    Farmland
                  </button>
                  
                  <button 
                    onClick={() => handleCategorySelect("JD/JV")}
                    className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all font-semibold shadow-md text-xs sm:text-sm ${
                      categoryFilter === "JD/JV" 
                        ? "bg-blue-600 text-white hover:bg-blue-700 scale-105" 
                        : "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200"
                    }`}
                  >
                    <Handshake className="w-3 h-3 sm:w-4 sm:h-5 inline mr-1 sm:mr-2" />
                    JD/JV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
            <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        </div>
      </div>

      {/* Property Listings Section */}
      <div ref={propertyListRef} className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-16">
        {/* Active Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Mobile Filter Button */}
            {isMobile && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors shadow-md font-semibold text-blue-900 text-sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Menu className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}

            {/* Desktop Filter Button */}
            {!isMobile && (
              <button
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-blue-300 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-colors shadow-md font-semibold text-blue-900 text-sm sm:text-base"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}

            {categoryFilter && (
              <div className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl shadow-lg border-2 border-blue-400">
                <span className="font-semibold text-sm sm:text-base">{categoryFilter}</span>
                <button
                  onClick={clearCategoryFilter}
                  className="ml-1 sm:ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors font-semibold border-2 border-red-200 text-sm sm:text-base"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                Clear All
              </button>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 items-center mt-3 sm:mt-0">
            <select
              className="border-2 border-blue-300 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-all shadow-md font-semibold text-gray-700 text-sm sm:text-base w-full sm:w-auto"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="displayOrder">Featured</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <div className="flex gap-1 sm:gap-2 bg-white rounded-lg sm:rounded-xl p-1 shadow-md border-2 border-blue-300">
              <button
                className={`p-2 sm:px-4 sm:py-2 rounded-md sm:rounded-lg transition-all font-semibold ${
                  viewMode === "grid" ? "bg-blue-600 text-white shadow-lg scale-105" : "text-gray-600 hover:bg-blue-50"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                className={`p-2 sm:px-4 sm:py-2 rounded-md sm:rounded-lg transition-all font-semibold ${
                  viewMode === "list" ? "bg-blue-600 text-white shadow-lg scale-105" : "text-gray-600 hover:bg-blue-50"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filters Overlay */}
        {isMobile && showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Property Type</label>
                  <select
                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  <label className="block text-sm font-bold text-gray-700 mb-3">City</label>
                  <select
                    className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filters Panel */}
        {!isMobile && showFilters && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Refine Your Search</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Property Type</label>
                <select
                  className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                <label className="block text-sm font-bold text-gray-700 mb-3">City</label>
                <select
                  className="w-full border-2 border-blue-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
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
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                Verified Premium Properties
              </h2>
              <p className="text-gray-700 font-medium flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                Showing {filtered.length} {filtered.length === 1 ? "property" : "properties"}
                {activeFiltersCount > 0 && " (filtered)"} with clear titles
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-white rounded-lg sm:rounded-xl border-2 border-green-300 shadow-md">
              <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="font-bold text-green-700 text-sm sm:text-base">100% Legal</span>
            </div>
          </div>
        </div>

        {/* Property Cards */}
        <div
          className={`grid gap-4 sm:gap-6 lg:gap-8 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
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
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Home className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No properties found</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-bold text-sm sm:text-base lg:text-lg"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}