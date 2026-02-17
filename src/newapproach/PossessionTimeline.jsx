import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  Clock, 
  Home, 
  Building, 
  Building2,
  ChevronRight,
  MapPin,
  CheckCircle,
  CalendarDays,
  TrendingUp,
  Sparkles,
  Star,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  MoreHorizontal,
  Filter,
  Crown,
  Gem,
  Target,
  ArrowRight,
  LayoutGrid,
  X,
  Loader2
} from "lucide-react";
import { propertyUnitAPI } from "../api/propertyUnitAPI";
import PropertyUnitCard from "../components/PropertyUnitCard";
import gsap from "gsap";

const PossessionTimeline = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("ready-to-move");
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);
  const gridContainerRef = useRef(null);
  const mobileViewRef = useRef(null);
  const headerRef = useRef(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [stats, setStats] = useState({
    "ready-to-move": 0,
    "under-construction": 0,
    "resale": 0,
    total: 0
  });

  const ITEMS_PER_PAGE_MOBILE = 3; // Show 3 items on mobile initially

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!isMobile || showAllGrid || !hasMore || loadingMore || !scrollContainerRef.current) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: scrollContainerRef.current,
      rootMargin: '100px',
      threshold: 0.1
    };

    const callback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore && pagination.hasNextPage) {
        loadMoreProperties();
      }
    };

    observerRef.current = new IntersectionObserver(callback, options);

    // Observe the loading element
    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMobile, showAllGrid, hasMore, loadingMore, pagination.hasNextPage, propertyUnits.length]);

  // Re-observe when new items are loaded
  useEffect(() => {
    if (!isMobile || showAllGrid || !hasMore || loadingMore || !observerRef.current) return;

    // Update observer to watch the new loading element
    if (loadingRef.current) {
      observerRef.current.disconnect();
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [propertyUnits.length, isMobile, showAllGrid, hasMore, loadingMore]);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current && isMobile && !showAllGrid) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        
        // Fixed pagination calculation
        const maxScroll = scrollWidth - clientWidth;
        const scrollPercentage = maxScroll > 0 ? scrollLeft / maxScroll : 0;
        const newPage = Math.min(
          Math.ceil(scrollPercentage * totalPages),
          totalPages
        );
        
        if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
        }
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [propertyUnits, isMobile, currentPage, totalPages, showAllGrid]);

  // GSAP Animation for view transitions
  useEffect(() => {
    if (!isMobile || isTransitioning) return;

    if (showAllGrid && gridContainerRef.current && mobileViewRef.current) {
      // Animate from scroll view to grid view
      const tl = gsap.timeline({
        onStart: () => setIsTransitioning(true),
        onComplete: () => setIsTransitioning(false)
      });

      // Fade out scroll view
      tl.to(mobileViewRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in"
      })
      // Animate grid container
      .fromTo(gridContainerRef.current,
        {
          opacity: 0,
          y: 30,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.2)"
        },
        "-=0.1"
      )
      // Animate grid items with stagger
      .fromTo(
        ".grid-view-item",
        {
          opacity: 0,
          y: 30,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out"
        },
        "-=0.2"
      );
    } else if (!showAllGrid && mobileViewRef.current && headerRef.current) {
      // Animate from grid view back to scroll view
      const tl = gsap.timeline({
        onStart: () => setIsTransitioning(true),
        onComplete: () => setIsTransitioning(false)
      });

      // Fade out grid
      tl.to(gridContainerRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in"
      })
      // Animate scroll view
      .fromTo(mobileViewRef.current,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "back.out(1.2)"
        },
        "-=0.1"
      )
      // Animate header
      .fromTo(headerRef.current,
        {
          opacity: 0,
          y: -20
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out"
        },
        "-=0.3"
      );
    }
  }, [showAllGrid, isMobile]);

  const scrollLeft = () => {
    if (scrollContainerRef.current && isMobile && !isTransitioning) {
      const itemWidth = 280 + 16;
      const newScrollLeft = Math.max(0, scrollContainerRef.current.scrollLeft - itemWidth);
      
      gsap.to(scrollContainerRef.current, {
        scrollLeft: newScrollLeft,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && isMobile && !isTransitioning) {
      const itemWidth = 280 + 16;
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const newScrollLeft = Math.min(maxScroll, scrollContainerRef.current.scrollLeft + itemWidth);
      
      gsap.to(scrollContainerRef.current, {
        scrollLeft: newScrollLeft,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current && isMobile && !showAllGrid && !isTransitioning) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
      
      // Fixed pagination calculation
      const maxScroll = scrollWidth - clientWidth;
      const scrollPercentage = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      const newPage = Math.min(
        Math.ceil(scrollPercentage * totalPages),
        totalPages
      );
      
      if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    }
  };

  const handlePageClick = (page) => {
    if (scrollContainerRef.current && !isTransitioning) {
      const itemWidth = 280 + 16;
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const scrollPosition = Math.min(
        maxScroll,
        (page - 1) * itemWidth
      );
      
      gsap.to(scrollContainerRef.current, {
        scrollLeft: scrollPosition,
        duration: 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          setCurrentPage(page);
        }
      });
    }
  };

  const handleViewAll = () => {
    if (isTransitioning) return;
    setShowAllGrid(true);
  };

  const handleCloseGrid = () => {
    if (isTransitioning) return;
    setShowAllGrid(false);
    setCurrentPage(1);
  };

  // Possession status categories
  const possessionCategories = [
    {
      id: "ready-to-move",
      title: "Ready to Move",
      subtitle: "Immediate possession",
      description: "Properties available for immediate occupancy",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "blue"
    },
    {
      id: "under-construction",
      title: "Under Construction",
      subtitle: "New projects",
      description: "Properties that are currently being built",
      icon: <Building className="w-5 h-5" />,
      color: "indigo"
    },
    {
      id: "resale",
      title: "Resale Properties",
      subtitle: "Pre-owned homes",
      description: "Previously owned properties available for sale",
      icon: <Home className="w-5 h-5" />,
      color: "blue"
    }
  ];

  // Calculate total pages
  const calculateTotalPages = (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  // Update pagination state
  const updatePagination = (response, page) => {
    const totalItems = response.data.total || propertyUnits.length;
    const itemsPerPage = pagination.itemsPerPage;
    const totalPages = calculateTotalPages(totalItems, itemsPerPage);
    
    setPagination(prev => ({
      ...prev,
      currentPage: page,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }));

    // Update mobile total pages
    setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE_MOBILE));
    setCurrentPage(1);
    setHasMore(page < totalPages);
  };

  // Fetch property counts for each category
  const fetchPropertyStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all properties first
      const res = await propertyUnitAPI.getPropertyUnits({
        limit: 1000,
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      
      if (res.data && res.data.success) {
        const allUnits = res.data.data || [];
        
        // Calculate counts for each status
        const readyToMoveCount = allUnits.filter(unit => 
          unit.possessionStatus === "ready-to-move"
        ).length;
        
        const underConstructionCount = allUnits.filter(unit => 
          unit.possessionStatus === "under-construction"
        ).length;
        
        const resaleCount = allUnits.filter(unit => 
          unit.possessionStatus === "resale"
        ).length;
        
        setStats({
          "ready-to-move": readyToMoveCount,
          "under-construction": underConstructionCount,
          "resale": resaleCount,
          total: allUnits.length
        });
        
        // Load initial properties for "ready-to-move" category
        fetchPropertiesForCategory("ready-to-move", 1);
      }
    } catch (error) {
      console.error("Error fetching property stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties for selected category with pagination
  const fetchPropertiesForCategory = async (categoryId, page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const category = possessionCategories.find(c => c.id === categoryId);
      if (!category) return;
      
      const res = await propertyUnitAPI.getPropertyUnits({
        possessionStatus: categoryId,
        page,
        limit: pagination.itemsPerPage,
        sortBy: categoryId === "ready-to-move" ? "createdAt" : "price",
        sortOrder: "asc"
      });
      
      if (res.data && res.data.success) {
        const newProperties = res.data.data || [];
        
        if (append) {
          setPropertyUnits(prev => [...prev, ...newProperties]);
        } else {
          setPropertyUnits(newProperties);
        }
        
        updatePagination(res, page);
        setShowAllGrid(false); // Exit grid view when category changes
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more properties for infinite scroll
  const loadMoreProperties = () => {
    if (!pagination.hasNextPage || loadingMore) return;
    const nextPage = pagination.currentPage + 1;
    fetchPropertiesForCategory(selectedTimeframe, nextPage, true);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedTimeframe(categoryId);
    setPropertyUnits([]);
    fetchPropertiesForCategory(categoryId, 1);
    setShowAllGrid(false);
    setCurrentPage(1);
    setHasMore(true);
  };

  // Handle page change for desktop
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchPropertiesForCategory(selectedTimeframe, page);
    
    // Scroll to top of component
    const element = document.getElementById('possession-timeline');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle load more for desktop
  const handleLoadMore = () => {
    const nextPage = pagination.currentPage + 1;
    fetchPropertiesForCategory(selectedTimeframe, nextPage, true);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    
    if (totalPages <= 7) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  useEffect(() => {
    fetchPropertyStats();
  }, []);

  const renderSkeleton = () => (
    <div className="min-h-screen bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Skeleton */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-48 h-4 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="h-12 md:h-16 bg-gradient-to-r from-blue-200 to-blue-300 rounded-xl w-3/4 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl w-1/2 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Category Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="bg-gradient-to-r from-blue-100 to-indigo-50 w-full h-24 rounded-2xl animate-pulse border border-blue-200"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>

        {/* Desktop Grid Skeleton */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i}
              className="bg-white rounded-3xl overflow-hidden animate-pulse border border-blue-100 shadow-lg"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-64 bg-gradient-to-r from-blue-200 to-blue-300"></div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gradient-to-r from-blue-300 to-blue-400 rounded w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gradient-to-r from-blue-300 to-blue-400 rounded-2xl w-16"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-full"></div>
                  <div className="h-4 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Skeleton Horizontal Scroll */}
        <div className="md:hidden flex space-x-6 pb-8 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className="flex-shrink-0 w-[320px] bg-white rounded-3xl overflow-hidden animate-pulse border border-blue-100 shadow-lg"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-56 bg-gradient-to-r from-blue-200 to-blue-300"></div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gradient-to-r from-blue-300 to-blue-400 rounded w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-7 bg-gradient-to-r from-blue-300 to-blue-400 rounded-2xl w-14"></div>
                </div>
                
                <div className="space-y-2">
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-full"></div>
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-300 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading && propertyUnits.length === 0) {
    return renderSkeleton();
  }

  const PropertyCard = ({ property, index, isGridView = false }) => (
    <div 
      className={`relative group h-full ${isGridView ? 'grid-view-item' : ''}`}
      style={{ animationDelay: isGridView ? `${index * 0.05}s` : '0s' }}
    >
      {/* Property Card Container */}
      <div className="relative bg-white rounded-3xl overflow-hidden border border-gray-100 group-hover:border-blue-200 transition-all duration-500 group-hover:shadow-2xl shadow-lg h-full">
        {/* Premium border effect on hover */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-100 rounded-3xl transition-all duration-500 pointer-events-none"></div>
        
        {/* Property Card */}
        <div className="transform group-hover:-translate-y-1 transition-transform duration-500 h-full">
          <PropertyUnitCard 
            propertyUnit={property}
            viewMode="compact"
          />
        </div>
      </div>
    </div>
  );

  // Loading spinner component for infinite scroll
  const LoadingSpinner = () => (
    <div className="flex-shrink-0 w-[280px] flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-sm text-gray-500 font-medium">Loading more properties...</span>
      </div>
    </div>
  );

  return (
    <div id="possession-timeline" className="bg-white md:py-24">
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div ref={headerRef} className="text-center md:mb-20">
          {/* Main title - hidden on mobile */}
          <div className="mb-6">
            <h1 className="hidden sm:block text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 font-serif tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800">
                Find by Possession
              </span>
              <span className="text-gray-900 block md:inline md:ml-4">Status</span>
            </h1>
            <p className="hidden sm:block text-gray-500 text-lg font-light max-w-2xl mx-auto">
              Browse properties based on availability and construction status
            </p>
          </div>

          {/* Category selector - Compact for mobile */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            {/* Compact filter buttons for mobile */}
            <div className="flex sm:hidden items-center justify-center gap-2 w-full max-w-xs mx-auto">
              {possessionCategories.map((category) => {
                const isSelected = selectedTimeframe === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    disabled={isTransitioning}
                    className={`flex-1 min-w-[100px] flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg"
                        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    <div className={`p-1.5 rounded-full ${
                      isSelected ? "bg-white/20" : "bg-blue-50"
                    }`}>
                      {React.cloneElement(category.icon, {
                        className: `w-3.5 h-3.5 ${
                          isSelected ? "text-white" : "text-blue-600"
                        }`
                      })}
                    </div>
                    <span className="font-medium text-xs">
                      {category.id === "ready-to-move" ? "Ready" : 
                       category.id === "under-construction" ? "Under Const." : "Resale"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop category buttons */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
              {possessionCategories.map((category) => {
                const isSelected = selectedTimeframe === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`relative p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-lg transform -translate-y-1"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`mb-3 p-2 rounded-full inline-block ${
                      isSelected
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {React.cloneElement(category.icon, {
                        className: "w-5 h-5"
                      })}
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${
                        isSelected ? "text-blue-700" : "text-gray-900"
                      }`}>
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {category.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {propertyUnits.map((property, index) => (
            <PropertyCard key={property._id || index} property={property} index={index} />
          ))}
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
          {/* Mobile Horizontal Scroll Layout */}
          {!showAllGrid && (
            <div ref={mobileViewRef} className="relative">
              {/* Mobile Scroll Navigation Buttons */}
              <div className="relative mb-4">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-700 font-sans">
                      <span className="text-blue-600">
                        {selectedTimeframe === "ready-to-move" ? "Ready Properties" :
                         selectedTimeframe === "under-construction" ? "Under Construction" : "Resale Properties"}
                      </span>
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={scrollLeft}
                      disabled={!canScrollLeft || isTransitioning}
                      className={`p-2 rounded-full border ${
                        canScrollLeft && !isTransitioning
                          ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      } transition-all duration-300`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={scrollRight}
                      disabled={!canScrollRight || isTransitioning}
                      className={`p-2 rounded-full border ${
                        canScrollRight && !isTransitioning
                          ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      } transition-all duration-300`}
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>

                    {/* View All Button */}
                    <button
                      onClick={handleViewAll}
                      disabled={isTransitioning}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Scroll Container with Infinite Scroll */}
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex space-x-4 pb-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {propertyUnits.map((property, index) => (
                  <div 
                    key={property._id || index} 
                    className="flex-shrink-0 w-[280px] snap-start"
                  >
                    <PropertyCard property={property} index={index} />
                  </div>
                ))}
                
                {/* Loading indicator for infinite scroll */}
                {hasMore && (
                  <div 
                    ref={loadingRef}
                    className="flex-shrink-0 w-[280px]"
                  >
                    {loadingMore ? (
                      <LoadingSpinner />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                          <span className="text-xs text-gray-400">Scroll for more</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Page Indicator */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      disabled={isTransitioning}
                      className={`transition-all duration-300 ${
                        currentPage === page
                          ? 'w-8 h-2 bg-blue-600 rounded-full'
                          : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-blue-400'
                      }`}
                      aria-label={`Go to page ${page}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mobile Grid View */}
          {showAllGrid && (
            <div 
              ref={gridContainerRef}
              className="py-2 relative"
            >
              {/* Grid Header */}
              <div className="relative mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 font-sans">
                    <span className="text-blue-700">
                      {selectedTimeframe === "ready-to-move" ? "All Ready Properties" :
                       selectedTimeframe === "under-construction" ? "All Under Construction" : "All Resale Properties"}
                    </span> 
                  </h2>
                  
                  <button
                    onClick={handleCloseGrid}
                    disabled={isTransitioning}
                    className="flex items-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm">Back</span>
                  </button>
                </div>
              </div>

              {/* Grid Container */}
              <div className="grid grid-cols-2 gap-4 pb-8">
                {propertyUnits.map((property, index) => (
                  <div key={property._id || index} className="w-full">
                    <PropertyCard property={property} index={index} isGridView={true} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!loading && propertyUnits.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No {selectedTimeframe === "ready-to-move" ? "ready to move" :
              selectedTimeframe === "under-construction" ? "under construction" :
              "resale"} properties available at the moment.
            </p>
          </div>
        )}

        {/* Load More Button for Desktop */}
        {propertyUnits.length > 0 && pagination.hasNextPage && (
          <div className="hidden md:flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all ${
                loadingMore
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More Properties</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Custom scrollbar hide styles */}
      <style >{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PossessionTimeline;