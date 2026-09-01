import { useState, useMemo } from 'react';
import GalleryToolbar from './GalleryToolbar';
import CarouselView from './CarouselView';
import GridView from './GridView';
import Lightbox from './Lightbox/Lightbox';
import styles from './Gallery.module.css';

export default function Gallery({ images = [] }) {
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'
  const [sortType, setSortType] = useState('date-desc'); // שומר את האופציה שנבחרה
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [failedIds, setFailedIds] = useState(() => new Set());

  const handleImageFail = (id) => {
    setFailedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const visibleImages = useMemo(
    () => images.filter((image) => !failedIds.has(image.id)),
    [images, failedIds]
  );

  return (
    <div className={styles['ing-gallery']}>
      <GalleryToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        imageCount={visibleImages.length}
        sortType={sortType}
        onSortChange={setSortType} // מעדכן את ה-State כשהמשתמש בוחר אופציה
      />

      {viewMode === 'carousel' ? (
        <CarouselView
          key={visibleImages.length}
          images={visibleImages}
          onImageClick={setLightboxIndex}
          onImageFail={handleImageFail}
        />
      ) : (
        <GridView images={visibleImages} onImageClick={setLightboxIndex} onImageFail={handleImageFail} />
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={visibleImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}