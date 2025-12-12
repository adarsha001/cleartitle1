import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ================================================
// GOOGLE TRANSLATE INTEGRATION - DEPLOYMENT FIX
// ================================================

// Global state
window.googleTranslateReady = false;
window.googleTranslateLoading = false;
window.googleTranslateInitialized = false;
window.languageChangeInProgress = false;
window.lastLanguageChange = Date.now();

// Function to initialize Google Translate (only once)
const initializeGoogleTranslate = () => {
  if (window.googleTranslateLoading || window.googleTranslateInitialized) {
    return;
  }

  console.log('Initializing Google Translate...');
  window.googleTranslateLoading = true;

  // Create the script element with cache busting
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&${Date.now()}`;
  
  script.onload = () => {
    console.log('Google Translate script loaded');
    window.googleTranslateLoading = false;
  };
  
  script.onerror = () => {
    console.error('Failed to load Google Translate');
    window.googleTranslateLoading = false;
    window.googleTranslateInitialized = true;
  };
  
  document.head.appendChild(script);
};

// Define the callback function
window.googleTranslateElementInit = () => {
  if (window.googleTranslateReady) {
    return;
  }
  
  console.log('Google Translate Element Init called');
  
  try {
    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,kn,ta,te,ml,bn,gu,mr,pa,ur,or',
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    }, 'google_translate_element');
    
    window.googleTranslateReady = true;
    window.googleTranslateInitialized = true;
    console.log('Google Translate widget initialized');
    
    // Apply saved language on initial load
    const savedLang = localStorage.getItem('preferredLanguage');
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('hl');
    
    // Priority: URL parameter > localStorage
    const langToApply = urlLang || savedLang;
    
    if (langToApply && langToApply !== 'en') {
      console.log('Applying saved language on load:', langToApply);
      
      // Check if we just reloaded due to language change
      const justChangedLanguage = sessionStorage.getItem('justChangedLanguage');
      
      if (justChangedLanguage === langToApply) {
        console.log('Page just reloaded for language change, applying:', langToApply);
        sessionStorage.removeItem('justChangedLanguage');
        
        // Try to apply language without another reload
        setTimeout(() => {
          tryToApplyLanguage(langToApply, false);
        }, 1000);
      } else {
        // First time load or different language, apply normally
        setTimeout(() => {
          tryToApplyLanguage(langToApply, false);
        }, 500);
      }
    }
    
  } catch (error) {
    console.error('Error initializing Google Translate:', error);
    window.googleTranslateInitialized = true;
  }
};

// Function to try applying language with or without reload
const tryToApplyLanguage = (langCode, allowReload = true) => {
  console.log('tryToApplyLanguage called:', langCode, 'allowReload:', allowReload);
  
  try {
    const iframe = document.querySelector('.goog-te-menu-frame');
    
    if (iframe && iframe.contentWindow) {
      try {
        const select = iframe.contentWindow.document.querySelector('.goog-te-combo');
        if (select) {
          console.log('Setting language in iframe:', langCode);
          select.value = langCode;
          
          const changeEvent = new Event('change', { bubbles: true });
          select.dispatchEvent(changeEvent);
          
          // Also try click event for better compatibility
          setTimeout(() => {
            select.click();
          }, 100);
          
          return true;
        }
      } catch (e) {
        console.warn('Cannot access iframe:', e);
      }
    }
    
    // If direct iframe access fails and reload is allowed, use cookie method with reload
    if (allowReload) {
      console.log('Using cookie method with single reload');
      
      // Clear old cookies first
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + window.location.hostname;
      
      // Set new Google Translate cookies with timestamp to prevent caching
      const timestamp = Date.now();
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}; max-age=31536000`;
      document.cookie = `googtrans=/auto/${langCode}; path=/; domain=${window.location.hostname}; max-age=31536000`;
      
      // Set flag to indicate we're reloading for language change
      sessionStorage.setItem('justChangedLanguage', langCode);
      
      // Save the language with timestamp
      localStorage.setItem('preferredLanguage', langCode);
      localStorage.setItem('languageTimestamp', timestamp.toString());
      
      // Update URL with timestamp to prevent caching
      const url = new URL(window.location);
      url.searchParams.set('hl', langCode);
      url.searchParams.set('t', timestamp); // Add timestamp to prevent caching
      window.history.replaceState({}, '', url);
      
      // Reload after a short delay (this will happen only once)
      setTimeout(() => {
        console.log('Reloading page to apply translation...');
        // Force reload without cache
        window.location.href = window.location.href.split('?')[0] + '?hl=' + langCode + '&t=' + timestamp;
      }, 300);
      
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('Error applying language:', error);
    return false;
  }
};

// Global function to change language - will reload once if needed
window.changeLanguage = (langCode) => {
  console.log('changeLanguage called:', langCode);
  
  // Prevent rapid multiple language changes
  const now = Date.now();
  if (window.languageChangeInProgress && (now - window.lastLanguageChange < 2000)) {
    console.log('Language change too frequent, ignoring');
    return false;
  }
  
  window.languageChangeInProgress = true;
  window.lastLanguageChange = now;
  
  // Save preference with timestamp
  localStorage.setItem('preferredLanguage', langCode);
  localStorage.setItem('languageTimestamp', now.toString());
  
  // Update URL with timestamp to prevent caching
  const url = new URL(window.location);
  url.searchParams.set('hl', langCode);
  url.searchParams.set('t', now);
  window.history.replaceState({}, '', url);
  
  // Dispatch event for UI updates
  window.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { language: langCode, timestamp: now }
  }));
  
  // Clear any pending timeouts
  if (window.languageChangeTimeout) {
    clearTimeout(window.languageChangeTimeout);
  }
  
  // Try to apply language with iframe first
  if (window.googleTranslateReady) {
    const success = tryToApplyLanguage(langCode, true);
    
    if (!success) {
      // If iframe method fails, force cookie method with reload
      console.log('Iframe method failed, forcing cookie method');
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + window.location.hostname;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}; max-age=31536000`;
      sessionStorage.setItem('justChangedLanguage', langCode);
      
      window.languageChangeTimeout = setTimeout(() => {
        window.location.href = window.location.href.split('?')[0] + '?hl=' + langCode + '&t=' + now;
      }, 300);
    }
  } else {
    // Google Translate not ready yet, set cookies and reload
    console.log('Google Translate not ready, setting cookies and reloading');
    document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=' + window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}; max-age=31536000`;
    sessionStorage.setItem('justChangedLanguage', langCode);
    
    window.languageChangeTimeout = setTimeout(() => {
      window.location.href = window.location.href.split('?')[0] + '?hl=' + langCode + '&t=' + now;
    }, 300);
  }
  
  // Reset the flag after a delay
  setTimeout(() => {
    window.languageChangeInProgress = false;
  }, 2000);
  
  return true;
};

// Add CSS to hide Google Translate UI (only once)
if (!document.querySelector('#google-translate-styles')) {
  const style = document.createElement('style');
  style.id = 'google-translate-styles';
  style.textContent = `
    /* Hide all Google Translate UI */
    #google_translate_element {
      display: none !important;
      position: absolute !important;
      top: -9999px !important;
      left: -9999px !important;
      width: 1px !important;
      height: 1px !important;
      opacity: 0 !important;
      pointer-events: none !important;
      z-index: -9999 !important;
    }
    
    /* Hide Google Translate banner and dropdown */
    .goog-te-banner-frame,
    .goog-te-menu-frame,
    .goog-te-menu-value,
    .goog-te-gadget,
    .goog-te-gadget-simple,
    .goog-te-gadget-icon,
    .goog-logo-link,
    .goog-te-ftab-link,
    .goog-te-spinner-pos,
    .goog-tooltip,
    .skiptranslate {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
      opacity: 0 !important;
      position: absolute !important;
      top: -9999px !important;
      left: -9999px !important;
    }
    
    /* Fix body positioning */
    body {
      top: 0 !important;
    }
    
    body > .skiptranslate {
      display: none !important;
    }
    
    /* Style for translated content */
    .translated-ltr {
      margin-top: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

// Create the translate element container (only once)
if (!document.querySelector('#google_translate_element')) {
  const translateDiv = document.createElement('div');
  translateDiv.id = 'google_translate_element';
  translateDiv.style.cssText = 'position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
  document.body.appendChild(translateDiv);
}

// Check for language conflicts on page load
window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('hl');
  const savedLang = localStorage.getItem('preferredLanguage');
  const savedTimestamp = localStorage.getItem('languageTimestamp');
  
  // If URL language doesn't match saved language, update it
  if (urlLang && savedLang && urlLang !== savedLang) {
    console.log('Language mismatch detected:', { urlLang, savedLang });
    
    // Update URL to match saved language
    const url = new URL(window.location);
    url.searchParams.set('hl', savedLang);
    if (savedTimestamp) {
      url.searchParams.set('t', savedTimestamp);
    }
    window.history.replaceState({}, '', url);
  }
  
  // Clean up old session storage
  const sessionLang = sessionStorage.getItem('justChangedLanguage');
  if (sessionLang && savedLang && sessionLang !== savedLang) {
    console.log('Cleaning up stale session language:', sessionLang);
    sessionStorage.removeItem('justChangedLanguage');
  }
});

// Initialize Google Translate with delay
setTimeout(() => {
  initializeGoogleTranslate();
}, 1000);

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);