import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const mobileMenuRef = useRef(null);
  const menuItemsRef = useRef([]);
  const isAdmin = user?.role === "admin" || user?.isAdmin === true || user?.admin === true;

  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      // Animate menu slide in from left
      gsap.fromTo(
        mobileMenuRef.current,
        {
          x: '-100%',
          opacity: 0,
        },
        {
          x: '0%',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out'
        }
      );

      // Animate menu items with stagger
      gsap.fromTo(
        menuItemsRef.current,
        {
          x: -50,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.08,
          delay: 0.1,
          ease: 'back.out(1.7)'
        }
      );
    }
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    // Animate menu slide out to left
    if (mobileMenuRef.current) {
      gsap.to(mobileMenuRef.current, {
        x: '-100%',
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setIsMobileMenuOpen(false);
        }
      });
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  const handleAddPropertyClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    }
    closeMobileMenu();
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  const addMenuItemToRefs = (el) => {
    if (el && !menuItemsRef.current.includes(el)) {
      menuItemsRef.current.push(el);
    }
  };

  return (
    <>
      <nav className="absolute top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <img 
                src="/logo.png" 
                className="w-14 h-14" 
                alt="Logo" 
              />
            </Link>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
                Properties
              </Link>

              <Link to="/featured" className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
                Featured
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Admin
                </Link>
              )}

              <Link
                to={user ? "/add-listing" : "#"}
                onClick={handleAddPropertyClick}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  user
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Add Property
              </Link>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
                    Profile
                  </Link>

                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {user.username}
                  </span>

                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            <button
              className="md:hidden text-gray-700 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu */}
          <div 
            ref={mobileMenuRef}
            className="md:hidden fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white shadow-xl z-50 transform -translate-x-full"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link 
                to="/" 
                className="flex items-center" 
                onClick={closeMobileMenu}
              >
                <img 
                  src="/logo.png" 
                  className="w-12 h-12" 
                  alt="Logo" 
                />
                <span className="ml-2 text-lg font-semibold text-gray-800">Menu</span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
              >
                ✕
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              <Link 
                ref={addMenuItemToRefs}
                to="/" 
                onClick={closeMobileMenu} 
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-2"
              >
                Properties
              </Link>

              <Link 
                ref={addMenuItemToRefs}
                to="/featured" 
                onClick={closeMobileMenu} 
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-2"
              >
                Featured
              </Link>

              {isAdmin && (
                <Link
                  ref={addMenuItemToRefs}
                  to="/admin"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-2"
                >
                  Admin
                </Link>
              )}

              <Link
                ref={addMenuItemToRefs}
                to={user ? "/add-listing" : "#"}
                onClick={handleAddPropertyClick}
                className={`block py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-2 ${
                  user
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Add Property
              </Link>

              {user ? (
                <>
                  <Link
                    ref={addMenuItemToRefs}
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-2"
                  >
                    Profile
                  </Link>

                  <div 
                    ref={addMenuItemToRefs}
                    className="block py-3 px-4 text-gray-700 bg-blue-50 border border-blue-100 rounded-lg"
                  >
                    <span className="text-sm font-medium text-blue-800">
                      Logged in as: {user.username}
                    </span>
                  </div>

                  <button
                    ref={addMenuItemToRefs}
                    onClick={handleLogout}
                    className="w-full text-left py-3 px-4 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-2 border border-gray-200 hover:border-red-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    ref={addMenuItemToRefs}
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-2"
                  >
                    Login
                  </Link>

                  <Link
                    ref={addMenuItemToRefs}
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block py-3 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-base font-medium transition-all duration-200 transform hover:translate-x-2 shadow-md"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                © {new Date().getFullYear()} All rights reserved
              </p>
            </div>
          </div>
        </>
      )}

      {showTooltip && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md shadow-lg z-[60]">
          Please login to add a property
        </div>
      )}
    </>
  );
}