import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Handshake, 
  Home, 
  MapPin, 
  Building2, 
  FileCheck, 
  Search, 
  CheckCircle2, 
  Scale,
  MessageCircle
} from 'lucide-react';

export default function QualityAssuranceSection() {
  const [counters, setCounters] = useState({ properties: 0, clients: 0, years: 0, deals: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      animateCounters();
    }
  }, [isInView]);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const targets = { properties: 50, clients: 45, years: 2, deals: 50 };
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounters({
        properties: Math.floor(targets.properties * progress),
        clients: Math.floor(targets.clients * progress),
        years: Math.floor(targets.years * progress),
        deals: Math.floor(targets.deals * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  };

  const stats = [
    { number: `${counters.properties}+`, label: 'PROPERTIES', sublabel: 'VERIFIED', icon: ShieldCheck },
    { number: `${counters.clients}+`, label: 'HAPPY', sublabel: 'CLIENTS', icon: Users },
    { number: `${counters.years}+`, label: 'YEARS', sublabel: 'EXPERIENCE', icon: Calendar },
    { number: `${counters.deals}+`, label: 'SUCCESS', sublabel: 'DEALS', icon: Handshake },
  ];

  const propertyTypes = [
    { title: 'Residential', items: ['Apartments', 'Villas', 'Studio', 'Penthouses'], icon: Home, color: 'text-blue-600' },
    { title: 'Plots & Land', items: ['Residential Plots', 'Farm Lands', 'Gated Plots'], icon: MapPin, color: 'text-emerald-600' },
    { title: 'Commercial', items: ['Office Spaces', 'Shops', 'Showrooms', 'Warehouses'], icon: Building2, color: 'text-amber-600' },
  ];
  
  const verificationProcess = [
    { step: '01', title: 'Title Check', desc: '40-year legal title verification', icon: Scale },
    { step: '02', title: 'Doc Scrutiny', desc: 'Complete document examination', icon: FileCheck },
    { step: '03', title: 'Encumbrance', desc: 'Loans & legal disputes check', icon: Search },
    { step: '04', title: 'Approvals', desc: 'RERA & govt. approval check', icon: CheckCircle2 },
  ];

  return (
    <section 
      ref={sectionRef} 
      className="relative py-20 px-4 overflow-hidden min-h-screen flex items-center bg-white"
      style={{
        backgroundImage: "url('/logoo.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Image/Logo Container */}
      <div className="absolute inset-0 z-0">
        {/* <img 
          src='/logoo.png' 
          alt="Verification Background" 
          className="w-full h-full object-cover opacity-20" // Reduced opacity for black text contrast
        /> */}
        {/* Light Overlay to ensure black text pops */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full border border-blue-600/20 bg-blue-600/10 text-blue-700 text-xs font-bold tracking-[0.2em] uppercase mb-4 inline-block">
              Premium Quality Control
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              100% Verified Properties
            </h2>
            <p className="text-slate-700 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              We eliminate the risk. Every listing passes through a rigorous <span className="text-blue-700 font-bold">4-step legal scrutiny</span> before appearing on our platform.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid - Light Glassmorphism */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/40 backdrop-blur-md border border-slate-200/60 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-white/60 transition-all shadow-sm"
            >
              <stat.icon className="w-6 h-6 text-blue-600 mb-3" />
              <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.number}</span>
              <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-2">
                {stat.label} <br/> {stat.sublabel}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Property Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {propertyTypes.map((type, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="bg-white/60 backdrop-blur-lg border border-slate-200 p-8 rounded-[2rem] group shadow-sm hover:shadow-xl transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                <type.icon className={`w-6 h-6 ${type.color}`} />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 mb-4">{type.title}</h4>
              <div className="flex flex-wrap gap-2">
                {type.items.map((item, i) => (
                  <span key={i} className="text-xs font-bold py-1.5 px-3 bg-slate-100/80 text-slate-700 rounded-full border border-slate-200">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

          <div className="bg-white/40 backdrop-blur-2xl border border-slate-200/50 rounded-[3rem] p-10 md:p-16 shadow-xl shadow-slate-200/20">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
    {[
      { 
        step: '01', 
        title: 'Title Check', 
        icon: Scale, 
        desc: '40-year history audit',
        iconColor: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      },
      { 
        step: '02', 
        title: 'Doc Scrutiny', 
        icon: FileCheck, 
        desc: 'Original deed verification',
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50'
      },
      { 
        step: '03', 
        title: 'Encumbrance', 
        icon: Search, 
        desc: 'Zero loan & liability check',
        iconColor: 'text-rose-600',
        bgColor: 'bg-rose-50'
      },
      { 
        step: '04', 
        title: 'Approvals', 
        icon: CheckCircle2, 
        desc: 'RERA & Govt. compliance',
        iconColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
      },
    ].map((item, i) => (
      <div key={i} className="relative group">
        {/* Large stylized background number */}
        <span className="text-8xl font-black text-slate-900/[0.03] absolute -top-10 -left-6 select-none group-hover:text-slate-900/[0.06] transition-colors">
          {item.step}
        </span>
        
        {/* Icon Container with subtle glow */}
        <div className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-sm border border-white`}>
          <item.icon className={`w-7 h-7 ${item.iconColor}`} />
        </div>
        
        {/* Text Content */}
        <h5 className="text-slate-900 font-extrabold text-xl mb-2 relative z-10 tracking-tight">
          {item.title}
        </h5>
        <p className="text-slate-600 text-sm font-medium leading-relaxed relative z-10">
          {item.desc}
        </p>
        
        {/* Bottom decorative line that animates on hover */}
        <div className="absolute -bottom-2 left-0 w-0 h-1 bg-slate-900 rounded-full group-hover:w-12 transition-all duration-300" />
      </div>
    ))}
  </div>
</div>
      </div>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)] flex items-center gap-3 font-bold transition-all"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="hidden md:inline">Expert Consultation</span>
      </motion.button>
    </section>
  );
}