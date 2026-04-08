/* ---- FIXED GOOGLE SIGN-IN WITH SIMPLIFIED APPROACH ---- */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { 
  Mail, ChevronRight, 
  FileCheck, LogIn, Eye, EyeOff 
} from "lucide-react";
import TruecallerAuth from "./TruecallerAuth";

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
  const [googleButtonReady, setGoogleButtonReady] = useState(false);

  const googleButtonRef = useRef(null);
  const isMounted = useRef(true);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
    const handleLoginSuccess = (user) => {
    console.log('Login successful:', user);
    // Additional success handling if needed
  };

  const handleLoginError = (error) => {
    console.error('Login error:', error);
    // Additional error handling if needed
  };

  /* ---------------- SIMPLIFIED GOOGLE LOGIN SDK ---------------- */
  useEffect(() => {
    // Clear any previous state
    setGoogleButtonReady(false);
    
    if (!GOOGLE_CLIENT_ID) {
      setGoogleError("Google Client ID is not configured");
      return;
    }

    // Check if script already exists
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      initializeGoogleSDK();
      return;
    }

    // Load the Google SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (isMounted.current) {
        setTimeout(() => {
          initializeGoogleSDK();
        }, 100);
      }
    };
    
    script.onerror = () => {
      if (isMounted.current) {
        setGoogleError("Failed to load Google Sign-In");
      }
    };
    
    document.body.appendChild(script);

    return () => {
      // Clean up Google SDK on unmount
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  const initializeGoogleSDK = () => {
    if (!window.google || !window.google.accounts) {
      setGoogleError("Google SDK not available");
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        ux_mode: "popup",
        auto_select: false,
        cancel_on_tap_outside: false,
      });
      
      setGoogleButtonReady(true);
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (isMounted.current && googleButtonRef.current) {
          renderGoogleButton();
        }
      }, 200);
      
    } catch (error) {
      console.error("Google initialization error:", error);
      setGoogleError("Failed to initialize Google Sign-In");
    }
  };

  const renderGoogleButton = () => {
    if (!googleButtonRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      // Clear previous content
      googleButtonRef.current.innerHTML = "";
      
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: "outline",
          size: "large",
          width: "100%",
          type: "standard",
          text: "signin_with",
          shape: "rectangular"
        }
      );

      // Attempt to show One Tap after a delay
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          try {
            window.google.accounts.id.prompt();
          } catch (e) {
            // One Tap not showing is acceptable
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error("Google button render error:", error);
      setGoogleButtonReady(false);
    }
  };

  // Re-render button when ref becomes available
  useEffect(() => {
    if (googleButtonReady && googleButtonRef.current) {
      const timer = setTimeout(() => {
        renderGoogleButton();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [googleButtonReady]);

  const handleGoogleResponse = async (response) => {
    if (!isMounted.current) return;
    
    setIsGoogleLoading(true);
    setGoogleError("");

    try {
      await googleLogin(response.credential);
      navigate("/profile");
    } catch (error) {
      console.error("Google login error:", error);
      if (isMounted.current) {
        setGoogleError("Google sign-in failed. Please try again.");
      }
    } finally {
      if (isMounted.current) setIsGoogleLoading(false);
    }
  };

  const handleManualGoogleSignIn = () => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (error) {
        setGoogleError("Please use the Google button above");
      }
    } else {
      setGoogleError("Google Sign-In is still loading. Please wait.");
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
          <img src="/logo.png" className="w-56 h-auto drop-shadow-xl" alt="Logo" />

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
            <img src="/logo.png" className="w-40 sm:w-52 mx-auto drop-shadow-xl" alt="Logo" />
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
                {/* Show placeholder while loading */}
                {!googleButtonReady && !googleError && (
                  <button
                    type="button"
                    className="w-full bg-white text-gray-800 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <div className="w-5 h-5 bg-[#4285F4] rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    Loading Google Sign-In...
                  </button>
                )}
                
                {/* Show error state */}
                {googleError && !googleButtonReady && (
                  <button
                    type="button"
                    onClick={handleManualGoogleSignIn}
                    className="w-full bg-red-50 text-red-800 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-200"
                  >
                    <div className="w-5 h-5 bg-[#4285F4] rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    {googleError}
                  </button>
                )}
              </div>
            </div>

            {isGoogleLoading && (
              <p className="text-center text-white/60 text-sm">Signing in with Google…</p>
            )}

            {/* Manual trigger */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleManualGoogleSignIn}
                className="text-sm text-blue-300 hover:text-blue-200 hover:underline"
              >
                Click here if Google button doesn't appear
              </button>
            </div>
          </div>
          <div className="space-y-4">
            

            
       <TruecallerAuth 
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            redirectUrl="/profile"
          />
  
  <div className="relative flex py-2 items-center">
    <div className="flex-grow border-t border-white/10"></div>
    <span className="flex-shrink mx-4 text-white/40 text-xs">OR</span>
    <div className="flex-grow border-t border-white/10"></div>
  </div>

  {/* Your existing Google Button code here */}
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
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