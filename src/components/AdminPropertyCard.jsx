import React from 'react';

const AdminPropertyCard = ({ property, onEdit, onDelete, onToggleFeatured }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Commercial': return 'bg-blue-100 text-blue-800';
      case 'Outright': return 'bg-purple-100 text-purple-800';
      case 'Farmland': return 'bg-green-100 text-green-800';
      case 'JD/JV': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {property.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(property.category)}`}>
                {property.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.approvalStatus)}`}>
                {property.approvalStatus}
              </span>
              {property.isFeatured && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
              {property.isVerified && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Verified
                </span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2 ml-4">
            <button
              onClick={onToggleFeatured}
              className={`p-2 rounded-lg transition-colors ${
                property.isFeatured 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={property.isFeatured ? 'Remove from featured' : 'Mark as featured'}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </button>
            
            <button
              onClick={onEdit}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              title="Edit property"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={onDelete}
              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              title="Delete property"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Location</p>
            <p className="font-medium">{property.city}, {property.propertyLocation}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Price</p>
            <p className="font-medium text-lg text-green-600">
              {typeof property.price === 'number' 
                ? `₹${property.price.toLocaleString()}` 
                : property.price}
            </p>
          </div>
        </div>

        {/* Agent Details */}
        {property.agentDetails?.name && (
          <div className="border-t pt-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Agent Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>{' '}
                <span className="font-medium">{property.agentDetails.name}</span>
              </div>
              {property.agentDetails.phoneNumber && (
                <div>
                  <span className="text-gray-600">Phone:</span>{' '}
                  <span className="font-medium">{property.agentDetails.phoneNumber}</span>
                </div>
              )}
              {property.agentDetails.email && (
                <div>
                  <span className="text-gray-600">Email:</span>{' '}
                  <span className="font-medium">{property.agentDetails.email}</span>
                </div>
              )}
              {property.agentDetails.company && (
                <div>
                  <span className="text-gray-600">Company:</span>{' '}
                  <span className="font-medium">{property.agentDetails.company}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property Attributes */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2">Key Attributes</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {property.attributes?.square && (
              <div>
                <span className="text-gray-600">Area:</span>{' '}
                <span className="font-medium">{property.attributes.square}</span>
              </div>
            )}
            {property.attributes?.facing && (
              <div>
                <span className="text-gray-600">Facing:</span>{' '}
                <span className="font-medium">{property.attributes.facing}</span>
              </div>
            )}
            {property.attributes?.roadWidth && (
              <div>
                <span className="text-gray-600">Road Width:</span>{' '}
                <span className="font-medium">{property.attributes.roadWidth} ft</span>
              </div>
            )}
            {property.displayOrder > 0 && (
              <div>
                <span className="text-gray-600">Order:</span>{' '}
                <span className="font-medium">{property.displayOrder}</span>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Features</h4>
            <div className="flex flex-wrap gap-1">
              {property.features.slice(0, 5).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {feature}
                </span>
              ))}
              {property.features.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  +{property.features.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-4 mt-4 text-xs text-gray-500">
          Created: {new Date(property.createdAt).toLocaleDateString()}
          {property.updatedAt !== property.createdAt && (
            <span> • Updated: {new Date(property.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyCard;