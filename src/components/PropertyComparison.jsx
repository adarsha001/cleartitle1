import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Loader2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  TrendingUp,
  Clock,
  Home,
  Building,
  Ruler,
  DollarSign,
  Star,
  Shield,
  Calendar,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { propertyUnitAPI } from '../api/propertyUnitAPI';

// Format price helper
const formatPrice = (price) => {
  if (!price) return 'N/A';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`;
  return `₹${price.toLocaleString()}`;
};

// Get property image
const getPropertyImage = (property) => {
  if (property.images && property.images[0]?.url) {
    return property.images[0].url;
  }

};

// Get price display
const getPriceDisplay = (property) => {
  if (property.priceRange?.min && property.priceRange?.max) {
    if (property.priceRange.min === property.priceRange.max) {
      return formatPrice(property.priceRange.min);
    }
    return `${formatPrice(property.priceRange.min)} - ${formatPrice(property.priceRange.max)}`;
  }
  
  if (property.unitTypes && property.unitTypes.length > 0) {
    const prices = property.unitTypes.map(u => u.price?.amount || 0).filter(p => p > 0);
    if (prices.length > 0) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min === max) return formatPrice(min);
      return `${formatPrice(min)} - ${formatPrice(max)}`;
    }
  }
  return 'Price on request';
};

// Add Property Modal with duplicate prevention
const AddPropertyModal = ({ isOpen, onClose, onAddProperty, selectedProperties }) => {
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('compareRecentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await propertyUnitAPI.getPropertyUnits({
        search: query,
        approvalStatus: 'approved',
        availability: 'available',
        limit: 20
      });
      
      if (response.data?.success) {
        let properties = response.data.data || response.data.properties || [];
        
        // Remove duplicates based on _id
        const uniqueProperties = [];
        const seenIds = new Set();
        
        for (const property of properties) {
          if (property._id && !seenIds.has(property._id)) {
            seenIds.add(property._id);
            uniqueProperties.push(property);
          }
        }
        
        setResults(uniqueProperties);
        
        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('compareRecentSearches', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const isPropertySelected = (propertyId) => selectedProperties.some(p => p._id === propertyId);
  const isMaxSelected = selectedProperties.length >= 12;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={handleBackdropClick}
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl mt-16 mx-4 bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Add Property to Compare</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, property name..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="max-h-[20vh] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                  <p className="text-sm text-gray-500">Searching...</p>
                </div>
              ) : searchQuery ? (
                <div className="">
                  {results.length > 0 ? (
                    <div className="space-y-2">
                      {results.map((property) => {
                        const isSelected = isPropertySelected(property._id);
                        return (
                          <div
                            key={property._id}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                              isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <img src={getPropertyImage(property)} alt="" className="w-16 h-16 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm truncate">{property.title}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500 truncate">{property.city}</span>
                              </div>
                              <div className="text-sm font-semibold text-blue-600 mt-1">{getPriceDisplay(property)}</div>
                            </div>
                            <button
                              onClick={() => {
                                onAddProperty(property);
                                onClose();
                              }}
                              disabled={isSelected || isMaxSelected}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                isSelected
                                  ? 'bg-green-500 text-white cursor-default'
                                  : isMaxSelected
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isSelected ? 'Added' : 'Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center ">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                      <p className="text-sm text-gray-500">Try different keywords</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-6">
                  {recentSearches.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Searches</h3>
                      <div className="space-y-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(search)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left"
                          >
                            <Search className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 flex-1">{search}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Search Tips
                    </h4>
                    <ul className="space-y-1 text-xs text-blue-700">
                      <li>• Search by location: "Indiranagar", "Whitefield"</li>
                      <li>• Use property type: "Apartments", "Villas"</li>
                      <li>• Search by project name</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between">
              <span className="text-xs text-gray-500">{selectedProperties.length}/12 properties selected</span>
              <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-900 font-medium">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Main PropertyComparison Component - Auto Compare
const PropertyComparison = () => {
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load recently viewed and AUTO-ADD to comparison (only on initial load)
  useEffect(() => {
    if (isInitialLoad) {
      const stored = localStorage.getItem('recentlyViewedProperties');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Remove any duplicates from stored data
          const uniqueParsed = [];
          const seenIds = new Set();
          for (const item of parsed) {
            if (item._id && !seenIds.has(item._id)) {
              seenIds.add(item._id);
              uniqueParsed.push(item);
            }
          }
          setRecentlyViewed(uniqueParsed);
          
          // AUTO-ADD: Add unique recently viewed properties to comparison (up to 12)
          const autoAddProperties = uniqueParsed.slice(0, 12);
          const currentSelected = [];
          
          autoAddProperties.forEach(property => {
            if (!currentSelected.some(p => p._id === property._id) && currentSelected.length < 12) {
              currentSelected.push(property);
            }
          });
          
          if (currentSelected.length > 0) {
            setSelectedProperties(currentSelected);
          }
          setIsInitialLoad(false);
        } catch (error) {
          console.error('Error loading recently viewed:', error);
          setIsInitialLoad(false);
        }
      } else {
        setIsInitialLoad(false);
      }
    }
  }, [isInitialLoad]);

  // Save to recently viewed (without auto-adding to comparison)
  const addToRecentlyViewed = (property) => {
    const stored = localStorage.getItem('recentlyViewedProperties');
    let recent = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists (prevent duplicates)
    recent = recent.filter(p => p._id !== property._id);
    
    // Add to beginning with all details
    recent.unshift({
      _id: property._id,
      title: property.title,
      city: property.city,
      propertyType: property.propertyType,
      images: property.images,
      unitTypes: property.unitTypes,
      listingType: property.listingType,
      buildingName: property.buildingDetails?.name || property.buildingName || '',
      buildingDetails: property.buildingDetails,
      priceRange: property.priceRange,
      furnishing: property.furnishing || property.commonSpecifications?.furnishing,
      possessionStatus: property.possessionStatus || property.commonSpecifications?.possessionStatus,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 12
    recent = recent.slice(0, 12);
    
    localStorage.setItem('recentlyViewedProperties', JSON.stringify(recent));
    setRecentlyViewed(recent);
  };

  // Add to comparison (without auto-adding to recently viewed to prevent double addition)
  const addToComparison = (property) => {
    if (selectedProperties.length >= 12) {
      return;
    }
    if (selectedProperties.some(p => p._id === property._id)) {
      return;
    }
    setSelectedProperties(prev => [...prev, property]);
    // Only add to recently viewed, don't auto-add to comparison again
    addToRecentlyViewed(property);
    setIsAddModalOpen(false);
  };

  const removeFromComparison = (propertyId) => {
    setSelectedProperties(selectedProperties.filter(p => p._id !== propertyId));
  };

  const clearAll = () => {
    if (window.confirm('Clear all properties from comparison?')) {
      setSelectedProperties([]);
    }
  };

  const getImage = (property) => {
    if (property.images && property.images[0]?.url) {
      return property.images[0].url;
    }
 
  };

  const getBuildingName = (property) => {
    return property.buildingName || property.buildingDetails?.name || '';
  };

  const getArea = (property) => {
    if (property.unitTypes && property.unitTypes.length > 0) {
      const areas = property.unitTypes.map(u => u.carpetArea || u.builtUpArea || 0).filter(a => a > 0);
      if (areas.length > 0) {
        const min = Math.min(...areas);
        if (areas.length === 1) return `${min.toLocaleString()} sq.ft`;
        const max = Math.max(...areas);
        return `${min.toLocaleString()} - ${max.toLocaleString()} sq.ft`;
      }
    }
    return 'N/A';
  };

  const getConfigurations = (property) => {
    if (property.unitTypes && property.unitTypes.length > 0) {
      const types = property.unitTypes.map(u => u.type).slice(0, 3);
      return types.join(', ') + (property.unitTypes.length > 3 ? ` +${property.unitTypes.length - 3}` : '');
    }
    return property.propertyType || 'N/A';
  };

  const getFurnishing = (property) => {
    return property.furnishing || property.commonSpecifications?.furnishing?.replace('-', ' ') || 'N/A';
  };

  const getPossession = (property) => {
    return property.possessionStatus || property.commonSpecifications?.possessionStatus?.replace('-', ' ') || 'Ready to move';
  };

  // Scroll handlers for mobile horizontal scroll
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const newScrollLeft = Math.max(0, scrollContainerRef.current.scrollLeft - 320);
      scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const newScrollLeft = Math.min(maxScroll, scrollContainerRef.current.scrollLeft + 320);
      scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [selectedProperties.length]);

  return (
    <div className=" ">
      <div className="max-w-7xl mx-auto px-3 py-4">
        {/* Stats Banner */}
        {selectedProperties.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 mb-4 border border-blue-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Comparing {selectedProperties.length} property{selectedProperties.length !== 1 ? 'ies' : ''}
                </span>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Auto-synced from your recently viewed</span>
              </div>
              {isMobile && selectedProperties.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className={`p-1.5 rounded-full transition ${
                      canScrollLeft ? 'bg-white text-blue-600 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className={`p-1.5 rounded-full transition ${
                      canScrollRight ? 'bg-white text-blue-600 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Horizontal Scroll Comparison */}
        {selectedProperties.length > 0 && isMobile && (
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto  scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                {/* Property Columns */}
                {selectedProperties.map((property) => (
                  <div key={property._id} className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm overflow-hidden relative">
                    <button
                      onClick={() => removeFromComparison(property._id)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>

                    <div className="relative h-32">
                      <img src={getImage(property)} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded">
                        {property.propertyType?.split(' ')[0] || 'Property'}
                      </div>
                    </div>
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{property.title}</h3>
                      {getBuildingName(property) && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{getBuildingName(property)}</p>
                      )}
                    </div>

                    <div className="divide-y divide-gray-100">
                      <div className="p-3 bg-gray-50">
                        <p className="text-sm font-bold text-blue-600">{getPriceDisplay(property)}</p>
                        <span className="text-[10px] text-gray-500 capitalize">{property.listingType === 'sale' ? 'Sale' : 'Rent'}</span>
                      </div>
                      <div className="p-3"><p className="text-sm text-gray-700">{getArea(property)}</p></div>
                      <div className="p-3 bg-gray-50"><p className="text-sm text-gray-700">{getConfigurations(property)}</p></div>
                      <div className="p-3"><p className="text-sm text-gray-700 capitalize">{getFurnishing(property)}</p></div>
                      <div className="p-3 bg-gray-50"><p className="text-sm text-gray-700 capitalize">{getPossession(property)}</p></div>
                      <div className="p-3"><p className="text-sm text-gray-700">{property.city}</p></div>
                      <div className="p-3 bg-gray-50"><p className="text-sm text-gray-700">{getBuildingName(property) || '-'}</p></div>
                      <div className="p-3">
                        <Link to={`/property-units/${property._id}`} className="flex items-center justify-center gap-1 w-full py-2 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                          <Eye className="w-3 h-3" /> View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add More Card */}
                {selectedProperties.length < 12 && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 transition flex flex-col items-center justify-center min-h-[500px]"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">Add Property</p>
                    <p className="text-xs text-gray-400 mt-1">{12 - selectedProperties.length} slots left</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Grid View */}
        {selectedProperties.length > 0 && !isMobile && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {selectedProperties.map((property) => (
                <div key={property._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition border border-gray-100 relative group">
                  <button
                    onClick={() => removeFromComparison(property._id)}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>

                  <div className="relative h-40">
                    <img src={getImage(property)} alt={property.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                      {property.propertyType?.split(' ')[0] || 'Property'}
                    </div>
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{property.title}</h3>
                    {getBuildingName(property) && (
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                        <Building className="w-3 h-3" />
                        <span className="truncate">{getBuildingName(property)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{property.city}</span>
                    </div>
                    
                    <div className="mt-2">
                      <span className="text-sm font-bold text-blue-600">{getPriceDisplay(property)}</span>
                      <span className="text-xs text-gray-500 ml-1">{property.listingType === 'sale' ? 'Sale' : 'Rent'}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-gray-600">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded flex items-center gap-0.5">
                        <Ruler className="w-2.5 h-2.5" /> {getArea(property)}
                      </span>
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded">{getConfigurations(property)}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-gray-500">
                      <span className="capitalize">🏠 {getFurnishing(property)}</span>
                      <span>•</span>
                      <span className="capitalize">🔑 {getPossession(property)}</span>
                    </div>

                    <Link
                      to={`/property-units/${property._id}`}
                      className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </Link>
                  </div>
                </div>
              ))}

              {/* Add More Card */}
              {selectedProperties.length < 12 && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-200 hover:border-blue-400 transition flex flex-col items-center justify-center min-h-[380px]"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Add Property</p>
                  <p className="text-xs text-gray-400 mt-1">{12 - selectedProperties.length} slots left</p>
                </button>
              )}
            </div>

            {/* VS Badge for 2 properties */}
            {selectedProperties.length === 2 && (
              <div className="flex justify-center my-4">
                <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full shadow-md">
                  VS
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State - Show message that auto-compare is active */}
        {selectedProperties.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto ">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No properties to compare</h3>
            <p className="text-sm text-gray-500 mb-4">
              Properties you view will automatically appear here for comparison
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Browse Properties
            </button>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProperty={addToComparison}
        selectedProperties={selectedProperties}
      />

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
};

export default PropertyComparison;