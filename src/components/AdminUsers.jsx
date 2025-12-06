import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [websiteStats, setWebsiteStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get all users with pagination and filters
  const getUsers = async (page = 1, search = '', website = 'all') => {
    setLoading(true);
    setError(null);
    try {
      // Check if user is admin (optional)
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (search) params.append('search', search);
      if (website !== 'all') params.append('sourceWebsite', website);

      // Make API call - Use /users endpoint (not /admin/users unless you have that route)
      const { data } = await API.get(`/admin/users?${params.toString()}`);

      if (data.success) {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || page);
        setTotalUsers(data.total || 0);
        console.log(data)
        if (data.websiteStats) {
          setWebsiteStats(data.websiteStats);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load users');
      
      // Handle specific errors
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to access this page');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get single user details
  const getUserDetails = async (userId) => {
    setLoadingUserDetails(true);
    try {
      // Use /users/:id endpoint
      const { data } = await API.get(`/admin/users/${userId}`);
      
      if (data.success) {
        setUserDetails(data.user);
      } else {
        throw new Error(data.message || 'Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert(error.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoadingUserDetails(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    getUsers(1, searchTerm, selectedWebsite);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      getUsers(newPage, searchTerm, selectedWebsite);
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    await getUserDetails(user._id);
  };

  const handlePropertyClick = (propertyId, e) => {
    e.stopPropagation();
    navigate(`/property/${propertyId}`);
  };

  const handleWebsiteFilter = (website) => {
    setSelectedWebsite(website);
    getUsers(1, searchTerm, website);
  };

  const formatPrice = (price) => {
    if (!price || price === "Price on Request") return "Price on Request";
    if (typeof price === 'number') return `₹${price.toLocaleString('en-IN')}`;
    return price;
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWebsiteBadgeColor = (website) => {
    switch (website) {
      case 'saimgroups':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cleartitle1':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'direct':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-red-800">Error Loading Users</h3>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
            <button
              onClick={() => getUsers()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">
                Manage users and view their liked properties
                {websiteStats && (
                  <span className="ml-2 text-sm text-gray-500">
                    • Total: {totalUsers} users
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => getUsers()}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Website Stats */}
        {websiteStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg mr-3">
                  <span className="text-purple-600 font-bold">S</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">SaimGroups Users</p>
                  <p className="text-xl font-bold">{websiteStats.saimgroups}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-3">
                  <span className="text-blue-600 font-bold">C</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ClearTitle1 Users</p>
                  <p className="text-xl font-bold">{websiteStats.cleartitle1}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="bg-gray-100 p-3 rounded-lg mr-3">
                  <span className="text-gray-600 font-bold">D</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Direct Users</p>
                  <p className="text-xl font-bold">{websiteStats.direct}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-3">
                  <span className="text-green-600 font-bold">M</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Multi-Website Users</p>
                  <p className="text-xl font-bold">{websiteStats.multiWebsite}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users by name, username, email, or type..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleWebsiteFilter('all')}
                className={`px-4 py-2 rounded-lg ${selectedWebsite === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All Websites
              </button>
              <button
                onClick={() => handleWebsiteFilter('saimgroups')}
                className={`px-4 py-2 rounded-lg ${selectedWebsite === 'saimgroups' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                SaimGroups
              </button>
              <button
                onClick={() => handleWebsiteFilter('cleartitle1')}
                className={`px-4 py-2 rounded-lg ${selectedWebsite === 'cleartitle1' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                ClearTitle1
              </button>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedWebsite('all');
                getUsers(1, '', 'all');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Users Grid */}
        {users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {user.name} {user.lastName}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getWebsiteBadgeColor(user.sourceWebsite)}`}>
                          {user.sourceWebsite}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm truncate">@{user.username}</p>
                      {user.userType && (
                        <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full capitalize ${
                          user.userType === 'admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : user.userType === 'agent'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.userType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{user.gmail}</span>
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{user.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.isAdmin && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Admin
                      </span>
                    )}
                    {user.isGoogleAuth && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        Google Auth
                      </span>
                    )}
                    {user.isVerified && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Verified
                      </span>
                    )}
                    {user.emailVerified && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Email Verified
                      </span>
                    )}
                  </div>

                  {/* Login Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {user.saimgroupsLoginCount > 0 && (
                      <div className="bg-purple-50 rounded-lg p-2">
                        <div className="text-sm font-medium text-purple-700">SaimGroups</div>
                        <div className="text-xs text-purple-600">{user.saimgroupsLoginCount} logins</div>
                        {user.saimgroupsLastLogin && (
                          <div className="text-xs text-purple-500 mt-1">
                            Last: {formatDate(user.saimgroupsLastLogin)}
                          </div>
                        )}
                      </div>
                    )}
                    {user.cleartitle1LoginCount > 0 && (
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-sm font-medium text-blue-700">ClearTitle1</div>
                        <div className="text-xs text-blue-600">{user.cleartitle1LoginCount} logins</div>
                        {user.cleartitle1LastLogin && (
                          <div className="text-xs text-blue-500 mt-1">
                            Last: {formatDate(user.cleartitle1LastLogin)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-blue-600">{user.likedPropertiesCount || 0}</div>
                      <div className="text-sm text-blue-800">Favorites</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xl font-bold text-green-600">{user.postedPropertiesCount || 0}</div>
                      <div className="text-sm text-green-800">Listed</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    <p>Joined {formatDate(user.createdAt)}</p>
                    {user.lastLogin && (
                      <p className="mt-1">Last active: {formatDate(user.lastLogin)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedUser.name} {selectedUser.lastName}
                    <span className="ml-3 text-sm font-normal text-gray-500">@{selectedUser.username}</span>
                  </h2>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setUserDetails(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {loadingUserDetails ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading user details...</p>
                  </div>
                ) : userDetails ? (
                  <>
                    {/* User Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                      {/* Basic Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Full Name</label>
                            <p className="text-gray-900">{userDetails.name} {userDetails.lastName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Username</label>
                            <p className="text-gray-900">@{userDetails.username}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="text-gray-900">{userDetails.gmail}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="text-gray-900">{userDetails.phoneNumber}</p>
                            {userDetails.alternativePhoneNumber && (
                              <p className="text-gray-700 text-sm mt-1">Alt: {userDetails.alternativePhoneNumber}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">User Type</label>
                            <p className="text-gray-900 capitalize">{userDetails.userType}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Source Website</label>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-3 py-1 rounded-full text-sm ${getWebsiteBadgeColor(userDetails.sourceWebsite)}`}>
                                {userDetails.sourceWebsite}
                              </span>
                              {userDetails.isMultiWebsiteUser && (
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                  Multi-Website User
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Activity & Verification */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Activity & Verification</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-3 border">
                              <div className="text-sm text-gray-600">Member Since</div>
                              <div className="font-medium">{formatDate(userDetails.createdAt)}</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border">
                              <div className="text-sm text-gray-600">Last Updated</div>
                              <div className="font-medium">{formatDate(userDetails.updatedAt)}</div>
                            </div>
                          </div>
                     

                          <div className="grid grid-cols-2 gap-4">
                            <div className={`rounded-lg p-3 ${userDetails.isVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${userDetails.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                <span className="text-sm font-medium">Account Verified</span>
                              </div>
                              {userDetails.verificationDate && (
                                <div className="text-xs mt-1">
                                  Verified on {formatDate(userDetails.verificationDate)}
                                </div>
                              )}
                            </div>
                            <div className={`rounded-lg p-3 ${userDetails.emailVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${userDetails.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                <span className="text-sm font-medium">Email Verified</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Website Activity */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Website Activity</h3>
                        <div className="space-y-4">
                          {userDetails.websiteLogins?.saimgroups?.hasLoggedIn && (
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-purple-700">SaimGroups</span>
                                <span className="text-purple-600 font-bold">
                                  {userDetails.websiteLogins.saimgroups.loginCount} logins
                                </span>
                              </div>
                              <div className="text-xs text-purple-600 space-y-1">
                                <div>First: {formatDate(userDetails.websiteLogins.saimgroups.firstLogin)}</div>
                                <div>Last: {formatDate(userDetails.websiteLogins.saimgroups.lastLogin)}</div>
                              </div>
                            </div>
                          )}
                          {userDetails.websiteLogins?.cleartitle1?.hasLoggedIn && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-blue-700">ClearTitle1</span>
                                <span className="text-blue-600 font-bold">
                                  {userDetails.websiteLogins.cleartitle1.loginCount} logins
                                </span>
                              </div>
                              <div className="text-xs text-blue-600 space-y-1">
                                <div>First: {formatDate(userDetails.websiteLogins.cleartitle1.firstLogin)}</div>
                                <div>Last: {formatDate(userDetails.websiteLogins.cleartitle1.lastLogin)}</div>
                              </div>
                            </div>
                          )}
                          <div className="bg-white rounded-lg p-3 border">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Google Authentication</span>
                              <span className={`px-2 py-1 rounded text-xs ${userDetails.isGoogleAuth ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {userDetails.isGoogleAuth ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                            {userDetails.googleId && (
                              <div className="text-xs text-gray-500 mt-1">
                                Google ID: {userDetails.googleId.substring(0, 20)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Business & Personal Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Business Information */}
                      <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                        <div className="space-y-3">
                          {userDetails.company && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Company</label>
                              <p className="text-gray-900">{userDetails.company}</p>
                            </div>
                          )}
                          {userDetails.occupation && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Occupation</label>
                              <p className="text-gray-900">{userDetails.occupation}</p>
                            </div>
                          )}
                          {userDetails.specialization && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Specialization</label>
                              <p className="text-gray-900">{userDetails.specialization}</p>
                            </div>
                          )}
                          {userDetails.officeAddress && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Office Address</label>
                              <p className="text-gray-900">{userDetails.officeAddress}</p>
                            </div>
                          )}
                          {userDetails.website && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Website</label>
                              <a href={userDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {userDetails.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                        <div className="space-y-3">
                          {userDetails.dateOfBirth && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                              <p className="text-gray-900">{formatDate(userDetails.dateOfBirth)}</p>
                            </div>
                          )}
                          {userDetails.preferredLocation && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Preferred Location</label>
                              <p className="text-gray-900">{userDetails.preferredLocation}</p>
                            </div>
                          )}
                          {userDetails.languages && userDetails.languages.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Languages</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {userDetails.languages.map((lang, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {userDetails.interests && userDetails.interests.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Interests</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {userDetails.interests.map((interest, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {userDetails.about && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">About</label>
                              <p className="text-gray-900 mt-1">{userDetails.about}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Properties Section */}
                    <div className="space-y-8">
                      {/* Liked Properties */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4">
                          Liked Properties ({userDetails.likedProperties?.length || 0})
                        </h3>
                        {(!userDetails.likedProperties || userDetails.likedProperties.length === 0) ? (
                          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No liked properties</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userDetails.likedProperties.map((property) => (
                              <div 
                                key={property._id} 
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                                onClick={(e) => handlePropertyClick(property._id, e)}
                              >
                                <div className="flex items-start space-x-4">
                                  <img
                                    src={property.images?.[0]?.url || "https://via.placeholder.com/80x60?text=No+Image"}
                                    alt={property.title}
                                    className="w-20 h-16 object-cover rounded flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 hover:text-blue-600">
                                      {property.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {property.city} • {property.category}
                                    </p>
                                    <p className="text-blue-700 font-bold mt-1">
                                      {formatPrice(property.price)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        property.approvalStatus === 'approved' 
                                          ? 'bg-green-100 text-green-800'
                                          : property.approvalStatus === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {property.approvalStatus}
                                      </span>
                                      {property.isVerified && (
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                          Verified
                                        </span>
                                      )}
                                      {property.likedAt && (
                                        <span className="text-xs text-gray-500">
                                          Liked {formatDate(property.likedAt)}
                                        </span>
                                      )}
                                    </div>
                                    {property.createdBy && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Listed by: {property.createdBy.name} (@{property.createdBy.username})
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Posted Properties */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4">
                          Listed Properties ({userDetails.postedProperties?.length || 0})
                        </h3>
                        {(!userDetails.postedProperties || userDetails.postedProperties.length === 0) ? (
                          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">No listed properties</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userDetails.postedProperties.map((property) => (
                              <div 
                                key={property._id} 
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                                onClick={(e) => handlePropertyClick(property._id, e)}
                              >
                                <div className="flex items-start space-x-4">
                                  <img
                                    src={property.images?.[0]?.url || "https://via.placeholder.com/80x60?text=No+Image"}
                                    alt={property.title}
                                    className="w-20 h-16 object-cover rounded flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 hover:text-blue-600">
                                      {property.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {property.city} • {property.category}
                                    </p>
                                    <p className="text-blue-700 font-bold mt-1">
                                      {formatPrice(property.price)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        property.approvalStatus === 'approved' 
                                          ? 'bg-green-100 text-green-800'
                                          : property.approvalStatus === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {property.approvalStatus}
                                      </span>
                                      {property.isFeatured && (
                                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                          Featured
                                        </span>
                                      )}
                                      {property.postedAt && (
                                        <span className="text-xs text-gray-500">
                                          Posted {formatDate(property.postedAt)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Unable to load user details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;