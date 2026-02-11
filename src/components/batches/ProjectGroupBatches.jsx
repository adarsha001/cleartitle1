import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchService } from '../../api/batchService';
import PropertyUnitCard from '../../components/PropertyUnitCard';
import { 
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Building2,
  Star,
  X,
  Home,
  Award,
  Target,
  MapPin
} from 'lucide-react';

const formatIndianNumber = (price) => {
  if (!price) return "Price on request";
  
  try {
    let amount = 0;
    
    // Helper function to parse numeric value from various formats
    const parsePriceValue = (value) => {
      if (value === null || value === undefined) return 0;
      
      // If it's already a number
      if (typeof value === 'number') {
        return value;
      }
      
      // If it's a string
      if (typeof value === 'string') {
        // Check for special cases
        const lowerValue = value.toLowerCase().trim();
        if (lowerValue.includes('price on request') || 
            lowerValue.includes('contact for price') ||
            lowerValue.includes('negotiable') ||
            lowerValue.includes('on request')) {
          return 'special';
        }
        
        // Remove currency symbols, spaces, and commas
        let cleanValue = value
          .replace(/[₹$,€£\s]/g, '')  // Remove currency symbols
          .replace(/,/g, '');          // Remove commas
        
        // Parse as float
        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? 0 : parsed;
      }
      
      // If it's an object
      if (typeof value === 'object') {
        return parsePriceValue(value.amount || value.value || 0);
      }
      
      return 0;
    };
    
    // Parse the price
    const parsedValue = parsePriceValue(price);
    
    // Handle special cases
    if (parsedValue === 'special') {
      if (typeof price === 'string') {
        // Capitalize first letter of each word
        return price.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      }
      return "Price on request";
    }
    
    // Get the numeric amount
    amount = parsedValue;
    
    // Validate amount
    if (!amount || amount <= 0) return "Price on request";
    
    // Function to convert number to Indian price words
    const numberToWords = (num) => {
      const crore = 10000000;
      const lakh = 100000;
      const thousand = 1000;
      
      // Helper to format decimal places nicely
      const formatDecimal = (value) => {
        const fixed = value.toFixed(2);
        return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
      };
      
      // For crore range
      if (num >= crore) {
        const crores = num / crore;
        if (num % crore === 0) {
          return `${Math.floor(crores).toLocaleString('en-IN')} Crore${crores > 1 ? 's' : ''}`;
        }
        return `${formatDecimal(crores)} Crore`;
      }
      
      // For lakh range
      if (num >= lakh) {
        const lakhs = num / lakh;
        if (num % lakh === 0) {
          return `${Math.floor(lakhs).toLocaleString('en-IN')} Lakh${lakhs > 1 ? 's' : ''}`;
        }
        return `${formatDecimal(lakhs)} Lakh`;
      }
      
      // For thousand range
      if (num >= thousand) {
        const thousands = num / thousand;
        if (num % thousand === 0) {
          return `${Math.floor(thousands).toLocaleString('en-IN')} Thousand`;
        }
        return `${formatDecimal(thousands)} Thousand`;
      }
      
      // For amounts less than thousand
      return `${Math.floor(num).toLocaleString('en-IN')}`;
    };
    
    const priceInWords = numberToWords(amount);
    return `₹ ${priceInWords}`;
    
  } catch (err) {
    console.error("Error formatting price:", err);
    return "Price on request";
  }
};

// Format area with proper units
const formatArea = (area, unit) => {
  if (!area && area !== 0) return 'N/A';
  
  const areaNum = typeof area === 'string' ? parseFloat(area) : area;
  
  if (isNaN(areaNum)) return 'N/A';
  
  // Format based on size
  if (areaNum >= 10000000) {
    const croreSqFt = areaNum / 10000000;
    return `${croreSqFt.toFixed(1)} Cr ${unit || 'sq ft'}`;
  } else if (areaNum >= 100000) {
    const lakhSqFt = areaNum / 100000;
    return `${lakhSqFt.toFixed(1)} L ${unit || 'sq ft'}`;
  } else {
    return `${areaNum.toLocaleString('en-IN')} ${unit || 'sq ft'}`;
  }
};

const ProjectGroupBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current && isMobile) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [batches, isMobile]);

  const scrollLeft = () => {
    if (scrollContainerRef.current && isMobile) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && isMobile) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current && isMobile) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const response = await batchService.getAllBatches({ isActive: true, limit: 6 });
        if (response.success) {
          const projectBatches = (response.data || []).filter(
            batch => batch.batchType === 'project_group'
          );
          setBatches(projectBatches);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const fetchBatchPropertyUnits = async (batchId) => {
    try {
      setUnitsLoading(true);
      const response = await batchService.getBatch(batchId);
      if (response.success && response.data) {
        setPropertyUnits(response.data.propertyUnits || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
    setPropertyUnits([]);
    await fetchBatchPropertyUnits(batch._id);
  };

  // Add this function to handle unit card click
  const handleUnitClick = (unitId) => {
    navigate(`/property-units/${unitId}`);
    setShowModal(false);
  };

  // Also handle the "View Unit Details" button click
  const handleViewDetailsClick = (unitId) => {
    navigate(`/property-units/${unitId}`);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-48 h-4 rounded-full animate-pulse"></div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="h-12 md:h-16 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl w-3/4 mx-auto animate-pulse"></div>
              <div className="h-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl w-1/2 mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Mobile Skeleton Horizontal Scroll */}
          <div className="md:hidden relative">
            <div className="flex space-x-6 pb-8 overflow-x-auto scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="flex-shrink-0 w-[320px] bg-white rounded-3xl overflow-hidden animate-pulse border border-blue-100 shadow-lg"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="h-56 bg-gradient-to-r from-blue-200 to-blue-300"></div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gradient-to-r from-blue-300 to-blue-400 rounded w-3/4"></div>
                        <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-1/2"></div>
                      </div>
                      <div className="h-7 bg-gradient-to-r from-blue-300 to-blue-400 rounded-2xl w-14"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-full"></div>
                      <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Skeleton Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                className="bg-white rounded-3xl overflow-hidden animate-pulse border border-blue-100 shadow-lg"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="h-64 bg-gradient-to-r from-blue-200 to-blue-300"></div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-gradient-to-r from-blue-300 to-blue-400 rounded w-3/4"></div>
                      <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gradient-to-r from-blue-300 to-blue-400 rounded-2xl w-16"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const PropertyCard = ({ unit, index }) => (
    <div className="relative group h-full">
      {/* Featured Badge */}
      {unit.isFeatured && (
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-blue-500/20 uppercase tracking-wider">
            <Star className="w-3 h-3 fill-white" />
            <span>FEATURED</span>
          </span>
        </div>
      )}
      
      {/* Unit Type Badge */}
      {unit.unitType && (
        <div className="absolute top-4 right-4 z-20">
          <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-1.5 shadow-md">
            <span className="font-sans">{unit.unitType}</span>
          </span>
        </div>
      )}
      
      {/* Property Card Container */}
      <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 group-hover:border-blue-200 transition-all duration-500 group-hover:shadow-2xl shadow-lg h-full">
        {/* Premium border effect on hover */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-100 rounded-3xl transition-all duration-500 pointer-events-none"></div>
        
        {/* Property Card */}
        <div className="transform group-hover:-translate-y-1 transition-transform duration-500 h-full">
          <PropertyUnitCard 
            propertyUnit={unit}
            viewMode="compact"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className=" bg-white  md:py-16">
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center  md:mb-20">
          {/* Premium indicator - hidden on mobile */}
          {/* <div className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-2.5 rounded-full border border-blue-100 mb-8 shadow-sm">
            <Crown className="w-4 h-4 text-blue-700" />
            <span className="text-blue-800 text-sm font-medium tracking-widest uppercase font-sans">
              Premium Projects
            </span>
          </div> */}

          {/* Main title */}
          <div className="mb-6 hidden sm:block">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-serif tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800">
                Premium Project
              </span>
              <span className="text-gray-900 block md:inline md:ml-4">Collections</span>
            </h1>
            <p className="hidden sm:block text-gray-500 text-lg font-light max-w-2xl mx-auto">
              Explore our exclusive real estate developments and architectural masterpieces
            </p>
          </div>
          
          {/* Decorative separator */}
          <div className="hidden md:flex items-center justify-center gap-4 mb-8">
            <div className="w-16 md:w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            <Building2 className="w-6 h-6 text-blue-500" />
            <div className="w-16 md:w-32 h-0.5 bg-gradient-to-l from-transparent via-blue-300 to-transparent" />
          </div>

          {/* Mobile title */}
          {/* <h2 className="sm:hidden text-2xl font-bold text-gray-900 mb-4 font-sans">
            <span className="text-blue-700">Project Collections</span>
          </h2> */}
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {batches.map((batch) => (
            <div
              key={batch._id}
              className="group relative cursor-pointer overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all duration-500"
              onClick={() => handleBatchClick(batch)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={batch.image?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'}
                  alt={batch.projectName || batch.batchName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <p className="text-white/80 text-xs uppercase tracking-wider mb-2">Premium Project</p>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 font-serif">
                  {batch.projectName || batch.batchName}
                </h3>
                <p className="text-white/80 text-sm font-light mb-3 line-clamp-2">
                  {batch.tagline || batch.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <span className="text-white/80 text-sm font-light">
                    {batch.stats?.totalProperties?.toLocaleString('en-IN') || 0} Units
                  </span>
                  <span className="text-white text-sm font-medium tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                    View Project →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll Layout */}
        <div className="md:hidden relative">
          {/* Mobile Scroll Navigation Buttons */}
          <div className="relative mb-4">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-700 font-sans">
                  <span className="text-blue-600">Featured Projects</span>
                </h3>
                <p className="text-gray-500 text-sm">
                  {batches.length} projects available
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className={`p-2 rounded-full border ${
                    canScrollLeft 
                      ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  } transition-all duration-300`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className={`p-2 rounded-full border ${
                    canScrollRight 
                      ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  } transition-all duration-300`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Scroll Container */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex space-x-4 pb-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {batches.map((batch) => (
              <div 
                key={batch._id} 
                className="flex-shrink-0 w-[280px] snap-start"
              >
                <div
                  className="group relative cursor-pointer overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg"
                  onClick={() => handleBatchClick(batch)}
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={batch.image?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'}
                      alt={batch.projectName || batch.batchName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900 mb-1 font-sans">
                      {batch.projectName || batch.batchName}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">
                        {batch.stats?.totalProperties?.toLocaleString('en-IN') || 0} Units
                      </span>
                      <span className="text-blue-600 text-sm font-medium">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Luxury Modal */}
        {showModal && selectedBatch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 backdrop-blur-md bg-black/60 transition-all duration-500">
            <div 
              className="bg-white w-full max-w-7xl h-full md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative h-48 md:h-64 flex-shrink-0">
                <img 
                  src={selectedBatch.image?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'} 
                  className="w-full h-full object-cover"
                  alt="Project Header"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-12">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-300"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                  <h2 className="text-2xl md:text-4xl font-serif text-white font-bold">
                    {selectedBatch.projectName || selectedBatch.batchName}
                  </h2>
                  <p className="text-white/80 mt-2 font-light max-w-2xl text-sm md:text-base">
                    {selectedBatch.description}
                  </p>
                  {selectedBatch.developerName && (
                    <p className="text-white/90 mt-3 md:mt-4 text-sm md:text-base">
                      By <span className="font-semibold">{selectedBatch.developerName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-grow overflow-y-auto bg-white px-4 md:px-8 py-6 md:py-8">
                {unitsLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : propertyUnits.length === 0 ? (
                  <div className="text-center py-20">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="font-sans text-gray-600 text-xl">No units available in this project yet.</p>
                  </div>
                ) : (
                  <div className="max-w-6xl mx-auto">
                    {/* Project Status */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-10 pb-4 md:pb-6 border-b border-gray-200">
                      <div>
                        <h4 className="text-xs uppercase tracking-widest font-bold text-gray-900 mb-2">
                          Available Units
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {propertyUnits.length.toLocaleString('en-IN')} units available
                        </p>
                      </div>
                      {selectedBatch.projectStatus && (
                        <div className={`mt-2 md:mt-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                          selectedBatch.projectStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                          selectedBatch.projectStatus === 'under_construction' ? 'bg-indigo-100 text-indigo-800' :
                          selectedBatch.projectStatus === 'planned' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedBatch.projectStatus.replace('_', ' ').toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="hidden md:grid md:grid-cols-3 gap-8">
                      {propertyUnits.map((unit) => (
                        <PropertyCard key={unit._id} unit={unit} />
                      ))}
                    </div>

                    {/* Mobile Horizontal Scroll Layout */}
                    <div className="md:hidden relative">
                      {/* Mobile Scroll Container for Properties */}
                      <div 
                        className="flex space-x-4 pb-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {propertyUnits.map((unit, index) => (
                          <div 
                            key={unit._id} 
                            className="flex-shrink-0 w-[280px] snap-start"
                          >
                            <PropertyCard unit={unit} index={index} />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Show More Indicator for Mobile */}
                    {isMobile && propertyUnits.length > 6 && (
                      <div className="mt-6 flex justify-center">
                        <div className="bg-white border border-gray-200 rounded-lg px-6 py-3 shadow-sm">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                              <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                              <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                              {(propertyUnits.length - 6).toLocaleString('en-IN')} more units
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>  
                )}
              </div>
              
              {/* Modal Footer */}
              <div className="px-4 md:px-8 py-4 md:py-6 bg-white border-t border-gray-100 flex justify-center items-center">
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
                >
                  Return to Projects
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom scrollbar hide styles */}
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

export default ProjectGroupBatches;