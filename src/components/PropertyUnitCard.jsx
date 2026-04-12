import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Building, Home, MapPin, Ruler, 
  Bed, Bath, Car, CheckCircle, DollarSign,
  Building2, Warehouse, Store, Factory, Hotel,
  Landmark, Trees, ChevronRight, ChevronDown, ChevronUp,
  Clock, Shield, FileText, Sparkles
} from "lucide-react";
import { gsap } from "gsap";

export default function PropertyUnitCard({ propertyUnit, viewMode }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showAllUnits, setShowAllUnits] = useState(false);
  
  const verifiedBadgeRef = useRef(null);
  const featuredBadgeRef = useRef(null);

  if (!propertyUnit || !propertyUnit._id) {
    console.warn("PropertyUnitCard: Invalid property unit data", propertyUnit);
    return null;
  }

  const {
    _id,
    title,
    city,
    propertyType,
    images,
    specifications,
    address,
    buildingDetails,
    isVerified,
    price,
    listingType,
    isFeatured,
    availability,
    approvalStatus,
    unitTypes,
    priceRange,
    availableUnitTypes,
    locationNearby,
    legalDetails,
    unitFeatures,
    viewCount,
    createdAt,
    updatedAt
  } = propertyUnit;

  // GSAP animations for badges
  useEffect(() => {
    if (isVerified && verifiedBadgeRef.current) {
      gsap.fromTo(verifiedBadgeRef.current, 
        { scale: 0, rotation: -10, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    }

    if (isFeatured && featuredBadgeRef.current) {
      gsap.fromTo(featuredBadgeRef.current,
        { scale: 0, opacity: 0, y: -10 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "back.out(1.7)" }
      );
    }
  }, [isVerified, isFeatured]);

  const safeSpecifications = specifications || {};
  const safeImages = images || [];
  const safeBuildingDetails = buildingDetails || {};
  const safeUnitTypes = unitTypes || [];
  const safeLocationNearby = locationNearby || [];
  const safeLegalDetails = legalDetails || {};
  const safeUnitFeatures = unitFeatures || [];

  // Format price function for individual unit
  const formatUnitPrice = (unit) => {
    if (!unit?.price?.amount) return "Price on request";
    
    const amount = unit.price.amount;
    const perUnit = unit.price.perUnit;
    const currency = unit.price.currency || '₹';
    
    const numberToWords = (num) => {
      const crore = 10000000;
      const lakh = 100000;
      const thousand = 1000;
      
      const formatDecimal = (value) => {
        const fixed = value.toFixed(2);
        return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
      };
      
      if (num >= crore) {
        const crores = num / crore;
        if (num % crore === 0) {
          return `${Math.floor(crores).toLocaleString('en-IN')} Cr`;
        }
        return `${formatDecimal(crores)} Cr`;
      }
      
      if (num >= lakh) {
        const lakhs = num / lakh;
        if (num % lakh === 0) {
          return `${Math.floor(lakhs).toLocaleString('en-IN')} L`;
        }
        return `${formatDecimal(lakhs)} L`;
      }
      
      if (num >= thousand) {
        const thousands = num / thousand;
        if (num % thousand === 0) {
          return `${Math.floor(thousands).toLocaleString('en-IN')} K`;
        }
        return `${formatDecimal(thousands)} K`;
      }
      
      return `${Math.floor(num).toLocaleString('en-IN')}`;
    };
    
    let formattedPrice = `${currency} ${numberToWords(amount)}`;
    
    if (perUnit && perUnit !== 'total') {
      if (perUnit === 'sqft') formattedPrice += '/sq.ft';
      else if (perUnit === 'sqm') formattedPrice += '/sq.m';
      else if (perUnit === 'month') formattedPrice += '/month';
      else if (perUnit === 'perSqYard') formattedPrice += '/sq.yd';
      else if (perUnit === 'perGround') formattedPrice += '/ground';
    }
    
    return formattedPrice;
  };

  // Format price range
  const formatPriceRange = () => {
    if (priceRange && priceRange.min && priceRange.max) {
      const minFormatted = formatUnitPrice({ price: { amount: priceRange.min, currency: 'INR', perUnit: 'total' } });
      const maxFormatted = formatUnitPrice({ price: { amount: priceRange.max, currency: 'INR', perUnit: 'total' } });
      
      if (priceRange.min === priceRange.max) {
        return minFormatted;
      }
      return `${minFormatted} - ${maxFormatted}`;
    }
    return "Price on request";
  };

  // Get availability badge color for unit type
  const getAvailabilityColor = (availabilityStatus) => {
    const colors = {
      available: "bg-green-100 text-green-800 border-green-300",
      sold: "bg-red-100 text-red-800 border-red-300",
      limited: "bg-orange-100 text-orange-800 border-orange-300",
      "coming-soon": "bg-blue-100 text-blue-800 border-blue-300",
      booked: "bg-yellow-100 text-yellow-800 border-yellow-300",
      reserved: "bg-purple-100 text-purple-800 border-purple-300"
    };
    return colors[availabilityStatus] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Get availability display text
  const getAvailabilityText = (availabilityStatus) => {
    const texts = {
      available: "Available",
      sold: "Sold Out",
      limited: "Limited Units",
      "coming-soon": "Coming Soon",
      booked: "Booked",
      reserved: "Reserved"
    };
    return texts[availabilityStatus] || availabilityStatus;
  };

  // Get property type icon
  const getPropertyTypeIcon = () => {
    const icons = {
      "Apartment": <Building className="w-3 h-3" />,
      "Villa": <Home className="w-3 h-3" />,
      "Independent House": <Home className="w-3 h-3" />,
      "Studio": <Building className="w-3 h-3" />,
      "Penthouse": <Building2 className="w-3 h-3" />,
      "Duplex": <Building2 className="w-3 h-3" />,
      "Pg house": <Building className="w-3 h-3" />,
      "Plot": <MapPin className="w-3 h-3" />,
      "Commercial Space": <Store className="w-3 h-3" />,
      "Office Space": <Building2 className="w-3 h-3" />,
      "Shop": <Store className="w-3 h-3" />,
      "Warehouse": <Warehouse className="w-3 h-3" />,
      "Industrial": <Factory className="w-3 h-3" />,
      "Hotel": <Hotel className="w-3 h-3" />
    };
    return icons[propertyType] || <Building className="w-3 h-3" />;
  };

  // Get listing type color
  const getListingTypeColor = () => {
    const colors = {
      sale: "bg-green-100 text-green-800 border-green-300",
      rent: "bg-blue-100 text-blue-800 border-blue-300",
      lease: "bg-purple-100 text-purple-800 border-purple-300",
      pg: "bg-orange-100 text-orange-800 border-orange-300"
    };
    return colors[listingType] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Get listing type text
  const getListingTypeText = () => {
    const texts = {
      sale: "For Sale",
      rent: "For Rent",
      lease: "For Lease",
      pg: "PG/Hostel"
    };
    return texts[listingType] || "For Sale";
  };

  // Get furnishing icon
  const getFurnishingIcon = (furnishing) => {
    const icons = {
      unfurnished: "🏚️",
      "semi-furnished": "🪑",
      "fully-furnished": "🛋️✨"
    };
    return icons[furnishing] || "🏠";
  };

  // Get possession status icon
  const getPossessionIcon = (status) => {
    const icons = {
      "ready-to-move": "🔑",
      "under-construction": "🏗️",
      resale: "🔄"
    };
    return icons[status] || "🏠";
  };

  // Get nearby amenities display
  const getNearbyAmenities = () => {
    const amenities = safeLocationNearby.slice(0, 3);
    return amenities.map(amenity => ({
      name: amenity.name,
      distance: amenity.distance,
      type: amenity.type
    }));
  };

  // Check if property has RERA approval
  const hasReraApproval = () => {
    return safeLegalDetails.reraRegistered && safeLegalDetails.reraNumber;
  };

  // Get plot area display
  const getPlotAreaDisplay = () => {
    if (propertyType !== 'Plot') return null;
    
    const plotUnit = safeUnitTypes.find(unit => unit.type === 'Plot');
    if (!plotUnit?.plotDetails?.area) return null;
    
    const area = plotUnit.plotDetails.area;
    const parts = [];
    if (area.sqft) parts.push(`${area.sqft.toLocaleString()} sq.ft`);
    if (area.sqYards) parts.push(`${area.sqYards.toLocaleString()} sq.yd`);
    if (area.grounds) parts.push(`${area.grounds} ground${area.grounds > 1 ? 's' : ''}`);
    if (area.acres) parts.push(`${area.acres} acre${area.acres > 1 ? 's' : ''}`);
    
    return parts.join(' • ');
  };

  // Compact View - Shows ALL unit types
  if (viewMode === "compact") {
    return (
      <Link to={`/property-units/${_id}`} className="block">
        <div className=" rounded-lg shadow-sm overflow-hidden  transition-shadow duration-200">
          <div className="relative h-36">
            <img
              src={safeImages[0]?.url || "https://via.placeholder.com/600x400"}
              alt={title || "Property unit image"}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

            <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between">
              {isVerified && (
                <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Verified
                </div>
              )}
              
              {isFeatured && (
                <div className="bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Featured
                </div>
              )}
            </div>

            <div className={`absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${getListingTypeColor()}`}>
              {getListingTypeText()}
            </div>
          </div>

          <div className="p-2.5">
            <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
              {title || "Untitled Property"}
            </h3>
            
            <div className="flex items-center gap-1 text-gray-600 mb-1.5">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium truncate">
                {city || "Location not specified"}
              </span>
            </div>

            {/* Show ALL unit types */}
            <div className="space-y-1.5 mb-2">
              {safeUnitTypes.slice(0, 2).map((unit, index) => (
                <div key={index} className="flex items-center justify-between pb-1 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-blue-600">{unit.type}</span>
                    {unit.carpetArea > 0 && (
                      <div className="flex items-center gap-0.5 text-gray-600">
                        <Ruler className="w-2.5 h-2.5" />
                        <span className="text-[10px]">{unit.carpetArea.toLocaleString()} sq.ft</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-xs font-bold text-gray-900">
                      {formatUnitPrice(unit)}
                    </div>
                    {unit.availability && unit.availability !== 'available' && (
                      <div className={`px-1 py-0.5 rounded text-[8px] font-medium border ${getAvailabilityColor(unit.availability)}`}>
                        {getAvailabilityText(unit.availability)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {safeUnitTypes.length > 2 && (
              <div className="text-[10px] text-blue-600 mt-1">
                +{safeUnitTypes.length - 2} more configuration{safeUnitTypes.length - 2 > 1 ? 's' : ''}
              </div>
            )}

            <div className="flex items-center justify-between mt-1 pt-1">
              <div className="text-[10px] text-gray-500">
                {safeUnitTypes.length} configuration{safeUnitTypes.length > 1 ? 's' : ''}
              </div>
              
              <div className="flex items-center gap-1 text-blue-600">
                <span className="text-[10px] font-medium">View Details</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // List View - Shows ALL unit types with detailed information
  if (viewMode === "list") {
    const displayUnits = showAllUnits ? safeUnitTypes : safeUnitTypes.slice(0, 3);
    const hasMoreUnits = safeUnitTypes.length > 3;

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden  hover:border-blue-600/30">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="w-full md:w-80 h-64 md:h-auto relative overflow-hidden">
            <img
              src={safeImages[0]?.url || "https://via.placeholder.com/600x400"}
              alt={title || "Property unit image"}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-yellow-300/10"></div>

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isVerified && (
                <div ref={verifiedBadgeRef} className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-full font-semibold shadow-lg border-2 border-white/20 backdrop-blur-sm text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </div>
              )}
              {isFeatured && (
                <div ref={featuredBadgeRef} className="flex items-center gap-1 bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-900 px-3 py-2 rounded-full text-sm font-semibold shadow-lg border-2 border-white/20">
                  <Sparkles className="w-4 h-4" />
                  Featured
                </div>
              )}
            </div>

            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium border bg-white/95 backdrop-blur-sm text-blue-600 border-blue-200">
              {getPropertyTypeIcon()}
              <span className="ml-1">{propertyType || "Property"}</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div>
              <h3 className="font-bold text-2xl text-gray-900 mb-2 line-clamp-2">
                {title || "Untitled Property"}
              </h3>
              
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">
                  {city || "Location not specified"}
                </span>
                {address && (
                  <span className="text-sm text-gray-500">• {address}</span>
                )}
              </div>

              {safeBuildingDetails.name && (
                <p className="text-gray-500 text-sm mb-4 pl-6">
                  <span className="font-medium">Building:</span> {safeBuildingDetails.name}
                  {safeBuildingDetails.totalFloors && ` • ${safeBuildingDetails.totalFloors} floors`}
                </p>
              )}

              {/* Unit Types Section - Show ALL */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Available Configurations ({safeUnitTypes.length})
                  </h4>
                  {hasMoreUnits && (
                    <button
                      onClick={() => setShowAllUnits(!showAllUnits)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showAllUnits ? (
                        <>Show Less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Show All ({safeUnitTypes.length}) <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {displayUnits.map((unit, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">{unit.type}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{unit.type}</div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                            {unit.carpetArea > 0 && (
                              <span>📏 Carpet: {unit.carpetArea.toLocaleString()} sq.ft</span>
                            )}
                            {unit.builtUpArea > 0 && (
                              <span>🏢 Built-up: {unit.builtUpArea.toLocaleString()} sq.ft</span>
                            )}
                            {unit.superBuiltUpArea > 0 && (
                              <span>📐 Super: {unit.superBuiltUpArea.toLocaleString()} sq.ft</span>
                            )}
                            {unit.floorNumber > 0 && (
                              <span>📍 Floor: {unit.floorNumber}</span>
                            )}
                            {unit.floors > 0 && (
                              <span>🏗️ Floors: {unit.floors}</span>
                            )}
                            {unit.totalUnits > 0 && (
                              <span>🏘️ Total: {unit.totalUnits} units</span>
                            )}
                            {unit.availableUnits > 0 && (
                              <span>✓ Available: {unit.availableUnits}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-blue-600">
                          {formatUnitPrice(unit)}
                        </div>
                        {unit.availability && (
                          <div className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium border inline-block ${getAvailabilityColor(unit.availability)}`}>
                            {getAvailabilityText(unit.availability)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Specifications */}
              <div className="flex flex-wrap gap-2 mb-4">
                {safeSpecifications.furnishing && (
                  <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                    {getFurnishingIcon(safeSpecifications.furnishing)} {safeSpecifications.furnishing.replace('-', ' ')}
                  </span>
                )}
                {safeSpecifications.possessionStatus && (
                  <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                    {getPossessionIcon(safeSpecifications.possessionStatus)} {safeSpecifications.possessionStatus.replace('-', ' ')}
                  </span>
                )}
                {safeSpecifications.kitchenType && safeSpecifications.kitchenType !== 'regular' && safeSpecifications.kitchenType !== 'none' && (
                  <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                    🍳 {safeSpecifications.kitchenType} kitchen
                  </span>
                )}
                {safeSpecifications.parking && (safeSpecifications.parking.covered > 0 || safeSpecifications.parking.open > 0) && (
                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                    🚗 {safeSpecifications.parking.covered > 0 && `${safeSpecifications.parking.covered} covered`}
                    {safeSpecifications.parking.covered > 0 && safeSpecifications.parking.open > 0 && ' + '}
                    {safeSpecifications.parking.open > 0 && `${safeSpecifications.parking.open} open`}
                  </span>
                )}
                {hasReraApproval() && (
                  <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-200">
                    <Shield className="w-3 h-3 inline mr-1" />
                    RERA Registered
                  </span>
                )}
              </div>

              {/* Nearby Amenities */}
              {getNearbyAmenities().length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Landmark className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-600">Nearby</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getNearbyAmenities().map((amenity, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {amenity.name} • {amenity.distance}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
{/* 
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div>
                <div className="text-sm text-gray-500">Price Range</div>
                <div className="font-bold text-2xl text-blue-600">
                  {formatPriceRange()}
                </div>
                {safeUnitTypes.length > 1 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {safeUnitTypes.length} configuration{safeUnitTypes.length > 1 ? 's' : ''} available
                  </div>
                )}
              </div>
              
              <Link to={`/property-units/${_id}`}>
                <button className="flex items-center gap-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg border border-blue-700 px-6 py-3 text-base">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  // Default Grid View - Shows ALL unit types with expand/collapse
  const displayUnits = showAllUnits ? safeUnitTypes : safeUnitTypes.slice(0, 2);
  const hasMoreUnits = safeUnitTypes.length > 2;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-600/30 group">
      <Link to={`/property-units/${_id}`}>
        <div className="relative h-56 overflow-hidden">
          <img
            src={safeImages[0]?.url || "https://via.placeholder.com/600x400"}
            alt={title || "Property unit image"}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 via-transparent to-yellow-300/20"></div>

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isVerified && (
              <div ref={verifiedBadgeRef} className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-full font-semibold shadow-lg border-2 border-white/20 backdrop-blur-sm text-xs">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified
              </div>
            )}
            {isFeatured && (
              <div ref={featuredBadgeRef} className="flex items-center gap-1 bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-900 px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-lg border-2 border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                Featured
              </div>
            )}
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm text-blue-600 px-3 py-1 rounded-full text-xs font-semibold shadow-lg border border-blue-200">
              {getPropertyTypeIcon()}
              <span className="ml-1">{propertyType || "Property"}</span>
            </div>
          </div>

          <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium border ${getListingTypeColor()}`}>
            {getListingTypeText()}
          </div>

          {/* View Count Badge */}
          {viewCount > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {viewCount} views
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <Link to={`/property-units/${_id}`}>
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] hover:text-blue-600 transition-colors">
            {title || "Untitled Property"}
          </h3>
          
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm line-clamp-1">
              {city || "Location not specified"}
            </span>
          </div>

          {address && (
            <p className="text-gray-500 text-xs mb-3 line-clamp-1 pl-6">{address}</p>
          )}

          {/* Plot Area Display */}
          {getPlotAreaDisplay() && (
            <div className="mb-3 text-xs text-gray-600 pl-6">
              📐 {getPlotAreaDisplay()}
            </div>
          )}
        </Link>

        {/* Unit Types Section - Show ALL with expand/collapse */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Configurations ({safeUnitTypes.length})
            </h4>
            {hasMoreUnits && (
              <button
                onClick={() => setShowAllUnits(!showAllUnits)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAllUnits ? (
                  <>Show Less <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Show All ({safeUnitTypes.length}) <ChevronDown className="w-3 h-3" /></>
                )}
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {displayUnits.map((unit, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{unit.type}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{unit.type}</div>
                    <div className="text-xs text-gray-500">
                      {unit.carpetArea > 0 && `${unit.carpetArea.toLocaleString()} sq.ft`}
                      {unit.availableUnits > 0 && unit.totalUnits > 0 && (
                        <span> • {unit.availableUnits}/{unit.totalUnits} avail</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-blue-600">
                    {formatUnitPrice(unit)}
                  </div>
                  {unit.availability && unit.availability !== 'available' && (
                    <div className={`text-xs ${unit.availability === 'sold' ? 'text-red-600' : 'text-orange-600'}`}>
                      {getAvailabilityText(unit.availability)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {safeUnitTypes.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No configurations available
            </div>
          )}
        </div>

        {/* Common Specifications */}
        <div className="flex flex-wrap gap-2 mb-4">
          {safeSpecifications.furnishing && safeSpecifications.furnishing !== 'unfurnished' && (
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
              {getFurnishingIcon(safeSpecifications.furnishing)} {safeSpecifications.furnishing.replace('-', ' ')}
            </span>
          )}
          {safeSpecifications.possessionStatus && safeSpecifications.possessionStatus !== 'ready-to-move' && (
            <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
              {getPossessionIcon(safeSpecifications.possessionStatus)} {safeSpecifications.possessionStatus.replace('-', ' ')}
            </span>
          )}
          {safeSpecifications.kitchenType && safeSpecifications.kitchenType !== 'regular' && safeSpecifications.kitchenType !== 'none' && (
            <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
              🍳 {safeSpecifications.kitchenType}
            </span>
          )}
          {(safeSpecifications.parking?.covered > 0 || safeSpecifications.parking?.open > 0) && (
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
              🚗 {safeSpecifications.parking.covered > 0 && `${safeSpecifications.parking.covered} covered`}
              {safeSpecifications.parking.covered > 0 && safeSpecifications.parking.open > 0 && ' + '}
              {safeSpecifications.parking.open > 0 && `${safeSpecifications.parking.open} open`}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">Price Range</div>
            <div className="font-bold text-lg text-blue-600">
              {formatPriceRange()}
            </div>
            {safeUnitTypes.length > 1 && (
              <div className="text-xs text-gray-500">
                {safeUnitTypes.length} configuration{safeUnitTypes.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <Link to={`/property-units/${_id}`}>
            <button className="flex items-center gap-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg border border-blue-700 px-4 py-2 text-sm font-medium">
              <span>View Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}