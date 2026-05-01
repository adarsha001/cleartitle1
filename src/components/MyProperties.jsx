import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  Edit, 
  Eye, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Filter,
  X,
  CheckSquare,
  RefreshCw,
  Home,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Heart,
  FileText,
  Grid,
  List,
  AlertCircle,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
  Hourglass,
  Shield,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { propertyService } from '../api/mypropertyApi';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPropertyForStatus, setSelectedPropertyForStatus] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filters, setFilters] = useState({
    listingType: '',
    propertyType: '',
    availability: '',
    approvalStatus: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    rented: 0,
    underAgreement: 0,
    hold: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch properties when dependencies change
  useEffect(() => {
    fetchProperties();
  }, [currentPage, filters, debouncedSearch, viewMode, statusFilter]);

  // Fetch statistics
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await propertyService.getUserProperties(currentPage, viewMode === 'grid' ? 9 : 5, {
        ...filters,
        search: debouncedSearch,
        availability: statusFilter !== 'all' && ['available', 'sold', 'rented', 'under-agreement', 'hold'].includes(statusFilter) ? statusFilter : '',
        approvalStatus: statusFilter !== 'all' && ['pending', 'approved', 'rejected'].includes(statusFilter) ? statusFilter : ''
      });
      
      setProperties(response.properties);
      setTotalPages(response.totalPages);
      setTotalProperties(response.total);
    } catch (error) {
      console.error('Error fetching properties:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch properties');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await propertyService.getUserProperties(1, 1000);
      const allProperties = response.properties;
      const available = allProperties.filter(p => p.availability === 'available').length;
      const sold = allProperties.filter(p => p.availability === 'sold').length;
      const rented = allProperties.filter(p => p.availability === 'rented').length;
      const underAgreement = allProperties.filter(p => p.availability === 'under-agreement').length;
      const hold = allProperties.filter(p => p.availability === 'hold').length;
      const pending = allProperties.filter(p => p.approvalStatus === 'pending').length;
      const approved = allProperties.filter(p => p.approvalStatus === 'approved').length;
      const rejected = allProperties.filter(p => p.approvalStatus === 'rejected').length;
      
      setStats({
        total: allProperties.length,
        available,
        sold,
        rented,
        underAgreement,
        hold,
        pending,
        approved,
        rejected
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await propertyService.deleteProperty(propertyId);
        toast.success('Property deleted successfully');
        
        setProperties(properties.filter(p => p._id !== propertyId));
        setSelectedProperties(selectedProperties.filter(id => id !== propertyId));
        setTotalProperties(prev => prev - 1);
        fetchStatistics();
        
        if (properties.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete property');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProperties.length === 0) {
      toast.error('Please select properties to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedProperties.length} properties? This action cannot be undone.`)) {
      try {
        await propertyService.bulkDeleteProperties(selectedProperties);
        toast.success(`${selectedProperties.length} properties deleted successfully`);
        
        setProperties(properties.filter(p => !selectedProperties.includes(p._id)));
        setSelectedProperties([]);
        setTotalProperties(prev => prev - selectedProperties.length);
        fetchStatistics();
        
        if (properties.length === selectedProperties.length && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete properties');
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProperties(properties.map(p => p._id));
    } else {
      setSelectedProperties([]);
    }
  };

  const handleSelectProperty = (propertyId) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      await propertyService.updatePropertyStatus(propertyId, newStatus);
      
      setProperties(properties.map(p => 
        p._id === propertyId ? { ...p, availability: newStatus } : p
      ));
      
      const statusMessages = {
        available: 'Property marked as Available',
        sold: 'Property marked as Sold',
        rented: 'Property marked as Rented',
        'under-agreement': 'Property marked as Under Agreement',
        hold: 'Property put on Hold'
      };
      
      toast.success(statusMessages[newStatus] || `Property status updated to ${newStatus.replace('-', ' ')}`);
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to update property status');
    }
  };

  const clearFilters = () => {
    setFilters({
      listingType: '',
      propertyType: '',
      availability: '',
      approvalStatus: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
    setStatusFilter('all');
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      sold: 'bg-red-100 text-red-800 border-red-200',
      rented: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'under-agreement': 'bg-blue-100 text-blue-800 border-blue-200',
      hold: 'bg-gray-100 text-gray-800 border-gray-200',
      'coming-soon': 'bg-purple-100 text-purple-800 border-purple-200',
      booked: 'bg-orange-100 text-orange-800 border-orange-200',
      reserved: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getApprovalStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getApprovalStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Hourglass className="w-3 h-3" />;
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'available': return <CheckSquare className="w-3 h-3" />;
      case 'sold': return <TrendingUp className="w-3 h-3" />;
      case 'rented': return <Home className="w-3 h-3" />;
      case 'under-agreement': return <FileText className="w-3 h-3" />;
      case 'hold': return <Clock className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { text: 'Available for Sale/Rent', bg: 'bg-green-50' },
      sold: { text: 'Sold Out', bg: 'bg-red-50' },
      rented: { text: 'Currently Rented', bg: 'bg-yellow-50' },
      'under-agreement': { text: 'Under Agreement', bg: 'bg-blue-50' },
      hold: { text: 'Temporarily on Hold', bg: 'bg-gray-50' }
    };
    return badges[status] || { text: status, bg: 'bg-gray-50' };
  };

  const getListingTypeLabel = (type) => {
    const labels = {
      sale: 'For Sale',
      rent: 'For Rent',
      lease: 'For Lease',
      pg: 'PG'
    };
    return labels[type] || type;
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPriceRange = (unitTypes) => {
    if (!unitTypes || unitTypes.length === 0) return 'Price on request';
    const prices = unitTypes.map(unit => unit.price?.amount || 0).filter(p => p > 0);
    if (prices.length === 0) return 'Price on request';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return formatPrice(min);
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  };

  const StatusUpdateModal = () => {
    if (!showStatusModal || !selectedPropertyForStatus) return null;
    
    const statusOptions = [
      { value: 'available', label: 'Available', color: 'green', description: 'Property is ready for sale or rent' },
      { value: 'sold', label: 'Sold', color: 'red', description: 'Property has been sold' },
      { value: 'rented', label: 'Rented', color: 'yellow', description: 'Property has been rented out' },
      { value: 'under-agreement', label: 'Under Agreement', color: 'blue', description: 'Property is under agreement or booking' },
      { value: 'hold', label: 'On Hold', color: 'gray', description: 'Property temporarily unavailable' }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 transform animate-scaleIn">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Update Property Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Updating status for: <strong>{selectedPropertyForStatus.title}</strong>
            </p>
            
            <div className="space-y-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleStatusChange(selectedPropertyForStatus._id, option.value);
                    setShowStatusModal(false);
                    setSelectedPropertyForStatus(null);
                  }}
                  className={`w-full p-4 border-2 rounded-lg transition-all hover:scale-105 ${
                    selectedPropertyForStatus.availability === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    {selectedPropertyForStatus.availability === option.value && (
                      <CheckSquare className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <StatusUpdateModal />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Properties</h1>
              <p className="mt-2 text-gray-600">Manage and track all your property listings</p>
            </div>
            <Link
              to="/add-listing"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add New Property
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition" onClick={() => setStatusFilter('all')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition" onClick={() => setStatusFilter('available')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition" onClick={() => setStatusFilter('sold')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Sold</p>
                <p className="text-2xl font-bold text-red-600">{stats.sold}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500 cursor-pointer hover:shadow-lg transition" onClick={() => setStatusFilter('rented')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rented</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.rented}</p>
              </div>
              <Home className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Approval Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500 cursor-pointer hover:shadow-lg transition" onClick={() => setStatusFilter('pending')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Hourglass className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-2 text-xs text-yellow-600">Awaiting review</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition" onClick={() => setStatusFilter('approved')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 text-xs text-green-600">Listings approved</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition" onClick={() => setStatusFilter('rejected')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <div className="mt-2 text-xs text-red-600">Requires modifications</div>
          </div>
        </div>

        {/* Active Status Filter Indicator */}
        {statusFilter !== 'all' && (
          <div className="mb-4 flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
              statusFilter === 'pending' || statusFilter === 'approved' || statusFilter === 'rejected'
                ? getApprovalStatusColor(statusFilter)
                : getStatusColor(statusFilter)
            }`}>
              {statusFilter === 'pending' || statusFilter === 'approved' || statusFilter === 'rejected'
                ? getApprovalStatusIcon(statusFilter)
                : getStatusIcon(statusFilter)
              }
              <span className="font-medium">
                Showing: {statusFilter === 'under-agreement' ? 'Under Agreement' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className="ml-2 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, city, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 border rounded-lg transition ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border rounded-lg transition ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(filters.listingType || filters.propertyType || filters.availability || filters.approvalStatus) && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Clear
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Type
                  </label>
                  <select
                    value={filters.listingType}
                    onChange={(e) => setFilters({ ...filters, listingType: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                    <option value="lease">For Lease</option>
                    <option value="pg">PG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Properties</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Studio">Studio</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial Space">Commercial Space</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Status
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                    <option value="under-agreement">Under Agreement</option>
                    <option value="hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Status
                  </label>
                  <select
                    value={filters.approvalStatus}
                    onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Approvals</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedProperties.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 flex justify-between items-center animate-slideDown">
            <div className="flex items-center gap-3">
              <span className="text-blue-800 font-medium">
                {selectedProperties.length} property{selectedProperties.length !== 1 ? 'ies' : ''} selected
              </span>
              <button
                onClick={() => setSelectedProperties([])}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear selection
              </button>
            </div>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        )}

        {/* Properties Display */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filters.listingType || filters.propertyType || filters.availability || filters.approvalStatus || statusFilter !== 'all'
                ? "No properties match your search criteria. Try adjusting your filters."
                : "You haven't added any properties yet. Start by adding your first property!"}
            </p>
            {(searchTerm || filters.listingType || filters.propertyType || filters.availability || filters.approvalStatus || statusFilter !== 'all') ? (
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/add-listing"
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Your First Property
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProperties.length === properties.length && properties.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-600">
                Select All ({properties.length})
              </label>
            </div>

            {/* Property Cards - Grid View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => {
                  const statusBadge = getStatusBadge(property.availability);
                  const approvalStatus = property.approvalStatus || 'pending';
                  return (
                    <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                      {/* Image */}
                      <div className="relative h-48">
                        {property.images && property.images[0] ? (
                          <img
                            src={property.images[0].url}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <Building className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Availability Status Badge */}
                        <div className={`absolute top-2 left-2 px-3 py-1.5 rounded-lg shadow-md ${statusBadge.bg} border-2 ${
                          property.availability === 'available' ? 'border-green-500' :
                          property.availability === 'sold' ? 'border-red-500' :
                          property.availability === 'rented' ? 'border-yellow-500' :
                          property.availability === 'under-agreement' ? 'border-blue-500' : 'border-gray-500'
                        }`}>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-xs font-semibold text-gray-700">{statusBadge.text}</div>
                              <div className="text-xs text-gray-500 capitalize">{property.availability?.replace('-', ' ')}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Approval Status Badge */}
                        <div className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg shadow-md ${getApprovalStatusColor(approvalStatus)} border-2 ${
                          approvalStatus === 'approved' ? 'border-green-500' :
                          approvalStatus === 'rejected' ? 'border-red-500' : 'border-yellow-500'
                        }`}>
                          <div className="flex items-center gap-2">
                            {getApprovalStatusIcon(approvalStatus)}
                            <div>
                              <div className="text-xs font-semibold text-gray-700 capitalize">{approvalStatus}</div>
                              <div className="text-xs text-gray-500">
                                {approvalStatus === 'approved' ? 'Listed' : approvalStatus === 'rejected' ? 'Action needed' : 'Under review'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {property.isFeatured && (
                          <div className="absolute bottom-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                            Featured
                          </div>
                        )}
                        
                        <div className="absolute bottom-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedProperties.includes(property._id)}
                            onChange={() => handleSelectProperty(property._id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 bg-white"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition truncate">
                          <Link to={`/property-units/${property._id}`}>{property.title}</Link>
                        </h3>
                        
                        <div className="flex items-center gap-1 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm truncate">{property.city}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {property.propertyType}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {getListingTypeLabel(property.listingType)}
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="text-2xl font-bold text-green-600">
                            {getPriceRange(property.unitTypes)}
                          </div>
                          {property.listingType === 'rent' && (
                            <div className="text-sm text-gray-500">per month</div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(property.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {property.viewCount || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {property.likes || 0}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/property-units/${property._id}`}
                            className="flex-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition flex items-center justify-center gap-1 border border-gray-300 rounded-lg hover:border-blue-600 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                          <Link
                            to={`/edit-property/${property._id}`}
                            className="flex-1 px-3 py-2 text-gray-700 hover:text-green-600 transition flex items-center justify-center gap-1 border border-gray-300 rounded-lg hover:border-green-600 text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedPropertyForStatus(property);
                              setShowStatusModal(true);
                            }}
                            className="px-3 py-2 text-gray-700 hover:text-blue-600 transition border border-gray-300 rounded-lg hover:border-blue-600 text-sm"
                          >
                            Status
                          </button>
                        </div>
                        
                        {/* Rejection Reason if rejected */}
                        {approvalStatus === 'rejected' && property.rejectionReason && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-red-800">Rejection Reason:</p>
                                <p className="text-xs text-red-600">{property.rejectionReason}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {properties.map((property) => {
                  const statusBadge = getStatusBadge(property.availability);
                  const approvalStatus = property.approvalStatus || 'pending';
                  return (
                    <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col md:flex-row">
                        {/* Checkbox */}
                        <div className="p-4 flex items-start">
                          <input
                            type="checkbox"
                            checked={selectedProperties.includes(property._id)}
                            onChange={() => handleSelectProperty(property._id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </div>

                        {/* Image */}
                        <div className="md:w-48 h-32 md:h-auto relative">
                          {property.images && property.images[0] ? (
                            <img
                              src={property.images[0].url}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <Building className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition">
                                  <Link to={`/property-units/${property._id}`}>{property.title}</Link>
                                </h3>
                                {/* Availability Status Indicator */}
                                <div className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getStatusColor(property.availability)}`}>
                                  {getStatusIcon(property.availability)}
                                  <span className="capitalize">{property.availability?.replace('-', ' ')}</span>
                                </div>
                                {/* Approval Status Indicator */}
                                <div className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getApprovalStatusColor(approvalStatus)}`}>
                                  {getApprovalStatusIcon(approvalStatus)}
                                  <span className="capitalize">{approvalStatus}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{property.address}, {property.city}</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {property.propertyType}
                                </span>
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                                  {getListingTypeLabel(property.listingType)}
                                </span>
                                {property.isVerified && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              
                              <div className="text-xl font-bold text-green-600">
                                {getPriceRange(property.unitTypes)}
                              </div>
                              
                              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(property.createdAt).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {property.viewCount || 0} views
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {property.likes || 0} likes
                                </div>
                              </div>
                              
                              {/* Rejection Reason if rejected */}
                              {approvalStatus === 'rejected' && property.rejectionReason && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <XCircle className="w-3 h-3 text-red-500 mt-0.5" />
                                    <p className="text-xs text-red-600">{property.rejectionReason}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t md:border-t-0 md:border-l border-gray-200 flex flex-row md:flex-col gap-2">
                          <Link
                            to={`/property-units/${property._id}`}
                            className="px-3 py-1.5 text-gray-700 hover:text-blue-600 transition flex items-center gap-1 border border-gray-300 rounded-lg hover:border-blue-600 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                          <Link
                            to={`/edit-property/${property._id}`}
                            className="px-3 py-1.5 text-gray-700 hover:text-green-600 transition flex items-center gap-1 border border-gray-300 rounded-lg hover:border-green-600 text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedPropertyForStatus(property);
                              setShowStatusModal(true);
                            }}
                            className="px-3 py-1.5 text-gray-700 hover:text-blue-600 transition flex items-center gap-1 border border-gray-300 rounded-lg hover:border-blue-600 text-sm"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Update Status
                          </button>
                          <button
                            onClick={() => handleDelete(property._id)}
                            className="px-3 py-1.5 text-gray-700 hover:text-red-600 transition flex items-center gap-1 border border-gray-300 rounded-lg hover:border-red-600 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MyProperties;