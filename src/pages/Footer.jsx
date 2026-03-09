import React from 'react';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Shield, Award, CheckCircle, FileCheck ,Globe } from 'lucide-react';

export default function EnhancedFooter() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 text-white">
      {/* Animated Background Grid */}
      <div className="absolute inset-0  opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-4 sm:top-8 md:top-10 left-2 sm:left-4 md:left-6 w-32 h-32 sm:w-32 sm:h-32 md:w-32 md:h-32 bg-blue-400 rounded-full filter blur-3xl opacity-25 sm:opacity-30 animate-pulse"></div>
      <div className="absolute bottom-4 sm:bottom-8 md:bottom-10 right-2 sm:right-4 md:right-6 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-purple-400 rounded-full filter blur-3xl opacity-25 sm:opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Animated Clouds */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
    
        <svg className="absolute top-8 sm:top-10 md:top-12 w-40 sm:w-48 md:w-56 opacity-35 sm:opacity-40" 
             viewBox="0 0 250 80" 
             style={{ left: '-15%' }}>
          <defs>
            <filter id="cloud-blur-1">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
          </defs>
          <g filter="url(#cloud-blur-1)">
            <ellipse cx="60" cy="45" rx="45" ry="28" fill="white" className="opacity-60 sm:opacity-70"/>
            <ellipse cx="95" cy="38" rx="38" ry="25" fill="white" className="opacity-50 sm:opacity-60"/>
            <ellipse cx="125" cy="42" rx="35" ry="22" fill="white" className="opacity-55 sm:opacity-65"/>
            <ellipse cx="75" cy="52" rx="32" ry="20" fill="white" className="opacity-45 sm:opacity-55"/>
            <ellipse cx="105" cy="50" rx="40" ry="26" fill="white" className="opacity-50 sm:opacity-60"/>
            <ellipse cx="140" cy="48" rx="30" ry="18" fill="white" className="opacity-40 sm:opacity-50"/>
          </g>
          <animateTransform attributeName="transform" type="translate" from="0 0" to="2000 0" dur="50s" repeatCount="indefinite"/>
        </svg>

 
        <svg className="absolute top-20 sm:top-24 md:top-28 w-48 sm:w-56 md:w-64 opacity-30 sm:opacity-35" 
             viewBox="0 0 280 90" 
             style={{ right: '-20%' }}>
          <defs>
            <filter id="cloud-blur-2">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
          </defs>
          <g filter="url(#cloud-blur-2)">
            <ellipse cx="65" cy="50" rx="50" ry="30" fill="white" className="opacity-55 sm:opacity-65"/>
            <ellipse cx="105" cy="42" rx="42" ry="26" fill="white" className="opacity-60 sm:opacity-70"/>
            <ellipse cx="140" cy="48" rx="45" ry="28" fill="white" className="opacity-50 sm:opacity-60"/>
            <ellipse cx="80" cy="58" rx="38" ry="24" fill="white" className="opacity-45 sm:opacity-55"/>
            <ellipse cx="115" cy="55" rx="36" ry="22" fill="white" className="opacity-50 sm:opacity-60"/>
            <ellipse cx="150" cy="52" rx="32" ry="20" fill="white" className="opacity-40 sm:opacity-50"/>
            <ellipse cx="95" cy="48" rx="28" ry="18" fill="white" className="opacity-45 sm:opacity-55"/>
          </g>
          <animateTransform attributeName="transform" type="translate" from="0 0" to="-2200 0" dur="60s" repeatCount="indefinite"/>
        </svg>

 
        <svg className="absolute top-36 sm:top-40 md:top-44 w-44 sm:w-52 md:w-60 opacity-32 sm:opacity-38" 
             viewBox="0 0 260 85" 
             style={{ left: '-18%' }}>
          <defs>
            <filter id="cloud-blur-3">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" />
            </filter>
          </defs>
          <g filter="url(#cloud-blur-3)">
            <ellipse cx="70" cy="48" rx="48" ry="30" fill="white" className="opacity-58 sm:opacity-68"/>
            <ellipse cx="110" cy="40" rx="40" ry="24" fill="white" className="opacity-52 sm:opacity-62"/>
            <ellipse cx="140" cy="45" rx="38" ry="26" fill="white" className="opacity-48 sm:opacity-58"/>
            <ellipse cx="85" cy="55" rx="35" ry="22" fill="white" className="opacity-50 sm:opacity-60"/>
            <ellipse cx="120" cy="52" rx="42" ry="28" fill="white" className="opacity-55 sm:opacity-65"/>
            <ellipse cx="155" cy="50" rx="28" ry="18" fill="white" className="opacity-42 sm:opacity-52"/>
          </g>
          <animateTransform attributeName="transform" type="translate" from="0 0" to="2100 0" dur="70s" repeatCount="indefinite"/>
        </svg>
      </div> */}

      {/* Flying Birds */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
 
        <svg className="absolute top-12 sm:top-16 md:top-20 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" 
             viewBox="0 0 24 24" fill="none" style={{ left: '-5%' }}>
          <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
                stroke="white" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                className="opacity-60 sm:opacity-65 md:opacity-70">
            <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.5s" repeatCount="indefinite"/>
          </path>
          <animateTransform attributeName="transform" type="translate" from="0 0" to="1800 -30" dur="40s" repeatCount="indefinite"/>
        </svg>


        <svg className="absolute top-28 sm:top-32 md:top-36 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" 
             viewBox="0 0 24 24" fill="none" style={{ right: '-5%' }}>
          <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
                stroke="white" 
                strokeWidth="1.1" 
                strokeLinecap="round" 
                className="opacity-55 sm:opacity-58 md:opacity-60">
            <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.4s" repeatCount="indefinite"/>
          </path>
          <animateTransform attributeName="transform" type="translate" from="0 0" to="-1900 -20" dur="45s" repeatCount="indefinite"/>
        </svg>

 
        <svg className="absolute top-16 sm:top-20 md:top-24 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" 
             viewBox="0 0 24 24" fill="none" style={{ left: '-5%' }}>
          <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
                stroke="white" 
                strokeWidth="1.1" 
                strokeLinecap="round" 
                className="opacity-45 sm:opacity-48 md:opacity-50">
            <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.45s" repeatCount="indefinite"/>
          </path>
          <animateTransform attributeName="transform" type="translate" from="0 0" to="2000 -40" dur="52s" repeatCount="indefinite"/>
        </svg>


        <svg className="absolute top-24 sm:top-28 md:top-32 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" 
             viewBox="0 0 24 24" fill="none" style={{ right: '-5%' }}>
          <path d="M2 12 Q8 8 12 12 Q16 8 22 12" 
                stroke="white" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                className="opacity-60 sm:opacity-62 md:opacity-65">
            <animate attributeName="d" values="M2 12 Q8 8 12 12 Q16 8 22 12;M2 12 Q8 16 12 12 Q16 16 22 12;M2 12 Q8 8 12 12 Q16 8 22 12" dur="0.42s" repeatCount="indefinite"/>
          </path>
          <animateTransform attributeName="transform" type="translate" from="0 0" to="-1850 -25" dur="42s" repeatCount="indefinite"/>
        </svg>
      </div> */}

      {/* City Skyline Silhouette */}
      <div className="absolute bottom-0 left-0 right-0 w-full opacity-15">
        <svg viewBox="0 0 600 200" className="w-full h-auto" preserveAspectRatio="xMidYMid slice">
          {/* Trees on left */}
          <circle cx="15" cy="180" r="12" fill="rgba(255,255,255,0.8)"/>
          <rect x="12" y="180" width="6" height="20" fill="rgba(255,255,255,0.8)"/>
          
          <circle cx="35" cy="175" r="10" fill="rgba(255,255,255,0.8)"/>
          <rect x="32" y="175" width="6" height="25" fill="rgba(255,255,255,0.8)"/>
          
          {/* Building 1 */}
          <rect x="50" y="120" width="40" height="80" fill="rgba(255,255,255,0.9)"/>
          <g>
            {[...Array(8)].map((_, i) => (
              <g key={`b1-${i}`}>
                <rect x="55" y={125 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="63" y={125 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="71" y={125 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="79" y={125 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
              </g>
            ))}
          </g>
          
          {/* Building 2 */}
          <path d="M 95 90 Q 115 85 135 90 L 135 200 L 95 200 Z" fill="rgba(255,255,255,0.9)"/>
          <g>
            {[...Array(11)].map((_, i) => (
              <g key={`b2-${i}`}>
                <rect x="100" y={95 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="110" y={95 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="120" y={95 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
              </g>
            ))}
          </g>
          
          {/* Building 3 - Tall antenna tower */}
          <rect x="145" y="60" width="15" height="140" fill="rgba(255,255,255,0.9)"/>
          <rect x="150" y="40" width="5" height="25" fill="rgba(255,255,255,0.9)"/>
          <circle cx="152.5" cy="38" r="3" fill="rgba(255,255,255,0.9)"/>
          <g>
            {[...Array(14)].map((_, i) => (
              <rect key={`b3-${i}`} x="148" y={65 + i * 10} width="9" height="6" fill="rgba(100,150,200,0.6)"/>
            ))}
          </g>
          
          {/* Building 4 */}
          <rect x="165" y="110" width="30" height="90" fill="rgba(255,255,255,0.9)"/>
          <g>
            {[...Array(9)].map((_, i) => (
              <g key={`b4-${i}`}>
                <rect x="169" y={115 + i * 10} width="4" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="176" y={115 + i * 10} width="4" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="183" y={115 + i * 10} width="4" height="6" fill="rgba(100,150,200,0.6)"/>
              </g>
            ))}
          </g>
          
          {/* Building 5 - Tallest center */}
          <rect x="200" y="20" width="50" height="180" fill="rgba(255,255,255,0.95)"/>
          <g>
            {[...Array(18)].map((_, i) => (
              <g key={`b5-${i}`}>
                <rect x="205" y={25 + i * 10} width="6" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="214" y={25 + i * 10} width="6" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="223" y={25 + i * 10} width="6" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="232" y={25 + i * 10} width="6" height="6" fill="rgba(100,150,200,0.6)"/>
              </g>
            ))}
          </g>
          
          {/* Building 6 */}
          <path d="M 255 50 L 295 70 L 295 200 L 255 200 Z" fill="rgba(255,255,255,0.9)"/>
          <g>
            {[...Array(13)].map((_, i) => (
              <g key={`b6-${i}`}>
                <rect x="260" y={75 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="268" y={75 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="276" y={75 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
              </g>
            ))}
          </g>
          
          {/* Building 7 */}
          <rect x="300" y="130" width="35" height="70" fill="rgba(255,255,255,0.9)"/>
          <g>
            {[...Array(14)].map((_, i) => (
              <rect key={`b7-${i}`} x="303" y={133 + i * 5} width="29" height="2" fill="rgba(100,150,200,0.5)"/>
            ))}
          </g>
          
          {/* Building 8 */}
          <rect x="340" y="80" width="40" height="120" fill="rgba(255,255,255,0.9)"/>
          <rect x="345" y="65" width="30" height="15" fill="rgba(255,255,255,0.9)"/>
          <rect x="350" y="55" width="20" height="10" fill="rgba(255,255,255,0.9)"/>
          <g>
            {[...Array(12)].map((_, i) => (
              <g key={`b8-${i}`}>
                <rect x="345" y={85 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="353" y={85 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="361" y={85 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="369" y={85 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
              </g>
            ))}
          </g>
          
          {/* Building 9 */}
          <rect x="385" y="40" width="45" height="160" fill="rgba(255,255,255,0.95)"/>
          <g>
            {[...Array(16)].map((_, i) => (
              <g key={`b9-${i}`}>
                <rect x="390" y={45 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="398" y={45 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="406" y={45 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="414" y={45 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
                <rect x="422" y={45 + i * 10} width="5" height="6" fill="rgba(100,150,200,0.6)"/>
              </g>
            ))}
          </g>
          
          {/* Building 10 */}
          <path d="M 435 90 L 470 70 L 470 200 L 435 200 Z" fill="rgba(255,255,255,0.9)"/>
          <g>
            {[...Array(13)].map((_, i) => (
              <g key={`b10-${i}`}>
                <rect x="440" y={95 + i * 8} width="5" height="5" fill="rgba(100,150,200,0.6)"/>
                <rect x="448" y={90 + i * 8} width="5" height="5" fill="rgba(100,150,200,0.6)"/>
                <rect x="456" y={85 + i * 8} width="5" height="5" fill="rgba(100,150,200,0.6)"/>
              </g>
            ))}
          </g>
          
          {/* Trees on right */}
          <circle cx="485" cy="178" r="11" fill="rgba(255,255,255,0.8)"/>
          <rect x="482" y="178" width="6" height="22" fill="rgba(255,255,255,0.8)"/>
          
          <circle cx="505" cy="175" r="13" fill="rgba(255,255,255,0.8)"/>
          <rect x="501" y="175" width="8" height="25" fill="rgba(255,255,255,0.8)"/>
          
          <circle cx="530" cy="180" r="12" fill="rgba(255, 255, 255, 0.8)"/>
          <rect x="527" y="180" width="6" height="20" fill="rgba(255,255,255,0.8)"/>
          
          <circle cx="560" cy="180" r="12" fill="rgba(255,255,255,0.8)"/>
          <rect x="557" y="185" width="6" height="20" fill="rgba(255,255,255,0.8)"/>
        </svg>
      </div>

      {/* Footer Content */}
 <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
  {/* Top Section */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
    {/* Company Info */}
    <div>
      <div className="flex items-center gap-2 mb-4">
  
        <div>
          <h3 className="text-2xl font-bold">
            <span className="text-blue-300">CLEAR</span>
            <span className="text-yellow-300">TITLE 1</span>
          </h3>
          <p className="text-blue-100 text-sm">100% Legal Property Assurance</p>
        </div>
      </div>
      <p className="text-blue-100 mb-4">
        Your trusted partner for 100% legally verified properties across Karnataka. 
        We ensure complete legal compliance for all property transactions.
      </p>
      <div className="flex gap-3">
        <a 
          href="https://www.facebook.com/cleartitleone" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <Facebook className="w-5 h-5" />
        </a>
        <a 
          href="https://x.com/cleartitleone" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <a 
          href="https://www.instagram.com/cleartitleone/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <Instagram className="w-5 h-5" />
        </a>
        <a 
          href="https://www.linkedin.com/company/cleartitle1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
        >
          <Linkedin className="w-5 h-5" />
        </a>
      </div>
    </div>

    {/* Property Types */}
    <div>
      <h4 className="text-lg font-semibold mb-4 relative pb-2">
        <span className="text-white">Property Types</span>
        <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-yellow-300 to-blue-300"></div>
      </h4>
      <ul className="space-y-2">
        <li><a href="#" className="text-blue-100 hover:text-white transition-colors">Apartments & Flats</a></li>
        <li><a href="#" className="text-blue-100 hover:text-white transition-colors">Villas & Houses</a></li>
        <li><a href="#" className="text-blue-100 hover:text-white transition-colors">Plots & Farmlands</a></li>
        <li><a href="#" className="text-blue-100 hover:text-white transition-colors">Commercial Spaces</a></li>
        <li><a href="#" className="text-blue-100 hover:text-white transition-colors">Joint Developments</a></li>
      </ul>
    </div>

    {/* Services */}
    <div>
      <h4 className="text-lg font-semibold mb-4 relative pb-2">
        <span className="text-white">Legal Services</span>
        <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-yellow-300 to-blue-300"></div>
      </h4>
      <ul className="space-y-2">
        <li className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-yellow-300" />
          <span className="text-blue-100">Clear Title Verification</span>
        </li>
        <li className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-green-300" />
          <span className="text-blue-100">Legal Documentation</span>
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-300" />
          <span className="text-blue-100">Khata Registration</span>
        </li>
        <li className="flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-300" />
          <span className="text-blue-100">Property Registration</span>
        </li>
      </ul>
    </div>

    {/* Contact Info */}
    <div>
      <h4 className="text-lg font-semibold mb-4 relative pb-2">
        <span className="text-white">Contact Us</span>
        <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-gradient-to-r from-yellow-300 to-blue-300"></div>
      </h4>
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-1" />
          <span className="text-blue-100">Bengaluru, Karnataka, India</span>
        </li>
        <li className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-green-300" />
          <a 
            href="tel:+9190190 67239" 
            className="text-blue-100 hover:text-white transition-colors"
          >
            +91 9019067239
          </a>
        </li>
        <li className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-blue-300" />
          <a 
            href="mailto:info@cleartitle1.com" 
            className="text-blue-100 hover:text-white transition-colors"
          >
            info@cleartitle1.com
          </a>
        </li>
        <li className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-purple-300" />
          <a 
            href="https://cleartitle1.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-100 hover:text-white transition-colors"
          >
            www.cleartitle1.com
          </a>
        </li>
      </ul>
    </div>
  </div>

  {/* Trust Badges */}
  <div className="border-t border-white/20 pt-8 mb-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
        <Shield className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
        <div className="text-sm font-semibold">100% Verified</div>
        <p className="text-xs text-blue-100 mt-1">Legal Compliance</p>
      </div>
      <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
        <FileCheck className="w-8 h-8 text-green-300 mx-auto mb-2" />
        <div className="text-sm font-semibold">Clear Title</div>
        <p className="text-xs text-blue-100 mt-1">Guarantee</p>
      </div>
      <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
        <CheckCircle className="w-8 h-8 text-blue-300 mx-auto mb-2" />
        <div className="text-sm font-semibold">Legal Support</div>
        <p className="text-xs text-blue-100 mt-1">End-to-End</p>
      </div>
      <div className="text-center p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
        <Award className="w-8 h-8 text-purple-300 mx-auto mb-2" />
        <div className="text-sm font-semibold">Trusted Platform</div>
        <p className="text-xs text-blue-100 mt-1">Since 2023</p>
      </div>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
    <div className="text-blue-100 text-sm text-center md:text-left">
      © {new Date().getFullYear()} <span className="text-blue-300">CLEAR</span>
      <span className="text-yellow-300">TITLE 1</span>. All rights reserved.
      <span className="block md:inline md:ml-2 mt-1 md:mt-0">
        Developed by 
        <a 
          href="https://www.linkedin.com/in/adarsha-h-9350182a6/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-yellow-300 hover:text-yellow-400 ml-1 transition-colors duration-300"
        >
          Adarsha
        </a>
      </span>
    </div>
    <div className="flex gap-6 text-sm">

      <a 
        href="/terms-and-conditions"  target="_blank"
        className="text-blue-100 hover:text-yellow-300 transition-colors"
      >
        Terms and Conditions
      </a>

    </div>
  </div>
</div>
    </footer>
  );
}