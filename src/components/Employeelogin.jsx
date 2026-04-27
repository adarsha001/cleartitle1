// frontend/src/pages/employee/EmployeeLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail, Lock, LogIn, ChevronRight, Shield, 
  Building2, AlertCircle, Eye, EyeOff
} from "lucide-react";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useEmployeeAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Debug: Check if login function exists
  useEffect(() => {
    console.log("EmployeeLogin mounted, login function exists:", typeof login === 'function');
  }, [login]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log("Already authenticated, redirecting to dashboard");
      navigate("/employee-dashboard");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Check if login function exists
    if (typeof login !== 'function') {
      console.error("login is not a function! Available methods:", { login });
      setError("Authentication service not available. Please refresh the page.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login for:", formData.email);
      const result = await login(formData);
      
      console.log("Login result:", result);
      
      if (result.success) {
        console.log("Login successful, waiting for redirect...");
        // The useEffect will handle redirect when isAuthenticated becomes true
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  // Show loading state while authenticating
  if (authLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black text-white flex flex-col lg:flex-row">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        
        <div className="relative z-10 space-y-12 max-w-lg">
          <img src="/logo.png" className="w-96 h-auto drop-shadow-xl" alt="Logo" />

          <div className="space-y-4">
            <div className="w-16 h-1 bg-gradient-to-r from-yellow-300 to-yellow-400" />
            <h2 className="text-4xl font-bold leading-tight">
              Employee Portal<br />
              <span className="text-yellow-300">Secure Access</span>
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-white/80 text-lg">
              Access your work dashboard, track daily activities, and manage your tasks efficiently.
            </p>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-4">Employee Features:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>Daily attendance tracking</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>Job completion reporting</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>Performance analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-6">
            <img src="/logo.png" className="w-52 mx-auto drop-shadow-xl" alt="Logo" />
          </div>

          <div className="text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <Building2 className="w-8 h-8 text-yellow-300" />
              <h2 className="text-3xl sm:text-4xl font-bold">Employee Login</h2>
            </div>
            <p className="text-white/70 mt-2">Sign in to your employee account</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-300 text-sm font-semibold">Login Failed</p>
                  <p className="text-red-300/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-white/70 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  name="email"
                  placeholder="Enter your registered email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In to Employee Portal
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-black text-white/50 text-sm">New to Employee Portal?</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/employee-register")}
            className="w-full border-2 border-white/20 text-white py-4 rounded-xl hover:bg-white/5 transition-all font-bold backdrop-blur-sm"
          >
            Create Employee Account
          </button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              ← Back to Main Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}