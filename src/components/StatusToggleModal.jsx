// src/components/admin/batches/StatusToggleModal.jsx
import React from 'react';

const StatusToggleModal = ({ isOpen, batch, onClose, onConfirm }) => {
  if (!isOpen || !batch) return null;

  const isActivating = !batch.isActive;
  const actionText = isActivating ? 'Activate' : 'Deactivate';
  const batchName = batch.batchName || 'this batch';

  const getStatusChangeDetails = () => {
    if (isActivating) {
      return {
        title: 'Activate Batch',
        iconColor: 'bg-green-100',
        icon: (
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        description: 'This batch will become visible to users.',
        confirmationText: `Are you sure you want to activate "${batchName}"?`,
        confirmButtonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      };
    } else {
      return {
        title: 'Deactivate Batch',
        iconColor: 'bg-yellow-100',
        icon: (
          <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L3.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        description: 'This batch will be hidden from users.',
        confirmationText: `Are you sure you want to deactivate "${batchName}"?`,
        confirmButtonColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      };
    }
  };

  const details = getStatusChangeDetails();

  // Get current status info
  const getCurrentStatusInfo = () => {
    const totalProperties = batch.stats?.totalProperties || 0;
    const location = batch.locationName || 'Unknown location';
    
    return (
      <div className="mt-4 bg-gray-50 rounded-md p-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium text-gray-700">Current Status:</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${batch.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {batch.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Properties:</span>
            <span className="ml-2">{totalProperties}</span>
          </div>
          <div className="col-span-2">
            <span className="font-medium text-gray-700">Location:</span>
            <span className="ml-2">{location}</span>
          </div>
          {batch.batchCode && (
            <div className="col-span-2">
              <span className="font-medium text-gray-700">Batch Code:</span>
              <span className="ml-2 font-mono text-gray-600">{batch.batchCode}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get consequences
  const getConsequences = () => {
    if (isActivating) {
      return (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-medium text-green-800 mb-1">Activation Consequences:</h4>
          <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
            <li>Batch will be visible to all users</li>
            <li>Properties in this batch will be grouped together</li>
            <li>Batch will appear in search results</li>
            <li>Will be included in location-based listings</li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="font-medium text-yellow-800 mb-1">Deactivation Consequences:</h4>
          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
            <li>Batch will be hidden from all users</li>
            <li>Properties will remain in the system but won't show in this batch</li>
            <li>Batch won't appear in search results</li>
            <li>Will be excluded from location-based listings</li>
            <li>Users won't be able to access this batch</li>
          </ul>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Header */}
          <div className="sm:flex sm:items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${details.iconColor} sm:mx-0 sm:h-10 sm:w-10`}>
              {details.icon}
            </div>
            
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {details.title}
              </h3>
              
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {details.confirmationText}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {details.description}
                </p>
                
                {/* Batch Info */}
                {getCurrentStatusInfo()}
                
                {/* Consequences */}
                {getConsequences()}
                
                {/* Warning for batch with properties */}
                {!isActivating && batch.stats?.totalProperties > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-red-800">
                        This batch contains {batch.stats.totalProperties} properties
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${details.confirmButtonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              {actionText}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusToggleModal;