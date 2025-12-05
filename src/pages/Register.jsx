import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Building2, User, Mail, Lock, Phone, UserCircle, ChevronRight, Briefcase, Shield, CheckCircle, FileCheck, AlertCircle, LogIn } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const recaptchaRef = useRef();
  const googleButtonRef = useRef();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    lastName: "",
    userType: "buyer",
    phoneNumber: "",
    gmail: "",
    password: "",
  });

  const [captchaToken, setCaptchaToken] = useState("");

  // Get Google Client ID from Vite environment
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Load Google SDK
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && GOOGLE_CLIENT_ID) {
        console.log("Initializing Google Sign-In for registration page");
        
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signup",
          ux_mode: "popup"
        });

        // Render Google Sign-In button
        if (googleButtonRef.current) {
          try {
            window.google.accounts.id.renderButton(
              googleButtonRef.current,
              {
                theme: "outline",
                size: "large",
                width: "100%",
                text: "signup_with",
                shape: "rectangular",
                logo_alignment: "left",
                locale: "en"
              }
            );
          } catch (error) {
            console.error("Error rendering Google button:", error);
            setGoogleError("Unable to load Google Sign-In button");
          }
        }
      } else {
        console.error("Google Client ID not found or Google SDK not loaded");
        setGoogleError("Google Sign-In is not properly configured");
      }
    };

    // Load Google SDK script
    const loadGoogleSDK = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        script.onerror = (error) => {
          console.error("Failed to load Google Sign-In script:", error);
          setGoogleError("Failed to load Google Sign-In. Please check your internet connection.");
        };
        document.head.appendChild(script);
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

    return () => {
      // Cleanup
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleResponse = async (response) => {
    setIsGoogleLoading(true);
    setGoogleError("");
    console.log("Google Sign-In response received for registration");
    
    try {
      await googleLogin(response.credential);
      navigate("/profile");
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setGoogleError(error.response?.data?.message || error.message || "Google sign-up failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (captchaError) setCaptchaError("");
  };

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
    if (captchaError) setCaptchaError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate captcha
    if (!captchaToken) {
      setCaptchaError("Please complete the 'I'm not a robot' verification");
      return;
    }

    setIsLoading(true);
    try {
      await register({ ...formData, captchaToken });
      navigate("/profile");
    } catch (error) {
      // Reset captcha on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaToken("");
      }
      alert(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
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

  const userTypes = [
    { value: "buyer", label: "Property Buyer" },
    { value: "seller", label: "Property Seller" },
    { value: "builder", label: "Builder" },
    { value: "developer", label: "Developer" },
    { value: "agent", label: "Real Estate Agent" },
    { value: "investor", label: "Investor" },
    { value: "legal_advisor", label: "Legal Advisor" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black text-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-white/10 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <Shield className="w-12 h-12 text-yellow-300" />
            <div>
              <h1 className="text-3xl font-bold">
                <span className="text-blue-300">CLEAR</span>
                <span className="text-yellow-300">TITLE 1</span>
              </h1>
              <p className="text-white/60 text-sm">100% Legal Property Verification</p>
            </div>
          </div>

          {/* Middle Content */}
          <div className=" max-w-lg">
            <div className="space-y-2">
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-300 to-yellow-400" />
              <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
                Join India's Most<br />Trusted Legal<br />Property Platform
              </h2>
            </div>
            <p className="text-white/70 text-lg leading-relaxed">
              Create your account to access 100% legally verified properties, complete title 
              verification, and connect with trusted buyers, sellers, and legal experts.
            </p>

          
            {/* Trust Badges */}
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
            <p>Complete Legal Protection</p>
            <p className="text-white/30">Bengaluru, Karnataka</p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-xl space-y-8 py-8">
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
              <h2 className="text-3xl lg:text-4xl font-bold">Create Account</h2>
            </div>
            <p className="text-white/60">Join India's most trusted legal property platform</p>
          </div>

          {/* Google Sign-In Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Quick Registration</h3>
              <p className="text-white/60 text-sm mb-4">Sign up instantly with your Google account</p>
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
                  Creating account with Google...
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
                Or register with email
              </span>
            </div>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 tracking-wide font-medium">Username</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  name="username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Name Fields - Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70 tracking-wide font-medium">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="name"
                    placeholder="First name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70 tracking-wide font-medium">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* User Type */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 tracking-wide font-medium">I am a</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-12 py-3.5 text-white focus:outline-none focus:border-yellow-400 transition-colors appearance-none cursor-pointer backdrop-blur-sm"
                  disabled={isLoading}
                >
                  {userTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-blue-900">
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Phone & Email - Side by Side on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70 tracking-wide font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="phoneNumber"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70 tracking-wide font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    name="gmail"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.gmail}
                    onChange={handleChange}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 tracking-wide font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-white/40 mt-1">
                Must be at least 8 characters with special characters
              </p>
            </div>

            {/* Legal Terms & Conditions */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 mt-1 bg-white/5 border-2 border-white/20 rounded flex-shrink-0 focus:ring-2 focus:ring-yellow-400 checked:bg-yellow-400 checked:border-yellow-400"
                required
                disabled={isLoading}
              />
              <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => navigate("/terms")}
                  className="text-yellow-300 underline hover:text-yellow-400 transition-colors"
                >
                  Legal Terms & Conditions
                </button>
                {" "}and acknowledge that all properties are 100% legally verified
              </span>
            </label>

            {/* reCAPTCHA v2 */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-white/70 font-medium">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span>Security Verification *</span>
              </div>
              
              <div className="bg-white/5 border-2 border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LfNKx8sAAAAAN1BwpjlcY5iU5iS9JmNEaYHewXs"
                  onChange={onCaptchaChange}
                  onExpired={() => {
                    setCaptchaToken("");
                    setCaptchaError("Captcha expired. Please verify again.");
                  }}
                  theme="dark"
                  className="[&>div>div]:mx-auto"
                />
              </div>
              
              {captchaError && (
                <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                  <Shield className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-sm">{captchaError}</p>
                </div>
              )}
              
              <p className="text-xs text-white/40 italic">
                This security check helps prevent automated account creation and protects your information.
              </p>
            </div>

            {/* Legal Assurance Badge */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 border-2 border-blue-500">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-yellow-300" />
                <div>
                  <h4 className="font-bold text-white">Legal Verification Guarantee</h4>
                  <p className="text-blue-100 text-sm">All properties undergo comprehensive legal due diligence</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !captchaToken}
              className="group w-full bg-gradient-to-t from-yellow-400 to-yellow-500 text-black py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg border-2 border-yellow-400"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Creating Legal Account...
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Create Legal Account
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Already have account section */}
          <div className="text-center">
            <p className="text-white/60 text-sm mb-4">
              Already have a legal account?
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full border-2 border-white/20 text-white py-4 rounded-xl hover:bg-white/5 transition-all duration-300 font-bold backdrop-blur-sm"
              disabled={isLoading || isGoogleLoading}
            >
              Sign In to Legal Portal
            </button>
          </div>

          {/* Security Footer */}
          <div className="text-center pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-xs text-white/50">
              <Shield className="w-3 h-3" />
              <span>Your data is secured with 256-bit encryption</span>
            </div>
            <p className="text-xs text-white/30 mt-2">
              By registering, you agree to our Terms and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}