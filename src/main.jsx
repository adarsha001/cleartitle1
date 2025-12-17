import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ================================================
// PRODUCTION-READY GOOGLE TRANSLATE INTEGRATION
// ================================================

// Check if we're in production
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1' &&
                     !window.location.hostname.startsWith('192.168.');

console.log('Environment:', isProduction ? 'Production' : 'Development');

// Clear any blocking flags
localStorage.removeItem('skipAutoTranslate');

// Get current language preference
const getCurrentLanguage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('hl');
  const savedLang = localStorage.getItem('preferredLanguage');
  return urlLang || savedLang || 'en';
};

// Set Google Translate cookie (works in both dev and prod)
const setGoogleTranslateCookie = (langCode) => {
  const domain = window.location.hostname;
  const cookieValue = langCode === 'en' ? '' : `/en/${langCode}`;
  
  // Clear old cookie
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=${domain}`;
  
  if (cookieValue) {
    // Set cookie with 1-year expiry
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    // Set for current domain
    document.cookie = `googtrans=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; domain=${domain}`;
    
    // Also set without domain for localhost
    if (!isProduction) {
      document.cookie = `googtrans=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/`;
    }
    
    console.log('Google Translate cookie set:', cookieValue);
  }
};

// Initialize Google Translate
const initializeGoogleTranslate = () => {
  console.log('Initializing Google Translate...');
  
  // Remove any existing script
  const existingScript = document.querySelector('script[src*="translate.google.com"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Create new script with cache busting
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit&_=${Date.now()}`;
  
  script.onload = () => {
    console.log('Google Translate script loaded successfully');
  };
  
  script.onerror = (error) => {
    console.error('Failed to load Google Translate:', error);
  };
  
  document.head.appendChild(script);
};

// Google Translate callback function
window.googleTranslateElementInit = () => {
  console.log('Google Translate Element Init called');
  
  try {
    // Initialize the translator
    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,kn,ta,te,ml,bn,gu,mr,pa,ur,or',
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
      multilanguagePage: true,
      gaTrack: false,
      gaId: null
    }, 'google_translate_element');
    
    console.log('Google Translate widget initialized');
    
    // Get current language
    const currentLang = getCurrentLanguage();
    
    // Apply translation if needed
    if (currentLang !== 'en') {
      console.log('Will apply translation for:', currentLang);
      
      // Set cookie
      setGoogleTranslateCookie(currentLang);
      
      // Try to apply translation after delay
      setTimeout(() => {
        try {
          const select = document.querySelector('.goog-te-combo');
          if (select && select.value !== currentLang) {
            select.value = currentLang;
            select.dispatchEvent(new Event('change'));
            console.log('Translation applied via dropdown');
          }
        } catch (error) {
          console.warn('Could not apply translation immediately:', error);
        }
      }, 2000);
    }
    
  } catch (error) {
    console.error('Error initializing Google Translate:', error);
  }
};

// Add CSS to hide Google Translate UI
if (!document.querySelector('#google-translate-styles')) {
  const style = document.createElement('style');
  style.id = 'google-translate-styles';
  style.textContent = `
    /* Completely hide Google Translate UI */
    #google_translate_element {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      height: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
    }
    
    .goog-te-banner-frame,
    .skiptranslate,
    .goog-te-gadget {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
    }
    
    /* Prevent page jumping */
    body {
      top: 0 !important;
      position: static !important;
    }
    
    /* Hide the Google Translate dropdown iframe */
    .goog-te-menu-frame {
      display: none !important;
      visibility: hidden !important;
    }
    
    /* Allow our custom dropdown to work */
    .goog-te-combo {
      position: fixed !important;
      top: -9999px !important;
      left: -9999px !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    
    /* Fix for translated content */
    .goog-trans-section {
      opacity: 1 !important;
    }
  `;
  document.head.appendChild(style);
}

// Create the translate element container
const translateDiv = document.createElement('div');
translateDiv.id = 'google_translate_element';
translateDiv.style.cssText = 'position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none;';
document.body.appendChild(translateDiv);

// Global function to change language
window.changeLanguage = (langCode) => {
  console.log('Changing language to:', langCode);
  
  // Save preference
  localStorage.setItem('preferredLanguage', langCode);
  localStorage.setItem('hasChangedLanguage', 'true');
  
  // Update URL
  const url = new URL(window.location);
  if (langCode === 'en') {
    url.searchParams.delete('hl');
  } else {
    url.searchParams.set('hl', langCode);
  }
  url.searchParams.set('t', Date.now());
  window.history.replaceState({}, '', url);
  
  // Set cookie
  setGoogleTranslateCookie(langCode);
  
  // Reload the page
  window.location.reload();
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Setting up translation');
  
  // Get current language
  const currentLang = getCurrentLanguage();
  console.log('Current language preference:', currentLang);
  
  // Set cookie immediately
  setGoogleTranslateCookie(currentLang);
  
  // Initialize Google Translate
  initializeGoogleTranslate();
  
  // Show environment warning in console
  if (!isProduction) {
    console.warn('⚠️ Google Translate may not work properly in development.');
    console.warn('   It requires HTTPS and a public domain to work fully.');
    console.warn('   It will work correctly when deployed to production.');
  }
});

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);