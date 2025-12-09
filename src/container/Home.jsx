import React, { useState, useRef, useEffect } from 'react';
import FeaturedProperties from '../pages/FeaturedProperties';
import PropertyList from '../pages/PropertyList';
import QualityAssurance from '../pages/QualityAsurence';
import Footer from '../pages/Footer';
import PropertyUnitsPage from '../components/PropertyUnitsPage';

const Home = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const sectionRefs = useRef([]);

  const sections = [
    { name: 'Properties', component: PropertyList },
    { name: 'Units', component: PropertyUnitsPage },
    { name: 'Featured', component: FeaturedProperties },
    { name: 'Quality', component: QualityAssurance },
  ];

  // 🟦 Intersection Observer (same logic from your working version)
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // focused on center
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sectionRefs.current.indexOf(entry.target);
          if (index !== -1) setCurrentSection(index);
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach((ref) => ref && observer.observe(ref));

    return () => {
      sectionRefs.current.forEach((ref) => ref && observer.unobserve(ref));
    };
  }, []);

  const scrollToSection = (index) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const scrollNext = () => scrollToSection((currentSection + 1) % sections.length);
  const scrollPrev = () => scrollToSection(currentSection === 0 ? sections.length - 1 : currentSection - 1);

  return (
    <div className="relative">

      {/* Navigation Arrows & Dots */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-3">

        {/* Up Arrow */}
        <button
          onClick={scrollPrev}
          className="p-2 rounded-full bg-gray-100 shadow hover:bg-gray-200"
        >
          ↑
        </button>

        {/* Dots */}
        <div className="flex flex-col items-center space-y-3 py-2">
          {sections.map((s, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSection === index ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={s.name}
            />
          ))}
        </div>

        {/* Down Arrow */}
        <button
          onClick={scrollNext}
          className="p-2 rounded-full bg-gray-100 shadow hover:bg-gray-200"
        >
          ↓
        </button>
      </div>

      {/* Progress Display */}
      {/* <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow z-50">
        <span className="text-sm font-medium">
          {sections[currentSection].name} ({currentSection + 1}/{sections.length})
        </span>
      </div> */}

      {/* Sections */}
      {sections.map((sec, index) => {
        const Component = sec.component;
        return (
          <section
            key={index}
            ref={(el) => (sectionRefs.current[index] = el)}
            className="min-h-screen"
          >
            <Component />
          </section>
        );
      })}

      {/* Footer stays at bottom (not in scroll sections) */}
      <Footer />
    </div>
  );
};

export default Home;
