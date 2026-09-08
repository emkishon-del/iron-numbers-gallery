import { useState } from 'react';
import Gallery from '../components/Gallery/Gallery';
import { mockImages } from '../components/Gallery/mockImages';

// עמוד בדיקה בלבד - לא מקושר לניווט הראשי.
// גישה: http://localhost:3000/gallery-test

// === הגדרות ל-File Service - עדכן לפי הסביבה שלך ===
const FILE_SERVICE_URL = 'http://localhost:3001';
const FILE_SERVICE_API_KEY = 'your-api-key-here'; // חייב להיות זהה ל-API_KEY ב-.env של ה-File Service
const FOLDER_PATH = 'C:\\Users\\user\\iron-numbers-gallery\\public\\pic'; // עדכן לנתיב אמיתי אצלך

export default function GalleryTestPage() {
  // מתג קטן כדי לעבור בקלות בין מקור דמה (mock) לבין תיקייה אמיתית דרך ה-File Service
  const [source, setSource] = useState('folder'); // 'folder' | 'mock'

  return (
    <div style={{ padding: 20, direction: 'rtl' }}>
      <h1>בדיקת גלריה - קרוסלה + גריד</h1>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button onClick={() => setSource('folder')} disabled={source === 'folder'}>
          מקור: תיקייה אמיתית (File Service)
        </button>
        <button onClick={() => setSource('mock')} disabled={source === 'mock'}>
          מקור: תמונות דמה (mockImages)
        </button>
      </div>

      {source === 'folder' ? (
        <Gallery
          folderPath={FOLDER_PATH}
          fileServiceUrl={FILE_SERVICE_URL}
          fileServiceApiKey={FILE_SERVICE_API_KEY}
        />
      ) : (
        <Gallery images={mockImages} />
      )}
    </div>
  );
}