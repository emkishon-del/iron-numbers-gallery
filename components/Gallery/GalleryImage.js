import { useState } from 'react';

export default function GalleryImage({ image, size, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`ing-image-wrapper ing-${size} ing-failed`}>
        <span>לא ניתן לטעון תמונה</span>
      </div>
    );
  }

  return (
    <div className={`ing-image-wrapper ing-${size}`} onClick={onClick}>
      {!loaded && <div className="ing-skeleton" />}
      <img
        src={image.url}
        alt={image.alt || image.name || ''}
        loading="lazy"
        style={{ opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
      {/* שם מוצג רק בגריד, ורק אם קיים */}
      {size === 'grid' && image.name && (
        <div className="ing-grid-caption">{image.name}</div>
      )}
    </div>
  );
}