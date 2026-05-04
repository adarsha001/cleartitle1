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
import CategoryGrid from './bentogridCatogarized';
import PropertyCategories from '../focusedapproach/PropertyCategories';
import ImprovedCarousel from '../newapproach/CarouselSlider';
import UnifiedAuthCTA from './UnifiedAuthCTA';
import BuildingMarquee from '../pages/Building';
import PropertyComparison from '../components/PropertyComparison';
import BlogList from '../pages/BlogList';

const Finalized = () => {
  const sectionRefs = useRef([]);

  const sections = [
    { name: 'All Properties', component: ImprovedCarousel },
    { name: 'CategoryGrid', component: PropertyCategories },
    { name: 'Featured', component: FeaturedProperties },
    { name: 'ProjectGroupBatches ', component: ProjectGroupBatches },
    { name: 'Newly Launched', component: NewlyLaunchedProperties },
    { name: 'Possession Timeline', component: PossessionTimeline },
    { name: 'BengaluruEastLandPriceChart', component:  LocationBatches},
    { name: 'UnifiedAuthCTA ', component: UnifiedAuthCTA },
    { name: 'property comparision', component: PropertyComparison },
    { name: 'ListingTypeView', component:  ListingTypeView},
    { name: 'BlogList', component: BlogList },
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

export default Finalized;