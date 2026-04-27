// frontend/src/pages/employee/EmployeeProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";
import { employeeAPI } from "../api/employeeAPI";
import { User, Mail, Phone, Camera, Save, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function EmployeeProfile() {
  const navigate = useNavigate();
  const { employee, updateEmployee } = useEmployeeAuth();
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (employee) {
      setFormData({
        username: employee.username || "",
        phoneNumber: employee.phoneNumber || ""
      });
      setImagePreview(employee.userImage);
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: "error", text: "Please upload a valid image file" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image size should be less than 5MB" });
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const data = new FormData();
    data.append("username", formData.username);
    data.append("phoneNumber", formData.phoneNumber);
    if (profileImage) {
      data.append("userImage", profileImage);
    }

    try {
      const result = await updateEmployee(data);
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update profile" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-black py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <button onClick={() => navigate("/employee-dashboard")} className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6">Employee Profile</h1>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl ${message.type === "success" ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"}`}>
              <div className="flex items-center gap-3">
                {message.type === "success" ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
                <p className={message.type === "success" ? "text-green-300" : "text-red-300"}>{message.text}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img src={imagePreview || "/default-avatar.png"} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-yellow-400" />
                <label className="absolute bottom-0 right-0 bg-yellow-500 rounded-full p-2 cursor-pointer hover:bg-yellow-600 transition-colors">
                  <Camera className="w-4 h-4 text-black" />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <p className="text-white/40 text-xs mt-2">Click camera to change photo</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-400" required />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input type="email" value={employee?.email || ""} disabled className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-10 pr-4 py-3 text-white/50 cursor-not-allowed" />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-400" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-yellow-600 transition-all disabled:opacity-50">
              {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}