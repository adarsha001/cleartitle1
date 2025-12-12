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
window.googleTranslateInitialized = false;

// Global function to change language
window.changeLanguage = (langCode) => {
  console.log('Changing language to:', langCode);
  
  // Prevent multiple clicks
  if (window.languageChangeInProgress) {
    console.log('Language change already in progress');
    return false;
  }
  
  window.languageChangeInProgress = true;
  
  // Clear old Google Translate cookies
  const domain = window.location.hostname;
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=' + domain;
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=.' + domain;
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
  
  // Set new language cookie
  document.cookie = `googtrans=/en/${langCode}; path=/; max-age=31536000; domain=${domain}; SameSite=Lax`;
  
  // Save to localStorage
  localStorage.setItem('preferredLanguage', langCode);
  localStorage.setItem('languageTimestamp', Date.now().toString());
  
  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('hl', langCode);
  url.searchParams.set('t', Date.now());
  window.history.replaceState({}, '', url);
  
  // Dispatch event for UI updates
  window.dispatchEvent(new CustomEvent('languageChanged', {
    detail: { language: langCode }
  }));
  
  // Set flag for reload detection
  sessionStorage.setItem('justChangedLanguage', 'true');
  
  // Try to use Google Translate API if available
  if (window.googleTranslateReady) {
    try {
      const iframe = document.querySelector('.goog-te-menu-frame');
      if (iframe && iframe.contentWindow) {
        const select = iframe.contentWindow.document.querySelector('.goog-te-combo');
        if (select) {
          select.value = langCode;
          select.dispatchEvent(new Event('change'));
          
          // Reset progress flag
          setTimeout(() => {
            window.languageChangeInProgress = false;
          }, 1000);
          
          return true;
        }
      }
    } catch (error) {
      console.warn('Could not access Google Translate iframe:', error);
    }
  }
  
  // Fallback: reload the page
  console.log('Reloading page to apply translation...');
  setTimeout(() => {
    window.location.reload();
  }, 300);
  
  return true;
};

// Initialize Google Translate
const initializeGoogleTranslate = () => {
  if (window.googleTranslateLoading || window.googleTranslateInitialized) {
    return;
  }

  console.log('Initializing Google Translate...');
  window.googleTranslateLoading = true;

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

// Google Translate callback
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
    
    // Check for saved language
    const savedLang = localStorage.getItem('preferredLanguage');
    const urlLang = new URLSearchParams(window.location.search).get('hl');
    const langCode = urlLang || savedLang;
    
    if (langCode && langCode !== 'en') {
      console.log('Applying saved language:', langCode);
      
      // Set cookie on initial load
      const domain = window.location.hostname;
      document.cookie = `googtrans=/en/${langCode}; path=/; max-age=31536000; domain=${domain}; SameSite=Lax`;
      
      // Try to apply via iframe
      setTimeout(() => {
        try {
          const iframe = document.querySelector('.goog-te-menu-frame');
          if (iframe && iframe.contentWindow) {
            const select = iframe.contentWindow.document.querySelector('.goog-te-combo');
            if (select) {
              select.value = langCode;
              select.dispatchEvent(new Event('change'));
            }
          }
        } catch (error) {
          console.warn('Could not apply saved language:', error);
        }
      }, 1000);
    }
    
  } catch (error) {
    console.error('Error initializing Google Translate:', error);
    window.googleTranslateInitialized = true;
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
    
    body > .skiptranslate {
      display: none !important;
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