import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ShieldCheck, TrendingUp, Handshake, Map } from 'lucide-react';

export default function QualityAssuranceSection() {
  const [counters, setCounters] = useState({
    years: 0,
    acres: 0,
    clients: 0,
    deals: 0,
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);
  const shieldRef = useRef(null);
  const checkmarkRef = useRef(null);
  const percentageRef = useRef(null);
  const svgWrapperRef = useRef(null); // Ref for the SVG container for parallax effect

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
          animateSVG();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Counter animation logic (Kept the same logic)
  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      years: 15,
      acres: 200,
      clients: 100,
      deals: 65,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounters({
        years: Math.floor(targets.years * progress),
        acres: Math.floor(targets.acres * progress),
        clients: Math.floor(targets.clients * progress),
        deals: Math.floor(targets.deals * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, interval);
  };

  // GSAP Animation for SVG (Adjusted for new shield design)
  const animateSVG = () => {
    const tl = gsap.timeline({defaults: {duration: 0.8, ease: "power2.out"}});
    
    // Shield animation
    tl.fromTo(shieldRef.current,
      {
        scale: 0,
        rotation: -180,
        opacity: 0,
        transformOrigin: "center center"
      },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 1.2,
        ease: "back.out(1.7)"
      }
    )
    // Percentage text animation
    .fromTo(percentageRef.current,
      {
        scale: 0,
        opacity: 0,
        y: 30 // Smaller initial displacement
      },
      {
        scale: 1,
        opacity: 1,
        y: 0,
      }, "-=0.7") // Overlap with shield animation
    // Checkmark animation (stroke-dasharray based)
    .fromTo(checkmarkRef.current,
      {
        strokeDashoffset: 100,
        opacity: 0
      },
      {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.inOut"
      }, "-=0.3"); // Overlap slightly with percentage text

    // Continuous subtle pulse animation for the shield
    gsap.to(shieldRef.current, {
      scale: 1.02, // Smaller pulse effect
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: tl.duration() // Start after initial animation completes
    });

     // Parallax effect on scroll for the SVG wrapper
     gsap.to(svgWrapperRef.current, {
      y: -50, // Move up by 50px as user scrolls
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom", // Start when the top of the section enters from bottom
        end: "bottom top", // End when the bottom of the section leaves from top
        scrub: true, // Smoothly animate on scroll
      }
    });
  };

  const stats = [
    {
      number: `${counters.years}+`,
      label: 'YEARS OF',
      sublabel: 'EXCELLENCE',
      icon: TrendingUp,
    },
    {
      number: `${counters.acres}+`,
      label: 'ACRES OF LAND',
      sublabel: 'VERIFIED',
      icon: Map,
    },
    {
      number: `${counters.clients}+`,
      label: 'SATISFIED',
      sublabel: 'CLIENTS',
      icon: Handshake,
    },
    {
      number: `${counters.deals}+`,
      label: 'LEGALLY CLEARED',
      sublabel: 'DEALS',
      icon: ShieldCheck,
    },
  ];

  const services = [
    {
      title: 'Residential Properties',
      description: 'Flats, apartments, and villas with 100% legal verification and clear titles',
      color: 'border-blue-600',
      iconClass: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Plots & Farmlands',
      description: 'Single site plots, farm lands with complete documentation and legal clearance',
      color: 'border-green-600',
      iconClass: 'text-green-600 bg-green-100',
    },
    {
      title: 'Commercial & JD/JV',
      description: 'Commercial spaces, joint developments & ventures with transparent legal agreements',
      color: 'border-orange-600',
      iconClass: 'text-orange-600 bg-orange-100',
    },
  ];

  return (
    <div 
      ref={sectionRef} 
      className="relative w-full min-h-screen bg-white overflow-hidden py-16 md:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Layout */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-sm font-semibold uppercase text-blue-600 tracking-wider mb-2">Our Foundation of Trust</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            The <strong className="text-blue-600">Clear Title</strong> Advantage
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
            We specialize in **100% legally verified properties** across all categories, ensuring complete transparency and security for your investment.
          </p>
        </div>

        {/* --- Main Content Split --- */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-20">
          
          {/* Left Column: Shield/SVG Focal Point */}
          <div className="lg:col-span-5 flex justify-center items-center mb-12 lg:mb-0 relative">
             <div ref={svgWrapperRef} className="relative w-full max-w-lg lg:max-w-md xl:max-w-lg"> {/* Increased max-width for bigger SVG */}
              <svg 
                width="600" // Increased width
                height="600" // Increased height
                viewBox="0 0 400 400" 
                className="w-full h-full"
              >
                {/* Background Pattern/Design Element */}
                <circle 
                  cx="200" 
                  cy="200" 
                  r="190" 
                  fill="#E0F2FE" // Lighter blue background circle
                  stroke="#A7D6F8" // Light blue stroke
                  strokeWidth="6"
                  opacity="0.7"
                />
                
                {/* Shield Base - Enhanced with multiple gradients for depth */}
                <path 
                  ref={shieldRef}
                  d="M200 60 L280 100 L280 180 C280 240 240 300 200 340 C160 300 120 240 120 180 L120 100 Z" 
                  fill="url(#enhancedShieldGradient)"
                  stroke="url(#shieldBorderGradient)" // Border gradient
                  strokeWidth="8" // Thicker border
                  filter="url(#glowFilter)" // Glow filter
                />
                
                {/* Inner Highlight for depth */}
                <path 
                  d="M200 65 L275 102 L275 178 C275 235 238 290 200 330 C162 290 125 235 125 178 L125 102 Z"
                  fill="url(#innerHighlight)"
                  opacity="0.6"
                />

                {/* Checkmark */}
                <path 
                  ref={checkmarkRef}
                  d="M160 200 L180 220 L240 160" 
                  stroke="#FFD700" // Gold color for checkmark
                  strokeWidth="14" // Thicker checkmark
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray="100"
                  strokeDashoffset="100"
                />
                
                {/* Percentage Text */}
                <text 
                  ref={percentageRef}
                  x="200" 
                  y="140" 
                  textAnchor="middle" 
                  fill="#FFD700" // Gold color for text
                  fontSize="52" // Larger font size
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                >
                  100%
                </text>
                
                {/* Title Text */}
                <text 
                  x="200" 
                  y="280" 
                  textAnchor="middle" 
                  fill="#FFD700" // Gold color for text
                  fontSize="28" // Larger font size
                  fontWeight="bold"
                  fontFamily="Arial, sans-serif"
                >
                  CLEAR TITLE
                </text>
                
                {/* Subtitle Text */}
                <text 
                  x="200" 
                  y="310" 
                  textAnchor="middle" 
                  fill="#F0E68C" // Lighter gold/khaki for subtitle
                  fontSize="20" // Larger font size
                  fontFamily="Arial, sans-serif"
                >
                  ASSURED
                </text>
                
                {/* Gradient Definitions */}
                <defs>
                  {/* Enhanced Shield Gradient */}
                  <linearGradient id="enhancedShieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4A90E2" /> {/* Lighter blue at top */}
                    <stop offset="50%" stopColor="#2F70B7" /> {/* Mid blue */}
                    <stop offset="100%" stopColor="#1C5C9C" /> {/* Darker blue at bottom */}
                  </linearGradient>

                  {/* Border Gradient for a metallic look */}
                  <linearGradient id="shieldBorderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ADD8E6" /> {/* Light blue */}
                    <stop offset="50%" stopColor="#4A90E2" /> {/* Mid blue */}
                    <stop offset="100%" stopColor="#2F70B7" /> {/* Dark blue */}
                  </linearGradient>

                  {/* Inner Highlight Gradient */}
                  <radialGradient id="innerHighlight" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </radialGradient>

                  {/* Glow Filter */}
                  <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
                    <feFlood floodColor="#3B82F6" floodOpacity="0.6" result="floodColor" />
                    <feComposite in="floodColor" in2="offsetBlur" operator="in" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </svg>
            </div>
          </div>

          {/* Right Column: Stats and Services */}
          <div className="lg:col-span-7">
            
            {/* Stats Grid - Modern Card Style */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-12">
              {stats.map((stat, idx) => (
                <div 
                  key={idx}
                  className="group relative bg-white p-5 sm:p-6 rounded-xl shadow-lg border border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`flex items-center justify-center w-10 h-10 mb-3 rounded-full 
                    ${idx === 0 ? 'bg-orange-100 text-orange-600' : 
                       idx === 1 ? 'bg-green-100 text-green-600' : 
                       'bg-blue-100 text-blue-600'}`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                    {stat.label}
                  </div>
                  <div className="text-xs font-medium text-gray-500 tracking-widest uppercase">
                    {stat.sublabel}
                  </div>
                </div>
              ))}
            </div>

            {/* Services Section - Elevated Cards */}
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 border-b pb-2">Our Legal Assurance Services</h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {services.map((service, idx) => (
                <div 
                  key={idx} 
                  className={`bg-white p-4 sm:p-6 rounded-xl shadow-md border-l-4 ${service.color} hover:shadow-xl transition-all duration-300 flex items-start`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${service.iconClass}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{service.title}</h4>
                    <p className="text-gray-600 text-sm">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* --- End Main Content Split --- */}


        {/* Legal Assurance Badge - Full Width Footer */}
        <div className="max-w-6xl mx-auto mt-16 p-8 bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl text-white shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="flex-shrink-0 mr-0 sm:mr-6 mb-4 sm:mb-0">
              <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="text-2xl font-extrabold mb-2">100% Legal Verification Guarantee</h4>
              <p className="text-blue-200 text-base">
                Every property undergoes comprehensive legal **due diligence** including title verification, encumbrance checks, and regulatory compliance to ensure your investment is completely **secure and risk-free**.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Button (Kept the same) */}
      <a 
        href="https://wa.me/917788999022" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
        aria-label="Contact us on WhatsApp"
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}