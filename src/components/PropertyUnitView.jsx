// components/PropertyUnitView.jsx (Updated)
import React from 'react';

const PropertyUnitView = ({ property }) => {
  const formatPrice = (price) => {
    if (!price || !price.amount) return 'N/A';
    const amount = typeof price.amount === 'string' ? parseFloat(price.amount) : price.amount;
    return `${price.currency || 'INR'} ${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      available: 'bg-green-100 text-green-800',
      sold: 'bg-red-100 text-red-800',
      rented: 'bg-blue-100 text-blue-800',
      'under-agreement': 'bg-purple-100 text-purple-800',
      hold: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const hasItems = (array) => array && Array.isArray(array) && array.length > 0;

  // Get price range from unitTypes
  const getPriceRange = () => {
    if (property.unitTypes && property.unitTypes.length > 0) {
      const prices = property.unitTypes.map(unit => unit.price?.amount || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return formatPrice({ amount: minPrice, currency: 'INR' });
      }
      return `${formatPrice({ amount: minPrice })} - ${formatPrice({ amount: maxPrice })}`;
    }
    return formatPrice(property.price);
  };

  // Get unit types summary
  const getUnitTypesSummary = () => {
    if (property.unitTypes && property.unitTypes.length > 0) {
      return property.unitTypes.map(unit => `${unit.type}: ${formatPrice(unit.price)}`).join(' | ');
    }
    return 'N/A';
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{property.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{property.description}</p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(property.approvalStatus)}`}>
            {property.approvalStatus?.toUpperCase() || 'PENDING'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(property.availability)}`}>
            {property.availability?.toUpperCase() || 'AVAILABLE'}
          </span>
          {property.isFeatured && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              ⭐ FEATURED
            </span>
          )}
          {property.isVerified && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✓ VERIFIED
            </span>
          )}
          {property.listingType && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {property.listingType.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Property Images */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Property Images ({property.images?.length || 0})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {property.images?.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`Property ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
              {image.caption && (
                <p className="text-xs text-gray-600 mt-1 truncate">{image.caption}</p>
              )}
            </div>
          )) || (
            <div className="col-span-4 text-center py-8">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Property Type</p>
              <p className="text-gray-900">{property.propertyType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Listing Type</p>
              <p className="text-gray-900 capitalize">{property.listingType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Display Order</p>
              <p className="text-gray-900">{property.displayOrder || 0}</p>
            </div>
            {property.slug && (
              <div>
                <p className="text-sm font-medium text-gray-500">Slug</p>
                <p className="text-gray-900 text-sm">{property.slug}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Location Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">City</p>
              <p className="text-gray-900">{property.city || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Full Address</p>
              <p className="text-gray-900">{property.address || 'N/A'}</p>
            </div>
            {property.mapUrl && (
              <div>
                <p className="text-sm font-medium text-gray-500">Map URL</p>
                <a href={property.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                  View on Map
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price & Unit Types */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Price & Unit Types</h3>
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500 mb-2">Price Range</p>
          <p className="text-2xl font-bold text-gray-900">{getPriceRange()}</p>
        </div>
        
        {hasItems(property.unitTypes) && (
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Unit Types ({property.unitTypes.length})</p>
            <div className="space-y-3">
              {property.unitTypes.map((unit, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="font-medium">{unit.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-medium">{formatPrice(unit.price)}</p>
                      <p className="text-xs text-gray-500">{unit.price?.perUnit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Area</p>
                      <p className="text-sm">
                        {unit.carpetArea ? `${unit.carpetArea} sq.ft` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Availability</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(unit.availability)}`}>
                        {unit.availability}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Common Specifications */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Specifications</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Furnishing</p>
            <p className="text-gray-900 capitalize">{property.commonSpecifications?.furnishing || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Possession Status</p>
            <p className="text-gray-900 capitalize">{property.commonSpecifications?.possessionStatus || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Age of Property</p>
            <p className="text-gray-900">{property.commonSpecifications?.ageOfProperty || 'N/A'} years</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Kitchen Type</p>
            <p className="text-gray-900 capitalize">{property.commonSpecifications?.kitchenType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Covered Parking</p>
            <p className="text-gray-900">{property.commonSpecifications?.parking?.covered || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Open Parking</p>
            <p className="text-gray-900">{property.commonSpecifications?.parking?.open || 0}</p>
          </div>
        </div>
      </div>

      {/* Building Details */}
      {property.buildingDetails && (property.buildingDetails.name || hasItems(property.buildingDetails.amenities)) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Building Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.buildingDetails.name && (
              <div>
                <p className="text-sm font-medium text-gray-500">Building Name</p>
                <p className="text-gray-900">{property.buildingDetails.name}</p>
              </div>
            )}
            {property.buildingDetails.totalFloors && (
              <div>
                <p className="text-sm font-medium text-gray-500">Total Floors</p>
                <p className="text-gray-900">{property.buildingDetails.totalFloors}</p>
              </div>
            )}
            {property.buildingDetails.totalUnits && (
              <div>
                <p className="text-sm font-medium text-gray-500">Total Units</p>
                <p className="text-gray-900">{property.buildingDetails.totalUnits}</p>
              </div>
            )}
            {property.buildingDetails.yearBuilt && (
              <div>
                <p className="text-sm font-medium text-gray-500">Year Built</p>
                <p className="text-gray-900">{property.buildingDetails.yearBuilt}</p>
              </div>
            )}
          </div>
          
          {hasItems(property.buildingDetails.amenities) && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Building Amenities</p>
              <div className="flex flex-wrap gap-2">
                {property.buildingDetails.amenities.map((amenity, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Location Nearby */}
      {hasItems(property.locationNearby) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Nearby Amenities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {property.locationNearby.map((item, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.distance}</p>
                    <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unit Features */}
      {hasItems(property.unitFeatures) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Unit Features ({property.unitFeatures.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {property.unitFeatures.map((feature, index) => (
              <div key={index} className="flex items-center bg-white p-2 rounded border">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owner Details */}
      {property.ownerDetails && (property.ownerDetails.name || property.ownerDetails.phoneNumber) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Owner Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {property.ownerDetails.name && (
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900">{property.ownerDetails.name}</p>
              </div>
            )}
            {property.ownerDetails.phoneNumber && (
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-gray-900">{property.ownerDetails.phoneNumber}</p>
              </div>
            )}
            {property.ownerDetails.email && (
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{property.ownerDetails.email}</p>
              </div>
            )}
            {property.ownerDetails.reasonForSelling && (
              <div>
                <p className="text-sm font-medium text-gray-500">Reason for Selling</p>
                <p className="text-gray-900">{property.ownerDetails.reasonForSelling}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Details */}
      {property.legalDetails && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Legal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Ownership Type</p>
              <p className="text-gray-900 capitalize">{property.legalDetails.ownershipType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Khata Status</p>
              <p className="text-gray-900">{property.legalDetails.khataStatus || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">RERA Registered</p>
              <p className="text-gray-900">{property.legalDetails.reraRegistered ? 'Yes' : 'No'}</p>
              {property.legalDetails.reraNumber && (
                <p className="text-xs text-gray-500">RERA: {property.legalDetails.reraNumber}</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Clear Title</p>
              <p className="text-gray-900">{property.legalDetails.clearTitle ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Encumbrance Certificate</p>
              <p className="text-gray-900">{property.legalDetails.encumbranceCertificate ? 'Yes' : 'No'}</p>
              {property.legalDetails.encumbranceYears && (
                <p className="text-xs text-gray-500">{property.legalDetails.encumbranceYears} years</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Occupancy Certificate</p>
              <p className="text-gray-900">{property.legalDetails.occupancyCertificate ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {hasItems(property.legalDetails.bankApprovals) && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Bank Approvals</p>
              <div className="space-y-2">
                {property.legalDetails.bankApprovals.map((approval, index) => (
                  <div key={index} className="bg-white p-2 rounded border">
                    <p className="font-medium">{approval.bankName}</p>
                    <p className="text-sm text-gray-500">Approved: {approval.approved ? 'Yes' : 'No'}</p>
                    {approval.approvalDate && <p className="text-xs text-gray-400">{approval.approvalDate}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact & Viewing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Preference</h3>
          <div className="flex flex-wrap gap-2">
            {hasItems(property.contactPreference) ? (
              property.contactPreference.map((method, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {method}
                </span>
              ))
            ) : (
              <p className="text-gray-600">No preferences set</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Viewing Schedule ({property.viewingSchedule?.length || 0})</h3>
          {hasItems(property.viewingSchedule) ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {property.viewingSchedule.map((slot, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900">{new Date(slot.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{slot.slotsAvailable || 1} slots</p>
                  </div>
                  <p className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No viewing slots scheduled</p>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{property.viewCount || 0}</p>
            <p className="text-sm text-gray-600">Views</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{property.inquiryCount || 0}</p>
            <p className="text-sm text-gray-600">Inquiries</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{property.favoriteCount || 0}</p>
            <p className="text-sm text-gray-600">Favorites</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{property.likes || 0}</p>
            <p className="text-sm text-gray-600">Likes</p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Created</p>
            <p className="text-gray-900">{formatDate(property.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Updated</p>
            <p className="text-gray-900">{formatDate(property.updatedAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Created By</p>
            <p className="text-gray-900">
              {property.createdBy?.name || property.createdBy?.email || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Rejection Reason */}
      {property.approvalStatus === 'rejected' && property.rejectionReason && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-900 mb-2">Rejection Reason</h3>
          <p className="text-red-700">{property.rejectionReason}</p>
        </div>
      )}
    </div>
  );
};

export default PropertyUnitView;