/* ---- RESPONSIVE VERSION WITH PLACEHOLDER FIX + GOOGLE SIGN-IN IMPROVEMENT ---- */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { 
  Shield, Lock, Mail, ChevronRight, 
  FileCheck, LogIn, AlertCircle, Eye, EyeOff 
} from "lucide-react";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    emailOrUsername: "",
    password: "",
    sourceWebsite: "cleartitle1"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [isGoogleSDKLoaded, setIsGoogleSDKLoaded] = useState(false);

  const googleButtonRef = useRef(null);
  const isMounted = useRef(true);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /* ---------------- IMPROVED GOOGLE LOGIN SDK ---------------- */
  useEffect(() => {
    // Clean up any existing Google button
    if (googleButtonRef.current) {
      googleButtonRef.current.innerHTML = "";
    }

    // Skip if no client ID
    if (!GOOGLE_CLIENT_ID) {
      setGoogleError("Google Client ID Missing");
      return;
    }

    let googleScript = null;
    let googleSDKInitialized = false;

    const handleGoogleLoad = () => {
      if (!isMounted.current) return;
      
      if (window.google && window.google.accounts && !googleSDKInitialized) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            ux_mode: "popup",
            auto_select: false,
          });

          googleSDKInitialized = true;
          setIsGoogleSDKLoaded(true);
          
          // Force re-render to ensure button renders
          setTimeout(() => {
            if (isMounted.current && googleButtonRef.current && googleButtonRef.current.children.length === 0) {
              renderGoogleButton();
            }
          }, 100);
          
        } catch (err) {
          console.error("Google SDK initialization error:", err);
          setGoogleError("Unable to initialize Google Sign-In");
        }
      }
    };

    const renderGoogleButton = () => {
      if (!isMounted.current || !window.google || !googleSDKInitialized) return;
      
      try {
        // Clear any existing button
        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = "";
        }
        
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: "outline",
            size: "large",
            width: "100%",
            type: "standard",
            shape: "rectangular",
            text: "signin_with",
            logo_alignment: "left"
          }
        );

        // Optional: Prompt the One Tap UI after a delay
        setTimeout(() => {
          try {
            window.google.accounts.id.prompt((notification) => {
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // One Tap UI was not shown - that's okay
              }
            });
          } catch (e) {
            // Ignore prompt errors
          }
        }, 500);
        
      } catch (err) {
        console.error("Google button render error:", err);
      }
    };

    const loadGoogleSDK = () => {
      // Check if SDK is already loaded
      if (window.google && window.google.accounts) {
        handleGoogleLoad();
        return;
      }

      // Remove any existing script to avoid duplicates
      const existingScript = document.querySelector('script[src^="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create and load new script
      googleScript = document.createElement('script');
      googleScript.src = 'https://accounts.google.com/gsi/client';
      googleScript.async = true;
      googleScript.defer = true;
      googleScript.onload = handleGoogleLoad;
      googleScript.onerror = () => {
        if (isMounted.current) {
          setGoogleError("Failed to load Google Sign-In. Please refresh the page.");
        }
      };
      
      document.head.appendChild(googleScript);
    };

    // Load Google SDK with a small delay to ensure DOM is ready
    const loadTimer = setTimeout(() => {
      loadGoogleSDK();
    }, 300);

    // Cleanup function
    return () => {
      clearTimeout(loadTimer);
      
      if (googleScript && googleScript.parentNode) {
        googleScript.parentNode.removeChild(googleScript);
      }
      
      // Cancel any pending Google One Tap UI
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (e) {
          // Ignore cancel errors
        }
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  // Re-render Google button when SDK is loaded
  useEffect(() => {
    if (isGoogleSDKLoaded && googleButtonRef.current) {
      const timer = setTimeout(() => {
        if (googleButtonRef.current && googleButtonRef.current.children.length === 0) {
          window.google?.accounts?.id?.renderButton(
            googleButtonRef.current,
            {
              theme: "outline",
              size: "large",
              width: "100%"
            }
          );
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isGoogleSDKLoaded]);

  const handleGoogleResponse = async (response) => {
    if (!isMounted.current) return;
    
    setIsGoogleLoading(true);
    setGoogleError("");

    try {
      await googleLogin(response.credential);
      navigate("/profile");
    } catch (error) {
      if (isMounted.current) {
        setGoogleError("Google sign-in failed. Please try again.");
      }
    } finally {
      if (isMounted.current) setIsGoogleLoading(false);
    }
  };

  // Manual Google Sign-In fallback
  const handleManualGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.prompt();
      } catch (error) {
        setGoogleError("Please click the Google button above to sign in");
      }
    } else {
      setGoogleError("Google Sign-In not loaded. Please refresh the page.");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(form);
      navigate("/profile");
    } catch {
      alert("Invalid login credentials");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black text-white flex flex-col lg:flex-row">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

        <div className="relative z-10 space-y-12 max-w-lg">
          <img src="/logo.png" className="w-56 h-auto drop-shadow-xl" />

          <h2 className="text-5xl font-bold leading-snug">
            Secure Access to <br /> Verified Properties
          </h2>

          <p className="text-white/80 text-lg">
            Sign in to access legally verified properties and complete title documentation.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10">
              <p className="text-yellow-300 text-3xl font-bold">100%</p>
              <p className="text-white/70 text-sm">Legal Verification</p>
            </div>

            <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10">
              <p className="text-green-400 text-3xl font-bold">500+</p>
              <p className="text-white/70 text-sm">Verified Properties</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile Big Logo */}
          <div className="lg:hidden text-center mb-6">
            <img src="/logo.png" className="w-40 sm:w-52 mx-auto drop-shadow-xl" />
          </div>

          {/* HEADER */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold flex items-center gap-2 justify-center lg:justify-start">
              <FileCheck className="text-yellow-300" /> Welcome Back
            </h2>
            <p className="text-white/70">Sign in to your account</p>
          </div>

          {/* GOOGLE SIGN-IN */}
          <div className="space-y-3">
            <div className="w-full flex justify-center">
              <div 
                ref={googleButtonRef} 
                className="w-full min-h-[40px] flex justify-center items-center"
              >
                {!isGoogleSDKLoaded && (
                  <button
                    type="button"
                    onClick={handleManualGoogleSignIn}
                    className="w-full bg-white text-gray-800 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                    disabled={isGoogleLoading}
                  >
                    <div className="w-5 h-5 bg-[#4285F4] rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    {isGoogleLoading ? "Loading..." : "Sign in with Google"}
                  </button>
                )}
              </div>
            </div>

            {isGoogleLoading && (
              <p className="text-center text-white/60 text-sm">Signing in with Google…</p>
            )}

            {googleError && (
              <p className="text-center text-red-400 text-sm">{googleError}</p>
            )}
            
            {/* Fallback button for slow connections */}
            {isGoogleSDKLoaded && (
              <button
                type="button"
                onClick={handleManualGoogleSignIn}
                className="text-sm text-blue-300 hover:text-blue-200 mx-auto block"
              >
                Not seeing the Google button? Click here
              </button>
            )}
          </div>

          {/* DIVIDER */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-black px-4 text-white/50">Or continue with email</span>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* EMAIL */}
            <div>
              <label className="text-sm text-white/70">Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  name="emailOrUsername"
                  placeholder="Enter your email or username"
                  value={form.emailOrUsername}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 bg-white/10 border border-white/20 rounded-xl py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm text-white/70">Password</label>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 bg-white/10 border border-white/20 rounded-xl py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              className="group w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="w-5 h-5" /> Sign In with Email
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* NEW USER */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-black text-white/50 text-sm">
                New to CLEAR TITLE 1?
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="w-full border-2 border-white/20 text-white py-4 rounded-xl hover:bg-white/10 transition-all font-bold backdrop-blur-sm"
          >
            Create Legal Account
          </button>

        </div>
      </div>
    </div>
  );
}