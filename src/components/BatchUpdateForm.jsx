// src/components/admin/batches/BatchUpdateForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { batchService } from '../api/batchService';
import PropertyUnitSelector from './PropertyUnitSelector';

const BatchUpdateForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    batchName: '',
    locationName: '',
    description: '',
    image: null,
    batchType: 'location_based',
    propertyUnits: [],
    tags: [],
    locationCoordinates: null,
    isActive: true,
    displayOrder: 0,
  });

  // Fetch batch data
  useEffect(() => {
    const fetchBatch = async () => {
      try {
        setLoading(true);
        const response = await batchService.getBatch(id);
        
        if (response.success) {
          const batch = response.data;
          
          // Extract property unit IDs correctly
          let propertyUnitIds = [];
          if (batch.propertyUnits && Array.isArray(batch.propertyUnits)) {
            propertyUnitIds = batch.propertyUnits
              .map(unit => {
                // Handle different possible structures
                if (typeof unit === 'object') {
                  return unit.propertyId || unit._id || null;
                }
                return unit;
              })
              .filter(id => id); // Remove null/undefined
          }
          
          console.log('Fetched batch - property units:', propertyUnitIds);
          
          setFormData({
            batchName: batch.batchName || '',
            locationName: batch.locationName || '',
            description: batch.description || '',
            image: null,
            batchType: batch.batchType || 'location_based',
            propertyUnits: propertyUnitIds,
            tags: batch.tags || [],
            locationCoordinates: batch.locationCoordinates || null,
            isActive: batch.isActive !== undefined ? batch.isActive : true,
            displayOrder: batch.displayOrder || 0,
          });
          
          if (batch.image?.url) {
            setImagePreview(batch.image.url);
          }
        } else {
          setError('Failed to load batch data');
        }
      } catch (err) {
        setError('Failed to fetch batch data: ' + (err.message || 'Unknown error'));
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBatch();
    }
  }, [id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle property unit selection
  const handlePropertyUnitsChange = (selectedUnits) => {
    console.log('Property units changed:', selectedUnits);
    setFormData(prev => ({
      ...prev,
      propertyUnits: selectedUnits
    }));
  };

  // Handle tags
  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.batchName.trim()) {
        throw new Error('Batch name is required');
      }
      if (!formData.locationName.trim()) {
        throw new Error('Location name is required');
      }

      // Prepare data for submission - ensure propertyUnits is array of strings
      const submitData = {
        batchName: formData.batchName,
        locationName: formData.locationName,
        description: formData.description,
        batchType: formData.batchType,
        propertyUnits: Array.isArray(formData.propertyUnits) ? formData.propertyUnits : [],
        tags: formData.tags || [],
        isActive: formData.isActive,
        displayOrder: parseInt(formData.displayOrder) || 0,
      };
      
      // Only add image if it's a new file
      if (formData.image instanceof File) {
        submitData.image = formData.image;
      }

      console.log('Submitting update with:', {
        id,
        propertyUnits: submitData.propertyUnits,
        propertyUnitsType: typeof submitData.propertyUnits,
        isArray: Array.isArray(submitData.propertyUnits)
      });

      const result = await batchService.updateBatch(id, submitData);
      
      if (result.success) {
        setSuccess('Batch updated successfully!');
        setTimeout(() => {
          navigate('/admin/batches');
        }, 2000);
      } else {
        setError(result.message || 'Failed to update batch');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating the batch');
      console.error('Update error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading batch data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/batches')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Batches
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Edit Batch</h1>
          <p className="mt-2 text-gray-600">Update batch information and configuration</p>
        </div>

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

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Name *
                  </label>
                  <input
                    type="text"
                    name="batchName"
                    value={formData.batchName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    name="locationName"
                    value={formData.locationName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Featured Image</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Batch Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                      <span>Choose Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-gray-500">JPG, PNG, GIF (Max 5MB)</span>
                  </div>
                </div>

                {imagePreview && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                    <div className="relative w-64 h-48">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Batch Configuration</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Type
                  </label>
                  <select
                    name="batchType"
                    value={formData.batchType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="location_based">Location Based</option>
                    <option value="project_group">Project Group</option>
                    <option value="featured_listings">Featured Listings</option>
                    <option value="similar_properties">Similar Properties</option>
                    <option value="comparison_group">Comparison Group</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={handleTagsChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="luxury, downtown, premium"
                  />
                </div>

                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">
                    Active (Visible to users)
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">Property Units</h2>
              <PropertyUnitSelector
                selectedUnits={formData.propertyUnits}
                onChange={handlePropertyUnitsChange}
                batchId={id}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/admin/batches')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={submitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : 'Update Batch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BatchUpdateForm;