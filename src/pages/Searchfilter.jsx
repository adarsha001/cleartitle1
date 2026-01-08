// pages/Home.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProperties } from "../api/axios";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Filter states - Expanded to include all properties
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    floors: "",
    minSquare: "",
    maxSquare: "",
    propertyLabel: "",
    minROI: "",
    forSale: "",
    isFeatured: "",
    isVerified: "",
    hasGarden: "",
    hasBalcony: "",
    hasIrrigation: "",
    features: [],
    nearby: [],
    distanceKey: ""
  });

  // Available options for filters
  const filterOptions = {
    categories: ["Residential", "Commercial", "Industrial", "Agricultural", "Land"],
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"],
    bedrooms: ["1", "2", "3", "4", "5+"],
    bathrooms: ["1", "2", "3", "4", "5+"],
    floors: ["1", "2", "3", "4", "5+"],
    propertyLabels: ["Luxury", "Budget", "Eco-Friendly", "Modern", "Traditional", "Fixer-Upper"],
    features: [
      "Wifi", "Parking", "Swimming pool", "Balcony", "Garden", 
      "Security", "Fitness center", "Children's Play Area", "Laundry Room",
      "Pets Allow", "Spa & Massage", "Electricity", "Gated Community",
      "Street Lamp", "Drainage", "Tennis Court", "Lift(s)", "Golf Course",
      "Jogging Track", "Club House", "Senior Citizen Siteout", "Squash Court",
      "Yoga / Meditation Area", "bore water", "Mini Theatre"
    ],
    nearbyOptions: ["Hospital", "SuperMarket", "School", "Airport", "BusStop", "Pharmacy", "Metro"]
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setError(null);
        const res = await getAllProperties();
        setProperties(res.data);
        setFilteredProperties(res.data);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Failed to load properties. Please check if the server is running.");
        setProperties([]);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [filters, properties]);

  const filterProperties = () => {
    let filtered = [...properties];

    // Search filter (title, description, content, city, propertyLocation)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(property => 
        property.title?.toLowerCase().includes(searchTerm) ||
        property.description?.toLowerCase().includes(searchTerm) ||
        property.content?.toLowerCase().includes(searchTerm) ||
        property.city?.toLowerCase().includes(searchTerm) ||
        property.propertyLocation?.toLowerCase().includes(searchTerm)
      );
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter(property => 
        property.city?.toLowerCase() === filters.city.toLowerCase()
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(property => 
        property.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(property => 
        property.price >= parseInt(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => 
        property.price <= parseInt(filters.maxPrice)
      );
    }

    // Bedrooms filter
    if (filters.bedrooms) {
      if (filters.bedrooms === "5+") {
        filtered = filtered.filter(property => 
          property.attributes?.bedrooms >= 5
        );
      } else {
        filtered = filtered.filter(property => 
          property.attributes?.bedrooms === parseInt(filters.bedrooms)
        );
      }
    }

    // Bathrooms filter
    if (filters.bathrooms) {
      if (filters.bathrooms === "5+") {
        filtered = filtered.filter(property => 
          property.attributes?.bathrooms >= 5
        );
      } else {
        filtered = filtered.filter(property => 
          property.attributes?.bathrooms === parseInt(filters.bathrooms)
        );
      }
    }

    // Floors filter
    if (filters.floors) {
      if (filters.floors === "5+") {
        filtered = filtered.filter(property => 
          property.attributes?.floors >= 5
        );
      } else {
        filtered = filtered.filter(property => 
          property.attributes?.floors === parseInt(filters.floors)
        );
      }
    }

    // Square footage filter
    if (filters.minSquare) {
      filtered = filtered.filter(property => 
        property.attributes?.square >= parseInt(filters.minSquare)
      );
    }
    if (filters.maxSquare) {
      filtered = filtered.filter(property => 
        property.attributes?.square <= parseInt(filters.maxSquare)
      );
    }

    // Property Label filter
    if (filters.propertyLabel) {
      filtered = filtered.filter(property => 
        property.attributes?.propertyLabel?.toLowerCase() === filters.propertyLabel.toLowerCase()
      );
    }

    // ROI filter
    if (filters.minROI) {
      filtered = filtered.filter(property => 
        property.attributes?.expectedROI >= parseInt(filters.minROI)
      );
    }

    // Boolean attributes filters
    if (filters.hasGarden !== "") {
      filtered = filtered.filter(property => 
        property.attributes?.garden === (filters.hasGarden === "true")
      );
    }

    if (filters.hasBalcony !== "") {
      filtered = filtered.filter(property => 
        property.attributes?.balcony === (filters.hasBalcony === "true")
      );
    }

    if (filters.hasIrrigation !== "") {
      filtered = filtered.filter(property => 
        property.attributes?.irrigationAvailable === (filters.hasIrrigation === "true")
      );
    }

    // For Sale/Lease filter
    if (filters.forSale !== "") {
      filtered = filtered.filter(property => 
        property.forSale === (filters.forSale === "true")
      );
    }

    // Featured filter
    if (filters.isFeatured !== "") {
      filtered = filtered.filter(property => 
        property.isFeatured === (filters.isFeatured === "true")
      );
    }

    // Verified filter
    if (filters.isVerified !== "") {
      filtered = filtered.filter(property => 
        property.isVerified === (filters.isVerified === "true")
      );
    }

    // Features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(property =>
        filters.features.every(feature => 
          property.features?.includes(feature)
        )
      );
    }

    // Nearby filter
    if (filters.nearby.length > 0) {
      filtered = filtered.filter(property =>
        filters.nearby.every(nearbyItem => 
          property.nearby?.[nearbyItem]
        )
      );
    }

    // Distance Key filter
    if (filters.distanceKey) {
      filtered = filtered.filter(property =>
        property.distanceKey?.some(item => 
          item.toLowerCase().includes(filters.distanceKey.toLowerCase())
        )
      );
    }

    setFilteredProperties(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleNearbyToggle = (nearbyItem) => {
    setFilters(prev => ({
      ...prev,
      nearby: prev.nearby.includes(nearbyItem)
        ? prev.nearby.filter(n => n !== nearbyItem)
        : [...prev.nearby, nearbyItem]
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      city: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      floors: "",
      minSquare: "",
      maxSquare: "",
      propertyLabel: "",
      minROI: "",
      forSale: "",
      isFeatured: "",
      isVerified: "",
      hasGarden: "",
      hasBalcony: "",
      hasIrrigation: "",
      features: [],
      nearby: [],
      distanceKey: ""
    });
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    const fetchProperties = async () => {
      try {
        const res = await getAllProperties();
        setProperties(res.data);
        setFilteredProperties(res.data);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Failed to load properties. Please check if the server is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Properties</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={retryFetch}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Search Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Property
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Discover the perfect place to call home
            </p>
          </div>

          {/* Main Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-2">
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Search by location, property type, features, or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="flex-1 p-4 text-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Basic Filters */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Location & Type</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange("city", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Cities</option>
                    {filterOptions.cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Label</label>
                  <select
                    value={filters.propertyLabel}
                    onChange={(e) => handleFilterChange("propertyLabel", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Any Label</option>
                    {filterOptions.propertyLabels.map(label => (
                      <option key={label} value={label}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Size */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Price & Size</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Square Ft</label>
                    <input
                      type="number"
                      placeholder="Min sq.ft"
                      value={filters.minSquare}
                      onChange={(e) => handleFilterChange("minSquare", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Square Ft</label>
                    <input
                      type="number"
                      placeholder="Max sq.ft"
                      value={filters.maxSquare}
                      onChange={(e) => handleFilterChange("maxSquare", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min ROI %</label>
                  <input
                    type="number"
                    placeholder="Min ROI"
                    value={filters.minROI}
                    onChange={(e) => handleFilterChange("minROI", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Rooms & Floors */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Rooms & Floors</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Any</option>
                    {filterOptions.bedrooms.map(bed => (
                      <option key={bed} value={bed}>{bed} {bed === "5+" ? "+" : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                  <select
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange("bathrooms", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Any</option>
                    {filterOptions.bathrooms.map(bath => (
                      <option key={bath} value={bath}>{bath} {bath === "5+" ? "+" : ""}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
                  <select
                    value={filters.floors}
                    onChange={(e) => handleFilterChange("floors", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Any</option>
                    {filterOptions.floors.map(floor => (
                      <option key={floor} value={floor}>{floor} {floor === "5+" ? "+" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 border-b pb-2">Status & Features</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    value={filters.forSale}
                    onChange={(e) => handleFilterChange("forSale", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Types</option>
                    <option value="true">For Sale</option>
                    <option value="false">For Lease</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filters.isFeatured}
                    onChange={(e) => handleFilterChange("isFeatured", e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Properties</option>
                    <option value="true">Featured Only</option>
                  </select>

                  <select
                    value={filters.isVerified}
                    onChange={(e) => handleFilterChange("isVerified", e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Properties</option>
                    <option value="true">Verified Only</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasGarden === "true"}
                      onChange={(e) => handleFilterChange("hasGarden", e.target.checked ? "true" : "")}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Has Garden</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasBalcony === "true"}
                      onChange={(e) => handleFilterChange("hasBalcony", e.target.checked ? "true" : "")}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Has Balcony</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasIrrigation === "true"}
                      onChange={(e) => handleFilterChange("hasIrrigation", e.target.checked ? "true" : "")}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Irrigation Available</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {/* Features */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Property Features</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {filterOptions.features.map(feature => (
                    <label key={feature} className="flex items-center space-x-2 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={filters.features.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Nearby */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Nearby Amenities</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {filterOptions.nearbyOptions.map(nearby => (
                    <label key={nearby} className="flex items-center space-x-2 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={filters.nearby.includes(nearby)}
                        onChange={() => handleNearbyToggle(nearby)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{nearby}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Distance Key Search */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Distance Highlights</h4>
                <input
                  type="text"
                  placeholder="Search in distance highlights..."
                  value={filters.distanceKey}
                  onChange={(e) => handleFilterChange("distanceKey", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md mb-4"
                />
                
                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-300 transition-colors font-medium"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {filteredProperties.length} Properties Found
          </h2>
          <span className="text-gray-600 text-sm">
            {filteredProperties.length === properties.length ? 
              "Showing all properties" : 
              "Filtered results"
            }
          </span>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <div
                key={property._id}
                onClick={() => handlePropertyClick(property._id)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer transform hover:-translate-y-1 duration-200"
              >
                {property.images?.[0] && (
                  <img
                    src={property.images[0].url}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">{property.title}</h3>
                    <div className="flex gap-1">
                      {property.isFeatured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          ⭐
                        </span>
                      )}
                      {property.isVerified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          ✔
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{property.city} • {property.category}</p>
                  {property.price && (
                    <p className="text-green-600 font-bold text-lg mb-3">
                      ₹{typeof property.price === "number" ? property.price.toLocaleString() : property.price}
                      <span className="text-gray-500 text-sm font-normal ml-1">
                        ({property.forSale ? "For Sale" : "For Lease"})
                      </span>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    {property.attributes?.bedrooms && <span>🛏️ {property.attributes.bedrooms} beds</span>}
                    {property.attributes?.bathrooms && <span>🚿 {property.attributes.bathrooms} baths</span>}
                    {property.attributes?.floors && <span>🏢 {property.attributes.floors} floors</span>}
                    {property.attributes?.square && <span>📏 {property.attributes.square} sq.ft</span>}
                  </div>
                  {property.attributes?.propertyLabel && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                      {property.attributes.propertyLabel}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-gray-600 text-lg mb-2">No properties found</p>
            <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={resetFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}