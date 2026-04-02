import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  ArrowRight, 
  Quote, 
  Sparkles, 
  Home, 
  Key, 
  Shield,
  ChevronRight,
  Star,
  User,
  Eye,
  Heart,
  Award,
  Building2,
  TrendingUp,
  CheckCircle2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios.js';

const LuxuryAuthCTA = () => {
  const { isAuthenticated, userInfo, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    postedProperties: 0,
    savedProperties: 0,
    enquiries: 0,
    memberSince: '2024'
  });
  const [loading, setLoading] = useState(false);

  const quotes = [
    "“A house is made of walls and beams; a home is built with love and dreams.”",
    "“Home is not a place, it's a feeling.”",
    "“Every key unlocks a new chapter in your life.”",
    "“Find where your heart feels at home.”",
    "“Your home should tell the story of who you are.”",
    "“Home is the starting place of love, hope, and dreams.”",
    "“The magic thing about home is that it feels good to leave, and it feels even better to come back.”",
    "“Where we love is home.”",
    "“A home is more than a roof over your head—it's where life happens.”",
    "“Building dreams, one foundation at a time.”",
    "“Home is the nicest word there is.”",
    "“The strength of a nation lies in the homes of its people.”",
    "“Happiness is finding the perfect place to call your own.”",
    "“A place to live, a space to love, a home to grow.”",
    "“Your journey home begins here.”",
    "“Every home has a story. What will yours be?”",
    "“Creating spaces where memories live forever.”",
    "“Home is the anchor of our existence.”",
    "“The smallest house can hold the biggest heart.”",
    "“A home is not just a place, it's a promise of tomorrow.”",
    "“Where your story begins and your heart belongs.”",
    "“Four walls and a roof, filled with endless possibilities.”",
    "“Home sweet home—the phrase that never grows old.”",
    "“A place to come back to, a place to move forward from.”",
    "“Building more than houses, building futures.”",
    "“Every family deserves a place to call their own.”",
    "“The memories you make become the soul of your home.”",
    "“A home is love made visible.”",
    "“Not just a location, but a destination for your heart.”",
    "“Come home to where your heart belongs.”"
  ];
  
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  // Fetch user data when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          // Fetch profile data
          const profileResponse = await API.get('/users/profile');
          setUserData(profileResponse.data.user);

          // Fetch stats
          const [postedRes, savedRes, enquiriesRes] = await Promise.all([
            API.get('/users/posted-properties?limit=1'),
            API.get('/users/liked-properties'),
            API.get('/users/my-enquiries?limit=1')
          ]);

          // Calculate member since year
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
          // Fallback to userInfo from auth context
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
      <div className="w-full max-w-[500px] mx-auto aspect-[9/16] bg-gradient-to-br from-stone-100 to-stone-200 animate-pulse rounded-[40px] shadow-2xl" />
    );
  }

  return (
    <section className="w-[35vw] min-w-[400px] flex items-center justify-center px-6 pt-4 hidden lg:block">
      <div className="max-w-[500px] w-full mx-auto">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            /* GUEST STATE - Large Format with Multiple Login CTAs */
            <motion.div
              key="guest-state"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="relative aspect-[9/16] w-full overflow-hidden rounded-[40px] bg-white group"
            >
              {/* Premium Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 via-white to-stone-50/90" />
              
              {/* Abstract Pattern Overlay */}
              <div className="absolute inset-0 opacity-[0.04]">
                <div className="absolute top-0 left-0 w-96 h-96 bg-amber-200 rounded-full filter blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-stone-300 rounded-full filter blur-3xl" />
              </div>

              {/* Floating Login Button - Top Right */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="absolute top-6 right-6 z-30"
              >
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-amber-200 hover:bg-amber-50 transition-all duration-300"
                  >
                    <LogIn className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-semibold text-stone-800">Sign In</span>
                  </motion.button>
                </Link>
              </motion.div>

              {/* Floating Get Started Badge - Top Left */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-6 left-6 z-30"
              >
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white">Get Started</span>
                  </motion.button>
                </Link>
              </motion.div>

              {/* Hero Image Section - Clickable for Login */}
              <Link to="/login">
                <div className="absolute top-0 left-0 right-0 h-[50%] overflow-hidden cursor-pointer group/image">
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent z-10" />
                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-500 z-20" />
                  
                  {/* Overlay Text on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-500 z-30">
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl">
                      <span className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
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

              {/* Content Section - Bottom 50% */}
              <div className="absolute bottom-0 left-0 right-0 h-[50%] p-8 flex flex-col justify-between">
                <div>
                  {/* Brand Header */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 mb-4"
                  >
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Building2 className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-stone-500 tracking-wider">LEGACY ESTATE</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px] font-medium text-stone-400">VERIFIED PLATFORM</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Main Heading */}
                  <motion.h2 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-serif text-stone-900 mb-3 leading-tight"
                  >
                    Your property deserves
                    <span className="block italic font-light text-amber-700 mt-2 text-4xl">The Gold Standard.</span>
                  </motion.h2>

                  {/* Description */}
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-stone-600 text-base leading-relaxed font-light mb-6"
                  >
                    Enter an elite marketplace where clear titles meet distinguished capital. 
                    Connect with premium buyers and sellers in an exclusive environment.
                  </motion.p>

                  {/* Premium Features Grid */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-3 mb-6"
                  >
                    {[
                      { icon: Shield, label: 'Verified Properties', value: '10,000+' },
                      { icon: User, label: 'Premium Investors', value: '5,000+' },
                      { icon: Key, label: 'Clear Title Guarantee', value: '100%' },
                      { icon: TrendingUp, label: 'Exclusive Access', value: '24/7' }
                    ].map((feature, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ scale: 1.02, backgroundColor: '#fef3c7' }}
                        className="flex items-center gap-3 p-2 rounded-xl bg-amber-50/50 transition-colors cursor-pointer"
                        onClick={() => navigate('/login')}
                      >
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <feature.icon className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-stone-600">{feature.label}</span>
                          <p className="text-sm font-bold text-stone-900">{feature.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  {/* Primary Login Button */}
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-base flex items-center justify-center gap-3"
                    >
                      <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Sign In to Your Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  
                  {/* Secondary Links */}
                  <div className="flex items-center justify-between px-4">
                    <Link to="/register" className="text-xs font-medium text-stone-400 hover:text-amber-700 transition-colors">
                      Create Account
                    </Link>
                    <span className="text-stone-300 text-lg">•</span>
                    <Link to="/properties" className="text-xs font-medium text-stone-400 hover:text-amber-700 transition-colors">
                      Browse Listings
                    </Link>
                    <span className="text-stone-300 text-lg">•</span>
                    <Link to="/about" className="text-xs font-medium text-stone-400 hover:text-amber-700 transition-colors">
                      Learn More
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </motion.div>
          ) : (
            /* MEMBER STATE - With Genuine User Data */
            <motion.div
              key="auth-state"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="relative aspect-[9/16] w-full overflow-hidden rounded-[40px] bg-white "
            >
              {/* Premium Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-white to-stone-50/60" />
              
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-200 rounded-full filter blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-stone-300 rounded-full filter blur-3xl animate-pulse delay-1000" />
              </div>

              {/* Top Header */}
              <div className="absolute top-0 left-0 right-0 p-8">
                <div className="flex justify-between items-center">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/50"
                  >
                    <Key className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-semibold text-stone-800">
                      {userData?.userType === 'agent' ? 'AGENT' : 
                       userData?.userType === 'builder' ? 'BUILDER' : 
                       userData?.userType === 'seller' ? 'SELLER' : 'MEMBER'}
                    </span>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-xl"
                  >
                    <span className="text-xs font-bold text-white">
                      {userData?.isVerified ? 'VERIFIED' : 'PREMIUM'}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Main Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                {/* Profile Section with Glow Effect */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="relative mb-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-300 via-amber-200 to-amber-100 rounded-full filter blur-2xl opacity-70" />
                  <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-amber-400 via-stone-300 to-amber-300">
                    <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl">
                      {userData?.avatar ? (
                        <img 
                          src={userData.avatar} 
                          alt={userData.name || 'Profile'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'User')}&background=8B5A2B&color=fff&size=128`;
                          }}
                        />
                      ) : (
                        <span className="text-5xl font-serif text-stone-400">
                          {userData?.name?.charAt(0)?.toUpperCase() || 
                           userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Verification Badge with Animation */}
                  {userData?.isVerified && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="absolute -bottom-2 -right-2 bg-green-600 p-2 rounded-full border-4 border-white shadow-xl"
                    >
                      <Shield className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </motion.div>

                {/* User Info */}
                <motion.h3 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-serif text-stone-900 mb-2"
                >
                  {userData?.name || userInfo?.name || 'Welcome Back'}
                </motion.h3>
                
                {/* Contact Info - Show email/phone if available */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex flex-col items-center gap-1 mb-6"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <p className="text-xs font-medium tracking-widest text-amber-600 uppercase">
                      Member Since {stats.memberSince}
                    </p>
                  </div>
                  
                  {(userData?.gmail || userInfo?.email) && (
                    <div className="flex items-center gap-1 text-stone-600">
                      <Mail className="w-3 h-3" />
                      <span className="text-xs truncate max-w-[150px]">
                        {userData?.gmail || userInfo?.email}
                      </span>
                    </div>
                  )}
                  
                  {userData?.phoneNumber && userData.phoneNumber !== '1234567890' && (
                    <div className="flex items-center gap-1 text-stone-600">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs">{userData.phoneNumber}</span>
                    </div>
                  )}
                </motion.div>

                {/* Enhanced Stats - With Real Data */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center gap-12 mb-10"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Home className="w-4 h-4 text-amber-600" />
                      <div className="text-2xl font-bold text-stone-900">{stats.postedProperties}</div>
                    </div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider">Listings</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Heart className="w-4 h-4 text-amber-600" />
                      <div className="text-2xl font-bold text-stone-900">{stats.savedProperties}</div>
                    </div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider">Saved</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Eye className="w-4 h-4 text-amber-600" />
                      <div className="text-2xl font-bold text-stone-900">{stats.enquiries}</div>
                    </div>
                    <div className="text-[10px] text-stone-500 uppercase tracking-wider">Enquiries</div>
                  </div>
                </motion.div>

                {/* Quote Section with Decorative Elements */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="relative mb-10 px-6"
                >
                  <Quote className="absolute -top-4 -left-2 w-6 h-6 text-amber-200/80" />
                  <Quote className="absolute -bottom-4 -right-2 w-6 h-6 text-amber-200/80 rotate-180" />
                  <p className="text-lg font-serif italic text-stone-700 leading-relaxed px-4">
                    {dailyQuote}
                  </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full space-y-3"
                >
                  <Link to="/profile">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group w-full py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-base flex items-center justify-center gap-3"
                    >
                      <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      {stats.postedProperties > 0 ? 'Manage Your Listings' : 'List Your Property'}
                    </motion.button>
                  </Link>
                  
            
                </motion.div>
              </div>

              {/* Bottom Gradient Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-200 via-stone-400 to-amber-200" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default LuxuryAuthCTA;