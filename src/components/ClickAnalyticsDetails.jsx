import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchClickAnalytics, 
  fetchClickStatsByType, 
  fetchPopularClicks, 
  fetchClickTrends,
  exportClickData,
  fetchRawClickData,
  fetchUserSessions,
  fetchCompleteAnalytics,fetchHourlyDistribution 
} from '../api/adminApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const ClickAnalyticsDetails = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard');
  const [rawDataPage, setRawDataPage] = useState(1);
  const [rawDataSearch, setRawDataSearch] = useState('');
  const [sessions, setSessions] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, viewMode]);

  // Safe data extraction with fallbacks
  const getSummaryData = () => {
    if (!analytics) {
      return {
        totalClicks: 0,
        uniqueItemsCount: 0,
        uniqueUsersCount: 0,
        uniqueSessionsCount: 0,
        countriesCount: 0,
        citiesCount: 0,
        deviceTypesCount: 0,
        itemTypesCount: 0,
        avgClicksPerItem: 0,
        avgClicksPerSession: 0
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
      countriesCount: analytics.countriesCount || 0,
      citiesCount: analytics.citiesCount || 0,
      deviceTypesCount: analytics.deviceTypesCount || 0,
      itemTypesCount: analytics.itemTypesCount || 0,
      avgClicksPerItem: analytics.avgClicksPerItem || 0,
      avgClicksPerSession: analytics.avgClicksPerSession || 0
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

  const getGeographicData = () => {
    return analytics?.geographicData || analytics?.data?.geographicData || [];
  };

  const getDeviceData = () => {
    return analytics?.deviceData || analytics?.data?.deviceData || [];
  };

  const getHourlyDistribution = () => {
    return analytics?.hourlyDistribution || analytics?.data?.hourlyDistribution || [];
  };

const getRawData = () => {
  if (!analytics) return [];
  
//('🔍 Full analytics structure:', analytics);
  
  // For raw-data view (from /analytics/clicks/raw endpoint)
  if (viewMode === 'raw-data') {
    // The raw data endpoint returns data in this structure:
    // { success: true, data: { clicks: [], pagination: {}, ... } }
    if (analytics.clicks) {
    //('✅ Found raw data at analytics.clicks');
      return analytics.clicks;
    }
    if (analytics.data?.clicks) {
    //('✅ Found raw data at analytics.data.clicks');
      return analytics.data.clicks;
    }
    if (Array.isArray(analytics)) {
    //('✅ Found raw data as direct array');
      return analytics;
    }
  }
  
  // For other views that might have raw data
  if (analytics.rawData) {
    return analytics.rawData;
  }
  if (analytics.data?.rawData) {
    return analytics.data.rawData;
  }
  
//('❌ No raw data found in analytics object');
  return [];
};

  // Memoized calculations
  const summary = useMemo(() => getSummaryData(), [analytics]);
  const clicksByType = useMemo(() => getClicksByType(), [analytics]);
  const popularClicks = useMemo(() => getPopularClicks(), [analytics]);
  const dailyTrends = useMemo(() => getDailyTrends(), [analytics]);
  const geographicData = useMemo(() => getGeographicData(), [analytics]);
  const deviceData = useMemo(() => getDeviceData(), [analytics]);
  const hourlyDistribution = useMemo(() => getHourlyDistribution(), [analytics]);
  const rawData = useMemo(() => getRawData(), [analytics]);
  
//("analytics raw data",rawData)
const fetchAnalytics = async () => {
  try {
    setLoading(true);
    setError(null);
    
    let response;
    
    if (viewMode === 'user-sessions') {
      response = await fetchUserSessions(timeframe, 50);
      if (response && response.success) {
        setSessions(response.data?.sessions || []);
        setAnalytics(response.data);
      }
    } else if (viewMode === 'raw-data') {
      response = await fetchRawClickData({
        timeframe,
        page: rawDataPage,
        search: rawDataSearch,
        limit: 50
      });
    //('📊 Raw Data API Response:', response);
      
      if (response && response.success) {
        setAnalytics(response.data);
      } else {
        setAnalytics(response);
      }
    } else if (viewMode === 'hourly-analysis') {
      // Fetch hourly distribution specifically for hourly analysis view
      response = await fetchHourlyDistribution(timeframe);
    //('🕒 Hourly Distribution Response:', response);
      
      if (response && response.success) {
        setAnalytics(response.data);
      } else {
        setAnalytics(response);
      }
    } else {
      // For other views including dashboard
      const includeRawData = viewMode === 'geo-analysis' || viewMode === 'device-analysis' || viewMode === 'hourly-analysis';
      response = await fetchCompleteAnalytics(timeframe, includeRawData);
      
    //('📊 Complete Analytics Response:', response);
      
      if (response && response.success) {
        setAnalytics(response.data);
      } else if (response) {
        setAnalytics(response);
      }
    }
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    setError(error.response?.data?.message || error.message || 'Failed to fetch analytics data');
  } finally {
    setLoading(false);
  }
};

  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      
      if (format === 'excel') {
        await exportToExcel();
      } else if (format === 'json') {
        await exportToJson();
      } else {
        const response = await exportClickData(format, timeframe);
        if (format === 'csv' && response instanceof Blob) {
          saveAs(response, `click-analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`);
        }
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
        ['Click Analytics Summary', ''],
        ['Timeframe', timeframe],
        ['Generated On', new Date().toLocaleString()],
        ['Date Range', `${analytics?.dateRange?.start ? new Date(analytics.dateRange.start).toLocaleDateString() : 'N/A'} - ${analytics?.dateRange?.end ? new Date(analytics.dateRange.end).toLocaleDateString() : 'N/A'}`],
        [''],
        ['Metric', 'Value'],
        ['Total Clicks', summary.totalClicks],
        ['Unique Items', summary.uniqueItemsCount],
        ['Unique Users', summary.uniqueUsersCount],
        ['Unique Sessions', summary.uniqueSessionsCount],
        ['Countries', summary.countriesCount],
        ['Cities', summary.citiesCount],
        ['Device Types', summary.deviceTypesCount],
        ['Item Types', summary.itemTypesCount],
        ['Average Clicks Per Item', Math.round(summary.avgClicksPerItem)],
        ['Average Clicks Per Session', Math.round(summary.avgClicksPerSession)]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Clicks by Type Sheet
      const typeData = [
        ['Item Type', 'Total Clicks', 'Unique Items', 'Unique Users', 'Unique Sessions', 'Average Clicks', 'Percentage']
      ];
      const totalClicks = clicksByType.reduce((sum, item) => sum + (item.totalClicks || 0), 0);
      clicksByType.forEach(item => {
        typeData.push([
          item.itemType,
          item.totalClicks,
          item.uniqueItemsCount,
          item.uniqueUsersCount,
          item.uniqueSessionsCount,
          Math.round(item.avgClicksPerItem || 0),
          totalClicks > 0 ? ((item.totalClicks / totalClicks) * 100).toFixed(1) + '%' : '0%'
        ]);
      });
      const typeSheet = XLSX.utils.aoa_to_sheet(typeData);
      XLSX.utils.book_append_sheet(workbook, typeSheet, 'Clicks by Type');

      // Popular Clicks Sheet
      const popularData = [
        ['Rank', 'Display Name', 'Item Type', 'Item Value', 'Click Count', 'Unique Users', 'Unique Sessions', 'Countries', 'First Clicked', 'Last Clicked']
      ];
      popularClicks.forEach((item, index) => {
        popularData.push([
          index + 1,
          item.displayName,
          item.itemType,
          item.itemValue,
          item.clickCount,
          item.uniqueUsersCount || 'N/A',
          item.uniqueSessionsCount || 'N/A',
          item.countriesCount || 'N/A',
          item.firstClicked ? new Date(item.firstClicked).toLocaleString() : 'N/A',
          new Date(item.lastClicked).toLocaleString()
        ]);
      });
      const popularSheet = XLSX.utils.aoa_to_sheet(popularData);
      XLSX.utils.book_append_sheet(workbook, popularSheet, 'Popular Items');

      // Trends Sheet
      const trendsData = [
        ['Date', 'Total Clicks', 'Unique Users', 'Unique Sessions', 'Unique Items', 'Engagement Rate']
      ];
      dailyTrends.forEach(item => {
        trendsData.push([
          item.date,
          item.clicks,
          item.uniqueUsersCount || 0,
          item.uniqueSessionsCount || 0,
          item.uniqueItemsCount || 0,
          item.engagementRate ? (item.engagementRate * 100).toFixed(1) + '%' : '0%'
        ]);
      });
      const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
      XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Daily Trends');

      // Geographic Data Sheet
      const geoData = [
        ['Country', 'City', 'Total Clicks', 'Unique Users', 'Unique Sessions', 'Top Item']
      ];
      geographicData.forEach(item => {
        geoData.push([
          item.country,
          item.city,
          item.clicks,
          item.uniqueUsersCount,
          item.uniqueSessionsCount,
          item.topItem ? `${item.topItem.type}: ${item.topItem.item}` : 'N/A'
        ]);
      });
      const geoSheet = XLSX.utils.aoa_to_sheet(geoData);
      XLSX.utils.book_append_sheet(workbook, geoSheet, 'Geographic Data');

      // Device Data Sheet
      const deviceSheetData = [
        ['Device Type', 'Total Clicks', 'Unique Users', 'Unique Sessions', 'Countries', 'Percentage']
      ];
      const totalClicksForDevices = deviceData.reduce((sum, item) => sum + (item.clicks || 0), 0);
      deviceData.forEach(item => {
        deviceSheetData.push([
          item.deviceType,
          item.clicks,
          item.uniqueUsersCount,
          item.uniqueSessionsCount,
          item.countriesCount,
          totalClicksForDevices > 0 ? ((item.clicks / totalClicksForDevices) * 100).toFixed(1) + '%' : '0%'
        ]);
      });
      const deviceSheet = XLSX.utils.aoa_to_sheet(deviceSheetData);
      XLSX.utils.book_append_sheet(workbook, deviceSheet, 'Device Data');

      // Hourly Distribution Sheet
      const hourlyData = [
        ['Hour', 'Total Clicks', 'Unique Sessions']
      ];
      hourlyDistribution.forEach(item => {
        hourlyData.push([
          `${item.hour}:00`,
          item.clicks,
          item.uniqueSessionsCount
        ]);
      });
      const hourlySheet = XLSX.utils.aoa_to_sheet(hourlyData);
      XLSX.utils.book_append_sheet(workbook, hourlySheet, 'Hourly Distribution');

      // Raw Data Sheet
      if (rawData.length > 0) {
        const rawDataSheet = [
          ['Timestamp', 'Session ID', 'User ID', 'Item Type', 'Display Name', 'Item Value', 'Property ID', 'Page URL', 'Device Type', 'Country', 'City', 'IP Address', 'User Agent']
        ];
        rawData.forEach(item => {
          rawDataSheet.push([
            new Date(item.timestamp).toLocaleString(),
            item.sessionId,
            item.userId || 'Anonymous',
            item.itemType,
            item.displayName,
            item.itemValue,
            item.propertyId || 'N/A',
            item.pageUrl,
            item.deviceType,
            item.country,
            item.city,
            item.ipAddress,
            item.userAgent
          ]);
        });
        const rawSheet = XLSX.utils.aoa_to_sheet(rawDataSheet);
        XLSX.utils.book_append_sheet(workbook, rawSheet, 'Raw Data');
      }

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `click-analytics-details-${timeframe}-${new Date().toISOString().split('T')[0]}.xlsx`);
      
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
          dateRange: analytics?.dateRange,
          totalRecords: rawData.length
        },
        summary: summary,
        clicksByType: clicksByType,
        popularClicks: popularClicks,
        dailyTrends: dailyTrends,
        geographicData: geographicData,
        deviceData: deviceData,
        hourlyDistribution: hourlyDistribution,
        rawData: rawData
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const data = new Blob([dataStr], { type: 'application/json' });
      saveAs(data, `click-analytics-details-${timeframe}-${new Date().toISOString().split('T')[0]}.json`);
    } catch (error) {
      console.error('JSON export error:', error);
      throw error;
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📟';
      default:
        return '💻';
    }
  };

  const getCountryFlag = (country) => {
    if (country === 'Unknown') return '🌐';
    const countryFlags = {
      'US': '🇺🇸', 'IN': '🇮🇳', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
      'DE': '🇩🇪', 'FR': '🇫🇷', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷'
    };
    return countryFlags[country] || '🇺🇳';
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  const formatIPAddress = (ip) => {
    if (!ip || ip === 'unknown') return 'N/A';
    if (ip === '::1') return 'Localhost';
    
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
      }
    }
    
    if (ip.includes(':')) {
      return `${ip.substring(0, 8)}...`;
    }
    
    return ip;
  };
  const [hourlyData, setHourlyData] = useState(null);


// Add this useEffect to fetch hourly data
useEffect(() => {
  if (viewMode === 'hourly-analysis') {
    fetchHourlyData();
  }
}, [viewMode, timeframe]);

const fetchHourlyData = async () => {
  try {
    setLoading(true);
    setError(null);
  //('🕒 Starting hourly data fetch...');
    
    const response = await fetchHourlyDistribution(timeframe);
  //('📊 Setting hourly data:', response);
    
    // Ensure we always have a valid data structure
    if (response.success && response.data) {
      setHourlyData(response);
    } else {
      console.warn('⚠️ Invalid response structure:', response);
      setHourlyData({
        data: {
          hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            hourFormatted: `${i.toString().padStart(2, '0')}:00`,
            clicks: 0,
            uniqueSessionsCount: 0,
            engagementRate: 0
          })),
          summary: {
            totalClicks: 0,
            peakHour: { hour: 0, hourLabel: '00:00', clicks: 0 },
            averageClicksPerHour: 0
          },
          timeframe: timeframe
        }
      });
    }
  } catch (err) {
    console.error('❌ Error fetching hourly data:', err);
    setError(err.message || 'Failed to load hourly analysis data');
    // Set empty data structure on error
    setHourlyData({
      data: {
        hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          hourFormatted: `${i.toString().padStart(2, '0')}:00`,
          clicks: 0,
          uniqueSessionsCount: 0,
          engagementRate: 0
        })),
        summary: {
          totalClicks: 0,
          peakHour: { hour: 0, hourLabel: '00:00', clicks: 0 },
          averageClicksPerHour: 0
        },
        timeframe: timeframe
      }
    });
  } finally {
    setLoading(false);
  }
};

  const formatSessionDuration = (minutes) => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading detailed analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Analytics Data</h3>
        <p className="text-gray-500 mb-4">No click analytics data available yet.</p>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Click Analytics - Detailed View</h1>
          <p className="text-gray-600">Complete tracking and analysis of all user interactions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Timeframe Filter */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>

          {/* View Mode Selector */}
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dashboard">Dashboard View</option>
            <option value="raw-data">Raw Data View</option>
            <option value="user-sessions">User Sessions</option>
            <option value="geo-analysis">Geographic Analysis</option>
            <option value="device-analysis">Device Analysis</option>
            <option value="hourly-analysis">Hourly Analysis</option>
          </select>

          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('excel')}
              disabled={exportLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400 text-sm flex items-center space-x-2"
            >
              {exportLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              <span>Excel</span>
            </button>
            
            <button
              onClick={() => handleExport('json')}
              disabled={exportLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 text-sm flex items-center space-x-2"
            >
              {exportLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalClicks)}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-lg">👆</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Items</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.uniqueItemsCount)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-lg">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.uniqueUsersCount)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-lg">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.uniqueSessionsCount)}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 text-lg">🔄</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Countries</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.countriesCount)}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600 text-lg">🌍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg/Item</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(summary.avgClicksPerItem || 0)}</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <span className="text-indigo-600 text-lg">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg/Session</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(summary.avgClicksPerSession || 0)}</p>
            </div>
            <div className="p-2 bg-pink-100 rounded-lg">
              <span className="text-pink-600 text-lg">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cities</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.citiesCount)}</p>
            </div>
            <div className="p-2 bg-teal-100 rounded-lg">
              <span className="text-teal-600 text-lg">🏙️</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Device Types</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.deviceTypesCount)}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-lg">📱</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content based on View Mode */}
      {viewMode === 'dashboard' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clicks by Type */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Clicks Distribution by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
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
                  <Tooltip formatter={(value) => [formatNumber(value), 'Clicks']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Trends */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Daily Click Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="clicks" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} name="Total Clicks" />
                  <Line type="monotone" dataKey="uniqueUsersCount" stroke="#ff7300" strokeWidth={2} name="Unique Users" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Second Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Distribution */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Device Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deviceData.length > 0 ? deviceData : [{ deviceType: 'No Data', clicks: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="deviceType" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatNumber(value), 'Clicks']} />
                  <Legend />
                  <Bar dataKey="clicks" fill="#8884d8" name="Total Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Distribution */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Hourly Click Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyDistribution.length > 0 ? hourlyDistribution : [{ hour: 0, clicks: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatNumber(value), 'Clicks']} />
                  <Legend />
                  <Line type="monotone" dataKey="clicks" stroke="#8884d8" strokeWidth={2} name="Total Clicks" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Clicks Table */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Top Performing Contact Methods</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Clicked</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {popularClicks.map((click, index) => (
                    <tr 
                      key={click._id || index} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedItem(click)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {click.displayName}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {click.itemValue}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {click.itemType}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatNumber(click.clickCount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(click.uniqueUsersCount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(click.uniqueSessionsCount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {click.lastClicked ? new Date(click.lastClicked).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    {viewMode === 'raw-data' && (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Raw Click Data - All Fields</h3>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Search clicks..."
          value={rawDataSearch}
          onChange={(e) => setRawDataSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            setRawDataPage(1); // Reset to first page when searching
            fetchAnalytics();
          }}
          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          Search
        </button>
      </div>
    </div>

    <div className="overflow-x-auto max-h-96">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page URL</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rawData.length > 0 ? (
            rawData.map((item, index) => (
              <tr key={item._id || index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {item.sessionId ? `${item.sessionId.substring(0, 8)}...` : 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {item.userId ? 'User' : 'Anonymous'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {item.itemType || 'unknown'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.displayName || 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                  {item.itemValue || 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {item.propertyId ? 'Yes' : 'No'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>{getDeviceIcon(item.deviceType)}</span>
                    <span className="capitalize">{item.deviceType || 'desktop'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>{getCountryFlag(item.country)}</span>
                    <span>{item.country || 'Unknown'}</span>
                    {item.city && item.city !== 'Unknown' && <span>• {item.city}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {formatIPAddress(item.ipAddress)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                  {item.pageUrl || 'N/A'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v8m-6 0h6m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No raw data available for the selected timeframe.</p>
                  <p className="text-sm mt-1">Try changing the timeframe or check if data exists in your database.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    
    {/* Enhanced Pagination */}
    {analytics?.pagination && (
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing page {analytics.pagination.page} of {analytics.pagination.pages} 
          ({analytics.pagination.total} total records)
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setRawDataPage(prev => Math.max(1, prev - 1));
              fetchAnalytics();
            }}
            disabled={rawDataPage <= 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => {
              setRawDataPage(prev => prev + 1);
              fetchAnalytics();
            }}
            disabled={rawDataPage >= (analytics.pagination.pages || 1)}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    )}
  </div>
)}
   {viewMode === 'user-sessions' && (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <h3 className="text-lg font-semibold mb-4">User Sessions Analysis</h3>
    
    {/* Session statistics */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{formatNumber(summary.uniqueSessionsCount)}</div>
        <div className="text-sm text-blue-800">Total Sessions</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-2xl font-bold text-green-600">
          {summary.uniqueSessionsCount > 0 ? Math.round(summary.totalClicks / summary.uniqueSessionsCount) : 0}
        </div>
        <div className="text-sm text-green-800">Clicks per Session</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">
          {summary.uniqueUsersCount > 0 ? (summary.uniqueSessionsCount / summary.uniqueUsersCount).toFixed(1) : 0}
        </div>
        <div className="text-sm text-purple-800">Sessions per User</div>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">
          {sessions.length > 0 ? 
            formatSessionDuration(sessions.reduce((acc, session) => acc + (session.sessionDuration || 0), 0) / sessions.length) 
            : '0 min'
          }
        </div>
        <div className="text-sm text-orange-800">Avg Session Duration</div>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks/Min</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sessions.map((session, index) => (
            <React.Fragment key={session.sessionId}>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    {session.userId ? (
                      <>
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {session.userName ? session.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {session.userName || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {session.userId.substring(0, 8)}...
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          A
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Anonymous</div>
                          <div className="text-xs text-gray-500">
                            {session.ipAddress ? formatIPAddress(session.ipAddress) : 'Unknown IP'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                  {session.sessionId?.substring(0, 10)}...
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>{getCountryFlag(session.location?.country)}</span>
                    <span>{session.location?.country || 'Unknown'}</span>
                    {session.location?.city && session.location.city !== 'Unknown' && (
                      <span>• {session.location.city}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>{getDeviceIcon(session.deviceType)}</span>
                    <span className="capitalize">{session.deviceType || 'desktop'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatSessionDuration(session.sessionDuration)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {session.totalClicks}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {session.uniqueItemsCount}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {session.clicksPerMinute?.toFixed(1) || '0'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(session.lastActivity).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => setSelectedItem({ type: 'session', data: session })}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    View Clicks
                  </button>
                </td>
              </tr>
              
              {/* Expanded session details when selected */}
              {selectedItem?.type === 'session' && selectedItem?.data?.sessionId === session.sessionId && (
                <tr>
                  <td colSpan="10" className="px-4 py-4 bg-gray-50">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            Session Details - {session.totalClicks} Clicks
                          </h4>
                          <div className="text-sm text-gray-600 mt-1">
                            {session.userId ? (
                              <span>User: <strong>{session.userName || 'Unknown'}</strong> ({session.userId.substring(0, 8)}...)</span>
                            ) : (
                              <span>Anonymous User - IP: {formatIPAddress(session.ipAddress)}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedItem(null)}
                          className="text-gray-400 hover:text-gray-600 text-lg"
                        >
                          ✕
                        </button>
                      </div>
                      
                      {/* Session Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="text-xs text-blue-600 font-medium">Start Time</div>
                          <div className="text-sm font-semibold">
                            {session.firstActivity ? new Date(session.firstActivity).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-medium">End Time</div>
                          <div className="text-sm font-semibold">
                            {new Date(session.lastActivity).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-medium">Session Duration</div>
                          <div className="text-sm font-semibold">
                            {formatSessionDuration(session.sessionDuration)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-medium">Clicks/Minute</div>
                          <div className="text-sm font-semibold">
                            {session.clicksPerMinute?.toFixed(1) || '0'}
                          </div>
                        </div>
                      </div>

                      {/* User Information */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-xs text-gray-600 font-medium">Device</div>
                          <div className="text-sm font-semibold flex items-center space-x-1">
                            <span>{getDeviceIcon(session.deviceType)}</span>
                            <span className="capitalize">{session.deviceType || 'desktop'}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 font-medium">Location</div>
                          <div className="text-sm font-semibold flex items-center space-x-1">
                            <span>{getCountryFlag(session.location?.country)}</span>
                            <span>{session.location?.country || 'Unknown'}</span>
                            {session.location?.city && session.location.city !== 'Unknown' && (
                              <span>• {session.location.city}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 font-medium">User Type</div>
                          <div className="text-sm font-semibold">
                            {session.userId ? (
                              <span className="text-green-600">Registered User</span>
                            ) : (
                              <span className="text-orange-600">Anonymous Visitor</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Click Details Table */}
                      {session.clicks && session.clicks.length > 0 ? (
                        <div className="overflow-x-auto max-h-96">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Display Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {session.clicks
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .map((click, clickIndex) => (
                                <tr key={clickIndex} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                                    {click.timestamp ? new Date(click.timestamp).toLocaleTimeString() : 'N/A'}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                      click.itemType === 'phone' ? 'bg-green-100 text-green-800' :
                                      click.itemType === 'whatsapp' ? 'bg-green-100 text-green-800' :
                                      click.itemType === 'email' ? 'bg-blue-100 text-blue-800' :
                                      click.itemType === 'instagram' ? 'bg-pink-100 text-pink-800' :
                                      click.itemType === 'facebook' ? 'bg-blue-100 text-blue-800' :
                                      click.itemType === 'website' ? 'bg-purple-100 text-purple-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {click.itemType}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                                    {click.displayName}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-gray-600 max-w-xs">
                                    <div className="truncate" title={click.itemValue}>
                                      {click.itemValue}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                                    {click.propertyId ? (
                                      <span className="text-green-600">Yes</span>
                                    ) : (
                                      <span className="text-gray-400">No</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-gray-500 text-xs">
                                    <div className="truncate max-w-xs" title={click.pageUrl}>
                                      {click.pageUrl || 'N/A'}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v8m-6 0h6m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p>No detailed click data available for this session</p>
                        </div>
                      )}

                      {/* Click Statistics */}
                      {session.clicks && session.clicks.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="text-xs text-green-600 font-medium">Total Clicks</div>
                            <div className="text-sm font-semibold">{session.clicks.length}</div>
                          </div>
                          <div>
                            <div className="text-xs text-green-600 font-medium">Unique Items</div>
                            <div className="text-sm font-semibold">
                              {new Set(session.clicks.map(click => click.itemValue)).size}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-green-600 font-medium">Item Types</div>
                            <div className="text-sm font-semibold">
                              {new Set(session.clicks.map(click => click.itemType)).size}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-green-600 font-medium">Properties</div>
                            <div className="text-sm font-semibold">
                              {new Set(session.clicks.filter(click => click.propertyId).map(click => click.propertyId)).size}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Item Type Breakdown */}
                      {session.clicks && session.clicks.length > 0 && (
                        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                          <h5 className="text-sm font-semibold text-purple-800 mb-2">Click Type Breakdown</h5>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(
                              session.clicks.reduce((acc, click) => {
                                acc[click.itemType] = (acc[click.itemType] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([type, count]) => (
                              <div key={type} className="bg-white px-3 py-1 rounded-full text-xs border border-purple-200">
                                <span className="font-medium capitalize">{type}:</span> 
                                <span className="ml-1 text-purple-600">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
    
    {sessions.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        <p>No session data available for the selected timeframe.</p>
      </div>
    )}
  </div>
)}

{viewMode === 'hourly-analysis' && (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold text-gray-800">Hourly Click Analysis</h3>
      <div className="flex items-center space-x-4">
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
        {hourlyData?.data?.summary && (
          <div className="text-sm text-gray-600">
            Peak: {hourlyData.data.summary.peakHour?.hourLabel} ({hourlyData.data.summary.peakHour?.clicks || 0} clicks)
          </div>
        )}
      </div>
    </div>

    {loading ? (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    ) : error ? (
      <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    ) : !hourlyData?.data?.hourlyDistribution ? (
      <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
        No hourly data available
      </div>
    ) : (
      <>
        {/* Summary Cards - FIXED */}
        {hourlyData.data.summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {hourlyData.data.summary.totalClicks || 0}
              </div>
              <div className="text-sm text-blue-800">Total Clicks</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {hourlyData.data.hourlyDistribution.filter(hour => hour.clicks > 0).length}
              </div>
              <div className="text-sm text-green-800">Active Hours</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {hourlyData.data.summary.averageClicksPerHour || 0}
              </div>
              <div className="text-sm text-purple-800">Avg/Hour</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">
                {hourlyData.data.summary.peakHour?.clicks || 0}
              </div>
              <div className="text-sm text-orange-800">Peak Hour</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Chart - FIXED */}
          <div className="xl:col-span-2">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-4 text-center">Click Distribution by Hour (24h)</h4>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={hourlyData.data.hourlyDistribution || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hourFormatted" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'clicks') return [value, 'Clicks'];
                      if (name === 'uniqueSessionsCount') return [value, 'Sessions'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Hour: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="clicks" 
                    name="Total Clicks"
                    fill="#8884d8" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="uniqueSessionsCount" 
                    name="Unique Sessions"
                    fill="#82ca9d" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hours & Statistics - FIXED */}
          <div className="space-y-6">
            {/* Peak Hours Ranking */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Peak Hours Ranking</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(hourlyData.data.hourlyDistribution || [])
                  .filter(hour => hour && typeof hour.clicks !== 'undefined')
                  .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                  .slice(0, 10)
                  .map((item, index) => (
                    <div 
                      key={item.hour} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 shadow-lg' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <span className="font-medium block text-gray-800">
                            {item.hourFormatted || `${item.hour}:00`}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.periodLabel} • {item.uniqueSessionsCount || 0} sessions
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-semibold text-blue-600 block">
                          {item.clicks || 0}
                        </span>
                        <span className="text-xs text-gray-500">clicks</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Period Performance */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Performance Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm font-medium text-gray-700">
                    Total Hours Active
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {hourlyData.data.hourlyDistribution?.filter(hour => hour.clicks > 0).length || 0}/24
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm font-medium text-gray-700">
                    Best Time
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {hourlyData.data.summary?.peakHour?.hourLabel || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {hourlyData.data.summary?.peakHour?.clicks || 0} clicks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics - FIXED */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Engagement Rate by Hour</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hourlyData.data.hourlyDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hourFormatted" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : '0', 'Engagement Rate']}
                  labelFormatter={(label) => `Hour: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="engagementRate" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  dot={{ fill: '#ff7300', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Clicks vs Sessions</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={hourlyData.data.hourlyDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hourFormatted" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  name="Clicks"
                />
                <Area 
                  type="monotone" 
                  dataKey="uniqueSessionsCount" 
                  stackId="1"
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  name="Sessions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    )}
  </div>
)}
      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Complete Click Details</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Display Name</label>
                    <p className="text-sm text-gray-900 font-semibold">{selectedItem.displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Item Type</label>
                    <p className="text-sm text-gray-900 capitalize">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedItem.itemType}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Item Value</label>
                    <p className="text-sm text-gray-900 font-mono break-all bg-gray-50 p-2 rounded">
                      {selectedItem.itemValue}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Page URL</label>
                    <p className="text-sm text-gray-900 break-all">{selectedItem.pageUrl}</p>
                  </div>
                  {selectedItem.propertyId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Property ID</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedItem.propertyId}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Session ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedItem.sessionId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Device Type</label>
                    <p className="text-sm text-gray-900 capitalize flex items-center space-x-2">
                      <span className="text-lg">{getDeviceIcon(selectedItem.deviceType)}</span>
                      <span>{selectedItem.deviceType}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-sm text-gray-900 flex items-center space-x-2">
                      <span className="text-lg">{getCountryFlag(selectedItem.country)}</span>
                      <span>{selectedItem.country}</span>
                      {selectedItem.city !== 'Unknown' && (
                        <span className="text-gray-500">• {selectedItem.city}</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                    <p className="text-sm text-gray-900 font-mono">{formatIPAddress(selectedItem.ipAddress)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Timestamp</label>
                    <p className="text-sm text-gray-900">{new Date(selectedItem.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedItem.userAgent && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-500">User Agent</label>
                  <p className="text-xs text-gray-900 font-mono break-all bg-gray-50 p-2 rounded mt-1">
                    {selectedItem.userAgent}
                  </p>
                </div>
              )}

              {/* Additional metrics for popular items */}
              {selectedItem.clickCount && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{selectedItem.clickCount}</div>
                      <div className="text-xs text-gray-500">Total Clicks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{selectedItem.uniqueUsersCount}</div>
                      <div className="text-xs text-gray-500">Unique Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{selectedItem.uniqueSessionsCount}</div>
                      <div className="text-xs text-gray-500">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">{selectedItem.countriesCount}</div>
                      <div className="text-xs text-gray-500">Countries</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClickAnalyticsDetails;