'use server';

import { promises as fs } from 'fs';
import path from 'path';

// שורש קבוע שממנו מותר לחפש תמונות - שום נתיב לא יכול לצאת מכאן
const PUBLIC_ROOT = path.join(process.cwd(), 'public');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function resolveSafeFolder(folderPath) {
  if (typeof folderPath !== 'string' || folderPath.trim() === '') {
    throw new Error('folderPath is required');
  }

  if (folderPath.includes('..')) {
    throw new Error('folderPath must not contain ".."');
  }

  const normalizedInput = folderPath.replace(/^\/+/, '');
  const resolved = path.normalize(path.join(PUBLIC_ROOT, normalizedInput));

  // ההגנה האמיתית: אחרי הנרמול, הנתיב חייב עדיין להיות בתוך PUBLIC_ROOT
  if (resolved !== PUBLIC_ROOT && !resolved.startsWith(PUBLIC_ROOT + path.sep)) {
    throw new Error('folderPath is outside the allowed root');
  }

  return resolved;
}

function fileNameToDisplayName(fileNameWithoutExt) {
  return fileNameWithoutExt.replace(/[-_]+/g, ' ').trim();
}

// פונקציית ה-Server Action היחידה שהקובץ מייצא - נקראת ישירות
// מתוך Gallery.jsx (Client Component), בלי שום app/api/route.js
export async function getGalleryImages(folderPath) {
  let absoluteFolder;
  try {
    absoluteFolder = resolveSafeFolder(folderPath);
  } catch {
    return { images: [], error: 'נתיב תיקייה לא חוקי' };
  }

  let entries;
  try {
    entries = await fs.readdir(absoluteFolder, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { images: [], error: 'התיקייה לא נמצאה' };
    }
    console.error('getGalleryImages readdir error:', err);
    return { images: [], error: 'שגיאה בטעינת התמונות' };
  }

  // רק קבצים ישירות בתיקייה (לא רקורסיבי), ורק סיומות תמונה
  const imageFiles = entries.filter(
    (entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
  );

  const normalizedFolder = `/${folderPath.replace(/^\/+/, '').replace(/\/+$/, '')}`;

  const images = await Promise.all(
    imageFiles.map(async (entry) => {
      const ext = path.extname(entry.name);
      const baseName = entry.name.slice(0, -ext.length);
      const displayName = fileNameToDisplayName(baseName);

      // תאריך אמין בלבד: זמן העדכון האחרון של הקובץ בפועל - לא מומצא
      let date = null;
      try {
        const stats = await fs.stat(path.join(absoluteFolder, entry.name));
        date = stats.mtime.toISOString().slice(0, 10); // YYYY-MM-DD
      } catch {
        date = null;
      }

      return {
        // uid נבנה משם הקובץ עצמו (מקודד) - יציב וייחודי, לא תלוי במיון/rerender
        uid: encodeURIComponent(entry.name),
        id: 0, // ייקבע מחדש לפי מיקום אחרי המיון - כמו קודם ב-Gallery
        url: `${normalizedFolder}/${entry.name}`,
        name: displayName,
        alt: displayName || entry.name,
        date,
      };
    })
  );

  return { images, error: null };
}