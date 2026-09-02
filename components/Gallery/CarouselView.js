import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import GalleryImage from './GalleryImage';
import styles from './Gallery.module.css';

// const WINDOW_SIZE = 5; // כבר לא בשימוש כרגע (שייך לנקודות)

export default function CarouselView({
    images = [],
    onImageClick,
    onImageFail,
}) {
    const length = images.length;

    // ניהול כיוון האנימציה (ימינה/שמאלה)
    const [direction, setDirection] = useState(0);

    // לוגיקה חדשה ופשוטה: שמירת האינדקס הנוכחי בלבד
    const [currentIndex, setCurrentIndex] = useState(0);

    const goNext = useCallback(() => {
        if (length === 0) return;
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % length);
    }, [length]);

    const goPrev = useCallback(() => {
        if (length === 0) return;
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + length) % length);
    }, [length]);

    /* =====================================================
       לוגיקת הנקודות (Dots) הישנה - שמורה בהערה
       ===================================================== 
    const windowSize = Math.min(WINDOW_SIZE, length);
    const half = Math.floor(windowSize / 2);

    const [dotState, setDotState] = useState(() => ({
        windowStart: length > 0 ? (length - half) % length : 0,
        highlightPosition: half,
    }));

    const currentIndex = length > 0 
        ? (dotState.windowStart + dotState.highlightPosition) % length 
        : 0;

    const goNext = useCallback(() => {
        if (length === 0) return;
        setDirection(1);
        setDotState((prev) => {
            if (prev.highlightPosition < windowSize - 1) {
                return { ...prev, highlightPosition: prev.highlightPosition + 1 };
            }
            return {
                windowStart: (prev.windowStart + 1) % length,
                highlightPosition: windowSize - 1,
            };
        });
    }, [length, windowSize]);

    const goPrev = useCallback(() => {
        if (length === 0) return;
        setDirection(-1);
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
        setDotState((prev) => ({
            ...prev,
            highlightPosition: position,
        }));
    };
    ===================================================== */

    if (length === 0) return null;

    const prevIndex = (currentIndex - 1 + length) % length;
    const nextIndex = (currentIndex + 1) % length;
    const hasMultiple = length > 1;

    const slots = hasMultiple
        ? [
            { image: images[prevIndex], size: 'side', onClick: goPrev },
            {
                image: images[currentIndex],
                size: 'main',
                onClick: () => onImageClick(currentIndex),
            },
            { image: images[nextIndex], size: 'side', onClick: goNext },
        ]
        : [
            {
                image: images[currentIndex],
                size: 'main',
                onClick: () => onImageClick(currentIndex),
            },
        ];

    return (
        <div>
            <div
                className={styles['ing-carousel']}
                dir="rtl"
            >
                <button
                    className={styles['ing-arrow']}
                    onClick={goNext}
                    aria-label="תמונה הבאה"
                    disabled={!hasMultiple}
                >
                    ‹
                </button>

                <div className={styles['ing-track']}>
                    <FlipRow
                        slots={slots}
                        onImageFail={onImageFail}
                        direction={direction}
                    />
                </div>

                <button
                    className={styles['ing-arrow']}
                    onClick={goPrev}
                    aria-label="תמונה קודמת"
                    disabled={!hasMultiple}
                >
                    ›
                </button>
            </div>

            {/* =====================================================
                DOTS / NAVIGATION - JSX
                שמור בהערה במידה ותרצה להחזיר
            ====================================================== 
            {hasMultiple && (
                <div className={styles['ing-dots']}>
                    {Array.from(
                        { length: windowSize },
                        (_, position) => {
                            const isActive = position === dotState.highlightPosition;
                            return (
                                <button
                                    key={position}
                                    className={`
                                        ${styles['ing-dot']}
                                        ${isActive ? styles['ing-dot-active'] : ''}
                                    `}
                                    onClick={() => jumpToPosition(position)}
                                    aria-label={`מיקום ${position + 1} מתוך ${windowSize}`}
                                />
                            );
                        }
                    )}
                </div>
            )}
            ====================================================== */}
        </div>
    );
}

function FlipRow({ slots, onImageFail, direction }) {
    const nodeRefs = useRef(new Map());
    const prevRects = useRef(new Map());

    useLayoutEffect(() => {
        const newRects = new Map();

        // מודדים את המיקום והגודל הנוכחיים
        nodeRefs.current.forEach((node, uid) => {
            if (node) {
                newRects.set(
                    uid,
                    node.getBoundingClientRect()
                );
            }
        });

        let referenceDelta = 0;

        // =====================================================
        // תמונות שהיו קיימות גם קודם
        // =====================================================

        nodeRefs.current.forEach((node, uid) => {
            if (!node) return;

            const oldRect = prevRects.current.get(uid);
            const newRect = newRects.get(uid);

            if (!oldRect || !newRect) return;

            const deltaX =
                oldRect.left - newRect.left;

            const deltaY =
                oldRect.top - newRect.top;

            const scaleX =
                oldRect.width / newRect.width;

            const scaleY =
                oldRect.height / newRect.height;

            if (
                deltaX !== 0 ||
                deltaY !== 0 ||
                scaleX !== 1 ||
                scaleY !== 1
            ) {
                if (referenceDelta === 0 && deltaX !== 0) {
                    referenceDelta = deltaX;
                }
                node.style.transformOrigin = 'top left';

                // מבטלים transition בזמן שאנחנו
                // מחזירים את האלמנט למצב הקודם
                node.style.transition = 'none';

                // מחזירים אותו ויזואלית למיקום
                // ולגודל הקודמים
                node.style.transform = `
                    translate(${deltaX}px, ${deltaY}px)
                    scale(${scaleX}, ${scaleY})
                `;

                requestAnimationFrame(() => {
                    node.style.transition =
                        'transform 500ms ease';

                    // עכשיו הוא נע למקום ולגודל החדשים
                    node.style.transform =
                        'translate(0, 0) scale(1)';
                });
            }
        });

        // =====================================================
        // תמונות חדשות
        // =====================================================

        nodeRefs.current.forEach((node, uid) => {
            if (!node) return;

            const oldRect =
                prevRects.current.get(uid);

            const newRect =
                newRects.get(uid);

            if (oldRect || !newRect) return;

            const enterOffset =
                referenceDelta !== 0
                    ? referenceDelta
                    : direction === 1
                        ? -80
                        : 80;

            node.style.transition = 'none';

            node.style.transform = `
                translateX(${enterOffset}px)
                scale(0.8)
            `;

            requestAnimationFrame(() => {
                node.style.transition =
                    'transform 450ms ease';

                node.style.transform =
                    'translateX(0) scale(1)';
            });
        });

        // המידות הנוכחיות יהפכו ל"ישנות"
        // ב-render הבא
        prevRects.current = newRects;
    });

    return (
        <div className={styles['ing-track-inner']}>
            {slots.map(({ image, size, onClick }) => (
                <div
                    key={image.uid}
                    ref={(node) => {
                        if (node) {
                            nodeRefs.current.set(
                                image.uid,
                                node
                            );
                        } else {
                            nodeRefs.current.delete(
                                image.uid
                            );
                        }
                    }}
                    style={{
                        width:
                            size === 'main'
                                ? '60%'
                                : '20%',

                        maxWidth:
                            size === 'main'
                                ? '600px'
                                : undefined,

                        height:
                            size === 'main'
                                ? '400px'
                                : '250px',

                        flexShrink: 0,
                        transformOrigin: 'top left',

                    }}
                >
                    <GalleryImage
                        image={image}
                        size={size}
                        onClick={onClick}
                        onFail={onImageFail}
                    />
                </div>
            ))}
        </div>
    );
}