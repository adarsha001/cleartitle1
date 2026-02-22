import React, { useState, useEffect, useCallback, useRef } from 'react';
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import { batchService } from "../api/batchService";

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const PropertyUnitSelector = ({ selectedUnits = [], onChange, batchId = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    approvalStatus: 'approved',
    availability: 'available'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1,
    limit: 10
  });
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    propertyTypes: [],
    bedroomOptions: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState(selectedUnits);
  const [viewMode, setViewMode] = useState('paginated'); // 'paginated' or 'all'

  // Available page size options
  const pageSizeOptions = [10, 25, 50, 100];

  // Use useRef for debounced function
  const debouncedSearchRef = useRef();

  // Initialize debounced function
  useEffect(() => {
    debouncedSearchRef.current = debounce((searchValue) => {
      setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
    }, 500);
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(value);
    }
  };

  // Fetch property units with filters
  const fetchPropertyUnits = async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentPage = reset ? 1 : filters.page;
      const params = {
        ...filters,
        page: currentPage,
        limit: filters.limit,
        excludeBatch: batchId // Exclude units already in this batch
      };

      // Clean up params - remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      // Try to use batchService first, fall back to propertyUnitAPI
      let response;
      try {
        response = await batchService.getAssignablePropertyUnits(params);
      } catch (error) {
        // Fall back to propertyUnitAPI
        const apiResponse = await propertyUnitAPI.getPropertyUnits(params);
        response = {
          success: true,
          data: apiResponse.data?.data || apiResponse.data || [],
          pagination: apiResponse.data?.pagination || {
            page: currentPage,
            total: (apiResponse.data?.data || apiResponse.data || []).length,
            pages: 1,
            limit: params.limit
          }
        };
      }
      
      if (response.success) {
        const data = response.data || [];
        
        if (reset) {
          setPropertyUnits(data);
        } else {
          setPropertyUnits(prev => [...prev, ...data]);
        }
        
        setPagination(response.pagination || {
          page: currentPage,
          total: data.length,
          pages: 1,
          limit: params.limit
        });

        // Set filter options if available
        if (response.filters) {
          setFilterOptions(response.filters);
        }
      }
    } catch (error) {
      console.error('Error fetching property units:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all property units (without pagination)
  const fetchAllPropertyUnits = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        limit: 1000, // Large limit to get all records
        excludeBatch: batchId
      };

      // Clean up params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      let allUnits = [];
      let currentPage = 1;
      let totalPages = 1;

      // Fetch all pages
      while (currentPage <= totalPages) {
        const pageParams = { ...params, page: currentPage };
        
        let response;
        try {
          response = await batchService.getAssignablePropertyUnits(pageParams);
        } catch (error) {
          const apiResponse = await propertyUnitAPI.getPropertyUnits(pageParams);
          response = {
            success: true,
            data: apiResponse.data?.data || apiResponse.data || [],
            pagination: apiResponse.data?.pagination || {
              page: currentPage,
              total: 0,
              pages: 1
            }
          };
        }

        if (response.success) {
          allUnits = [...allUnits, ...(response.data || [])];
          totalPages = response.pagination?.pages || 1;
          setPagination(response.pagination || {
            page: currentPage,
            total: allUnits.length,
            pages: totalPages,
            limit: params.limit
          });
        }
        
        currentPage++;
      }

      setPropertyUnits(allUnits);
    } catch (error) {
      console.error('Error fetching all property units:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    if (viewMode === 'paginated') {
      fetchPropertyUnits(true);
    } else {
      fetchAllPropertyUnits();
    }
  }, [
    filters.search, 
    filters.approvalStatus, 
    filters.availability, 
    filters.city, 
    filters.propertyType, 
    filters.bedrooms,
    filters.limit,
    viewMode
  ]);

  // Handle unit selection
  const handleUnitSelect = (unit) => {
    let newSelection;
    const isSelected = selectedIds.includes(unit._id);
    
    if (isSelected) {
      newSelection = selectedIds.filter(id => id !== unit._id);
    } else {
      newSelection = [...selectedIds, unit._id];
    }
    
    setSelectedIds(newSelection);
    onChange(newSelection);
  };

  // Handle bulk selection/deselection
  const handleBulkSelect = () => {
    if (selectedIds.length === propertyUnits.length) {
      // Deselect all
      setSelectedIds([]);
      onChange([]);
    } else {
      // Select all visible units
      const allIds = propertyUnits.map(unit => unit._id);
      setSelectedIds(allIds);
      onChange(allIds);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value,
      page: 1
    }));
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setFilters(prev => ({
      ...prev,
      limit: newLimit,
      page: 1
    }));
  };

  // Pagination navigation
  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      setFilters(prev => ({ ...prev, page }));
    }
  };

  // Get selected units count
  const selectedCount = selectedIds.length;

  // Calculate page numbers to display
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= pagination.pages; i++) {
      if (i === 1 || i === pagination.pages || (i >= pagination.page - delta && i <= pagination.page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Select Property Units</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'paginated' ? 'all' : 'paginated')}
              className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-colors"
            >
              {viewMode === 'paginated' ? 'Show All' : 'Show Paginated'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by title, city, address, or owner..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={filters.city || 'all'}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Cities</option>
                {filterOptions.cities && filterOptions.cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Property Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                value={filters.propertyType || 'all'}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {filterOptions.propertyTypes && filterOptions.propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Bedrooms Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select
                value={filters.bedrooms || 'all'}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Any</option>
                {filterOptions.bedroomOptions && filterOptions.bedroomOptions.map(beds => (
                  <option key={beds} value={beds}>{beds} {beds === 1 ? 'Bed' : 'Beds'}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.availability || 'available'}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
        )}

        {/* Selection Summary */}
        <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded-lg">
          <div>
            <span className="text-sm text-gray-600">
              Selected: <span className="font-semibold text-blue-700">{selectedCount}</span> units
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Total: <span className="font-semibold">{pagination.total}</span> units
            </span>
            <button
              onClick={handleBulkSelect}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              {selectedCount === propertyUnits.length ? 'Deselect All' : 'Select All Visible'}
            </button>
          </div>
        </div>
      </div>

      {/* Property Units List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {loading && propertyUnits.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading property units...</p>
          </div>
        ) : propertyUnits.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No property units found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Page Size Selector */}
            {viewMode === 'paginated' && (
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Show:</label>
                  <select
                    value={filters.limit}
                    onChange={handlePageSizeChange}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {pageSizeOptions.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * filters.limit + 1} - {Math.min(pagination.page * filters.limit, pagination.total)} of {pagination.total}
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {propertyUnits.map((unit) => {
                    const isSelected = selectedIds.includes(unit._id);
                    return (
                      <tr 
                        key={unit._id} 
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                        onClick={() => handleUnitSelect(unit)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleUnitSelect(unit)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {unit.images && unit.images[0] && (
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={unit.images[0].url}
                                  alt={unit.title}
                                />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{unit.title}</div>
                              <div className="text-sm text-gray-500">
                                {unit.specifications?.bedrooms} Beds, {unit.specifications?.bathrooms} Baths
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{unit.city}</div>
                          <div className="text-sm text-gray-500">{unit.address?.substring(0, 30)}...</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {unit.propertyType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{unit.price?.amount?.toLocaleString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            unit.availability === 'available' 
                              ? 'bg-green-100 text-green-800'
                              : unit.availability === 'sold'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {unit.availability}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {viewMode === 'paginated' && pagination.pages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      First
                    </button>
                    <button
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Previous
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map((pageNum, index) => (
                      pageNum === '...' ? (
                        <span key={`dots-${index}`} className="px-3 py-1 text-sm text-gray-500">...</span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => goToPage(pagination.pages)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Load More Button (for backward compatibility) */}
            {viewMode === 'paginated' && pagination.page < pagination.pages && (
              <div className="p-4 border-t border-gray-200 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Selected Units Preview */}
      {selectedCount > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium text-gray-800 mb-3">
            Selected Units ({selectedCount})
          </h4>
          <div className="flex flex-wrap gap-2">
            {propertyUnits
              .filter(unit => selectedIds.includes(unit._id))
              .slice(0, 10)
              .map(unit => (
                <div 
                  key={unit._id}
                  className="flex items-center bg-white px-3 py-2 rounded-md border border-gray-200"
                >
                  <span className="text-sm text-gray-700 mr-2">{unit.title}</span>
                  <button
                    onClick={() => handleUnitSelect(unit)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            {selectedCount > 10 && (
              <div className="text-sm text-gray-500 px-3 py-2">
                + {selectedCount - 10} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyUnitSelector;