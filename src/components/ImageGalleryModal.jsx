// src/components/admin/batches/ImageGalleryModal.jsx
import React from 'react';

const ImageGalleryModal = ({ isOpen, onClose, image, title }) => {
  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="inline-block align-bottom rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <img
            src={image.url}
            alt={title}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          
          {/* Caption */}
          {image.caption && (
            <div className="bg-white p-4">
              <p className="text-gray-700 text-center">{image.caption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryModal;