import { useState } from 'react';
import GalleryToolbar from './GalleryToolbar';
import CarouselView from './CarouselView';
import GridView from './GridView';
import Lightbox from './Lightbox/Lightbox';
import styles from './Gallery.module.css';

export default function Gallery({ images = [] }) {
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'
  const [lightboxIndex, setLightboxIndex] = useState(null);

  return (
    <div className={styles['ing-gallery']}>
      <GalleryToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        imageCount={images.length}
      />

      {viewMode === 'carousel' ? (
        <CarouselView images={images} onImageClick={setLightboxIndex} />
      ) : (
        <GridView images={images} onImageClick={setLightboxIndex} />
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}