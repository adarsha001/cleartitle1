// components/EditProfileForm.jsx
import { useState, useEffect } from 'react';
import API from '../api/axios.js';
import { 
  Save, X, User, Phone, Mail, Building2, Cake, PhoneCall,
  Briefcase, MapPin, Globe, Info, Bell, CheckCircle, AlertCircle,
  Facebook, Twitter, Linkedin, Instagram, GlobeIcon, Camera, Lock, Eye, EyeOff
} from 'lucide-react';

export default function EditProfileForm({ userData, onSave, onCancel }) {
  const [editFormData, setEditFormData] = useState({
    name: userData?.name || '',
    lastName: userData?.lastName || '',
    phoneNumber: userData?.phoneNumber || '',
    alternativePhoneNumber: userData?.alternativePhoneNumber || '',
    gmail: userData?.gmail || '',
    userType: userData?.userType || 'buyer',
    company: userData?.company || '',
    languages: userData?.languages?.join(', ') || '',
    dateOfBirth: userData?.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
    gender: userData?.gender || '',
    occupation: userData?.occupation || '',
    preferredLocation: userData?.preferredLocation || '',
    about: userData?.about || '',
    interests: userData?.interests?.join(', ') || '',
    website: userData?.website || '',
    specialization: userData?.specialization?.join(', ') || '',
    contactPreferences: userData?.contactPreferences || {
      phone: true,
      email: true,
      whatsapp: true,
      sms: false
    },
    socialMedia: userData?.socialMedia || {
      facebook: '', twitter: '', linkedin: '', instagram: ''
    },
    officeAddress: userData?.officeAddress || {
      street: '', city: '', state: '', pincode: ''
    },
    notifications: userData?.notifications || {
      emailNotifications: true,
      propertyAlerts: true,
      priceDropAlerts: true,
      newPropertyAlerts: true
    }
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || '');
  const [avatarLoading, setAvatarLoading] = useState(false);

  const userTypes = [
    { value: "buyer", label: "Property Buyer" },
    { value: "seller", label: "Property Seller" },
    { value: "builder", label: "Builder" },
    { value: "developer", label: "Developer" },
    { value: "agent", label: "Real Estate Agent" },
    { value: "investor", label: "Investor" },
    { value: "other", label: "Other" }
  ];

  const genderOptions = [
    { value: "", label: "Select Gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer-not-to-say", label: "Prefer not to say" }
  ];

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'contactPreferences' || parent === 'notifications') {
        setEditFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value }
        }));
      } else if (parent === 'socialMedia') {
        setEditFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: value }
        }));
      } else if (parent === 'officeAddress') {
        setEditFormData(prev => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: value }
        }));
      }
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    setEditError('');
    setEditSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setEditError('');
    setEditSuccess('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const response = await API.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setAvatarPreview(response.data.avatarUrl);
        setAvatarFile(null);
        return response.data.avatarUrl;
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');

    // Validate phone number for Google auth users
    if (userData?.isGoogleAuth && editFormData.phoneNumber === '1234567890') {
      setEditError('Please update your phone number from the default value');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = editFormData.phoneNumber.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setEditError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    if (editFormData.alternativePhoneNumber) {
      const cleanAltPhone = editFormData.alternativePhoneNumber.replace(/\D/g, '');
      if (!phoneRegex.test(cleanAltPhone)) {
        setEditError('Please enter a valid 10-digit Indian phone number for alternative phone');
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.gmail)) {
      setEditError('Please enter a valid email address');
      return;
    }

    // Validate password fields if user wants to change password
    if (showPasswordFields) {
      // For Google Auth users, current password is optional
      if (!userData?.isGoogleAuth && !passwordData.currentPassword) {
        setEditError('Please enter your current password');
        return;
      }
      if (!passwordData.newPassword) {
        setEditError('Please enter a new password');
        return;
      }
      if (!passwordData.confirmNewPassword) {
        setEditError('Please confirm your new password');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        setEditError('New password and confirm password do not match');
        return;
      }
      if (passwordData.newPassword.length < 6) {
        setEditError('New password must be at least 6 characters long');
        return;
      }
      
      // Only check for password difference for non-Google users
      if (!userData?.isGoogleAuth && passwordData.newPassword === passwordData.currentPassword) {
        setEditError('New password must be different from current password');
        return;
      }
    }

    try {
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const updateData = {
        ...editFormData,
        languages: editFormData.languages.split(',').map(lang => lang.trim()).filter(lang => lang),
        interests: editFormData.interests.split(',').map(interest => interest.trim()).filter(interest => interest),
        specialization: editFormData.specialization.split(',').map(spec => spec.trim()).filter(spec => spec),
        phoneNumber: cleanPhone,
        alternativePhoneNumber: editFormData.alternativePhoneNumber?.replace(/\D/g, '') || '',
        ...(avatarUrl && { avatar: avatarUrl })
      };

      // Add password data if user wants to change password
      if (showPasswordFields) {
        updateData.currentPassword = passwordData.currentPassword;
        updateData.newPassword = passwordData.newPassword;
        updateData.confirmNewPassword = passwordData.confirmNewPassword;
      }

      await onSave(updateData);
      setEditSuccess(showPasswordFields ? 
        (userData?.isGoogleAuth ? 'Password set successfully!' : 'Profile and password updated successfully!') : 
        'Profile updated successfully!'
      );
      
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (error) {
      setEditError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
      
      {editError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{editError}</p>
          </div>
        </div>
      )}
      
      {editSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-green-700 text-sm">{editSuccess}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Avatar Upload */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-900" />
            Profile Picture
          </h3>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {editFormData.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              {avatarLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors inline-block">
                Change Photo
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-xs text-gray-500 mt-2">Recommended: Square image, max 5MB</p>
            </div>
          </div>
        </div>

        {/* Section 2: Basic Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-900" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="name" 
                  value={editFormData.name} 
                  onChange={handleEditChange}
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-900" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="lastName" 
                  value={editFormData.lastName} 
                  onChange={handleEditChange}
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-900" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="gmail" 
                  type="email" 
                  value={editFormData.gmail} 
                  onChange={handleEditChange}
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-900" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="phoneNumber" 
                  value={editFormData.phoneNumber} 
                  onChange={handleEditChange}
                  className={`w-full border-2 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-900 ${
                    userData?.isGoogleAuth && editFormData.phoneNumber === '1234567890' 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200'
                  }`}
                  required 
                />
              </div>
              {userData?.isGoogleAuth && editFormData.phoneNumber === '1234567890' && (
                <p className="text-xs text-red-500 mt-1">
                  Please update your phone number from the default value
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Alternative Phone Number</label>
              <div className="relative">
                <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="alternativePhoneNumber" 
                  value={editFormData.alternativePhoneNumber} 
                  onChange={handleEditChange}
                  placeholder="Optional"
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-900" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date of Birth</label>
              <div className="relative">
                <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="dateOfBirth" 
                  type="date" 
                  value={editFormData.dateOfBirth} 
                  onChange={handleEditChange}
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-900" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select 
                name="gender" 
                value={editFormData.gender} 
                onChange={handleEditChange}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900"
              >
                {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">User Type *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select 
                  name="userType" 
                  value={editFormData.userType} 
                  onChange={handleEditChange}
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-900 appearance-none"
                >
                  {userTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-900" />
            {userData?.isGoogleAuth ? 'Set Password' : 'Change Password'}
          </h3>
          
          {!showPasswordFields ? (
            <button
              type="button"
              onClick={() => setShowPasswordFields(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {userData?.isGoogleAuth ? 'Set a password for email login' : 'Change Password'}
            </button>
          ) : (
            <div className="space-y-4">
              {/* For Google Auth users, no current password field */}
              {!userData?.isGoogleAuth && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-blue-900"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-blue-900"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-blue-900"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              {userData?.isGoogleAuth && (
                <p className="text-xs text-blue-600 mt-2">
                  Setting a password allows you to login with email and password in addition to Google.
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowPasswordFields(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Section 3: Professional Information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-900" />
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Occupation</label>
              <input 
                name="occupation" 
                value={editFormData.occupation} 
                onChange={handleEditChange}
                placeholder="Your profession"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Company</label>
              <input 
                name="company" 
                value={editFormData.company} 
                onChange={handleEditChange}
                placeholder="Company name"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Preferred Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="preferredLocation" 
                  value={editFormData.preferredLocation} 
                  onChange={handleEditChange}
                  placeholder="City, State"
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-900" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Website</label>
              <div className="relative">
                <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="website" 
                  value={editFormData.website} 
                  onChange={handleEditChange}
                  placeholder="https://example.com"
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-900" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Languages Spoken</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="languages" 
                  value={editFormData.languages} 
                  onChange={handleEditChange}
                  placeholder="English, Hindi, Kannada"
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-900" 
                />
              </div>
              <p className="text-xs text-gray-500">Separate with commas</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Specialization</label>
              <input 
                name="specialization" 
                value={editFormData.specialization} 
                onChange={handleEditChange}
                placeholder="Residential, Commercial, Luxury"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
              />
              <p className="text-xs text-gray-500">Separate with commas</p>
            </div>
          </div>
        </div>

        {/* Section 4: Office Address */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-900" />
            Office Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <input 
                name="officeAddress.street" 
                value={editFormData.officeAddress.street} 
                onChange={handleEditChange}
                placeholder="Street Address"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
              />
            </div>
            <input 
              name="officeAddress.city" 
              value={editFormData.officeAddress.city} 
              onChange={handleEditChange}
              placeholder="City"
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
            />
            <input 
              name="officeAddress.state" 
              value={editFormData.officeAddress.state} 
              onChange={handleEditChange}
              placeholder="State"
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
            />
            <input 
              name="officeAddress.pincode" 
              value={editFormData.officeAddress.pincode} 
              onChange={handleEditChange}
              placeholder="Pincode"
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
            />
          </div>
        </div>

        {/* Section 5: Social Media */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <GlobeIcon className="w-5 h-5 text-blue-900" />
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Facebook className="w-5 h-5 text-blue-600" />
              <input 
                name="socialMedia.facebook" 
                value={editFormData.socialMedia.facebook} 
                onChange={handleEditChange}
                placeholder="Facebook Profile URL"
                className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
              />
            </div>
            <div className="flex items-center gap-3">
              <Twitter className="w-5 h-5 text-blue-400" />
              <input 
                name="socialMedia.twitter" 
                value={editFormData.socialMedia.twitter} 
                onChange={handleEditChange}
                placeholder="Twitter Profile URL"
                className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
              />
            </div>
            <div className="flex items-center gap-3">
              <Linkedin className="w-5 h-5 text-blue-700" />
              <input 
                name="socialMedia.linkedin" 
                value={editFormData.socialMedia.linkedin} 
                onChange={handleEditChange}
                placeholder="LinkedIn Profile URL"
                className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
              />
            </div>
            <div className="flex items-center gap-3">
              <Instagram className="w-5 h-5 text-pink-600" />
              <input 
                name="socialMedia.instagram" 
                value={editFormData.socialMedia.instagram} 
                onChange={handleEditChange}
                placeholder="Instagram Profile URL"
                className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
              />
            </div>
          </div>
        </div>

        {/* Section 6: About & Interests */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-900" />
            About You
          </h3>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Bio / About</label>
              <textarea 
                name="about" 
                value={editFormData.about} 
                onChange={handleEditChange}
                placeholder="Tell us about yourself, your experience, or your company..."
                rows="4"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900 resize-none" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Interests & Hobbies</label>
              <input 
                name="interests" 
                value={editFormData.interests} 
                onChange={handleEditChange}
                placeholder="Real estate, Travel, Photography"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-900" 
              />
              <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>
          </div>
        </div>

        {/* Section 7: Contact Preferences */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-900" />
            Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Contact Preferences</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="contactPreferences.phone" checked={editFormData.contactPreferences.phone} onChange={handleEditChange} className="w-4 h-4 text-blue-900" />
                  <span>Phone Calls</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="contactPreferences.email" checked={editFormData.contactPreferences.email} onChange={handleEditChange} className="w-4 h-4 text-blue-900" />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="contactPreferences.whatsapp" checked={editFormData.contactPreferences.whatsapp} onChange={handleEditChange} className="w-4 h-4 text-blue-900" />
                  <span>WhatsApp</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="contactPreferences.sms" checked={editFormData.contactPreferences.sms} onChange={handleEditChange} className="w-4 h-4 text-blue-900" />
                  <span>SMS</span>
                </label>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Notification Preferences</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="notifications.emailNotifications" checked={editFormData.notifications.emailNotifications} onChange={handleEditChange} className="w-4 h-4 text-blue-900" />
                  <span>Email Notifications</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="notifications.propertyAlerts" checked={editFormData.notifications.propertyAlerts} onChange={handleEditChange} className="w-4 h-4 text-blue-900" />
                  <span>Property Alerts</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="notifications.priceDropAlerts" checked={editFormData.notifications.priceDropAlerts} onChange={handleEditChange} className="w-4 h-4 text-blue-900" />
                  <span>Price Drop Alerts</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="notifications.newPropertyAlerts" checked={editFormData.notifications.newPropertyAlerts} onChange={handleEditChange} className="w-4 h-4 text-blue-900" />
                  <span>New Property Alerts</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Google Auth Warning */}
        {userData?.isGoogleAuth && editFormData.phoneNumber === '1234567890' && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-red-800">Phone Number Required</h4>
                <p className="text-red-700 text-sm mt-1">
                  Please update your phone number for better security and communication.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button 
            type="submit" 
            disabled={avatarLoading}
            className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {avatarLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}