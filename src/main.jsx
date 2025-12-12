import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ================================================
// SIMPLIFIED GOOGLE TRANSLATE INTEGRATION
// ================================================

// Global state
window.googleTranslateReady = false;
window.googleTranslateLoading = false;

// Clear Google Translate cookies on page load
const clearGoogleTranslateCookies = () => {
  const domain = window.location.hostname;
  const path = '/';
  
  // Clear all possible Google Translate cookies
  const cookieNames = [
    'googtrans',
    'googtrans_prev',
    'googtrans_debug'
  ];
  
  cookieNames.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=${path}; domain=${domain}`;
    document.cookie = `${cookieName}=; path=${path}; max-age=0; domain=${domain}`;
    
    // Also clear for subdomains
    if (domain.includes('.')) {
      const domainParts = domain.split('.');
      if (domainParts.length > 1) {
        const baseDomain = domainParts.slice(-2).join('.');
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=${path}; domain=${baseDomain}`;
        document.cookie = `${cookieName}=; path=${path}; max-age=0; domain=${baseDomain}`;
      }
    }
  });
  
  console.log('Cleared Google Translate cookies');
};

// Global function to change language
window.changeLanguage = (langCode) => {
  console.log('Changing language to:', langCode);
  
  // Save preference to localStorage
  localStorage.setItem('preferredLanguage', langCode);
  
  // Clear cookies first
  clearGoogleTranslateCookies();
  
  // Set session-only cookie (no expiry, will clear when tab closes)
  const domain = window.location.hostname;
  const path = '/';
  
  // Set cookie without expiry (session cookie)
  document.cookie = `googtrans=/en/${langCode}; path=${path}; domain=${domain}`;
  
  // Store language selection in sessionStorage
  if (langCode !== 'en') {
    sessionStorage.setItem('languageLocked', 'true');
    sessionStorage.setItem('selectedLanguage', langCode);
  }
  
  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('hl', langCode);
  url.searchParams.set('t', Date.now());
  window.history.replaceState({}, '', url);
  
  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent('languageChanged', { 
    detail: { language: langCode } 
  }));
  
  // Reload page
  setTimeout(() => {
    window.location.reload();
  }, 300);
};

// Initialize Google Translate
const initializeGoogleTranslate = () => {
  if (window.googleTranslateLoading || window.googleTranslateReady) {
    return;
  }

  console.log('Initializing Google Translate...');
  window.googleTranslateLoading = true;

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&${Date.now()}`;
  
  script.onload = () => {
    console.log('Google Translate script loaded');
  };
  
  script.onerror = () => {
    console.error('Failed to load Google Translate');
    window.googleTranslateLoading = false;
  };
  
  document.head.appendChild(script);
};

// Google Translate callback
window.googleTranslateElementInit = () => {
  if (window.googleTranslateReady) return;
  
  console.log('Google Translate Element Init called');
  
  try {
    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,kn,ta,te,ml,bn,gu,mr,pa,ur,or',
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    }, 'google_translate_element');
    
    window.googleTranslateReady = true;
    console.log('Google Translate widget initialized');
    
    // Apply saved language if any
    setTimeout(() => {
      try {
        // Check sessionStorage for language selection
        const sessionLanguage = sessionStorage.getItem('selectedLanguage');
        const urlLang = new URLSearchParams(window.location.search).get('hl');
        const langCode = sessionLanguage || urlLang || 'en';
        
        if (langCode && langCode !== 'en') {
          console.log('Applying session language:', langCode);
          
          const iframe = document.querySelector('.goog-te-menu-frame');
          if (iframe && iframe.contentWindow) {
            const select = iframe.contentWindow.document.querySelector('.goog-te-combo');
            if (select && select.value !== langCode) {
              select.value = langCode;
              select.dispatchEvent(new Event('change'));
            }
          }
        }
      } catch (error) {
        console.warn('Could not apply saved language:', error);
      }
    }, 1500);
    
  } catch (error) {
    console.error('Error initializing Google Translate:', error);
  }
};

// Add CSS to hide Google Translate UI
if (!document.querySelector('#google-translate-styles')) {
  const style = document.createElement('style');
  style.id = 'google-translate-styles';
  style.textContent = `
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
    
    .goog-te-banner-frame,
    .goog-te-menu-frame,
    .goog-te-menu-value,
    .goog-te-gadget,
    .skiptranslate {
      display: none !important;
      visibility: hidden !important;
    }
    
    body {
      top: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

// Create translate element container
if (!document.querySelector('#google_translate_element')) {
  const translateDiv = document.createElement('div');
  translateDiv.id = 'google_translate_element';
  translateDiv.style.cssText = 'position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
  document.body.appendChild(translateDiv);
}

// Clear cookies on page load
clearGoogleTranslateCookies();

// Initialize Google Translate
setTimeout(() => {
  initializeGoogleTranslate();
}, 1000);

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);