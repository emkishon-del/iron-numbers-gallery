import { useState } from 'react';
import GalleryImage from './GalleryImage';
import styles from './Gallery.module.css';

const PAGE_SIZE = 6;

export default function GridView({ images = [], onImageClick, onImageFail }) {
  const [page, setPage] = useState(0);

  if (images.length === 0) return null;

  const totalPages = Math.ceil(images.length / PAGE_SIZE);

  const getPageImages = (p) => {
    const start = p * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    let visible = images.slice(start, end);

    if (visible.length < PAGE_SIZE) {
      const missing = PAGE_SIZE - visible.length;
      const previousImages = images.slice(start - missing, start);
      visible = [...previousImages, ...visible];
    }
    return visible;
  };

  const goNextPage = () => setPage((prev) => Math.min(prev + 1, totalPages - 1));
  const goPrevPage = () => setPage((prev) => Math.max(prev - 1, 0));

  return (
    <div className={styles['ing-grid-view']}>
      <div className={styles['ing-grid-nav-row']} dir="rtl">
        {totalPages > 1 && (
          <button
           className={styles['ing-page-arrow']}
            onClick={goNextPage}
            disabled={page === totalPages - 1}
            aria-label="הבאות"
          >
            ‹
          </button>
        )}

        <div className={styles['ing-grid-slider']}>
          <div
            className={styles['ing-grid-track']}
            dir="rtl"
            style={{ transform: `translateX(${page * 100}%)` }}
          >
            {Array.from({ length: totalPages }, (_, pageIndex) => (
              <div key={pageIndex} className={styles['ing-grid-half']}>
                <div className={styles['ing-grid']} dir="rtl">
                  {getPageImages(pageIndex).map((image) => (
                    <GalleryImage
                      key={image.uid}
                      image={image}
                      size="grid"
                      onClick={() => onImageClick(images.findIndex((img) => img.uid === image.uid))}
                      onFail={onImageFail}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <button
         
                className={styles['ing-page-arrow']}
            onClick={goPrevPage}
            disabled={page === 0}
            aria-label="הקודמות"
          >
            ›
           
          </button>
        )}
      </div>
    </div>
  );
}