import { useState, useCallback } from 'react';
import GalleryImage from './GalleryImage';

export default function CarouselView({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  if (images.length === 0) return null;

  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  const nextIndex = (currentIndex + 1) % images.length;
  const hasMultiple = images.length > 1;

  return (
    <div className="ing-carousel" dir="rtl">
      <button className="ing-arrow" onClick={goPrev} aria-label="תמונה קודמת" disabled={!hasMultiple}>
        ‹
      </button>

      <div className="ing-track">
        {hasMultiple && (
          <GalleryImage image={images[prevIndex]} size="side" onClick={() => setCurrentIndex(prevIndex)} />
        )}

        <GalleryImage image={images[currentIndex]} size="main" />

        {hasMultiple && (
          <GalleryImage image={images[nextIndex]} size="side" onClick={() => setCurrentIndex(nextIndex)} />
        )}
      </div>

      <button className="ing-arrow" onClick={goNext} aria-label="תמונה הבאה" disabled={!hasMultiple}>
        ›
      </button>
    </div>
  );
}