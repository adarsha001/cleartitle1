// components/SectionCarousel.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cardAdApi } from '../api/cardAdApi';

const SectionCarousel = ({ 
  sectionId,
  autoplaySpeed = 5000, 
  showControls = true,
  showDots = false,
  className = '',
  onAdClick = null,
  onAdView = null,
  size = 'medium'
}) => {

  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef(null);

  // Size configurations
  const getSizeClasses = () => {
    switch(size) {
      case 'small':
        return {
          container: 'py-2 px-2 md:px-4',
          height: 'h-[120px] md:h-[150px] lg:h-[180px]',
          title: 'text-sm md:text-base',
          description: 'text-xs',
          controls: 'w-6 h-6',
          icon: 'w-3 h-3'
        };
      case 'large':
        return {
          container: 'py-4 px-4 md:px-8',
          height: 'h-[300px] md:h-[400px] lg:h-[500px]',
          title: 'text-xl md:text-3xl lg:text-4xl',
          description: 'text-sm md:text-base lg:text-lg',
          controls: 'w-10 h-10',
          icon: 'w-5 h-5'
        };
      default:
        return {
          container: 'py-3 px-4 md:px-6',
          height: 'h-[200px] md:h-[260px] lg:h-[320px]',
          title: 'text-lg md:text-2xl lg:text-3xl',
          description: 'text-sm md:text-base',
          controls: 'w-8 h-8',
          icon: 'w-4 h-4'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getUserTarget = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return 'guest';
    return 'member';
  }, []);

  // Fetch ads for this section
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setIsLoading(true);
        const target = getUserTarget();
        const res = await cardAdApi.getSectionAds(sectionId, { target, limit: 20 });

        if (res.data.success && res.data.data.length > 0) {
          setAds(res.data.data);
        } else {
          setAds([]);
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
        setAds([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (sectionId) fetchAds();
  }, [sectionId, getUserTarget]);

  // Track view for analytics
  useEffect(() => {
    if (ads.length > 0 && currentIndex < ads.length && onAdView) {
      onAdView(ads[currentIndex]);
    }
  }, [currentIndex, ads, onAdView]);

  const goToNext = useCallback(() => {
    if (ads.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  }, [ads.length]);

  const goToPrev = useCallback(() => {
    if (ads.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  }, [ads.length]);

  // Autoplay
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isPlaying && !isHovering && ads.length > 1 && !isLoading) {
      intervalRef.current = setInterval(goToNext, autoplaySpeed);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, isHovering, goToNext, ads.length, isLoading, autoplaySpeed]);

  const handleAdClick = async () => {
    const ad = ads[currentIndex];
    if (!ad) return;

    try {
      await cardAdApi.trackClick(ad._id);
    } catch (err) {
      console.error('Error tracking click:', err);
    }

    if (ad.link && ad.link !== '#') {
      window.open(ad.link, '_blank');
    }

    if (onAdClick) onAdClick(ad);
  };

  const getAdImage = (ad) => {
    if (!ad) return '';
    if (isMobile && ad.mobileImage) {
      return ad.mobileImage;
    }
    return ad.desktopImage;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`w-full ${sizeClasses.container} ${className}`}>
        <div className="max-w-6xl mx-auto">
          <div className={`relative overflow-hidden rounded-2xl lg:rounded-[2rem] bg-gray-100 ${sizeClasses.height}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (ads.length === 0) return null;

  const currentAd = ads[currentIndex];
  const adImage = getAdImage(currentAd);

  return (
    <div className={`w-full ${sizeClasses.container} ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className={`relative overflow-hidden rounded-2xl lg:rounded-[2rem] bg-gray-100 shadow-md ${sizeClasses.height}`}>
            
            {/* Ad Image - No complex loading state */}
            <div className="w-full h-full cursor-pointer" onClick={handleAdClick}>
              <img
                src={adImage}
                alt={currentAd.overlayTitle || 'Advertisement'}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Slide Counter */}
            {ads.length > 1 && (
              <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-white text-xs font-medium">
                  {currentIndex + 1} / {ads.length}
                </span>
              </div>
            )}

            {/* Overlay Text */}
            {(currentAd.overlayTitle || currentAd.overlayDescription) && (
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-6 lg:p-8 cursor-pointer"
                onClick={handleAdClick}
              >
                <div className="max-w-xl">
                  {currentAd.overlayTitle && (
                    <h3 className={`text-white font-bold mb-1 md:mb-2 leading-tight ${sizeClasses.title}`}>
                      {currentAd.overlayTitle}
                    </h3>
                  )}
                  {currentAd.overlayDescription && (
                    <p className={`text-white/90 mb-2 md:mb-3 line-clamp-2 ${sizeClasses.description}`}>
                      {currentAd.overlayDescription}
                    </p>
                  )}
                  {currentAd.ctaText && (
                    <button className="bg-white text-gray-900 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold w-fit hover:bg-gray-100 transition transform hover:scale-105">
                      {currentAd.ctaText}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Badge */}
            {currentAd.badgeText && (
              <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 md:px-3 md:py-1.5 shadow-lg">
                  <span className="text-[10px] md:text-xs font-semibold text-gray-800">
                    {currentAd.badgeText}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            {showControls && ads.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                    setIsPlaying(false);
                    setTimeout(() => {
                      if (!isHovering) setIsPlaying(true);
                    }, 10000);
                  }}
                  className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 ${sizeClasses.controls} bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20`}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className={`text-white ${sizeClasses.icon}`} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                    setIsPlaying(false);
                    setTimeout(() => {
                      if (!isHovering) setIsPlaying(true);
                    }, 10000);
                  }}
                  className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 ${sizeClasses.controls} bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20`}
                  aria-label="Next slide"
                >
                  <ChevronRight className={`text-white ${sizeClasses.icon}`} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                  className={`absolute bottom-2 right-2 md:bottom-3 md:right-3 ${sizeClasses.controls} bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-20`}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className={`text-white ${sizeClasses.icon}`} />
                  ) : (
                    <Play className={`text-white ${sizeClasses.icon}`} />
                  )}
                </button>

                {showDots && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2 z-20">
                    {ads.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(idx);
                          setIsPlaying(false);
                          setTimeout(() => {
                            if (!isHovering) setIsPlaying(true);
                          }, 10000);
                        }}
                        className={`transition-all duration-300 rounded-full ${
                          idx === currentIndex
                            ? 'w-4 md:w-6 h-1 bg-white'
                            : 'w-1 h-1 bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionCarousel;