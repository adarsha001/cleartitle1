// PropertyCategories.jsx - Fully Responsive with Uniform Layout
import React, { useEffect, useRef, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const categories = [
    { id: 'Apartment', name: 'Apartments', tagline: 'CURATED URBAN', location: 'Indiranagar', img: '/appartment1.png', bgColor: 'bg-blue-200' },
    { id: 'Villa', name: 'Estate Villas', tagline: 'ARCHITECTURAL', location: 'Whitefield', img: '/villa1.png', bgColor: 'bg-blue-200' },
    { id: 'Plot', name: 'Plot', tagline: 'BESPOKE', location: 'Devanahalli', img: 'plot1.png', bgColor: 'bg-blue-200' },
  ]; 

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Only run animations on non-mobile devices for better performance
      if (!isMobile) {
        // Header Reveal
        if (headerRef.current) {
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
        }

        // Card Entrances
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

        // Cloud Drifting
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

        // Background Movement
        if (sectionRef.current) {
          gsap.to(sectionRef.current, {
            backgroundPosition: "100px 50px",
            duration: 20,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <div className="w-full overflow-x-hidden ">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <section className="w-full px-3 sm:px-4 py-3 sm:py-4">
          {/* Search Bar */}
          <div className="mb-3 sm:mb-4">
            <SearchBar />
          </div>

          {/* Category Grid - 2 Columns for Mobile */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/properties/category/${cat.id}`)}
                className={`group relative overflow-hidden cursor-pointer rounded-xl shadow-md active:scale-[0.98] transition-all duration-300
                  ${i === 2 ? 'col-span-2' : 'col-span-1'}
                  h-[140px] xs:h-[160px] sm:h-[200px]`}
              >
                {/* Background */}
                <div className={`absolute inset-0 z-0 ${cat.bgColor}`}>
                  <CloudSVG className="cloud-1 absolute top-2 -left-5 w-24 sm:w-32 opacity-60" />
                  <CloudSVG className="cloud-2 absolute top-5 -right-5 w-20 sm:w-28 opacity-70 scale-x-[-1]" />
                </div>

                {/* Image */}
                <div className='relative z-10 w-full h-full'>
                  <img 
                    src={cat.img} 
                    alt={cat.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-active:scale-105"
                  />
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 z-30 p-3 sm:p-4 flex flex-col justify-end">
                  <p className="text-[9px] xs:text-[10px] sm:text-xs font-medium tracking-wider text-amber-300 uppercase mb-0.5">
                    {cat.tagline}
                  </p>
                  
                  <h4 className="text-sm xs:text-base sm:text-lg font-semibold text-white mb-0.5">
                    {cat.name}
                  </h4>
                  
                  <p className="text-[10px] xs:text-xs text-white/70 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-amber-400 rounded-full"></span>
                    {cat.location}
                  </p>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-lg"></div>
              </div>
            ))}
          </div>

          {/* Mobile CTA - Simple Version */}
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-stone-50 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-800">Ready to find your dream home?</h3>
                <p className="text-xs text-stone-600 mt-0.5">Join Legacy Estate today</p>
              </div>
              <button 
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg shadow-md active:scale-95 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Desktop Layout - Uniform across all screen sizes */}
      <div className="hidden lg:block">
        <div className="flex items-stretch min-h-[600px]">
          {/* Left Spacer - Dynamic */}
          <div className="w-[5%] xl:w-[8%] 2xl:w-[10%]"></div>
          
          {/* Categories Section - Fixed width ratio */}
          <section ref={sectionRef} className="w-[48%] xl:w-[45%] py-8">
            <div className="h-full flex flex-col">
              {/* Search Bar */}
              <div className="mb-6">
                <SearchBar />
              </div>

              {/* Category Grid - 2 Columns */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                {categories.map((cat, i) => (
                  <div
                    key={cat.id}
                    ref={el => cardsRef.current[i] = el}
                    onClick={() => navigate(`/properties/category/${cat.id}`)}
                    className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500
                      ${i === 2 ? 'col-span-2' : 'col-span-1'}
                      h-full min-h-[250px]`}
                  >
                    {/* Background Layer */}
                    <div ref={el => cloudsRef.current[i] = el} className={`absolute inset-0 z-0 ${cat.bgColor} group-hover:grayscale-75 transition-all duration-700`}>
                      <CloudSVG className="cloud-1 absolute top-4 -left-8 w-64 xl:w-72 opacity-80" />
                      <CloudSVG className="cloud-2 absolute top-8 -right-8 w-56 xl:w-64 opacity-90 scale-x-[-1]" />
                    </div>

                    {/* Image Layer */}
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
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a111f]/95 via-[#0a111f]/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Content */}
                    <div className="absolute inset-0 z-30 p-6 xl:p-7 flex flex-col justify-end">
                      <p className="text-xs xl:text-sm font-mono tracking-[0.2em] text-amber-300 uppercase mb-1 opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                        {cat.tagline}
                      </p>
                      
                      <h4 className="text-2xl xl:text-3xl font-light font-serif text-white mb-1 transition-transform duration-500 group-hover:-translate-y-1">
                        {cat.name}
                      </h4>
                      
                      <p className="text-sm text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                        {cat.location}
                      </p>
                    </div>

                    {/* Corner Accents */}
                    <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-white/0 group-hover:border-white/40 transition-all duration-500 rounded-tl-lg"></div>
                    <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-white/0 group-hover:border-white/40 transition-all duration-500 rounded-br-lg"></div>
                    
                    {/* Hover Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/0 to-amber-600/0 group-hover:from-amber-600/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-700 z-25"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* LuxuryAuthCTA - Fixed width for uniformity */}
          <div className="w-[32%] xl:w-[30%] flex items-center">
            <div className="w-full max-w-[420px] mx-auto">
              <LuxuryAuthCTA />
            </div>
          </div>
          
          {/* Right Spacer - Dynamic */}
          <div className="w-[15%] xl:w-[17%] 2xl:w-[15%]"></div>
        </div>
      </div>

      {/* Tablet Layout - Intermediate */}
      <div className="hidden sm:block lg:hidden">
        <section className="w-full px-6 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar />
            </div>

            {/* Category Grid - 2 Columns */}
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/properties/category/${cat.id}`)}
                  className={`group relative overflow-hidden cursor-pointer rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500
                    ${i === 2 ? 'col-span-2' : 'col-span-1'}
                    h-[220px]`}
                >
                  {/* Background */}
                  <div className={`absolute inset-0 z-0 ${cat.bgColor}`}>
                    <CloudSVG className="absolute top-4 -left-8 w-48 opacity-70" />
                    <CloudSVG className="absolute top-8 -right-8 w-44 opacity-80 scale-x-[-1]" />
                  </div>

                  {/* Image */}
                  <div className='relative z-10 w-full h-full'>
                    <img 
                      src={cat.img} 
                      alt={cat.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 z-30 p-5 flex flex-col justify-end">
                    <p className="text-xs font-medium tracking-wider text-amber-300 uppercase mb-1">
                      {cat.tagline}
                    </p>
                    
                    <h4 className="text-xl font-semibold text-white mb-1">
                      {cat.name}
                    </h4>
                    
                    <p className="text-sm text-white/70">
                      {cat.location}
                    </p>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg"></div>
                </div>
              ))}
            </div>

            {/* Tablet CTA */}
            <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-stone-50 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-stone-800">Ready to find your dream home?</h3>
                  <p className="text-sm text-stone-600 mt-1">Join thousands of satisfied homeowners</p>
                </div>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-amber-600 text-white font-medium rounded-xl shadow-md hover:bg-amber-700 transition-all"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PropertyCategories;