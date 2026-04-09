// Cta_button.jsx - Updated with fixed dimensions for uniformity
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  ArrowRight, 
  Sparkles, 
  Home, 
  Key, 
  Shield,
  User,
  Eye,
  Heart,
  Award,
  Building2,
  TrendingUp,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios.js';

const LuxuryAuthCTA = () => {
  const { isAuthenticated, userInfo, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    postedProperties: 0,
    savedProperties: 0,
    enquiries: 0,
    memberSince: '2024'
  });
  const [loading, setLoading] = useState(false);

  const quotes = [
    "A house is made of walls and beams; a home is built with love and dreams.",
    "Home is not a place, it's a feeling.",
    "Every key unlocks a new chapter in your life.",
    "Find where your heart feels at home."
  ];
  
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const profileResponse = await API.get('/users/profile');
          setUserData(profileResponse.data.user);

          const [postedRes, savedRes, enquiriesRes] = await Promise.all([
            API.get('/users/posted-properties?limit=1'),
            API.get('/users/liked-properties'),
            API.get('/users/my-enquiries?limit=1')
          ]);

          const memberYear = profileResponse.data.user.createdAt 
            ? new Date(profileResponse.data.user.createdAt).getFullYear()
            : 2024;

          setStats({
            postedProperties: postedRes.data.stats?.total || 0,
            savedProperties: savedRes.data.likedProperties?.length || 0,
            enquiries: enquiriesRes.data.enquiries?.length || 0,
            memberSince: memberYear
          });

        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(userInfo);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, userInfo]);

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="w-full h-[440px] bg-gradient-to-br from-stone-100 to-stone-200 animate-pulse rounded-3xl shadow-xl" />
    );
  }

  return (
    <div className="w-full h-full flex items-center">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            /* GUEST STATE - Fixed Height */
            <motion.div
              key="guest-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full h-[440px] overflow-hidden rounded-3xl bg-white shadow-2xl group"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 " />
              
              {/* Ambient Glow */}
              <div className="absolute inset-0 opacity-[0.06]">
                <div className="absolute top-0 left-0 w-64 h-64 bg-amber-200 rounded-full filter blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-stone-300 rounded-full filter blur-3xl" />
              </div>

              {/* Floating Buttons */}
              <div className="absolute top-4 right-4 z-30 flex gap-2">
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-bold text-white">Join</span>
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-amber-200"
                  >
                    <LogIn className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-xs font-semibold text-stone-800">Login</span>
                  </motion.button>
                </Link>
              </div>

              {/* Hero Image */}
              <Link to="/login">
                <div className="absolute top-0 left-0 right-0 h-[38%] overflow-hidden cursor-pointer group/image">
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent z-10" />
                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-500 z-20" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-500 z-30">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <LogIn className="w-3.5 h-3.5" />
                        Click to Login
                      </span>
                    </div>
                  </div>
                  
                  <img 
                    src='./girl.png' 
                    alt="Luxury Real Estate" 
                    className="w-full h-full object-cover object-center scale-105 group-hover/image:scale-110 transition-transform duration-700"
                  />
                </div>
              </Link>

              {/* Content Section */}
              <div className="absolute bottom-0 left-0 right-0 h-[62%] p-5 flex flex-col">
                {/* Brand Header */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <Building2 className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-stone-500 tracking-wider">LEGACY ESTATE</span>
                    <div className="flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" />
                      <span className="text-[9px] font-medium text-stone-400">VERIFIED</span>
                    </div>
                  </div>
                </motion.div>

                {/* Main Heading */}
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-serif text-stone-900 leading-tight"
                >
                  Your property deserves
                  <span className="block italic font-light text-amber-700 text-2xl">The Gold Standard.</span>
                </motion.h2>

                {/* Description */}
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-stone-600 text-xs leading-relaxed font-light mt-2 mb-3 line-clamp-2"
                >
                  Enter an elite marketplace where clear titles meet distinguished capital.
                </motion.p>

                {/* Premium Features Grid */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="grid grid-cols-2 gap-2 mb-3"
                >
                  {[
                    { icon: Shield, label: 'Verified', value: '10K+' },
                    { icon: User, label: 'Investors', value: '5K+' },
                    { icon: Key, label: 'Clear Title', value: '100%' },
                    { icon: TrendingUp, label: 'Access', value: '24/7' }
                  ].map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = '/login'}
                    >
                      <div className="p-1 bg-white rounded-md shadow-sm">
                        <feature.icon className="w-3 h-3 text-amber-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-medium text-stone-600 block truncate">{feature.label}</span>
                        <p className="text-xs font-bold text-stone-900">{feature.value}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-auto space-y-2"
                >
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      Sign In to Your Account
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  
                  <div className="flex items-center justify-between px-2">
                    <Link to="/register" className="text-[10px] font-medium text-stone-400 hover:text-amber-700 transition-colors">
                      Create Account
                    </Link>
                    <span className="text-stone-300 text-sm">•</span>
                    <Link to="/properties" className="text-[10px] font-medium text-stone-400 hover:text-amber-700 transition-colors">
                      Browse Listings
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </motion.div>
          ) : (
            /* MEMBER STATE - Fixed Height */
            <motion.div
              key="auth-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full h-[440px] overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-white to-stone-50/60" />
              
              {/* Ambient Glow */}
              <div className="absolute inset-0 opacity-8">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200 rounded-full filter blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-stone-300 rounded-full filter blur-3xl animate-pulse delay-1000" />
              </div>

              {/* Top Header */}
              <div className="absolute top-0 left-0 right-0 p-4">
                <div className="flex justify-between items-center">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-white/50"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-[10px] font-semibold text-stone-800">
                      {userData?.userType === 'agent' ? 'AGENT' : 
                       userData?.userType === 'builder' ? 'BUILDER' : 
                       userData?.userType === 'seller' ? 'SELLER' : 'MEMBER'}
                    </span>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-md"
                  >
                    <span className="text-[10px] font-bold text-white">
                      {userData?.isVerified ? 'VERIFIED' : 'PREMIUM'}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Main Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center pt-10">
                {/* Profile Section */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="relative mb-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-300 via-amber-200 to-amber-100 rounded-full filter blur-xl opacity-60" />
                  <div className="relative p-1 rounded-full bg-gradient-to-tr from-amber-400 via-stone-300 to-amber-300">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden border-3 border-white shadow-lg">
                      {userData?.avatar ? (
                        <img 
                          src={userData.avatar} 
                          alt={userData.name || 'Profile'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'User')}&background=8B5A2B&color=fff&size=80`;
                          }}
                        />
                      ) : (
                        <span className="text-3xl font-serif text-stone-400">
                          {userData?.name?.charAt(0)?.toUpperCase() || 
                           userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {userData?.isVerified && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="absolute -bottom-1 -right-1 bg-green-600 p-1 rounded-full border-2 border-white shadow-md"
                    >
                      <Shield className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                {/* User Info */}
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xl font-serif text-stone-900 mb-0.5"
                >
                  {userData?.name || userInfo?.name || 'Welcome Back'}
                </motion.h3>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center gap-0.5 mb-3"
                >
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <p className="text-[10px] font-medium tracking-widest text-amber-600 uppercase">
                      Member Since {stats.memberSince}
                    </p>
                  </div>
                  
                  {(userData?.gmail || userInfo?.email) && (
                    <div className="flex items-center gap-1 text-stone-600">
                      <Mail className="w-3 h-3" />
                      <span className="text-[10px] truncate max-w-[150px]">
                        {userData?.gmail || userInfo?.email}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex justify-center gap-8 mb-3"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Home className="w-3.5 h-3.5 text-amber-600" />
                      <div className="text-xl font-bold text-stone-900">{stats.postedProperties}</div>
                    </div>
                    <div className="text-[9px] text-stone-500 uppercase tracking-wider">Listings</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-amber-600" />
                      <div className="text-xl font-bold text-stone-900">{stats.savedProperties}</div>
                    </div>
                    <div className="text-[9px] text-stone-500 uppercase tracking-wider">Saved</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <div className="text-xl font-bold text-stone-900">{stats.enquiries}</div>
                    </div>
                    <div className="text-[9px] text-stone-500 uppercase tracking-wider">Enquiries</div>
                  </div>
                </motion.div>

                {/* Quote */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative mb-3 px-4"
                >
                  <p className="text-xs font-serif italic text-stone-600 leading-relaxed px-3 line-clamp-2">
                    "{dailyQuote}"
                  </p>
                </motion.div>

                {/* CTA Button */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="w-full"
                >
                  <Link to="/profile">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group w-full py-2.5 bg-gradient-to-r from-stone-900 to-stone-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      {stats.postedProperties > 0 ? 'Manage Listings' : 'List Your Property'}
                    </motion.button>
                  </Link>
                </motion.div>
              </div>

              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-200 via-stone-400 to-amber-200" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LuxuryAuthCTA;