import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Loader2,
  Home,
  Building,
  Calendar,
  DollarSign,
  ChevronRight,Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyUnitAPI } from '../api/propertyUnitAPI';
import { useNavigate } from 'react-router-dom';
import PropertyUnitCard from '../components/PropertyUnitCard';

// Format price helper
const formatPrice = (price) => {
  if (!price) return 'N/A';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(2)} K`;
  return `₹${price.toLocaleString()}`;
};

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  // Refs
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Popular searches
  const popularSearches = [
    'Apartments in Indiranagar',
    'Villas in Whitefield',
    'Commercial space Manyata',
    'Plots Devanahalli',
    'Under construction properties',
    'Ready to move apartments',
    'Properties under 1 crore'
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle search with debounce
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

  // Perform search API call
  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await propertyUnitAPI.getPropertyUnits({
        search: query,
        approvalStatus: 'approved',
        availability: 'available',
        limit: 10
      });

      if (response.data.success) {
        setResults(response.data.data || []);
        
        // Save to recent searches
        saveRecentSearch(query);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save search to recent
  const saveRecentSearch = (query) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  // Handle property click
  const handlePropertyClick = (propertyId) => {
    onClose();
    navigate(`/property-units/${propertyId}`);
  };

  // Handle view all results
  const handleViewAllResults = () => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
  {isOpen && (
  <div className="fixed inset-0 z-50 flex items-start justify-center">
    {/* Backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/60"
      onClick={handleBackdropClick}
    />
    
    {/* Modal - Opening from top */}
    <motion.div
      ref={modalRef}
      initial={{ opacity: 0, y: -100 }} // Start from top (-100px)
      animate={{ opacity: 1, y: 0 }}     // Animate to original position
      exit={{ opacity: 0, y: -100 }}      // Exit to top
      transition={{ 
        type: 'spring', 
        damping: 25,      // Slightly increased damping for smoother motion
        stiffness: 200,    // Added stiffness for quicker response
        mass: 1           // Keep mass at 1 for natural movement
      }}
      className="relative w-full max-w-2xl mt-16 mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by location, property name, or features..."
            className="w-full pl-12 pr-12 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Search Content */}
      <div className="max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-500">Searching properties...</p>
          </div>
        ) : searchQuery ? (
          /* Search Results */
          <div className="p-4">
            {results.length > 0 ? (
              <>
                <div className="space-y-2">
                  {results.map((property) => (
                    <button
                      key={property._id}
                      onClick={() => handlePropertyClick(property._id)}
                      className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-left group"
                    >
                      <PropertyUnitCard propertyUnit={property} viewMode="compact" />
                    </button>
                  ))}
                </div>

                {/* View All Results */}
      
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Try different keywords or check your spelling
                </p>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Suggestions */
          <div className="p-4 space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Recent Searches
                </h3>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(search)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 flex-1">{search}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
    

            {/* Search Tips */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Search Tips
              </h4>
              <ul className="space-y-2 text-xs text-blue-700">
                <li>• Try searching by location: "Indiranagar", "Whitefield"</li>
                <li>• Use property type: "Apartments", "Villas", "Commercial"</li>
                <li>• Add filters like "under 1 crore", "ready to move"</li>
                <li>• Search by project name or landmark</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
   
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  </div>
)}
    </AnimatePresence>
  );
};

// Main SearchBar Component
const SearchBar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Search Bar Trigger */}
<div className="relative w-full  mx-auto  py-2 ">
  <div className="relative">
    <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
    <button
      onClick={() => setIsModalOpen(true)}
      className="w-full pl-12 sm:pl-14 pr-6 py-4 sm:py-5 bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl 
                 text-base sm:text-lg text-gray-500 text-left 
                 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-lg 
                 focus:outline-none focus:ring-4 focus:ring-blue-500/20 
                 transition-all duration-300 cursor-pointer
                 shadow-md hover:shadow-xl"
    >
      <span className="block truncate pr-8">
        Search properties by location, name, or features...
      </span>
    </button>
    

  </div>
  
  {/* Optional: Popular search suggestions */}

</div>

      {/* Search Modal */}
      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default SearchBar;