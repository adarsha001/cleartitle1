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
    { code: 'ur', name: 'اردو (Urdu)', flag: '🇮🇳' },
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

  // Handle language change - NO RELOAD
  const handleLanguageChange = (language) => {
    console.log('Changing language to (no reload):', language.code);
    
    // Update UI state immediately
    setCurrentLanguage(language);
    setShowLanguageDropdown(false);
    setIsMobileMenuOpen(false);
    
    // Save to localStorage
    localStorage.setItem('preferredLanguage', language.code);
    
    // Update URL without reloading
    const url = new URL(window.location);
    url.searchParams.set('hl', language.code);
    window.history.replaceState({}, '', url);
    
    // Use the global function to change language (NO RELOAD)
    if (typeof window.changeLanguage === 'function') {
      window.changeLanguage(language.code);
    } else {
      console.warn('window.changeLanguage not available yet');
      
      // Fallback: try direct approach without reload
      const iframe = document.querySelector('.goog-te-menu-frame');
      if (iframe && iframe.contentWindow) {
        try {
          const select = iframe.contentWindow.document.querySelector('.goog-te-combo');
          if (select) {
            select.value = language.code;
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } catch (e) {
          console.warn('Could not access iframe:', e);
        }
      }
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

  // The JSX remains exactly the same as your original...
  return (
    <>
      {/* Main Navbar with dynamic padding */}
      <nav className={`bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
              <img src="/logo.png" className="w-16 h-auto drop-shadow-xl" alt="Logo" />
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
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-200 shadow-sm font-medium"
                >
                  <Globe className="w-4 h-4" />
                  <span>{currentLanguage.flag} {currentLanguage.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showLanguageDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/30 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-700">Select Language</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang)}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${currentLanguage.code === lang.code ? 'bg-blue-50' : ''}`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-sm font-medium text-gray-800">{lang.name}</span>
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
              <p className="px-2 pb-2 text-sm font-semibold text-gray-700">Language</p>
              <div className="grid grid-cols-2 gap-2">
                {languages.slice(0, 4).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${currentLanguage.code === lang.code
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white/20 border-white/30 hover:bg-white/30'
                      }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.code === 'en' ? 'EN' : lang.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">More Languages</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showLanguageDropdown && (
                <div className="mt-2 p-2 bg-white/95 backdrop-blur-lg rounded-xl border border-white/30">
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {languages.slice(4).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${currentLanguage.code === lang.code
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white/20 border-white/30 hover:bg-white/30'
                          }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="text-sm font-medium truncate">{lang.name.split('(')[0].trim()}</span>
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
                  className="block hover:text-[#5b7adb] hover:bg-white/30 p-2 rounded font-medium">
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
    </>
  );
}