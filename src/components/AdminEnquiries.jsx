import React, { useState, useEffect } from 'react';
import { 
  fetchAllEnquiries, 
  updateEnquiryStatus, 
  deleteEnquiry,
  fetchEnquiryStats,
  exportEnquiries 
} from '../api/adminApi';
import { useAuth } from '../context/AuthContext';

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    search: ''
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchEnquiries();
    fetchStats();
  }, [filters]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await fetchAllEnquiries(
        filters.page, 
        filters.limit, 
        filters.status, 
        filters.search
      );
      if (response.data.success) {
        setEnquiries(response.data.enquiries);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      setError('Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetchEnquiryStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching enquiry stats:', error);
    }
  };

  const handleStatusUpdate = async (enquiryId, newStatus) => {
    try {
      const response = await updateEnquiryStatus(enquiryId, newStatus);
      if (response.data.success) {
        setEnquiries(prev => 
          prev.map(enquiry => 
            enquiry._id === enquiryId 
              ? { ...enquiry, status: newStatus }
              : enquiry
          )
        );
      }
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      setError('Failed to update enquiry status');
    }
  };

  const handleDeleteEnquiry = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }

    try {
      const response = await deleteEnquiry(enquiryId);
      if (response.data.success) {
        setEnquiries(prev => prev.filter(enquiry => enquiry._id !== enquiryId));
      }
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      setError('Failed to delete enquiry');
    }
  };

  const handleExport = async (format) => {
    try {
      await exportEnquiries(format, '30d', filters.status);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export enquiries');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, length = 100) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading enquiries...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Enquiry Management</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                Manage and track all customer enquiries
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export JSON
              </button>
            </div>
          </div>
          
          {/* Stats Overview - Responsive Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.total || 0}</div>
              <div className="text-blue-800 text-sm md:text-base">Total Enquiries</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.new || 0}</div>
              <div className="text-yellow-800 text-sm md:text-base">New</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.resolved || 0}</div>
              <div className="text-green-800 text-sm md:text-base">Resolved</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-xl md:text-2xl font-bold text-gray-600">{stats.closed || 0}</div>
              <div className="text-gray-800 text-sm md:text-base">Closed</div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Filters - Mobile Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-between mb-2"
            >
              <span>Filter Options</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Filters Content */}
            <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-auto"
                >
                  <option value="">All Status</option>
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <input
                  type="text"
                  placeholder="Search enquiries..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 w-full"
                />
                <button
                  onClick={() => {
                    setFilters({
                      page: 1,
                      limit: 10,
                      status: '',
                      search: ''
                    });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg whitespace-nowrap"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enquiries List */}
        {enquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No enquiries found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name & Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enquiries.map((enquiry) => (
                      <tr key={enquiry._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {enquiry.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {enquiry.phoneNumber}
                          </div>
                          {enquiry.user && (
                            <div className="text-xs text-gray-400 mt-1">
                              User ID: {enquiry.user._id.substring(0, 8)}...
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md">
                            {enquiry.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(enquiry.status)}`}>
                            {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(enquiry.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              value={enquiry.status}
                              onChange={(e) => handleStatusUpdate(enquiry._id, e.target.value)}
                              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                              <option value="new">New</option>
                              <option value="in-progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                            <button
                              onClick={() => handleDeleteEnquiry(enquiry._id)}
                              className="text-red-600 hover:text-red-900 px-3 py-1.5 border border-red-200 hover:bg-red-50 rounded-md text-sm transition-colors"
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
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {enquiries.map((enquiry) => (
                <div key={enquiry._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{enquiry.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{enquiry.phoneNumber}</p>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                      </span>
                    </div>

                    {/* Message */}
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {truncateText(enquiry.message, 150)}
                    </div>

                    {/* Date & User Info */}
                    <div className="text-xs text-gray-500">
                      <div>Submitted: {formatDate(enquiry.createdAt)}</div>
                      {enquiry.user && (
                        <div className="mt-1">User: {enquiry.user._id.substring(0, 8)}...</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex flex-col gap-2">
                        <select
                          value={enquiry.status}
                          onChange={(e) => handleStatusUpdate(enquiry._id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full"
                        >
                          <option value="new">New</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Optional: Add view details functionality
                              alert(`Full Message:\n\n${enquiry.message}`);
                            }}
                            className="flex-1 text-blue-600 hover:text-blue-800 px-3 py-2 border border-blue-200 hover:bg-blue-50 rounded-md text-sm transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDeleteEnquiry(enquiry._id)}
                            className="flex-1 text-red-600 hover:text-red-900 px-3 py-2 border border-red-200 hover:bg-red-50 rounded-md text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {enquiries.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{enquiries.length}</span> of{' '}
                    <span className="font-medium">{stats.total || 0}</span> enquiries
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={filters.page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-700">
                      Page {filters.page}
                    </span>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={enquiries.length < filters.limit}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminEnquiries;