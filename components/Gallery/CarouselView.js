import { useState, useCallback } from 'react';
import GalleryImage from './GalleryImage';
import styles from './Gallery.module.css';

const WINDOW_SIZE = 5;

export default function CarouselView({ images = [], onImageClick }) {
    const length = images.length;
    const windowSize = Math.min(WINDOW_SIZE, length);
    const half = Math.floor(windowSize / 2);

    // windowStart = אינדקס התמונה שמיוצגת ע"י הנקודה הכי שמאלית מבין ה-5.
    // highlightPosition = איזו מבין 5 המשבצות הקבועות (0-4) מודגשת כרגע.
    // currentIndex תמיד נגזר משני אלה - אף פעם לא state נפרד, כדי שלא יתבדרו.
    const [dotState, setDotState] = useState(() => ({
        windowStart: length > 0 ? (length - half) % length : 0,
        highlightPosition: half, // מתחילים באמצע
    }));

    const currentIndex = length > 0 ? (dotState.windowStart + dotState.highlightPosition) % length : 0;

    const goNext = useCallback(() => {
        if (length === 0) return;
        setDotState((prev) => {
            if (prev.highlightPosition < windowSize - 1) {
                // עדיין יש לאן "לזוז" בתוך 5 הנקודות הקיימות - רק ההדגשה זזה
                return { ...prev, highlightPosition: prev.highlightPosition + 1 };
            }
            // כבר בקצה הימני - "מגלגלים": השמאלית יוצאת, נקודה חדשה נכנסת מימין,
            // וההדגשה נשארת קבועה בקצה הימני
            return {
                windowStart: (prev.windowStart + 1) % length,
                highlightPosition: windowSize - 1,
            };
        });
    }, [length, windowSize]);

    const goPrev = useCallback(() => {
        if (length === 0) return;
        setDotState((prev) => {
            if (prev.highlightPosition > 0) {
                return { ...prev, highlightPosition: prev.highlightPosition - 1 };
            }
            return {
                windowStart: (prev.windowStart - 1 + length) % length,
                highlightPosition: 0,
            };
        });
    }, [length]);

    const jumpToPosition = (position) => {
        setDotState((prev) => ({ ...prev, highlightPosition: position }));
    };

    if (length === 0) return null;

    const prevIndex = (currentIndex - 1 + length) % length;
    const nextIndex = (currentIndex + 1) % length;
    const hasMultiple = length > 1;

    return (
        <div>
            <div className={styles['ing-carousel']} dir="rtl">
                <button className={styles['ing-arrow']} onClick={goPrev} aria-label="תמונה קודמת" disabled={!hasMultiple}>
                    ‹
                </button>

                <div className={styles['ing-track']}>
                    {hasMultiple && (
                        <GalleryImage image={images[prevIndex]} size="side" onClick={goPrev} />
                    )}

                    <GalleryImage
                        image={images[currentIndex]}
                        size="main"
                        onClick={() => onImageClick(images[currentIndex].id)}
                    />

                    {hasMultiple && (
                        <GalleryImage image={images[nextIndex]} size="side" onClick={goNext} />
                    )}
                </div>

                <button className={styles['ing-arrow']} onClick={goNext} aria-label="תמונה הבאה" disabled={!hasMultiple}>
                    ›
                </button>
            </div>

            {hasMultiple && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '4px 0 8px' }}>
                    {Array.from({ length: windowSize }, (_, position) => {
                        const isActive = position === dotState.highlightPosition;
                        return (
                            <button
                                key={position}
                                onClick={() => jumpToPosition(position)}
                                aria-label={`מיקום ${position + 1} מתוך ${windowSize}`}
                                style={{
                                    width: isActive ? 24 : 8,
                                    height: 8,
                                    borderRadius: 999,
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    backgroundColor: isActive ? '#047AFF' : '#D6E5FC',
                                    transition: 'width 0.2s ease, background-color 0.2s ease',
                                }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}