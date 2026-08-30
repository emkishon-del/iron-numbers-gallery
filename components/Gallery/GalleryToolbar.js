export default function GalleryToolbar({ viewMode, onViewModeChange, imageCount }) {
  return (
    <div className="ing-toolbar" dir="rtl">
      <span className="ing-count-label">{imageCount} תמונות בגלריה</span>

      <div className="ing-toolbar-controls">
        {/* תפריט המיון - עדיין לא מחובר ללוגיקה, רק UI */}
        <select className="ing-sort-select" disabled>
          <option>מיין לפי תאריך העלאה</option>
          <option>לפי שם</option>
          <option>החדש ביותר</option>
          <option>הישן ביותר</option>
        </select>

        {/* מתג התצוגה - זה כן עובד */}
        <div className="ing-view-toggle">
          <button
            className={viewMode === 'carousel' ? 'ing-toggle-btn ing-active' : 'ing-toggle-btn'}
            onClick={() => onViewModeChange('carousel')}
          >
            קרוסלה
          </button>
          <button
            className={viewMode === 'grid' ? 'ing-toggle-btn ing-active' : 'ing-toggle-btn'}
            onClick={() => onViewModeChange('grid')}
          >
            גריד
          </button>
        </div>
      </div>
    </div>
  );
}