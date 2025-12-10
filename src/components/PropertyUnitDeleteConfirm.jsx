import React from 'react';

const PropertyUnitDeleteConfirm = ({ 
  property, 
  onConfirm, 
  onCancel,
  isBulk = false,
  bulkCount = 0
}) => {
  if (isBulk) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mt-3">
          Delete {bulkCount} {bulkCount === 1 ? 'Property' : 'Properties'}
        </h3>
        <div className="mt-2 px-7 py-3">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete {bulkCount === 1 ? 'this property' : 'these properties'}? 
            This action cannot be undone and will permanently remove {bulkCount === 1 ? 'it' : 'them'} from the system.
          </p>
        </div>
        <div className="mt-4 flex justify-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-100 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete {bulkCount === 1 ? 'Property' : 'All'}
          </button>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const formatPrice = (price) => {
    if (!price || !price.amount) return 'N/A';
    const amount = typeof price.amount === 'string' ? parseFloat(price.amount) : price.amount;
    return `${price.currency || 'INR'} ${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mt-3">Delete Property</h3>
        <p className="text-sm text-gray-500 mt-1">
          Are you sure you want to delete this property? This action cannot be undone.
        </p>
      </div>

      {/* Property Details Preview */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center mb-3">
          {property.images?.[0]?.url ? (
            <img
              src={property.images[0].url}
              alt={property.title}
              className="w-16 h-16 rounded-lg object-cover mr-4"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
              <span className="text-gray-400 text-xl">🏠</span>
            </div>
          )}
          <div>
            <h4 className="font-medium text-gray-900">{property.title}</h4>
            <p className="text-sm text-gray-500">{property.city}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 text-gray-900">{property.propertyType}</span>
          </div>
          <div>
            <span className="text-gray-500">Listing:</span>
            <span className="ml-2 text-gray-900">{property.listingType}</span>
          </div>
          <div>
            <span className="text-gray-500">Price:</span>
            <span className="ml-2 text-gray-900">{formatPrice(property.price)}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              property.approvalStatus === 'approved' 
                ? 'bg-green-100 text-green-800'
                : property.approvalStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {property.approvalStatus || 'pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Deleting this property will:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Remove all property data including images</li>
                <li>Delete all related inquiries and bookings</li>
                <li>This action cannot be reversed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-100 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete Property
        </button>
      </div>
    </div>
  );
};

export default PropertyUnitDeleteConfirm;