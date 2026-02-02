import React, { useState, useEffect } from 'react';
import { batchService } from '../../api/batchService';
import PropertyUnitCard from '../../components/PropertyUnitCard';

const ProjectGroupBatches = () => {
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
          const projectBatches = (response.data || []).filter(
            batch => batch.batchType === 'project_group'
          );
          setBatches(projectBatches);
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
        {/* <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
         */}
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>

        <p className="mt-4 text-slate-500 font-light tracking-widest uppercase text-xs">Curating Excellence</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-slate-900">
      {/* Hero Section */}
      <section className="py-8 md:py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
            <span className="text-blue-600">Premium</span>{" "}
            <span className="text-gray-800">Project Collections</span>
          </h1>

               <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <div className="w-12 h-0.5 bg-gradient-to-l from-blue-600 to-transparent" />
          </div>

          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Explore our exclusive real estate developments and architectural masterpieces.
          </p>
        </div>
      </section>

      {/* Grid Section - Updated for Mobile X-Scroll */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-10 md:pb-0">
          {batches.map((batch) => (
            <div
              key={batch._id}
              className="group relative cursor-pointer overflow-hidden bg-slate-100 flex-shrink-0 w-[85vw] md:w-auto snap-center"
              onClick={() => handleBatchClick(batch)}
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={batch.image?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'}
                  alt={batch.projectName || batch.batchName}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-white/70 text-[10px] uppercase tracking-[0.2em] mb-2">Project Collection</p>
                <h3 className="text-2xl font-serif text-white mb-2">
                  {batch.projectName || batch.batchName}
                </h3>
                <p className="text-white/80 text-sm font-light mb-4 line-clamp-2">
                  {batch.tagline || batch.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <span className="text-white/80 text-xs font-light tracking-wider">
                    {batch.stats?.totalProperties || 0} Units
                  </span>
                  <span className="text-white text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                    View Project →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Luxury Modal */}
      {showModal && selectedBatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 backdrop-blur-md bg-slate-900/60 transition-all duration-500">
          <div 
            className="bg-white w-full max-w-7xl h-full md:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative h-48 md:h-64 flex-shrink-0">
              <img 
                src={selectedBatch.image?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200'} 
                className="w-full h-full object-cover"
                alt="Project Header"
              />
              <div className="absolute inset-0 bg-slate-900/40 flex flex-col justify-end p-6 md:p-12">
                <button 
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:rotate-90 transition-transform duration-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-3xl md:text-5xl font-serif text-white">
                  {selectedBatch.projectName || selectedBatch.batchName}
                </h2>
                <p className="text-white/80 mt-2 font-light max-w-2xl italic text-sm md:text-base line-clamp-2 md:line-clamp-none">
                  {selectedBatch.description}
                </p>
                {selectedBatch.developerName && (
                  <p className="text-white/90 mt-4 text-sm md:text-base">
                    By <span className="font-semibold">{selectedBatch.developerName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-y-auto bg-slate-50 px-4 md:px-8 py-8 md:py-12">
              {unitsLoading ? (
                <div className="flex justify-center py-20">
                   <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
              ) : propertyUnits.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-serif italic text-slate-400 text-xl">Units will be available soon.</p>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto">
                   <div className="flex justify-between items-end mb-6 md:mb-10 pb-4 border-b border-slate-200">
                      <h4 className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold text-slate-900">
                        Available Units
                      </h4>
                      <div className="flex items-center gap-4">
                        {selectedBatch.projectStatus && (
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            selectedBatch.projectStatus === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            selectedBatch.projectStatus === 'under_construction' ? 'bg-amber-100 text-amber-800' :
                            selectedBatch.projectStatus === 'planned' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {selectedBatch.projectStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                        <span className="text-slate-400 text-xs md:text-sm font-light">
                          {propertyUnits.length} Units Available
                        </span>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
            <div className="px-6 py-4 md:px-8 md:py-6 bg-white border-t border-slate-100 flex justify-between items-center">
               <code className="hidden md:block text-[10px] text-slate-400 uppercase tracking-widest">
                 PROJECT: {selectedBatch.batchCode}
               </code>
               <button 
                onClick={() => setShowModal(false)}
                className="w-full md:w-auto px-8 py-3 bg-slate-900 text-white text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors"
               >
                 Back to Projects
               </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hide scrollbar for cleaner look */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default ProjectGroupBatches;