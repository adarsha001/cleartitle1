// components/ProfileHeader.jsx
import { 
  Edit, User, Lock, CheckCircle, Award, ArrowLeft, Briefcase, Shield,
  Mail, Phone, PhoneCall, Cake, Building2, MapPin, Globe, GlobeIcon,
  Facebook, Twitter, Linkedin, Instagram, Info, Bell, CheckCircle as CheckIcon,
  AlertCircle, Calendar, Map, Target, Camera, UserPlus, Gift
} from 'lucide-react';

export default function ProfileHeader({ userData, avatarPreview, isEditing, activeTab, onEditClick, onNavigateBack, showCompleteRegistration, onCompleteRegistration }) {
  return (
    <>
      <button
        onClick={() => onNavigateBack('/')}
        className="flex items-center gap-2 sm:gap-3 text-blue-600 hover:text-blue-800 transition-colors group mb-6"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold tracking-wide text-sm sm:text-base">
          Back to Properties
        </span>
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 border border-gray-200">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
            {/* Avatar Section */}
            <div className="relative mx-auto sm:mx-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt={userData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=blue&color=fff&size=150`;
                    }}
                  />
                ) : userData.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt={userData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=blue&color=fff&size=150`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-2xl sm:text-3xl font-bold">
                      {userData.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Name and Badges */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {userData.name} {userData.lastName}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">@{userData.username}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className="bg-blue-100 text-blue-900 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize">
                  {userData.userType}
                </span>
                {userData.isAdmin && (
                  <span className="bg-green-100 text-green-900 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    <Lock className="w-3 h-3 inline mr-1" />
                    Admin
                  </span>
                )}
                {userData.isGoogleAuth && (
                  <span className="bg-blue-100 text-blue-900 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Google
                  </span>
                )}
                {userData.isVerified && (
                  <span className="bg-green-100 text-green-900 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    <Award className="w-3 h-3 inline mr-1" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            {showCompleteRegistration && userData.userType === 'agent' && (
              <button
                onClick={onCompleteRegistration}
                className="bg-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm sm:text-base">Complete Registration</span>
              </button>
            )}
            {!isEditing && activeTab !== 'edit' && (
              <button
                onClick={onEditClick}
                className="bg-blue-900 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm sm:text-base">Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 pt-6 border-t border-gray-200">
          {/* Personal Information */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-5 border border-blue-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900" />
              <span className="text-sm sm:text-base">Personal Information</span>
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start sm:items-center text-gray-700">
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-blue-900 mt-0.5 sm:mt-0" />
                <div className="text-sm sm:text-base">
                  <span className="font-medium">Name:</span>
                  <span className="ml-1 sm:ml-2">{userData.name} {userData.lastName}</span>
                </div>
              </div>
              <div className="flex items-start sm:items-center text-gray-700">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-blue-900 mt-0.5 sm:mt-0" />
                <div className="text-sm sm:text-base truncate">
                  <span className="font-medium">Email:</span>
                  <span className="ml-1 sm:ml-2 truncate">{userData.gmail}</span>
                </div>
              </div>
              <div className="flex items-start sm:items-center text-gray-700">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-blue-900 mt-0.5 sm:mt-0" />
                <div className="text-sm sm:text-base">
                  <span className="font-medium">Phone:</span>
                  <span className="ml-1 sm:ml-2">{userData.phoneNumber}</span>
                  {userData.isGoogleAuth && userData.phoneNumber === '1234567890' && (
                    <span className="ml-1 sm:ml-2 text-xs text-red-500 bg-red-50 px-1 sm:px-2 py-0.5 sm:py-1 rounded">
                      Update Required
                    </span>
                  )}
                </div>
              </div>
              {userData.alternativePhoneNumber && (
                <div className="flex items-start sm:items-center text-gray-700">
                  <PhoneCall className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-blue-900 mt-0.5 sm:mt-0" />
                  <div className="text-sm sm:text-base">
                    <span className="font-medium">Alt Phone:</span>
                    <span className="ml-1 sm:ml-2">{userData.alternativePhoneNumber}</span>
                  </div>
                </div>
              )}
              {userData.dateOfBirth && (
                <div className="flex items-start sm:items-center text-gray-700">
                  <Cake className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-blue-900 mt-0.5 sm:mt-0" />
                  <div className="text-sm sm:text-base">
                    <span className="font-medium">Date of Birth:</span>
                    <span className="ml-1 sm:ml-2">{new Date(userData.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
              {userData.gender && (
                <div className="flex items-start sm:items-center text-gray-700">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-blue-900 mt-0.5 sm:mt-0" />
                  <div className="text-sm sm:text-base">
                    <span className="font-medium">Gender:</span>
                    <span className="ml-1 sm:ml-2 capitalize">{userData.gender}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-5 border border-green-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-green-900" />
              <span className="text-sm sm:text-base">Professional Information</span>
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start sm:items-center text-gray-700">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-green-900 mt-0.5 sm:mt-0" />
                <div className="text-sm sm:text-base">
                  <span className="font-medium">User Type:</span>
                  <span className="ml-1 sm:ml-2 capitalize">{userData.userType}</span>
                </div>
              </div>
              {userData.occupation && (
                <div className="flex items-start sm:items-center text-gray-700">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-green-900 mt-0.5 sm:mt-0" />
                  <div className="text-sm sm:text-base">
                    <span className="font-medium">Occupation:</span>
                    <span className="ml-1 sm:ml-2">{userData.occupation}</span>
                  </div>
                </div>
              )}
              {userData.company && (
                <div className="flex items-start sm:items-center text-gray-700">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-green-900 mt-0.5 sm:mt-0" />
                  <div className="text-sm sm:text-base">
                    <span className="font-medium">Company:</span>
                    <span className="ml-1 sm:ml-2">{userData.company}</span>
                  </div>
                </div>
              )}
              {userData.preferredLocation && (
                <div className="flex items-start sm:items-center text-gray-700">
                  <Map className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-green-900 mt-0.5 sm:mt-0" />
                  <div className="text-sm sm:text-base">
                    <span className="font-medium">Preferred Location:</span>
                    <span className="ml-1 sm:ml-2">{userData.preferredLocation}</span>
                  </div>
                </div>
              )}
              {userData.languages && userData.languages.length > 0 && (
                <div className="flex items-start sm:items-center text-gray-700">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-green-900 mt-0.5 sm:mt-0" />
                  <div className="text-sm sm:text-base">
                    <span className="font-medium">Languages:</span>
                    <span className="ml-1 sm:ml-2 line-clamp-1">{userData.languages.join(', ')}</span>
                  </div>
                </div>
              )}
              {userData.website && (
                <div className="flex items-start sm:items-center text-gray-700">
                  <GlobeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-green-900 mt-0.5 sm:mt-0" />
                  <div className="text-sm sm:text-base truncate">
                    <span className="font-medium">Website:</span>
                    <a href={userData.website} target="_blank" rel="noopener noreferrer" 
                       className="ml-1 sm:ml-2 text-blue-600 hover:underline truncate block">
                      {userData.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account & Stats */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-5 border border-purple-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-900" />
              <span className="text-sm sm:text-base">Account & Statistics</span>
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start sm:items-center text-gray-700">
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-purple-900 mt-0.5 sm:mt-0" />
                <div className="text-sm sm:text-base">
                  <span className="font-medium">Username:</span>
                  <span className="ml-1 sm:ml-2">@{userData.username}</span>
                </div>
              </div>
              <div className="flex items-start sm:items-center text-gray-700">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-purple-900 mt-0.5 sm:mt-0" />
                <div className="text-sm sm:text-base">
                  <span className="font-medium">Member Since:</span>
                  <span className="ml-1 sm:ml-2">{new Date(userData.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Office Address */}
          {(userData.officeAddress?.street || userData.officeAddress?.city) && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 sm:p-5 border border-orange-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-900" />
                <span className="text-sm sm:text-base">Office Address</span>
              </h3>
              <div className="space-y-1 sm:space-y-2">
                {userData.officeAddress.street && (
                  <div className="flex items-start text-gray-700">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-orange-900 mt-0.5" />
                    <span className="text-sm sm:text-base">{userData.officeAddress.street}</span>
                  </div>
                )}
                {(userData.officeAddress.city || userData.officeAddress.state) && (
                  <div className="flex items-center text-gray-700 ml-5 sm:ml-7">
                    <span className="text-sm sm:text-base">
                      {userData.officeAddress.city}
                      {userData.officeAddress.city && userData.officeAddress.state && ', '}
                      {userData.officeAddress.state}
                    </span>
                  </div>
                )}
                {userData.officeAddress.pincode && (
                  <div className="flex items-center text-gray-700 ml-5 sm:ml-7">
                    <span className="text-sm sm:text-base">Pincode: {userData.officeAddress.pincode}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media Links */}
          {(userData.socialMedia?.facebook || userData.socialMedia?.twitter || 
            userData.socialMedia?.linkedin || userData.socialMedia?.instagram) && (
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 sm:p-5 border border-pink-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <GlobeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-900" />
                <span className="text-sm sm:text-base">Social Media</span>
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {userData.socialMedia.facebook && (
                  <div className="flex items-center text-gray-700">
                    <Facebook className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                    <a href={userData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" 
                       className="text-sm sm:text-base text-blue-600 hover:underline truncate">
                      Facebook Profile
                    </a>
                  </div>
                )}
                {userData.socialMedia.twitter && (
                  <div className="flex items-center text-gray-700">
                    <Twitter className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-blue-400 flex-shrink-0" />
                    <a href={userData.socialMedia.twitter} target="_blank" rel="noopener noreferrer" 
                       className="text-sm sm:text-base text-blue-600 hover:underline truncate">
                      Twitter Profile
                    </a>
                  </div>
                )}
                {userData.socialMedia.linkedin && (
                  <div className="flex items-center text-gray-700">
                    <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-blue-700 flex-shrink-0" />
                    <a href={userData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" 
                       className="text-sm sm:text-base text-blue-600 hover:underline truncate">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {userData.socialMedia.instagram && (
                  <div className="flex items-center text-gray-700">
                    <Instagram className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-pink-600 flex-shrink-0" />
                    <a href={userData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" 
                       className="text-sm sm:text-base text-blue-600 hover:underline truncate">
                      Instagram Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* About & Interests Section */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 sm:p-5 border border-cyan-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-900" />
              <span className="text-sm sm:text-base">Additional Information</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {userData.about && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">About</h4>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {userData.about}
                  </p>
                </div>
              )}
              
              <div>
                {(userData.interests && userData.interests.length > 0) && (
                  <div className="mb-3 sm:mb-4">
                    <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Interests & Hobbies</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {userData.interests.map((interest, index) => (
                        <span key={index} className="bg-cyan-100 text-cyan-800 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {(userData.specialization && userData.specialization.length > 0) && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Specialization</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {userData.specialization.map((spec, index) => (
                        <span key={index} className="bg-purple-100 text-purple-800 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        {(userData.contactPreferences || userData.notifications) && (
          <div className="mt-6 sm:mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
              <span className="text-sm sm:text-base">Preferences</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Contact Preferences */}
              {userData.contactPreferences && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Contact Preferences</h4>
                  <div className="space-y-1 sm:space-y-2">
                    {userData.contactPreferences.phone && (
                      <div className="flex items-center text-gray-600">
                        <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" />
                        <span className="text-xs sm:text-sm">Phone Calls</span>
                      </div>
                    )}
                    {userData.contactPreferences.email && (
                      <div className="flex items-center text-gray-600">
                        <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" />
                        <span className="text-xs sm:text-sm">Email</span>
                      </div>
                    )}
                    {userData.contactPreferences.whatsapp && (
                      <div className="flex items-center text-gray-600">
                        <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" />
                        <span className="text-xs sm:text-sm">WhatsApp</span>
                      </div>
                    )}
                    {userData.contactPreferences.sms && (
                      <div className="flex items-center text-gray-600">
                        <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" />
                        <span className="text-xs sm:text-sm">SMS</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Notification Preferences */}
              {userData.notifications && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Notification Preferences</h4>
                  <div className="space-y-1 sm:space-y-2">
                    {userData.notifications.emailNotifications && (
                      <div className="flex items-center text-gray-600">
                        <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" />
                        <span className="text-xs sm:text-sm">Email Notifications</span>
                      </div>
                    )}
                    {userData.notifications.propertyAlerts && (
                      <div className="flex items-center text-gray-600">
                        <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" />
                        <span className="text-xs sm:text-sm">Property Alerts</span>
                      </div>
                    )}
                    {userData.notifications.priceDropAlerts && (
                      <div className="flex items-center text-gray-600">
                        <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" />
                        <span className="text-xs sm:text-sm">Price Drop Alerts</span>
                      </div>
                    )}
                    {userData.notifications.newPropertyAlerts && (
                      <div className="flex items-center text-gray-600">
                        <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-green-500" />
                        <span className="text-xs sm:text-sm">New Property Alerts</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google Auth Warning */}
        {userData.isGoogleAuth && userData.phoneNumber === '1234567890' && (
          <div className="mt-4 sm:mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-3 sm:p-4 border border-red-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-red-800 text-xs sm:text-sm">Phone Number Required</h4>
                <p className="text-red-700 text-xs sm:text-sm mt-1">
                  Please update your phone number for better security and communication.
                  <button
                    onClick={onEditClick}
                    className="ml-1 sm:ml-2 text-red-600 hover:text-red-800 font-medium underline text-xs sm:text-sm"
                  >
                    Update Now
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}