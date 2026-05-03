import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import batchService from '../api/batchService';

const BatchCard = ({ batch, index, onEdit, onDelete, onToggleStatus, onReorder }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showOrderInput, setShowOrderInput] = useState(false);
  const [tempOrder, setTempOrder] = useState(batch.currentDisplayOrder || 0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: batch._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Clean up attributes to avoid passing non-standard props to DOM
  const { role, tabIndex, ...cleanAttributes } = attributes;

  const handleOrderChange = async (e) => {
    e.preventDefault();
    const newOrder = parseInt(tempOrder);
    if (!isNaN(newOrder)) {
      await onReorder(batch._id, newOrder);
    }
    setShowOrderInput(false);
  };

  const getBatchTypeColor = (type) => {
    const colors = {
      location_based: 'bg-blue-100 text-blue-800',
      project_group: 'bg-purple-100 text-purple-800',
      featured_listings: 'bg-yellow-100 text-yellow-800',
      similar_properties: 'bg-green-100 text-green-800',
      comparison_group: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getBatchTypeLabel = (type) => {
    const labels = {
      location_based: '📍 Location Based',
      project_group: '🏗️ Project Group',
      featured_listings: '⭐ Featured Listings',
      similar_properties: '🔄 Similar Properties',
      comparison_group: '📊 Comparison Group'
    };
    return labels[type] || type;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...cleanAttributes}
      {...listeners}
      className={`relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 z-10">
        <div className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      {/* Display Order Badge */}
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        {showOrderInput ? (
          <form onSubmit={handleOrderChange} className="flex items-center space-x-1 bg-white rounded-md shadow-md p-1">
            <input
              type="number"
              value={tempOrder}
              onChange={(e) => setTempOrder(e.target.value)}
              className="w-16 px-2 py-1 text-sm border rounded-md"
              autoFocus
              onBlur={() => setShowOrderInput(false)}
            />
            <button type="submit" className="px-2 py-1 text-xs bg-blue-500 text-white rounded">
              Save
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowOrderInput(true)}
            className="bg-white rounded-full shadow-md px-2 py-1 text-xs font-semibold hover:bg-gray-100"
            type="button"
          >
            Order: {batch.currentDisplayOrder || 0}
          </button>
        )}
      </div>

      {/* Batch Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={batch.image?.url || batch.thumbnail || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={batch.batchName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <div className={`absolute top-2 left-12 px-2 py-1 rounded-full text-xs font-medium ${getBatchTypeColor(batch.batchType)}`}>
          {getBatchTypeLabel(batch.batchType)}
        </div>
        <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${batchService.getStatusBadgeClass(batch.isActive)}`}>
          {batchService.getStatusText(batch.isActive)}
        </div>
      </div>

      {/* Batch Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {batch.batchName}
          </h3>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {batch.locationName}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-gray-50 rounded p-2">
            <div className="text-lg font-bold text-blue-600">{batch.stats?.totalProperties || 0}</div>
            <div className="text-xs text-gray-600">Properties</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-lg font-bold text-green-600">{batch.stats?.totalViews || 0}</div>
            <div className="text-xs text-gray-600">Views</div>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <div className="text-lg font-bold text-purple-600">{batch.stats?.uniqueViewers || 0}</div>
            <div className="text-xs text-gray-600">Viewers</div>
          </div>
        </div>

        {/* Action Buttons */}
        {isHovered && (
          <div className="flex justify-end space-x-2 mt-2 pt-2 border-t">
            <button
              onClick={onToggleStatus}
              className="p-1 text-gray-600 hover:text-yellow-600 transition-colors"
              title={batch.isActive ? 'Deactivate' : 'Activate'}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>
            
            <button
              onClick={onEdit}
              className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
              title="Edit Batch"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <Link
              to={`/admin/batches/${batch._id}`}
              className="p-1 text-gray-600 hover:text-green-600 transition-colors"
              title="View Details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </Link>
            
            <button
              onClick={onDelete}
              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
              title="Delete Batch"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchCard;