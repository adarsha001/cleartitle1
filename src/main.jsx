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

// Clear ALL Google Translate cookies and localStorage on page unload
const clearLanguageData = () => {
  const domain = window.location.hostname;
  
  // Clear cookies
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=${domain}`;
  document.cookie = `googtrans=; path=/; max-age=0; domain=${domain}`;
  
  // Clear localStorage language data
  localStorage.removeItem('preferredLanguage');
  localStorage.removeItem('languageLocked');
  localStorage.removeItem('languageChangedOnce');
  localStorage.removeItem('languageSource');
  localStorage.removeItem('languageTimestamp');
  
  console.log('Language data cleared (session ended)');
};

// Clear language data when tab is closing
window.addEventListener('beforeunload', (event) => {
  // Don't clear if it's a page refresh (F5, Ctrl+R)
  const isRefresh = performance.navigation.type === 1 || 
                   performance.getEntriesByType("navigation")[0]?.type === "reload";
  
  if (!isRefresh) {
    // Use sessionStorage to mark that we're actually closing the tab
    sessionStorage.setItem('closingTab', 'true');
    clearLanguageData();
  }
});

// Clear language data on page load if it was a fresh tab
window.addEventListener('load', () => {
  const wasClosing = sessionStorage.getItem('closingTab') === 'true';
  
  if (wasClosing) {
    // Tab was previously closed, clear everything
    clearLanguageData();
    sessionStorage.removeItem('closingTab');
    sessionStorage.removeItem('preferredLanguage');
    sessionStorage.removeItem('languageTimestamp');
    sessionStorage.removeItem('sessionInitialized');
    
    // Also clear URL parameters
    if (window.location.search.includes('hl=')) {
      const url = new URL(window.location);
      url.searchParams.delete('hl');
      url.searchParams.delete('t');
      window.history.replaceState({}, '', url);
    }
  } else {
    // This is likely a refresh or navigation within the same tab
    // Keep sessionStorage data but clear localStorage language locks
    localStorage.removeItem('languageLocked');
    localStorage.removeItem('languageChangedOnce');
    localStorage.setItem('languageSource', 'session'); // Mark as session-based
  }
});

// Global function to change language
window.changeLanguage = (langCode) => {
  console.log('Changing language to:', langCode);
  
  // Save to sessionStorage (tab-specific)
  sessionStorage.setItem('preferredLanguage', langCode);
  sessionStorage.setItem('languageTimestamp', Date.now().toString());
  
  // Also save to localStorage but mark as session-based
  localStorage.setItem('preferredLanguage', langCode);
  localStorage.setItem('languageSource', 'session');
  
  // Clear any existing Google Translate cookies
  const domain = window.location.hostname;
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; domain=${domain}`;
  
  // Set new cookie with shorter expiration (session cookie)
  // Setting without max-age makes it a session cookie
  document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
  
  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('hl', langCode);
  url.searchParams.set('t', Date.now());
  window.history.replaceState({}, '', url);
  
  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
  
  // Reload page after short delay
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
  script.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
  
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
    
    // Apply saved language from sessionStorage
    const sessionLang = sessionStorage.getItem('preferredLanguage');
    const urlLang = new URLSearchParams(window.location.search).get('hl');
    const langCode = urlLang || sessionLang || 'en';
    
    if (langCode && langCode !== 'en') {
      console.log('Applying session language:', langCode);
      
      setTimeout(() => {
        try {
          const iframe = document.querySelector('.goog-te-menu-frame');
          if (iframe && iframe.contentWindow) {
            const select = iframe.contentWindow.document.querySelector('.goog-te-combo');
            if (select && select.value !== langCode) {
              select.value = langCode;
              select.dispatchEvent(new Event('change'));
            }
          }
        } catch (error) {
          console.warn('Could not apply session language:', error);
        }
      }, 1000);
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

// Initialize Google Translate after a delay
setTimeout(() => {
  initializeGoogleTranslate();
}, 1000);

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);