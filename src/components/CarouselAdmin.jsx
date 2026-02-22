// pages/admin/CarouselAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, X, Upload } from 'lucide-react';
import carouselService from '../api/carouselApi';

const CarouselAdmin = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'all',
    isMainBanner: false,
    displayOrder: 0,
    altText: '',
    link: '',
    isActive: true
  });
  
  // File states
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState('');
  const [mobilePreview, setMobilePreview] = useState('');
  
  // Upload status
  const [uploading, setUploading] = useState(false);

  // Fetch images on load
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await carouselService.getImages({ limit: 50 });
      setImages(res.data.data);
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle desktop file selection
  const handleDesktopFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesktopFile(file);
      setDesktopPreview(URL.createObjectURL(file));
    }
  };

  // Handle mobile file selection
  const handleMobileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileFile(file);
      setMobilePreview(URL.createObjectURL(file));
    }
  };

  // Open modal for create/edit
  const openModal = (image = null) => {
    if (image) {
      setEditingImage(image);
      setFormData({
        title: image.title || '',
        description: image.description || '',
        propertyType: image.propertyType || 'all',
        isMainBanner: image.isMainBanner || false,
        displayOrder: image.displayOrder || 0,
        altText: image.altText || '',
        link: image.link || '',
        isActive: image.isActive !== false
      });
      setDesktopPreview(image.desktopImageUrl || '');
      setMobilePreview(image.mobileImageUrl || '');
    } else {
      setEditingImage(null);
      setFormData({
        title: '',
        description: '',
        propertyType: 'all',
        isMainBanner: false,
        displayOrder: images.length,
        altText: '',
        link: '',
        isActive: true
      });
      setDesktopPreview('');
      setMobilePreview('');
    }
    setDesktopFile(null);
    setMobileFile(null);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingImage(null);
    setDesktopFile(null);
    setMobileFile(null);
    setDesktopPreview('');
    setMobilePreview('');
    
    // Clean up object URLs
    if (desktopPreview && desktopPreview.startsWith('blob:')) {
      URL.revokeObjectURL(desktopPreview);
    }
    if (mobilePreview && mobilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(mobilePreview);
    }
  };

  // Submit form with file uploads
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title) {
      alert('Title is required');
      return;
    }
    
    // For new images, desktop image is required
    if (!editingImage && !desktopFile) {
      alert('Desktop image is required');
      return;
    }

    setUploading(true);
    
    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    // Append files if selected
    if (desktopFile) {
      formDataToSend.append('desktopImage', desktopFile);
    }
    
    if (mobileFile) {
      formDataToSend.append('mobileImage', mobileFile);
    }

    try {
      if (editingImage) {
        await carouselService.updateImage(editingImage._id, formDataToSend);
        alert('Image updated successfully');
      } else {
        await carouselService.createImage(formDataToSend);
        alert('Image created successfully');
      }
      closeModal();
      fetchImages();
    } catch (err) {
      console.error('Error saving image:', err);
      alert(err.response?.data?.message || 'Error saving image');
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await carouselService.deleteImage(id);
        fetchImages();
        alert('Image deleted successfully');
      } catch (err) {
        alert('Error deleting image');
      }
    }
  };

  // Update order
  const handleOrderChange = async (id, direction) => {
    const index = images.findIndex(img => img._id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === images.length - 1)
    ) return;

    const newImages = [...images];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap display orders
    const tempOrder = newImages[index].displayOrder;
    newImages[index].displayOrder = newImages[swapIndex].displayOrder;
    newImages[swapIndex].displayOrder = tempOrder;
    
    // Swap positions
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    setImages(newImages);

    // Update on server
    try {
      await carouselService.updateOrder({
        updates: [
          { id: newImages[index]._id, displayOrder: newImages[index].displayOrder },
          { id: newImages[swapIndex]._id, displayOrder: newImages[swapIndex].displayOrder }
        ]
      });
    } catch (err) {
      console.error('Error updating order');
      fetchImages(); // Revert on error
    }
  };

  const propertyTypes = ['all', 'Apartment', 'Villa', 'Independent House', 'Studio', 'Penthouse', 'Duplex', 'Pg house', 'Plot', 'Commercial Space'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Carousel Images</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Add New Image
        </button>
      </div>

      {/* Images Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : images.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No images found. Click "Add New Image" to create one.
                </td>
              </tr>
            ) : (
              images.map((img, idx) => (
                <tr key={img._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleOrderChange(img._id, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <span className="text-sm">{img.displayOrder}</span>
                      <button 
                        onClick={() => handleOrderChange(img._id, 'down')}
                        disabled={idx === images.length-1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <img 
                      src={img.desktopImageUrl} 
                      alt={img.title} 
                      className="w-16 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{img.title}</div>
                    {img.description && (
                      <div className="text-xs text-gray-500">{img.description.substring(0, 30)}...</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {img.propertyType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      img.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {img.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {img.isMainBanner && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        Main
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openModal(img)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(img._id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">
                {editingImage ? 'Edit Image' : 'Add New Image'}
              </h2>
              <button 
                onClick={closeModal} 
                className="p-1 hover:bg-gray-100 rounded"
                disabled={uploading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter image title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter image description"
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Property Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Desktop Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Desktop Image {!editingImage && <span className="text-red-500">*</span>}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {desktopPreview && (
                    <div className="mb-3">
                      <img 
                        src={desktopPreview} 
                        alt="Desktop preview" 
                        className="max-h-40 object-contain rounded"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDesktopFileChange}
                      className="hidden"
                      id="desktop-upload"
                    />
                    <label
                      htmlFor="desktop-upload"
                      className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                    >
                      <Upload size={16} />
                      {desktopFile ? 'Change File' : 'Select File'}
                    </label>
                    {desktopFile && (
                      <span className="text-sm text-gray-600">{desktopFile.name}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-1">Mobile Image (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {mobilePreview && (
                    <div className="mb-3">
                      <img 
                        src={mobilePreview} 
                        alt="Mobile preview" 
                        className="max-h-40 object-contain rounded"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMobileFileChange}
                      className="hidden"
                      id="mobile-upload"
                    />
                    <label
                      htmlFor="mobile-upload"
                      className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                    >
                      <Upload size={16} />
                      {mobileFile ? 'Change File' : 'Select File'}
                    </label>
                    {mobileFile && (
                      <span className="text-sm text-gray-600">{mobileFile.name}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium mb-1">Alt Text (for accessibility)</label>
                <input
                  type="text"
                  name="altText"
                  value={formData.altText}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the image for screen readers"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium mb-1">Link URL</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isMainBanner"
                    checked={formData.isMainBanner}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm">Main Banner</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={uploading}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {uploading ? 'Uploading...' : (editingImage ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselAdmin;