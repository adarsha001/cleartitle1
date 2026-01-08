/* ---- RESPONSIVE VERSION WITH PLACEHOLDERS + UI FIX + BIG LOGO ---- */

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

  const googleButtonRef = useRef(null);
  const isMounted = useRef(true);

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    return () => (isMounted.current = false);
  }, []);

  /* ---------------- GOOGLE LOGIN SDK ---------------- */
  useEffect(() => {
    let googleScript = null;
    let isInitialized = false;

    const initializeGoogleSignIn = () => {
      if (window.google && GOOGLE_CLIENT_ID && !isInitialized) {
        isInitialized = true;

        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            ux_mode: "popup",
            auto_select: false,
          });

          if (googleButtonRef.current && !googleButtonRef.current.hasChildNodes()) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              theme: "outline",
              size: "large",
              width: "100%"
            });

            setTimeout(() => {
              try {
                window.google.accounts.id.prompt();
              } catch {}
            }, 1000);
          }
        } catch (err) {
          setGoogleError("Unable to load Google Sign-In");
        }
      }
    };

    const loadGoogleSDK = () => {
      if (!window.google) {
        googleScript = document.createElement("script");
        googleScript.src = "https://accounts.google.com/gsi/client";
        googleScript.async = true;
        googleScript.onload = initializeGoogleSignIn;
        googleScript.onerror = () => setGoogleError("Google script failed to load");
        document.head.appendChild(googleScript);
      } else {
        initializeGoogleSignIn();
      }
    };

    if (GOOGLE_CLIENT_ID) loadGoogleSDK();
    else setGoogleError("Google Client ID Missing");

    return () => {
      isInitialized = false;
      if (googleButtonRef.current) googleButtonRef.current.innerHTML = "";

      if (window.google) {
        try {
          window.google.accounts.id.cancel();
        } catch {}
      }

      if (googleScript && document.head.contains(googleScript)) {
        document.head.removeChild(googleScript);
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleResponse = async (response) => {
    if (!isMounted.current) return;
    setIsGoogleLoading(true);

    try {
      await googleLogin(response.credential);
      navigate("/profile");
    } catch {
      setGoogleError("Google sign-in failed");
    } finally {
      if (isMounted.current) setIsGoogleLoading(false);
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
            <div ref={googleButtonRef} className="w-full flex justify-center" />

            {isGoogleLoading && (
              <p className="text-center text-white/60 text-sm">Signing in with Google…</p>
            )}

            {googleError && (
              <p className="text-center text-red-400 text-sm">{googleError}</p>
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
                  className="w-full pl-10 pr-4 bg-white/10 border border-white/20 rounded-xl py-3 text-white placeholder:text-white/40"
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
                  className="w-full pl-10 pr-12 bg-white/10 border border-white/20 rounded-xl py-3 text-white placeholder:text-white/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              className="group w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all"
              disabled={isLoading}
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

          {/* NEW USER (Original UI Style Restored) */}
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
