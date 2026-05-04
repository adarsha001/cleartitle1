// frontend/src/components/PropertyUnitSelector.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { propertyUnitAPI } from "../api/propertyUnitAPI";

const PropertyUnitSelector = ({ selectedUnits = [], onChange, batchId = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    approvalStatus: 'approved',
    availability: 'available',
    city: '',
    propertyType: '',
    bedrooms: ''
  });
  
  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    propertyTypes: [],
    bedroomOptions: []
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // CRITICAL FIX: Extract IDs from selectedUnits (which may contain full objects)
  const [selectedIds, setSelectedIds] = useState(() => {
    if (selectedUnits && selectedUnits.length > 0) {
      // If selectedUnits contains objects with _id, extract the IDs
      if (typeof selectedUnits[0] === 'object' && selectedUnits[0]._id) {
        return selectedUnits.map(unit => unit._id);
      }
      // If it's already an array of IDs
      return selectedUnits;
    }
    return [];
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(100); // 100 items per page
  
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef(null);

  // Debug logging
  console.log("Selected Units Prop:", selectedUnits);
  console.log("Selected IDs State:", selectedIds);

  // Sync selectedIds with selectedUnits prop - FIXED to handle both formats
  useEffect(() => {
    if (selectedUnits && selectedUnits.length > 0) {
      // Check if selectedUnits contains objects or IDs
      if (typeof selectedUnits[0] === 'object' && selectedUnits[0]._id) {
        const ids = selectedUnits.map(unit => unit._id);
        console.log("Extracted IDs from objects:", ids);
        setSelectedIds(ids);
      } else {
        console.log("Using IDs directly:", selectedUnits);
        setSelectedIds(selectedUnits);
      }
    } else {
      setSelectedIds([]);
    }
  }, [selectedUnits]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setCurrentPage(1);
      setPropertyUnits([]);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch property units with pagination
  const fetchPropertyUnits = useCallback(async (page, isLoadMore = false) => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    
    if (!isLoadMore) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const params = {
        ...filters,
        page: page,
        limit: pageSize,
      };
      
      // Clean up params
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });
      
      // Add excludeBatch if valid
      if (batchId && batchId !== 'null' && batchId !== 'undefined' && batchId !== '') {
        params.excludeBatch = batchId;
      }
      
      console.log(`Fetching page ${page} with params:`, params);
      
      const response = await propertyUnitAPI.getPropertyUnits(params);
      
      if (response.data && response.data.success) {
        const newData = response.data.data || [];
        const total = response.data.total || 0;
        const pages = response.data.totalPages || 1;
        
        if (isLoadMore) {
          setPropertyUnits(prev => [...prev, ...newData]);
        } else {
          setPropertyUnits(newData);
        }
        
        setTotalItems(total);
        setTotalPages(pages);
        setCurrentPage(page);
        
        // Update filter options on first load
        if (!isLoadMore && response.data.filters) {
          setFilterOptions({
            cities: response.data.filters.cities || [],
            propertyTypes: response.data.filters.propertyTypes || [],
            bedroomOptions: response.data.filters.bedroomOptions || []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching property units:', error);
      if (!isLoadMore) {
        setPropertyUnits([]);
      }
    } finally {
      isFetchingRef.current = false;
      if (!isLoadMore) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [filters, pageSize, batchId]);

  // Load more items
  const loadMore = useCallback(() => {
    if (!loadingMore && currentPage < totalPages && !isFetchingRef.current) {
      const nextPage = currentPage + 1;
      fetchPropertyUnits(nextPage, true);
    }
  }, [loadingMore, currentPage, totalPages, fetchPropertyUnits]);

  // Fetch when filters change
  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      setPropertyUnits([]);
      fetchPropertyUnits(1, false);
    }, 300);
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [filters, fetchPropertyUnits]);

  // Handle unit selection - returns IDs to parent
  const handleUnitSelect = useCallback((unit) => {
    const isSelected = selectedIds.includes(unit._id);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedIds.filter(id => id !== unit._id);
    } else {
      newSelection = [...selectedIds, unit._id];
    }
    
    console.log("Selection changed:", { unitId: unit._id, isSelected, newSelection });
    setSelectedIds(newSelection);
    onChange(newSelection); // Send array of IDs to parent
  }, [selectedIds, onChange]);

  // Select all on current page
  const handleSelectCurrentPage = useCallback(() => {
    const currentPageIds = propertyUnits.map(unit => unit._id);
    const allSelectedCurrentPage = currentPageIds.every(id => selectedIds.includes(id));
    
    if (allSelectedCurrentPage) {
      const newSelection = selectedIds.filter(id => !currentPageIds.includes(id));
      setSelectedIds(newSelection);
      onChange(newSelection);
    } else {
      const newSelection = [...new Set([...selectedIds, ...currentPageIds])];
      setSelectedIds(newSelection);
      onChange(newSelection);
    }
  }, [propertyUnits, selectedIds, onChange]);

  // Select all units across all pages
  const handleSelectAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        limit: 10000,
      };
      
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });
      
      if (batchId && batchId !== 'null' && batchId !== 'undefined' && batchId !== '') {
        params.excludeBatch = batchId;
      }
      
      const response = await propertyUnitAPI.getPropertyUnits(params);
      if (response.data && response.data.success) {
        const allIds = response.data.data.map(unit => unit._id);
        setSelectedIds(allIds);
        onChange(allIds);
      }
    } catch (error) {
      console.error('Error selecting all:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, batchId, onChange]);

  // Clear all selections
  const handleClearAll = useCallback(() => {
    setSelectedIds([]);
    onChange([]);
  }, [onChange]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? '' : value
    }));
    setCurrentPage(1);
    setPropertyUnits([]);
  }, []);

  // Get selected units count
  const selectedCount = selectedIds.length;
  
  // Check if all items on current page are selected
  const allCurrentPageSelected = propertyUnits.length > 0 && 
    propertyUnits.every(unit => selectedIds.includes(unit._id));

  // Calculate displayed range
  const startRange = propertyUnits.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRange = Math.min(currentPage * pageSize, totalItems);
  const hasMore = currentPage < totalPages;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Select Property Units</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by title, city, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
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
        <div className="flex justify-between items-center mb-4 p-3 bg-blue-50 rounded-lg flex-wrap gap-2">
          <div>
            <span className="text-sm text-gray-600">
              Selected: <span className="font-semibold text-blue-700">{selectedCount}</span> units
            </span>
            <span className="text-sm text-gray-600 ml-4">
              Total Available: <span className="font-semibold">{totalItems}</span> units
            </span>
          </div>
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <button
              onClick={handleSelectCurrentPage}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              {allCurrentPageSelected ? 'Deselect Page' : 'Select Current Page'}
            </button>
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
            >
              Select All
            </button>
            {selectedCount > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Pagination Info */}
        <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {startRange} - {endRange} of {totalItems} units
          </div>
          <div>
            Page {currentPage} of {totalPages}
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
                    // CRITICAL: Check if this unit's ID is in selectedIds
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
                                {unit.specifications?.bedrooms || unit.unitTypes?.[0]?.type} Beds, {unit.specifications?.bathrooms || 1} Baths
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
                          ₹{(unit.price?.amount || unit.unitTypes?.[0]?.price?.amount || 0).toLocaleString()}
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

            {/* Load More Button */}
            {hasMore && (
              <div className="p-4 border-t border-gray-200 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    `Load More (${currentPage} of ${totalPages})`
                  )}
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
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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