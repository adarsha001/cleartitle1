import React, { useState, useEffect } from 'react';
import { createEnquiry } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { trackClickPublic } from '../api/clickTracker';
import { 
  Phone, MessageCircle, Mail, Shield, Clock, Users,
  CheckCircle, Award, FileCheck, Home, Building,
  MapPin, Calendar, Zap, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const LegalConsultationForm = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    propertyType: '',
    location: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clickedItem, setClickedItem] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Statistics for display
  const statistics = {
    enquiriesToday: 24,
    avgResponseTime: '15 mins',
    successRate: '98%'
  };

  // Enhanced handleClick function
  const handleClick = async (itemType, itemValue, displayName = null, url = null) => {
    const itemKey = `${itemType}-${itemValue}`;
    setClickedItem(itemKey);
    
    // Track the click using enhanced public API
    await trackClickPublic({
      itemType,
      itemValue,
      displayName: displayName || `${itemType}: ${itemValue}`,
      propertyId: null
    });

    // If there's a URL, open it
    if (url) {
      if (url.startsWith('tel:') || url.startsWith('mailto:')) {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }

    // Reset animation after 1 second
    setTimeout(() => setClickedItem(null), 1000);
  };

  // Contact methods with tracking
  const contactMethods = [
    {
      type: 'phone',
      value: '+9190190 67239',
      displayName: 'Primary Phone',
      url: 'tel:+9190190 67239',
      icon: <Phone className="w-5 h-5" />,
      label: 'Call Now',
      description: 'Speak directly with our legal team',
      color: 'from-green-500 to-emerald-600'
    },
    {
      type: 'whatsapp',
      value: '+9190190 67239',
      displayName: 'WhatsApp',
      url: 'https://wa.me/9190190 67239',
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'WhatsApp',
      description: 'Instant chat with legal experts',
      color: 'from-green-400 to-teal-600'
    },
    {
      type: 'email',
      value: 'info@cleartitle1.com',
      displayName: 'Email',
      url: 'mailto:info@cleartitle1.com',
      icon: <Mail className="w-5 h-5" />,
      label: 'Email Us',
      description: 'Send detailed property documents',
      color: 'from-blue-500 to-indigo-600'
    }
  ];

  // Property types
  const propertyTypes = [
    'Apartment',
    'Villa',
    'Independent House',
    'Plot',
    'Commercial Space',
    'Farmland',
    'Other'
  ];

  // Auto-fill form when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phoneNumber: user.phoneNumber || prev.phoneNumber,
        email: user.email || prev.email
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const enquiryData = {
        ...formData,
        userId: isAuthenticated ? user.id : null,
        timestamp: new Date().toISOString()
      };

      const response = await createEnquiry(enquiryData);
      
      if (response.data.success) {
        setShowSuccess(true);
        toast.success('Enquiry submitted successfully!');
        
        // Reset form
        setFormData({
          name: '',
          phoneNumber: '',
          email: '',
          propertyType: '',
          location: '',
          message: ''
        });
        
        // Auto-reset success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      const errorMessage = error.response?.data?.message || 'Sorry, there was an error submitting your enquiry. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoFill = () => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phoneNumber: user.phoneNumber || prev.phoneNumber,
        email: user.email || prev.email
      }));
      toast.success('Details auto-filled from your profile!');
    }
  };

  // Success View Component
  if (showSuccess) {
    return (
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-xl border border-green-200 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Enquiry Submitted Successfully!</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Our legal team will contact you within 15 minutes. We'll provide complete legal verification for your property enquiry.
          </p>
          <div className="bg-white border border-green-200 rounded-xl p-6 mb-6 w-full max-w-md">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-700">15 mins</div>
                <div className="text-sm text-green-600">Avg. Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-700">98%</div>
                <div className="text-sm text-green-600">Success Rate</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold"
          >
            Submit Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <span className="text-blue-700 font-semibold">LEGAL CONSULTATION</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Get Expert Legal Advice on Property Verification
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Connect with our legal team for clear title verification, property registration, and complete legal compliance assurance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Contact & Stats */}
        <div className="space-y-6">
          {/* Quick Contact Cards */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Contact Us Directly
            </h3>
            <div className="space-y-3">
              {contactMethods.map((contact) => (
                <button
                  key={contact.type}
                  onClick={() => handleClick(contact.type, contact.value, contact.displayName, contact.url)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${contact.color.replace('from-', 'bg-gradient-to-r ')} text-white hover:shadow-lg ${
                    clickedItem === `${contact.type}-${contact.value}` ? 'scale-95' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {contact.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{contact.label}</div>
                      <div className="text-xs text-white/90">{contact.description}</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Today's Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                <div className="text-2xl font-bold text-blue-700">{statistics.enquiriesToday}</div>
                <div className="text-sm text-blue-600 mt-1">Enquiries</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                <div className="text-2xl font-bold text-green-700">{statistics.avgResponseTime}</div>
                <div className="text-sm text-green-600 mt-1">Avg Response</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                <div className="text-2xl font-bold text-purple-700">{statistics.successRate}</div>
                <div className="text-sm text-purple-600 mt-1">Success Rate</div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">Why Choose Us?</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">100% Legal Verification Guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-700">15-Minute Average Response Time</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-700">Expert Legal Team with 10+ Years Experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            {/* Form Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Legal Consultation Form</h3>
                <p className="text-gray-600 mt-1">Fill in your details and property enquiry</p>
              </div>
              {isAuthenticated && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">Welcome back!</div>
                  </div>
                  <button
                    onClick={handleAutoFill}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200 transition"
                  >
                    Auto-fill Details
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  Property Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type *
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select property type</option>
                      {propertyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location/City *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city or area"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Enquiry *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      required
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe your property enquiry, legal concerns, and any specific requirements..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Your Enquiry...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Submit Legal Consultation Request
                    </>
                  )}
                </button>
                <p className="text-center text-gray-500 text-sm mt-4">
                  By submitting, you agree to our terms and privacy policy. Our legal team will contact you shortly.
                </p>
              </div>
            </form>

            {/* Login Prompt */}
            {!isAuthenticated && (
              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <a 
                    href="/login" 
                    className="text-blue-600 hover:text-blue-800 font-semibold transition"
                  >
                    Log in
                  </a>{' '}
                  for faster consultation and to track your enquiries.
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-8">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 font-medium">100% Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700 font-medium">Quick Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-700 font-medium">Secure & Confidential</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700 font-medium">Expert Legal Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add CSS animations
const styles = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-in;
}
`;

// Add style tag to document head
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}

export default LegalConsultationForm;