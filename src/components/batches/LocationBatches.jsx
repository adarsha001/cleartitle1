import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchService } from '../../api/batchService';
import PropertyUnitCard from '../../components/PropertyUnitCard';
import { 
  MapPin,
  Plus,
  ArrowUpRight,
  ChevronRight,
  X,
  Building2,
  Shield
} from 'lucide-react';
import gsap from 'gsap';

const LocationBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  
  const modalRef = useRef(null);
  const modalContentRef = useRef(null);
  const modalOverlayRef = useRef(null);
  const timelineRef = useRef(null);
  
  const navigate = useNavigate();

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

  // Modal animation with GSAP
  useEffect(() => {
    if (showModal && modalRef.current && modalContentRef.current && modalOverlayRef.current) {
      // Kill any existing animations
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // Create new timeline
      const tl = gsap.timeline();
      timelineRef.current = tl;

      // Set initial states
      gsap.set(modalOverlayRef.current, {
        opacity: 0,
        display: 'flex'
      });

      gsap.set(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 50
      });

      gsap.set(modalContentRef.current, {
        opacity: 0,
        y: 30
      });

      // Animate in
      tl.to(modalOverlayRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.inOut'
      })
      .to(modalRef.current, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.2')
      .to(modalContentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.3');
    }
  }, [showModal]);

  const handleCloseModal = () => {
    if (modalRef.current && modalOverlayRef.current) {
      // Create closing animation
      const tl = gsap.timeline({
        onComplete: () => {
          setShowModal(false);
          setSelectedBatch(null);
          setPropertyUnits([]);
        }
      });

      tl.to(modalContentRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.3,
        ease: 'power2.in'
      })
      .to(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 50,
        duration: 0.4,
        ease: 'power3.in'
      }, '-=0.1')
      .to(modalOverlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      }, '-=0.2');
    } else {
      setShowModal(false);
      setSelectedBatch(null);
      setPropertyUnits([]);
    }
  };

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
      <div className="h-96 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-t-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Locating Premium Areas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white  md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- PREMIUM MINIMALIST HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-6 border-b border-slate-100 pb-10">
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-blue-600 mb-2">Global Presence</h4>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">Strategic Locations</h2>
          </div>
          <p className="text-slate-400 text-sm hidden  sm:block font-light max-w-xs italic leading-relaxed">
            "Location is the soul of real estate." — Discover our presence in the most sought-after pin codes.
          </p>
        </div>

        {/* --- REFINED BATCH GRID (X-Scroll on Mobile) --- */}
        <div className="relative">
          <div className="
            flex overflow-x-auto pb-12 pt-4 px-2 -mx-6 snap-x snap-mandatory scrollbar-hide
            md:grid md:grid-cols-3 md:gap-y-20 md:gap-x-10 md:overflow-visible md:px-0 md:mx-0
          ">
            {batches.map((batch) => (
              <div 
                key={batch._id}
                onClick={() => handleBatchClick(batch)}
                className="
                  flex-shrink-0 w-[85vw] ml-6 snap-center first:ml-6 last:mr-6
                  md:w-auto md:ml-0 md:snap-none md:mr-0
                  group cursor-pointer relative
                "
              >
                {/* The Image "Frame" */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#F9F9F9] rounded-sm transition-all duration-700 ease-out group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)]">
                  <div className="absolute top-4 left-4 z-10 opacity-30 group-hover:opacity-100 transition-opacity">
                     <span className="text-[9px] font-serif italic text-slate-900">Premium Destination</span>
                  </div>

                  <img 
                    src={batch.image?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    alt={batch.locationName}
                  />
                  
                  {/* Desktop Hover Overlay */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 md:group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-500 flex items-center justify-center">
                    <div className="bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 border border-slate-50">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-900">Explore Location</span>
                      <Plus className="w-3 h-3 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Floating Content Block */}
                <div className="relative -mt-8 mx-4 p-5 md:p-6 bg-white border border-slate-50 shadow-[0_15px_35px_rgba(0,0,0,0.04)] md:group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] md:group-hover:-translate-y-2 transition-all duration-500">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg md:text-xl font-serif text-slate-900 leading-tight">
                      {batch.locationName}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                  
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-1.5">
                       <MapPin className="w-3 h-3 text-blue-600" />
                       <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                         {batch.stats?.totalProperties || 0} Assets
                       </span>
                    </div>
                    <span className="text-slate-200">|</span>
                    <span className="text-[9px] md:text-[10px] font-medium text-slate-400 italic">
                      Strategic Zone
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- PREMIUM MODAL WITH GSAP ANIMATIONS --- */}
      {showModal && selectedBatch && (
        <div 
          ref={modalOverlayRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-xl"
          style={{ opacity: 0, display: 'none' }}
        >
          <div 
            ref={modalRef}
            className="bg-white w-full h-full md:h-[95vh] md:w-[95vw] md:max-w-7xl md:rounded-xl shadow-[0_100px_150px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col border border-slate-100"
            style={{ opacity: 0, scale: 0.9 }}
          >
            {/* Top Navigation */}
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Location Masterfile</span>
              </div>
              <button 
                onClick={handleCloseModal}
                className="group flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-slate-900 p-2"
              >
                Close <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div 
              ref={modalContentRef}
              className="flex-grow overflow-y-auto"
              style={{ opacity: 0 }}
            >
              {/* Header Section: Anti-Pixelation Frame */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-[35vh] md:h-[500px] bg-slate-50 relative overflow-hidden flex items-center justify-center">
                  <div 
                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-10 scale-110"
                    style={{ backgroundImage: `url(${selectedBatch.image?.url})` }}
                  />
                  <img 
                    src={selectedBatch.image?.url} 
                    className="relative max-h-[90%] max-w-[90%] object-contain shadow-2xl rounded-sm" 
                    alt={selectedBatch.locationName} 
                  />
                </div>
                
                <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
                    {selectedBatch.locationName}
                  </h2>
                  <p className="text-slate-500 font-light leading-relaxed mb-10 text-sm md:text-base">
                    {selectedBatch.description || "Explore a curated list of properties located in the most strategic and high-growth zones."}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Region Status</p>
                      <p className="text-lg font-serif italic text-blue-600">Prime Zone</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Local Listings</p>
                      <p className="text-lg font-serif">{propertyUnits.length} Available Assets</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Units Grid */}
              <div className="bg-[#FCFCFC] p-6 md:p-16 lg:p-20">
                <div className="flex items-center gap-4 mb-12">
                  <h3 className="text-[11px] font-bold tracking-[0.4em] uppercase text-slate-900 shrink-0">Regional Inventory</h3>
                  <div className="h-[1px] w-full bg-slate-100"></div>
                </div>

                {unitsLoading ? (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Fetching Assets</span>
                  </div>
                ) : propertyUnits.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <Building2 className="w-10 h-10 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-serif italic">No regional assets found...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {propertyUnits.map(unit => (
                      <div key={unit._id} className="bg-white p-2 rounded-xl shadow-sm border border-slate-100/50 hover:shadow-2xl hover:border-blue-100/50 transition-all duration-500 group">
                        <PropertyUnitCard propertyUnit={unit} viewMode="compact" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="p-6 bg-white border-t border-slate-50 flex justify-center">
              <button 
                onClick={handleCloseModal}
                className="flex items-center gap-3 text-[10px] font-bold tracking-[0.5em] uppercase text-slate-400 hover:text-blue-600 transition-colors"
              >
                Back to locations <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Utilities */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default LocationBatches;