// src/components/admin/batches/BatchStatsDetails.jsx
import React from 'react';

const BatchStatsDetails = ({ batch, propertyUnits }) => {
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!propertyUnits.length) {
      return {
        totalProperties: 0,
        avgPrice: 0,
        minPrice: null,
        maxPrice: null,
        propertyTypes: {},
        statusCount: {},
        totalValue: 0
      };
    }

    const prices = propertyUnits.map(u => u.price).filter(p => p);
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;
    const totalValue = prices.reduce((a, b) => a + b, 0);

    // Count property types
    const propertyTypes = {};
    propertyUnits.forEach(unit => {
      const type = unit.propertyType || 'Unknown';
      propertyTypes[type] = (propertyTypes[type] || 0) + 1;
    });

    // Count statuses
    const statusCount = {};
    propertyUnits.forEach(unit => {
      const status = unit.availability || unit.status || 'Unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return {
      totalProperties: propertyUnits.length,
      avgPrice,
      minPrice,
      maxPrice,
      propertyTypes,
      statusCount,
      totalValue
    };
  };

  const stats = calculateStats();
  const batchStats = batch.stats || {};

  const statCards = [
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      color: 'bg-blue-500',
    },
    {
      title: 'Average Price',
      value: formatPrice(stats.avgPrice || batchStats.avgPrice),
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-green-500',
    },
    {
      title: 'Total Value',
      value: formatPrice(stats.totalValue),
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      color: 'bg-purple-500',
    },
    {
      title: 'Price Range',
      value: `${formatPrice(stats.minPrice || batchStats.minPrice)} - ${formatPrice(stats.maxPrice || batchStats.maxPrice)}`,
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Types Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Types</h3>
          {Object.keys(stats.propertyTypes).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No property type data available</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.propertyTypes).map(([type, count]) => {
                const percentage = (count / stats.totalProperties * 100).toFixed(1);
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{type}</span>
                      <span className="text-gray-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          {Object.keys(stats.statusCount).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No status data available</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.statusCount).map(([status, count]) => {
                const percentage = (count / stats.totalProperties * 100).toFixed(1);
                const getStatusColor = (status) => {
                  const colors = {
                    available: 'bg-green-500',
                    rented: 'bg-yellow-500',
                    sold: 'bg-red-500',
                    reserved: 'bg-blue-500'
                  };
                  return colors[status.toLowerCase()] || 'bg-gray-500';
                };
                
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2`}></div>
                        <span className="font-medium text-gray-700 capitalize">{status}</span>
                      </div>
                      <span className="text-gray-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${getStatusColor(status)} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchStatsDetails;