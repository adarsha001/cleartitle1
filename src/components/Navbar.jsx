import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, ExternalLink, Info } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState({ code: 'en', name: 'English', flag: '🇺🇸' });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [hasChangedLanguage, setHasChangedLanguage] = useState(false);
  const [showHoverTooltip, setShowHoverTooltip] = useState(false);

  const languageDropdownRef = useRef(null);

  const isAdmin = user?.role === "admin" || user?.isAdmin === true || user?.admin === true;

  // Languages with flags
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'ml', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو (Urdu)', flag: '🇵🇰' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)', flag: '🇮🇳' }
  ];

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if language has been changed before
  useEffect(() => {
    const languageChangedBefore = localStorage.getItem('hasChangedLanguage');
    const savedLang = localStorage.getItem('preferredLanguage');
    
    if (languageChangedBefore === 'true' && savedLang && savedLang !== 'en') {
      setHasChangedLanguage(true);
    }
  }, []);

  // Open cleartitle.com in new tab
  const openClearTitleWebsite = () => {
    window.open('https://cleartitle.com', '_blank');
  };

  // Open cleartitle1.com in new tab (for language change attempts)
  const openClearTitle1Website = () => {
    window.open('https://cleartitle1.com', '_blank');
  };

  // Handle language change - ONE TIME ONLY
  const handleLanguageChange = (language) => {
    console.log('Changing language to:', language.code);
    
    // Check if language has been changed before
    if (hasChangedLanguage) {
      console.log('Language already changed before, opening cleartitle1.com');
      openClearTitle1Website();
      setShowLanguageDropdown(false);
      setIsMobileMenuOpen(false);
      return;
    }
    
    // Prevent multiple clicks
    if (isChangingLanguage || window.languageChangeInProgress) {
      console.log('Language change already in progress');
      return;
    }
    
    setIsChangingLanguage(true);
    
    // Update UI state immediately
    setCurrentLanguage(language);
    setShowLanguageDropdown(false);
    setIsMobileMenuOpen(false);
    
    // Save to localStorage with timestamp
    const timestamp = Date.now();
    localStorage.setItem('preferredLanguage', language.code);
    localStorage.setItem('languageTimestamp', timestamp.toString());
    localStorage.setItem('hasChangedLanguage', 'true'); // Mark as changed
    
    // Set state
    setHasChangedLanguage(true);
    
    // Update URL with timestamp to prevent caching
    const url = new URL(window.location);
    url.searchParams.set('hl', language.code);
    url.searchParams.set('t', timestamp);
    window.history.replaceState({}, '', url);
    
    // Show loading indicator
    const originalText = document.querySelector('body');
    if (originalText) {
      originalText.style.opacity = '0.7';
      originalText.style.transition = 'opacity 0.3s';
    }
    
    // Use the global function to change language
    if (typeof window.changeLanguage === 'function') {
      window.changeLanguage(language.code);
    } else {
      // Fallback: direct cookie method with reload and cache busting
      console.log('window.changeLanguage not available, using fallback');
      
      // Clear old cookies
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + window.location.hostname;
      document.cookie = `googtrans=/en/${language.code}; path=/; domain=${window.location.hostname}; max-age=31536000`;
      
      sessionStorage.setItem('justChangedLanguage', language.code);
      
      setTimeout(() => {
        // Force reload without cache
        window.location.href = window.location.href.split('?')[0] + '?hl=' + language.code + '&t=' + timestamp;
      }, 300);
    }
  };

  // Handle click on language selector button
  const handleLanguageButtonClick = () => {
    if (hasChangedLanguage) {
      // If language already changed, open cleartitle1.com
      openClearTitle1Website();
    } else {
      // If not changed yet, show dropdown
      !isChangingLanguage && setShowLanguageDropdown(!showLanguageDropdown);
    }
  };

  // Initialize language on component mount
  useEffect(() => {
    // Get saved language preference
    const savedLang = localStorage.getItem('preferredLanguage');
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('hl');
    const langCode = urlLang || savedLang || 'en';
    
    // Find matching language object
    const foundLang = languages.find(lang => lang.code === langCode) || languages[0];
    setCurrentLanguage(foundLang);
    
    // Listen for language change events
    const handleLanguageChanged = (event) => {
      const newLangCode = event?.detail?.language;
      if (newLangCode) {
        console.log('Received languageChanged event:', newLangCode);
        const found = languages.find(l => l.code === newLangCode);
        if (found) {
          setCurrentLanguage(found);
        }
      }
    };
    
    window.addEventListener('languageChanged', handleLanguageChanged);
    
    // Check if page just reloaded due to language change
    const justChanged = sessionStorage.getItem('justChangedLanguage');
    const savedLangFromStorage = localStorage.getItem('preferredLanguage');
    
    if (justChanged && savedLangFromStorage && justChanged === savedLangFromStorage) {
      console.log('Page just reloaded for language change:', justChanged);
      
      // Remove the flag
      sessionStorage.removeItem('justChangedLanguage');
      
      // Restore opacity
      setTimeout(() => {
        const body = document.querySelector('body');
        if (body) {
          body.style.opacity = '1';
        }
        setIsChangingLanguage(false);
      }, 500);
    }
    
    // Reset changing language state after timeout
    const resetTimeout = setTimeout(() => {
      setIsChangingLanguage(false);
    }, 3000);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChanged);
      clearTimeout(resetTimeout);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddPropertyClick = (e) => {
    if (!user) {
      e.preventDefault();
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navbar with dynamic padding */}
      <nav className={`bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LOGO with dynamic size based on scroll */}
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
              <img 
                src="/logo.png" 
                className={`drop-shadow-xl transition-all duration-300 ${isScrolled ? 'w-12 h-12' : 'w-18 h-18'}`} 
                alt="Logo" 
              />
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden lg:flex items-center space-x-6 text-gray-900">
              <Link to="/" className="hover:text-[#5b7adb] hover:bg-white/30 px-2 py-1 rounded transition font-medium">
                Properties
              </Link>

              <Link to="/featured" className="hover:text-[#5b7adb] hover:bg-white/30 px-2 py-1 rounded transition font-medium">
                Featured
              </Link>

              {/* ClearTitle Website Link - ONLY ONE BUTTON */}
              <button
                onClick={openClearTitleWebsite}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-200 shadow-sm font-medium text-gray-900"
              >
                <ExternalLink className="w-4 h-4" />
                <span>cleartitle.com</span>
              </button>

              {/* Language Selector - Desktop */}
              <div className="relative" ref={languageDropdownRef}>
                <div
                  onMouseEnter={() => hasChangedLanguage && setShowHoverTooltip(true)}
                  onMouseLeave={() => setShowHoverTooltip(false)}
                  className="relative"
                >
                  <button
                    onClick={handleLanguageButtonClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm font-medium min-w-[180px] ${
                      hasChangedLanguage 
                        ? 'bg-gray-300/50 border border-gray-400/30 cursor-not-allowed text-gray-500' 
                        : 'bg-white/20 border border-white/30 hover:bg-white/30'
                    }`}
                    disabled={isChangingLanguage || hasChangedLanguage}
                  >
                    <div className="flex items-center gap-2">
                      {isChangingLanguage ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      ) : hasChangedLanguage ? (
                        <Info className="w-4 h-4" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                      <span className="truncate">
                        {currentLanguage.flag} {
                          isChangingLanguage ? 'Changing...' : 
                          hasChangedLanguage ? 'Language Selected' : 
                          currentLanguage.name
                        }
                      </span>
                    </div>
                    {!hasChangedLanguage && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''} ${isChangingLanguage ? 'opacity-50' : ''}`} />
                    )}
                  </button>

                  {/* Hover tooltip for disabled state */}
                  {showHoverTooltip && hasChangedLanguage && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-50">
                      Open new tab to change language again
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  )}
                </div>

                {showLanguageDropdown && !isChangingLanguage && !hasChangedLanguage && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-700">Select Language</p>
                      <p className="text-xs text-gray-500 mt-1">You can only change language once</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang)}
                          disabled={isChangingLanguage}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${currentLanguage.code === lang.code ? 'bg-blue-50' : ''} ${isChangingLanguage ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-sm font-medium text-gray-800 flex-1 text-left">{lang.name}</span>
                          {currentLanguage.code === lang.code && (
                            <span className="ml-auto text-blue-600 text-xs font-bold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg bg-white/20 border border-gray-900/20 hover:bg-[#5b7adb] hover:border-[#5b7adb] hover:text-white transition shadow-md font-medium"
                >
                  Admin
                </Link>
              )}

              <Link
                to={user ? "/add-listing" : "#"}
                onClick={handleAddPropertyClick}
                className={`px-4 py-2 rounded-lg transition font-medium ${user
                    ? "bg-[#5b7adb] text-white hover:bg-[#4a69ca] shadow-md"
                    : "bg-gray-400/50 text-gray-600 cursor-not-allowed"
                  }`}
              >
                Add Property
              </Link>

              {/* LOGGED IN */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="hover:text-[#5b7adb] hover:bg-white/30 px-2 py-1 rounded transition font-medium">
                    Profile
                  </Link>

                  <span className="text-xs bg-[#5b7adb] text-white px-2 py-1 rounded font-medium">
                    {user.username}
                  </span>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-white/20 border border-gray-900/20 hover:bg-[#5b7adb] hover:border-[#5b7adb] hover:text-white transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="hover:text-[#5b7adb] hover:bg-white/30 px-2 py-1 rounded font-medium">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg bg-[#5b7adb] text-white hover:bg-[#4a69ca] border border-[#5b7adb] transition shadow-md font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <button
              className="text-gray-900 lg:hidden px-3 py-2 rounded focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              disabled={isChangingLanguage}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer div to prevent content overlap */}
      <div className={`transition-all duration-300 ${isScrolled ? 'h-20' : 'h-24'}`}></div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-20 left-0 w-full bg-white/10 backdrop-blur-md border-t border-white/20 z-40">
          <div className="p-4 space-y-3 text-gray-900">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-[#5b7adb] hover:bg-white/30 p-2 rounded font-medium">
              Properties
            </Link>

            <Link to="/featured" onClick={() => setIsMobileMenuOpen(false)} className="block hover:text-[#5b7adb] hover:bg-white/30 p-2 rounded font-medium">
              Featured
            </Link>

            {/* ClearTitle Website Link - Mobile - ONLY ONE BUTTON */}
            <button
              onClick={() => {
                openClearTitleWebsite();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition-all font-medium text-gray-900"
            >
              <ExternalLink className="w-4 h-4" />
              <span>cleartitle.com</span>
            </button>

            {/* Mobile Language Selector */}
            <div className="border-t border-white/20 pt-3">
              <div className="flex items-center justify-between px-2 pb-2">
                <p className="text-sm font-semibold text-gray-700">Language</p>
                {isChangingLanguage && (
                  <span className="text-xs text-blue-600">Applying...</span>
                )}
                {hasChangedLanguage && (
                  <span className="text-xs text-gray-500">Click to open cleartitle1.com</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {languages.slice(0, 4).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (hasChangedLanguage) {
                        openClearTitle1Website();
                        setIsMobileMenuOpen(false);
                      } else {
                        handleLanguageChange(lang);
                      }
                    }}
                    disabled={isChangingLanguage}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      currentLanguage.code === lang.code
                        ? hasChangedLanguage 
                          ? 'bg-gray-300 border-gray-400 text-gray-600' 
                          : 'bg-blue-600 text-white border-blue-600'
                        : hasChangedLanguage
                          ? 'bg-gray-200 border-gray-300 text-gray-500'
                          : 'bg-white/20 border-white/30 hover:bg-white/30'
                    } ${isChangingLanguage ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm font-medium">
                      {hasChangedLanguage ? 'Click for cleartitle1.com' : (lang.code === 'en' ? 'EN' : lang.code.toUpperCase())}
                    </span>
                    {currentLanguage.code === lang.code && !isChangingLanguage && !hasChangedLanguage && (
                      <span className="text-blue-200">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  if (hasChangedLanguage) {
                    openClearTitle1Website();
                    setIsMobileMenuOpen(false);
                  } else {
                    !isChangingLanguage && setShowLanguageDropdown(!showLanguageDropdown);
                  }
                }}
                disabled={isChangingLanguage}
                className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all font-medium ${
                  hasChangedLanguage
                    ? 'bg-gray-300 border-gray-400 text-gray-600'
                    : 'bg-white/20 border-white/30 hover:bg-white/30 text-gray-900'
                } ${isChangingLanguage ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {hasChangedLanguage ? 'Open cleartitle1.com' : 'More Languages'}
                </span>
                {!hasChangedLanguage && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                )}
              </button>

              {showLanguageDropdown && !isChangingLanguage && !hasChangedLanguage && (
                <div className="mt-2 p-2 bg-white/95 backdrop-blur-lg rounded-xl border border-white/30">
                  <p className="text-xs text-gray-500 px-2 pb-2">You can only change language once</p>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {languages.slice(4).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        disabled={isChangingLanguage}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                          currentLanguage.code === lang.code
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white/20 border-white/30 hover:bg-white/30'
                        } ${isChangingLanguage ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <span>{lang.flag}</span>
                        <span className="text-sm font-medium truncate">{lang.name.split('(')[0].trim()}</span>
                        {currentLanguage.code === lang.code && (
                          <span className="text-blue-200 text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-white/20 border border-gray-900/20 p-2 rounded-lg mt-1 hover:bg-[#5b7adb] hover:text-white transition font-medium"
              >
                Admin
              </Link>
            )}

            <Link
              to={user ? "/add-listing" : "#"}
              onClick={handleAddPropertyClick}
              className={`block p-2 rounded-lg mt-1 font-medium ${user
                  ? "bg-[#5b7adb] text-white hover:bg-[#4a69ca]"
                  : "bg-gray-400/50 text-gray-600 cursor-not-allowed"
                }`}
            >
              Add Property
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block hover:text-[#5b7adb] hover:bg-white/30 p-2 rounded font-medium"
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left bg-white/20 border border-gray-900/20 p-2 rounded-lg mt-2 hover:bg-[#5b7adb] hover:text-white transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block hover:text-[#5b7adb] hover:bg-white/30 p-2 rounded font-medium"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block bg-[#5b7adb] text-white p-2 rounded-lg mt-1 hover:bg-[#4a69ca] border border-[#5b7adb] transition font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Loading overlay when changing language */}
      {isChangingLanguage && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white/90 p-6 rounded-xl shadow-2xl flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-800 font-medium">Applying translation...</p>
            <p className="text-sm text-gray-600">Page will reload in a moment</p>
          </div>
        </div>
      )}
    </>
  );
}