import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddPropertyClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  // Check for admin in multiple possible fields
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true || user?.admin === true;

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-black text-white shadow-lg border-b border-blue-700 z-50 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-90 transition-opacity flex-shrink-0"
            onClick={handleNavLinkClick}
          >
     
            <div className="sm:block">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
                <span className="text-blue-400">CLEAR</span>
                <span className="text-yellow-300">TITLE 1</span>
              </div>
              <div className="text-xs text-gray-300 font-medium mt-0.5">
                100% Legal Verification
              </div>
            </div>
          </Link>

          {/* Desktop Navigation (lg and above) */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 2xl:space-x-6">
            <Link 
              to="/" 
              className="hover:text-yellow-300 transition-colors px-3 py-2 xl:px-4 xl:py-3 rounded-lg text-sm font-medium border border-transparent hover:border-blue-600 whitespace-nowrap bg-blue-800/30 backdrop-blur-sm"
            >
              Properties
            </Link>
            
            <Link 
              to="/featured" 
              className="hover:text-yellow-300 transition-colors px-3 py-2 xl:px-4 xl:py-3 rounded-lg text-sm font-medium border border-transparent hover:border-blue-600 whitespace-nowrap bg-blue-800/30 backdrop-blur-sm"
            >
              Featured
            </Link>
            
            {/* Admin Dashboard Button - Only for Admin Users */}
            {isAdmin && (
              <Link 
                to="/admin"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 xl:px-5 xl:py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-colors text-sm border border-purple-500 flex items-center space-x-2 whitespace-nowrap shadow-lg"
              >
                <svg className="w-4 h-4 xl:w-5 xl:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden xl:inline">Admin</span>
              </Link>
            )}
            
            {/* Add Property Button */}
            <div className="relative">
              <Link 
                to={user ? "/add-property" : "#"}
                onClick={handleAddPropertyClick}
                className={`px-4 py-2 xl:px-5 xl:py-3 rounded-lg font-medium transition-colors border text-sm whitespace-nowrap shadow-lg ${
                  user 
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 border-yellow-400" 
                    : "bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600"
                }`}
              >
                <span className="hidden xl:inline">Add Property</span>
                <span className="xl:hidden">Add</span>
              </Link>
              
              {showTooltip && !user && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-blue-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap z-50 border border-blue-600 shadow-xl">
                  Please login to add property
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-800 rotate-45 border-t border-l border-blue-600"></div>
                </div>
              )}
            </div>
            
            {user ? (
              <div className="flex items-center space-x-3 xl:space-x-4">
                <Link 
                  to="/profile" 
                  className="hover:text-yellow-300 transition-colors px-3 py-2 xl:px-4 xl:py-3 rounded-lg text-sm font-medium border border-transparent hover:border-blue-600 whitespace-nowrap bg-blue-800/30 backdrop-blur-sm"
                >
                  <span className="hidden 2xl:inline">Welcome, </span>{user.username}
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 px-4 py-2 xl:px-5 xl:py-3 rounded-lg transition-colors text-sm font-medium border border-yellow-400 whitespace-nowrap shadow-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 xl:space-x-4">
                <Link 
                  to="/login" 
                  className="hover:text-yellow-300 transition-colors px-3 py-2 xl:px-4 xl:py-3 rounded-lg text-sm font-medium border border-transparent hover:border-blue-600 whitespace-nowrap bg-blue-800/30 backdrop-blur-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 xl:px-5 xl:py-3 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-600 transition-colors text-sm border border-yellow-400 whitespace-nowrap shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Tablet Navigation (md to lg) */}
          <div className="hidden md:flex lg:hidden items-center space-x-2 xl:space-x-3">
            {isAdmin && (
              <Link 
                to="/admin"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-2 xl:p-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-colors text-sm border border-purple-500 shadow-lg"
                title="Admin Dashboard"
              >
                <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </Link>
            )}
            
            <div className="relative">
              <Link 
                to={user ? "/add-property" : "#"}
                onClick={handleAddPropertyClick}
                className={`p-2 xl:p-3 rounded-lg font-medium transition-colors border text-sm shadow-lg ${
                  user 
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 border-yellow-400" 
                    : "bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600"
                }`}
                title="Add Property"
              >
                <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>

            {user ? (
              <div className="flex items-center space-x-2 xl:space-x-3">
                <Link 
                  to="/profile" 
                  className="p-2 xl:p-3 hover:text-yellow-300 transition-colors rounded-lg text-sm font-medium border border-transparent hover:border-blue-600 bg-blue-800/30 backdrop-blur-sm"
                  title="Profile"
                >
                  <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 p-2 xl:p-3 rounded-lg transition-colors text-sm font-medium border border-yellow-400 shadow-lg"
                  title="Logout"
                >
                  <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 xl:space-x-3">
                <Link 
                  to="/login" 
                  className="p-2 xl:p-3 hover:text-yellow-300 transition-colors rounded-lg text-sm font-medium border border-transparent hover:border-blue-600 bg-blue-800/30 backdrop-blur-sm"
                  title="Login"
                >
                  <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black p-2 xl:p-3 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-600 transition-colors text-sm border border-yellow-400 shadow-lg"
                  title="Register"
                >
                  <svg className="w-5 h-5 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button (sm and below) */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg hover:text-yellow-300 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 border border-blue-600 transition-colors bg-blue-800/30 backdrop-blur-sm"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-5 w-5 sm:h-6 sm:w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-5 w-5 sm:h-6 sm:w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-gradient-to-b from-blue-900 to-black border-t border-blue-700 shadow-xl`}>
        <div className="px-2 pt-2 pb-4 space-y-1">
          {/* Brand Header in Mobile */}
          <div className="px-4 py-3 border-b border-blue-700 mb-2">
            <div className="flex items-center space-x-3">
              <img 
                className="w-8 h-8 object-contain" 
                src="/logo.png" 
                alt="CLEAR TITLE 1 Logo" 
              />
              <div>
                <div className="text-base font-bold">
                  <span className="text-blue-400">CLEAR</span>
                  <span className="text-yellow-300">TITLE 1</span>
                </div>
                <div className="text-xs text-gray-300">100% Legal Verification</div>
              </div>
            </div>
          </div>

          {/* Main Navigation Links */}
          <Link
            to="/"
            className="block px-4 py-3 rounded-lg text-sm font-medium hover:text-yellow-300 hover:bg-blue-800 transition-colors border border-transparent hover:border-blue-600"
            onClick={handleNavLinkClick}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Properties</span>
            </div>
          </Link>

          <Link
            to="/featured"
            className="block px-4 py-3 rounded-lg text-sm font-medium hover:text-yellow-300 hover:bg-blue-800 transition-colors border border-transparent hover:border-blue-600"
            onClick={handleNavLinkClick}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span>Featured Properties</span>
            </div>
          </Link>

          {/* Admin Dashboard */}
          {isAdmin && (
            <Link
              to="/admin"
              className="block px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-colors border border-purple-500"
              onClick={handleNavLinkClick}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Admin Dashboard</span>
              </div>
            </Link>
          )}

          {/* Add Property */}
          <div className="relative">
            <Link
              to={user ? "/add-property" : "#"}
              onClick={handleAddPropertyClick}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${
                user 
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 border-yellow-400" 
                  : "bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Property</span>
              </div>
            </Link>
            
            {showTooltip && !user && (
              <div className="absolute left-0 right-0 mt-2 mx-2 bg-blue-800 text-white text-xs px-3 py-2 rounded-lg z-50 border border-blue-600">
                Please login to add property
                <div className="absolute -top-1 left-4 w-2 h-2 bg-blue-800 rotate-45 border-t border-l border-blue-600"></div>
              </div>
            )}
          </div>

          {/* User Section */}
          {user ? (
            <>
              <Link
                to="/profile"
                className="block px-4 py-3 rounded-lg text-sm font-medium hover:text-yellow-300 hover:bg-blue-800 transition-colors border border-transparent hover:border-blue-600"
                onClick={handleNavLinkClick}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile ({user.username})</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transition-colors border border-yellow-400"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </div>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-3 rounded-lg text-sm font-medium hover:text-yellow-300 hover:bg-blue-800 transition-colors border border-transparent hover:border-blue-600"
                onClick={handleNavLinkClick}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Login</span>
                </div>
              </Link>
              <Link
                to="/register"
                className="block px-4 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 transition-colors border border-yellow-400"
                onClick={handleNavLinkClick}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Register</span>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}