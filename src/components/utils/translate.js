// Google Translate Utility for Localhost
let googleTranslateInitialized = false;

export const initializeGoogleTranslate = () => {
  if (googleTranslateInitialized) return;
  
  console.log('Initializing Google Translate...');
  
  // Remove existing script if any
  const existingScript = document.getElementById('google-translate-script');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Remove existing translate element
  const existingTranslateDiv = document.getElementById('google_translate_element');
  if (existingTranslateDiv) {
    existingTranslateDiv.remove();
  }
  
  // Add CSS to hide Google Translate UI
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
    
    /* Ensure page content is visible */
    .goog-te-banner-frame.skiptranslate {
      display: none !important;
    }
    
    html {
      overflow-y: scroll !important;
    }
  `;
  document.head.appendChild(style);
  
  // Create translate element container
  const translateDiv = document.createElement('div');
  translateDiv.id = 'google_translate_element';
  translateDiv.style.cssText = 'position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; overflow: hidden;';
  document.body.appendChild(translateDiv);
  
  // Create script
  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.type = 'text/javascript';
  script.src = `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`;
  
  // Define callback function
  window.googleTranslateElementInit = () => {
    console.log('Google Translate Element Init called');
    
    try {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,kn,ta,te,ml,bn,gu,mr,pa,ur,or',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
      
      googleTranslateInitialized = true;
      console.log('Google Translate widget initialized successfully');
      
      // Apply saved language
      const savedLang = localStorage.getItem('preferredLanguage');
      if (savedLang && savedLang !== 'en') {
        setTimeout(() => {
          try {
            const iframe = document.querySelector('.goog-te-menu-frame');
            if (iframe && iframe.contentWindow) {
              const select = iframe.contentWindow.document.querySelector('.goog-te-combo');
              if (select) {
                select.value = savedLang;
                select.dispatchEvent(new Event('change'));
                console.log('Applied saved language:', savedLang);
              }
            }
          } catch (error) {
            console.log('Could not apply saved language:', error);
          }
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error initializing Google Translate:', error);
      // Retry after delay
      setTimeout(initializeGoogleTranslate, 3000);
    }
  };
  
  script.onerror = () => {
    console.error('Failed to load Google Translate script');
    // Try alternative CDN
    setTimeout(() => {
      if (!googleTranslateInitialized) {
        console.log('Trying alternative method...');
        initializeGoogleTranslateAlternative();
      }
    }, 3000);
  };
  
  document.head.appendChild(script);
};

// Alternative initialization method
const initializeGoogleTranslateAlternative = () => {
  const alternativeScript = document.createElement('script');
  alternativeScript.type = 'text/javascript';
  alternativeScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.head.appendChild(alternativeScript);
};

// Apply translation manually
export const applyTranslation = (langCode) => {
  return new Promise((resolve) => {
    const tryApply = (attempts = 0) => {
      if (attempts > 20) {
        console.log('Failed to apply translation after max attempts');
        resolve(false);
        return;
      }
      
      if (window.google?.translate?.TranslateElement) {
        try {
          const iframe = document.querySelector('.goog-te-menu-frame');
          if (iframe && iframe.contentWindow) {
            const select = iframe.contentWindow.document.querySelector('.goog-te-combo');
            if (select) {
              if (select.value === langCode) {
                console.log('Language already set');
                resolve(true);
                return;
              }
              
              select.value = langCode;
              select.dispatchEvent(new Event('change'));
              console.log('Language change triggered:', langCode);
              
              // Verify after delay
              setTimeout(() => {
                const bodyLang = document.documentElement.lang;
                const hasGoogleTranslated = document.body.classList.contains('translated-ltr') || 
                                           document.body.classList.contains('translated-rtl');
                
                if (bodyLang === langCode || hasGoogleTranslated) {
                  console.log('Translation verified');
                  resolve(true);
                } else {
                  console.log('Translation not verified, retrying...');
                  tryApply(attempts + 1);
                }
              }, 1000);
              
              return;
            }
          }
        } catch (error) {
          console.log('Error in tryApply:', error);
        }
      }
      
      // Try again
      setTimeout(() => tryApply(attempts + 1), 500);
    };
    
    tryApply();
  });
};

// Check if translation is active
export const isTranslated = () => {
  return document.documentElement.lang !== 'en' || 
         document.body.classList.contains('translated-ltr') || 
         document.body.classList.contains('translated-rtl');
};