import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ServiceCategoriesScroll = () => {
  const scrollContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  const categories = [
    {
      id: 1,
      name: 'Borewell',
      image: 'https://images.unsplash.com/photo-1580217357762-0e1b75443b1b?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 2,
      name: 'Home Interior',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 3,
      name: 'Packers & Movers',
      image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 4,
      name: 'Plumber',
      image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 5,
      name: 'Electrician',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 6,
      name: 'Carpenter',
      image: 'https://images.unsplash.com/photo-1589923186741-b7d59d6b2c4d?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 7,
      name: 'Legal Service',
      image: 'https://images.unsplash.com/photo-1589391886085-8b6b0ac72a1a?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 8,
      name: 'Full House Cleaning',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 9,
      name: 'Home Painting',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 10,
      name: 'AC Repair',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 11,
      name: 'Pest Control',
      image: 'https://images.unsplash.com/photo-1622122201717-6f31d6c2c8e8?w=400&h=400&fit=crop&crop=center'
    },
    {
      id: 12,
      name: 'Appliance Repair',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
    }
  ];

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Check if content overflows on desktop
      if (!mobile && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const hasOverflow = container.scrollWidth > container.clientWidth;
        setShowScrollButtons(hasOverflow);
      } else {
        setShowScrollButtons(mobile);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Also check after images load
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    const handleImageLoad = () => {
      loadedImages++;
      if (loadedImages === images.length) {
        checkMobile();
      }
    };

    images.forEach(img => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
      }
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      images.forEach(img => img.removeEventListener('load', handleImageLoad));
    };
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? 200 : 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50 py-6 md:py-12">
      <div className="container mx-auto  px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
              Order our best services
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Professional services at your doorstep
            </p>
          </div>
          
          {/* Show scroll buttons only when needed or on mobile */}
          {(showScrollButtons || isMobile) && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-50 border border-gray-100"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} className="sm:w-5 sm:h-5 text-gray-700" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-gray-50 border border-gray-100"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} className="sm:w-5 sm:h-5 text-gray-700" />
              </button>
            </div>
          )}
        </div>

        {/* Categories Container */}
        <div className="relative">
          {/* Gradient overlays - only show when scrolling is needed */}
          {showScrollButtons && (
            <>
              <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            </>
          )}

          {/* Desktop: Grid layout when no scrolling needed */}
          {!showScrollButtons && !isMobile ? (
            <div className="hidden lg:flex gap-6">
              {categories.slice(0, 12).map((category) => (
                <div
                  key={category.id}
                  className="cursor-pointer group transform transition-transform duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full bg-white shadow-md hover:shadow-xl 
                      transition-all duration-300 flex items-center justify-center mb-3 
                      overflow-hidden border-2 border-white hover:border-blue-100">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-800 text-center">
                      {category.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Mobile or when scrolling is needed: Horizontal scroll
            <div
              ref={scrollContainerRef}
              className={`flex ${
                isMobile ? 'gap-3' : 'gap-4 md:gap-6'
              } overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex-shrink-0 cursor-pointer group transform transition-transform duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center">
                    <div className={`${
                      isMobile ? 'w-20 h-20' : 
                      showScrollButtons ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-32 h-32'
                    } rounded-full bg-white shadow-md hover:shadow-xl 
                      transition-all duration-300 flex items-center justify-center mb-2 sm:mb-3 
                      overflow-hidden border-2 border-white hover:border-blue-100`}>
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <p className={`${
                      isMobile ? 'text-xs' : 'text-sm'
                    } font-medium text-gray-800 text-center ${
                      showScrollButtons ? 'max-w-[100px] sm:max-w-[110px] md:max-w-[130px]' : ''
                    } truncate`}>
                      {category.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scroll indicator dots for mobile only */}
          {isMobile && (
            <div className="flex justify-center gap-1 mt-4">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Button - Always show */}
   
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 768px) {
          .scrollbar-hide {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 transparent;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: block;
            height: 6px;
          }
          .scrollbar-hide::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
          }
          .scrollbar-hide::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .scrollbar-hide::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        }
      `}</style>
    </div>
  );
};

export default ServiceCategoriesScroll;