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
    sourceWebsite: 'cleartitle1'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const googleButtonRef = useRef(null);
  
  // Add cleanup ref
  const isMounted = useRef(true);

  // Get Google Client ID from Vite environment
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    return () => {
      isMounted.current = false; // Cleanup on unmount
    };
  }, []);

  // Load Google SDK
  useEffect(() => {
    let googleScript = null;
    let isInitialized = false;

    const initializeGoogleSignIn = () => {
      if (window.google && GOOGLE_CLIENT_ID && !isInitialized) {
        console.log("Initializing Google Sign-In for Login page");
        isInitialized = true;
        
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: "signin",
            ux_mode: "popup"
          });

          // Render Google Sign-In button
          if (googleButtonRef.current && !googleButtonRef.current.hasChildNodes()) {
            window.google.accounts.id.renderButton(
              googleButtonRef.current,
              {
                theme: "outline",
                size: "large",
                width: 384,
                text: "continue_with",
                shape: "rectangular",
                logo_alignment: "left",
                locale: "en"
              }
            );
            
            // Show One Tap UI after a delay
            setTimeout(() => {
              if (window.google && window.google.accounts) {
                try {
                  window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                      console.log("One Tap not shown:", notification.getNotDisplayedReason());
                    }
                  });
                } catch (error) {
                  console.warn("One Tap prompt error:", error);
                }
              }
            }, 1000);
          }
        } catch (error) {
          console.error("Error rendering Google button:", error);
          setGoogleError("Unable to load Google Sign-In button");
        }
      }
    };

    // Load Google SDK script
    const loadGoogleSDK = () => {
      if (!window.google) {
        googleScript = document.createElement("script");
        googleScript.src = "https://accounts.google.com/gsi/client";
        googleScript.async = true;
        googleScript.defer = true;
        googleScript.onload = initializeGoogleSignIn;
        googleScript.onerror = (error) => {
          console.error("Failed to load Google Sign-In script:", error);
          setGoogleError("Failed to load Google Sign-In. Please check your internet connection.");
        };
        document.head.appendChild(googleScript);
      } else {
        initializeGoogleSignIn();
      }
    };

    if (GOOGLE_CLIENT_ID) {
      loadGoogleSDK();
    } else {
      setGoogleError("Google Client ID is missing. Please check environment configuration.");
      console.error("Missing VITE_GOOGLE_CLIENT_ID environment variable");
    }

    // Cleanup function
    return () => {
      isInitialized = false;
      
      // Remove Google button if it exists
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
      }
      
      // Cancel any pending Google authentication
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.log("Google cleanup error:", error);
        }
      }
      
      // Remove script if component unmounts quickly
      if (googleScript && document.head.contains(googleScript)) {
        document.head.removeChild(googleScript);
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleResponse = async (response) => {
    if (!isMounted.current) return;
    
    setIsGoogleLoading(true);
    setGoogleError("");
    
    console.log("🔍 Google Sign-In response received:", {
      hasCredential: !!response.credential,
      credentialType: typeof response.credential,
      credentialLength: response.credential?.length,
      first50: response.credential?.substring(0, 50)
    });
    
    try {
      // Send ONLY the token string (NOT an object)
      await googleLogin(response.credential);
      
      if (isMounted.current) {
        navigate("/profile");
      }
    } catch (error) {
      if (!isMounted.current) return;
      
      console.error("❌ Google Sign-In error:", error);
      
      // Don't show alert for aborted requests
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        console.log("Request was cancelled");
        return;
      }
      
      setGoogleError(error.response?.data?.message || error.message || "Google sign-in failed. Please try again.");
    } finally {
      if (isMounted.current) {
        setIsGoogleLoading(false);
      }
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      await login(form);
      
      if (isMounted.current) {
        navigate("/profile");
      }
    } catch (error) {
      if (!isMounted.current) return;
      
      // Don't show alert for aborted requests
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        console.log("Request was cancelled");
        return;
      }
      
      alert("Invalid login credentials");
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Fallback Google button
  const triggerManualGoogleSignIn = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      setGoogleError("Google Sign-In is not available. Please refresh the page.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black text-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-white/10 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
         
            <div>
              <img
              src="/logo.png"
              alt="Logo"
              className="w-24 h-12 sm:w-40 sm:h-40 drop-shadow-lg"
            />

            </div>
          </div>

          {/* Middle Content */}
          <div className="space-y-6 max-w-lg">
            <div className="space-y-2">
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-300 to-yellow-400" />
              <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
                Secure Access to<br />Verified Properties
              </h2>
            </div>
            <p className="text-white/70 text-lg leading-relaxed">
              Sign in to access 100% legally verified properties, complete title 
              documentation, and connect with trusted legal advisors and property experts.
            </p>

            {/* Trust Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-yellow-300">100%</div>
                <div className="text-xs text-white/70">Legal Verification</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold text-green-400">500+</div>
                <div className="text-xs text-white/70">Verified Properties</div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="text-white/50 text-sm">
            <p>Your Security is Our Priority</p>
            <p className="text-white/30">Bengaluru, Karnataka</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <Shield className="w-10 h-10 text-yellow-300" />
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-blue-400">CLEAR</span>
                <span className="text-yellow-300">TITLE 1</span>
              </h1>
              <p className="text-xs text-white/60 text-center">100% Legal Verification</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-yellow-300" />
              <h2 className="text-3xl lg:text-4xl font-bold">Welcome Back</h2>
            </div>
            <p className="text-white/60">Sign in to your legal property account</p>
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 border-2 border-blue-500">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-yellow-300" />
              <div>
                <h4 className="font-bold text-white text-sm">Secure Login</h4>
                <p className="text-blue-100 text-xs">Your session is protected with 256-bit encryption</p>
              </div>
            </div>
          </div>

          {/* Google Sign-In Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Quick Sign-In</h3>
              <p className="text-white/60 text-sm mb-4">Use your Google account for instant access</p>
            </div>
            
            {/* Google Sign-In Button Container */}
            <div className="w-full flex justify-center">
              <div 
                ref={googleButtonRef}
                className="w-full flex justify-center [&>div]:w-full [&>div]:flex [&>div]:justify-center"
              ></div>
            </div>
            
            {/* Manual Google Sign-In Button (fallback) */}
            {!GOOGLE_CLIENT_ID && (
              <div className="text-center">
                <p className="text-yellow-300 text-sm mb-2">Google Sign-In not configured</p>
              </div>
            )}
            
            {isGoogleLoading && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-sm text-white/70">
                  <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></div>
                  Signing in with Google...
                </div>
              </div>
            )}
            
            {googleError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-300 text-sm font-semibold">Google Sign-In Error</p>
                    <p className="text-red-300/80 text-sm mt-1">{googleError}</p>
                    <button
                      onClick={triggerManualGoogleSignIn}
                      className="mt-2 text-red-200 hover:text-white text-sm underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gradient-to-br from-blue-900 via-blue-800 to-black px-4 text-white/50">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username Field */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 tracking-wide font-medium">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  name="emailOrUsername"
                  placeholder="Enter your email or username"
                  onChange={handleChange}
                  value={form.emailOrUsername}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-white/70 tracking-wide font-medium">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-yellow-300 text-sm hover:text-yellow-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  value={form.password}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2 border-yellow-400"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Securing Access...
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In with Email
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gradient-to-br from-blue-900 via-blue-800 to-black px-4 text-white/50">
                  New to CLEAR TITLE 1?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full border-2 border-white/20 text-white py-4 rounded-xl hover:bg-white/5 transition-all duration-300 font-bold backdrop-blur-sm"
              disabled={isLoading || isGoogleLoading}
            >
              Create Legal Account
            </button>
          </form>

          {/* Terms and Privacy */}
          <div className="text-center text-xs text-white/50">
            <p>
              By signing in, you agree to our{" "}
              <button 
                onClick={() => navigate("/terms")} 
                className="text-yellow-300 hover:text-yellow-400 transition-colors"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button 
                onClick={() => navigate("/privacy")} 
                className="text-yellow-300 hover:text-yellow-400 transition-colors"
              >
                Privacy Policy
              </button>
            </p>
          </div>

          {/* Security Footer */}
          <div className="text-center pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-xs text-white/50">
              <Shield className="w-3 h-3" />
              <span>256-bit SSL encryption • Legal compliance certified</span>
            </div>
          </div>

          {/* Quick Support */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="text-yellow-300 text-sm hover:text-yellow-400 transition-colors underline"
            >
              Need help accessing your account?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}