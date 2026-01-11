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

  const slides = [
    {
      id: 1,
      image: 'https://static.ieplads.com/bmsjs/banners/99acres-hp/1366/1366-casagrand-pongal-campaign.webp',
      mobileImage: 'https://static.ieplads.com/bmsjs/banners/99acres-hp/360m/360-m-casagrand-pongal-campaign.webp',
      title: 'Professional Borewell Services',
      description: 'Expert drilling solutions for your water needs',
      cta: 'Book Now',
      badge: 'New Launch'
    },
    {
      id: 2,
      image: 'https://static.ieplads.com/bmsjs/banners/99acres-hp/1366/1366-casagrand-pongal-campaign.webp',
      mobileImage: 'https://static.ieplads.com/bmsjs/banners/99acres-hp/360m/360-m-casagrand-pongal-campaign.webp',
      title: 'Premium Home Interiors',
      description: 'Transform your space with stunning designs',
      cta: 'Get Started',
      badge: 'Featured'
    },
    {
      id: 3,
      image: 'https://static.ieplads.com/bmsjs/banners/99acres-hp/1366/1366-casagrand-pongal-campaign.webp',
      mobileImage: 'https://static.ieplads.com/bmsjs/banners/99acres-hp/360m/360-m-casagrand-pongal-campaign.webp',
      title: 'Reliable Packers & Movers',
      description: 'Safe and efficient relocation services',
      cta: 'Request Quote',
      badge: 'Limited Time'
    },
    {
      id: 4,
      image: 'https://static.ieplads.com/bmsjs/banners/99acres-hp/1366/1366-casagrand-pongal-campaign.webp',
      mobileImage: 'https://static.ieplads.com/bmsjs/banners/99acres-hp/360m/360-m-casagrand-pongal-campaign.webp',
      title: 'Expert Plumbing Services',
      description: '24/7 emergency plumbing solutions',
      cta: 'Call Now',
      badge: 'Hot Deal'
    },
    {
      id: 5,
      image: 'https://static.ieplads.com/bmsjs/banners/99acres-hp/1366/1366-casagrand-pongal-campaign.webp',
      mobileImage: 'https://static.ieplads.com/bmsjs/banners/99acres-hp/360m/360-m-casagrand-pongal-campaign.webp',
      title: 'Professional Home Painting',
      description: 'Quality painting with premium finishes',
      cta: 'Schedule Visit',
      badge: 'Popular'
    }
  ];

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Touch handlers for swipe
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

  // Auto-play functionality
  useEffect(() => {
    let intervalId;
    if (isPlaying && !isHovering) {
      intervalId = setInterval(goToNext, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, isHovering, goToNext]);

  // Keyboard navigation
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

  // Desktop Carousel
  const renderDesktopCarousel = () => (
    <div className="w-full h-[50vh]">
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
                    className="w-full h-full object-cover"
                    loading={index === currentIndex ? 'eager' : 'lazy'}
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" /> */}
                </div>
              </div>
            ))}

            <button
              onClick={goToPrev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12
                bg-white/10 backdrop-blur-md hover:bg-white/25 border border-white/20
                rounded-full items-center justify-center transition-all duration-300
                opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </button>

            <button
              onClick={goToNext}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12
                bg-white/10 backdrop-blur-md hover:bg-white/25 border border-white/20
                rounded-full items-center justify-center transition-all duration-300
                opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </button>

            {/* <button
              onClick={togglePlayPause}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10
                bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/20
                rounded-full flex items-center justify-center transition-all duration-300
                hover:scale-110 active:scale-95 z-20 shadow-xl"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" />
              )}
            </button> */}

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
                  {index === currentIndex && (
                    <div className="absolute inset-0 animate-ping">
                      <Circle className="w-3 h-3 text-white opacity-40" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-1 
            bg-black/40 backdrop-blur-md rounded border border-white/20 text-white 
            text-xs sm:text-sm font-medium z-20 shadow-lg">
            {currentIndex + 1} / {slides.length}
          </div> */}
        </div>
      </div>
    </div>
  );

  // Mobile Carousel - Compact Vertical Layout
  const renderMobileCarousel = () => (
    <div className="w-full bg-white">
      {/* Mobile Header */}
      {/* <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <h1 className="text-lg font-bold text-gray-900">Featured Properties</h1>
        </div>
        <button
          onClick={togglePlayPause}
          className="p-2 bg-gray-100 rounded-full"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-gray-600" />
          ) : (
            <Play className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div> */}

      {/* Mobile Slides */}
      <div className="relative">
        {/* Current Slide */}
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
                index === currentIndex
                  ? 'opacity-100'
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.mobileImage}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
         
              {/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-4">
          
                  <div className="mb-2">
                    <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {slide.badge}
                    </span>
                  </div>
                 
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {slide.title}
                  </h3>
  
                  <p className="text-white/90 text-sm mb-4 line-clamp-2">
                    {slide.description}
                  </p>
                  
             
                  <button className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors">
                    {slide.cta}
                  </button>
                </div>
              </div> */}
            </div>
          ))}
          
          {/* Mobile Navigation */}
          {/* <div className="absolute bottom-20 left-4 right-4 flex items-center justify-between">
            <button
              onClick={goToPrev}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div> */}
        </div>

        {/* Slide Indicators - Horizontal */}
        {/* <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-2 mb-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="focus:outline-none"
              >
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-600 scale-125' 
                    : 'bg-gray-300'
                }`} />
              </button>
            ))}
          </div>
          
          {/* Slide Counter */}
          {/* <div className="text-center text-sm text-gray-600">
            {currentIndex + 1} of {slides.length}
          </div> */}
        {/* </div>  */}

        {/* Thumbnail Previews - Horizontal Scroll */}
        {/* <div className="px-4 pb-4">
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-thin">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  index === currentIndex
                    ? 'border-blue-500 scale-105'
                    : 'border-gray-200 opacity-70'
                }`}
              >
                <img
                  src={slide.mobileImage}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-blue-500/20" />
                )}
              </button>
            ))}
          </div>
        </div> */}

        {/* Quick Info Cards */}
        {/* <div className="px-4 pb-6 space-y-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Instant Booking</h4>
                <p className="text-sm text-gray-600">Book viewing in 2 minutes</p>
              </div>
              <ChevronUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Verified Properties</h4>
                <p className="text-sm text-gray-600">100% verified listings</p>
              </div>
              <ChevronUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div> */}
      </div>

      {/* Mobile Menu */}
      {/* {showMobileMenu && (
        <div className="fixed inset-0 bg-white z-50 pt-16">
          <div className="p-4 space-y-4">
            <button 
              onClick={() => setShowMobileMenu(false)}
              className="absolute top-4 right-4 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
            
            {['Buy', 'Rent', 'Commercial', 'Projects', 'Services'].map((item) => (
              <button
                key={item}
                className="w-full text-left py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{item}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );

  return isMobile ? renderMobileCarousel() : renderDesktopCarousel();
};

export default ImprovedCarousel;