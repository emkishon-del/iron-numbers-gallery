import styles from './Gallery.module.css';
import GalleryIcon from './GalleryIcon';
export default function GalleryToolbar({ viewMode, onViewModeChange, imageCount , sortType,onSortChange}) {
    return (
        <div className={styles['ing-toolbar']} dir="rtl">

            <div className={styles['ing-toolbar-controls']}>


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
                <select className={styles['ing-sort-select']} value={sortType} onChange={(e) => onSortChange(e.target.value)}>
                    <option value="name-asc">לפי שם</option>
                    <option value="date-desc">החדש ביותר</option>
                    <option value="date-asc">הישן ביותר</option>
                </select>
            </div>
            <span className={styles['ing-count-label']}><strong>{imageCount} תמונות בגלריה </strong>
                <GalleryIcon classname={styles['ing-count-label']} /></span>
             
        </div>
    );
}