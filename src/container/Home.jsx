import React, { useRef, useEffect } from 'react';
import FeaturedProperties from '../pages/FeaturedProperties';
import QualityAssurance from '../pages/QualityAsurence';
import Footer from '../pages/Footer';
import PropertyUnitsPage from '../newapproach/newapproachpropertyunit';
import NewlyLaunchedProperties from '../newapproach/NewlyLaunchedProperties';
import PossessionTimeline from '../newapproach/PossessionTimeline';
import Navbar from '../components/Navbar';
import ListingTypeView from '../newapproach/ListingTypeView';
import BengaluruEastLandPriceChart from '../newapproach/BengaluruEastLandPriceChart';
import LocationBatches from '../components/batches/LocationBatches';
import ProjectGroupBatches from '../components/batches/ProjectGroupBatches';
import CategoryGrid from '../focusedapproach/bentogridCatogarized';
import PropertyComparison from '../components/PropertyComparison';

const Home = () => {
  const sectionRefs = useRef([]);

  const sections = [
    { name: 'All Properties', component: PropertyUnitsPage },
    { name: 'CategoryGrid', component: CategoryGrid },
    { name: 'Featured', component: FeaturedProperties },
    { name: 'Newly Launched', component: NewlyLaunchedProperties },
    { name: 'BengaluruEastLandPriceChart', component:  LocationBatches},
    { name: 'Possession Timeline', component: PossessionTimeline },
    { name: 'property comparision', component: PropertyComparison },
    { name: 'ProjectGroupBatches ', component: ProjectGroupBatches },
    { name: 'ListingTypeView', component:  ListingTypeView},
    { name: 'Quality', component: QualityAssurance },
  ];

  return (
    <div>
<Navbar/>
    <div className="relative">
      {/* Sections */}
      {/* <Navbar/> */}
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
    </div>
  );
};

export default Home;