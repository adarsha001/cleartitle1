import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Clock, CheckCircle, Users, Shield, Home, Wrench, Truck, Droplet, Hammer, Scale, PaintBucket, Wind, Bug, Cpu } from 'lucide-react';

const ServiceSlideShow = () => {
  const [activeService, setActiveService] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const services = [
    {
      id: 1,
      title: 'Borewell',
      description: 'Professional borewell drilling and maintenance services with modern equipment. We provide complete water solutions for residential and commercial properties.',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Deep Drilling', 'Water Testing', 'Motor Installation', 'Maintenance'],
      rating: 4.8,
      time: '2-3 Days',
      professionals: 'Certified Experts',
      icon: Droplet
    },
    {
      id: 2,
      title: 'Home Interior',
      description: 'Complete home interior solutions from design to execution. Transform your space with our expert designers and craftsmen.',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['3D Design', 'Material Selection', 'Project Management', 'Post-Service Support'],
      rating: 4.9,
      time: '30-45 Days',
      professionals: 'Design Experts',
      icon: Home
    },
    {
      id: 3,
      title: 'Packers & Movers',
      description: 'Safe and efficient relocation services. We handle everything from packing to unpacking with utmost care.',
      image: 'https://images.unsplash.com/photo-1623298317882-8e6a5d21c50c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Packing', 'Loading', 'Transportation', 'Unpacking'],
      rating: 4.7,
      time: '1 Day',
      professionals: 'Trained Team',
      icon: Truck
    },
    {
      id: 4,
      title: 'Plumber',
      description: '24/7 emergency plumbing services for all your needs. From leaks to installations, we handle it all.',
      image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Emergency Service', 'Pipe Repair', 'Installation', 'Maintenance'],
      rating: 4.6,
      time: '2-4 Hours',
      professionals: 'Licensed Plumbers',
      icon: Wrench
    },
    {
      id: 5,
      title: 'Electrician',
      description: 'Certified electrical services for homes and businesses. Safety and quality guaranteed.',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Wiring', 'Installation', 'Repairs', 'Safety Checks'],
      rating: 4.7,
      time: '3-6 Hours',
      professionals: 'Certified Electricians',
      icon: Cpu
    },
    {
      id: 6,
      title: 'Carpenter',
      description: 'Custom carpentry work with precision and attention to detail. From furniture to fixtures.',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Custom Furniture', 'Repairs', 'Installation', 'Polishing'],
      rating: 4.5,
      time: '2-5 Days',
      professionals: 'Skilled Carpenters',
      icon: Hammer
    },
    {
      id: 7,
      title: 'Legal Service',
      description: 'Professional legal assistance for all your documentation and consultation needs.',
      image: 'https://images.unsplash.com/photo-1589391886085-8b6b0ac72a1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Documentation', 'Consultation', 'Legal Advice', 'Court Representation'],
      rating: 4.8,
      time: '1-3 Days',
      professionals: 'Qualified Lawyers',
      icon: Scale
    },
    {
      id: 8,
      title: 'Full House Cleaning',
      description: 'Deep cleaning services for your entire home using eco-friendly products and modern equipment.',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Deep Cleaning', 'Sanitization', 'Carpet Cleaning', 'Window Cleaning'],
      rating: 4.6,
      time: '4-6 Hours',
      professionals: 'Trained Cleaners',
      icon: Home
    },
    {
      id: 9,
      title: 'Home Painting',
      description: 'Professional painting services for interior and exterior walls with premium quality paints.',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Interior Painting', 'Exterior Painting', 'Texture Work', 'Waterproofing'],
      rating: 4.7,
      time: '3-7 Days',
      professionals: 'Expert Painters',
      icon: PaintBucket
    },
    {
      id: 10,
      title: 'AC Repair',
      description: 'Expert AC repair and maintenance services for all brands and models.',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Repair', 'Maintenance', 'Gas Charging', 'Installation'],
      rating: 4.8,
      time: '2-4 Hours',
      professionals: 'Certified Technicians',
      icon: Wind
    },
    {
      id: 11,
      title: 'Pest Control',
      description: 'Effective pest control solutions using safe and approved methods for complete protection.',
      image: 'https://images.unsplash.com/photo-1584467735871-8db9ac8d0916?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Rodent Control', 'Insect Control', 'Termite Proofing', 'Follow-up Services'],
      rating: 4.7,
      time: '2-3 Hours',
      professionals: 'Licensed Exterminators',
      icon: Bug
    },
    {
      id: 12,
      title: 'Appliance Repair',
      description: 'Expert repair services for all home appliances with genuine spare parts.',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      features: ['Washing Machine', 'Refrigerator', 'Microwave', 'Oven Repair'],
      rating: 4.6,
      time: '1-2 Hours',
      professionals: 'Skilled Technicians',
      icon: Cpu
    }
  ];

  const nextService = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveService((prev) => (prev + 1) % services.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevService = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveService((prev) => (prev - 1 + services.length) % services.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToService = (index) => {
    if (isAnimating || index === activeService) return;
    setIsAnimating(true);
    setActiveService(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto-rotate every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextService();
    }, 8000);
    
    return () => clearInterval(interval);
  }, [activeService, isAnimating]);

  const currentService = services[activeService];
  const IconComponent = currentService.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hidden container with your specified classes */}
      <div className='hidden sm:block sm:w-4xl bg-amber-400'></div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Our <span className="text-amber-400">Premium</span> Services
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            One service at a time, explored in detail. Click through to discover what we offer.
          </p>
        </div>

        {/* Main Slideshow Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevService}
            disabled={isAnimating}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 z-20 bg-gray-800/90 hover:bg-amber-500 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 disabled:opacity-50 border border-amber-500/30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextService}
            disabled={isAnimating}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 z-20 bg-gray-800/90 hover:bg-amber-500 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 disabled:opacity-50 border border-amber-500/30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Main Service Display */}
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                <div className="aspect-[9/16] relative">
                  <img
                    src={currentService.image}
                    alt={currentService.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  {/* Service Icon */}
                  <div className="absolute top-6 left-6 bg-gradient-to-br from-amber-500 to-orange-500 text-white p-4 rounded-2xl shadow-xl">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center gap-2 border border-white/30">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{currentService.rating}</span>
                    <span className="text-sm text-gray-200">/5.0</span>
                  </div>

                  {/* Service Number */}
                  <div className="absolute bottom-6 left-6">
                    <div className="text-amber-400 font-bold text-sm">Service {currentService.id} of {services.length}</div>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-gray-700">
                <div className="h-full flex flex-col justify-center">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-10 bg-amber-500 rounded-full"></div>
                      <h2 className="text-4xl font-bold text-white">{currentService.title}</h2>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed bg-gray-900/30 p-4 rounded-xl">
                      {currentService.description}
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-amber-400" />
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentService.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl p-4 hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-300 group"
                        >
                          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                          <span className="text-gray-200 group-hover:text-white">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Service Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-4 border border-gray-700 hover:border-amber-500/30 transition-colors duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                          <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">Time Required</div>
                          <div className="text-amber-300 font-bold text-xl">{currentService.time}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-4 border border-gray-700 hover:border-amber-500/30 transition-colors duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                          <Users className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">Professionals</div>
                          <div className="text-amber-300 font-bold text-xl">{currentService.professionals}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-4 border border-gray-700 hover:border-amber-500/30 transition-colors duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg">
                          <Shield className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">Quality Guarantee</div>
                          <div className="text-amber-300 font-bold text-xl">100% Satisfaction</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-4 px-6 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                      Book This Service
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button className="flex-1 bg-gray-700/50 text-white font-bold py-4 px-6 rounded-xl hover:bg-gray-600 transition-all duration-300 border border-gray-600 hover:border-gray-500">
                      Get Free Quote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Progress Bar */}
          <div className="mt-12 relative">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${((activeService + 1) / services.length) * 100}%` }}
              ></div>
            </div>
            
            {/* Service Indicators */}
            <div className="flex justify-between mt-4">
              {services.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => goToService(index)}
                  disabled={isAnimating}
                  className={`flex flex-col items-center transition-all duration-300 ${
                    index === activeService
                      ? 'scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full mb-2 ${
                    index === activeService
                      ? 'bg-amber-500 ring-4 ring-amber-500/30'
                      : 'bg-gray-600'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    index === activeService
                      ? 'text-amber-400'
                      : 'text-gray-400'
                  }`}>{service.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Service Navigation Grid */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">
              All Our Services
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {services.map((service, index) => {
                const ServiceIcon = service.icon;
                return (
                  <button
                    key={service.id}
                    onClick={() => goToService(index)}
                    disabled={isAnimating}
                    className={`p-4 rounded-xl transition-all duration-300 transform ${
                      index === activeService
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white scale-105 shadow-lg'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white hover:scale-102'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ServiceIcon className="w-6 h-6" />
                      <span className="text-xs font-medium text-center">{service.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auto-slide Indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 text-gray-400 bg-gray-800/50 px-4 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span>Auto-rotating</span>
            </div>
            <button 
              onClick={nextService}
              className="text-amber-400 hover:text-amber-300 text-sm font-medium"
            >
              Skip to next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSlideShow;