import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search } from 'lucide-react';
gsap.registerPlugin(ScrollTrigger);

const CloudSVG = ({ className, style }) => (
  <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <defs>
      <filter id="cloud-blur-visible" x="-20%" y="-20%" width="120%" height="140%">
        <feGaussianBlur stdDeviation="1.5" />
      </filter>
      <linearGradient id="visible-cloud-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <g filter="url(#cloud-blur-visible)">
      <ellipse cx="100" cy="62" rx="50" ry="42" fill="url(#visible-cloud-grad)" />
      <ellipse cx="68" cy="76" rx="36" ry="30" fill="url(#visible-cloud-grad)" />
      <ellipse cx="128" cy="72" rx="44" ry="36" fill="url(#visible-cloud-grad)" />
    </g>
  </svg>
);

const PropertyCategories = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const cloudsRef = useRef([]);
  const imageContainersRef = useRef([]);
  const headerRef = useRef(null);

  const categories = [
    { id: 'Apartment', name: 'Apartments', tagline: 'CURATED URBAN', location: 'Indiranagar', img: '/testing.png', bgColor: 'bg-sky-500' },
    { id: 'Villa', name: 'Estate Villas', tagline: 'ARCHITECTURAL', location: 'Whitefield', img: 'villa.png', bgColor: 'bg-sky-500' },
    { id: 'Commercial', name: 'Commercial', tagline: 'STRATEGIC', location: 'Manyata', img: '/commercial.png', bgColor: 'bg-sky-200' },
    { id: 'Plot', name: 'Private Acres', tagline: 'BESPOKE', location: 'Devanahalli', img: 'plot.png', bgColor: 'bg-sky-200' },
    { id: 'House', name: 'Classic Manors', tagline: 'TIMELESS HERITAGE', location: 'Sadashivnagar • Bangalore', img: 'indepentent.png', bgColor: 'bg-sky-100' }
  ];

useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Reveal: Elegant slide-up with subtle letter spacing expansion
      gsap.from(headerRef.current, {
        y: 30,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 90%",
        }
      });

      // 2. Staggered Card Entrance: Reveal images with a sophisticated pop
      imageContainersRef.current.forEach((imgContainer, i) => {
        gsap.from(imgContainer, {
          y: 50,
          opacity: 0,
          scale: 0.9,
          duration: 1.4,
          ease: "power4.out",
          scrollTrigger: {
            trigger: cardsRef.current[i],
            start: "top 99%",
            toggleActions: "play none none none",
          },
          delay: i * 0.1, // Stagger effect for premium feel
        });

        // 3. Subtle Floating Effect: Makes the property feel 3D/Hovering
        gsap.to(imgContainer.querySelector('img'), {
          y: -2,
          duration: 3 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.5
        });
      });

      // 4. Enhanced Cloud Drifting
      cloudsRef.current.forEach((cloudGroup, i) => {
        if (!cloudGroup) return;
        const c1 = cloudGroup.querySelector('.cloud-1');
        const c2 = cloudGroup.querySelector('.cloud-2');

        // Drift Cloud 1
        gsap.to(c1, { 
          x: "20%", 
          opacity: 0.8,
          duration: 12 + i, 
          repeat: -1, 
          yoyo: true, 
          ease: "sine.inOut" 
        });

        // Drift Cloud 2
        gsap.to(c2, { 
          x: "-20%", 
          opacity: 0.9,
          duration: 16 + i, 
          repeat: -1, 
          yoyo: true, 
          ease: "sine.inOut" 
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-2 md:py-16 px-4 md:px-10 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Redesigned Header with Changed Typography */}
    <div className={`relative w-full py-2 max-w-md mx-auto `}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search properties..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 cursor-not-allowed opacity-75"
          disabled
        />
      </div>
    </div>
        {/* Compact Responsive Grid with Updated Typography */}
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              ref={el => cardsRef.current[i] = el}
              onClick={() => navigate(`/properties/category/${cat.id}`)}
              className={`group relative h-[180px] sm:h-[300px] md:h-[450px] overflow-hidden cursor-pointer rounded-sm shadow-md transition-all duration-700 hover:shadow-xl
                ${i === 4 ? 'col-span-2' : 'col-span-1'}`}
            >
              {/* BACK LAYER */}
              <div ref={el => cloudsRef.current[i] = el} className={`absolute inset-0 z-0 ${cat.bgColor}`}>
                <CloudSVG className="cloud-1 absolute top-2 -left-5 w-24 md:w-[300px] opacity-80" />
                <CloudSVG className="cloud-2 absolute top-5 -right-5 w-20 md:w-[250px] opacity-90 scale-x-[-1]" />
              </div>

              {/* MIDDLE LAYER */}
              <div ref={el => imageContainersRef.current[i] = el} className='relative z-10 w-full h-full'>
                <img 
                  src={cat.img} 
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full scale-120 sm:scale-100 object-cover grayscale-[20%] group-hover:grayscale-75 transition-all duration-700 group-hover:scale-130"
                />
              </div>
              
              {/* FRONT LAYER */}
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a111f]/90 via-transparent to-transparent opacity-80" />

              <div className="absolute inset-0 z-30 p-3 md:p-8 flex flex-col justify-end">
                {/* Changed to uppercase with lighter weight */}
                <p className="text-[6px] md:text-[9px] font-mono tracking-[0.2em] text-amber-300 uppercase mb-1 opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                  {cat.tagline}
                </p>
                
                {/* Changed to light weight with serif font */}
                <h4 className="text-sm md:text-3xl font-light font-serif text-white/90 mb-1 md:mb-2 transition-transform duration-500 group-hover:-translate-y-1">
                  {cat.name}
                </h4>
                
  
              </div>

              {/* Minimalist corner accent on hover */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-white/0 group-hover:border-white/30 transition-all duration-500"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-white/0 group-hover:border-white/30 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCategories;