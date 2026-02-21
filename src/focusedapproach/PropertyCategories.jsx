import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Loader2 } from 'lucide-react';
import SearchBar from './SearchBar';

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

// Lazy Image Component with Intersection Observer
const LazyImage = ({ src, alt, className, onLoad }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading when within 50px of viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative w-full h-full">
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          onLoad={() => {
            setIsLoaded(true);
            if (onLoad) onLoad();
          }}
        />
      )}
    </div>
  );
};

// Skeleton Loader for Cards
const CardSkeleton = () => (
  <div className="relative h-[180px] sm:h-[300px] md:h-[450px] overflow-hidden rounded-sm bg-gray-200 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-8">
      <div className="h-3 w-16 bg-gray-300 rounded mb-2"></div>
      <div className="h-6 w-24 bg-gray-300 rounded"></div>
    </div>
  </div>
);

const PropertyCategories = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const cloudsRef = useRef([]);
  const imageContainersRef = useRef([]);
  const headerRef = useRef(null);
  
  // Lazy loading state
  const [visibleCards, setVisibleCards] = useState(3); // Show first 3 cards initially
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    { id: 'Apartment', name: 'Apartments', tagline: 'CURATED URBAN', location: 'Indiranagar', img: '/testing.png', bgColor: 'bg-sky-500' },
    { id: 'Villa', name: 'Estate Villas', tagline: 'ARCHITECTURAL', location: 'Whitefield', img: 'villa.png', bgColor: 'bg-sky-500' },
    { id: 'Commercial', name: 'Commercial', tagline: 'STRATEGIC', location: 'Manyata', img: '/commercial.png', bgColor: 'bg-sky-200' },
    { id: 'Plot', name: 'Plot', tagline: 'BESPOKE', location: 'Devanahalli', img: 'plot.png', bgColor: 'bg-sky-200' },
    { id: 'House', name: 'House', tagline: 'TIMELESS HERITAGE', location: 'Sadashivnagar • Bangalore', img: 'indepentent.png', bgColor: 'bg-sky-100' }
  ];

  // Intersection Observer for infinite scroll
  const observerRef = useRef(null);
  const lastCardRef = useCallback(node => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreCards();
      }
    }, {
      rootMargin: '100px',
      threshold: 0.1
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore]);

  // Load more cards
  const loadMoreCards = () => {
    if (visibleCards >= categories.length) {
      setHasMore(false);
      return;
    }
    
    setLoading(true);
    
    // Simulate network delay for smooth loading
    setTimeout(() => {
      setVisibleCards(prev => Math.min(prev + 2, categories.length));
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Only animate visible cards
      const visibleElements = imageContainersRef.current.slice(0, visibleCards);
      
      // 1. Header Reveal
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

      // 2. Staggered Card Entrance for visible cards
      visibleElements.forEach((imgContainer, i) => {
        if (!imgContainer) return;
        
        gsap.from(imgContainer, {
          y: 50,
          scale: 0.9,
          duration: 1.4,
          ease: "power4.out",
          scrollTrigger: {
            trigger: cardsRef.current[i],
            start: "top 99%",
            toggleActions: "play none none none",
          },
          delay: i * 0.1,
        });

        // Subtle movement for depth
        gsap.to(imgContainer, {
          x: "+=5",
          duration: 3 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.3
        });
      });

      // 3. Cloud animations for visible cards
      cloudsRef.current.slice(0, visibleCards).forEach((cloudGroup, i) => {
        if (!cloudGroup) return;
        const c1 = cloudGroup.querySelector('.cloud-1');
        const c2 = cloudGroup.querySelector('.cloud-2');

        if (c1) {
          gsap.to(c1, { 
            x: "25%", 
            y: "-5%",
            opacity: 0.7,
            duration: 10 + i, 
            repeat: -1, 
            yoyo: true, 
            ease: "sine.inOut" 
          });
        }

        if (c2) {
          gsap.to(c2, { 
            x: "-25%", 
            y: "5%",
            opacity: 0.8,
            duration: 14 + i, 
            repeat: -1, 
            yoyo: true, 
            ease: "sine.inOut" 
          });
        }

        gsap.to(cloudGroup, {
          y: "+=3",
          x: "+=2",
          duration: 5 + i,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });

      // 4. Background subtle movement
      gsap.to(sectionRef.current, {
        backgroundPosition: "100px 50px",
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [visibleCards]); // Re-run animations when visible cards change

  return (
    <section ref={sectionRef} className="py-2 px-4 md:px-10 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        
        <SearchBar />

        {/* Compact Responsive Grid */}
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          {categories.slice(0, visibleCards).map((cat, i) => (
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

              {/* MIDDLE LAYER with Lazy Loading */}
              <div ref={el => imageContainersRef.current[i] = el} className='relative z-10 w-full h-full'>
                <LazyImage
                  src={cat.img}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full scale-140 sm:scale-100 object-cover grayscale-[20%] group-hover:grayscale-50 transition-all duration-700 group-hover:scale-120"
                />
              </div>
              
              {/* FRONT LAYER */}
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0a111f]/90 via-transparent to-transparent opacity-80" />

              <div className="absolute inset-0 z-30 p-3 md:p-8 flex flex-col justify-end">
                <p className="text-[6px] md:text-[9px] font-mono tracking-[0.2em] text-amber-300 uppercase mb-1 opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                  {cat.tagline}
                </p>
                
                <h4 className="text-sm md:text-3xl font-light font-serif text-white/90 mb-1 md:mb-2 transition-transform duration-500 group-hover:-translate-y-1">
                  {cat.name}
                </h4>
              </div>

              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-white/0 group-hover:border-white/30 transition-all duration-500"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-white/0 group-hover:border-white/30 transition-all duration-500"></div>
            </div>
          ))}

          {/* Loading Skeletons */}
          {loading && (
            <>
              {[1, 2].map((_, index) => (
                <div key={`skeleton-${index}`} className={`${(visibleCards + index) === 4 ? 'col-span-2' : 'col-span-1'}`}>
                  <CardSkeleton />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Infinite Scroll Trigger */}
        {hasMore && !loading && (
          <div
            ref={lastCardRef}
            className="w-full h-10 flex items-center justify-center mt-4"
          >
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        )}

        {/* Load More Button (Fallback for older browsers) */}
        {hasMore && (
          <div className="flex justify-center mt-6 md:hidden">
            <button
              onClick={loadMoreCards}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Add shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
        }
      `}</style>
    </section>
  );
};

export default PropertyCategories;