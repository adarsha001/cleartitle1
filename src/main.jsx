import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ================================================
// GOOGLE TRANSLATE - FORCED COOKIE APPROACH
// ================================================

// Global state
window.googleTranslateReady = false;
window.googleTranslateLoading = false;
window.googleTranslateInitialized = false;
window.languageChangeInProgress = false;

// Clear all cookies for a domain
const clearAllCookies = () => {
  const domain = window.location.hostname;
  const domainsToClear = [
    domain,
    `.${domain}`,
    window.location.hostname.split('.').slice(-2).join('.') // Base domain
  ];

  domainsToClear.forEach(domain => {
    // Clear all cookies for this domain
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Clear the cookie with various path/domain combinations
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    });
  });

  // Specifically clear Google Translate cookies
  const googleCookies = ['googtrans', 'NID', '1P_JAR', 'AEC', 'OTZ', 'SIDCC'];
  googleCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.google.com`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  });
};

// Force Google Translate to respect our language choice
const forceGoogleTranslateLanguage = (langCode) => {
  console.log('Force setting language:', langCode);
  
  // Clear ALL cookies first
  clearAllCookies();
  
  // Generate unique timestamp for cache busting
  const timestamp = Date.now();
  
  // Set Google Translate cookie with multiple domain variations
  const domains = [
    window.location.hostname,
    `.${window.location.hostname}`,
    window.location.hostname.split('.').slice(-2).join('.') // Base domain
  ];
  
  domains.forEach(domain => {
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}; max-age=31536000; SameSite=Lax`;
    document.cookie = `googtrans=/auto/${langCode}; path=/; domain=${domain}; max-age=31536000; SameSite=Lax`;
  });
  
  // Also set without domain for localhost
  document.cookie = `googtrans=/en/${langCode}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = `googtrans=/auto/${langCode}; path=/; max-age=31536000; SameSite=Lax`;
  
  // Save to localStorage with timestamp
  localStorage.setItem('preferredLanguage', langCode);
  localStorage.setItem('languageChangeTimestamp', timestamp.toString());
  
  // Clear session storage
  sessionStorage.removeItem('justChangedLanguage');
  
  // Update URL with cache-busting timestamp
  const url = new URL(window.location);
  url.searchParams.set('hl', langCode);
  url.searchParams.set('_t', timestamp); // Use underscore to avoid conflicts
  const newUrl = url.toString();
  
  console.log('Redirecting to:', newUrl);
  
  // Force navigation (not reload) to clear all caches
  window.location.assign(newUrl);
};

// Function to initialize Google Translate
const initializeGoogleTranslate = () => {
  if (window.googleTranslateLoading || window.googleTranslateInitialized) {
    return;
  }

  console.log('Initializing Google Translate...');
  window.googleTranslateLoading = true;

  // Clear cookies before initializing
  clearAllCookies();

  // Create script with cache busting
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&_=${Date.now()}`;
  
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
    setTimeout(() => {
      const savedLang = localStorage.getItem('preferredLanguage');
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('hl');
      
      // Priority: URL parameter > localStorage
      const langToApply = urlLang || savedLang;
      
      if (langToApply && langToApply !== 'en') {
        console.log('Applying saved language on load:', langToApply);
        
        // Clear cookies and set the language
        clearAllCookies();
        
        // Set the cookie
        document.cookie = `googtrans=/en/${langToApply}; path=/; domain=${window.location.hostname}; max-age=31536000; SameSite=Lax`;
        
        // Try to trigger the language change in the iframe
        setTimeout(() => {
          try {
            const iframe = document.querySelector('.goog-te-menu-frame');
            if (iframe && iframe.contentWindow) {
              const select = iframe.contentWindow.document.querySelector('.goog-te-combo');
              if (select) {
                select.value = langToApply;
                select.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          } catch (e) {
            console.warn('Cannot access iframe:', e);
          }
        }, 1000);
      }
    }, 500);
    
  } catch (error) {
    console.error('Error initializing Google Translate:', error);
    window.googleTranslateInitialized = true;
  }
};

// Global function to change language
window.changeLanguage = (langCode) => {
  console.log('changeLanguage called:', langCode);
  
  if (window.languageChangeInProgress) {
    console.log('Language change already in progress');
    return false;
  }
  
  window.languageChangeInProgress = true;
  
  // Dispatch event for UI updates before reload
  window.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { language: langCode }
  }));
  
  // Use the forced approach
  forceGoogleTranslateLanguage(langCode);
  
  return true;
};

// Add CSS to hide Google Translate UI
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
    
    /* Prevent flash of untranslated content */
    .notranslate {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
}

// Create the translate element container
if (!document.querySelector('#google_translate_element')) {
  const translateDiv = document.createElement('div');
  translateDiv.id = 'google_translate_element';
  translateDiv.style.cssText = 'position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
  document.body.appendChild(translateDiv);
}

// Clear cookies and initialize on page load
window.addEventListener('load', () => {
  // Clear any conflicting cookies
  clearAllCookies();
  
  // Check for language in URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('hl');
  const savedLang = localStorage.getItem('preferredLanguage');
  
  // If there's a mismatch, force the URL language
  if (urlLang && savedLang && urlLang !== savedLang) {
    console.log('Language mismatch, forcing URL language:', urlLang);
    localStorage.setItem('preferredLanguage', urlLang);
    forceGoogleTranslateLanguage(urlLang);
    return;
  }
  
  // Initialize Google Translate
  setTimeout(initializeGoogleTranslate, 500);
});

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      clearAllCookies();
    }, 100);
  });
} else {
  setTimeout(() => {
    clearAllCookies();
  }, 100);
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);