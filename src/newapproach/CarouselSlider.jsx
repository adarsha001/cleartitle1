import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Circle, Pause, Play, Menu, X, ChevronUp, ChevronDown } from 'lucide-react';

const ImprovedCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New state for skeleton

  const slides = [
    {
      id: 2,
      image: 'image1.jpeg',
      mobileImage: '/image2.jpeg',
      title: 'Premium Home Interiors',
      description: 'Transform your space with stunning designs',
      cta: 'Get Started',
      badge: 'Featured'
    },  {
      id: 3,
      image: 'image1.jpeg',
      mobileImage: '/image2.jpeg',
      title: 'Premium Home Interiors',
      description: 'Transform your space with stunning designs',
      cta: 'Get Started',
      badge: 'Featured'
    },
    {
      id: 4,
      image: 'image1.jpeg',
      mobileImage: '/image2.jpeg',
      title: 'Premium Home Interiors',
      description: 'Transform your space with stunning designs',
      cta: 'Get Started',
      badge: 'Featured'
    },
  
  ];

// High-Attention Skeleton Loader Component
  const Skeleton = () => (
    <div className={`w-full ${isMobile ? 'h-[35vh]' : 'h-[50vh]'} bg-slate-100 relative overflow-hidden flex items-center justify-center`}>
      {/* Primary Shimmer Layer */}
      <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent z-10" />
      
      {/* Secondary Depth Layer */}
      <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite_delay-200] bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />

      {/* Center Decorative Branding (Attracts the eye to the center) */}
      <div className="relative z-30 flex flex-col items-center gap-3 opacity-20">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <span className="text-xs font-bold tracking-[0.3em] text-slate-900 uppercase">Loading Experience</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .delay-200 { animation-delay: 0.2s; }
      `}} />
      
      {/* Bottom Progress Indicator Placeholder */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200">
        <div className="h-full bg-blue-600/30 animate-[progress_2s_infinite]" style={{width: '30%'}} />
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { width: 0%; left: 0%; }
          50% { width: 50%; left: 25%; }
          100% { width: 0%; left: 100%; }
        }
      `}} />
    </div>
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Image Preloading Logic
    const preloadImages = async () => {
      const promises = slides.map((slide) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = isMobile ? slide.mobileImage : slide.image;
          img.onload = resolve;
          img.onerror = resolve; // Continue even if one fails
        });
      });
      await Promise.all(promises);
      setIsLoading(false);
    };

    preloadImages();

    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile, slides]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  }, [slides.length]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      goToNext();
    }
    if (touchStart - touchEnd < -75) {
      goToPrev();
    }
  };

  useEffect(() => {
    let intervalId;
    if (isPlaying && !isHovering && !isLoading) {
      intervalId = setInterval(goToNext, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, isHovering, goToNext, isLoading]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const renderDesktopCarousel = () => (
    <div className="w-full h-[50vh] shadow-transparent relative">
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/30 via-black/10 to-transparent pointer-events-none z-30 transition-opacity duration-300"></div>
      <div className="h-full">
        <div className="relative w-full h-full overflow-hidden group">
          <div 
            className="relative w-full h-full shadow-2xl overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-transform duration-500 ease-out ${
                  index === currentIndex
                    ? 'translate-x-0 opacity-100'
                    : index < currentIndex
                    ? '-translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
                }`}
              >
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-center"
                    loading={index === currentIndex ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={goToPrev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md hover:bg-white/25 border border-white/20 rounded-full items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl z-40"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </button>

            <button
              onClick={goToNext}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md hover:bg-white/25 border border-white/20 rounded-full items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl z-40"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-linear"
                style={{ 
                  width: `${((currentIndex + 1) / slides.length) * 100}%`,
                  transition: isPlaying ? 'width 4s linear' : 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="focus:outline-none transition-all duration-300 active:scale-125"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className="relative">
                  <Circle 
                    className={`w-3 h-3 transition-all duration-300 ${
                      index === currentIndex 
                        ? 'text-white fill-white scale-125' 
                        : 'text-white/60 fill-white/40 hover:text-white/80 hover:fill-white/60'
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobileCarousel = () => (
    <div className="w-full bg-white">
      <div className="relative">
        <div 
          className="relative h-[35vh] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.mobileImage}
                alt={slide.title}
                className="w-full h-full object-center"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Return Skeleton if still loading, otherwise return the carousel
  if (isLoading) return <Skeleton />;

  return isMobile ? renderMobileCarousel() : renderDesktopCarousel();
};

export default ImprovedCarousel;