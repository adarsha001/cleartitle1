import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ================================================
// GOOGLE TRANSLATE INTEGRATION - RELOAD ONCE VERSION
// ================================================

// Global state
window.googleTranslateReady = false;
window.googleTranslateLoading = false;
window.googleTranslateInitialized = false;
window.languageChangeInProgress = false;

// Function to initialize Google Translate (only once)
const initializeGoogleTranslate = () => {
  if (window.googleTranslateLoading || window.googleTranslateInitialized) {
    return;
  }

  console.log('Initializing Google Translate...');
  window.googleTranslateLoading = true;

  // Create the script element
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
  
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
    if (savedLang && savedLang !== 'en') {
      console.log('Applying saved language on load:', savedLang);
      
      // Check if we just reloaded due to language change
      const justChangedLanguage = sessionStorage.getItem('justChangedLanguage');
      
      if (justChangedLanguage) {
        console.log('Page just reloaded for language change, applying:', savedLang);
        sessionStorage.removeItem('justChangedLanguage');
        
        // Try to apply language without another reload
        setTimeout(() => {
          tryToApplyLanguage(savedLang, false); // false = don't reload again
        }, 1000);
      } else {
        // First time load, apply language normally
        setTimeout(() => {
          tryToApplyLanguage(savedLang, false);
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
        if (select && select.value !== langCode) {
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
      
      // Set Google Translate cookies
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}; max-age=31536000`;
      document.cookie = `googtrans=/auto/${langCode}; path=/; domain=${window.location.hostname}; max-age=31536000`;
      
      // Set flag to indicate we're reloading for language change
      sessionStorage.setItem('justChangedLanguage', 'true');
      
      // Save the language
      localStorage.setItem('preferredLanguage', langCode);
      
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('hl', langCode);
      window.history.replaceState({}, '', url);
      
      // Reload after a short delay (this will happen only once)
      setTimeout(() => {
        console.log('Reloading page to apply translation...');
        window.location.reload();
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
  
  if (window.languageChangeInProgress) {
    console.log('Language change already in progress');
    return false;
  }
  
  window.languageChangeInProgress = true;
  
  // Save preference
  localStorage.setItem('preferredLanguage', langCode);
  
  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('hl', langCode);
  window.history.replaceState({}, '', url);
  
  // Dispatch event for UI updates
  window.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { language: langCode }
  }));
  
  // Try to apply language with iframe first
  if (window.googleTranslateReady) {
    const success = tryToApplyLanguage(langCode, true); // true = allow reload if needed
    
    if (!success) {
      // If iframe method fails, force cookie method with reload
      console.log('Iframe method failed, forcing cookie method');
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}; max-age=31536000`;
      sessionStorage.setItem('justChangedLanguage', 'true');
      
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  } else {
    // Google Translate not ready yet, set cookies and reload
    console.log('Google Translate not ready, setting cookies and reloading');
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}; max-age=31536000`;
    sessionStorage.setItem('justChangedLanguage', 'true');
    
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }
  
  // Reset the flag after a delay
  setTimeout(() => {
    window.languageChangeInProgress = false;
  }, 1000);
  
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

// Initialize Google Translate with delay
setTimeout(() => {
  // Check if we need to initialize
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('hl');
  const savedLang = localStorage.getItem('preferredLanguage');
  
  // Only initialize if we have a language preference other than English
  if ((urlLang && urlLang !== 'en') || (savedLang && savedLang !== 'en')) {
    initializeGoogleTranslate();
  } else {
    // Still initialize for English to have the widget ready
    initializeGoogleTranslate();
  }
}, 1000);

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);