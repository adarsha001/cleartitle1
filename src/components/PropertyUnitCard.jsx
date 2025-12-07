import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLikes } from "../context/LikesContext";
import { toast } from "react-hot-toast";
import { 
  Building, Home, MapPin, ExternalLink, Ruler, 
  Bed, Bath, Car, Layers, CheckCircle, Shield,
  Building2, Warehouse, Store, Factory, Hotel,
  Landmark, Trees, Mountain, Waves
} from "lucide-react";
import { gsap } from "gsap";

export default function PropertyUnitCard({ propertyUnit, viewMode }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    toggleLike, 
    isPropertyLiked, 
    loading: likesLoading,
    error 
  } = useLikes();

  const [showLoginTooltip, setShowLoginTooltip] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Refs for GSAP animations
  const verifiedBadgeRef = useRef(null);
  const featuredBadgeRef = useRef(null);

  // Add comprehensive null checks for the propertyUnit object
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
    mapUrl,
    isVerified,
    price,
    listingType,
    isFeatured,
    availability,
    approvalStatus,
    createdBy,
    parentProperty
  } = propertyUnit;

  // GSAP animations for badges
  useEffect(() => {
    if (isVerified && verifiedBadgeRef.current) {
      gsap.fromTo(verifiedBadgeRef.current, 
        { 
          scale: 0,
          rotation: -10,
          opacity: 0
        },
        { 
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(1.7)"
        }
      );
      
      // Continuous subtle pulse animation
      gsap.to(verifiedBadgeRef.current, {
        scale: 1.05,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }

    if (isFeatured && featuredBadgeRef.current) {
      gsap.fromTo(featuredBadgeRef.current,
        { 
          scale: 0,
          opacity: 0,
          y: -10
        },
        { 
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.2,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [isVerified, isFeatured]);

  // Add null checks for nested properties
  const safeSpecifications = specifications || {};
  const safeImages = images || [];
  const safeBuildingDetails = buildingDetails || {};




  // Check if property unit is liked using global state
  const isLiked = _id ? isPropertyLiked(_id) : false;

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      setShowLoginTooltip(true);
      setTimeout(() => setShowLoginTooltip(false), 3000);
      toast.error("Please login to save properties to your favorites");
      return;
    }

    if (!_id) {
      toast.error("Invalid property data");
      return;
    }

    const success = await toggleLike(_id);
    
    if (success) {
      if (isLiked) {
        toast.success("Removed from favorites");
      } else {
        toast.success("Added to favorites");
      }
    } else if (error) {
      toast.error(error);
    }
  };

  const handleLikeHover = () => {
    if (!user) {
      setShowLoginTooltip(true);
    }
  };

  const handleLikeLeave = () => {
    setShowLoginTooltip(false);
  };

  // Get property type icon
  const getPropertyTypeIcon = () => {
    switch (propertyType) {
      case "Apartment":
        return <Building className="w-4 h-4" />;
      case "Villa":
        return <Home className="w-4 h-4" />;
      case "Commercial Space":
        return <Building2 className="w-4 h-4" />;
      case "Office Space":
        return <Landmark className="w-4 h-4" />;
      case "Shop":
        return <Store className="w-4 h-4" />;
      case "Warehouse":
        return <Warehouse className="w-4 h-4" />;
      case "Industrial":
        return <Factory className="w-4 h-4" />;
      case "Hotel":
        return <Hotel className="w-4 h-4" />;
      case "Farmhouse":
        return <Trees className="w-4 h-4" />;
      case "Plot":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  // Get listing type color
  const getListingTypeColor = () => {
    switch (listingType) {
      case "Sale":
        return "bg-green-100 text-green-800 border-green-300";
      case "Rent":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Lease":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get availability color
  const getAvailabilityColor = () => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800 border-green-300";
      case "sold":
        return "bg-red-100 text-red-800 border-red-300";
      case "rented":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "under-negotiation":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get approval status color
  const getApprovalColor = () => {
    switch (approvalStatus) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Handle card click
  const handleCardClick = () => {
    if (_id) {
      navigate(`/property-unit/${_id}`);
    } else {
      toast.error("Invalid property data");
    }
  };

  // Verified Badge Component
  const VerifiedBadge = ({ size = "default" }) => (
    <div
      ref={verifiedBadgeRef}
      className={`
        flex items-center gap-1.5 
        bg-gradient-to-r from-blue-600 to-blue-700
        text-white px-3 py-2 rounded-full 
        font-semibold shadow-lg border-2 border-white/20
        backdrop-blur-sm
        ${size === "large" ? "text-sm px-4 py-2.5" : "text-xs px-3 py-2"}
      `}
    >
      <CheckCircle className={size === "large" ? "w-4 h-4" : "w-3.5 h-3.5"} />
      Verified
    </div>
  );

  // List View Layout
  if (viewMode === "list") {
    return (
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-600/30"
      >
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-80 h-64 md:h-auto overflow-hidden">
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
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-yellow-300/10"></div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isVerified && <VerifiedBadge size="large" />}
              {isFeatured && (
                <div 
                  ref={featuredBadgeRef}
                  className="flex items-center gap-1 bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-900 px-3 py-2 rounded-full text-xs font-semibold shadow-lg border-2 border-white/20"
                >
                  ★ Featured
                </div>
              )}
              <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm text-blue-600 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-blue-200">
                {getPropertyTypeIcon()}
                {propertyType || "Property"}
              </div>
            </div>

            {/* Approval Status (Admin view) */}
            {user?.userType === 'admin' && (
              <div className={`absolute top-4 right-20 px-3 py-1 rounded-full text-xs font-semibold border ${getApprovalColor()}`}>
                {approvalStatus || "pending"}
              </div>
            )}

            {/* Like Button */}
            <button
              onClick={handleLikeToggle}
              onMouseEnter={handleLikeHover}
              onMouseLeave={handleLikeLeave}
              disabled={likesLoading && user}
              className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm z-10 border border-blue-200 ${
                user 
                  ? (isLiked 
                      ? "bg-blue-600 text-white scale-110" 
                      : "bg-white/90 text-blue-600 hover:bg-yellow-300 hover:scale-110 hover:border-yellow-400")
                  : "bg-white/90 text-blue-600 hover:bg-yellow-300 hover:scale-110 hover:border-yellow-400"
              } ${(likesLoading && user) ? "opacity-50 cursor-not-allowed" : ""}`}
              title={user 
                ? (isLiked ? "Remove from favorites" : "Add to favorites") 
                : "Login to save properties"
              }
            >
              <svg
                className="w-5 h-5"
                fill={user && isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>

            {/* Login Tooltip */}
            {!user && showLoginTooltip && (
              <div className="absolute top-16 right-4 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 shadow-xl">
                Login to save properties
                <div className="absolute -top-1 right-4 w-3 h-3 bg-blue-600 transform rotate-45"></div>
              </div>
            )}

            {/* Status Badges */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getListingTypeColor()}`}>
                For {listingType || "Sale"}
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getAvailabilityColor()}`}>
                {availability || "available"}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {title || "Untitled Property"}
              </h3>
              
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{city || "Location not specified"}</span>
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

              {/* Property Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                {/* Bedrooms */}
                {safeSpecifications.bedrooms > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Bed className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-semibold">{safeSpecifications.bedrooms}</span>
                      <span className="text-sm text-gray-500 ml-1">Beds</span>
                    </div>
                  </div>
                )}

                {/* Bathrooms */}
                {safeSpecifications.bathrooms > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Bath className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-semibold">{safeSpecifications.bathrooms}</span>
                      <span className="text-sm text-gray-500 ml-1">Baths</span>
                    </div>
                  </div>
                )}

                {/* Parking */}
                {safeSpecifications.parkingSpaces > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Car className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-semibold">{safeSpecifications.parkingSpaces}</span>
                      <span className="text-sm text-gray-500 ml-1">Parking</span>
                    </div>
                  </div>
                )}

                {/* Carpet Area */}
                {safeSpecifications.carpetArea > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Ruler className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="font-semibold">{safeSpecifications.carpetArea.toLocaleString()}</span>
                      <span className="text-sm text-gray-500 ml-1">sq.ft.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Specifications */}
              <div className="flex flex-wrap gap-2 mb-4">
                {safeSpecifications.furnishing && (
                  <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                    {safeSpecifications.furnishing}
                  </span>
                )}
                {safeSpecifications.possessionStatus && (
                  <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                    {safeSpecifications.possessionStatus}
                  </span>
                )}
                {safeSpecifications.kitchenType && (
                  <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                    {safeSpecifications.kitchenType}
                  </span>
                )}
              </div>

              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline mb-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Map
                </a>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div>
                <div className={`text-3xl font-bold `}>
                  {price}
                </div>
                {listingType === 'Rent' || listingType === 'Lease' ? (
                  <div className="text-xs text-gray-500 mt-1">per month</div>
                ) : safeSpecifications.carpetArea > 0 && typeof price === 'number' && price > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    ₹{(price / safeSpecifications.carpetArea).toFixed(0)}/sq.ft.
                  </div>
                )}
              </div>
              
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg border border-blue-700">
                <span className="font-medium">View Details</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Layout (Default)
  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-200 hover:border-blue-600/30 hover:-translate-y-2"
    >
      {/* Image Section */}
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
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 via-transparent to-yellow-300/20"></div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isVerified && <VerifiedBadge />}
          {isFeatured && (
            <div 
              ref={featuredBadgeRef}
              className="flex items-center gap-1 bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-900 px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-lg border-2 border-white/20"
            >
              ★ Featured
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-blue-600 px-3 py-1 rounded-full text-xs font-semibold shadow-lg border border-blue-200">
          {getPropertyTypeIcon()}
          {propertyType || "Property"}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          onMouseEnter={handleLikeHover}
          onMouseLeave={handleLikeLeave}
          disabled={likesLoading && user}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm z-10 border border-blue-200 ${
            user 
              ? (isLiked 
                  ? "bg-blue-600 text-white scale-110" 
                  : "bg-white/90 text-blue-600 hover:bg-yellow-300 hover:scale-110 hover:border-yellow-400")
              : "bg-white/90 text-blue-600 hover:bg-yellow-300 hover:scale-110 hover:border-yellow-400"
          } ${(likesLoading && user) ? "opacity-50 cursor-not-allowed" : ""}`}
          title={user 
            ? (isLiked ? "Remove from favorites" : "Add to favorites") 
            : "Login to save properties"
          }
        >
          <svg
            className="w-5 h-5"
            fill={user && isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Login Tooltip */}
        {!user && showLoginTooltip && (
          <div className="absolute bottom-14 right-3 bg-blue-600 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 shadow-xl">
            Login to save properties
            <div className="absolute -bottom-1 right-4 w-3 h-3 bg-blue-600 transform rotate-45"></div>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getListingTypeColor()}`}>
            {listingType || "Sale"}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor()}`}>
            {availability || "available"}
          </div>
        </div>

        {/* Admin Approval Badge */}
        {user?.userType === 'admin' && (
          <div className={`absolute top-3 right-20 px-2 py-1 rounded-full text-xs font-semibold border ${getApprovalColor()}`}>
            {approvalStatus || "pending"}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
          {title || "Untitled Property"}
        </h3>
        
        <div className="flex items-center gap-1.5 text-gray-600 mb-1">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-sm font-medium line-clamp-1">{city || "Location not specified"}</span>
        </div>

        {address && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-1 pl-5.5">{address}</p>
        )}

        {/* Property Specifications */}
        <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-200">
          {/* Bedrooms */}
          {safeSpecifications.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <Bed className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">{safeSpecifications.bedrooms} Beds</span>
            </div>
          )}

          {/* Bathrooms */}
          {safeSpecifications.bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <Bath className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">{safeSpecifications.bathrooms} Baths</span>
            </div>
          )}

          {/* Area */}
          {safeSpecifications.carpetArea > 0 && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <Ruler className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">{safeSpecifications.carpetArea.toLocaleString()} sq.ft.</span>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="flex flex-wrap gap-2 mb-3">
          {safeSpecifications.furnishing && (
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
              {safeSpecifications.furnishing}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className={`text-2xl font-bold `}>
              {price}
            </div>
            {listingType === 'Rent' || listingType === 'Lease' ? (
              <div className="text-xs text-gray-500 mt-0.5">per month</div>
            ) : safeSpecifications.carpetArea > 0 && typeof price === 'number' && price > 0 && (
              <div className="text-xs text-gray-500 mt-0.5">
                ₹{(price / safeSpecifications.carpetArea).toFixed(0)}/sq.ft.
              </div>
            )}
          </div>
          
          <button className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg text-sm font-medium border border-blue-700">
            <span>View</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            View on Map
          </a>
        )}
      </div>
    </div>
  );
}