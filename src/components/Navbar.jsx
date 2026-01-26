import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Desktop Navigation Component
function DesktopNav({ user, isAdmin, onAddPropertyClick, onLogout, showTooltip }) {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <Link to="/" className="text-gray-50 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
        Properties
      </Link>

      <Link to="/featured" className="text-gray-50 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
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
        onClick={onAddPropertyClick}
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
          <Link to="/profile" className="text-gray-50 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
            Profile
          </Link>

          <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            {user.username}
          </span>

          <button
            onClick={onLogout}
            className="text-gray-50 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-gray-50 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
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
  );
}

function MobileNav({ 
  isOpen, 
  user, 
  isAdmin, 
  onAddPropertyClick, 
  onLogout, 
  onClose,
  showTooltip 
}) {
  const mobileMenuRef = useRef(null);
  const menuItemsRef = useRef([]);
  const overlayRef = useRef(null);
  const menuContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize menu items array
      menuItemsRef.current = [];
      
      if (mobileMenuRef.current && overlayRef.current) {
        // Set initial state for overlay
        gsap.set(overlayRef.current, { opacity: 0, display: 'block' });
        
        // Animate overlay fade in
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });

        // Set initial state for menu
        gsap.set(mobileMenuRef.current, { 
          x: '-100%', 
          opacity: 0,
          display: 'block'
        });

        // Animate menu slide in
        gsap.to(mobileMenuRef.current, {
          x: '0%',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            // Animate menu items after a small delay
            setTimeout(() => {
              if (menuItemsRef.current.length > 0) {
                gsap.fromTo(
                  menuItemsRef.current,
                  {
                    x: -30,
                    opacity: 0
                  },
                  {
                    x: 0,
                    opacity: 1,
                    duration: 0.3,
                    stagger: 0.05,
                    ease: 'back.out(1.4)'
                  }
                );
              }
            }, 100);
          }
        });
      }
    } else {
      // Reset display properties when closed
      if (overlayRef.current) {
        gsap.set(overlayRef.current, { display: 'none' });
      }
      if (mobileMenuRef.current) {
        gsap.set(mobileMenuRef.current, { display: 'none' });
      }
    }
  }, [isOpen]);

  const handleCloseAnimation = () => {
    if (mobileMenuRef.current && overlayRef.current) {
      // Animate out menu items first
      if (menuItemsRef.current.length > 0) {
        gsap.to(menuItemsRef.current, {
          x: -30,
          opacity: 0,
          duration: 0.2,
          stagger: 0.02,
          ease: 'power2.in'
        });
      }

      // Animate menu slide out
      gsap.to(mobileMenuRef.current, {
        x: '-100%',
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        delay: 0.1
      });

      // Animate overlay fade out
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        delay: 0.2,
        onComplete: () => {
          // Hide elements after animation
          gsap.set(overlayRef.current, { display: 'none' });
          gsap.set(mobileMenuRef.current, { display: 'none' });
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  const addMenuItemToRefs = (el) => {
    if (el && !menuItemsRef.current.includes(el)) {
      menuItemsRef.current.push(el);
    }
  };

  const handleMobileAddPropertyClick = (e) => {
    onAddPropertyClick(e);
    handleCloseAnimation();
  };

  const handleMobileLogout = () => {
    onLogout();
    handleCloseAnimation();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="md:hidden fixed inset-0 bg-black/50 z-40 hidden"
        onClick={handleCloseAnimation}
      />
      
      {/* Mobile Menu */}
      <div 
        ref={mobileMenuRef}
        className="md:hidden fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white shadow-xl z-50 hidden"
        style={{ 
          background: 'white',
          willChange: 'transform, opacity'
        }}
      >
        {/* White background to ensure no overlap */}
        <div 
          ref={menuContainerRef}
          className="h-full w-full bg-white flex flex-col"
        >
          {/* Menu Header */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <Link 
                to="/" 
                className="flex items-center" 
                onClick={handleCloseAnimation}
              >
                <img 
                  src="/logo.png" 
                  className="w-12 h-12" 
                  alt="Logo" 
                />
                <span className="ml-2 text-lg font-semibold text-gray-800">Menu</span>
              </Link>
              <button
                onClick={handleCloseAnimation}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Menu Items - Scrollable area */}
          <div className="flex-grow overflow-y-auto">
            <div className="p-4 space-y-2 bg-white">
              <Link 
                ref={addMenuItemToRefs}
                to="/" 
                onClick={handleCloseAnimation} 
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200"
              >
                Properties
              </Link>

              <Link 
                ref={addMenuItemToRefs}
                to="/featured" 
                onClick={handleCloseAnimation} 
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200"
              >
                Featured
              </Link>

              {isAdmin && (
                <Link
                  ref={addMenuItemToRefs}
                  to="/admin"
                  onClick={handleCloseAnimation}
                  className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200"
                >
                  Admin
                </Link>
              )}

              <Link
                ref={addMenuItemToRefs}
                to={user ? "/add-listing" : "#"}
                onClick={handleMobileAddPropertyClick}
                className={`block py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 ${
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
                    onClick={handleCloseAnimation}
                    className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200"
                  >
                    Profile
                  </Link>

                  <div 
                    ref={addMenuItemToRefs}
                    className="block py-3 px-4 bg-blue-50 border border-blue-100 rounded-lg"
                  >
                    <span className="text-sm font-medium text-blue-800">
                      Logged in as: {user.username}
                    </span>
                  </div>

                  <button
                    ref={addMenuItemToRefs}
                    onClick={handleMobileLogout}
                    className="w-full text-left py-3 px-4 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg text-base font-medium transition-all duration-200 border border-gray-200 hover:border-red-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    ref={addMenuItemToRefs}
                    to="/login"
                    onClick={handleCloseAnimation}
                    className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200"
                  >
                    Login
                  </Link>

                  <Link
                    ref={addMenuItemToRefs}
                    to="/register"
                    onClick={handleCloseAnimation}
                    className="block py-3 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-base font-medium transition-all duration-200 shadow-md"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t bg-white">
            <div className="p-4">
              <p className="text-xs text-gray-500 text-center">
                © {new Date().getFullYear()} All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>

      {showTooltip && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-md shadow-lg z-[60] animate-fadeIn">
          Please login to add a property
        </div>
      )}
    </>
  );
}

// Main Navbar Component
export default function Navbar() {
  const { user, logout } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAdmin = user?.role === "admin" || user?.isAdmin === true || user?.admin === true;

  const handleAddPropertyClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className=" md:absolute pb-3  md:border-0 top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex  items-center justify-between h-16">
            <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
              <img 
                src="/logo.png" 
                className="w-14 h-14" 
                alt="Logo" 
              />
            </Link>

            {/* Desktop Navigation */}
            <DesktopNav 
              user={user}
              isAdmin={isAdmin}
              onAddPropertyClick={handleAddPropertyClick}
              onLogout={handleLogout}
              showTooltip={showTooltip}
            />

            {/* Mobile Menu Toggle Button */}
            <button
              className="md:hidden  text-gray-700 p-2"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={isMobileMenuOpen}
        user={user}
        isAdmin={isAdmin}
        onAddPropertyClick={handleAddPropertyClick}
        onLogout={handleLogout}
        onClose={closeMobileMenu}
        showTooltip={showTooltip}
      />
    </>
  );
}