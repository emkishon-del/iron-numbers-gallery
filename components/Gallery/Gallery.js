import { useState, useMemo, useEffect } from 'react';
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

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

// =========================================================
// כל לוגיקת השליפה מה-File Service הקיים - בתוך הקומפוננטה בלבד.
// משתמשת רק בשני ה-endpoints שכבר קיימים ורצים: /api/files/list ו-/api/files/get.
// לא נוגעת ולא מוסיפה שום דבר בצד ה-File Service.
// =========================================================

async function fetchImagesFromFolder(folderPath, fileServiceUrl, apiKey) {
  // שלב 1: קבלת רשימת שמות הקבצים - endpoint קיים
  const listResponse = await fetch(`${fileServiceUrl}/api/files/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({ directoryPath: folderPath }),
  });

  if (!listResponse.ok) {
    throw new Error(`File service list failed (${listResponse.status})`);
  }

  const fileNames = await listResponse.json(); // מערך שמות קבצים, כפי שה-API הקיים מחזיר

  const imageFileNames = fileNames.filter((name) =>
    SUPPORTED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext))
  );

  // בונים נתיב מלא לכל קובץ, בהתאם למפריד שכבר קיים ב-folderPath (\ או /)
  const separator = folderPath.includes('\\') ? '\\' : '/';
  const normalizedFolder = folderPath.endsWith(separator)
    ? folderPath.slice(0, -1)
    : folderPath;

  // שלב 2: לכל קובץ - שליפת התוכן (base64) - endpoint קיים
  const results = await Promise.allSettled(
    imageFileNames.map(async (fileName, index) => {
      const filePath = `${normalizedFolder}${separator}${fileName}`;

      const getResponse = await fetch(`${fileServiceUrl}/api/files/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ filePath }),
      });

      if (!getResponse.ok) {
        throw new Error(`File service get failed for ${fileName} (${getResponse.status})`);
      }

      const data = await getResponse.json();
      const ext = fileName.split('.').pop().toLowerCase();
      const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
      // data.name, data.content, data.date

      return {
        uid: filePath,
        id: index + 1,
        url: `data:${mimeType};base64,${data.content}`,
        name: data.name.replace(/\.[^/.]+$/, ''),
        alt: data.name,
        date: data.date,
      };
    })
  );

  // תמונה שנכשלה כבר בשלב השליפה (לא בטעינת ה-<img>) - פשוט מדלגים עליה
  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
}

export default function Gallery({
  images: imagesProp = [],
  // === שלושת ה-props החדשים בלבד - שאר הקומפוננטה לא השתנתה ===
  folderPath,
  fileServiceUrl,
  fileServiceApiKey,
}) {
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'
  const [sortType, setSortType] = useState('date-desc');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [failedIds, setFailedIds] = useState(() => new Set());

  const [fetchedImages, setFetchedImages] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!folderPath) {
      setFetchedImages(null);
      setFetchError(null);
      return;
    }

    let cancelled = false;

    fetchImagesFromFolder(folderPath, fileServiceUrl, fileServiceApiKey)
      .then((images) => {
        if (!cancelled) setFetchedImages(images);
      })
      .catch((err) => {
        if (!cancelled) {
          setFetchError(err.message || 'שגיאה בטעינת תמונות מהתיקייה');
          setFetchedImages([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [folderPath, fileServiceUrl, fileServiceApiKey]);

  const images = folderPath ? fetchedImages ?? [] : imagesProp;

  // === מכאן ולמטה - בדיוק אותה לוגיקה קיימת, ללא שינוי ===

  const handleImageFail = (uid) => {
    setFailedIds((prev) => {
      const next = new Set(prev);
      next.add(uid);
      return next;
    });
  };

  const visibleImages = useMemo(() => {
    const filtered = images.filter((image) => !failedIds.has(image.uid));
    const sorted = [...filtered].sort((a, b) => compareImages(a, b, sortType));
    return sorted.map((image, index) => ({ ...image, id: index + 1 }));
  }, [images, failedIds, sortType]);

  if (folderPath && fetchedImages === null && !fetchError) {
    return (
      <div className={styles['ing-gallery']}>
        <p style={{ textAlign: 'center', color: '#6B6B6B' }}>טוען תמונות מהתיקייה...</p>
      </div>
    );
  }

  return (
    <div className={styles['ing-gallery']}>
      {fetchError && (
        <p style={{ textAlign: 'center', color: '#C4271E', marginBottom: 8 }}>
          שגיאה בחיבור ל-File Service: {fetchError}
        </p>
      )}

      <GalleryToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        imageCount={visibleImages.length}
        sortType={sortType}
        onSortChange={setSortType}
      />

      {viewMode === 'carousel' ? (
        <CarouselView
          key={`${visibleImages.length}-${sortType}`}
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