// components/admin/AdminBatchAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { 
  Eye, Users, TrendingUp, Building, Download, RefreshCw,
  Clock, User, Home, Star, Search, Filter, ChevronDown,
  Trash2, Edit, MoreVertical, CheckCircle, XCircle,
  BarChart3, Activity, Zap, Award, Crown, Calendar,
  ArrowUpDown, Loader, AlertCircle, FileText, FileSpreadsheet,
  Printer, Mail, Share2, PieChart, LineChart
} from 'lucide-react';
import { batchAPI } from '../api/batchAPI';

export default function AdminBatchAnalytics() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchDetails, setShowBatchDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('totalViews');
  const [overallStats, setOverallStats] = useState({
    totalBatches: 0,
    totalProperties: 0,
    totalViews: 0,
    totalUniqueViewers: 0
  });
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [batchAnalytics, setBatchAnalytics] = useState(null);

  useEffect(() => {
    fetchAllBatches();
  }, []);

  const fetchAllBatches = async () => {
    try {
      setLoading(true);
      const response = await batchAPI.getAllBatches();
      if (response.success) {
        setBatches(response.data);
        setOverallStats(response.overallStats);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBatchDetails = async (batch) => {
    try {
      setLoading(true);
      const response = await batchAPI.getBatchById(batch.id);
      if (response.success) {
        setSelectedBatch(response.data);
        setBatchAnalytics(response.data.analytics);
        setShowBatchDetails(true);
      }
    } catch (error) {
      console.error('Error fetching batch details:', error);
      alert('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async (batchId, batchName) => {
    if (window.confirm(`Are you sure you want to delete batch "${batchName}"? This action cannot be undone.`)) {
      try {
        await batchAPI.deleteBatch(batchId);
        await fetchAllBatches();
        if (selectedBatch?.batch?.id === batchId) {
          setShowBatchDetails(false);
          setSelectedBatch(null);
          setBatchAnalytics(null);
        }
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert('Failed to delete batch');
      }
    }
  };

  const handleToggleStatus = async (batchId, currentStatus) => {
    try {
      await batchAPI.toggleBatchStatus(batchId);
      await fetchAllBatches();
    } catch (error) {
      console.error('Error toggling batch status:', error);
      alert('Failed to update batch status');
    }
  };

  // Export Single Batch Data
  const exportBatchData = async (batchId, batchName, format = 'csv') => {
    try {
      setExporting(true);
      const filters = {};
      if (dateRange.start) filters.startDate = dateRange.start;
      if (dateRange.end) filters.endDate = dateRange.end;
      
      const data = await batchAPI.exportBatchAnalytics(batchId, format, filters);
      
      if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch_${batchName.replace(/\s/g, '_')}_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch_${batchName.replace(/\s/g, '_')}_analytics_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      alert(`Batch "${batchName}" data exported successfully!`);
    } catch (error) {
      console.error('Error exporting batch data:', error);
      alert('Failed to export batch data');
    } finally {
      setExporting(false);
      setShowExportMenu(null);
    }
  };

  // Export All Batches Summary
  const exportAllBatchesSummary = async (format = 'csv') => {
    try {
      setExporting(true);
      
      if (format === 'csv') {
        const headers = ['Batch Name', 'Location', 'Batch Code', 'Total Properties', 'Total Views', 'Unique Viewers', 'Status', 'Created At'];
        const rows = batches.map(batch => [
          `"${batch.name}"`,
          `"${batch.location}"`,
          batch.code || 'N/A',
          batch.totalProperties,
          batch.totalViews,
          batch.uniqueViewers,
          batch.isActive !== false ? 'Active' : 'Inactive',
          new Date(batch.createdAt).toLocaleDateString()
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_batches_summary_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('All batches summary exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting all batches:', error);
      alert('Failed to export batches summary');
    } finally {
      setExporting(false);
    }
  };

  // Export Company Analytics
  const exportCompanyAnalytics = async (format = 'csv') => {
    try {
      setExporting(true);
      
      const filters = {};
      if (dateRange.start) filters.startDate = dateRange.start;
      if (dateRange.end) filters.endDate = dateRange.end;
      
      const data = await batchAPI.getCompanyAnalytics(filters);
      
      if (format === 'csv') {
        const rows = [
          ['Company Analytics Report', ''],
          ['Generated At', new Date().toLocaleString()],
          ['', ''],
          ['SUMMARY STATISTICS', ''],
          ['Total Batches', data.data?.totalBatches || 0],
          ['Total Properties', data.data?.totalProperties || 0],
          ['Total Views', data.data?.totalViews || 0],
          ['Total Unique Viewers', data.data?.totalUniqueViewers || 0],
          ['', ''],
          ['BATCH TYPE BREAKDOWN', ''],
        ];
        
        if (data.data?.batchesByType) {
          Object.entries(data.data.batchesByType).forEach(([type, count]) => {
            rows.push([`${type}`, count]);
          });
        }
        
        rows.push(['', '']);
        rows.push(['TOP PERFORMING BATCHES', '']);
        
        if (data.data?.topPerformingBatches) {
          data.data.topPerformingBatches.forEach((batch, idx) => {
            rows.push([`${idx + 1}. ${batch.name}`, `${batch.totalViews} views`]);
          });
        }
        
        const csvContent = rows.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `company_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('Company analytics exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting company analytics:', error);
      alert('Failed to export company analytics');
    } finally {
      setExporting(false);
    }
  };

  // Export Property Stats for a Batch
  const exportPropertyStats = async (batchId, batchName) => {
    try {
      setExporting(true);
      const stats = await batchAPI.getBatchPropertyClickStats(batchId);
      
      if (stats.success && stats.data) {
        const headers = ['Property ID', 'Property Title', 'Property Type', 'City', 'Total Views', 'Unique Viewers', 'Avg View Duration (s)', 'Last Viewed'];
        const rows = stats.data.map(prop => {
          const propertyId = prop.propertyId?._id || prop.propertyId || 'N/A';
          const propertyTitle = prop.propertyId?.title || 'Unknown';
          const propertyType = prop.propertyId?.propertyType || 'Unknown';
          const propertyCity = prop.propertyId?.city || 'Unknown';
          
          return [
            `"${propertyId}"`,
            `"${propertyTitle}"`,
            `"${propertyType}"`,
            `"${propertyCity}"`,
            prop.totalViews || 0,
            prop.uniqueViewers || 0,
            prop.avgViewDuration || 0,
            prop.lastViewedAt ? new Date(prop.lastViewedAt).toLocaleDateString() : 'Never'
          ];
        });
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch_${batchName.replace(/\s/g, '_')}_property_stats_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('Property stats exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting property stats:', error);
      alert('Failed to export property stats');
    } finally {
      setExporting(false);
    }
  };

  // Export User Stats for a Batch (with complete user details)
  const exportUserStats = async (batchId, batchName) => {
    try {
      setExporting(true);
      const stats = await batchAPI.getBatchUserClickStats(batchId);
      
      if (stats.success && stats.data) {
        const headers = [
          'User Name', 'Email', 'Phone Number', 'User Type', 
          'Total Views', 'Total Duration (s)', 'Avg Duration (s)', 
          'Properties Viewed', 'First View', 'Last View', 'Company'
        ];
        
        const rows = stats.data.map(user => [
          `"${user.name || 'Anonymous'}"`,
          `"${user.email || 'N/A'}"`,
          `"${user.phone || 'N/A'}"`,
          `"${user.userType || 'Unknown'}"`,
          user.totalViews || 0,
          user.totalDuration || 0,
          user.avgViewDuration || 0,
          user.uniquePropertiesViewed || 0,
          user.firstView ? new Date(user.firstView).toLocaleString() : 'N/A',
          user.lastView ? new Date(user.lastView).toLocaleString() : 'N/A',
          `"${user.company || 'N/A'}"`
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch_${batchName.replace(/\s/g, '_')}_user_stats_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert('User stats exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting user stats:', error);
      alert('Failed to export user stats');
    } finally {
      setExporting(false);
    }
  };

  // Export All Users from All Batches
  const exportAllUsers = async () => {
    try {
      setExporting(true);
      
      const allUsers = new Map();
      
      for (const batch of batches) {
        const stats = await batchAPI.getBatchUserClickStats(batch.id);
        if (stats.success && stats.data) {
          stats.data.forEach(user => {
            const userId = user.userId || user.email;
            if (!allUsers.has(userId)) {
              allUsers.set(userId, {
                name: user.name || 'Anonymous',
                email: user.email || 'N/A',
                phone: user.phone || 'N/A',
                userType: user.userType || 'Unknown',
                totalViews: 0,
                totalDuration: 0,
                batchesViewed: [],
                firstView: user.firstView,
                lastView: user.lastView,
                company: user.company || 'N/A'
              });
            }
            const existing = allUsers.get(userId);
            existing.totalViews += user.totalViews || 0;
            existing.totalDuration += user.totalDuration || 0;
            existing.batchesViewed.push(batch.name);
            if (user.firstView && (!existing.firstView || new Date(user.firstView) < new Date(existing.firstView))) {
              existing.firstView = user.firstView;
            }
            if (user.lastView && (!existing.lastView || new Date(user.lastView) > new Date(existing.lastView))) {
              existing.lastView = user.lastView;
            }
          });
        }
      }
      
      const headers = ['User Name', 'Email', 'Phone Number', 'User Type', 'Total Views', 'Total Duration (s)', 'Avg Duration (s)', 'Batches Viewed', 'First View', 'Last View', 'Company'];
      const rows = Array.from(allUsers.values()).map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        `"${user.phone}"`,
        `"${user.userType}"`,
        user.totalViews,
        user.totalDuration,
        user.totalViews > 0 ? Math.round(user.totalDuration / user.totalViews) : 0,
        `"${user.batchesViewed.join(', ')}"`,
        user.firstView ? new Date(user.firstView).toLocaleString() : 'N/A',
        user.lastView ? new Date(user.lastView).toLocaleString() : 'N/A',
        `"${user.company}"`
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_users_analytics_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(`Exported ${allUsers.size} users across all batches!`);
    } catch (error) {
      console.error('Error exporting all users:', error);
      alert('Failed to export users data');
    } finally {
      setExporting(false);
    }
  };

  const filteredBatches = batches
    .filter(batch => {
      if (searchTerm && !batch.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !batch.location.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterType !== 'all' && batch.batchType !== filterType) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'totalViews') return (b.totalViews || 0) - (a.totalViews || 0);
      if (sortBy === 'totalProperties') return (b.totalProperties || 0) - (a.totalProperties || 0);
      if (sortBy === 'uniqueViewers') return (b.uniqueViewers || 0) - (a.uniqueViewers || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Batch Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Admin view - All property batches and their performance</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Date Range Filter */}
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {dateRange.start && dateRange.end ? `${dateRange.start} to ${dateRange.end}` : 'Filter by Date'}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Export All Button */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(showExportMenu === 'all' ? null : 'all')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled={exporting}
                >
                  {exporting ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Export All
                </button>
                
                {showExportMenu === 'all' && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-2">
                      <button
                        onClick={() => exportAllBatchesSummary('csv')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-green-600" />
                        Export All Batches Summary
                      </button>
                      <button
                        onClick={() => exportCompanyAnalytics('csv')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm"
                      >
                        <PieChart className="w-4 h-4 text-blue-600" />
                        Export Company Analytics
                      </button>
                      <button
                        onClick={() => exportAllUsers()}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm"
                      >
                        <Users className="w-4 h-4 text-purple-600" />
                        Export All Users Data (with contact details)
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={fetchAllBatches}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Date Range Picker */}
          {showDateFilter && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setDateRange({ start: '', end: '' })}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overall Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{overallStats.totalBatches}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Batches</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Home className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{overallStats.totalProperties?.toLocaleString() || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Properties</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{overallStats.totalViews?.toLocaleString() || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Views</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{overallStats.totalUniqueViewers?.toLocaleString() || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Unique Viewers</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="location_based">Location Based</option>
                <option value="project_group">Project Group</option>
                <option value="featured_listings">Featured Listings</option>
                <option value="similar_properties">Similar Properties</option>
                <option value="comparison_group">Comparison Group</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="totalViews">Total Views</option>
                <option value="totalProperties">Total Properties</option>
                <option value="uniqueViewers">Unique Viewers</option>
                <option value="name">Batch Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Properties</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Viewers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={batch.image?.url || 'https://via.placeholder.com/40'}
                            alt={batch.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{batch.name}</p>
                          <p className="text-xs text-gray-500">{batch.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{batch.location}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{batch.totalProperties || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">{batch.totalViews?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-600">{batch.uniqueViewers?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{batch.createdBy?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 capitalize">{batch.createdBy?.userType || 'user'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        batch.isActive !== false
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {batch.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setShowExportMenu(showExportMenu === batch.id ? null : batch.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Export Data"
                            disabled={exporting}
                          >
                            {exporting && showExportMenu === batch.id ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          </button>
                          
                          {showExportMenu === batch.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <div className="p-2">
                                <button
                                  onClick={() => exportBatchData(batch.id, batch.name, 'csv')}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center gap-2"
                                >
                                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                  Export Batch Summary
                                </button>
                                <button
                                  onClick={() => exportPropertyStats(batch.id, batch.name)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center gap-2"
                                >
                                  <Home className="w-4 h-4 text-blue-600" />
                                  Export Property Stats
                                </button>
                                <button
                                  onClick={() => exportUserStats(batch.id, batch.name)}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center gap-2"
                                >
                                  <Users className="w-4 h-4 text-purple-600" />
                                  Export User Details (with contacts)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleViewBatchDetails(batch)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(batch.id, batch.isActive)}
                          className="p-1 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title={batch.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {batch.isActive !== false ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id, batch.name)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBatches.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Batch Details Modal */}
      {showBatchDetails && selectedBatch && batchAnalytics && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowBatchDetails(false)}></div>
            
            <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedBatch.batch?.name}</h2>
                  <p className="text-sm text-gray-600">{selectedBatch.batch?.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    {/* <button
                      onClick={() => setShowExportMenu(showExportMenu === 'modal' ? null : 'modal')}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button> */}
                    
                    {showExportMenu === 'modal' && selectedBatch.batch && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                        <div className="p-2">
                          <button
                            onClick={() => exportBatchData(selectedBatch.batch.id, selectedBatch.batch.name, 'csv')}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center gap-2"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            Export Summary
                          </button>
                          <button
                            onClick={() => exportPropertyStats(selectedBatch.batch.id, selectedBatch.batch.name)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center gap-2"
                          >
                            <Home className="w-4 h-4 text-blue-600" />
                            Export Property Stats
                          </button>
                          <button
                            onClick={() => exportUserStats(selectedBatch.batch.id, selectedBatch.batch.name)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center gap-2"
                          >
                            <Users className="w-4 h-4 text-purple-600" />
                            Export User Details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowBatchDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                {/* Analytics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Total Views</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {batchAnalytics?.summary?.totalViews || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Unique Viewers</p>
                    <p className="text-2xl font-bold text-green-900">
                      {batchAnalytics?.summary?.uniqueViewers || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Total Properties</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {batchAnalytics?.summary?.totalProperties || 0}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600 mb-1">Last Viewed</p>
                    <p className="text-sm font-medium text-orange-900">
                      {batchAnalytics?.summary?.lastViewedAt 
                        ? new Date(batchAnalytics.summary.lastViewedAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>

                {/* Top Properties */}
                {batchAnalytics?.topProperties?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Properties</h3>
                    <div className="space-y-2">
                      {batchAnalytics.topProperties.map((prop, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              Property #{typeof prop.propertyId === 'string' ? prop.propertyId.slice(-6) : (prop.propertyId?.toString().slice(-6) || 'N/A')}
                            </p>
                            <p className="text-sm text-gray-500">{prop.uniqueViewers || 0} unique viewers</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{prop.totalViews || 0} views</p>
                            <p className="text-xs text-gray-500">{prop.avgViewDuration || 0}s avg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Users */}
                {batchAnalytics?.topUsers?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Most Engaged Users</h3>
                    <div className="space-y-2">
                      {batchAnalytics.topUsers.slice(0, 10).map((user, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500 capitalize">{user.type || 'user'}</p>
                              {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{user.views || 0} views</p>
                            <p className="text-xs text-gray-500">{Math.round((user.duration || 0) / (user.views || 1))}s avg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}