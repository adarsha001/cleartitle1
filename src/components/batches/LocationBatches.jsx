import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { batchService } from '../../api/batchService';
import PropertyUnitCard from '../../components/PropertyUnitCard';

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

const LocationBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate(); // Add this hook

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
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const response = await batchService.getAllBatches({ isActive: true, limit: 6 });
        if (response.success) {
          const locationBatches = (response.data || []).filter(
            batch => batch.batchType === 'location_based'
          );
          setBatches(locationBatches);
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
        console.log(response);
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
    // Navigate to property unit detail page
    navigate(`/property-units/${unitId}`);
    // Close the modal when navigating
    setShowModal(false);
  };

  // Also handle the "View Details" button click
  const handleViewDetailsClick = (unitId) => {
    navigate(`/property-units/${unitId}`);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-light tracking-widest uppercase text-xs">Elevating Experiences</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-slate-900">
      {/* Hero Section */}
      <section className="py-8 md:py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
            <span className="text-blue-600">Explore</span>{" "}
            <span className="text-gray-800">by Location</span>
          </h1>

          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <div className="w-12 h-0.5 bg-gradient-to-l from-blue-600 to-transparent" />
          </div>

          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Browse our premium real estate projects across key strategic locations.
          </p>
        </div>
      </section>

      {/* Grid Section - Updated for Mobile X-Scroll */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative">
          <div className="flex overflow-x-auto pb-8 gap-4 md:gap-6 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:pb-0">
            {batches.map((batch) => (
              <div
                key={batch._id}
                className="group relative cursor-pointer overflow-hidden bg-slate-100 flex-shrink-0 w-[85vw] md:w-auto snap-center"
                onClick={() => handleBatchClick(batch)}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={batch.image?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                    alt={batch.locationName}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <p className="text-white/70 text-[10px] uppercase tracking-[0.2em] mb-2">Explore Location</p>
                  <h3 className="text-xl md:text-2xl font-serif text-white mb-2">{batch.locationName}</h3>
                  <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/20">
                    <span className="text-white/80 text-xs font-light tracking-wider">
                      {batch.stats?.totalProperties?.toLocaleString('en-IN') || 0} Listings
                    </span>
                    <span className="text-white text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                      Discover →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Scroll Indicator for Mobile */}
          {isMobile && batches.length > 1 && (
            <div className="flex justify-center mt-6 md:hidden">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"></div>
                <span className="text-xs text-slate-600 font-medium">Scroll for more locations</span>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Luxury Modal */}
      {showModal && selectedBatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 backdrop-blur-md bg-slate-900/60 transition-all duration-500">
          <div 
            className="bg-white w-full max-w-7xl h-full md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative h-48 md:h-64 flex-shrink-0">
              <img 
                src={selectedBatch.image?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200'} 
                className="w-full h-full object-cover"
                alt="Location Header"
              />
              <div className="absolute inset-0 bg-slate-900/40 flex flex-col justify-end p-6 md:p-12">
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:rotate-90 transition-transform duration-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-3xl md:text-5xl font-serif text-white">{selectedBatch.locationName}</h2>
                <p className="text-white/80 mt-2 font-light max-w-2xl italic text-sm md:text-base line-clamp-2 md:line-clamp-none">{selectedBatch.description}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-y-auto bg-slate-50 px-4 md:px-8 py-6 md:py-12">
              {unitsLoading ? (
                <div className="flex justify-center py-20">
                   <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                </div>
              ) : propertyUnits.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-serif italic text-slate-400 text-xl">New listings arriving soon.</p>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto">
                   <div className="flex justify-between items-end mb-4 md:mb-10 pb-3 md:pb-4 border-b border-slate-200">
                      <h4 className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-slate-900">Available Residences</h4>
                      <span className="text-slate-400 text-xs md:text-sm font-light">{propertyUnits.length.toLocaleString('en-IN')} Properties</span>
                   </div>
                   
                   {/* Mobile: Compact 2-column grid */}
                   <div className="grid grid-cols-2 gap-3 md:gap-6 lg:gap-8">
                    {propertyUnits.map((unit) => {
                      // Get price safely with fallback
                      const priceAmount = unit?.price?.amount || unit?.price || unit?.startingPrice || 0;
                      const areaValue = unit?.area || unit?.carpetArea || unit?.builtUpArea || 0;
                      const areaUnit = unit?.areaUnit || 'sq ft';
                      
                      return (
                        <div 
                          key={unit._id} 
                          className="hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
                          onClick={() => handleUnitClick(unit._id)} // Add click handler to the entire card
                        >
                          <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100">
                            {/* Compact Image */}
                            <div className="relative h-32 md:h-48 overflow-hidden">
                              <img 
                                src={unit.images?.[0]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'} 
                                alt={unit.title}
                                className="w-full h-full object-cover"
                              />
                              {unit.isFeatured && (
                                <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-1 rounded uppercase tracking-wider">
                                  Featured
                                </span>
                              )}
                            </div>
                            
                            {/* Compact Content */}
                            <div className="p-3 md:p-4">
                              <h3 className="font-medium text-sm md:text-base text-slate-900 mb-1 line-clamp-1">
                                {unit.title || unit.propertyName || 'Premium Residence'}
                              </h3>
                              
                              <div className="flex items-center text-slate-600 text-xs mb-2">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="line-clamp-1">{unit.location || selectedBatch.locationName}</span>
                              </div>
                              
                              <div className="flex justify-between items-center mb-2">
                                <div>
                                  <p className="text-xs text-slate-500">Starting from</p>
                                  <p className="font-bold text-slate-900 text-sm md:text-base">
                                    {formatIndianNumber(priceAmount)}
                                  </p>
                                  {unit.price && unit.price.currency === 'USD' && (
                                    <span className="text-[10px] text-slate-500">(Approx)</span>
                                  )}
                                </div>
                                {areaValue > 0 && (
                                  <div className="text-right">
                                    <p className="text-xs text-slate-500">Area</p>
                                    <p className="font-medium text-slate-900 text-sm">
                                      {formatArea(areaValue, areaUnit)}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Mobile: Simple button */}
                              <button 
                                className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs uppercase tracking-wider rounded transition-colors duration-300"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click event
                                  handleViewDetailsClick(unit._id);
                                }}
                              >
                                View Details
                              </button>
                              
                              {/* Additional info - hide on mobile */}
                              <div className="hidden md:flex justify-between mt-3 pt-3 border-t border-slate-100">
                                {unit.bedrooms !== undefined && (
                                  <div className="flex items-center text-xs text-slate-600">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    {unit.bedrooms} Beds
                                  </div>
                                )}
                                
                                {unit.bathrooms !== undefined && (
                                  <div className="flex items-center text-xs text-slate-600">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {unit.bathrooms} Baths
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Show More Indicator for Mobile */}
                  {isMobile && propertyUnits.length > 6 && (
                    <div className="mt-6 flex justify-center">
                      <div className="bg-white border border-slate-200 rounded-lg px-6 py-3 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                          </div>
                          <span className="text-sm text-slate-600 font-medium">
                            {(propertyUnits.length - 6).toLocaleString('en-IN')} more properties available
                          </span>
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>  
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-4 md:px-8 py-4 md:py-6 bg-white border-t border-slate-100 flex flex-col md:flex-row justify-between items-center">
               <code className="hidden md:block text-[10px] text-slate-400 uppercase tracking-widest">ID: {selectedBatch.batchCode}</code>
               <button 
                onClick={() => setShowModal(false)}
                className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors rounded-sm"
               >
                 Return to Gallery
               </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hide scrollbar for cleaner look */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
      `}} />
    </div>
  );
};

export default LocationBatches;