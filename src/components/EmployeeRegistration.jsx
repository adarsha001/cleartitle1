// frontend/src/pages/employee/EmployeeRegister.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Lock, Phone, UserCircle, ChevronRight, 
  Shield, CheckCircle, AlertCircle, LogIn, Camera, X
} from "lucide-react";
import { employeeAPI } from "../api/employeeAPI";

export default function EmployeeRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: ""
  });

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
    }
    
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: "" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Create FormData for file upload
    const data = new FormData();
    data.append("username", formData.username.trim());
    data.append("email", formData.email.trim());
    data.append("password", formData.password);
    data.append("phoneNumber", formData.phoneNumber.trim());
    
    if (profileImage) {
      data.append("userImage", profileImage);
    }

    // Debug logging
    console.log("=== Sending Registration Data ===");
    for (let pair of data.entries()) {
      if (pair[0] === 'userImage') {
        console.log(`${pair[0]}: ${pair[1].name} (${pair[1].size} bytes)`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }

    try {
      const response = await employeeAPI.register(data);
      console.log("Registration response:", response);
      
      if (response.success) {
        setSuccess("Registration successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/employee/dashboard";
        }, 2000);
      }
    } catch (err) {
      console.error("Registration error details:", {
        message: err.message,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status
      });
      
      // Display specific error message from backend
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black text-white flex flex-col lg:flex-row">
      {/* LEFT SIDE - Same as before */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        
        <div className="relative z-10 space-y-12 max-w-lg">
          <img src="/logo.png" className="w-96 h-auto drop-shadow-xl" alt="Logo" />

          <div className="space-y-4">
            <div className="w-16 h-1 bg-gradient-to-r from-yellow-300 to-yellow-400" />
            <h2 className="text-4xl font-bold leading-tight">
              Join Our Team<br />
              <span className="text-yellow-300">Employee Registration</span>
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-white/80 text-lg">
              Register as an employee to start tracking your daily work and manage your tasks efficiently.
            </p>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-4">What you get:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-white/70">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Personal dashboard</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Daily attendance tracking</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Performance insights</span>
                </li>
                <li className="flex items-center gap-3 text-white/70">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Profile with photo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-6">
            <img src="/logo.png" className="w-52 mx-auto drop-shadow-xl" alt="Logo" />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold">Create Account</h2>
            <p className="text-white/70 mt-2">Register as an employee</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-300 text-sm font-semibold">Registration Failed</p>
                  <p className="text-red-300/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border-2 border-green-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-green-300 text-sm font-semibold">Success!</p>
                  <p className="text-green-300/80 text-sm mt-1">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Image Upload */}
            <div className="space-y-2">
              <label className="text-sm text-white/70">Profile Picture (Optional)</label>
              <div className="flex flex-col items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                    <UserCircle className="w-16 h-16 text-white/40" />
                  </div>
                )}
                
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20">
                    <Camera className="w-4 h-4" />
                    <span className="text-sm">
                      {imagePreview ? "Change Photo" : "Upload Photo"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
                <p className="text-xs text-white/40">JPG, PNG or GIF (Max 5MB)</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Username *</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border-2 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-all ${
                    validationErrors.username ? 'border-red-500' : 'border-white/10'
                  }`}
                  required
                  disabled={isLoading}
                />
              </div>
              {validationErrors.username && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Email *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border-2 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-all ${
                    validationErrors.email ? 'border-red-500' : 'border-white/10'
                  }`}
                  required
                  disabled={isLoading}
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  name="phoneNumber"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border-2 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-all ${
                    validationErrors.phoneNumber ? 'border-red-500' : 'border-white/10'
                  }`}
                  required
                  disabled={isLoading}
                />
              </div>
              {validationErrors.phoneNumber && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70">Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border-2 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400 transition-all ${
                    validationErrors.password ? 'border-red-500' : 'border-white/10'
                  }`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <X className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
              )}
              <p className="text-xs text-white/40 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 mt-1 bg-white/5 border-2 border-white/20 rounded flex-shrink-0 focus:ring-2 focus:ring-yellow-400 checked:bg-yellow-400 checked:border-yellow-400"
                required
                disabled={isLoading}
              />
              <span className="text-sm text-white/60">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => navigate("/terms")}
                  className="text-yellow-300 hover:text-yellow-400 underline"
                >
                  Terms & Conditions
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Registering...
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Register Employee
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
              <span className="px-4 bg-black text-white/50 text-sm">Already have an account?</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/employee-login")}
            className="w-full border-2 border-white/20 text-white py-4 rounded-xl hover:bg-white/5 transition-all font-bold backdrop-blur-sm"
          >
            Sign In to Employee Portal
          </button>
        </div>
      </div>
    </div>
  );
}       