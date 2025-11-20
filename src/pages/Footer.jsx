import React, { useState } from 'react';
import { trackClickPublic } from '../api/clickTracker'; // Import the enhanced tracker

export default function Footer() {
  const [clickedItem, setClickedItem] = useState(null);

  const handleClick = async (itemType, itemValue, displayName = null, url = null) => {
    const itemKey = `${itemType}-${itemValue}`;
    setClickedItem(itemKey);
    
    // Track the click using ENHANCED PUBLIC API (includes user data)
    await trackClickPublic({
      itemType,
      itemValue,
      displayName: displayName || `${itemType}: ${itemValue}`,
      propertyId: null // Add if you have property context
    });

    // If there's a URL, open it in a new tab
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    // Reset animation after 1 second
    setTimeout(() => setClickedItem(null), 1000);
  };

  // Social media links with their actual URLs
  const socialLinks = [
    {
      platform: 'instagram',
      url: 'https://www.instagram.com/cleartitle1/',
      label: 'Instagram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      platform: 'facebook',
      url: 'https://www.facebook.com/cleartitle1',
      label: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/company/cleartitle1',
      label: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    {
      platform: 'twitter',
      url: 'https://x.com/cleartitle1',
      label: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    },
    {
      platform: 'whatsapp',
      url: 'https://wa.me/917788999022',
      label: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-blue-900 to-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-light mb-2">
                <span className="text-blue-400">CLEAR</span>
                <span className="text-yellow-300">TITLE 1</span>
              </h3>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-yellow-300 mb-4"></div>
              <p className="text-gray-300 leading-relaxed max-w-md">
                Your trusted partner for 100% legally verified properties. We specialize in comprehensive 
                legal due diligence for all property types including flats, plots, farmlands, commercial 
                spaces, and joint developments across Karnataka.
              </p>
            </div>
            
            {/* Legal Assurance Badge */}
            <div className="inline-flex items-center bg-blue-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-blue-600 mb-6">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-white">100% Legal Verification Guarantee</span>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <button
                  key={social.platform}
                  onClick={() => handleClick(social.platform, social.url, `${social.label} social link`, social.url)}
                  className={`w-10 h-10 bg-blue-800/50 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 border border-blue-600/50 ${
                    clickedItem === `${social.platform}-${social.url}` ? 'scale-110 bg-yellow-300 text-black' : ''
                  }`}
                  aria-label={social.label}
                  title={social.label}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-lg font-semibold mb-6 relative">
              Property Types
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-yellow-300"></div>
            </h4>
            <div className="space-y-3">
              {[
                'Flats & Apartments',
                'Single Site Plots', 
                'Farm Lands',
                'Commercial Spaces',
                'Joint Developments',
                'Joint Ventures'
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => handleClick('property_type', type.toLowerCase().replace(/ /g, '_'), `Property Type: ${type}`)}
                  className={`flex items-center text-gray-300 hover:text-white transition-all duration-300 hover:pl-2 block w-full text-left group ${
                    clickedItem === `property_type-${type.toLowerCase().replace(/ /g, '_')}` ? 'pl-4 font-semibold text-yellow-300' : ''
                  }`}
                >
                  <svg className="w-3 h-3 text-blue-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 relative">
              Contact Us
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-yellow-300"></div>
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <button
                  onClick={() => handleClick('location', 'bengaluru_karnataka', 'Google Maps Location', 'https://www.google.com/maps/place/Bengaluru,+Karnataka')}
                  className={`text-gray-300 hover:text-white transition-all duration-300 text-left ${
                    clickedItem === 'location-bengaluru_karnataka' ? 'font-semibold scale-105 text-yellow-300' : ''
                  }`}
                >
                  Bengaluru, Karnataka, India
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-yellow-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <button
                  onClick={() => handleClick('phone', '+917788999022', 'Primary Phone', 'tel:+917788999022')}
                  className={`text-gray-300 hover:text-white transition-all duration-300 ${
                    clickedItem === 'phone-+917788999022' ? 'font-semibold scale-105 text-yellow-300' : ''
                  }`}
                >
                  +91 77889 99022
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-yellow-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <button
                  onClick={() => handleClick('email', 'info@cleartitle1.com', 'Email Address', 'mailto:info@cleartitle1.com')}
                  className={`text-gray-300 hover:text-white transition-all duration-300 ${
                    clickedItem === 'email-info@cleartitle1.com' ? 'font-semibold scale-105 text-yellow-300' : ''
                  }`}
                >
                  info@cleartitle1.com
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-yellow-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
                </svg>
                <button
                  onClick={() => handleClick('website', 'cleartitle1.com', 'Website', 'https://cleartitle1.com')}
                  className={`text-gray-300 hover:text-white transition-all duration-300 ${
                    clickedItem === 'website-cleartitle1.com' ? 'font-semibold scale-105 text-yellow-300' : ''
                  }`}
                >
                  www.cleartitle1.com
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="border-t border-blue-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h4 className="text-lg font-semibold mb-6 text-center text-yellow-300">Our Legal Assurance Services</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { 
                name: 'Title Verification', 
                desc: 'Comprehensive legal document checks',
                icon: '📋'
              },
              { 
                name: 'Encumbrance Check', 
                desc: 'No loans or legal disputes',
                icon: '🔍'
              },
              { 
                name: 'Regulatory Compliance', 
                desc: 'All government approvals verified',
                icon: '⚖️'
              }
            ].map((service) => (
              <button
                key={service.name}
                onClick={() => handleClick('legal_service', service.name.toLowerCase().replace(' ', '_'), `Legal Service: ${service.name}`)}
                className={`text-center p-4 bg-blue-800/30 hover:bg-blue-700/50 rounded-lg transition-all duration-300 border border-blue-600/30 backdrop-blur-sm ${
                  clickedItem === `legal_service-${service.name.toLowerCase().replace(' ', '_')}` ? 'bg-yellow-300 text-black scale-105' : ''
                }`}
              >
                <div className="text-2xl mb-2">{service.icon}</div>
                <h5 className="font-semibold mb-2">{service.name}</h5>
                <p className="text-sm text-gray-300">{service.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} <span className="text-blue-400">CLEAR</span>
              <span className="text-yellow-300">TITLE 1</span>. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              {['Privacy Policy', 'Terms of Service', 'Legal Disclaimer'].map((link) => (
                <button
                  key={link}
                  onClick={() => handleClick('legal', link.toLowerCase().replace(' ', '_'), `Legal: ${link}`)}
                  className={`text-gray-400 hover:text-yellow-300 transition-all duration-300 ${
                    clickedItem === `legal-${link.toLowerCase().replace(' ', '_')}` ? 'font-semibold text-yellow-300' : ''
                  }`}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}