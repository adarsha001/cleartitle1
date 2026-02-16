import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ShieldCheck, Users, Calendar, Handshake, 
  Scale, FileCheck, Search, CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function LuxuryQualitySection() {
  const [counters, setCounters] = useState({ properties: 0, clients: 0, years: 0, deals: 0 });
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

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
        const easeOutExpo = 1 - Math.pow(2, -10 * progress); // Luxury smooth easing

        setCounters({
          properties: Math.floor(targets.properties * easeOutExpo),
          clients: Math.floor(targets.clients * easeOutExpo),
          years: Math.floor(targets.years * easeOutExpo),
          deals: Math.floor(targets.deals * easeOutExpo),
        });

        if (frame === totalFrames) clearInterval(timer);
      }, 1000 / frameRate);
    }
  }, [isInView]);

  const stats = [
    { number: `${counters.properties}+`, label: 'Verified', sublabel: 'Listings', icon: ShieldCheck },
    { number: `${counters.clients}+`, label: 'Private', sublabel: 'Clients', icon: Users },
    { number: `${counters.years}+`, label: 'Years of', sublabel: 'Legacy', icon: Calendar },
    { number: `${counters.deals}+`, label: 'Closed', sublabel: 'Mandates', icon: Handshake },
  ];

  return (
    <section ref={sectionRef} className="relative py-32 px-6 bg-white overflow-hidden text-slate-900">
      
      {/* Background Image - Luxury Watermark Style */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-[0.6] grayscale">
        <img 
          src="/building.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-amber-700 text-xs font-bold tracking-[0.4em] uppercase mb-6 block">
              The Gold Standard
            </span>
            <h2 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-8">
              Uncompromising <br />
              <span className="italic font-light text-slate-500 text-4xl md:text-6xl">Due Diligence</span>
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="text-slate-500 text-lg md:text-xl leading-relaxed max-w-md pb-2 border-l border-amber-200 pl-8"
          >
            We curate assets for the discerning investor. Our rigorous legal protocols ensure that every square foot is a secure sanctuary for your capital.
          </motion.p>
        </div>

        {/* Minimalist Stats - Ultra Clean */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100 border-y border-slate-100 mb-32">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white py-12 flex flex-col items-center text-center">
              <span className="text-4xl md:text-5xl font-light tracking-tighter mb-2">
                {stat.number}
              </span>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-700 mb-1">
                {stat.label}
              </span>
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-slate-400">
                {stat.sublabel}
              </span>
            </div>
          ))}
        </div>

        {/* Verification Cards - Modern Editorial Style */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-8">
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
              transition={{ delay: 0.2 * i }}
              className="group cursor-default"
            >
              <div className="mb-6 h-px w-[300px] bg-slate-100 group-hover:bg-amber-500 transition-colors duration-500" />
              <div className="flex items-center justify-between mb-4">
                <item.icon className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                {/* <span className="text-[10px] font-serif italic text-slate-300">Phase 0{i+1}</span> */}
              </div>
              <h4 className="text-lg font-bold mb-3 tracking-tight">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

    
      </div>
    </section>
  );
}