// src/context/LanguageContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const LanguageContext = createContext();

const LANGUAGE_MAP = {
  en: { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  hi: { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  kn: { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  ta: { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  te: { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  ml: { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  bn: { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  gu: { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  mr: { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  pa: { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  ur: { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  or: { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🇮🇳" }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en"); // store as code
  const [isTranslating, setIsTranslating] = useState(false);
  const pendingLangRef = useRef(null);
  const widgetLoadedRef = useRef(false);
  const pollerRef = useRef(null);

  // Utility: attempt to apply to Google translate select if present
  const applyToGoogleSelect = (langCode) => {
    const select = document.querySelector(".goog-te-combo");
    if (!select) return false;
    try {
      select.value = langCode;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    } catch (e) {
      // fallback
      return false;
    }
  };

  // Expose a global helper so other scripts/components can call it directly
  const exposeGlobalHelpers = () => {
    // this function will try to apply language or set pending
    window.changeLanguage = (languageCode) => {
      if (!languageCode) return false;

      const applied = applyToGoogleSelect(languageCode);
      if (applied) {
        localStorage.setItem("preferredLanguage", languageCode);
        // update url
        const url = new URL(window.location);
        url.searchParams.set("hl", languageCode);
        window.history.replaceState({}, "", url);

        // dispatch event so in-app listeners update
        const ev = new CustomEvent("languageChanged", { detail: { languageCode } });
        window.dispatchEvent(ev);
        return true;
      }

      // not applied — store pending and return false
      window.__PREFERRED_LANG_TO_APPLY = languageCode;
      return false;
    };

    window.getCurrentLanguage = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) return select.value || currentLanguage;
      return currentLanguage;
    };
  };

  // Initialize Google Translate widget (hidden element should exist in DOM)
  useEffect(() => {
    // skip if already initialized
    if (typeof window.google === "object" && window.google.translate) {
      widgetLoadedRef.current = true;
      exposeGlobalHelpers();
      return;
    }

    // Inject script (idempotent)
    if (!document.querySelector('script[data-google-translate]')) {
      const script = document.createElement("script");
      script.setAttribute("data-google-translate", "1");
      script.src = "https://translate.google.com/translate_a/element.js?cb=__googleTranslateElementInit";
      script.async = true;

      // global init callback
      window.__googleTranslateElementInit = () => {
        try {
          /* eslint-disable no-undef */
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: Object.keys(LANGUAGE_MAP).join(","),
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            },
            "google_translate_element"
          );
          /* eslint-enable no-undef */

          widgetLoadedRef.current = true;
          exposeGlobalHelpers();

          // if a pending language was set before widget loaded, try to apply it
          const pending = window.__PREFERRED_LANG_TO_APPLY || localStorage.getItem("preferredLanguage");
          if (pending && pending !== "en") {
            // give the select a little time to be inserted
            setTimeout(() => {
              window.changeLanguage(pending);
            }, 400);
          }

          // Attach listener to .goog-te-combo if present (re-emit custom event on change)
          setTimeout(() => {
            const select = document.querySelector(".goog-te-combo");
            if (select && !select._hasContextListener) {
              select.addEventListener("change", (e) => {
                const langCode = e.target.value;
                // update local state and localStorage
                setCurrentLanguage(langCode);
                localStorage.setItem("preferredLanguage", langCode);
                // re-emit for any other listeners
                const ev = new CustomEvent("languageChanged", { detail: { languageCode: langCode } });
                window.dispatchEvent(ev);
              });
              select._hasContextListener = true;
            }
          }, 500);
        } catch (err) {
          // ignore initialization errors
          console.warn("Google Translate init failed", err);
        }
      };

      document.head.appendChild(script);
    }

    // expose at least a stub for window.changeLanguage so callers don't crash
    if (!window.changeLanguage) {
      window.changeLanguage = (c) => {
        // set pending and return false — provider will poll and try to apply
        window.__PREFERRED_LANG_TO_APPLY = c;
        return false;
      };
    }

    // poll to apply pending language if any (and to detect when the hidden select appears)
    pollerRef.current = setInterval(() => {
      const pending = window.__PREFERRED_LANG_TO_APPLY;
      const select = document.querySelector(".goog-te-combo");
      if (select && pending) {
        const applied = applyToGoogleSelect(pending);
        if (applied) {
          delete window.__PREFERRED_LANG_TO_APPLY;
          localStorage.setItem("preferredLanguage", pending);
          const ev = new CustomEvent("languageChanged", { detail: { languageCode: pending } });
          window.dispatchEvent(ev);
        }
      }
    }, 350);

    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
    // only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to custom languageChanged events as a canonical source of truth
  useEffect(() => {
    const onLanguageChanged = (e) => {
      const code = e?.detail?.languageCode;
      if (code && code !== currentLanguage) {
        setCurrentLanguage(code);
      }
      setIsTranslating(false);
    };

    window.addEventListener("languageChanged", onLanguageChanged);
    return () => window.removeEventListener("languageChanged", onLanguageChanged);
  }, [currentLanguage]);

  // On mount: set currentLanguage from localStorage or URL param
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("hl");
    const saved = localStorage.getItem("preferredLanguage");
    const initial = urlLang || saved || "en";

    if (initial !== currentLanguage) setCurrentLanguage(initial);

    // If widget already loaded, try to apply initial
    if (widgetLoadedRef.current) {
      window.changeLanguage(initial);
    } else {
      // schedule pending to be applied by init routine/poller
      window.__PREFERRED_LANG_TO_APPLY = initial;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Public API: changeLanguage returns a Promise that resolves when the change is applied (or rejects after timeout)
  const changeLanguage = (languageCode) => {
    return new Promise((resolve, reject) => {
      if (!languageCode) return reject(new Error("No language code"));

      setIsTranslating(true);

      const appliedNow = window.changeLanguage && window.changeLanguage(languageCode);
      if (appliedNow) {
        // changeLanguage handler will dispatch languageChanged -> listener will set isTranslating false
        // but resolve quickly here
        setTimeout(() => {
          setIsTranslating(false);
          resolve(true);
        }, 400);
        return;
      }

      // If not applied now, set pending and poll for up to 6s
      window.__PREFERRED_LANG_TO_APPLY = languageCode;
      let elapsed = 0;
      const timeout = 6000;
      const interval = 300;

      const t = setInterval(() => {
        elapsed += interval;
        const applied = applyToGoogleSelect(languageCode);
        if (applied) {
          clearInterval(t);
          setIsTranslating(false);
          localStorage.setItem("preferredLanguage", languageCode);
          const ev = new CustomEvent("languageChanged", { detail: { languageCode } });
          window.dispatchEvent(ev);
          resolve(true);
          return;
        }
        if (elapsed >= timeout) {
          clearInterval(t);
          setIsTranslating(false);
          reject(new Error("Timed out waiting for Google Translate widget"));
        }
      }, interval);
    });
  };

  const restoreOriginal = () => {
    // revert to English
    try {
      if (window.changeLanguage) window.changeLanguage("en");
      setCurrentLanguage("en");
      localStorage.removeItem("preferredLanguage");
    } catch (e) {
      console.warn("restoreOriginal failed", e);
    }
  };

  const contextValue = {
    currentLanguage,
    languages: LANGUAGE_MAP,
    changeLanguage,
    isTranslating,
    restoreOriginal
  };

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
