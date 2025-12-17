import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ================================================
// FIXED GOOGLE TRANSLATE INTEGRATION
// ================================================

// Clear the skipAutoTranslate flag that's blocking translation
localStorage.removeItem('skipAutoTranslate');

// Function to set Google Translate cookie properly
const setGoogleTranslateCookie = (langCode) => {
  if (langCode === 'en') {
    // Clear cookie for English
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    return;
  }
  
  // Set cookie with proper format and long expiry
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const cookieValue = `/en/${langCode}`;
  const cookieString = `googtrans=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; domain=${window.location.hostname}`;
  
  document.cookie = cookieString;
  console.log('Google Translate cookie set:', cookieString);
};

// Get current language from URL or localStorage
const getCurrentLanguage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('hl');
  const savedLang = localStorage.getItem('preferredLanguage');
  return urlLang || savedLang || 'en';
};

// Initialize Google Translate with current language
const initializeGoogleTranslate = () => {
  console.log('Initializing Google Translate...');
  
  // Remove any existing script
  const existingScript = document.querySelector('script[src*="translate.google.com"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Create new script
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  
  script.onload = () => {
    console.log('Google Translate script loaded');
  };
  
  script.onerror = (error) => {
    console.error('Failed to load Google Translate:', error);
  };
  
  document.head.appendChild(script);
};

// Google Translate callback
window.googleTranslateElementInit = () => {
  console.log('Google Translate callback called');
  
  try {
    // Initialize Google Translate widget
    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,kn,ta,te,ml,bn,gu,mr,pa,ur,or',
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
      disableAutoTranslation: false, // IMPORTANT: Enable auto translation
      trackVisibility: false
    }, 'google_translate_element');
    
    console.log('Google Translate widget initialized');
    
    // Get current language
    const currentLang = getCurrentLanguage();
    
    // If not English, apply translation after a delay
    if (currentLang !== 'en') {
      setTimeout(() => {
        try {
          console.log('Applying translation for:', currentLang);
          
          // Set cookie first
          setGoogleTranslateCookie(currentLang);
          
          // Then trigger Google Translate
          const select = document.querySelector('.goog-te-combo');
          if (select && select.value !== currentLang) {
            select.value = currentLang;
            select.dispatchEvent(new Event('change'));
            console.log('Translation applied via dropdown');
          }
        } catch (error) {
          console.error('Error applying translation:', error);
        }
      }, 1500);
    }
    
  } catch (error) {
    console.error('Error initializing Google Translate:', error);
  }
};

// Add CSS to style Google Translate properly
if (!document.querySelector('#google-translate-css')) {
  const style = document.createElement('style');
  style.id = 'google-translate-css';
  style.textContent = `
    /* Hide Google Translate UI elements */
    .goog-te-banner-frame {
      display: none !important;
    }
    
    .skiptranslate {
      display: none !important;
    }
    
    /* Ensure body stays in place */
    body {
      top: 0 !important;
    }
    
    /* Style the Google Translate dropdown if it appears */
    .goog-te-gadget {
      font-size: 0 !important;
    }
    
    .goog-te-gadget span {
      display: none !important;
    }
    
    /* Make sure translated content is visible */
    .goog-trans-section {
      opacity: 1 !important;
    }
    
    /* Fix for page jumping */
    .goog-te-spinner-pos {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

// Global function to change language (for testing)
window.changeLanguage = (langCode) => {
  console.log('Manual language change to:', langCode);
  
  // Save preference
  localStorage.setItem('preferredLanguage', langCode);
  localStorage.setItem('hasChangedLanguage', 'true');
  localStorage.removeItem('skipAutoTranslate'); // Remove blocking flag
  
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
  
  // Apply translation if not English
  if (langCode !== 'en') {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
  }
  
  // Reload page
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing...');
  
  // Get current language
  const currentLang = getCurrentLanguage();
  console.log('Current language:', currentLang);
  
  // Set cookie immediately
  setGoogleTranslateCookie(currentLang);
  
  // Initialize Google Translate after a short delay
  setTimeout(() => {
    initializeGoogleTranslate();
  }, 500);
});

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);