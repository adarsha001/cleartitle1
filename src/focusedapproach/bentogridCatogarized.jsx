import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PropertyCategories = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const headerRef = useRef(null);

  const categories = [
    { 
      id: 'Apartment', 
      name: 'Modern Apartments', 
      tagline: 'Urban Living',
      img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
      className: 'col-span-2 row-span-1 md:col-span-2 md:row-span-2' 
    },
    { 
      id: 'Villa', 
      name: 'Luxury Villas', 
      tagline: 'Exclusive Estates',
      img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800',
      className: 'col-span-2 row-span-1 md:col-span-2 md:row-span-1' 
    },
    { 
      id: 'Commercial Space', 
      name: 'Commercial', 
      tagline: 'Business Hubs',
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      className: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1' 
    },
    { 
      id: 'Plot', 
      name: 'Land & Plots', 
      tagline: 'Build Your Future',
      img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
      className: 'col-span-1 row-span-1 md:col-span-1 md:row-span-1' 
    },
    { 
      id: 'Independent House', 
      name: 'Independent House', 
      tagline: 'Private Living',
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
      className: 'col-span-2 row-span-1 md:col-span-4 md:row-span-1' 
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate Heading
      gsap.from(headerRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 95%",
        }
      });

      // Animate Cards
      cardsRef.current.forEach((card, i) => {
        gsap.from(card, {
          y: 30,
          
          duration: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 98%",
          },
          delay: i * 0.1
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-white py-8 md:py-24 px-4 md:px-10 overflow-hidden">
      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* New Responsive Heading Section */}
        <div ref={headerRef} className="mb-12 md:mb-20 space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-8 md:w-12 bg-blue-600"></span>
            <h2 className="text-[10px] md:text-xs font-bold tracking-[0.4em] text-blue-600 uppercase">
              Our Portfolio
            </h2>
          </div>
          <h3 className="text-4xl md:text-7xl font-light text-slate-900 leading-[1.1] tracking-tight">
            Discover <span className="font-semibold italic">Properties</span> <br className="hidden md:block" />
            by Category
          </h3>
          {/* <p className="text-slate-500 text-sm md:text-lg max-w-xl font-normal leading-relaxed">
            Explore our hand-picked selection of premium real estate, from high-rise urban suites to expansive private estates.
          </p> */}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 auto-rows-[160px] md:auto-rows-[280px]">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              ref={el => cardsRef.current[i] = el}
              onClick={() => navigate(`/properties/category/${cat.id}`)}
              className={`group relative overflow-hidden cursor-pointer rounded-2xl md:rounded-[2.5rem] shadow-sm transition-all duration-500 ${cat.className}`}
            >
              {/* Image Layer */}
              <img 
                src={cat.img} 
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Refined Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

              {/* Card Content */}
              <div className="absolute inset-0 p-5 md:p-10 flex flex-col justify-end text-white">
                <div className="overflow-hidden">
                  <p className="text-[9px] md:text-xs tracking-[0.2em] uppercase text-blue-400 mb-1 md:mb-3 font-bold transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                    {cat.tagline}
                  </p>
                </div>
                
                <div className="flex justify-between items-end">
                  <h4 className="text-lg md:text-3xl font-medium tracking-tight leading-tight">{cat.name}</h4>
                  
                  <div className="w-8 h-8 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                    <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                </div>
              </div>

              {/* Hover Interaction Border */}
              <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-2xl md:rounded-[2.5rem] pointer-events-none transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCategories;