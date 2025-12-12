import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Lock, AlertCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState({ code: 'en', name: 'English', flag: '🇺🇸' });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [isLanguageLocked, setIsLanguageLocked] = useState(false);

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
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check language state on component mount
  useEffect(() => {
    // Clear old cookies on page load (to prevent persistence after tab close)
    const domain = window.location.hostname;
    const path = '/';
    
    // Clear any existing Google Translate cookies
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=${path}; domain=${domain}`;
    document.cookie = `googtrans=; path=${path}; max-age=0; domain=${domain}`;
    
    // Also clear from localStorage to prevent any persistence
    localStorage.removeItem('languageLocked');
    localStorage.removeItem('languageChangedOnce');
    
    // Check if we have a saved preference
    const savedLang = localStorage.getItem('preferredLanguage');
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('hl');
    const langCode = urlLang || savedLang || 'en';
    
    // Find and set current language
    const foundLang = languages.find(lang => lang.code === langCode) || languages[0];
    setCurrentLanguage(foundLang);
    
    // Check sessionStorage for language lock state
    const sessionLanguageLocked = sessionStorage.getItem('languageLocked');
    const sessionLanguageCode = sessionStorage.getItem('selectedLanguage');
    
    // If we have a session language and it's locked, set the state
    if (sessionLanguageLocked === 'true' && sessionLanguageCode && sessionLanguageCode !== 'en') {
      setIsLanguageLocked(true);
      
      // Set cookie for this session only (no expiry, will clear on tab close)
      const domain = window.location.hostname;
      document.cookie = `googtrans=/en/${sessionLanguageCode}; path=/; domain=${domain}`;
      
      // Update URL if needed
      if (!urlParams.get('hl')) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('hl', sessionLanguageCode);
        window.history.replaceState({}, '', newUrl);
      }
    } else {
      // No session lock, so start fresh
      setIsLanguageLocked(false);
      
      // If language is not English, lock it for this session
      if (langCode !== 'en') {
        setIsLanguageLocked(true);
        sessionStorage.setItem('languageLocked', 'true');
        sessionStorage.setItem('selectedLanguage', langCode);
      }
    }
    
    console.log('Language state on mount:', {
      langCode,
      locked: sessionLanguageLocked,
      sessionCode: sessionLanguageCode
    });
    
    // Listen for language change events
    const handleLanguageChanged = (event) => {
      const newLangCode = event?.detail?.language;
      if (newLangCode) {
        const found = languages.find(l => l.code === newLangCode);
        if (found) {
          setCurrentLanguage(found);
        }
      }
    };
    
    window.addEventListener('languageChanged', handleLanguageChanged);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChanged);
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

  // Handle language change - ONE TIME ONLY PER TAB
  const handleLanguageChange = (language) => {
    console.log('Attempting language change to:', language.code);
    
    // Check if already locked (non-English already selected in this tab)
    if (isLanguageLocked && language.code !== 'en') {
      console.log('Language selection is locked for this tab. Close tab and reopen.');
      setShowLanguageDropdown(false);
      return;
    }
    
    // Start language change
    setIsChangingLanguage(true);
    
    // If changing to non-English, lock future changes for this session
    if (language.code !== 'en') {
      setIsLanguageLocked(true);
      sessionStorage.setItem('languageLocked', 'true');
      sessionStorage.setItem('selectedLanguage', language.code);
    }
    
    // Update UI
    setCurrentLanguage(language);
    setShowLanguageDropdown(false);
    setIsMobileMenuOpen(false);
    
    // Save preference (but not lock state)
    localStorage.setItem('preferredLanguage', language.code);
    
    // Show loading state
    const body = document.querySelector('body');
    if (body) {
      body.style.opacity = '0.7';
      body.style.transition = 'opacity 0.3s';
    }
    
    // Set session-only cookie (no expiry, will clear when tab closes)
    const domain = window.location.hostname;
    const path = '/';
    
    // Clear any existing cookies first
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=${path}; domain=${domain}`;
    document.cookie = `googtrans=; path=${path}; max-age=0; domain=${domain}`;
    
    // Set new session cookie
    document.cookie = `googtrans=/en/${language.code}; path=${path}; domain=${domain}`;
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('hl', language.code);
    url.searchParams.set('t', Date.now());
    window.history.replaceState({}, '', url);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: language.code } 
    }));
    
    // Reload page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

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
      {/* Main Navbar */}
      <nav className={`bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LOGO */}
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
                  onClick={() => {
                    if (!isChangingLanguage) {
                      if (isLanguageLocked && currentLanguage.code !== 'en') {
                        // Just show message on hover, don't open dropdown
                        return;
                      }
                      setShowLanguageDropdown(!showLanguageDropdown);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 border transition-all duration-200 shadow-sm font-medium min-w-[180px] relative group ${
                    isLanguageLocked && currentLanguage.code !== 'en'
                      ? 'border-yellow-400 cursor-not-allowed'
                      : 'border-white/30 hover:bg-white/30 cursor-pointer'
                  }`}
                  disabled={isChangingLanguage}
                >
                  <div className="flex items-center gap-2">
                    {isChangingLanguage ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        {isLanguageLocked && currentLanguage.code !== 'en' && (
                          <Lock className="w-3 h-3 text-yellow-600" />
                        )}
                      </>
                    )}
                    <span className="truncate">
                      {currentLanguage.flag} {isChangingLanguage ? 'Changing...' : currentLanguage.name}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                    showLanguageDropdown ? 'rotate-180' : ''
                  } ${isChangingLanguage ? 'opacity-50' : ''} ${
                    isLanguageLocked && currentLanguage.code !== 'en' ? 'text-yellow-600' : ''
                  }`} />
                  
                  {/* Locked language tooltip */}
                  {isLanguageLocked && currentLanguage.code !== 'en' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Close tab & reopen to change language</span>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </button>

                {showLanguageDropdown && !isChangingLanguage && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-700">Select Language</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isLanguageLocked ? "Close tab and reopen to change again" : "Page will reload"}
                      </p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {languages.map((lang) => {
                        const isCurrent = currentLanguage.code === lang.code;
                        const isDisabled = isLanguageLocked && lang.code !== 'en';
                        
                        return (
                          <button
                            key={lang.code}
                            onClick={() => {
                              if (!isDisabled) {
                                handleLanguageChange(lang);
                              }
                            }}
                            disabled={isChangingLanguage || isDisabled}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                              isCurrent ? 'bg-blue-50' : ''
                            } ${
                              isDisabled 
                                ? 'opacity-50 cursor-not-allowed bg-gray-100' 
                                : 'hover:bg-blue-50 cursor-pointer'
                            }`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-sm font-medium text-gray-800 flex-1 text-left">
                              {lang.name}
                            </span>
                            {isDisabled ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Locked</span>
                                <Lock className="w-3 h-3 text-gray-500" />
                              </div>
                            ) : (
                              isCurrent && <span className="ml-auto text-blue-600 text-xs font-bold">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {isLanguageLocked && currentLanguage.code !== 'en' && (
                      <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          <span className="font-bold">⚠️ Language locked for this tab:</span> You can only select language once per tab session.
                          <br />
                          <span className="font-semibold">Close this tab and open a new one</span> to select a different language.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 rounded-lg bg-white/20 border border-gray-900/20 hover:bg-[#5b7adb] hover:text-white transition font-medium"
                >
                  Admin
                </Link>
              )}

              <Link
                to={user ? "/add-listing" : "#"}
                onClick={handleAddPropertyClick}
                className={`px-4 py-2 rounded-lg transition font-medium ${
                  user
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
                    className="px-4 py-2 rounded-lg bg-white/20 border border-gray-900/20 hover:bg-[#5b7adb] hover:text-white transition font-medium"
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
                    className="px-4 py-2 rounded-lg bg-[#5b7adb] text-white hover:bg-[#4a69ca] transition font-medium"
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

      {/* Spacer div */}
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
                {isLanguageLocked && currentLanguage.code !== 'en' && (
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-yellow-600" />
                    <span className="text-xs text-yellow-600">Locked</span>
                  </div>
                )}
              </div>
              
              {isLanguageLocked && currentLanguage.code !== 'en' && (
                <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <span className="font-bold">Language locked for this tab.</span> Close tab & reopen to change language.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                {languages.slice(0, 4).map((lang) => {
                  const isCurrent = currentLanguage.code === lang.code;
                  const isDisabled = isLanguageLocked && lang.code !== 'en';
                  
                  return (
                    <button
                      key={lang.code}
                      onClick={() => !isDisabled && handleLanguageChange(lang)}
                      disabled={isChangingLanguage || isDisabled}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isDisabled
                          ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                          : 'bg-white/20 border-white/30 hover:bg-white/30 cursor-pointer'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm font-medium">
                        {lang.code === 'en' ? 'EN' : lang.code.toUpperCase()}
                      </span>
                      {isDisabled && <Lock className="w-3 h-3 text-gray-500" />}
                      {isCurrent && !isDisabled && !isChangingLanguage && (
                        <span className="text-blue-200">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (isLanguageLocked && currentLanguage.code !== 'en') {
                    // Don't open dropdown, just show message in existing div
                    return;
                  }
                  setShowLanguageDropdown(!showLanguageDropdown);
                }}
                disabled={isChangingLanguage || (isLanguageLocked && currentLanguage.code !== 'en')}
                className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  isLanguageLocked && currentLanguage.code !== 'en'
                    ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                    : 'bg-white/20 border-white/30 hover:bg-white/30 cursor-pointer'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">More Languages</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showLanguageDropdown && (
                <div className="mt-2 p-2 bg-white/95 backdrop-blur-lg rounded-xl border border-white/30">
                  {isLanguageLocked && currentLanguage.code !== 'en' && (
                    <div className="mb-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        Language locked for this tab. Close tab and reopen to change.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {languages.slice(4).map((lang) => {
                      const isCurrent = currentLanguage.code === lang.code;
                      const isDisabled = isLanguageLocked && lang.code !== 'en';
                      
                      return (
                        <button
                          key={lang.code}
                          onClick={() => !isDisabled && handleLanguageChange(lang)}
                          disabled={isChangingLanguage || isDisabled}
                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                            isCurrent
                              ? 'bg-blue-600 text-white border-blue-600'
                              : isDisabled
                              ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                              : 'bg-white/20 border-white/30 hover:bg-white/30 cursor-pointer'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span className="text-sm font-medium truncate">
                            {lang.name.split('(')[0].trim()}
                          </span>
                          {isDisabled && <Lock className="w-3 h-3 text-gray-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-white/20 border border-gray-900/20 p-2 rounded-lg hover:bg-[#5b7adb] hover:text-white transition font-medium"
              >
                Admin
              </Link>
            )}

            <Link
              to={user ? "/add-listing" : "#"}
              onClick={handleAddPropertyClick}
              className={`block p-2 rounded-lg font-medium ${
                user
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
                  className="block w-full text-left bg-white/20 border border-gray-900/20 p-2 rounded-lg hover:bg-[#5b7adb] hover:text-white transition font-medium"
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
                  className="block bg-[#5b7adb] text-white p-2 rounded-lg hover:bg-[#4a69ca] transition font-medium"
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