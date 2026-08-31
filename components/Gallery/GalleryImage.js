import { useState } from 'react';
import styles from './Gallery.module.css';

// ממפה את ה-size שהתקבל ל-class ייעודי ונפרד - כדי לא להתבסס
// על אותו שם class גם בקונטיינר וגם בפריט (שהיה שברירי ומבלבל)
const SIZE_CLASS = {
  main: 'ing-main',
  side: 'ing-side',
  grid: 'ing-grid-item',
};

export default function GalleryImage({ image, size, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const sizeClass = styles[SIZE_CLASS[size]];

  if (failed) {
    return (
      <div className={`${styles['ing-image-wrapper']} ${sizeClass} ${styles['ing-failed']}`}>
        <span>לא ניתן לטעון תמונה</span>
      </div>
    );
  }

  return (
    <div className={`${styles['ing-image-wrapper']} ${sizeClass}`} onClick={onClick}>
      {!loaded && <div className={styles['ing-skeleton']} />}
      {
console.log('image.url:', image.url)}
      <img
        src={image.url}
        alt={image.alt || image.name || ''}
        loading="lazy"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    
    </div>
  );
}