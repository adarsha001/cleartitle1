import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ArrowRight, Quote, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LuxuryAuthCTA = () => {
  const { isAuthenticated, userInfo, loading } = useAuth();

  const quotes = [
    "“Real estate is the closest thing to the proverbial pot of gold.”",
    "“The best investment on earth is earth.”",
    "“Ownership is the foundation of legacy.”",
    "“Buy land, they’re not making it anymore.”"
  ];
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  if (loading) {
    return <div className="w-full h-40 bg-stone-100/50 animate-pulse rounded-2xl" />;
  }

  return (
    <section className="w-full bg-[#F5F2EE]  px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            /* COMPACT GUEST STATE */
            <motion.div
              key="guest-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl lg:rounded-[2rem] bg-[#FAF9F6] border border-stone-200/60 shadow-lg shadow-stone-200/30"
            >
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Text Content */}
                <div className="flex-1 p-6 md:p-10 lg:p-12 relative z-10">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100/40 border border-amber-200/40 mb-4">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span className="text-[8px] lg:text-[9px] font-bold tracking-widest text-amber-800 uppercase">Legacy Real Estate</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-stone-900 mb-3 leading-tight">
                    Your property deserves <span className="italic font-light text-amber-700/80">The Gold Standard.</span>
                  </h2>

                  <p className="text-stone-600 text-sm lg:text-base max-w-md mb-6 leading-relaxed font-light">
                    Enter an elite marketplace where clear titles meet distinguished capital. 
                  </p>

                  <div className="flex items-center gap-6">
                    <Link to="/login">
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#292524' }}
                        className="px-8 py-3 bg-stone-900 text-white font-bold rounded-full shadow-md transition-all tracking-wide text-xs lg:text-sm"
                      >
                        Sign In to Sell
                      </motion.button>
                    </Link>
                    <Link to="/register" className="text-stone-500 hover:text-amber-800 text-[10px] font-bold tracking-widest uppercase transition-all border-b border-transparent hover:border-amber-800">
                      Register
                    </Link>
                  </div>
                </div>

                {/* Compact Image Section */}
                <div className="hidden md:block md:w-[35%] lg:w-[30%] bg-[#EFECE7] relative overflow-hidden">
                  <img 
                    src='./girl.png' 
                    alt="Luxury Real Estate" 
                    className="w-full h-full object-cover object-top" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/10 via-transparent to-transparent" />
                </div>
              </div>
            </motion.div>
          ) : (
            /* COMPACT MEMBER STATE */
            <motion.div
              key="auth-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative overflow-hidden rounded-2xl lg:rounded-[2rem] bg-[#FAF9F6] border border-stone-200/60 p-6 md:p-8 lg:p-10 shadow-lg shadow-stone-200/30"
            >
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                {/* User Identity Section */}
                <div className="shrink-0 flex items-center gap-4 sm:flex-col sm:text-center">
                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-300 via-stone-200 to-amber-100 shadow-sm">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-[#FAF9F6]">
                      {userInfo?.avatar ? (
                        <img src={userInfo.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-serif text-stone-300">
                          {userInfo?.name?.charAt(0) || 'I'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold tracking-widest text-amber-700 uppercase block">Verified</span>
                    <h3 className="text-lg font-serif text-stone-900 leading-none mt-1">
                      {userInfo?.name?.split(' ')[0] || 'Investor'}
                    </h3>
                  </div>
                </div>

                {/* Inspiration Section */}
                <div className="flex-1 text-center sm:text-left sm:border-l sm:border-stone-200/60 sm:pl-10">
                  <Quote className="w-6 h-6 text-amber-200/60 mb-2 mx-auto sm:mx-0" />
                  <p className="text-lg md:text-xl lg:text-2xl font-serif italic text-stone-800 leading-snug mb-4">
                    {dailyQuote}
                  </p>
                  
                  <Link 
                    to="/list-property" 
                    className="group inline-flex items-center gap-2 text-[9px] font-bold tracking-[0.2em] text-stone-500 uppercase hover:text-amber-800 transition-all"
                  >
                    Manage Listings <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LuxuryAuthCTA;