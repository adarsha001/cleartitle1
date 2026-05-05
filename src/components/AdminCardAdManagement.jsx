// components/admin/CardAdsManager.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CardAdForm from './CardAdForm';
import CardAdList from './CardAdList';
import { cardAdApi, cardAdAdminApi } from '../api/cardAdApi';

const CardAdsManager = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('first');
  const [ads, setAds] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  // Predefined sections fallback
  const predefinedSections = [
    { value: 'first', label: 'First Section', description: 'Top banner area' },
    { value: 'second', label: 'Second Section', description: 'Below hero section' },
    { value: 'third', label: 'Third Section', description: 'Middle content area' },
    { value: 'fourth', label: 'Fourth Section', description: 'Before footer' },
    { value: 'fifth', label: 'Fifth Section', description: 'Bottom area' },
    { value: 'hero', label: 'Hero Section', description: 'Main hero banner' },
    { value: 'sidebar', label: 'Sidebar Section', description: 'Sidebar ads' },
    { value: 'footer', label: 'Footer Section', description: 'Footer area' },
    { value: 'promo', label: 'Promo Section', description: 'Promotional banners' }
  ];

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchSectionAds(selectedSection);
    }
  }, [selectedSection]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      // Try to fetch from API first
      const response = await cardAdApi.getSectionsList();
      if (response.data.success && response.data.data.length > 0) {
        setSections(response.data.data);
      } else {
        // Use predefined sections as fallback
        setSections(predefinedSections);
      }
      
      // Fetch all sections ads
      const allAdsResponse = await cardAdApi.getAllSections({ target: 'both' });
      if (allAdsResponse.data.success) {
        setAds(allAdsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      // Use predefined sections on error
      setSections(predefinedSections);
      toast.error('Failed to fetch sections, using default sections');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionAds = async (section) => {
    try {
      const response = await cardAdApi.getSectionAds(section, { target: 'both', limit: 50 });
      if (response.data.success) {
        setAds(prev => ({ ...prev, [section]: response.data.data }));
      }
    } catch (error) {
      console.error(`Error fetching ads for ${section}:`, error);
      toast.error(`Failed to fetch ads for ${section}`);
    }
  };

  const handleCreateAd = async (formData) => {
    try {
      const response = await cardAdAdminApi.createAd(formData);
      if (response.data.success) {
        toast.success('Ad created successfully');
        setShowForm(false);
        await fetchSectionAds(selectedSection);
        await fetchSections(); // Refresh section counts
      }
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error(error.response?.data?.message || 'Failed to create ad');
    }
  };

  const handleUpdateAd = async (id, formData) => {
    try {
      const response = await cardAdAdminApi.updateAd(id, formData);
      if (response.data.success) {
        toast.success('Ad updated successfully');
        setEditingAd(null);
        await fetchSectionAds(selectedSection);
      }
    } catch (error) {
      console.error('Error updating ad:', error);
      toast.error(error.response?.data?.message || 'Failed to update ad');
    }
  };

  const handleDeleteAd = async (id) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        const response = await cardAdAdminApi.deleteAd(id);
        if (response.data.success) {
          toast.success('Ad deleted successfully');
          await fetchSectionAds(selectedSection);
          await fetchSections(); // Refresh section counts
        }
      } catch (error) {
        console.error('Error deleting ad:', error);
        toast.error(error.response?.data?.message || 'Failed to delete ad');
      }
    }
  };

  const handleUpdateOrder = async (section, updates) => {
    try {
      const response = await cardAdAdminApi.updateSectionOrder(section, updates);
      if (response.data.success) {
        toast.success('Display order updated successfully');
        await fetchSectionAds(section);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ads manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Card Ads Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage advertisements across all sections of your website
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Ad
          </button>
        </div>

        {/* Section Selector with Stats */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Section to Manage
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {sections.map(section => (
              <button
                key={section.value}
                onClick={() => setSelectedSection(section.value)}
                className={`px-4 py-3 rounded-lg text-left transition-all ${
                  selectedSection === section.value
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium text-sm">{section.label}</div>
                <div className={`text-xs mt-1 ${
                  selectedSection === section.value ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {ads[section.value]?.length || 0} ad(s)
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Section Info */}
        {selectedSection && (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    {sections.find(s => s.value === selectedSection)?.label || selectedSection}
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {sections.find(s => s.value === selectedSection)?.description || 'Manage ads for this section'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ads List for Selected Section */}
        <CardAdList
          section={selectedSection}
          ads={ads[selectedSection] || []}
          onEdit={(ad) => setEditingAd(ad)}
          onDelete={handleDeleteAd}
          onUpdateOrder={handleUpdateOrder}
        />

        {/* Create/Edit Modal */}
        {(showForm || editingAd) && (
          <CardAdForm
            section={selectedSection}
            ad={editingAd}
            sections={sections}
            onSubmit={editingAd ? handleUpdateAd : handleCreateAd}
            onClose={() => {
              setShowForm(false);
              setEditingAd(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CardAdsManager;