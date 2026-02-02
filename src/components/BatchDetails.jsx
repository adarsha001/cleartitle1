// src/components/admin/batches/BatchDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { batchService } from '../api/batchService';
import PropertyUnitCard from './PropertyUnitCard';
import BatchStatsDetails from './BatchStatsDetails';
import ImageGalleryModal from './ImageGalleryModal';

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [batch, setBatch] = useState(null);
  const [propertyUnits, setPropertyUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Fetch batch details
  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        setLoading(true);
        const response = await batchService.getBatch(id);
        
        if (response.success) {
          setBatch(response.data);
          // Extract property units from populated data
          if (response.data.propertyUnits) {
            setPropertyUnits(response.data.propertyUnits);
            setLoadingUnits(false);
          } else {
            // If not populated, fetch separately
            fetchPropertyUnits();
          }
        } else {
          setError('Batch not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch batch details');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBatchDetails();
    }
  }, [id]);

  // Fetch property units separately if needed
  const fetchPropertyUnits = async () => {
    try {
      setLoadingUnits(true);
      // This would be your custom endpoint to get units for a batch
      // For now, we'll use a placeholder
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`/api/property-batches/${id}/units`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPropertyUnits(data.data);
      }
    } catch (err) {
      console.error('Error fetching property units:', err);
    } finally {
      setLoadingUnits(false);
    }
  };

  // Handle delete batch
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      try {
        const response = await batchService.deleteBatch(id);
        if (response.success) {
          navigate('/admin/');
        } else {
          setError(response.message || 'Failed to delete batch');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete batch');
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async () => {
    try {
      const response = await batchService.toggleActiveStatus(id);
      if (response.success) {
        // Update local state
        setBatch(prev => ({
          ...prev,
          isActive: !prev.isActive
        }));
      } else {
        setError(response.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 text-red-500 mx-auto mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Batch Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'The batch you are looking for does not exist.'}</p>
          <Link
            to="/admin/batches"
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700"
          >
            Back to Batches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/admin')}
                  className="mr-4 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
                    {batch.batchName}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Batch Code: {batch.batchCode}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${batch.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {batch.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {batch.batchType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={handleToggleStatus}
                className={`inline-flex items-center px-4 py-2 rounded-md font-medium ${batch.isActive ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
              >
                {batch.isActive ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                    Deactivate
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Activate
                  </>
                )}
              </button>
              
              <Link
                to={`/admin/batches/edit/${id}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
              
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-medium text-white hover:bg-red-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Image Section */}
        {batch.image?.url && (
          <div className="mb-8">
            <div className="relative h-96 rounded-lg overflow-hidden bg-gray-200">
              <img
                src={batch.image.url}
                alt={batch.batchName}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setImageModalOpen(true)}
              />
              {batch.image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm">{batch.image.caption}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {['overview', 'properties', 'statistics', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'properties' && `Properties (${propertyUnits.length})`}
                {tab === 'statistics' && 'Statistics'}
                {tab === 'settings' && 'Settings'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2">
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">
                        {batch.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Location Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <h3 className="font-medium text-gray-900">Location</h3>
                        </div>
                        <p className="text-gray-700">{batch.locationName}</p>
                      </div>

                      {batch.locationCoordinates && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <h3 className="font-medium text-gray-900">Coordinates</h3>
                          </div>
                          <p className="text-gray-700 font-mono text-sm">
                            {batch.locationCoordinates.latitude?.toFixed(6)}, {batch.locationCoordinates.longitude?.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {batch.tags && batch.tags.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                      <div className="flex flex-wrap gap-2">
                        {batch.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Info Card */}
                <div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Batch Type</p>
                        <p className="text-gray-900 font-medium capitalize">
                          {batch.batchType.replace('_', ' ')}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Display Order</p>
                        <p className="text-gray-900 font-medium">{batch.displayOrder}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created By</p>
                        <p className="text-gray-900 font-medium">{batch.createdBy?.name || 'Unknown'}</p>
                        {batch.createdBy?.email && (
                          <p className="text-sm text-gray-500">{batch.createdBy.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created Date</p>
                        <p className="text-gray-900 font-medium">{formatDate(batch.createdAt)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Updated</p>
                        <p className="text-gray-900 font-medium">{formatDate(batch.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Property Units ({propertyUnits.length})
                </h2>
                <Link
                  to={`/admin/batches/edit/${id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Manage Properties
                </Link>
              </div>

              {loadingUnits ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : propertyUnits.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties</h3>
                  <p className="text-gray-500 mb-6">Add property units to this batch to get started.</p>
                  <Link
                    to={`/admin/batches/edit/${id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Properties
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {propertyUnits.map((unit) => (
                    <PropertyUnitCard key={unit._id} unit={unit} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="p-6">
              <BatchStatsDetails batch={batch} propertyUnits={propertyUnits} />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Batch Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Status Settings</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Batch Status</p>
                          <p className="text-sm text-gray-500">
                            Control whether this batch is visible to users
                          </p>
                        </div>
                        <button
                          onClick={handleToggleStatus}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${batch.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${batch.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="mt-4">
                        <p className={`text-sm ${batch.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {batch.isActive
                            ? '✓ This batch is currently active and visible to users.'
                            : '⚠ This batch is inactive and hidden from users.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-800">Delete Batch</p>
                          <p className="text-sm text-red-600">
                            Once deleted, this batch cannot be recovered.
                          </p>
                        </div>
                        <button
                          onClick={handleDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                        >
                          Delete Batch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Batch ID</p>
                      <p className="text-gray-900 font-mono text-sm break-all">{batch._id}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Batch Code</p>
                      <p className="text-gray-900 font-mono text-sm">{batch.batchCode}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Image Public ID</p>
                      <p className="text-gray-900 font-mono text-sm break-all">{batch.image?.public_id || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Image URL</p>
                      <p className="text-gray-900 font-mono text-sm break-all truncate">
                        {batch.image?.url || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        image={batch.image}
        title={batch.batchName}
      />
    </div>
  );
};

export default BatchDetails;