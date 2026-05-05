// components/admin/CardAdList.jsx
import React, { useState } from 'react';

const CardAdList = ({ section, ads, onEdit, onDelete, onUpdateOrder }) => {
  const [editingOrder, setEditingOrder] = useState(null);
  const [tempOrders, setTempOrders] = useState({});

  React.useEffect(() => {
    // Initialize temp orders when ads change
    const orders = {};
    ads.forEach(ad => {
      orders[ad._id] = ad.displayOrder;
    });
    setTempOrders(orders);
  }, [ads]);

  const handleOrderChange = (adId, newOrder) => {
    setTempOrders(prev => ({
      ...prev,
      [adId]: parseInt(newOrder) || 0
    }));
  };

  const handleSaveOrder = async () => {
    const updates = ads.map(ad => ({
      id: ad._id,
      displayOrder: tempOrders[ad._id]
    }));
    
    await onUpdateOrder(section, updates);
    setEditingOrder(null);
  };

  const handleCancelOrder = () => {
    const orders = {};
    ads.forEach(ad => {
      orders[ad._id] = ad.displayOrder;
    });
    setTempOrders(orders);
    setEditingOrder(null);
  };

  const handleBatchUpdate = async () => {
    if (!editingOrder) {
      setEditingOrder('batch');
      return;
    }
    
    // Sort ads by current order and reassign sequential numbers
    const sortedAds = [...ads].sort((a, b) => a.displayOrder - b.displayOrder);
    const updates = sortedAds.map((ad, index) => ({
      id: ad._id,
      displayOrder: index
    }));
    
    await onUpdateOrder(section, updates);
    setEditingOrder(null);
  };

  if (ads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No ads found in this section.</p>
        <p className="text-sm text-gray-400 mt-2">Click "Create New Ad" to add one.</p>
      </div>
    );
  }

  // Sort ads by display order
  const sortedAds = [...ads].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {section.charAt(0).toUpperCase() + section.slice(1)} Section Ads
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {ads.length} ad(s) total
          </p>
        </div>
        <div className="flex space-x-2">
          {editingOrder ? (
            <>
              <button
                onClick={handleSaveOrder}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingOrder('individual')}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Orders
            </button>
          )}
          <button
            onClick={handleBatchUpdate}
            className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Reorder Sequentially
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statistics
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAds.map((ad) => (
              <tr key={ad._id} className="hover:bg-gray-50 transition">
                {/* Order Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingOrder ? (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={tempOrders[ad._id]}
                      onChange={(e) => handleOrderChange(ad._id, e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-sm text-gray-900 font-medium">
                      {ad.displayOrder}
                    </span>
                  )}
                </td>

                {/* Image Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={ad.desktopImage}
                    alt={ad.overlayTitle || 'Ad preview'}
                    className="h-16 w-24 object-cover rounded"
                  />
                </td>

                {/* Details Column */}
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {ad.overlayTitle && (
                      <div className="font-medium text-gray-900">{ad.overlayTitle}</div>
                    )}
                    {ad.overlayDescription && (
                      <div className="text-sm text-gray-500 line-clamp-2">{ad.overlayDescription}</div>
                    )}
                    {ad.link && ad.link !== '#' && (
                      <div className="text-xs text-blue-600 truncate max-w-xs">{ad.link}</div>
                    )}
                    {ad.ctaText && (
                      <div className="text-xs text-gray-500">CTA: {ad.ctaText}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      Rotation: {ad.rotationInterval}ms
                    </div>
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <span className={`px-2 py-1 text-xs rounded-full inline-block ${
                      ad.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ad.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <br />
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full inline-block">
                      {ad.target}
                    </span>
                  </div>
                </td>

                {/* Statistics Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>🖱️ {ad.clicks || 0} clicks</div>
                    <div>👁️ {ad.views || 0} views</div>
                    <div className="text-xs text-gray-500">
                      CTR: {ad.views ? ((ad.clicks / ad.views) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => onEdit(ad)}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(ad._id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Order Guide */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-sm text-gray-600">
          <strong>Order Management Tips:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Lower numbers appear first (0, 1, 2, etc.)</li>
            <li>Click "Edit Orders" to modify individual display orders</li>
            <li>Click "Reorder Sequentially" to automatically order ads from 0 to N-1</li>
            <li>Ads with same order number will be sorted by creation date</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CardAdList;