import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function Lightbox({ images = [], initialIndex = 0, isOpen, onClose }) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    setCurrent(initialIndex);
  }, [initialIndex, isOpen]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    },
    [onClose, prev, next]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !images.length) return null;

  const image = images[current];

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <span className="text-white/60 text-sm">
          {current + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 relative flex items-center justify-center min-h-0 px-14">
        {images.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-3 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        <img
          src={image.url}
          alt={image.alt || `Image ${current + 1}`}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />

        {images.length > 1 && (
          <button
            onClick={next}
            className="absolute right-3 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Alt text */}
      {image.alt && (
        <div className="text-center px-6 py-2 shrink-0">
          <p className="text-white/60 text-sm truncate">{image.alt}</p>
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="shrink-0 px-6 py-3 flex gap-2 justify-center overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                idx === current ? 'border-brand-gold opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={img.url}
                alt={img.alt || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
