import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const realEstateTaglines = [
  "Trusted Titles",
  "Prime Properties",
  "Luxury Living",
  "Secure Investments",
  "Dream Homes",
  "Smart Buying",
  "Urban Comfort",
  "Modern Estates",
  "Elite Residences",
  "Future Wealth",
  "Golden Acres",
  "Property Experts",
  "Land Ownership",
  "City Spaces",
  "Royal Villas",
  "Premium Plots",
  "Safe Returns",
  "Luxury Estates",
  "Perfect Homes",
  "Investment Growth",
  "Urban Heights",
  "Dream Spaces",
  "Wealth Creation",
  "Home Happiness",
  "Elite Properties",
  "Future Living",
  "Property Solutions",
  "Modern Villas",
  "Secure Deals",
  "Trusted Realty",
  // "Prestige Living",
  // "Valley Views",
  // "Ocean Fronts",
  // "Garden Homes",
  // "Sunset Resorts",
  // "Crystal Towers",
  // "Emerald Hills",
  // "Sapphire Springs",
  // "Diamond District",
  // "Ruby Residences",
  // "Pearl Paradise",
  // "Platinum Plaza",
  // "Silver Sands",
  // "Bronze Bungalows",
  // "Steel Structures",
  // "Concrete Dreams",
  // "Timber Trails",
  // "Stone Mansions",
  // "Brick Beauties",
  // "Glass Gardens"
];

function RotatingTagline() {
  const tagARef = useRef(null);
  const tagBRef = useRef(null);
  const slotRef = useRef(null);
  const containerRef = useRef(null);
  const idxRef = useRef(0);
  const aVisibleRef = useRef(true);

  // Function to update container width based on current text
  const updateWidth = () => {
    const textA = tagARef.current;
    const textB = tagBRef.current;
    
    if (containerRef.current) {
      let maxWidth = 0;
      
      if (textA && textA.scrollWidth) {
        maxWidth = Math.max(maxWidth, textA.scrollWidth);
      }
      if (textB && textB.scrollWidth) {
        maxWidth = Math.max(maxWidth, textB.scrollWidth);
      }
      
      const newWidth = maxWidth + 60;
      containerRef.current.style.width = newWidth + 'px';
    }
  };

  useEffect(() => {
    // Set initial text
    if (tagARef.current) {
      tagARef.current.textContent = realEstateTaglines[0];
    }
    if (tagBRef.current) {
      tagBRef.current.textContent = realEstateTaglines[1 % realEstateTaglines.length];
    }

    // Set initial width
    const timer = setTimeout(() => {
      if (tagARef.current && containerRef.current) {
        const textWidth = tagARef.current.scrollWidth;
        containerRef.current.style.width = (textWidth + 60) + 'px';
      }
    }, 100);

    const interval = setInterval(() => {
      // Calculate next index (loop back to 0 when reaching the end)
      const next = (idxRef.current + 1) % realEstateTaglines.length;
      const outEl = aVisibleRef.current ? tagARef.current : tagBRef.current;
      const inEl = aVisibleRef.current ? tagBRef.current : tagARef.current;
      
      if (!outEl || !inEl) return;

      // Set the next text
      inEl.textContent = realEstateTaglines[next];
      
      // Update width immediately
      setTimeout(() => updateWidth(), 10);

      // Animate out
      gsap.to(outEl, {
        opacity: 0,
        scaleY: 0.5,
        y: -5,
        duration: 0.32,
        ease: 'power2.in',
        onComplete: () => {
          // Animate in
          gsap.set(inEl, { opacity: 0, scaleY: 0.6, y: 8 });
          gsap.to(inEl, {
            opacity: 1,
            scaleY: 1,
            y: 0,
            duration: 0.38,
            ease: 'back.out(1.6)',
            onComplete: () => {
              // Update width after animation
              setTimeout(() => updateWidth(), 50);
            }
          });
          
          // Reset outgoing element
          gsap.set(outEl, { scaleY: 1, y: 0 });
          
          // Toggle visibility and update index
          aVisibleRef.current = !aVisibleRef.current;
          idxRef.current = next;
        }
      });
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  // Update width on window resize
  useEffect(() => {
    const handleResize = () => updateWidth();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const textStyle = {
    position: 'absolute',
    fontSize: '13px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    color: '#000000',
    backgroundColor: 'transparent',
    transformOrigin: 'center top',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  return (
    <div className="flex-1 flex items-center justify-center mx-3 md:hidden" style={{ overflow: 'visible' }}>
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '9999px',
          padding: '8px 28px',
          height: 'auto',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'auto',
          minWidth: '140px',
          maxWidth: '90vw',
          overflow: 'visible',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div 
          ref={slotRef} 
          style={{ 
            position: 'relative', 
            height: '24px', 
            overflow: 'visible',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minWidth: '120px',
          }}
        >
          <span 
            ref={tagARef} 
            style={{ ...textStyle }}
          >
            {realEstateTaglines[0]}
          </span>
          <span 
            ref={tagBRef} 
            style={{ ...textStyle, opacity: 0, transform: 'scaleY(0.6) translateY(8px)' }}
          >
            {realEstateTaglines[1]}
          </span>
        </div>
      </div>
    </div>
  );
}
// Desktop Navigation Component
function DesktopNav({ user, isAdmin, onAddPropertyClick, onLogout, showTooltip }) {
  return (
    <div className="hidden md:flex items-center space-x-4">
      <Link to="/property-units" className="text-gray-50 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
        Properties
      </Link>

      <Link to="/batch-listings" className="text-gray-50 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition">
       Top Rated Companies
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
      menuItemsRef.current = [];
      
      if (mobileMenuRef.current && overlayRef.current) {
        gsap.set(overlayRef.current, { opacity: 0, display: 'block' });
        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });

        gsap.set(mobileMenuRef.current, { 
          x: '-100%', 
          opacity: 0,
          display: 'block'
        });

        gsap.to(mobileMenuRef.current, {
          x: '0%',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            setTimeout(() => {
              if (menuItemsRef.current.length > 0) {
                gsap.fromTo(
                  menuItemsRef.current,
                  { x: -30, opacity: 0 },
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
      if (menuItemsRef.current.length > 0) {
        gsap.to(menuItemsRef.current, {
          x: -30,
          opacity: 0,
          duration: 0.2,
          stagger: 0.02,
          ease: 'power2.in'
        });
      }

      gsap.to(mobileMenuRef.current, {
        x: '-100%',
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        delay: 0.1
      });

      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        delay: 0.2,
        onComplete: () => {
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
      <div 
        ref={overlayRef}
        className="md:hidden fixed inset-0 bg-black/50 z-40 hidden"
        onClick={handleCloseAnimation}
      />
      
      <div 
        ref={mobileMenuRef}
        className="md:hidden fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white shadow-xl z-50 hidden"
        style={{ background: 'white', willChange: 'transform, opacity' }}
      >
        <div 
          ref={menuContainerRef}
          className="h-full w-full bg-white flex flex-col"
        >
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between p-4 border-b">
              <Link 
                to="/" 
                className="flex items-center" 
                onClick={handleCloseAnimation}
              >
                <img src="/logo.png" className="w-12 h-12" alt="Logo" />
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

          <div className="flex-grow overflow-y-auto">
            <div className="p-4 space-y-2 bg-white">
              <Link 
                ref={addMenuItemToRefs}
                to="/property-units" 
                onClick={handleCloseAnimation} 
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200"
              >
                Properties
              </Link>

              <Link 
                ref={addMenuItemToRefs}
                to="/batch-listings" 
                onClick={handleCloseAnimation} 
                className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg text-base font-medium transition-all duration-200"
              >
                Top Rated Companies
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
      <nav className="md:absolute md:border-0 top-0 left-0 w-full md:bg-transparent z-50 md:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - fixed width on left */}
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMobileMenu}>
              <img src="/logo.png" className="w-14 h-14" alt="Logo" />
            </Link>

            {/* Rotating Tagline - only visible on mobile, expands to fill space */}
            <RotatingTagline />

            {/* Desktop Navigation - hidden on mobile */}
            <DesktopNav 
              user={user}
              isAdmin={isAdmin}
              onAddPropertyClick={handleAddPropertyClick}
              onLogout={handleLogout}
              showTooltip={showTooltip}
            />

            {/* Mobile Menu Toggle Button - fixed width on right */}
            <button
              className="md:hidden flex-shrink-0 text-gray-700 p-2"
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