import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ShieldCheck, Users, Calendar, Handshake, 
  Scale, FileCheck, Search, CheckCircle2,
} from 'lucide-react';

export default function LuxuryQualitySection() {
  const [counters, setCounters] = useState({ properties: 0, clients: 0, years: 0, deals: 0 });
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 }); // Trigger earlier on mobile

  useEffect(() => {
    if (isInView) {
      const targets = { properties: 50, clients: 45, years: 2, deals: 50 };
      const duration = 2000;
      const frameRate = 60;
      const totalFrames = (duration / 1000) * frameRate;
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOutExpo = 1 - Math.pow(2, -10 * progress);

        setCounters({
          properties: Math.floor(targets.properties * easeOutExpo),
          clients: Math.floor(targets.clients * easeOutExpo),
          years: Math.floor(targets.years * easeOutExpo),
          deals: Math.floor(targets.deals * easeOutExpo),
        });

        if (frame === totalFrames) clearInterval(timer);
      }, 1000 / frameRate);
      return () => clearInterval(timer);
    }
  }, [isInView]);

  const stats = [
    { number: `${counters.properties}+`, label: 'Verified', sublabel: 'Listings' },
    { number: `${counters.clients}+`, label: 'Private', sublabel: 'Clients' },
    { number: `${counters.years}+`, label: 'Years of', sublabel: 'Legacy' },
    { number: `${counters.deals}+`, label: 'Closed', sublabel: 'Mandates' },
  ];

  return (
    <section ref={sectionRef} className="relative py-16 lg:py-32 px-6 bg-white overflow-hidden text-slate-900">
      
      {/* Background Image - Compact on Mobile, Expansive on Desktop */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-[300px] lg:h-full pointer-events-none opacity-30 lg:opacity-60 grayscale">
        <img 
          src="/building.png" 
          alt="" 
          className="w-full h-full object-cover object-right-top lg:object-center"
        />
        {/* Subtle gradient to blend image on mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white lg:hidden" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="text-amber-700 text-[10px] lg:text-xs font-bold tracking-[0.4em] uppercase mb-4 block">
              The Gold Standard
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif leading-tight mb-6">
              Uncompromising <br />
              <span className="italic font-light text-slate-500 text-3xl md:text-4xl lg:text-6xl">Due Diligence</span>
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="text-slate-500 text-base lg:text-xl leading-relaxed max-w-md pb-2 border-l border-amber-200 pl-6 lg:pl-8"
          >
            We curate assets for the discerning investor. Our rigorous legal protocols ensure that every square foot is a secure sanctuary for your capital.
          </motion.p>
        </div>

        {/* Stats Grid - Tighter gaps on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 border-y border-slate-100 mb-16 lg:mb-32">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white py-8 lg:py-12 flex flex-col items-center text-center">
              <span className="text-3xl lg:text-5xl font-light tracking-tighter mb-1 lg:mb-2">
                {stat.number}
              </span>
              <span className="text-[9px] lg:text-[10px] font-bold tracking-[0.2em] lg:tracking-[0.3em] uppercase text-amber-700">
                {stat.label}
              </span>
              <span className="text-[9px] lg:text-[10px] font-medium uppercase text-slate-400">
                {stat.sublabel}
              </span>
            </div>
          ))}
        </div>

        {/* Verification Cards - Single Column Mobile, Multi-Column Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-10 lg:gap-8">
          {[
            { title: 'Title Heritage', icon: Scale, desc: 'A 40-year deep-dive into historical ownership records.' },
            { title: 'Document Forensic', icon: FileCheck, desc: 'Authentication of original deeds and transfer certificates.' },
            { title: 'Fiscal Transparency', icon: Search, desc: 'Verification of non-encumbrance and zero liability status.' },
            { title: 'Statutory Accord', icon: CheckCircle2, desc: 'Strict adherence to RERA and municipal governing laws.' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i }}
              className="group"
            >
              <div className="mb-4 lg:mb-6 h-px w-4 lg:w-full bg-slate-100 group-hover:bg-amber-500 transition-all duration-500" />
              <item.icon className="w-5 h-5 text-slate-400 mb-4 group-hover:text-amber-600 transition-colors" />
              <h4 className="text-base lg:text-lg font-bold mb-2 tracking-tight">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}