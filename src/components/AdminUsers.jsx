import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllUsers, fetchUserById } from '../api/adminApi';
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
  const navigate = useNavigate();

  const getUsers = async (page = 1, search = '', website = 'all') => {
    setLoading(true);
    try {
      let url = `/users/all-with-likes?page=${page}&limit=10`;
      if (search) url += `&search=${search}`;
      if (website !== 'all') url += `&sourceWebsite=${website}`;
      
      const { data } = await API.get(url);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setTotalUsers(data.total);
      if (data.websiteStats) {
        setWebsiteStats(data.websiteStats);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users');
    } finally {
      setLoading(false);
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
    setCurrentPage(newPage);
    getUsers(newPage, searchTerm, selectedWebsite);
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setLoadingUserDetails(true);
    
    try {
      const { data } = await API.get(`/users/${user._id}`);
      setUserDetails(data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Error loading user details');
    } finally {
      setLoadingUserDetails(false);
    }
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
    if (typeof price === 'number') return `₹${price.toLocaleString()}`;
    return price;
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWebsiteBadgeColor = (website) => {
    switch (website) {
      case 'saimgroups':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cleartitle1':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUserStats = (user) => {
    return {
      isMultiWebsite: user.isMultiWebsiteUser || false,
      saimgroupsLogins: user.saimgroupsLoginCount || 0,
      cleartitle1Logins: user.cleartitle1LoginCount || 0,
      lastLoginSaimgroups: user.saimgroupsLastLogin,
      lastLoginCleartitle1: user.cleartitle1LastLogin,
    };
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const stats = getUserStats(user);
            return (
              <div
                key={user._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleUserClick(user)}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
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
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{user.gmail}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="truncate">{user.phoneNumber}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    user.userType === 'admin' 
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.userType}
                  </span>
                  {user.isAdmin && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Admin
                    </span>
                  )}
                  {user.isGoogleAuth && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      Google
                    </span>
                  )}
                  {stats.isMultiWebsite && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Multi-Website
                    </span>
                  )}
                </div>

                {/* Website Login Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {stats.saimgroupsLogins > 0 && (
                    <div className="bg-purple-50 rounded-lg p-2">
                      <div className="text-sm font-medium text-purple-700">SaimGroups</div>
                      <div className="text-xs text-purple-600">{stats.saimgroupsLogins} logins</div>
                      {stats.lastLoginSaimgroups && (
                        <div className="text-xs text-purple-500 mt-1">
                          Last: {formatDate(stats.lastLoginSaimgroups)}
                        </div>
                      )}
                    </div>
                  )}
                  {stats.cleartitle1Logins > 0 && (
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="text-sm font-medium text-blue-700">ClearTitle1</div>
                      <div className="text-xs text-blue-600">{stats.cleartitle1Logins} logins</div>
                      {stats.lastLoginCleartitle1 && (
                        <div className="text-xs text-blue-500 mt-1">
                          Last: {formatDate(stats.lastLoginCleartitle1)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xl font-bold text-blue-600">{user.likedPropertiesCount}</div>
                    <div className="text-sm text-blue-800">Favorites</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xl font-bold text-green-600">{user.postedPropertiesCount}</div>
                    <div className="text-sm text-green-800">Listed</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Joined {formatDate(user.createdAt)}
                  </p>
                  {user.lastLogin && (
                    <p className="text-xs text-gray-500">
                      Last active: {formatDate(user.lastLogin)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
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
                ) : (
                  <>
                    {/* User Info Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                      {/* Basic Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="text-gray-900">{userDetails?.gmail || selectedUser.gmail}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="text-gray-900">{userDetails?.phoneNumber || selectedUser.phoneNumber}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">User Type</label>
                            <p className="text-gray-900 capitalize">{userDetails?.userType || selectedUser.userType}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Source Website</label>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-3 py-1 rounded-full text-sm ${getWebsiteBadgeColor(userDetails?.sourceWebsite || selectedUser.sourceWebsite)}`}>
                                {userDetails?.sourceWebsite || selectedUser.sourceWebsite}
                              </span>
                              {userDetails?.isMultiWebsiteUser && (
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                  Multi-Website User
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Website Activity */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Website Activity</h3>
                        <div className="space-y-4">
                          {userDetails?.websiteLogins?.saimgroups?.hasLoggedIn && (
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-purple-700">SaimGroups</span>
                                <span className="text-purple-600 font-bold">
                                  {userDetails.websiteLogins.saimgroups.loginCount} logins
                                </span>
                              </div>
                              <div className="text-xs text-purple-500 mt-2">
                                <div>First: {formatDate(userDetails.websiteLogins.saimgroups.firstLogin)}</div>
                                <div>Last: {formatDate(userDetails.websiteLogins.saimgroups.lastLogin)}</div>
                              </div>
                            </div>
                          )}
                          {userDetails?.websiteLogins?.cleartitle1?.hasLoggedIn && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-blue-700">ClearTitle1</span>
                                <span className="text-blue-600 font-bold">
                                  {userDetails.websiteLogins.cleartitle1.loginCount} logins
                                </span>
                              </div>
                              <div className="text-xs text-blue-500 mt-2">
                                <div>First: {formatDate(userDetails.websiteLogins.cleartitle1.firstLogin)}</div>
                                <div>Last: {formatDate(userDetails.websiteLogins.cleartitle1.lastLogin)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Activity Summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Favorite Properties</span>
                            <span className="font-bold text-blue-600">{userDetails?.likedPropertiesCount || selectedUser.likedPropertiesCount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Listed Properties</span>
                            <span className="font-bold text-green-600">{userDetails?.postedPropertiesCount || selectedUser.postedPropertiesCount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Member Since</span>
                            <span className="font-medium">{formatDate(userDetails?.createdAt || selectedUser.createdAt)}</span>
                          </div>
                          {userDetails?.lastLogin && (
                            <div className="flex justify-between items-center">
                              <span>Last Login</span>
                              <span className="font-medium">{formatDate(userDetails.lastLogin)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Liked Properties */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">
                        Liked Properties ({userDetails?.likedProperties?.length || selectedUser.likedPropertiesCount})
                      </h3>
                      {(!userDetails?.likedProperties || userDetails.likedProperties.length === 0) ? (
                        <p className="text-gray-500 text-center py-4">No liked properties</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userDetails.likedProperties.map((property) => (
                            <div 
                              key={property._id} 
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
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
                                  </div>
                                  {property.likedAt && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Liked {formatDate(property.likedAt)}
                                    </p>
                                  )}
                                  <p className="text-xs text-blue-600 mt-1 font-medium">
                                    Click to view property details →
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
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