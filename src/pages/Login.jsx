import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Lock, Mail, ChevronRight, CheckCircle, FileCheck } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(form.emailOrUsername, form.password);
      navigate("/profile");
    } catch (error) {
      alert("Invalid login credentials");
    } finally {
      setIsLoading(false);
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-12 h-12 text-yellow-300" />
              <div>
                <h1 className="text-4xl font-bold">
                  <span className="text-blue-400">CLEAR</span>
                  <span className="text-yellow-300">TITLE 1</span>
                </h1>
                <p className="text-sm text-white/60 tracking-widest mt-1">100% LEGAL VERIFICATION</p>
              </div>
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

            {/* Legal Assurance Features */}
            <div className="space-y-4 pt-4">
              <p className="text-yellow-300 text-sm font-semibold tracking-wider">YOUR LEGAL ASSURANCE</p>
              {[
                "Access to 100% Verified Property Listings",
                "Complete Legal Documentation",
                "Direct Connect with Legal Advisors",
                "Real-time Title Status Updates",
                "Secure Investment Portfolio"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </div>
              ))}
            </div>

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
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-12 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm text-white/70 tracking-wide font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  value={form.password}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-12 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm"
                  required
                />
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
                  Access Legal Portal
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
            >
              Create Legal Account
            </button>
          </form>

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