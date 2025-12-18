// components/BulkEditPanel.jsx
import React, { useState } from 'react';
import { 
  CheckSquare, Square, Edit, Trash2, CheckCircle, 
  XCircle, Star, Eye, EyeOff, X, Filter,
  ChevronDown, ChevronUp, Download, Upload
} from 'lucide-react';
import { toast } from 'react-toastify';

const BulkEditPanel = ({ 
  selectedProperties, 
  setSelectedProperties,
  onBulkActionComplete,
  onBulkUpdate,
  propertyUnits,
  onSelectAll,
  onBulkDelete,
  onBulkApprove,
  onBulkReject,
  loading,
  isReordering,
  setShowBulkPanel
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkData, setBulkData] = useState({
    isFeatured: '',
    isVerified: '',
    approvalStatus: '',
    availability: '',
    listingType: '',
    rejectionReason: ''
  });
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulkUpdate = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties first');
      return;
    }

    // Filter out empty values
    const updateData = Object.fromEntries(
      Object.entries(bulkData).filter(([_, value]) => value !== '')
    );

    if (Object.keys(updateData).length === 0) {
      toast.error('Please select at least one field to update');
      return;
    }

    if (updateData.approvalStatus === 'rejected' && !updateData.rejectionReason) {
      toast.error('Rejection reason is required when rejecting properties');
      return;
    }

    try {
      setBulkLoading(true);
      await onBulkUpdate(updateData);
      
      setBulkEditMode(false);
      setBulkData({
        isFeatured: '',
        isVerified: '',
        approvalStatus: '',
        availability: '',
        listingType: '',
        rejectionReason: ''
      });
    } catch (error) {
      // Error handled in parent component
    } finally {
      setBulkLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedProperties([]);
    setBulkEditMode(false);
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === propertyUnits.length) {
      setSelectedProperties([]);
    } else {
      const allIds = propertyUnits.map(p => p._id);
      setSelectedProperties(allIds);
    }
  };

  const handleExportSelected = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties first');
      return;
    }

    try {
      toast.info('Export feature coming soon');
      // Implement export if you have the endpoint
    } catch (error) {
      toast.error('Export feature not available');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-yellow-200 mb-6">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-yellow-50 transition-colors rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
            <Filter className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Bulk Actions</h3>
            <p className="text-sm text-gray-600">
              {selectedProperties.length} property{selectedProperties.length !== 1 ? 'ies' : ''} selected
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBulkPanel(false);
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <button
              onClick={onBulkApprove}
              disabled={loading || bulkLoading || selectedProperties.length === 0}
              className="flex flex-col items-center justify-center p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Approve</span>
              <span className="text-xs text-green-600 mt-1">{selectedProperties.length}</span>
            </button>
            
            <button
              onClick={onBulkReject}
              disabled={loading || bulkLoading || selectedProperties.length === 0}
              className="flex flex-col items-center justify-center p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Reject</span>
              <span className="text-xs text-red-600 mt-1">{selectedProperties.length}</span>
            </button>
            
            <button
              onClick={() => setBulkEditMode(!bulkEditMode)}
              disabled={loading || bulkLoading || selectedProperties.length === 0}
              className="flex flex-col items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Edit</span>
              <span className="text-xs text-blue-600 mt-1">{selectedProperties.length}</span>
            </button>
            
            <button
              onClick={onBulkDelete}
              disabled={loading || bulkLoading || selectedProperties.length === 0}
              className="flex flex-col items-center justify-center p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">Delete</span>
              <span className="text-xs text-red-600 mt-1">{selectedProperties.length}</span>
            </button>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                {selectedProperties.length === propertyUnits.length ? 'Deselect All' : 'Select All'}
              </button>
              
              <button
                onClick={handleClearSelection}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <Square className="w-4 h-4" />
                Clear Selection
              </button>
            </div>

            <button
              onClick={handleExportSelected}
              disabled={selectedProperties.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export Selected
            </button>
          </div>

          {/* Bulk Edit Form */}
          {bulkEditMode && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">Bulk Edit Fields</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bulkData.isFeatured}
                    onChange={(e) => setBulkData({...bulkData, isFeatured: e.target.value})}
                  >
                    <option value="">No Change</option>
                    <option value="true">Mark as Featured</option>
                    <option value="false">Remove Featured</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bulkData.isVerified}
                    onChange={(e) => setBulkData({...bulkData, isVerified: e.target.value})}
                  >
                    <option value="">No Change</option>
                    <option value="true">Mark as Verified</option>
                    <option value="false">Remove Verified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approval Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bulkData.approvalStatus}
                    onChange={(e) => setBulkData({...bulkData, approvalStatus: e.target.value})}
                  >
                    <option value="">No Change</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bulkData.availability}
                    onChange={(e) => setBulkData({...bulkData, availability: e.target.value})}
                  >
                    <option value="">No Change</option>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                    <option value="under-negotiation">Under Negotiation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Listing Type
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={bulkData.listingType}
                    onChange={(e) => setBulkData({...bulkData, listingType: e.target.value})}
                  >
                    <option value="">No Change</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                    <option value="lease">For Lease</option>
                    <option value="pg">PG/Hostel</option>
                  </select>
                </div>

                {bulkData.approvalStatus === 'rejected' && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={bulkData.rejectionReason}
                      onChange={(e) => setBulkData({...bulkData, rejectionReason: e.target.value})}
                      placeholder="Enter rejection reason"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleBulkUpdate}
                  disabled={bulkLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    'Apply Changes'
                  )}
                </button>
                <button
                  onClick={() => setBulkEditMode(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Selected Properties Summary */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Selected Properties:</h4>
            <div className="text-sm text-gray-600">
              {selectedProperties.length > 5 ? (
                <>
                  <span className="font-semibold">{selectedProperties.length}</span> properties selected
                  <div className="mt-1 text-xs text-gray-500">
                    IDs: {selectedProperties.slice(0, 5).join(', ')} and {selectedProperties.length - 5} more...
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-500">
                  IDs: {selectedProperties.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkEditPanel;