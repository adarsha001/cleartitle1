import React from 'react'

import ProjectGroupTable from '../components/BatchListing'
import FeaturedProperties from './FeaturedProperties'
import LocationBatches from '../components/batches/LocationBatches'
import PropertyComparison from '../components/PropertyComparison'
import EnhancedFooter from './Footer'

const Topratedcompanies = () => {
  return (
    <div>
      <ProjectGroupTable/>
      <FeaturedProperties/>
      <LocationBatches/>
      <PropertyComparison/>
      <EnhancedFooter/>
    </div>
  )
}

export default Topratedcompanies
