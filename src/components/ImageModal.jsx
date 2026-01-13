const ImageModal = ({ images, currentIndex, onClose, onNavigate, propertyTitle }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(currentIndex);

  useEffect(() => {
    setCurrentImgIndex(currentIndex);
  }, [currentIndex]);

  const handlePrev = () => {
    const newIndex = currentImgIndex === 0 ? images.length - 1 : currentImgIndex - 1;
    setCurrentImgIndex(newIndex);
    onNavigate('prev');
  };

  const handleNext = () => {
    const newIndex = currentImgIndex === images.length - 1 ? 0 : currentImgIndex + 1;
    setCurrentImgIndex(newIndex);
    onNavigate('next');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentImgIndex]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      <style>{styles}</style>
      
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
      >
        ✕
      </button>
      
      <div className="relative w-full h-full flex items-center justify-center">
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
        
        <div className="max-w-7xl max-h-[90vh] p-4">
          <img
            src={images[currentImgIndex]?.url}
            alt={`${propertyTitle} - Image ${currentImgIndex + 1}`}
            className="w-full h-full object-contain max-h-[80vh] rounded-lg"
          />
        </div>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
          {currentImgIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};