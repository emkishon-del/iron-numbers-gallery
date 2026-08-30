import { useState } from 'react';
import GalleryToolbar from './GalleryToolbar';
import CarouselView from './CarouselView';
import GridView from './GridView';

export default function Gallery({ images = [] }) {
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'

  return (
    <div className="ing-gallery">
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