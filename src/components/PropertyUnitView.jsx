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

  return (
    <div className="space-y-6">
      {/* Property Images */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Images</h4>
        <div className="grid grid-cols-3 gap-2">
          {property.images?.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={`Property ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Title</h4>
          <p className="text-gray-900">{property.title}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700">Description</h4>
          <p className="text-gray-900">{property.description}</p>
        </div>
      </div>

      {/* Location */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700">City</h4>
          <p className="text-gray-900">{property.city}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700">Area</h4>
          <p className="text-gray-900">{property.area}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700">Address</h4>
          <p className="text-gray-900">{property.address}</p>
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="text-sm font-medium text-gray-700">Price Details</h4>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-gray-900 font-medium">{formatPrice(property.price)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Maintenance</p>
            <p className="text-gray-900">₹{property.maintenanceCharges || 0}/month</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Deposit</p>
            <p className="text-gray-900">₹{property.securityDeposit || 0}</p>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Specifications</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Bedrooms</p>
            <p className="text-gray-900">{property.specifications?.bedrooms || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Bathrooms</p>
            <p className="text-gray-900">{property.specifications?.bathrooms || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Area</p>
            <p className="text-gray-900">{property.specifications?.carpetArea || property.specifications?.plotArea || 0} sq.ft</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Furnishing</p>
            <p className="text-gray-900">{property.specifications?.furnishing || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Approval Status</p>
            <span className={`px-2 py-1 text-xs rounded-full ${
              property.approvalStatus === 'approved' 
                ? 'bg-green-100 text-green-800'
                : property.approvalStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {property.approvalStatus || 'pending'}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Availability</p>
            <span className={`px-2 py-1 text-xs rounded-full ${
              property.availability === 'available'
                ? 'bg-green-100 text-green-800'
                : property.availability === 'sold'
                ? 'bg-red-100 text-red-800'
                : property.availability === 'rented'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {property.availability || 'available'}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-gray-900">{formatDate(property.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyUnitView;