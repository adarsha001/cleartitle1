import React, { useState, useEffect, useRef } from 'react';
import { projectBatchService } from '../../api/publicBatchService';
import PropertyUnitCard from '../../components/PropertyUnitCard';
import { X, Shield, Building2, ChevronRight, Info, LayoutGrid } from 'lucide-react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

const ProjectGroupBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  const marqueeContentRef = useRef(null);
  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const modalOverlayRef = useRef(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        // Using projectBatchService.getProjectBatches instead of batchService.getAllBatches
        const response = await projectBatchService.getProjectBatches({ 
          page: 1, 
          limit: 20,
          sortBy: 'displayOrder',
          sortOrder: 'asc'
        });
        
        if (response.success) {
          // The API already returns only project_group batches
          setBatches(response.data || []);
        } else {
          setBatches([]);
        }
      } catch (error) { 
        console.error('Fetch error:', error); 
        setBatches([]);
      } finally { 
        setLoading(false); 
      }
    };
    fetchBatches();
  }, []);

  // --- INFINITE X-AXIS SCROLL ENGINE ---
  useEffect(() => {
    if (!batches.length || !marqueeContentRef.current) return;
    
    const content = marqueeContentRef.current;
    const itemWidth = content.children[0]?.offsetWidth + 16 || 400;
    const totalWidth = itemWidth * batches.length;
    const wrap = gsap.utils.wrap(-totalWidth, 0);
    let scrollPos = 0;
    let vel = 0;

    const updateX = () => {
      gsap.set(content, { 
        x: wrap(scrollPos),
        modifiers: { x: gsap.utils.unitize(val => parseFloat(val) % totalWidth) }
      });
    };

    const obs = Observer.create({
      target: containerRef.current,
      type: "wheel,touch,pointer",
      onChange: (self) => {
        const delta = self.deltaX || self.deltaY * -0.5; 
        scrollPos += delta;
        vel = self.velocityX || self.velocityY;
        updateX();
      },
      onStop: () => {
        gsap.to({ v: vel }, {
          v: 0, duration: 1.5, ease: "power3.out",
          onUpdate: function() {
            scrollPos += this.targets()[0].v * 0.01;
            updateX();
          }
        });
      }
    });

    const drift = gsap.to({}, {
      repeat: -1, duration: 1,
      onUpdate: () => { 
        if (!obs.isDragging && !obs.isPressed) { 
          scrollPos -= 0.5; 
          updateX(); 
        } 
      }
    });

    return () => { obs.kill(); drift.kill(); };
  }, [batches]);

  // --- MODAL ANIMATIONS ---
  useEffect(() => {
    if (showModal && modalRef.current) {
      const tl = gsap.timeline();
      tl.to(modalOverlayRef.current, { display: 'flex', opacity: 1, duration: 0.3 })
        .fromTo(modalRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" });
    }
  }, [showModal]);

  const handleCloseModal = () => {
    gsap.to(modalRef.current, { y: 100, opacity: 0, duration: 0.4, onComplete: () => {
      setShowModal(false);
      setSelectedBatch(null);
      setPropertyUnits([]);
      setFetchError(null);
    }});
    gsap.to(modalOverlayRef.current, { opacity: 0, duration: 0.3 });
  };

  // Function to transform property units data
  const transformPropertyUnits = (propertyUnitsData) => {
    if (!propertyUnitsData || !Array.isArray(propertyUnitsData)) return [];
    
    return propertyUnitsData.map(unit => {
      // Check if property data is nested inside propertyId
      if (unit.propertyId && typeof unit.propertyId === 'object') {
        const propertyData = unit.propertyId;
        
        // Return flattened object that PropertyUnitCard expects
        return {
          _id: propertyData._id || unit._id,
          // Property basic info
          title: propertyData.title || propertyData.propertyName || 'Property',
          propertyName: propertyData.propertyName || propertyData.title,
          description: propertyData.description || '',
          // Location info
          address: propertyData.address || '',
          city: propertyData.city || '',
          state: propertyData.state || '',
          pincode: propertyData.pincode || '',
          // Property details
          propertyType: propertyData.propertyType || '',
          bedroomCount: propertyData.bedroomCount || 0,
          bathroomCount: propertyData.bathroomCount || 0,
          area: propertyData.area || 0,
          areaUnit: propertyData.areaUnit || 'sqft',
          // Pricing
          price: propertyData.price || 0,
          expectedPrice: propertyData.expectedPrice || 0,
          // Images
          images: propertyData.images || [],
          thumbnail: propertyData.thumbnail || propertyData.images?.[0]?.url || '',
          // Status
          status: propertyData.status || 'available',
          isActive: propertyData.isActive !== false,
          // Unit specific fields
          unitDisplayOrder: unit.displayOrder,
          unitStats: unit.propertyStats,
          ...propertyData
        };
      }
      
      // If propertyId is just an ID string or property data is already flat
      return unit;
    });
  };

  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
    setUnitsLoading(true);
    setFetchError(null);
    setPropertyUnits([]);
    
    try {
      // Using projectBatchService.getProjectBatchById
      const response = await projectBatchService.getProjectBatchById(batch._id);
      
      if (response.success && response.data) {
        console.log("Project Group API Response:", response.data);
        
        // Transform the property units to extract nested property data
        const transformedUnits = transformPropertyUnits(response.data.propertyUnits);
        console.log("Transformed Units:", transformedUnits);
        
        setPropertyUnits(transformedUnits);
      } else {
        setPropertyUnits([]);
      }
    } catch (e) {
      console.error('Error fetching properties:', e);
      setFetchError(e.response?.data?.message || "Request timed out. The server is taking too long to respond.");
      setPropertyUnits([]);
    } finally {
      setUnitsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-t-2 border-blue-600 rounded-full animate-spin" />
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Loading Collections</p>
        </div>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-white">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-serif italic">No project collections available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-2 md:py-24 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-6 border-b border-slate-100 pb-10">
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-blue-600 mb-2">Signature Series</h4>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">Project Collections</h2>
          </div>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Scroll or Drag to Explore</p>
        </div>

        {/* --- MARQUEE SECTION --- */}
        <div ref={containerRef} className="relative touch-none mt-8">
          <div className="overflow-visible">
            <div 
              ref={marqueeContentRef}
              className="flex gap-4 will-change-transform py-10"
              style={{ width: 'fit-content' }}
            >
              {batches.length > 0 && [...batches, ...batches, ...batches].map((batch, index) => (
                <div 
                  key={`${batch._id}-${index}`}
                  onClick={() => handleBatchClick(batch)}
                  className="flex-shrink-0 w-[300px] md:w-[420px] group transition-transform duration-500 cursor-pointer"
                >
                  {/* CARD DESIGN */}
                  <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-5 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:border-blue-100">
                    <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50">
                      <img 
                        src={batch.image?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={batch.batchName}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';
                        }}
                      />
                    </div>
                    <div className="flex-1 pl-6">
                      <span className="text-[9px] font-bold tracking-[0.2em] text-blue-600 uppercase block mb-1">
                        {batch.batchType?.replace('_', ' ') || 'Exclusive'}
                      </span>
                      <h3 className="text-lg font-serif text-slate-900 leading-tight mb-2">
                        {batch.batchName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {batch.stats?.totalProperties || 0} Units Available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- PREMIUM MODAL INTERFACE --- */}
      {showModal && selectedBatch && (
        <div 
          ref={modalOverlayRef} 
          className="fixed inset-0 z-[100] hidden items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 md:p-10"
        >
          <div 
            ref={modalRef} 
            className="bg-white w-full h-full md:h-full max-w-7xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative"
          >
            
            {/* Close Button */}
            <button 
              onClick={handleCloseModal} 
              className="absolute top-4 right-4 z-[110] w-10 h-10 md:w-12 md:h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5 text-slate-900" />
            </button>

            {/* Main Container */}
            <div className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden">
              
              {/* Sidebar Info */}
              <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col shrink-0">
                <div className="h-48 sm:h-64 lg:h-80 relative shrink-0">
                  <img 
                    src={selectedBatch.image?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'} 
                    className="w-full h-full object-cover" 
                    alt={selectedBatch.batchName}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent lg:hidden" />
                </div>
                
                <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Shield className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Master Collection</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-serif text-slate-900 leading-tight">
                    {selectedBatch.batchName}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed font-light line-clamp-3 lg:line-clamp-none">
                    {selectedBatch.description || "An architectural masterpiece offering unparalleled luxury and community-centric design."}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Portfolio Size</p>
                      <p className="text-base md:text-lg font-serif text-slate-900">
                        {selectedBatch.stats?.totalProperties || 0} Units
                      </p>
                    </div>
                    {selectedBatch.locationName && (
                      <div className="bg-slate-50 p-4 rounded-2xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Location</p>
                        <p className="text-base md:text-lg font-serif text-slate-900">
                          {selectedBatch.locationName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Inventory Grid */}
              <div className="w-full lg:w-2/3 flex flex-col bg-[#FCFCFC] min-h-[400px]">
                {/* Sticky header inside inventory */}
                <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-4 h-4 text-blue-600" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">Live Inventory</h3>
                  </div>
                  <span className="text-[9px] text-slate-400">
                    {propertyUnits.length} properties
                  </span>
                </div>

                {/* Scrollable Area */}
                <div className="p-4 md:p-8 overflow-y-auto lg:flex-grow">
                  {unitsLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching Assets...</p>
                    </div>
                  ) : fetchError ? (
                    <div className="py-12 md:h-full flex flex-col items-center justify-center text-center px-6">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <Info className="text-red-500 w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-serif mb-2">Network Timeout</h4>
                      <p className="text-xs text-slate-500 max-w-xs mb-6">{fetchError}</p>
                      <button 
                        onClick={() => handleBatchClick(selectedBatch)} 
                        className="px-8 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-blue-700 transition-all"
                      >
                        Retry Request
                      </button>
                    </div>
                  ) : propertyUnits.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                      <Building2 className="w-12 h-12 mb-4" />
                      <p className="font-serif italic text-slate-500 text-sm">No properties found in this collection.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pb-20 lg:pb-0">
                      {propertyUnits.map((unit, index) => (
                        <div 
                          key={unit._id || index} 
                          className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100/50 transition-all duration-300 hover:shadow-md"
                        >
                          <PropertyUnitCard propertyUnit={unit} viewMode="compact" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Navigation */}
                <div className="hidden lg:flex p-6 bg-white border-t border-slate-100 justify-center shrink-0">
                  <button 
                    onClick={handleCloseModal} 
                    className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    Back to collections <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGroupBatches;