import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const ServicesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const services = [
    {
      title: "Borewell",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=700&fit=crop",
      description: "Professional borewell drilling and maintenance services with modern equipment and certified experts.",
      details: "We provide complete water solutions including deep drilling, water testing, motor installation, and regular maintenance for both residential and commercial properties."
    },
    {
      title: "Home Interior",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=700&fit=crop",
      description: "Transform your space with elegant interior designs and professional execution.",
      details: "From concept to completion, our interior designers work with you to create beautiful, functional spaces that reflect your personality and lifestyle."
    },
    {
      title: "Packers & Movers",
      image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400&h=700&fit=crop",
      description: "Safe and reliable relocation services with trained professionals.",
      details: "We handle everything from packing your belongings with care to transportation and unpacking at your new location with minimal stress."
    },
    {
      title: "Plumber",
      image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=700&fit=crop",
      description: "Expert plumbing solutions for all your residential and commercial needs.",
      details: "Emergency plumbing, pipe repairs, installations, and maintenance services available 24/7 with licensed professionals."
    },
    {
      title: "Electrician",
      image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=700&fit=crop",
      description: "Certified electricians for wiring, repairs, and electrical installations.",
      details: "From simple repairs to complete electrical installations, our certified electricians ensure safety and quality in every job."
    },
    {
      title: "Carpenter",
      image: "https://images.unsplash.com/photo-1591805494165-6f0d5c5d3813?w=400&h=700&fit=crop",
      description: "Custom woodwork and furniture solutions with precision craftsmanship.",
      details: "Custom furniture, repairs, installations, and polishing services by skilled carpenters using quality materials."
    },
    {
      title: "Legal Service",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=700&fit=crop",
      description: "Professional legal consultation and support for all your needs.",
      details: "Legal documentation, consultation, court representation, and advice from qualified lawyers across various domains."
    },
    {
      title: "Full House Cleaning",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=700&fit=crop",
      description: "Complete home cleaning and sanitization services.",
      details: "Deep cleaning, sanitization, carpet cleaning, window cleaning, and organization services using eco-friendly products."
    },
    {
      title: "Home Painting",
      image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=700&fit=crop",
      description: "Quality interior and exterior painting services for a fresh look.",
      details: "Professional painting services including surface preparation, primer application, and final coats with premium quality paints."
    },
    {
      title: "AC Repair",
      image: "https://images.unsplash.com/photo-1631545806609-c2f4e0a29939?w=400&h=700&fit=crop",
      description: "Fast and efficient AC repair, maintenance, and installation.",
      details: "Expert repair, maintenance, gas charging, and installation services for all AC brands and models with certified technicians."
    },
    {
      title: "Pest Control",
      image: "https://images.unsplash.com/photo-1626509653291-18d6b724e6fe?w=400&h=700&fit=crop",
      description: "Effective pest elimination and prevention treatments.",
      details: "Rodent control, insect elimination, termite proofing, and regular follow-up services using safe, approved methods."
    },
    {
      title: "Appliance Repair",
      image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=700&fit=crop",
      description: "Expert repair for all home appliances with genuine parts.",
      details: "Repair services for washing machines, refrigerators, microwaves, ovens, and other appliances by skilled technicians."
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Auto-slide every 8 seconds
  useEffect(() => {
    let intervalId;
    
    if (isAutoPlaying) {
      intervalId = setInterval(() => {
        nextSlide();
      }, 8000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoPlaying, currentIndex]);

  // Progress bar effect
  useEffect(() => {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      
      setTimeout(() => {
        progressBar.style.transition = 'width 8s linear';
        progressBar.style.width = '100%';
      }, 50);
    }
  }, [currentIndex]);

  return (
    <div className="min-h-screen hidden lg:flex bg-gradient-to-br from-gray-50 to-amber-50 items-center justify-center p-4">
      <div className="w-full max-w-md lg:max-w-lg xl:max-w-2xl">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-4 lg:mb-6 text-gray-800 px-4">
          Our Premium Services
        </h2>
        
        <div className="relative px-4 lg:px-8">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-4 lg:mb-6">
            <div 
              id="progress-bar"
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
              style={{ width: '0%' }}
            ></div>
          </div>

          {/* Card Container */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl mx-auto max-w-sm lg:max-w-md">
            <div className="relative h-3/5 overflow-hidden">
              <img 
                src={services[currentIndex].image} 
                alt={services[currentIndex].title}
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              <div className="absolute top-4 left-6">
                <span className="text-amber-400 text-sm font-semibold bg-black/30 px-3 py-1 rounded-full">
                  Service {currentIndex + 1} of {services.length}
                </span>
              </div>
              
              <h3 className="absolute bottom-4 left-6 text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
                {services[currentIndex].title}
              </h3>
            </div>
            
            <div className="p-4 lg:p-6 h-2/5 flex flex-col justify-between">
              <div>
                <p className="text-gray-700 text-base lg:text-lg font-medium leading-relaxed mb-2 lg:mb-3">
                  {services[currentIndex].description}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {services[currentIndex].details}
                </p>
              </div>
              
              <div className="flex gap-3 mt-3 lg:mt-4">
                <button className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-semibold py-2 lg:py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 lg:hover:-translate-y-1 text-sm lg:text-base">
                  Book Now
                </button>
                <button 
                  onClick={toggleAutoPlay}
                  className="px-3 lg:px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-300"
                  aria-label={isAutoPlaying ? "Pause auto-rotation" : "Play auto-rotation"}
                >
                  {isAutoPlaying ? <Pause className="w-4 h-4 lg:w-5 lg:h-5" /> : <Play className="w-4 h-4 lg:w-5 lg:h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button 
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-12 xl:-translate-x-16 bg-white/90 hover:bg-amber-400 rounded-full p-2 lg:p-3 shadow-xl transition-all duration-300 hover:scale-110 z-10"
            aria-label="Previous service"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-800" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-12 xl:translate-x-16 bg-white/90 hover:bg-amber-400 rounded-full p-2 lg:p-3 shadow-xl transition-all duration-300 hover:scale-110 z-10"
            aria-label="Next service"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-gray-800" />
          </button>
        </div>

        {/* Indicators with service names */}
        <div className="mt-6 lg:mt-8 px-4">
          <div className="flex justify-center gap-1 mb-3 lg:mb-4">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 lg:h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'w-6 lg:w-8 bg-amber-400' : 'w-1.5 lg:w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to ${services[index].title}`}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-1.5 lg:gap-2">
            {services.map((service, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs font-medium transition-all duration-300 truncate ${
                  index === currentIndex 
                    ? 'bg-amber-400 text-gray-900 font-bold' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={service.title}
              >
                {service.title}
              </button>
            ))}
          </div>
        </div>

        {/* Status info (optional - uncomment if needed) */}
        {/* <div className="flex justify-between items-center mt-4 lg:mt-6 text-xs lg:text-sm px-4">
          <div className="text-gray-600 font-medium">
            Viewing: <span className="font-bold text-gray-800">{currentIndex + 1}/{services.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-gray-600">
              Auto: <span className="font-medium">{isAutoPlaying ? 'ON' : 'OFF'}</span>
            </span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ServicesCarousel;