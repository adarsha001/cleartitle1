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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Helper to check if array has items
  const hasItems = (array) => array && Array.isArray(array) && array.length > 0;

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{property.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{property.description}</p>
        <div className="flex items-center space-x-4 mt-2">
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
              <p className="text-gray-900">{property.listingType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Unit Number</p>
              <p className="text-gray-900">{property.unitNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Display Order</p>
              <p className="text-gray-900">{property.displayOrder || 0}</p>
            </div>
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
              <p className="text-sm font-medium text-gray-500">Area/Locality</p>
              <p className="text-gray-900">{property.area || 'N/A'}</p>
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
            {property.coordinates?.latitude && property.coordinates?.longitude && (
              <div>
                <p className="text-sm font-medium text-gray-500">Coordinates</p>
                <p className="text-gray-900 text-sm">
                  {property.coordinates.latitude}, {property.coordinates.longitude}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Price Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Price</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatPrice(property.price)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {property.price?.perUnit ? `Per ${property.price.perUnit}` : 'Total Price'}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Maintenance Charges</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              ₹{property.maintenanceCharges?.toLocaleString('en-IN') || 0}/month
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Security Deposit</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              ₹{property.securityDeposit?.toLocaleString('en-IN') || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Specifications</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Bedrooms</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.bedrooms || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Bathrooms</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.bathrooms || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Balconies</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.balconies || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Floors in Unit</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.floors || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Floor Number</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.floorNumber || 'N/A'}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Carpet Area</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.carpetArea?.toLocaleString('en-IN') || 0} sq.ft</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Built-up Area</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.builtUpArea?.toLocaleString('en-IN') || 0} sq.ft</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Super Built-up Area</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.superBuiltUpArea?.toLocaleString('en-IN') || 'N/A'} sq.ft</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Plot Area</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.plotArea?.toLocaleString('en-IN') || 'N/A'} sq.ft</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Furnishing</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.furnishing || 'N/A'}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Possession Status</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.possessionStatus || 'N/A'}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Age of Property</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.ageOfProperty || 'N/A'} years</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Covered Parking</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.parking?.covered || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Open Parking</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.parking?.open || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-sm font-medium text-gray-500">Kitchen Type</p>
            <p className="text-gray-900 font-semibold">{property.specifications?.kitchenType || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Building Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Building Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Building Name</p>
            <p className="text-gray-900">{property.buildingDetails?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Floors</p>
            <p className="text-gray-900">{property.buildingDetails?.totalFloors || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Units</p>
            <p className="text-gray-900">{property.buildingDetails?.totalUnits || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Year Built</p>
            <p className="text-gray-900">{property.buildingDetails?.yearBuilt || 'N/A'}</p>
          </div>
        </div>
        
        {hasItems(property.buildingDetails?.amenities) && (
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

      {/* Rental Details (if applicable) */}
      {(property.listingType === 'rent' || property.listingType === 'lease' || property.rentalDetails?.availableForRent) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Rental Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Available for Rent</p>
              <p className="text-gray-900">{property.rentalDetails?.availableForRent ? 'Yes' : 'No'}</p>
            </div>
            {property.rentalDetails?.availableForRent && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500">Lease Duration</p>
                  <p className="text-gray-900">
                    {property.rentalDetails?.leaseDuration?.value || 11} {property.rentalDetails?.leaseDuration?.unit || 'months'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rent Negotiable</p>
                  <p className="text-gray-900">{property.rentalDetails?.rentNegotiable ? 'Yes' : 'No'}</p>
                </div>
                {hasItems(property.rentalDetails?.preferredTenants) && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Preferred Tenants</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {property.rentalDetails.preferredTenants.map((tenant, index) => (
                        <span key={index} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-sm">
                          {tenant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hasItems(property.rentalDetails?.includedInRent) && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Included in Rent</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {property.rentalDetails.includedInRent.map((item, index) => (
                        <span key={index} className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Virtual Tour & Floor Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {property.virtualTour && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Virtual Tour</h3>
            <a href={property.virtualTour} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              View Virtual Tour →
            </a>
          </div>
        )}
        
        {property.floorPlan?.image && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Floor Plan</h3>
            <img src={property.floorPlan.image} alt="Floor plan" className="w-full h-auto rounded-lg mb-2" />
            {property.floorPlan.description && (
              <p className="text-sm text-gray-600">{property.floorPlan.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Owner Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Owner Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-gray-900">{property.ownerDetails?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="text-gray-900">{property.ownerDetails?.phoneNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-gray-900">{property.ownerDetails?.email || 'N/A'}</p>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <p className="text-sm font-medium text-gray-500">Reason for Selling</p>
            <p className="text-gray-900">{property.ownerDetails?.reasonForSelling || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Legal Details */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Legal Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Ownership Type</p>
            <p className="text-gray-900">{property.legalDetails?.ownershipType || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">RERA Registered</p>
            <p className="text-gray-900">{property.legalDetails?.reraRegistered ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">RERA Number</p>
            <p className="text-gray-900">{property.legalDetails?.reraNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Khata Certificate</p>
            <p className="text-gray-900">{property.legalDetails?.khataCertificate ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Encumbrance Certificate</p>
            <p className="text-gray-900">{property.legalDetails?.encumbranceCertificate ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Occupancy Certificate</p>
            <p className="text-gray-900">{property.legalDetails?.occupancyCertificate ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

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

      {/* Website & SEO */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Website & SEO</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Website Assignment</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {hasItems(property.websiteAssignment) ? (
                property.websiteAssignment.map((website, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {website}
                  </span>
                ))
              ) : (
                <p className="text-gray-600">No websites assigned</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Meta Title</p>
            <p className="text-gray-900">{property.metaTitle || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Meta Description</p>
            <p className="text-gray-900 line-clamp-2">{property.metaDescription || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Created</p>
            <p className="text-gray-900">{formatDate(property.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Updated</p>
            <p className="text-gray-900">{formatDate(property.updatedAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">View Count</p>
            <p className="text-gray-900">{property.viewCount || 0}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Created By</p>
            <p className="text-gray-900">
              {property.createdBy?.name || property.createdBy?.email || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Rejection Reason (if rejected) */}
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