// components/admin/CardAdForm.jsx
import React, { useState, useEffect } from 'react';

const CardAdForm = ({ section, ad, sections, onSubmit, onClose, onAddSection }) => {
  const [formData, setFormData] = useState({
    section: section,
    target: 'both',
    link: '#',
    displayOrder: 0,
    rotationInterval: 5000,
    overlayTitle: '',
    overlayDescription: '',
    ctaText: '',
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  // Predefined sections based on enum
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

  // Use provided sections or predefined ones
  const availableSections = sections && sections.length > 0 ? sections : predefinedSections;

  useEffect(() => {
    if (ad) {
      setFormData({
        section: ad.section || section,
        target: ad.target || 'both',
        link: ad.link || '#',
        displayOrder: ad.displayOrder || 0,
        rotationInterval: ad.rotationInterval || 5000,
        overlayTitle: ad.overlayTitle || '',
        overlayDescription: ad.overlayDescription || '',
        ctaText: ad.ctaText || '',
        isActive: ad.isActive !== undefined ? ad.isActive : true
      });
      setPreview(ad.desktopImage);
    }
  }, [ad, section]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPEG, PNG, WEBP, and GIF images are allowed');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getSectionInfo = (sectionValue) => {
    const section = availableSections.find(s => s.value === sectionValue);
    return section || { label: sectionValue, description: '' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.section) {
      alert('Please select a section');
      return;
    }
    
    if (!imageFile && !ad) {
      alert('Please upload an image');
      return;
    }
    
    setLoading(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    });
    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      if (ad) {
        await onSubmit(ad._id, submitData);
      } else {
        await onSubmit(submitData);
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
      alert(error.response?.data?.message || 'Failed to save ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {ad ? 'Edit Ad' : 'Create New Ad'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Section Selection - Only predefined sections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section *
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a section</option>
                  {availableSections.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label} - {s.description}
                    </option>
                  ))}
                </select>
                {formData.section && (
                  <p className="mt-1 text-xs text-gray-500">
                    Ads will appear in the {getSectionInfo(formData.section).label.toLowerCase()}
                  </p>
                )}
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="both">Both (Guests & Members)</option>
                  <option value="guest">Guests Only</option>
                  <option value="member">Members Only</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Choose who will see this ad
                </p>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Where users go when they click the ad
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Image {!ad && '*'}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  required={!ad}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Max size: 5MB. Allowed formats: JPEG, PNG, WEBP, GIF
                </p>
                {preview && (
                  <div className="mt-2">
                    <img src={preview} alt="Preview" className="h-32 object-cover rounded" />
                  </div>
                )}
              </div>

              {/* Display Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Lower numbers appear first
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rotation Interval (ms)
                  </label>
                  <input
                    type="number"
                    name="rotationInterval"
                    value={formData.rotationInterval}
                    onChange={handleChange}
                    min="1000"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Time between rotations (1000ms = 1 second)
                  </p>
                </div>
              </div>

              {/* Overlay Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overlay Title
                </label>
                <input
                  type="text"
                  name="overlayTitle"
                  value={formData.overlayTitle}
                  onChange={handleChange}
                  maxLength="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional title text overlaid on the image
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overlay Description
                </label>
                <textarea
                  name="overlayDescription"
                  value={formData.overlayDescription}
                  onChange={handleChange}
                  rows="2"
                  maxLength="200"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional description text overlaid on the image
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleChange}
                  placeholder="Learn More"
                  maxLength="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Text for the call-to-action button
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>

              {/* Section Summary */}
              {formData.section && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-600">
                    <strong>Section Details:</strong><br />
                    • Section: {getSectionInfo(formData.section).label}<br />
                    • Description: {getSectionInfo(formData.section).description}<br />
                    • Target: {formData.target === 'both' ? 'All users' : formData.target === 'guest' ? 'Guests only' : 'Members only'}<br />
                    • Status: {formData.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : ad ? 'Update Ad' : 'Create Ad'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CardAdForm;