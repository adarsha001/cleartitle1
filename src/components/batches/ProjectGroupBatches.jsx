import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchService } from '../../api/batchService';
import PropertyUnitCard from '../../components/PropertyUnitCard';
import { X, Shield, Building2 } from 'lucide-react';
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
  
  const marqueeContentRef = useRef(null);
  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const modalOverlayRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const response = await batchService.getAllBatches({ isActive: true, limit: 6 });
        if (response.success) {
          const projectBatches = (response.data || []).filter(b => b.batchType === 'project_group');
          setBatches(projectBatches);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchBatches();
  }, []);

  // --- INTERACTIVE SCROLL & DRAG ENGINE ---
  useEffect(() => {
    if (!batches.length || !marqueeContentRef.current) return;

    const content = marqueeContentRef.current;
    const itemWidth = content.children[0].offsetWidth + 16;
    const totalWidth = itemWidth * batches.length;

    // Helper to wrap the X position for infinite effect
    const wrap = gsap.utils.wrap(-totalWidth, 0);

    // This object tracks our virtual scroll position
    let scrollPos = 0;
    let vel = 0; // Velocity

    const updateX = () => {
      gsap.set(content, { 
        x: wrap(scrollPos),
        modifiers: {
          x: gsap.utils.unitize(val => parseFloat(val) % totalWidth)
        }
      });
    };

    // Observer handles Wheel, Touch, and Pointer Drags
    const obs = Observer.create({
      target: containerRef.current,
      type: "wheel,touch,pointer",
      onPress: () => content.classList.add('cursor-grabbing'),
      onRelease: () => content.classList.remove('cursor-grabbing'),
      onChange: (self) => {
        // self.deltaX for wheel, self.deltaY for vertical wheel acting as horizontal
        const delta = self.deltaX || self.deltaY * -0.5; 
        scrollPos += delta;
        vel = self.velocityX || self.velocityY; // Capture velocity for inertia
        updateX();
      },
      onStop: () => {
        // Optional: Slow glide to stop after release
        gsap.to({ v: vel }, {
          v: 0,
          duration: 1.5,
          ease: "power3.out",
          onUpdate: function() {
            scrollPos += this.targets()[0].v * 0.01;
            updateX();
          }
        });
      }
    });

    // Auto-drift (Gentle movement when idle)
    const drift = gsap.to({}, {
      repeat: -1,
      duration: 1,
      onUpdate: () => {
        if (!obs.isDragging && !obs.isPressed) {
          scrollPos -= 0.5; // Constant slow crawl
          updateX();
        }
      }
    });

    return () => {
      obs.kill();
      drift.kill();
    };
  }, [batches]);

  // --- MODAL ANIMATIONS ---
  useEffect(() => {
    if (showModal && modalRef.current) {
      const tl = gsap.timeline();
      tl.to(modalOverlayRef.current, { display: 'flex', opacity: 1, duration: 0.4 })
        .fromTo(modalRef.current, { y: 50, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }, "-=0.2");
    }
  }, [showModal]);

  const handleCloseModal = () => {
    gsap.to(modalRef.current, { y: 30, opacity: 0, scale: 0.95, duration: 0.4, onComplete: () => { setShowModal(false); setSelectedBatch(null); }});
    gsap.to(modalOverlayRef.current, { opacity: 0, duration: 0.4 });
  };

  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
    setUnitsLoading(true);
    try {
      const response = await batchService.getBatch(batch._id);
      if (response.success) setPropertyUnits(response.data.propertyUnits || []);
    } catch (e) { console.error(e); } finally { setUnitsLoading(false); }
  };

  if (loading) return <div className="h-96 flex items-center justify-center bg-white"><div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="bg-white py-2 md:py-24 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-6 border-b border-slate-100 pb-10">
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-blue-600 mb-2">Signature Series</h4>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">Project Collections</h2>
          </div>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
            Scroll or Drag to Explore
          </p>
        </div>

        {/* INTERACTIVE MARQUEE */}
        <div ref={containerRef} className="relative touch-none group">
          
          {/* Edge Fades */}
          {/* <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" /> */}
          {/* <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" /> */}

          <div className=" overflow-visible">
            <div 
              ref={marqueeContentRef}
              className="flex gap-4 will-change-transform py-10"
              style={{ width: 'fit-content' }}
            >
              {[...batches, ...batches, ...batches].map((batch, index) => (
                <div 
                  key={`${batch._id}-${index}`}
                  onClick={() => handleBatchClick(batch)}
                  className="flex-shrink-0 w-[300px] md:w-[420px] group transition-transform duration-500"
                >
                  <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-5 transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] group-hover:border-blue-100">
                    <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50">
                      <img 
                        src={batch.image?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt=""
                      />
                    </div>
                    <div className="flex-1 pl-6">
                      <span className="text-[9px] font-bold tracking-[0.2em] text-blue-600 uppercase block mb-1">
                        {batch.projectStatus?.replace('_', ' ') || 'Exclusive'}
                      </span>
                      <h3 className="text-lg font-serif text-slate-900 leading-tight mb-2">
                        {batch.projectName || batch.batchName}
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

      {/* Premium Modal */}
      {showModal && selectedBatch && (
        <div ref={modalOverlayRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-2xl" style={{ opacity: 0, display: 'none' }}>
          <div ref={modalRef} className="bg-white w-full h-[95vh] md:max-w-6xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100 mx-4">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Inventory Index</span>
              </div>
              <button onClick={handleCloseModal} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-8 md:p-16">
                <h2 className="text-5xl font-serif mb-8 text-slate-900">{selectedBatch.projectName}</h2>
                {unitsLoading ? (
                    <div className="py-20 text-center"><div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin mx-auto" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {propertyUnits.map(unit => (
                            <div key={unit._id} className="bg-white rounded-2xl border border-slate-100 p-2 hover:shadow-xl transition-all duration-500">
                                <PropertyUnitCard propertyUnit={unit} viewMode="compact" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectGroupBatches;