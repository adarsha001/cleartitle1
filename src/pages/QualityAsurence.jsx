import React, { useState, useEffect, useRef } from 'react';

// NOTE: This component assumes you have Tailwind CSS configured in your project.

export default function QualityAssuranceSection() {
  const [counters, setCounters] = useState({
    properties: 0,
    clients: 0,
    years: 0,
    deals: 0,
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.2 } // Lower threshold for mobile
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Counter animation logic
  const animateCounters = () => {
    const duration = 1800; // Slightly faster for mobile
    const steps = 50;
    const interval = duration / steps;

    const targets = {
      properties: 50,
      clients: 45,
      years: 2,
      deals: 50,
    };

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounters({
        properties: Math.floor(targets.properties * progress),
        clients: Math.floor(targets.clients * progress),
        years: Math.floor(targets.years * progress),
        deals: Math.floor(targets.deals * progress),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, interval);
  };

  const stats = [
    {
      number: `${counters.properties}+`,
      label: 'PROPERTIES',
      sublabel: 'VERIFIED',
    },
    {
      number: `${counters.clients}+`,
      label: 'HAPPY',
      sublabel: 'CLIENTS',
    },
    {
      number: `${counters.years}+`,
      label: 'YEARS',
      sublabel: 'EXPERIENCE',
    },
    {
      number: `${counters.deals}+`,
      label: 'SUCCESS',
      sublabel: 'DEALS',
    },
  ];

  const propertyTypes = [
    {
      title: 'Residential',
      items: ['Apartments', 'Villas', 'Independent', 'Studio', 'Penthouses', 'Duplex', 'Pg house'],
      color: 'border-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-white',
      icon: '🏠',
    },
    {
      title: 'Plots & Land',
      items: ['Residential Plots', 'Farm Lands', 'Agricultural', 'Layout Plots', 'Gated Plots'],
      color: 'border-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-white',
      icon: '📍',
    },
    {
      title: 'Commercial',
      items: ['Office Spaces', 'Shops', 'Showrooms', 'Warehouses', 'Commercial', 'Business Centers'],
      color: 'border-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-white',
      icon: '🏢',
    },
  ];

  const verificationProcess = [
    {
      step: '01',
      title: 'Title Check',
      description: '40-year legal title verification',
      icon: '📋',
    },
    {
      step: '02',
      title: 'Doc Scrutiny',
      description: 'Complete document examination',
      icon: '📄',
    },
    {
      step: '03',
      title: 'Encumbrance',
      description: 'Loans & legal disputes check',
      icon: '🔍',
    },
    {
      step: '04',
      title: 'Approvals',
      description: 'RERA & govt. approval check',
      icon: '✅',
    },
  ];

  return (
    <div 
      ref={sectionRef} 
      className="relative w-full p-3 md:p-4 min-h-[110vh] md:min-h-[100vh] bg-[#F9FAFB] bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden"
    >
      
      {/* Background Image Section */}
      <div className="absolute inset-0 z-0">
        <img 
          src="./logoo.png" 
          alt="Bangalore city skyline" 
          className="w-full h-full object-cover opacity-20 md:opacity-30" 
        />
      </div>
      
      {/* Content Section */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-8">
        
        {/* Header and Description */}
        <div className="max-w-4xl mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-blue-900 mb-4 sm:mb-6 tracking-tight">
            100% <strong className="font-bold text-blue-700">VERIFIED</strong> PROPERTIES
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-blue-800 leading-relaxed max-w-2xl">
            We ensure <strong className="text-blue-600 font-semibold">complete legal clearance</strong> for every property. Each undergoes rigorous 4-step verification for <strong className="text-blue-700 font-semibold">zero legal issues</strong>.
          </p>
        </div>

        {/* Stats Grid - Compact Mobile Layout */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 max-w-4xl">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="group relative border-l-3 md:border-l-4 border-blue-300 p-2 sm:p-3 bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
            >
              <div className="space-y-0.5 sm:space-y-1">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-blue-700 tracking-tight">
                  {stat.number}
                </div>
                <div className="text-xs font-semibold text-blue-700 tracking-wide uppercase truncate">
                  {stat.label}
                </div>
                <div className="text-xs font-light text-blue-600 tracking-wide uppercase">
                  {stat.sublabel}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Property Types Section - Mobile Optimized */}
        <div className="max-w-4xl mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-light text-blue-900 mb-4 sm:mb-6">Verified Property Types</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {propertyTypes.map((type, idx) => (
              <div 
                key={idx} 
                className={`${type.bgColor} p-3 sm:p-4 border-l-3 sm:border-l-4 ${type.color} shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm rounded-lg`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{type.icon}</span>
                  <h4 className={`text-base sm:text-lg font-bold ${type.color.replace('border-', 'text-')}`}>
                    {type.title}
                  </h4>
                </div>
                <ul className="space-y-1.5 sm:space-y-2">
                  {type.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-center text-blue-800 text-xs sm:text-sm">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Process - Mobile Optimized */}
        <div className="max-w-4xl mb-8 sm:mb-12">
          <h3 className="text-xl sm:text-2xl font-light text-blue-900 mb-4 sm:mb-6">4-Step Verification</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {verificationProcess.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center mb-2">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mr-2">{step.step}</div>
                  <span className="text-lg">{step.icon}</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-blue-900 mb-1 truncate">{step.title}</h4>
                <p className="text-blue-700 text-xs sm:text-sm leading-tight">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Assurance Badge - Mobile Optimized */}
        <div className="max-w-4xl mt-8 sm:mt-10 p-4 sm:p-6 bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl sm:rounded-2xl text-white shadow-lg">
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center mb-3 sm:mb-0 sm:mr-4">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-extrabold mb-2">Zero Legal Issues</h4>
              <p className="text-blue-200 text-xs sm:text-sm leading-relaxed">
                Every property undergoes 4-step verification. We guarantee <strong className="text-white">100% clear titles</strong> and <strong className="text-white">full legal compliance</strong> with RERA regulations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Button - Mobile Optimized */}
      <a 
        href="https://wa.me/9190190 67239" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
        aria-label="Contact us on WhatsApp"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}