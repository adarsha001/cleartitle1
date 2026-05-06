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
import SectionCarousel from '../components/SectionCarousel';

const Finalized = () => {
  const sectionRefs = useRef([]);

  const sections = [
    { name: 'All Properties', component: ImprovedCarousel },
    { name: 'CategoryGrid', component: PropertyCategories },
    { name: 'Featured', component: FeaturedProperties },
    { name: 'ProjectGroupBatches ', component: ProjectGroupBatches },
    // First Ad Banner - Section 1
    { name: 'Promo Banner 1', component: () => <SectionCarousel sectionId="first" autoplaySpeed={5000} /> },
    // { name: 'Newly Launched', component: NewlyLaunchedProperties },
    { name: 'Possession Timeline', component: PossessionTimeline },
    // Second Ad Banner - Section 2
    { name: 'Promo Banner 2', component: () => <SectionCarousel sectionId="second" autoplaySpeed={4000} /> },
    { name: 'BengaluruEastLandPriceChart', component: LocationBatches},
    { name: 'property comparision', component: PropertyComparison },
    { name: 'UnifiedAuthCTA ', component: UnifiedAuthCTA },
    { name: 'ListingTypeView', component: ListingTypeView},
    // Third Ad Banner - Section 3
    { name: 'Promo Banner 3', component: () => <SectionCarousel sectionId="third" autoplaySpeed={6000} showControls={false} /> },
    { name: 'BlogList', component: BlogList },
    { name: 'Quality', component: QualityAssurance },
  ];

  return (
    <div>
      <Navbar/>
      <div className="relative">
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