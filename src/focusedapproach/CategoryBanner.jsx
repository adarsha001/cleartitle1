// components/CategoryBanner.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Circle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import carouselService from '../api/carouselApi';

const CategoryBanner = ({ categoryId, categoryName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [slides, setSlides] = useState([]);
  const navigate = useNavigate();

  // Fetch category-specific slides from API with fallback to main banners
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setIsLoading(true);
        
        // First try to fetch category-specific images
        let response = await carouselService.getImages({ 
          propertyType: categoryId,
          isActive: true,
          limit: 10
        });
        
        // If no category images found, fallback to main banners
        if (!response.data?.data || response.data.data.length === 0) {
          console.log(`No images found for ${categoryId}, falling back to main banners`);
          response = await carouselService.getImages({ 
            isMainBanner: true,
            isActive: true,
            limit: 10
          });
        }
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          // Transform API data to match slide format
          const formattedSlides = response.data.data.map(item => ({
            id: item._id,
            image: item.desktopImageUrl,
            mobileImage: item.mobileImageUrl || item.desktopImageUrl,
            title: item.title,
            description: item.description || `Discover premium ${categoryName}`,
            badge: item.isMainBanner ? 'Featured' : (item.propertyType || categoryName),
            link: item.link || '#'
          }));
          
          setSlides(formattedSlides);
        } else {
          // Ultimate fallback: Create a default slide with category info
          setSlides([{
            id: 'default-1',
            image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            mobileImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            title: `Premium ${categoryName}`,
            description: `Discover premium ${categoryName} with world-class amenities`,
            badge: categoryName,
            link: '#'
          }]);
        }
      } catch (err) {
        console.error('Error fetching slides:', err);
        // Fallback to default on error
        setSlides([{
          id: 'default-2',
          image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          mobileImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          title: `Premium ${categoryName}`,
          description: `Discover premium ${categoryName} with world-class amenities`,
          badge: categoryName,
          link: '#'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchSlides();
    }
  }, [categoryId, categoryName]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Image Preloading Logic
    const preloadImages = async () => {
      if (slides.length === 0) return;
      
      const promises = slides.map((slide) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = isMobile ? slide.mobileImage : slide.image;
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      await Promise.all(promises);
      setIsLoading(false);
    };

    if (slides.length > 0) {
      preloadImages();
    }
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

  const handleBannerClick = () => {
    if (slides.length > 0 && slides[currentIndex]?.link && slides[currentIndex].link !== '#') {
      window.open(slides[currentIndex].link, '_blank');
    }
  };

  useEffect(() => {
    let intervalId;
    if (isPlaying && !isHovering && !isLoading && slides.length > 0) {
      intervalId = setInterval(goToNext, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, isHovering, goToNext, isLoading, slides.length]);

  // Skeleton Loader
  const Skeleton = () => (
    <div className={`w-full ${isMobile ? 'h-[35vh]' : 'h-[50vh]'} bg-slate-100 relative overflow-hidden flex items-center justify-center`}>
      <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent z-10" />
      <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite_delay-200] bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
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

  if (isLoading) return <Skeleton />;
  if (slides.length === 0) return <Skeleton />;

  // Desktop Carousel
  const renderDesktopCarousel = () => (
    <div className="w-full h-[30vh] shadow-transparent relative">
      {/* Back Button - Positioned absolutely on top of the carousel */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(-1);
        }}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/30 via-black/10 to-transparent pointer-events-none z-30 transition-opacity duration-300"></div>
      <div className="h-full">
        <div className="relative w-full h-full overflow-hidden group">
          <div 
            className="relative w-full h-full shadow-2xl overflow-hidden cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleBannerClick}
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
                </div>
                
                {/* Category Badge - Top Right */}
                <div className="absolute top-4 right-4 z-40">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full border border-white/30">
                    {slide.badge}
                  </span>
                </div>
              </div>
            ))}

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md hover:bg-white/25 border border-white/20 rounded-full items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl z-40"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
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

  // Mobile Carousel
  const renderMobileCarousel = () => (
    <div className="w-full bg-white">
      <div className="relative">
        {/* Mobile Back Button */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(-1);
            }}
            className="p-2 bg-black/20 backdrop-blur-sm rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        <div 
          className="relative h-[35vh] overflow-hidden cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleBannerClick}
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
                className="w-full h-full object-cover"
              />
              
              {/* Mobile Badge - Top Right */}
              <div className="absolute top-4 right-4 z-40">
                <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full border border-white/30">
                  {slide.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return isMobile ? renderMobileCarousel() : renderDesktopCarousel();
};

export default CategoryBanner;