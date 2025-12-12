import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState({ code: 'en', name: 'English', flag: '🇺🇸' });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

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

  // Enhanced cookie management functions - Fixed "this" issue
  const cookieManager = {
    // Clear all Google Translate related cookies
    clearGoogleTranslateCookies: () => {
      const domain = window.location.hostname;
      const cookiesToClear = [
        'googtrans',
        'googtrans_prev',
        'googtrans_debug',
        'googtrans_/auto/',
        'googtrans_/en/'
      ];
      
      // Clear cookies for current domain and subdomains
      const domains = [domain, '.' + domain, ''];
      
      cookiesToClear.forEach(cookieName => {
        domains.forEach(dom => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=${dom}`;
        });
      });
      
      // Additional clearing for various cookie formats
      const date = new Date();
      date.setTime(date.getTime() - 1000 * 60 * 60 * 24);
      const expires = date.toUTCString();
      
      // Clear all possible googtrans cookie variations
      const cookiePrefixes = ['/auto/', '/en/'];
      cookiePrefixes.forEach(prefix => {
        document.cookie = `googtrans${prefix}=; expires=${expires}; path=/; domain=${domain}`;
        document.cookie = `googtrans${prefix}=; expires=${expires}; path=/`;
      });
      
      console.log('Google Translate cookies cleared');
    },
    
    // Set new language cookie properly
    setLanguageCookie: (langCode) => {
      const domain = window.location.hostname;
      
      // First, clear old cookies
      cookieManager.clearGoogleTranslateCookies(); // Fixed: Direct call instead of this.
      
      // Set new cookie with proper format
      const cookieValue = `/en/${langCode}`;
      const oneYear = 365 * 24 * 60 * 60; // 1 year in seconds
      
      // Set for root path
      document.cookie = `googtrans=${cookieValue}; path=/; max-age=${oneYear}; domain=${domain}; SameSite=Lax`;
      
      // Also set alternative format for compatibility
      document.cookie = `googtrans=/auto/${langCode}; path=/; max-age=${oneYear}; domain=${domain}; SameSite=Lax`;
      
      console.log('Language cookie set to:', cookieValue);
      
      // Set in localStorage for consistency
      localStorage.setItem('preferredLanguage', langCode);
      localStorage.setItem('languageTimestamp', Date.now().toString());
    },
    
    // Get current language from cookie
    getCurrentLanguage: () => {
      // Try to get from cookie first
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'googtrans' && value) {
          const match = value.match(/\/en\/(\w+)/) || value.match(/\/auto\/(\w+)/);
          if (match) {
            return match[1];
          }
        }
      }
      
      // Fallback to localStorage or default
      const savedLang = localStorage.getItem('preferredLanguage');
      return savedLang || 'en';
    }
  };

  // Handle language change with proper cookie management
  const handleLanguageChange = async (language) => {
    console.log('Changing language to:', language.code);
    
    // Prevent multiple clicks
    if (isChangingLanguage || window.languageChangeInProgress) {
      console.log('Language change already in progress');
      return;
    }
    
    setIsChangingLanguage(true);
    window.languageChangeInProgress = true;
    
    // Update UI state immediately
    setCurrentLanguage(language);
    setShowLanguageDropdown(false);
    setIsMobileMenuOpen(false);
    
    // Clear old cookies and set new one
    cookieManager.setLanguageCookie(language.code);
    
    // Update URL with timestamp to prevent caching
    const timestamp = Date.now();
    const url = new URL(window.location);
    url.searchParams.set('hl', language.code);
    url.searchParams.set('t', timestamp);
    window.history.replaceState({}, '', url);
    
    // Show loading indicator
    document.body.classList.add('language-changing');
    document.body.style.opacity = '0.7';
    document.body.style.transition = 'opacity 0.3s';
    
    // Use the global function to change language
    if (typeof window.changeLanguage === 'function') {
      window.changeLanguage(language.code);
    } else {
      // Fallback: direct method with reload
      console.log('window.changeLanguage not available, using fallback');
      
      // Force Google Translate to recognize new cookie
      const iframe = document.querySelector('.goog-te-menu-frame');
      if (iframe && iframe.contentWindow) {
        try {
          const select = iframe.contentWindow.document.querySelector('.goog-te-combo');
          if (select) {
            select.value = language.code;
            select.dispatchEvent(new Event('change'));
          }
        } catch (e) {
          console.warn('Could not access translate iframe:', e);
        }
      }
      
      // Set flag for post-reload detection
      sessionStorage.setItem('justChangedLanguage', language.code);
      sessionStorage.setItem('languageChangeTime', Date.now().toString());
      
      // Force reload with cache busting
      setTimeout(() => {
        window.location.href = window.location.pathname + '?hl=' + language.code + '&t=' + timestamp + '&nocache=' + timestamp;
      }, 500);
    }
  };

  // Initialize language on component mount
  useEffect(() => {
    // Get current language from cookie or localStorage
    const savedLang = localStorage.getItem('preferredLanguage');
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('hl');
    const cookieLang = cookieManager.getCurrentLanguage();
    
    // Priority: URL param > Cookie > localStorage > default
    const langCode = urlLang || cookieLang || savedLang || 'en';
    
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
    const changeTime = sessionStorage.getItem('languageChangeTime');
    
    if (justChanged) {
      console.log('Page just reloaded for language change:', justChanged);
      
      // Clear loading state after a delay
      setTimeout(() => {
        document.body.classList.remove('language-changing');
        document.body.style.opacity = '1';
        setIsChangingLanguage(false);
        window.languageChangeInProgress = false;
        
        // Clear session storage flags
        sessionStorage.removeItem('justChangedLanguage');
        sessionStorage.removeItem('languageChangeTime');
      }, 1000);
    }
    
    // Reset changing language state after timeout (safety)
    const resetTimeout = setTimeout(() => {
      setIsChangingLanguage(false);
      window.languageChangeInProgress = false;
      document.body.classList.remove('language-changing');
      document.body.style.opacity = '1';
    }, 5000);
    
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

              {/* Language Selector - Desktop */}
              <div className="relative" ref={languageDropdownRef}>
                <button
                  onClick={() => !isChangingLanguage && setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-200 shadow-sm font-medium min-w-[180px]"
                  disabled={isChangingLanguage}
                >
                  <div className="flex items-center gap-2">
                    {isChangingLanguage ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                    <span className="truncate">
                      {currentLanguage.flag} {isChangingLanguage ? 'Changing...' : currentLanguage.name}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''} ${isChangingLanguage ? 'opacity-50' : ''}`} />
                </button>

                {showLanguageDropdown && !isChangingLanguage && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-700">Select Language</p>
                      <p className="text-xs text-gray-500 mt-1">Page will reload to apply translation</p>
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

            {/* Mobile Language Selector */}
            <div className="border-t border-white/20 pt-3">
              <div className="flex items-center justify-between px-2 pb-2">
                <p className="text-sm font-semibold text-gray-700">Language</p>
                {isChangingLanguage && (
                  <span className="text-xs text-blue-600">Applying...</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {languages.slice(0, 4).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    disabled={isChangingLanguage}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${currentLanguage.code === lang.code
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white/20 border-white/30 hover:bg-white/30'
                      } ${isChangingLanguage ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.code === 'en' ? 'EN' : lang.code.toUpperCase()}</span>
                    {currentLanguage.code === lang.code && !isChangingLanguage && (
                      <span className="text-blue-200">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => !isChangingLanguage && setShowLanguageDropdown(!showLanguageDropdown)}
                disabled={isChangingLanguage}
                className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">More Languages</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showLanguageDropdown && !isChangingLanguage && (
                <div className="mt-2 p-2 bg-white/95 backdrop-blur-lg rounded-xl border border-white/30">
                  <p className="text-xs text-gray-500 px-2 pb-2">Page will reload to apply translation</p>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {languages.slice(4).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        disabled={isChangingLanguage}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${currentLanguage.code === lang.code
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