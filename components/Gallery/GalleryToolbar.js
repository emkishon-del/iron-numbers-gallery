import { useState, useRef, useEffect } from 'react';
import styles from './Gallery.module.css';
import GalleryIcon from './GalleryIcon';

const SORT_OPTIONS = [
    { value: 'name-asc', label: 'שם' },
    { value: 'date-desc', label: 'החדש ביותר' },
    { value: 'date-asc', label: 'הישן ביותר' },
];

export default function GalleryToolbar({ viewMode, onViewModeChange, imageCount, sortType, onSortChange }) {
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

                <SortDropdown sortType={sortType} onSortChange={onSortChange} />
            </div>

            <span className={styles['ing-count-label']}>
                <strong>{imageCount} תמונות בגלריה </strong>
                <GalleryIcon classname={styles['ing-count-label']} />
            </span>

        </div>
    );
}

function SortDropdown({ sortType, onSortChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selected = SORT_OPTIONS.find((opt) => opt.value === sortType) || SORT_OPTIONS[0];

    // סגירה בלחיצה מחוץ לדרופדאון
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (value) => {
        onSortChange(value);
        setIsOpen(false);
    };

    return (
        <div className={styles['ing-sort-dropdown']} ref={wrapperRef}>
            <button
                type="button"
                className={styles['ing-sort-button']}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={styles['ing-sort-button-label']}>
                    מיין לפי: <strong>{selected.label}</strong>
                </span>
            </button>

            {isOpen && (
                <ul className={styles['ing-sort-menu']} role="listbox">
                    {SORT_OPTIONS.map((opt) => (
                        <li key={opt.value} role="option" aria-selected={opt.value === sortType}>
                            <button
                                type="button"
                                className={
                                    opt.value === sortType
                                        ? `${styles['ing-sort-option']} ${styles['ing-sort-option-active']}`
                                        : styles['ing-sort-option']
                                }
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}