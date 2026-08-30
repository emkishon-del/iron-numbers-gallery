import Gallery from '../components/Gallery/Gallery';
import { mockImages } from '../components/Gallery/mockImages';

// עמוד בדיקה בלבד - לא מקושר לניווט הראשי.
// גישה: http://localhost:3000/gallery-test

export default function GalleryTestPage() {
  return (
    <div style={{ padding: 20, direction: 'rtl' }}>
      <h1>בדיקת גלריה - קרוסלה + גריד (שלב 2)</h1>
      <Gallery images={mockImages} />
    </div>
  );
}