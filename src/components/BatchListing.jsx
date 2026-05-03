// components/public/ProjectGroupTable.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectBatchService } from '../api/publicBatchService';
import { 
  MapPin, 
  Plus, 
  ArrowUpRight, 
  ChevronRight, 
  ChevronLeft,
  X, 
  Building2, 
  Shield,
  Home,
  TrendingUp,
  CheckCircle,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import gsap from 'gsap';

const ProjectGroupTable = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    minProperties: '',
    maxProperties: ''
  });
  
  const modalRef = useRef(null);
  const modalContentRef = useRef(null);
  const modalOverlayRef = useRef(null);
  const timelineRef = useRef(null);
  const gridRef = useRef(null);

  // Fetch batches with pagination
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await projectBatchService.getProjectBatches({
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'displayOrder',
        sortOrder: 'asc'
      });
      
      if (response.success) {
        setBatches(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
        setPaginationInfo(response.pagination);
      }
    } catch (error) { 
      console.error('Fetch error:', error); 
      setBatches([]);
    } finally { 
      setLoading(false); 
    }
  };

  // Fetch with filters
  const fetchFilteredBatches = async () => {
    try {
      setLoading(true);
      const response = await projectBatchService.filterProjectBatches({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        location: filters.location,
        minProperties: filters.minProperties || 0,
        maxProperties: filters.maxProperties || null,
        sortBy: 'displayOrder',
        sortOrder: 'asc'
      });
      
      if (response.success) {
        setBatches(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
        setPaginationInfo(response.pagination);
      }
    } catch (error) { 
      console.error('Filter error:', error); 
      setBatches([]);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (searchTerm || filters.location || filters.minProperties || filters.maxProperties) {
      fetchFilteredBatches();
    } else {
      fetchBatches();
    }
  }, [currentPage, itemsPerPage, searchTerm, filters.location, filters.minProperties, filters.maxProperties]);

  // Modal animation with GSAP
  useEffect(() => {
    if (showModal && modalRef.current && modalContentRef.current && modalOverlayRef.current) {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const tl = gsap.timeline();
      timelineRef.current = tl;

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

  const handleBatchClick = async (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
    setUnitsLoading(true);
    try {
      const response = await projectBatchService.getProjectBatchById(batch._id);
      if (response.success) {
        const units = response.data.propertyUnits || [];
        setPropertyUnits(units);
      }
    } catch (e) {
      console.error('Error fetching properties:', e);
    } finally {
      setUnitsLoading(false);
    }
  };

  const handleViewProperty = (propertyId) => {
    handleCloseModal();
    setTimeout(() => {
      navigate(`/property-units/${propertyId}`);
    }, 400);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top when changing page
      if (gridRef.current) {
        gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ location: '', minProperties: '', maxProperties: '' });
    setCurrentPage(1);
  };

  if (loading && batches.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-t-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Loading Premium Projects</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- BACK BUTTON --- */}
        <button 
          onClick={handleGoBack}
          className="group flex items-center gap-2 mb-8 text-slate-500 hover:text-blue-600 transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Back</span>
        </button>

        {/* --- PREMIUM MINIMALIST HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-6 border-b border-slate-100 pb-10 mb-12">
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.4em] uppercase text-blue-600 mb-2">Signature Series</h4>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">Project Collections</h2>
          </div>
          <p className="text-slate-400 text-sm hidden sm:block font-light max-w-xs italic leading-relaxed">
            "Crafted with precision, built for legacy." — Discover our premier project collections.
          </p>
        </div>

        {/* --- SEARCH AND FILTERS --- */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search projects by name, location, or description..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-colors text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-600">Filters</span>
            </button>
            
            {(searchTerm || filters.location || filters.minProperties || filters.maxProperties) && (
              <button
                onClick={clearFilters}
                className="px-5 py-3 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-50 rounded-xl">
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">Min Properties</label>
                <input
                  type="number"
                  placeholder="Min properties..."
                  value={filters.minProperties}
                  onChange={(e) => handleFilterChange('minProperties', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">Max Properties</label>
                <input
                  type="number"
                  placeholder="Max properties..."
                  value={filters.maxProperties}
                  onChange={(e) => handleFilterChange('maxProperties', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* --- PROJECT GRID --- */}
        <div ref={gridRef} className="relative">
          {batches.length === 0 ? (
            <div className="py-20 text-center">
              <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-serif text-slate-700 mb-2">No projects found</h3>
              <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 pb-12 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-y-20 md:gap-x-10">
              {batches.map((batch, index) => {
                const globalRank = ((currentPage - 1) * itemsPerPage) + index + 1;
                return (
                  <div 
                    key={batch._id}
                    onClick={() => handleBatchClick(batch)}
                    className="w-full group cursor-pointer relative transform transition-all duration-500 hover:-translate-y-1"
                  >
                    {/* Rank Badge */}
                    <div className={`absolute top-4 left-4 z-20 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                      globalRank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' : 
                      globalRank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' : 
                      globalRank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' : 
                      'bg-white/90 backdrop-blur-sm text-slate-700'
                    }`}>
                      #{globalRank}
                    </div>

                    {/* The Image "Frame" */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#F9F9F9] rounded-sm transition-all duration-700 ease-out group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)]">
                      <div className="absolute top-4 right-4 z-10 opacity-30 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-serif italic text-slate-900">Premium Collection</span>
                      </div>

                      <img 
                        src={batch.image?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        alt={batch.batchName}
                      />
                      
                      {/* Desktop Hover Overlay */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 md:group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-500 flex items-center justify-center">
                        <div className="bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 border border-slate-50">
                          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-900">Explore Project</span>
                          <Plus className="w-3 h-3 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    {/* Floating Content Block */}
                    <div className="relative -mt-8 mx-4 p-5 md:p-6 bg-white border border-slate-50 shadow-[0_15px_35px_rgba(0,0,0,0.04)] md:group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] md:group-hover:-translate-y-2 transition-all duration-500">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg md:text-xl font-serif text-slate-900 leading-tight line-clamp-1">
                          {batch.batchName}
                        </h3>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span className="text-xs">{batch.locationName}</span>
                      </div>

                      {batch.description && (
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 font-light">
                          {batch.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5">
                          <Home className="w-3 h-3 text-blue-600" />
                          <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            {batch.stats?.totalProperties || 0} Assets
                          </span>
                        </div>
                        {batch.createdAt && (
                          <span className="text-[8px] text-slate-400">
                            {formatDate(batch.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- PAGINATION SECTION --- */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-12 pt-8 border-t border-slate-100">
            {/* Items per page selector */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Show</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white cursor-pointer"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
                <option value={15}>15</option>
              </select>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">per page</span>
            </div>

            {/* Page info */}
            <div className="text-sm text-slate-500 font-light">
              Showing <span className="font-medium text-slate-700">{paginationInfo?.startIndex || ((currentPage - 1) * itemsPerPage) + 1}</span> -{' '}
              <span className="font-medium text-slate-700">
                {paginationInfo?.endIndex || Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-medium text-slate-700">{totalItems}</span> projects
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  currentPage === 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum > totalPages || pageNum < 1) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-300 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  currentPage === totalPages
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
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
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Project Masterfile</span>
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
              {/* Header Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="h-[35vh] md:h-[500px] bg-slate-50 relative overflow-hidden flex items-center justify-center">
                  <div 
                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-10 scale-110"
                    style={{ backgroundImage: `url(${selectedBatch.image?.url})` }}
                  />
                  <img 
                    src={selectedBatch.image?.url} 
                    className="relative max-h-[90%] max-w-[90%] object-contain shadow-2xl rounded-sm" 
                    alt={selectedBatch.batchName} 
                  />
                </div>
                
                <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-green-600">Verified Project</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-slate-900 mb-6 leading-tight">
                    {selectedBatch.batchName}
                  </h2>
                  <p className="text-slate-500 font-light leading-relaxed mb-10 text-sm md:text-base">
                    {selectedBatch.description || "Explore a curated collection of premium properties in this signature project."}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Location</p>
                      <p className="text-lg font-serif italic text-blue-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedBatch.locationName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Portfolio Size</p>
                      <p className="text-lg font-serif">{propertyUnits.length} Properties</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Properties Grid */}
              <div className="bg-[#FCFCFC] p-6 md:p-16 lg:p-20">
                <div className="flex items-center gap-4 mb-12">
                  <h3 className="text-[11px] font-bold tracking-[0.4em] uppercase text-slate-900 shrink-0">Property Inventory</h3>
                  <div className="h-[1px] w-full bg-slate-100"></div>
                  <span className="text-xs text-slate-400 shrink-0">{propertyUnits.length} Units</span>
                </div>

                {unitsLoading ? (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Fetching Assets</span>
                  </div>
                ) : propertyUnits.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <Building2 className="w-10 h-10 text-slate-200 mx-auto" />
                    <p className="text-slate-400 font-serif italic">No properties available...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {propertyUnits.map((unit) => {
                      const property = unit.propertyId || unit;
                      return (
                        <div 
                          key={property._id} 
                          onClick={() => handleViewProperty(property._id)}
                          className="bg-white p-2 rounded-xl shadow-sm border border-slate-100/50 hover:shadow-2xl hover:border-blue-100/50 transition-all duration-500 group cursor-pointer"
                        >
                          <div className="relative">
                            {property.images && property.images[0] && (
                              <div className="relative overflow-hidden rounded-lg">
                                <img 
                                  src={property.images[0].url} 
                                  alt={property.title}
                                  className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full">
                                <ArrowUpRight className="w-3 h-3 text-blue-600" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-serif text-sm text-slate-800 mb-1 line-clamp-2 min-h-[40px]">
                              {property.title || 'Premium Property'}
                            </h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3" />
                              {property.city || 'Location TBD'}
                            </p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                              {property.price?.amount && (
                                <p className="text-sm font-bold text-blue-600">
                                  ₹{property.price.amount.toLocaleString()}
                                </p>
                              )}
                              <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase group-hover:text-blue-600 transition-colors">
                                View →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                Back to projects <ChevronRight className="w-4 h-4" />
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

export default ProjectGroupTable;