import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchClickAnalytics, 
  fetchClickStatsByType, 
  fetchPopularClicks, 
  fetchClickTrends, 
  exportClickData,
  fetchUserAnalytics,
  fetchHourlyDistribution
} from '../api/adminApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const AdminClickAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState({
    itemType: '',
    dateRange: ''
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  const itemTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'website', label: 'Website' },
    { value: 'location', label: 'Location' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, filters]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUserAnalyticsData();
    }
  }, [activeTab, timeframe]);

  const fetchUserAnalyticsData = async () => {
    try {
      setUserLoading(true);
      const response = await fetchUserAnalytics(timeframe);
    //('👤 User analytics response:', response);
      if (response.success) {
        setUserAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setUserLoading(false);
    }
  };

  // Safe data extraction with fallbacks
  const getSummaryData = () => {
    if (!analytics) {
      return {
        totalClicks: 0,
        uniqueItemsCount: 0,
        uniqueUsersCount: 0,
        uniqueSessionsCount: 0,
        loggedInUsersCount: 0,
        anonymousUsersCount: 0,
        avgClicksPerItem: 0
      };
    }

    if (analytics.summary) {
      return analytics.summary;
    }
    
    if (analytics.totalClicks !== undefined) {
      return analytics;
    }
    
    return {
      totalClicks: analytics.totalClicks || 0,
      uniqueItemsCount: analytics.uniqueItemsCount || 0,
      uniqueUsersCount: analytics.uniqueUsersCount || 0,
      uniqueSessionsCount: analytics.uniqueSessionsCount || 0,
      loggedInUsersCount: analytics.loggedInUsersCount || 0,
      anonymousUsersCount: analytics.anonymousUsersCount || 0,
      avgClicksPerItem: analytics.avgClicksPerItem || 0
    };
  };

  const getClicksByType = () => {
    return analytics?.clicksByType || analytics?.data?.clicksByType || [];
  };

  const getPopularClicks = () => {
    return analytics?.popularClicks || analytics?.data?.popularClicks || [];
  };

  const getDailyTrends = () => {
    return analytics?.dailyTrends || analytics?.data?.dailyTrends || [];
  };

  const getUserEngagement = () => {
    if (userAnalytics?.users) {
      return userAnalytics.users;
    }
    return analytics?.userEngagement || analytics?.data?.userEngagement || [];
  };

  const getLoggedInUsers = () => {
    return analytics?.summary?.loggedInUsers || analytics?.data?.summary?.loggedInUsers || [];
  };

  // Memoized calculations for better performance
  const summary = useMemo(() => getSummaryData(), [analytics]);
  const clicksByType = useMemo(() => getClicksByType(), [analytics]);
  const popularClicks = useMemo(() => getPopularClicks(), [analytics]);
  const dailyTrends = useMemo(() => getDailyTrends(), [analytics]);
  const userEngagement = useMemo(() => getUserEngagement(), [analytics, userAnalytics]);
  const loggedInUsers = useMemo(() => getLoggedInUsers(), [analytics]);

  const topPerformers = useMemo(() => {
    return popularClicks.slice(0, 10);
  }, [popularClicks]);

  const totalClicksByType = useMemo(() => {
    return clicksByType.reduce((sum, item) => sum + (item.totalClicks || 0), 0);
  }, [clicksByType]);

  const conversionRate = useMemo(() => {
    const totalClicks = summary.totalClicks;
    const uniqueUsers = summary.uniqueUsersCount;
    return uniqueUsers > 0 ? ((totalClicks / uniqueUsers) * 100).toFixed(1) : 0;
  }, [summary]);

  const userEngagementRate = useMemo(() => {
    const loggedInClicks = userEngagement.reduce((sum, user) => sum + (user.totalClicks || 0), 0);
    const totalClicks = summary.totalClicks;
    return totalClicks > 0 ? ((loggedInClicks / totalClicks) * 100).toFixed(1) : 0;
  }, [userEngagement, summary]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchClickAnalytics(timeframe, filters.itemType);
    //('📊 Analytics response:', response);
      
      if (response.data && response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setAnalytics(response.data || response);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatUserName = (user) => {
    if (!user || (!user.userName && !user.name)) return 'Anonymous';
    return user.userName || user.name || 'Unknown User';
  };

  const UserTypeBadge = ({ user }) => {
    if (!user || (!user.userId && !user.id)) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Anonymous
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Logged In
      </span>
    );
  };

  // Get user initials for avatar
  const getUserInitials = (user) => {
    if (!user) return 'A';
    const name = user.userName || user.name || '';
    return name.charAt(0).toUpperCase() || 'U';
  };

  // Get user ID for display
  const getUserId = (user) => {
    return user?.userId || user?.id || 'Anonymous';
  };

// Get unique key for user - handles anonymous users properly
const getUserKey = (user, index) => {
  // For logged-in users, use their actual ID
  if (user?.userId || user?.id) {
    return user.userId || user.id;
  }
  
  // For anonymous users, create a unique key using sessionId + timestamp
  // This ensures each anonymous session has a unique key
  const sessionPart = user?.sessionId ? user.sessionId.substring(0, 8) : 'no-session';
  const timestampPart = user?.timestamp ? new Date(user.timestamp).getTime() : index;
  
  return `anonymous-${sessionPart}-${timestampPart}`;
};
  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      
      if (format === 'excel') {
        await exportToExcel();
      } else if (format === 'json') {
        await exportToJson();
      } else {
        await exportClickData(format, timeframe);
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Summary Sheet
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Clicks', summary.totalClicks],
        ['Unique Items', summary.uniqueItemsCount],
        ['Unique Users', summary.uniqueUsersCount],
        ['Logged-in Users', summary.loggedInUsersCount || 0],
        ['Anonymous Users', summary.anonymousUsersCount || 0],
        ['Average Clicks Per Item', Math.round(summary.avgClicksPerItem)],
        ['Timeframe', timeframe],
        ['Generated On', new Date().toLocaleString()]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Clicks by Type Sheet
      const typeData = [
        ['Item Type', 'Total Clicks', 'Unique Items', 'Average Clicks']
      ];
      clicksByType.forEach(item => {
        typeData.push([
          item.itemType,
          item.totalClicks,
          item.uniqueItemsCount,
          Math.round(item.avgClicksPerItem)
        ]);
      });
      const typeSheet = XLSX.utils.aoa_to_sheet(typeData);
      XLSX.utils.book_append_sheet(workbook, typeSheet, 'Clicks by Type');

      // Popular Clicks Sheet - Enhanced with user data
      const popularData = [
        ['Rank', 'Display Name', 'Item Type', 'Item Value', 'Click Count', 'Logged-in Users', 'Recent Users']
      ];
      popularClicks.forEach((item, index) => {
        const loggedInUsers = item.loggedInUsers?.map(user => user.userName || user.name).join(', ') || 'None';
        const recentUsers = item.recentActivity?.slice(0, 3).map(activity => 
          activity.userName || activity.name || 'Anonymous'
        ).join(', ') || 'None';
        
        popularData.push([
          index + 1,
          item.displayName,
          item.itemType,
          item.itemValue,
          item.clickCount,
          loggedInUsers,
          recentUsers
        ]);
      });
      const popularSheet = XLSX.utils.aoa_to_sheet(popularData);
      XLSX.utils.book_append_sheet(workbook, popularSheet, 'Popular Items');

      // User Engagement Sheet - Enhanced
      if (userEngagement.length > 0) {
        const userData = [
          ['User Name', 'User ID', 'Total Clicks', 'Sessions', 'Item Types', 'Last Activity', 'Status']
        ];
        userEngagement.forEach(user => {
          userData.push([
            formatUserName(user),
            getUserId(user),
            user.totalClicks || 0,
            user.sessionsCount || 1,
            user.uniqueItemTypesCount || user.itemTypesCount || 0,
            new Date(user.lastActivity || user.lastClick).toLocaleDateString(),
            getUserId(user) !== 'Anonymous' ? 'Logged In' : 'Anonymous'
          ]);
        });
        const userSheet = XLSX.utils.aoa_to_sheet(userData);
        XLSX.utils.book_append_sheet(workbook, userSheet, 'User Engagement');
      }

      // Trends Sheet
      const trendsData = [
        ['Date', 'Clicks', 'Unique Users']
      ];
      dailyTrends.forEach(item => {
        trendsData.push([
          item.date,
          item.clicks,
          item.uniqueUsersCount || 0
        ]);
      });
      const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
      XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Daily Trends');

      // Generate and download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `click-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
    } catch (error) {
      console.error('Excel export error:', error);
      throw error;
    }
  };

  const exportToJson = () => {
    try {
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          timeframe: timeframe,
          filters: filters
        },
        summary: summary,
        clicksByType: clicksByType,
        popularClicks: popularClicks,
        dailyTrends: dailyTrends,
        userEngagement: userEngagement
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const data = new Blob([dataStr], { type: 'application/json' });
      saveAs(data, `click-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.json`);
    } catch (error) {
      console.error('JSON export error:', error);
      throw error;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Analytics</h3>
          <p className="text-gray-500">Fetching your click analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600 mb-6">No click analytics data available yet. Start tracking clicks to see data here.</p>
          <button
            onClick={fetchAnalytics}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Click Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Comprehensive tracking of user interactions and engagement</p>
            </div>
            
            {/* Filters and Export */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Timeframe Filter */}
              <div className="flex-1 sm:flex-none">
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full sm:w-48 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Item Type Filter */}
              <div className="flex-1 sm:flex-none">
                <select
                  value={filters.itemType}
                  onChange={(e) => setFilters(prev => ({ ...prev, itemType: e.target.value }))}
                  className="w-full sm:w-48 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {itemTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('excel')}
                  disabled={exportLoading}
                  className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center gap-2 min-w-[100px]"
                >
                  {exportLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">Excel</span>
                </button>
                
                <button
                  onClick={() => handleExport('json')}
                  disabled={exportLoading}
                  className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center gap-2 min-w-[100px]"
                >
                  {exportLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg text-white">
            <h3 className="text-sm font-semibold opacity-90">Total Clicks</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{summary.totalClicks.toLocaleString()}</p>
            <p className="text-blue-100 text-xs mt-1 opacity-80">All interactions</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl shadow-lg text-white">
            <h3 className="text-sm font-semibold opacity-90">Logged-in Users</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{(summary.loggedInUsersCount || 0).toLocaleString()}</p>
            <p className="text-green-100 text-xs mt-1 opacity-80">Registered users</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg text-white">
            <h3 className="text-sm font-semibold opacity-90">Anonymous Users</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{(summary.anonymousUsersCount || 0).toLocaleString()}</p>
            <p className="text-purple-100 text-xs mt-1 opacity-80">Guest visitors</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl shadow-lg text-white">
            <h3 className="text-sm font-semibold opacity-90">Total Users</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{summary.uniqueUsersCount.toLocaleString()}</p>
            <p className="text-orange-100 text-xs mt-1 opacity-80">All visitors</p>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl shadow-lg text-white">
            <h3 className="text-sm font-semibold opacity-90">Engagement Rate</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{conversionRate}%</p>
            <p className="text-red-100 text-xs mt-1 opacity-80">Clicks per user</p>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 rounded-xl shadow-lg text-white">
            <h3 className="text-sm font-semibold opacity-90">User Engagement</h3>
            <p className="text-2xl sm:text-3xl font-bold mt-2">{userEngagementRate}%</p>
            <p className="text-teal-100 text-xs mt-1 opacity-80">By logged-in users</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="px-4 sm:px-6">
            <nav className="flex space-x-8 overflow-x-auto -mb-px">
              {['overview', 'by-type', 'popular', 'users', 'trends', 'insights'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.replace('-', ' ')}
                  {tab === 'users' && userEngagement.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                      {userEngagement.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Clicks by Type Chart */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Clicks Distribution by Type</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clicksByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ itemType, percent }) => `${itemType} (${(percent * 100).toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalClicks"
                      >
                        {clicksByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Clicks']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Daily Trends */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Click Trends</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="clicks" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
                      <Line type="monotone" dataKey="uniqueUsersCount" stroke="#ff7300" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Engagement Overview */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <span className="text-blue-700 font-medium">Logged-in Users</span>
                      <p className="text-blue-600 text-sm">Active registered users</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-700">{summary.loggedInUsersCount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <span className="text-gray-700 font-medium">Anonymous Users</span>
                      <p className="text-gray-600 text-sm">Guest visitors</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-700">{summary.anonymousUsersCount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <span className="text-green-700 font-medium">User Engagement</span>
                      <p className="text-green-600 text-sm">Logged-in user activity</p>
                    </div>
                    <span className="text-2xl font-bold text-green-700">{userEngagementRate}%</span>
                  </div>
                </div>
              </div>

              {/* Top Performing Items - FIXED KEY */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Contact Methods</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {topPerformers.map((click, index) => (
                    <div key={click._id || `top-performer-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <span className="font-medium block text-sm">{click.displayName || click.itemValue}</span>
                          <span className="text-xs text-gray-500 capitalize">{click.itemType}</span>
                          {click.loggedInUsersCount > 0 && (
                            <span className="text-xs text-green-600 block">
                              {click.loggedInUsersCount} logged-in users
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-600 block text-sm">{click.clickCount} clicks</span>
                        <span className="text-xs text-gray-500">
                          {new Date(click.lastClicked).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* By Type Tab */}
          {activeTab === 'by-type' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Clicks by Type - Bar Chart</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clicksByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="itemType" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalClicks" fill="#8884d8" name="Total Clicks" />
                      <Bar dataKey="uniqueItemsCount" fill="#82ca9d" name="Unique Items" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics by Type</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Clicks
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unique Items
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Clicks/Item
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clicksByType.map((stat, index) => (
                        <tr key={stat._id || `type-${index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-3" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {stat.itemType}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {stat.totalClicks?.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.uniqueItemsCount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {Math.round(stat.avgClicksPerItem)?.toLocaleString() || 0}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {totalClicksByType > 0 ? 
                              ((stat.totalClicks / totalClicksByType) * 100).toFixed(1) + '%' : '0%'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Popular Tab */}
          {activeTab === 'popular' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Contact Methods</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Clicks
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Logged-in Users
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recent Users
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Clicked
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {popularClicks.map((click, index) => (
                      <tr key={click._id || `popular-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {click.displayName}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {click.itemValue}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {click.itemType}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {click.clickCount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {click.loggedInUsersCount?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {click.recentActivity?.slice(0, 2).map((activity, i) => (
                            <div key={i} className="text-xs">
                              {activity.userName || 'Anonymous'}
                            </div>
                          )) || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(click.lastClicked).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* User Engagement Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Logged-in Users</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {userEngagement.filter(user => getUserId(user) !== 'Anonymous').length}
                  </p>
                  <p className="text-gray-500 text-sm">Users with click activity</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total User Clicks</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {userEngagement.reduce((sum, user) => sum + (user.totalClicks || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm">From logged-in users</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Clicks per User</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {userEngagement.length > 0 ? 
                      Math.round(userEngagement.reduce((sum, user) => sum + (user.totalClicks || 0), 0) / userEngagement.length) : 0
                    }
                  </p>
                  <p className="text-gray-500 text-sm">Average engagement</p>
                </div>
              </div>

              {/* User Engagement Table - FIXED KEY */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement Details</h3>
                
                {userLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading user data...</span>
                  </div>
                ) : userEngagement.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Clicks
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sessions
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item Types
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Activity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clicks/Session
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userEngagement.map((user, index) => (
                          <tr  key={user?.userId || user?.id || `user-${index}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {getUserInitials(user)}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatUserName(user)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {getUserId(user) !== 'Anonymous' ? `ID: ${getUserId(user)}` : 'Anonymous User'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <UserTypeBadge user={user} />
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {(user.totalClicks || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(user.sessionsCount || 1).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(user.uniqueItemTypesCount || user.itemTypesCount || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.lastActivity || user.lastClick || user.lastClicked).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.clicksPerSession ? user.clicksPerSession.toFixed(1) : (user.totalClicks || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No User Data</h3>
                    <p className="text-gray-500">No user activity found for the selected timeframe.</p>
                  </div>
                )}
              </div>

              {/* Recent User Activity - FIXED KEY (This was the main issue!) */}
              {userEngagement.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent User Activity</h3>
                  <div className="space-y-4">
                    {userEngagement.slice(0, 5).map((user, index) => (
                      <div key={getUserKey(user, index)} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {getUserInitials(user)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{formatUserName(user)}</h4>
                            <p className="text-sm text-gray-500">
                              Last active: {new Date(user.lastActivity || user.lastClick).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {getUserId(user) !== 'Anonymous' ? `User ID: ${getUserId(user)}` : 'Anonymous Session'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{user.totalClicks || 0} clicks</p>
                          <p className="text-sm text-gray-500">{user.sessionsCount || 1} sessions</p>
                          <UserTypeBadge user={user} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Click Trends Over Time</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#8884d8" 
                        strokeWidth={3}
                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="uniqueUsersCount" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Pattern</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyTrends.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="clicks" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Average Daily Clicks</span>
                      <span className="font-semibold text-gray-900">
                        {dailyTrends.length > 0 ? 
                          Math.round(dailyTrends.reduce((sum, day) => sum + day.clicks, 0) / dailyTrends.length) : 0
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Growth Rate</span>
                      <span className={`font-semibold ${
                        dailyTrends.length > 1 && dailyTrends[0].clicks < dailyTrends[dailyTrends.length - 1].clicks ? 
                        'text-green-600' : 'text-red-600'
                      }`}>
                        {dailyTrends.length > 1 ? 
                          (((dailyTrends[dailyTrends.length - 1].clicks - dailyTrends[0].clicks) / dailyTrends[0].clicks) * 100).toFixed(1) + '%' : 
                          '0%'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Peak Day</span>
                      <span className="font-semibold text-gray-900">
                        {dailyTrends.reduce((max, day) => day.clicks > max.clicks ? day : max, {clicks: 0}).date || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Top Performing Category</h4>
                    <p className="text-blue-700">
                      {clicksByType[0]?.itemType || 'N/A'} leads with {clicksByType[0]?.totalClicks || 0} clicks
                      ({totalClicksByType > 0 ? ((clicksByType[0]?.totalClicks / totalClicksByType) * 100).toFixed(1) : 0}% of total)
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">User Engagement</h4>
                    <p className="text-green-700">
                      {summary.loggedInUsersCount || 0} logged-in users generated {userEngagementRate}% of total clicks
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Trend Analysis</h4>
                    <p className="text-purple-700">
                      {dailyTrends.length > 1 ? 
                        (dailyTrends[dailyTrends.length - 1].clicks > dailyTrends[0].clicks ? 
                          'Positive growth trend observed' : 'Stable performance maintained') : 
                        'Insufficient data for trend analysis'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {clicksByType.slice(0, 3).map((type, index) => (
                    <div key={`recommendation-${type.itemType}-${index}`} className="p-3 bg-gray-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-1">
                        {index + 1}. {type.itemType.charAt(0).toUpperCase() + type.itemType.slice(1)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {type.totalClicks} clicks - Consider {index === 0 ? 'maintaining' : 'improving'} visibility and accessibility
                      </p>
                    </div>
                  ))}
                  
                  {userEngagementRate > 50 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-1">
                        High User Engagement
                      </h4>
                      <p className="text-sm text-green-700">
                        {userEngagementRate}% of clicks from logged-in users. Focus on user retention.
                      </p>
                    </div>
                  )}
                  
                  {popularClicks.slice(0, 2).map((click, index) => (
                    <div key={click._id || `high-performer-${index}`} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-1">
                        High Performer: {click.displayName}
                      </h4>
                      <p className="text-sm text-yellow-700">
                        {click.clickCount} clicks - This contact method is highly effective
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminClickAnalytics;