import { useEffect, useCallback } from 'react';
import styles from './Lightbox.module.css';

export default function Lightbox({ images, currentIndex, onClose, onNavigate }) {
  const total = images.length;
  const image = images[currentIndex];

  const goPrev = useCallback(() => {
    onNavigate((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onNavigate]);

  const goNext = useCallback(() => {
    onNavigate((currentIndex + 1) % total);
  }, [currentIndex, total, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, onClose]);

  if (!image) return null;

  return (
    <div className={styles['ing-overlay']} onClick={onClose}>
      <button
        className={styles['ing-close']}
        onClick={onClose}
        aria-label="סגור"
      >
        ✕
      </button>

      <button
        className={styles['ing-nav-prev']}
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        aria-label="תמונה קודמת"
      >
        ‹
      </button>

      <div className={styles['ing-content']} onClick={(e) => e.stopPropagation()}>
        <img
          src={image.url}
          alt={image.alt || image.name || ''}
          className={styles['ing-full-image']}
        />
        <div className={styles['ing-counter']}>
          {currentIndex + 1} / {total}
        </div>
      </div>

      <button
        className={styles['ing-nav-next']}
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        aria-label="תמונה הבאה"
      >
        ›
      </button>
    </div>
  );
}