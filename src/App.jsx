import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Helmet, HelmetProvider } from 'react-v19-helmet-async';
import { useEffect, useState, useRef } from 'react';
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
import TruecallerAuth from "./pages/TruecallerAuth";
import Employeelogin from './components/Employeelogin'
import EmployeeRegistration from './components/EmployeeRegistration'
import EmployeeDashboard from "./components/EmployeeDashboard";
import ProtectedEmployeeRoute from "./components/ProtectedEmployeeRoute";
import { EmployeeAuthProvider } from './context/EmployeeAuthContext';
import EmployeeProfile from "./components/EmployeeProfile";
import AdminEmployee from "./components/AdminEmployee";
import MyProperties from "./components/MyProperties";
import EditProperty from "./components/EditProperty";
import PropertyComparison from "./components/PropertyComparison";
import BatchAdminPanel from "./components/BatchAdminPanel";
import BatchListing from "./components/BatchListing";
import Topratedcompanies from "./pages/Topratedcompanies";
import BlogDetail from "./pages/BlogDetail";
import CardAdManagement from "./components/AdminCardAdManagement";

// Component to redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

// Helper function to detect if user is on Android mobile
const isAndroidMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  const isAndroid = /android/i.test(userAgent);
  const isMobile = /mobile/i.test(userAgent);
  const isNotIOS = !/iPad|iPhone|iPod/.test(userAgent);
  
  return isAndroid && isMobile && isNotIOS;
};

// Modal component for Truecaller prompt
const TruecallerModal = ({ isOpen, onClose }) => {
  const truecallerRef = useRef(null);
  const hasAutoTriggered = useRef(false);

  useEffect(() => {
    if (isOpen && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;
      
      setTimeout(() => {
        const truecallerButton = truecallerRef.current?.querySelector('button');
        if (truecallerButton && !truecallerButton.disabled) {
          console.log('Auto-triggering Truecaller login...');
          truecallerButton.click();
        } else {
          const anyButton = truecallerRef.current?.querySelector('[role="button"], button');
          if (anyButton && !anyButton.disabled) {
            anyButton.click();
          }
        }
      }, 1000);
    }
  }, [isOpen]);

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
            <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Quick Login Required
          </h3>
          <p className="text-gray-600 text-sm">
            Please wait, redirecting to Truecaller...
          </p>
        </div>
        
        <div ref={truecallerRef}>
          <TruecallerAuth 
            onSuccess={() => {
              window.location.reload();
            }}
            onError={(error) => {
              console.error('Login failed:', error);
              alert('Login failed: ' + error);
            }}
            redirectUrl="/"
          />
        </div>
        
        <p className="text-xs text-center text-gray-500 mt-4">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

// Wrapper component to handle Truecaller prompt
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showTruecallerPrompt, setShowTruecallerPrompt] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const truecallerInitialized = useRef(false);

  useEffect(() => {
    const androidUser = isAndroidMobile();
    setIsAndroid(androidUser);
    
    console.log('Device detection:', { 
      isAndroid: androidUser, 
      userAgent: navigator.userAgent 
    });
    
    if (!loading && !isAuthenticated && !hasShownPrompt && androidUser && !truecallerInitialized.current) {
      truecallerInitialized.current = true;
      const timer = setTimeout(() => {
        setShowTruecallerPrompt(true);
        setHasShownPrompt(true);
      }, 5000);

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
                <meta property="og:title" content="Your Property Site" />
                <meta property="og:description" content="Find your dream property today" />
                <meta property="og:url" content="https://yourdomain.com/" />
                <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
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
{/*         
        <Route 
          path="/terms-and-conditions" 
          element={
            <>
              <Helmet>
                <title>Terms and Conditions - Your Property Site</title>
                <meta name="description" content="Read our terms and conditions to understand your rights and obligations when using our platform." />
           
              </Helmet>
              <TermsAndConditionsClearTitle1 />
            </>
          } 
        /> */}
        
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

        {/* Employee Routes - Now inside the Routes but without Provider inside */}
        <Route path="/employee-login" element={<Employeelogin />} />
        <Route path="/employee-register" element={<EmployeeRegistration />} />
        <Route 
          path="/employee-dashboard" 
          element={
            <ProtectedEmployeeRoute>
              <EmployeeDashboard />
            </ProtectedEmployeeRoute>
          } 
        />
        <Route 
          path="/employee/profile" 
          element={
            <ProtectedEmployeeRoute>
              <EmployeeProfile />
            </ProtectedEmployeeRoute>
          } 
        />
               <Route
          path="/my-properties"
          element={
            <ProtectedRoute>
              <MyProperties />
            </ProtectedRoute>
          }
        />
             <Route
          path="/edit-property/:id"
          element={
            <ProtectedRoute>
              <EditProperty />
            </ProtectedRoute>
          }
        />
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route path="/compare-properties" element={<PropertyComparison />} />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected User Routes */}
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
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/batch"
          element={
            <AdminRoute>
              <BatchAdminPanel />
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
          path="/batch-listings" 
          element={
            <AdminRoute>
              <Topratedcompanies />
            </AdminRoute>
          } 
        />
         <Route path="/blog/:id" element={<BlogDetail />} />
        <Route 
          path="/admin/batches/:id" 
          element={
            <AdminRoute>
              <BatchDetails />
            </AdminRoute>
          } 
        />

        <Route path="/admin/card-ads" element={<CardAdManagement />} />
        
        {/* 404 Route */}
        <Route 
          path="*" 
          element={<NotFound />} 
        />
      </Routes>

      {/* Truecaller Modal */}
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
        {/* All Providers must be OUTSIDE of Routes */}
        <AuthProvider>
          <ViewModeProvider>
            <EmployeeAuthProvider>
              <ScrollToTop />
              
              <Helmet>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <html lang="en" />
              </Helmet>
              
              <AppContent />
            </EmployeeAuthProvider>
          </ViewModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}