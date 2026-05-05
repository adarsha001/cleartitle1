// components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { fetchPendingProperties } from "../api/adminApi";
import AdminProperties from "./AdminProperties";
import AdminUsers from "./AdminUsers";
import PropertyEdit from "./PropertyEdit";
import AdminClickAnalytics from "./AdminClickAnalytics";
import ClickAnalyticsDetails from "./ClickAnalyticsDetails";
import AdminEnquiries from "./AdminEnquiries";
import { useAuth } from "../context/AuthContext";
import PropertyForm from "./PropertyForm";
import AdminPropertyCard from "./AdminPropertyCard";
import Adminpropertyagent from "./Adminpropertyagent";
import AgentsPage from "./AgentsPage";
import AdminWebsiteAssignment from "./AdminWebsiteAssignment";
import AdminPropertyUnits from "./AdminPropertyUnits";
import AdminAgentPanel from "./AdminAgentPanel";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BatchAdminPanel from "./BatchAdminPanel";
import CarouselAdmin from "./CarouselAdmin";
import BatchAnalytics from "./AdminBatchAnalytics";
import AdminEmployee from "./AdminEmployee";
import CardAdsManager from "./AdminCardAdManagement";

// Inline LoadingSpinner component
const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("property-units");
  const [editingProperty, setEditingProperty] = useState(null);
  const [analyticsView, setAnalyticsView] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Safe check for auth
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    if (!authLoading && isAuthenticated && !user?.isAdmin) {
      window.location.href = '/';
      return;
    }
  }, [authLoading, isAuthenticated, user]);

  const getProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchPendingProperties();
      setProperties(data.properties);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "dashboard") {
      getProperties();
    }
  }, [activeSection]);

  const handleEditProperty = (propertyId) => {
    setEditingProperty(propertyId);
  };

  const handlePropertyUpdated = () => {
    setEditingProperty(null);
    if (activeSection === "dashboard") {
      getProperties();
    }
  };

  const handleCreateProperty = async (propertyData) => {
    try {
      setActiveSection("properties");
    } catch (err) {
      setError(err.message || 'Failed to create property');
    }
  };

  const handleRetry = () => {
    if (activeSection === "dashboard") {
      getProperties();
    }
  };

  // Color mapping for different sections
  const sectionColors = {
    properties: {
      bg: "bg-emerald-600",
      hover: "hover:bg-emerald-700",
      active: "bg-emerald-700",
      text: "text-emerald-600",
      border: "border-emerald-200",
      light: "bg-emerald-50"
    },
    "property-agent": {
      bg: "bg-teal-600",
      hover: "hover:bg-teal-700",
      active: "bg-teal-700",
      text: "text-teal-600",
      border: "border-teal-200",
      light: "bg-teal-50"
    },
    agents: {
      bg: "bg-pink-600",
      hover: "hover:bg-pink-700",
      active: "bg-pink-700",
      text: "text-pink-600",
      border: "border-pink-200",
      light: "bg-pink-50"
    },
    carosel: {
      bg: "bg-purple-600",
      hover: "hover:bg-purple-700",
      active: "bg-purple-700",
      text: "text-purple-600",
      border: "border-purple-200",
      light: "bg-purple-50"
    },
    "agent-management": {
      bg: "bg-rose-600",
      hover: "hover:bg-rose-700",
      active: "bg-rose-700",
      text: "text-rose-600",
      border: "border-rose-200",
      light: "bg-rose-50"
    },
    "website-assignment": {
      bg: "bg-cyan-600",
      hover: "hover:bg-cyan-700",
      active: "bg-cyan-700",
      text: "text-cyan-600",
      border: "border-cyan-200",
      light: "bg-cyan-50"
    },
    "BatchAdminPanel": {
      bg: "bg-indigo-600",
      hover: "hover:bg-indigo-700",
      active: "bg-indigo-700",
      text: "text-indigo-600",
      border: "border-indigo-200",
      light: "bg-indigo-50"
    },
    "property-form": {
      bg: "bg-violet-600",
      hover: "hover:bg-violet-700",
      active: "bg-violet-700",
      text: "text-violet-600",
      border: "border-violet-200",
      light: "bg-violet-50"
    },
    users: {
      bg: "bg-fuchsia-600",
      hover: "hover:bg-fuchsia-700",
      active: "bg-fuchsia-700",
      text: "text-fuchsia-600",
      border: "border-fuchsia-200",
      light: "bg-fuchsia-50"
    },
    batch_analytics: {
      bg: "bg-orange-600",
      hover: "hover:bg-orange-700",
      active: "bg-orange-700",
      text: "text-orange-600",
      border: "border-orange-200",
      light: "bg-orange-50"
    },
    "employee-dashboard": {
      bg: "bg-amber-600",
      hover: "hover:bg-amber-700",
      active: "bg-amber-700",
      text: "text-amber-600",
      border: "border-amber-200",
      light: "bg-amber-50"
    },
    analytics: {
      bg: "bg-blue-600",
      hover: "hover:bg-blue-700",
      active: "bg-blue-700",
      text: "text-blue-600",
      border: "border-blue-200",
      light: "bg-blue-50"
    },
    enquiries: {
      bg: "bg-amber-600",
      hover: "hover:bg-amber-700",
      active: "bg-amber-700",
      text: "text-amber-600",
      border: "border-amber-200",
      light: "bg-amber-50"
    },
    "property-units": {
      bg: "bg-slate-700",
      hover: "hover:bg-slate-800",
      active: "bg-slate-800",
      text: "text-slate-700",
      border: "border-slate-200",
      light: "bg-slate-50"
    },
      "card-ads": {
    bg: "bg-sky-600",
    hover: "hover:bg-sky-700",
    active: "bg-sky-700",
    text: "text-sky-600",
    border: "border-sky-200",
    light: "bg-sky-50"
  }
  };

  if (authLoading) {
    return <LoadingSpinner message="Checking admin permissions..." />;
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const renderErrorState = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center py-20">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    if (error && activeSection === "dashboard") {
      return renderErrorState();
    }

    switch (activeSection) {
      case "properties":
        return <AdminProperties onEditProperty={handleEditProperty} />;
      case "property-agent":
        return <AdminAgentPanel />;
      case "agents":
        return <AdminAgentPanel />;
      case "agent-management":
        return <AdminAgentPanel />;
      case "employee-dashboard":
        return <AdminEmployee />;
        case "card-ads":
  return <CardAdsManager />;
      case "property-units":
        return (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Property Units Management
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Manage individual property units with advanced filtering and bulk actions
                </p>
              </div>
              <button
                onClick={() => setActiveSection("properties")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Properties</span>
              </button>
            </div>
            <AdminPropertyUnits />
          </div>
        );
      case "website-assignment":
        return (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Website Assignment Management
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Manage which properties appear on ClearTitle (parent) and SAIMR (child) websites
                </p>
              </div>
              <button
                onClick={() => setActiveSection("properties")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Properties</span>
              </button>
            </div>
            <AdminWebsiteAssignment />
          </div>
        );
      case "users":
        return <AdminUsers />;
      case "carosel":
        return <CarouselAdmin />;
      case "BatchAdminPanel":
        return <BatchAdminPanel />;
      case "analytics":
        return (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {analyticsView === "overview" ? "Click Analytics Overview" : "Detailed Click Analytics"}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  {analyticsView === "overview" 
                    ? "High-level overview of user interactions" 
                    : "Complete tracking and analysis of all user interactions"
                  }
                </p>
              </div>
              <div className="flex justify-center sm:justify-end space-x-2">
                <button
                  onClick={() => setAnalyticsView("overview")}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                    analyticsView === "overview"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setAnalyticsView("details")}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm sm:text-base ${
                    analyticsView === "details"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>Detailed View</span>
                </button>
              </div>
            </div>
            {analyticsView === "overview" ? <AdminClickAnalytics /> : <ClickAnalyticsDetails />}
          </div>
        );
      case "enquiries":
        return <AdminEnquiries />;
      case "batch_analytics":
        return <BatchAnalytics />;
      case "property-form":
        return (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Add New Property with Agent
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Create new property listings with agent contact information
                </p>
              </div>
              <button
                onClick={() => setActiveSection("properties")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Properties</span>
              </button>
            </div>
            <PropertyForm 
              onSubmit={handleCreateProperty}
              onClose={() => setActiveSection("properties")}
            />
          </div>
        );
      case "edit":
        return <PropertyForm />;
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-700">Select a section to get started</h2>
          </div>
        );
    }
  };

  if (loading && activeSection === "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="text-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-start sm:items-center">
            <div>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 sm:gap-3 text-blue-600 hover:text-blue-800 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold tracking-wide text-sm sm:text-base">
                  Back to Properties
                </span>
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your real estate platform</p>
              {user && (
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  Welcome, {user.name} ({user.username})
                </p>
              )}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-100">
          {/* Desktop Navigation */}
          <div className="hidden sm:flex flex-wrap gap-2">
            {/* Properties */}
            <button
              onClick={() => {
                setActiveSection("properties");
                setAnalyticsView("overview");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "properties"
                  ? `${sectionColors.properties.bg} text-white shadow-md ${sectionColors.properties.hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Properties</span>
            </button>

            {/* Property & Agent */}
            {/* <button
              onClick={() => {
                setActiveSection("property-agent");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "property-agent"
                  ? `${sectionColors["property-agent"].bg} text-white shadow-md ${sectionColors["property-agent"].hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Property & Agent</span>
            </button> */}

            {/* Agents */}
            <button
              onClick={() => {
                setActiveSection("agents");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "agents"
                  ? `${sectionColors.agents.bg} text-white shadow-md ${sectionColors.agents.hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Agents</span>
            </button>
            
            {/* Carousel */}
            <button
              onClick={() => {
                setActiveSection("carosel");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "carosel"
                  ? `${sectionColors.carosel.bg} text-white shadow-md ${sectionColors.carosel.hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Carousel</span>
            </button>
            <button
  onClick={() => {
    setActiveSection("card-ads");
    setError(null);
  }}
  className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
    activeSection === "card-ads"
      ? `${sectionColors["card-ads"].bg} text-white shadow-md ${sectionColors["card-ads"].hover}`
      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
  }`}
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
  <span>Card Ads</span>
</button>
            
            {/* Agent Management */}
            <button
              onClick={() => {
                setActiveSection("agent-management");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "agent-management"
                  ? `${sectionColors["agent-management"].bg} text-white shadow-md ${sectionColors["agent-management"].hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Agent Management</span>
            </button>

            {/* Website Assignment */}
            <button
              onClick={() => {
                setActiveSection("website-assignment");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "website-assignment"
                  ? `${sectionColors["website-assignment"].bg} text-white shadow-md ${sectionColors["website-assignment"].hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Website Assignment</span>
            </button>

            {/* Batch Assignment */}
            <button
              onClick={() => {
                setActiveSection("BatchAdminPanel");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "BatchAdminPanel"
                  ? `${sectionColors.BatchAdminPanel.bg} text-white shadow-md ${sectionColors.BatchAdminPanel.hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Batch Assignment</span>
            </button>
            
            {/* Add Property */}
            {/* <button
              onClick={() => {
                setActiveSection("property-form");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "property-form"
                  ? `${sectionColors["property-form"].bg} text-white shadow-md ${sectionColors["property-form"].hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Property</span>
            </button> */}

            {/* Users */}
            <button
              onClick={() => {
                setActiveSection("users");
                setAnalyticsView("overview");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "users"
                  ? `${sectionColors.users.bg} text-white shadow-md ${sectionColors.users.hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Users</span>
            </button>

            {/* Batch Analytics */}
            <button
              onClick={() => {
                setActiveSection("batch_analytics");
                setAnalyticsView("overview");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "batch_analytics"
                  ? `${sectionColors.batch_analytics.bg} text-white shadow-md ${sectionColors.batch_analytics.hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Batch Analytics</span>
            </button>

            {/* Employee Management */}
            <button
              onClick={() => {
                setActiveSection("employee-dashboard");
                setAnalyticsView("overview");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "employee-dashboard"
                  ? `${sectionColors["employee-dashboard"].bg} text-white shadow-md ${sectionColors["employee-dashboard"].hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Employees</span>
            </button>

            {/* Click Analytics */}
            {/* <button
              onClick={() => {
                setActiveSection("analytics");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "analytics"
                  ? `${sectionColors.analytics.bg} text-white shadow-md ${sectionColors.analytics.hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Click Analytics</span>
            </button> */}

            {/* Enquiries */}
            <button
              onClick={() => {
                setActiveSection("enquiries");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "enquiries"
                  ? `${sectionColors.enquiries.bg} text-white shadow-md ${sectionColors.enquiries.hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>Enquiries</span>
            </button>
            
            {/* Property Units */}
            <button
              onClick={() => {
                setActiveSection("property-units");
                setAnalyticsView("overview");
                setError(null);
              }}
              className={`px-4 sm:px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm shadow-sm ${
                activeSection === "property-units"
                  ? `${sectionColors["property-units"].bg} text-white shadow-md ${sectionColors["property-units"].hover}`
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Property Units</span>
            </button>
          </div>

          {/* Mobile Navigation - Similar color scheme */}
          <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="flex flex-col space-y-2">
              {/* Add all mobile buttons with corresponding colors - same pattern as desktop */}
              <button
                onClick={() => {
                  setActiveSection("properties");
                  setAnalyticsView("overview");
                  setError(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 justify-center ${
                  activeSection === "properties"
                    ? `${sectionColors.properties.bg} text-white shadow-md`
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Properties</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection("employee-dashboard");
                  setAnalyticsView("overview");
                  setError(null);
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 justify-center ${
                  activeSection === "employee-dashboard"
                    ? `${sectionColors["employee-dashboard"].bg} text-white shadow-md`
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Employees</span>
              </button>
              
              {/* Add remaining mobile buttons similarly */}
            </div>
          </div>
        </div>

        {/* Active Section Content */}
        <div className="bg-white rounded-xl shadow-lg min-h-[400px] sm:min-h-[600px] overflow-hidden border border-gray-100">
          {renderActiveSection()}
        </div>

        {/* Property Edit Modal */}
        {editingProperty && (
          <PropertyEdit
            propertyId={editingProperty}
            onClose={() => setEditingProperty(null)}
            onUpdate={handlePropertyUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;