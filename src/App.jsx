import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Just change the import source, everything else stays the same
import { Helmet, HelmetProvider } from 'react-v19-helmet-async';
import Navbar from "./components/Navbar";
// import PropertyList from "./pages/PropertyList";
import PropertyDetail from "./pages/PropertyDetail";
import FeaturedProperties from "./pages/FeaturedProperties";
import AddProperty from "./pages/AddProperty";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { AuthProvider, useAuth } from "./context/AuthContext";
// import { LikesProvider } from "./context/LikesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./container/Home";
import { ViewModeProvider } from "./context/ViewModeContext";

// Admin Pages
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import AdminProperties from "./components/AdminProperties";
import AdminClickAnalytics from "./components/AdminClickAnalytics";

// Enquiry Components
import EnquiryForm from "./components/EnquiryForm";
import AdminEnquiries from "./components/AdminEnquiries";

// NotFound Component
import NotFound from "./components/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import TermsAndConditionsSaimr from "./components/TermsAndConditions_SAIMR_Groups";
import Adminpropertyagent from "./components/Adminpropertyagent";
import PropertyUnitForm from "./components/PropertyUnitForm";
import PropertySelectionPage from "./pages/PropertySelectionPage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PropertyUnitsPage from "./components/PropertyUnitsPage";
import PropertyUnitDetail from "./components/PropertyUnitDetail";
import TermsAndConditionsClearTitle1 from "./components/TermsAndConditions_SAIMR_Groups";
import PropertyUnitList from "./components/PropertyUnitList";
import BatchCreateForm from "./components/BatchCreateForm";
import BatchUpdateForm from "./components/BatchUpdateForm";
import BatchDetails from "./components/BatchDetails";
import CategoryPropertiesPage from "./focusedapproach/CategoryPropertiesPage";
import Finalized from "./focusedapproach/finalized";

// Component to redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          {/* <LikesProvider> */}
            <ViewModeProvider>
              <ScrollToTop />
              
              {/* Global Helmet with default SEO settings */}
              <Helmet>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <html lang="en" />
              </Helmet>
              
              {/* <Navbar /> */}
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
              
            </ViewModeProvider>
          {/* </LikesProvider> */}
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}