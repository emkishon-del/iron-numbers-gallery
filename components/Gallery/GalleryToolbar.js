import styles from './Gallery.module.css';

export default function GalleryToolbar({ viewMode, onViewModeChange, imageCount }) {
  return (
    <div className={styles['ing-toolbar']} dir="ltr">
      <span className={styles['ing-count-label']}>{imageCount} תמונות בגלריה</span>

      <div className={styles['ing-toolbar-controls']}>
        <select className={styles['ing-sort-select']} disabled>
          <option>מיין לפי תאריך העלאה</option>
          <option>לפי שם</option>
          <option>החדש ביותר</option>
          <option>הישן ביותר</option>
        </select>

        <div className={styles['ing-view-toggle']}>
          <button
            className={
              viewMode === 'carousel'
                ? `${styles['ing-toggle-btn']} ${styles['ing-active']}`
                : styles['ing-toggle-btn']
            }
            onClick={() => onViewModeChange('carousel')}
          >
            קרוסלה
          </button>
          <button
            className={
              viewMode === 'grid'
                ? `${styles['ing-toggle-btn']} ${styles['ing-active']}`
                : styles['ing-toggle-btn']
            }
            onClick={() => onViewModeChange('grid')}
          >
            גריד
          </button>
        </div>
      </div>
    </div>
  );
}