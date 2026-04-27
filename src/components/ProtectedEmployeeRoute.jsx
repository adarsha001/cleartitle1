// frontend/src/components/ProtectedEmployeeRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';

const ProtectedEmployeeRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, isAdmin } = useEmployeeAuth();
  
  console.log("ProtectedEmployeeRoute - Status:", { 
    isAuthenticated, 
    loading, 
    isAdmin 
  });
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Wait for auth to be determined
  if (!isAuthenticated) {
    console.log("ProtectedEmployeeRoute: Not authenticated, redirecting to login");
    return <Navigate to="/employee-login" replace />;
  }
  
  // Check admin access if required
  if (adminOnly && !isAdmin) {
    console.log("ProtectedEmployeeRoute: Admin access required");
    return <Navigate to="/employee-dashboard" replace />;
  }
  
  // Render children if authenticated
  return children;
};

export default ProtectedEmployeeRoute;