import { useState } from 'react';
import GalleryImage from './GalleryImage';
import styles from './Gallery.module.css';

const PAGE_SIZE = 6;

export default function GridView({ images = [], onImageClick, onImageFail }) {
  const [page, setPage] = useState(0);

  if (images.length === 0) return null;

  const totalPages = Math.ceil(images.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  let visibleImages = images.slice(start, end);

  if (visibleImages.length < PAGE_SIZE) {
    const missing = PAGE_SIZE - visibleImages.length;
    const previousImages = images.slice(start - missing, start);

    visibleImages = [...previousImages, ...visibleImages];
  }

  const goNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const goPrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div>
      <div className={styles['ing-grid']} dir="rtl">
        {visibleImages.map((image) => (
          <GalleryImage
            key={image.id}
            image={image}
            size="grid"
            onClick={() => onImageClick(image.id)}
            onFail={onImageFail}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles['ing-grid-pagination']}>
          <button
            className={styles['ing-page-arrow']}
            onClick={goPrevPage}
            disabled={page === 0}
            aria-label="הקודמות"
          >
            ↑
          </button>

          <span className={styles['ing-page-label']}>
            {start + 1}-{Math.min(start + PAGE_SIZE, images.length)} מתוך {images.length}
          </span>

          <button
            className={styles['ing-page-arrow']}
            onClick={goNextPage}
            disabled={page === totalPages - 1}
            aria-label="הבאות"
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
}