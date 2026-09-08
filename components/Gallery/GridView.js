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

  const start = page * PAGE_SIZE;

  return (
    <div style={{ width: '100%', minWidth: 0, minHeight: 0, flex: '1 1 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className={styles['ing-grid-slider']}>
        {/* dir="rtl" מעמיד את העמוד הבא משמאל, וה-translateX החיובי מביא אותו משמאל למרכז */}
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
        <div className={styles['ing-grid-pagination']} dir="rtl">
          {/* כפתור ימין (→): מנוטרל בעמוד הראשון (0), מחזיר אחורה לעמוד הקודם */}
          <button
            className={styles['ing-page-arrow']}
            onClick={goPrevPage}
            disabled={page === 0}
            aria-label="הקודמות"
          >
            →
          </button>

          <span className={styles['ing-page-label']}>
            {start + 1}-{Math.min(start + PAGE_SIZE, images.length)} מתוך {images.length}
          </span>

          {/* כפתור שמאל (←): פעיל בעמוד הראשון, מעביר קדימה לעמוד הבא משמאל */}
          <button
            className={styles['ing-page-arrow']}
            onClick={goNextPage}
            disabled={page === totalPages - 1}
            aria-label="הבאות"
          >
            ←
          </button>
        </div>
      )}
    </div>
  );
}