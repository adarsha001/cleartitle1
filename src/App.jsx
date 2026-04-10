import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Helmet, HelmetProvider } from 'react-v19-helmet-async';
import { useEffect, useState } from 'react';
import Navbar from "./components/Navbar";
import PropertyDetail from "./pages/PropertyDetail";
import FeaturedProperties from "./pages/FeaturedProperties";
import AddProperty from "./pages/AddProperty";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./container/Home";
import { ViewModeProvider } from "./context/ViewModeContext";
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import AdminProperties from "./components/AdminProperties";
import AdminClickAnalytics from "./components/AdminClickAnalytics";
import EnquiryForm from "./components/EnquiryForm";
import AdminEnquiries from "./components/AdminEnquiries";
import NotFound from "./components/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import TermsAndConditionsClearTitle1 from "./components/TermsAndConditions_SAIMR_Groups";
import Adminpropertyagent from "./components/Adminpropertyagent";
import PropertyUnitForm from "./components/PropertyUnitForm";
import PropertySelectionPage from "./pages/PropertySelectionPage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropertyUnitsPage from "./components/PropertyUnitsPage";
import PropertyUnitDetail from "./components/PropertyUnitDetail";
import PropertyUnitList from "./components/PropertyUnitList";
import BatchCreateForm from "./components/BatchCreateForm";
import BatchUpdateForm from "./components/BatchUpdateForm";
import BatchDetails from "./components/BatchDetails";
import CategoryPropertiesPage from "./focusedapproach/CategoryPropertiesPage";
import Finalized from "./focusedapproach/finalized";
import CarouselAdmin from "./components/CarouselAdmin";
import TruecallerAuth from "./components/TruecallerAuth"; // Import your component

// Component to redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

// Modal component for Truecaller prompt
const TruecallerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Quick Login Required
          </h3>
          <p className="text-gray-600 text-sm">
            Please login with Truecaller to continue
          </p>
        </div>
        
        <TruecallerAuth 
          onSuccess={() => {
            window.location.reload(); // Refresh after successful login
          }}
          onError={(error) => {
            console.error('Login failed:', error);
            alert('Login failed: ' + error);
          }}
          redirectUrl="/"
        />
        
        <p className="text-xs text-center text-gray-500 mt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

// Wrapper component to handle Truecaller prompt for unauthenticated users
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showTruecallerPrompt, setShowTruecallerPrompt] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  useEffect(() => {
    // Show Truecaller prompt after 5 seconds if user is not authenticated
    if (!loading && !isAuthenticated && !hasShownPrompt) {
      const timer = setTimeout(() => {
        setShowTruecallerPrompt(true);
        setHasShownPrompt(true);
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, hasShownPrompt]);

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Global Enquiry Form - Shows on all pages except admin */}
      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*" element={<EnquiryForm />} />
      </Routes>
      
      <Routes>
        {/* Public Routes - With SEO Meta Tags */}
        <Route 
          path="/" 
          element={
            <>
              <Helmet>
                <title>Your Property Site - Find Your Dream Property</title>
                <meta name="description" content="Discover the best properties, real estate listings, and property units. Find your dream home today!" />
                <meta name="keywords" content="real estate, properties, property units, homes for sale, rental properties" />
                <link rel="canonical" href="https://yourdomain.com/" />
                
                {/* Open Graph */}
                <meta property="og:title" content="Your Property Site" />
                <meta property="og:description" content="Find your dream property today" />
                <meta property="og:url" content="https://yourdomain.com/" />
                <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Your Property Site" />
                <meta name="twitter:description" content="Find your dream property today" />
              </Helmet>
              <Finalized/>
            </>
          } 
        />
        
        <Route 
          path="/properties-unit" 
          element={
            <>
              <Helmet>
                <title>Property Units - Your Property Site</title>
                <meta name="description" content="Browse all available property units. Find your perfect match from our extensive collection." />
                <link rel="canonical" href="https://yourdomain.com/properties-unit" />
              </Helmet>
              <PropertyUnitsPage />
            </>
          } 
        />
        
        <Route 
          path="/featured" 
          element={
            <>
              <Helmet>
                <title>Featured Properties - Your Property Site</title>
                <meta name="description" content="Check out our featured properties - handpicked selections of the best real estate listings available now." />
                <link rel="canonical" href="https://yourdomain.com/featured" />
              </Helmet>
              <FeaturedProperties />
            </>
          } 
        />
        
        <Route 
          path="/property/:id" 
          element={
            <>
              <Helmet>
                <title>Property Details - Your Property Site</title>
                <meta name="description" content="View detailed information about this property including specifications, pricing, and availability." />
              </Helmet>
              <PropertyDetail />
            </>
          } 
        />
        
        <Route 
          path="/property-units" 
          element={
            <>
              <Helmet>
                <title>Property Units - Your Property Site</title>
                <meta name="description" content="Browse all available property units. Find your perfect match from our extensive collection." />
                <link rel="canonical" href="https://yourdomain.com/property-units" />
              </Helmet>
              <PropertyUnitList />
            </>
          } 
        />
        
        <Route 
          path="/property-units/:id" 
          element={
            <>
              <Helmet>
                <title>Property Unit Details - Your Property Site</title>
                <meta name="description" content="View detailed information about this property unit including specifications, pricing, and availability." />
              </Helmet>
              <PropertyUnitDetail />
            </>
          } 
        />
        
        <Route 
          path="/terms-and-conditions" 
          element={
            <>
              <Helmet>
                <title>Terms and Conditions - Your Property Site</title>
                <meta name="description" content="Read our terms and conditions to understand your rights and obligations when using our platform." />
                <link rel="canonical" href="https://yourdomain.com/terms-and-conditions" />
              </Helmet>
              <TermsAndConditionsClearTitle1 />
            </>
          } 
        />
        
        <Route 
          path="/properties/category/:categoryId" 
          element={
            <>
              <Helmet>
                <title>Category Properties - Your Property Site</title>
                <meta name="description" content="Browse properties by category. Find exactly what you're looking for in our curated collections." />
              </Helmet>
              <CategoryPropertiesPage />
            </>
          }
        />
        
        {/* Auth Routes - No SEO needed */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected User Routes - No SEO needed */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/carousel" element={<CarouselAdmin />} />
        <Route
          path="/add-property"
          element={
            <ProtectedRoute>
              <AddProperty />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/add-listing"
          element={
            <ProtectedRoute>
              <PropertyUnitForm />
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/batch/post/property-units" 
          element={
            <ProtectedRoute>
              <BatchCreateForm />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes - No SEO needed */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        
        <Route
          path="/admin/properties"
          element={
            <AdminRoute>
              <AdminProperties />
            </AdminRoute>
          }
        />
        
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminClickAnalytics />
            </AdminRoute>
          }
        />
        
        <Route
          path="/admin/enquiries"
          element={
            <AdminRoute>
              <AdminEnquiries />
            </AdminRoute>
          }
        />
        
        <Route 
          path="/admin/property-agent" 
          element={
            <AdminRoute>
              <Adminpropertyagent />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/batches/edit/:id" 
          element={
            <AdminRoute>
              <BatchUpdateForm />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/batches/:id" 
          element={
            <AdminRoute>
              <BatchDetails />
            </AdminRoute>
          } 
        />
        
        {/* 404 Route */}
        <Route 
          path="*" 
          element={<NotFound />} 
        />
      </Routes>

      {/* Truecaller Modal - Shows after 5 seconds if user not authenticated */}
      <TruecallerModal 
        isOpen={showTruecallerPrompt}
        onClose={() => setShowTruecallerPrompt(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ViewModeProvider>
            <ScrollToTop />
            
            {/* Global Helmet with default SEO settings */}
            <Helmet>
              <meta charSet="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <html lang="en" />
            </Helmet>
            
            <AppContent />
            
          </ViewModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}