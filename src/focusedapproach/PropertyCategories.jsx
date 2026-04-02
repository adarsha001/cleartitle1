// PropertyCategories.jsx - Updated with responsive layout
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SearchBar from './SearchBar';
import LuxuryAuthCTA from '../pages/Cta_button';

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
    { id: 'Apartment', name: 'Apartments', tagline: 'CURATED URBAN', location: 'Indiranagar', img: '/appartment1.png', bgColor: 'bg-blue-200' },
    { id: 'Villa', name: 'Estate Villas', tagline: 'ARCHITECTURAL', location: 'Whitefield', img: '/villa1.png', bgColor: 'bg-blue-200' },
    // { id: 'Commercial', name: 'Commercial', tagline: 'STRATEGIC', location: 'Manyata', img: '/commercial1.png', bgColor: 'bg-blue-200' },
    { id: 'Plot', name: 'Plot', tagline: 'BESPOKE', location: 'Devanahalli', img: 'plot1.png', bgColor: 'bg-blue-200' },
    // { id: 'House', name: 'Independent House', tagline: 'TIMELESS HERITAGE', location: 'Sadashivnagar • Bangalore', img: '/independent1.png', bgColor: 'bg-blue-200' }
  ]; 

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Reveal
      gsap.from(headerRef.current, {
        y: 30,
        autoAlpha: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 90%",
        }
      });

      // 2. Card Entrances
      imageContainersRef.current.forEach((imgContainer, i) => {
        if (!imgContainer) return;

        gsap.from(imgContainer, {
          y: 10,
          scale: 0.9,
          autoAlpha: 0,
          duration: 1.4,
          ease: "power4.out",
          delay: i * 0.1,
        });
      });

      // 3. Cloud Drifting
      cloudsRef.current.forEach((cloudGroup, i) => {
        if (!cloudGroup) return;
        const c1 = cloudGroup.querySelector('.cloud-1');
        const c2 = cloudGroup.querySelector('.cloud-2');

        if (c1) {
          gsap.to(c1, { 
            xPercent: 25, 
            yPercent: -5,
            autoAlpha: 0.7,
            duration: 10 + i, 
            repeat: -1, 
            yoyo: true, 
            ease: "sine.inOut",
            force3D: true
          });
        }

        if (c2) {
          gsap.to(c2, { 
            xPercent: -25, 
            yPercent: 5,
            autoAlpha: 0.8,
            duration: 14 + i, 
            repeat: -1, 
            yoyo: true, 
            ease: "sine.inOut",
            force3D: true
          });
        }

        gsap.to(cloudGroup, {
          y: "+=3",
          x: "+=2",
          duration: 5 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          force3D: true
        });
      });

      // 4. Background Movement
      gsap.to(sectionRef.current, {
        backgroundPosition: "100px 50px",
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
<div className="flex flex-col lg:flex-row justify-end items-start overflow-x-hidden">
  {/* Property Categories Section - Takes full width on mobile, adjusted on desktop */}
   <div className="hidden lg:block lg:w-[45%] xl:w-[50%]"></div>
  <section ref={sectionRef} className="w-full lg:w-[calc(65%)] py-4 sm:py-6 lg:py-8 overflow-hidden">
    <div className="max-w-[1200px] mx-auto">
      {/* Search Bar - Responsive margins */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <SearchBar />
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            ref={el => cardsRef.current[i] = el}
            onClick={() => navigate(`/properties/category/${cat.id}`)}
            className={`group relative overflow-hidden cursor-pointer rounded-lg sm:rounded-xl shadow-md transition-all duration-700 hover:shadow-xl
              ${i === 2 ? 'col-span-2' : 'col-span-1'}
              h-[120px] xs:h-[150px] sm:h-[200px] md:h-[250px] lg:h-[280px] xl:h-[300px]`}
          >
            {/* BACK LAYER */}
            <div ref={el => cloudsRef.current[i] = el} className={`absolute inset-0 z-0 ${cat.bgColor} group-hover:grayscale-75`}>
              {/* Responsive cloud sizes */}
              <CloudSVG className="cloud-1 absolute top-2 -left-5 w-16 xs:w-20 sm:w-32 md:w-48 lg:w-56 xl:w-[300px] opacity-80" />
              <CloudSVG className="cloud-2 absolute top-5 -right-5 w-14 xs:w-18 sm:w-28 md:w-40 lg:w-48 xl:w-[250px] opacity-90 scale-x-[-1]" />
            </div>

            {/* MIDDLE LAYER - Image */}
            <div ref={el => imageContainersRef.current[i] = el} className='relative z-10 w-full h-full'>
              <img 
                src={cat.img} 
                alt={cat.name}
                loading="lazy"
                onLoad={(e) => {
                  e.currentTarget.classList.replace('opacity-0', 'opacity-100');
                }}
                className="absolute inset-0 w-full h-full object-cover saturate-100 transition-all duration-700 group-hover:scale-110 opacity-0"
              />
            </div>
            
            {/* FRONT LAYER - Gradient Overlay */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a111f]/90 via-transparent to-transparent opacity-80" />

            {/* Content */}
            <div className="absolute inset-0 z-30 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col justify-end">
              <p className="text-[8px] xs:text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.2em] text-amber-300 uppercase mb-0.5 xs:mb-1 opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                {cat.tagline}
              </p>
              
              <h4 className="text-xs xs:text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-light font-serif text-white/90 mb-0.5 xs:mb-1 md:mb-2 transition-transform duration-500 group-hover:-translate-y-1">
                {cat.name}
              </h4>
              
              {/* Location - Visible on larger screens */}
              <p className="hidden sm:block text-[8px] xs:text-[10px] sm:text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {cat.location}
              </p>
            </div>

            {/* Corner accents - Responsive sizing */}
            <div className="absolute top-2 left-2 xs:top-3 xs:left-3 w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 border-t border-l border-white/0 group-hover:border-white/30 transition-all duration-500"></div>
            <div className="absolute bottom-2 right-2 xs:bottom-3 xs:right-3 w-2 h-2 xs:w-3 xs:h-3 sm:w-4 sm:h-4 border-b border-r border-white/0 group-hover:border-white/30 transition-all duration-500"></div>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* LuxuryAuthCTA - Hidden on mobile, visible on desktop */}
  <div className="hidden lg:block lg:w-[35%] xl:w-[30%]  -ml-1">
    <LuxuryAuthCTA />
  </div>
     <div className="hidden lg:block lg:w-[20%] xl:w-[20%]"></div>
</div>
  );
};

export default PropertyCategories;