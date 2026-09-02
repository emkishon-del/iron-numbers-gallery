import { useState, useMemo } from 'react';
import GalleryToolbar from './GalleryToolbar';
import CarouselView from './CarouselView';
import GridView from './GridView';
import Lightbox from './Lightbox/Lightbox';
import styles from './Gallery.module.css';

function compareImages(a, b, sortType) {
  switch (sortType) {
    case 'name-asc': {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, 'he');
    }
    case 'date-desc':
      return new Date(b.date) - new Date(a.date);
    case 'date-asc':
      return new Date(a.date) - new Date(b.date);
    default:
      return 0;
  }
}

export default function Gallery({ images = [] }) {
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'
  const [sortType, setSortType] = useState('date-desc');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [failedIds, setFailedIds] = useState(() => new Set());

  // מקבל עכשיו uid (הזהות הקבועה), לא id (שמשתנה עם המיון)
  const handleImageFail = (uid) => {
    setFailedIds((prev) => {
      const next = new Set(prev);
      next.add(uid);
      return next;
    });
  };

  const visibleImages = useMemo(() => {
    // 1. מסננים לפי uid קבוע - לא מושפע מהמיון
    const filtered = images.filter((image) => !failedIds.has(image.uid));
    // 2. ממיינים
    const sorted = [...filtered].sort((a, b) => compareImages(a, b, sortType));
    // 3. עכשיו, ורק עכשיו, קובעים מחדש את ה-id לפי המיקום הסופי (1, 2, 3...)
    //    ה-uid המקורי לא נוגע בכלל - הוא נשאר כפי שהיה
    return sorted.map((image, index) => ({ ...image, id: index + 1 }));
  }, [images, failedIds, sortType]);

  return (
    <div className={styles['ing-gallery']}>
      <GalleryToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        imageCount={visibleImages.length}
        sortType={sortType}
        onSortChange={setSortType}
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