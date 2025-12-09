import React from 'react'
// import Searchfilter from '../pages/Searchfilter'
import FeaturedProperties from '../pages/FeaturedProperties'
import PropertyList from '../pages/PropertyList'
// import VerifiedProperties from '../pages/VerifiedProperties'
import QualityAssurance from '../pages/QualityAsurence'
import Footer from '../pages/Footer'
import PropertyUnitList from '../components/PropertyUnitList'
import PropertyUnitsPage from '../components/PropertyUnitsPage'
const Home = () => {
  return (
    <div>
      {/* <Searchfilter/> */}
      <PropertyList/>
      {/* <PropertyUnitList/> */}
      <PropertyUnitsPage/>
      <FeaturedProperties/>
      {/* <VerifiedProperties/> */}
      <QualityAssurance/>
      <Footer/>
    </div>
  )
}

export default Home
