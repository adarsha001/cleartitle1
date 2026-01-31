import React, { useState, useEffect } from 'react';
import { batchService } from '../../api/batchService';
import PropertyUnitCard from '../../components/PropertyUnitCard';

const LocationBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const response = await batchService.getAllBatches({ isActive: true, limit: 6 });
        if (response.success) {
          const locationBatches = (response.data || []).filter(
            batch => batch.batchType === 'location_based'
          );
          setBatches(locationBatches);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const fetchBatchPropertyUnits = async (batchId) => {
    try {
      setUnitsLoading(true);
      const response = await batchService.getBatch(batchId);
      if (response.success && response.data) {
        setPropertyUnits(response.data.propertyUnits || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
    setPropertyUnits([]);
    await fetchBatchPropertyUnits(batch._id);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-light tracking-widest uppercase text-xs">Elevating Experiences</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-slate-900">
      {/* Hero Section */}
  <section className="py-12 md:py-16 px-4">
  <div className="max-w-7xl mx-auto text-center">
    {/* Simple Title */}
    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
      <span className="text-blue-600">Explore</span>{" "}
      <span className="text-gray-800">by Location</span>
    </h1>

    {/* Decorative Line (matches FeaturedProperties) */}
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
      <div className="w-12 h-0.5 bg-gradient-to-l from-blue-600 to-transparent" />
    </div>

    {/* Clean Subtitle */}
    <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
      Browse our premium real estate projects across key strategic locations.
    </p>
  </div>
</section>

      {/* Grid Section */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {batches.map((batch) => (
            <div
              key={batch._id}
              className="group relative cursor-pointer overflow-hidden bg-slate-100"
              onClick={() => handleBatchClick(batch)}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={batch.image?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                  alt={batch.locationName}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              
              {/* Overlay Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-white/70 text-[10px] uppercase tracking-[0.2em] mb-2">Explore Location</p>
                <h3 className="text-2xl font-serif text-white mb-2">{batch.locationName}</h3>
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <span className="text-white/80 text-xs font-light tracking-wider">
                    {batch.stats?.totalProperties || 0} Listings
                  </span>
                  <span className="text-white text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                    Discover →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Luxury Modal */}
      {showModal && selectedBatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-md bg-slate-900/60 transition-all duration-500">
          <div 
            className="bg-white w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative h-64 flex-shrink-0">
              <img 
                src={selectedBatch.image?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200'} 
                className="w-full h-full object-cover"
                alt="Location Header"
              />
              <div className="absolute inset-0 bg-slate-900/40 flex flex-col justify-end p-8 md:p-12">
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-6 right-6 text-white hover:rotate-90 transition-transform duration-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-4xl md:text-5xl font-serif text-white">{selectedBatch.locationName}</h2>
                <p className="text-white/80 mt-2 font-light max-w-2xl italic">{selectedBatch.description}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-y-auto bg-slate-50 px-8 py-12">
              {unitsLoading ? (
                <div className="flex justify-center py-20">
                   <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                </div>
              ) : propertyUnits.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-serif italic text-slate-400 text-xl">New listings arriving soon.</p>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto">
                   <div className="flex justify-between items-end mb-10 pb-4 border-b border-slate-200">
                      <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-900">Available Residences</h4>
                      <span className="text-slate-400 text-sm font-light">{propertyUnits.length} Properties</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {propertyUnits.map((unit) => (
                      <div key={unit._id} className="hover:-translate-y-1 transition-transform duration-300">
                        <PropertyUnitCard propertyUnit={unit} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-8 py-6 bg-white border-t border-slate-100 flex justify-between items-center">
               <code className="text-[10px] text-slate-400 uppercase tracking-widest">ID: {selectedBatch.batchCode}</code>
               <button 
                onClick={() => setShowModal(false)}
                className="px-8 py-3 bg-slate-900 text-white text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors"
               >
                 Return to Gallery
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationBatches;