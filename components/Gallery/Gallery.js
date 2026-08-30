import { useState } from 'react';
import GalleryToolbar from './GalleryToolbar';
import CarouselView from './CarouselView';
import GridView from './GridView';
import styles from './Gallery.module.css';

export default function Gallery({ images = [] }) {
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'

  return (
    <div className={styles['ing-gallery']}>
      <GalleryToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        imageCount={images.length}
      />

      {viewMode === 'carousel' ? (
        <CarouselView images={images} />
      ) : (
        <GridView images={images} />
      )}
    </div>
  );
}