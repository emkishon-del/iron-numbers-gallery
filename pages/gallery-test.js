import Gallery from '../components/Gallery/Gallery';

// עמוד בדיקה בלבד - לא מקושר לניווט הראשי.
// גישה: http://localhost:3000/gallery-test

// === הגדרות ל-File Service - עדכן לפי הסביבה שלך ===
const FILE_SERVICE_URL = 'http://localhost:3001';
const FILE_SERVICE_API_KEY = 'your-api-key-here'; // חייב להיות זהה ל-API_KEY ב-.env של ה-File Service
const FOLDER_PATH = 'C:\\Users\\user\\iron-numbers-gallery\\public\\pic'; // עדכן לנתיב אמיתי אצלך

export default function GalleryTestPage() {
  return (
    <div style={{ padding: 20, direction: 'rtl' }}>
      <Gallery
        folderPath={FOLDER_PATH}
      />
    </div>
  );
}