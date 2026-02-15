import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
      tagline: 'Ready to Move & Under Construction',
      location: 'Prime Bangalore Locations',
      img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'Villa',
      name: 'Luxury Villas',
      tagline: 'Spacious & Premium Residences',
      location: 'Exclusive Villa Communities',
      img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'Commercial Space',
      name: 'Commercial',
      tagline: 'Office Spaces & Retail Properties',
      location: 'Ideal for Businesses & Investors',
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'Plot',
      name: 'Land & Plots',
      tagline: 'Gated Community & Residential Plots',
      location: "Invest in Bangalore's Growth",
      img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    },
    {
      id: 'Independent House',
      name: 'Independent House',
      tagline: 'Private & Custom Homes',
      location: 'Prime Localities of Bangalore',
      img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 90%",
        }
      });

      cardsRef.current.forEach((card, i) => {
        gsap.from(card, {
          y: 40,
          // opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 95%",
          },
          delay: i * 0.1
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-white py-12 md:py-24 px-3 md:px-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div ref={headerRef} className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-5xl font-bold text-[#1a2b49] mb-3 md:mb-4">
            Explore Our <span className="text-[#1a2b49]">Top Categories</span>
          </h2>
          <p className="text-gray-500 text-xs md:text-lg max-w-2xl mx-auto">
            Discover the finest properties in Bangalore tailored to your needs
          </p>
        </div>

        {/* Responsive Grid: 2 columns on mobile, 2 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-8">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              ref={el => cardsRef.current[i] = el}
              onClick={() => navigate(`/properties/category/${cat.id}`)}
              className={`group relative h-[220px] sm:h-[300px] md:h-[450px] overflow-hidden cursor-pointer rounded-xl md:rounded-3xl shadow-md transition-all 
                ${i === 4 ? 'col-span-2 lg:col-span-2' : 'col-span-1 lg:col-span-1'}`}
            >
              {/* Image Background */}
              <img 
                src={cat.img} 
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/40 to-transparent opacity-90" />

              {/* Content Box */}
              <div className="absolute inset-0 p-3 md:p-10 flex flex-col justify-end">
                <h4 className="text-sm md:text-4xl font-bold text-white mb-1 md:mb-2">
                  {cat.name}
                </h4>
                
                <div className="mb-3 md:mb-6">
                  <p className="text-[10px] md:text-base font-semibold text-[#f4c661] leading-tight">
                    {cat.tagline}
                  </p>
                  <p className="hidden md:block text-gray-300 text-xs md:text-sm mt-1">
                    {cat.location}
                  </p>
                </div>

                {/* Yellow Button */}
                <div className="flex">
                  {/* <button className="bg-blue-400 hover:bg-blue-700 text-black text-[9px] md:text-sm font-bold py-1.5 px-3 md:py-2.5 md:px-6 rounded md:rounded-lg flex items-center gap-1 md:gap-2 transition-colors">
                    Explore <span className="text-xs md:text-xl leading-none">›</span>
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCategories;