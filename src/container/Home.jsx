import React, { useRef, useEffect } from 'react';
import FeaturedProperties from '../pages/FeaturedProperties';
import QualityAssurance from '../pages/QualityAsurence';
import Footer from '../pages/Footer';
import PropertyUnitsPage from '../newapproach/newapproachpropertyunit';
import NewlyLaunchedProperties from '../newapproach/NewlyLaunchedProperties';
import PossessionTimeline from '../newapproach/PossessionTimeline';

const Home = () => {
  const sectionRefs = useRef([]);

  const sections = [
    { name: 'All Properties', component: PropertyUnitsPage },
    { name: 'Newly Launched', component: NewlyLaunchedProperties },
    { name: 'Featured', component: FeaturedProperties },
    { name: 'Possession Timeline', component: PossessionTimeline },
    { name: 'Quality', component: QualityAssurance },
  ];

  return (
    <div className="relative">
      {/* Sections */}
      {sections.map((sec, index) => {
        const Component = sec.component;
        return (
          <section
            key={index}
            ref={(el) => (sectionRefs.current[index] = el)}
            className=""
          >
            <Component />
          </section>
        );
      })}

      <Footer />
    </div>
  );
};

export default Home;