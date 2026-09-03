import { useState } from 'react';
import styles from './Gallery.module.css';

const SIZE_CLASS = {
  main: 'ing-main',
  side: 'ing-side',
  far: 'ing-far',
  grid: 'ing-grid-item',
};

export default function GalleryImage({ image, size, onClick, onFail }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const sizeClass = styles[SIZE_CLASS[size]];

  const handleError = () => {
    setFailed(true);
    onFail?.(image.uid); // uid קבוע - לא image.id שמשתנה עם המיון
  };

  if (failed) {
    return null;
  }

  return (
    <div className={`${styles['ing-image-wrapper']} ${sizeClass}`} onClick={onClick}>
      {!loaded && <div className={styles['ing-skeleton']} />}
      <img
        src={image.url}
        alt={image.alt || image.name || ''}
        loading="lazy"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </div>
  );
}