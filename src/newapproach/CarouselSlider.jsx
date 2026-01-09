import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Circle, Pause, Play } from 'lucide-react';

const ImprovedCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1615874694520-474822394e73?w=1920&h=1080&fit=crop&crop=center',
      title: 'Professional Borewell Services',
      description: 'Expert drilling solutions for your water needs',
      cta: 'Book Now'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&h=1080&fit=crop&crop=center',
      title: 'Premium Home Interiors',
      description: 'Transform your space with stunning designs',
      cta: 'Get Started'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1920&h=1080&fit=crop&crop=center',
      title: 'Reliable Packers & Movers',
      description: 'Safe and efficient relocation services',
      cta: 'Request Quote'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1920&h=1080&fit=crop&crop=center',
      title: 'Expert Plumbing Services',
      description: '24/7 emergency plumbing solutions',
      cta: 'Call Now'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1614632537423-2cbe351d115d?w=1920&h=1080&fit=crop&crop=center',
      title: 'Professional Home Painting',
      description: 'Quality painting with premium finishes',
      cta: 'Schedule Visit'
    }
  ];

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

  return (
    <div className="w-full  py-4 md:py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[100%] mx-auto sm:max-w-[90%]   px-2 sm:px-4">
        {/* Carousel Container - Larger on mobile */}
        <div className="relative w-full overflow-hidden group">
          <div 
            className="relative w-full rounded-xl md:rounded-2xl shadow-2xl overflow-hidden"
            style={{ 
              paddingBottom: '66.66%', /* 3:4 aspect ratio for mobile (taller) */
              // For tablet and up: 16:9 aspect ratio
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Responsive aspect ratio */}
            <style jsx>{`
              @media (min-width: 768px) {
                .responsive-height {
                  padding-bottom: 56.25% !important; /* 16:9 for desktop */
                }
              }
              @media (min-width: 640px) and (max-width: 767px) {
                .responsive-height {
                  padding-bottom: 60% !important; /* Slightly taller on tablet */
                }
              }
            `}</style>

            {/* Slides */}
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
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    loading={index === currentIndex ? 'eager' : 'lazy'}
                  />
                  {/* Gradient Overlay - Darker for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
                </div>

                {/* Content Overlay - Moved higher on mobile */}
               
              </div>
            ))}

            {/* Mobile Navigation Arrows - Always visible */}
            {/* <div className="md:hidden absolute inset-y-0 flex items-center justify-between w-full px-3 z-10">
              <button
                onClick={goToPrev}
                className="w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30
                  rounded-full flex items-center justify-center transition-all duration-300
                  active:scale-95 shadow-xl"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={goToNext}
                className="w-12 h-12 bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30
                  rounded-full flex items-center justify-center transition-all duration-300
                  active:scale-95 shadow-xl"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div> */}

            {/* Desktop Navigation Arrows */}
            <button
              onClick={goToPrev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 lg:w-14 lg:h-14
                bg-white/10 backdrop-blur-md hover:bg-white/25 border border-white/20
                rounded-full items-center justify-center transition-all duration-300
                opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </button>

            <button
              onClick={goToNext}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 lg:w-14 lg:h-14
                bg-white/10 backdrop-blur-md hover:bg-white/25 border border-white/20
                rounded-full items-center justify-center transition-all duration-300
                opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </button>

            {/* Play/Pause Button - Larger on mobile */}
            <button
              onClick={togglePlayPause}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14
                bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/20
                rounded-full flex items-center justify-center transition-all duration-300
                hover:scale-110 active:scale-95 z-20 shadow-xl"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              ) : (
                <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-0.5" />
              )}
            </button>

            {/* Progress Bar - Thicker on mobile */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-white/20 z-10">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-linear"
                style={{ 
                  width: `${((currentIndex + 1) / slides.length) * 100}%`,
                  transition: isPlaying ? 'width 4s linear' : 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Slide Indicators - Larger and spaced on mobile */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="focus:outline-none transition-all duration-300 active:scale-125"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className="relative">
                  <Circle 
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                      index === currentIndex 
                        ? 'text-white fill-white scale-125' 
                        : 'text-white/60 fill-white/40 hover:text-white/80 hover:fill-white/60'
                    }`}
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 animate-ping">
                      <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-40" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Slide Counter - Larger on mobile */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-3 py-1.5 sm:px-4 sm:py-2 
            bg-black/40 backdrop-blur-md rounded-lg border border-white/20 text-white 
            text-sm sm:text-base font-medium z-20 shadow-lg">
            {currentIndex + 1} / {slides.length}
          </div>
        </div>

        {/* Thumbnail Preview - Hidden on mobile */}
        <div className="hidden lg:flex justify-center gap-4 mt-8">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`relative w-28 h-20 rounded-lg overflow-hidden transition-all duration-300 
                transform hover:scale-110 hover:shadow-xl active:scale-95 ${
                  index === currentIndex 
                    ? 'ring-3 ring-blue-500 ring-offset-2 ring-offset-white scale-105' 
                    : 'opacity-60 hover:opacity-100'
                }`}
            >
              <img
                src={slide.image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-500/20" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImprovedCarousel;


// import React, { useState, useEffect, useCallback } from 'react';
// import { ChevronLeft, ChevronRight, Circle, Pause, Play } from 'lucide-react';

// const CarouselSlider = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isHovering, setIsHovering] = useState(false);

//   const slides = [
//     {
//       id: 1,
//       image: 'https://images.unsplash.com/photo-1615874694520-474822394e73?w=1920&h=1080&fit=crop&crop=center',
//       title: 'Luxury Villa with Ocean View',
//       description: 'Experience luxury living with breathtaking ocean views',
//       cta: 'Explore Properties'
//     },
//     {
//       id: 2,
//       image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&h=1080&fit=crop&crop=center',
//       title: 'Modern Apartment Complex',
//       description: 'Contemporary design meets urban convenience',
//       cta: 'View Apartments'
//     },
//     {
//       id: 3,
//       image: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1920&h=1080&fit=crop&crop=center',
//       title: 'Premium Commercial Spaces',
//       description: 'Prime locations for business success',
//       cta: 'Commercial Listings'
//     },
//     {
//       id: 4,
//       image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1920&h=1080&fit=crop&crop=center',
//       title: 'Luxury Penthouse Suites',
//       description: 'Top-floor living with panoramic city views',
//       cta: 'Discover Penthouses'
//     },
//     {
//       id: 5,
//       image: 'https://images.unsplash.com/photo-1614632537423-2cbe351d115d?w=1920&h=1080&fit=crop&crop=center',
//       title: 'Green Living Communities',
//       description: 'Sustainable living in harmony with nature',
//       cta: 'Eco Properties'
//     }
//   ];

//   const goToSlide = useCallback((index) => {
//     setCurrentIndex(index);
//   }, []);

//   const goToNext = useCallback(() => {
//     setCurrentIndex((prevIndex) => 
//       prevIndex === slides.length - 1 ? 0 : prevIndex + 1
//     );
//   }, [slides.length]);

//   const goToPrev = useCallback(() => {
//     setCurrentIndex((prevIndex) => 
//       prevIndex === 0 ? slides.length - 1 : prevIndex - 1
//     );
//   }, [slides.length]);

//   // Auto-play functionality
//   useEffect(() => {
//     let intervalId;
//     if (isPlaying && !isHovering) {
//       intervalId = setInterval(goToNext, 5000);
//     }
//     return () => {
//       if (intervalId) clearInterval(intervalId);
//     };
//   }, [isPlaying, isHovering, goToNext]);

//   // Keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.key === 'ArrowLeft') goToPrev();
//       if (e.key === 'ArrowRight') goToNext();
//       if (e.key === ' ') {
//         e.preventDefault();
//         setIsPlaying(prev => !prev);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [goToPrev, goToNext]);

//   const togglePlayPause = () => {
//     setIsPlaying(prev => !prev);
//   };

//   return (
//     <div className="relative w-full overflow-hidden group">
//       {/* Main Carousel Container */}
//       <div 
//         className="relative w-full h-0 pb-[56.25%] overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl"
//         onMouseEnter={() => setIsHovering(true)}
//         onMouseLeave={() => setIsHovering(false)}
//       >
//         {/* Slides */}
//         {slides.map((slide, index) => (
//           <div
//             key={slide.id}
//             className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
//               index === currentIndex
//                 ? 'opacity-100 translate-x-0'
//                 : index < currentIndex
//                 ? 'opacity-0 -translate-x-full'
//                 : 'opacity-0 translate-x-full'
//             }`}
//           >
//             {/* Background Image with Overlay */}
//             <div className="absolute inset-0">
//               <img
//                 src={slide.image}
//                 alt={slide.title}
//                 className="w-full h-full object-cover"
//                 loading={index === currentIndex ? 'eager' : 'lazy'}
//               />
//               {/* Gradient Overlay */}
//               <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
//               <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
//             </div>

//             {/* Content Overlay */}
//             <div className="absolute inset-0 flex items-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
//               <div className="max-w-4xl text-white">
//                 <div className="transform transition-all duration-1000 delay-300">
//                   {/* Badge */}
//                   <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
//                     <span className="text-xs md:text-sm font-semibold tracking-wide">
//                       PREMIUM LISTING
//                     </span>
//                   </div>

//                   {/* Title */}
//                   <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 leading-tight">
//                     {slide.title}
//                   </h2>

//                   {/* Description */}
//                   <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 md:mb-8 max-w-2xl">
//                     {slide.description}
//                   </p>

//                   {/* CTA Button */}
//                   <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 
//                     hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg md:rounded-xl 
//                     font-semibold text-sm sm:text-base md:text-lg transition-all shadow-2xl 
//                     hover:shadow-3xl hover:scale-105 transform duration-300">
//                     {slide.cta}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* Navigation Arrows */}
//         <button
//           onClick={goToPrev}
//           className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
//             bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20
//             rounded-full flex items-center justify-center transition-all duration-300
//             opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl"
//           aria-label="Previous slide"
//         >
//           <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//         </button>

//         <button
//           onClick={goToNext}
//           className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
//             bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20
//             rounded-full flex items-center justify-center transition-all duration-300
//             opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl"
//           aria-label="Next slide"
//         >
//           <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//         </button>

//         {/* Play/Pause Button */}
//         <button
//           onClick={togglePlayPause}
//           className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12
//             bg-black/50 backdrop-blur-md hover:bg-black/70 border border-white/20
//             rounded-full flex items-center justify-center transition-all duration-300
//             hover:scale-110 hover:shadow-xl z-20"
//           aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
//         >
//           {isPlaying ? (
//             <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//           ) : (
//             <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//           )}
//         </button>

//         {/* Progress Bar */}
//         <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
//           <div 
//             className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-linear"
//             style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
//           />
//         </div>
//       </div>

//       {/* Slide Indicators */}
//       <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
//         {slides.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => goToSlide(index)}
//             className="focus:outline-none transition-all duration-300"
//             aria-label={`Go to slide ${index + 1}`}
//           >
//             <div className="relative">
//               <Circle 
//                 className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${
//                   index === currentIndex 
//                     ? 'text-white fill-white' 
//                     : 'text-white/50 fill-white/30'
//                 }`}
//               />
//               {index === currentIndex && (
//                 <div className="absolute inset-0 animate-ping">
//                   <Circle className="w-3 h-3 sm:w-4 sm:h-4 text-white opacity-30" />
//                 </div>
//               )}
//             </div>
//           </button>
//         ))}
//       </div>

//       {/* Slide Counter */}
//       <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-md 
//         rounded-lg border border-white/20 text-white text-xs sm:text-sm font-medium">
//         {currentIndex + 1} / {slides.length}
//       </div>

//       {/* Thumbnail Preview (Desktop Only) */}
//       <div className="hidden lg:block absolute -bottom-20 left-1/2 -translate-x-1/2 w-full max-w-4xl">
//         <div className="flex justify-center gap-2">
//           {slides.map((slide, index) => (
//             <button
//               key={slide.id}
//               onClick={() => goToSlide(index)}
//               className={`relative w-20 h-12 rounded-lg overflow-hidden transition-all duration-300 
//                 transform hover:scale-110 hover:shadow-xl ${
//                   index === currentIndex 
//                     ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' 
//                     : 'opacity-70 hover:opacity-100'
//                 }`}
//             >
//               <img
//                 src={slide.image}
//                 alt={`Thumbnail ${index + 1}`}
//                 className="w-full h-full object-cover"
//               />
//               {/* Overlay on active */}
//               {index === currentIndex && (
//                 <div className="absolute inset-0 bg-blue-500/30" />
//               )}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CarouselSlider;