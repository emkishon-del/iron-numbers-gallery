import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import GalleryImage from './GalleryImage';
import styles from './Gallery.module.css';

const WINDOW_SIZE = 5;

export default function CarouselView({
    images = [],
    onImageClick,
    onImageFail,
}) {
    const length = images.length;
    const windowSize = Math.min(WINDOW_SIZE, length);
    const half = Math.floor(windowSize / 2);

    // =========================================================
    // DOTS STATE
    // The dots logic is kept because it currently controls
    // the current image index.
    // =========================================================

    const [dotState, setDotState] = useState(() => ({
        windowStart:
            length > 0 ? (length - half) % length : 0,
        highlightPosition: half,
    }));

    // כיוון התנועה האחרון: 1 = הבא (next), -1 = קודם (prev)
    const [direction, setDirection] = useState(0);

    const currentIndex =
        length > 0
            ? (dotState.windowStart + dotState.highlightPosition) % length
            : 0;

    // =========================================================
    // NAVIGATION
    // =========================================================

    const goNext = useCallback(() => {
        if (length === 0) return;
        setDirection(1);

        setDotState((prev) => {
            // Move the active position to the right.
            if (prev.highlightPosition < windowSize - 1) {
                return {
                    ...prev,
                    highlightPosition:
                        prev.highlightPosition + 1,
                };
            }

            // Move the dots window when reaching the right edge.
            return {
                windowStart:
                    (prev.windowStart + 1) % length,
                highlightPosition: windowSize - 1,
            };
        });
    }, [length, windowSize]);

    const goPrev = useCallback(() => {
        if (length === 0) return;
        setDirection(-1);

        setDotState((prev) => {
            // Move the active position to the left.
            if (prev.highlightPosition > 0) {
                return {
                    ...prev,
                    highlightPosition:
                        prev.highlightPosition - 1,
                };
            }

            // Move the dots window when reaching the left edge.
            return {
                windowStart:
                    (prev.windowStart - 1 + length) % length,
                highlightPosition: 0,
            };
        });
    }, [length]);

    // Used only by the dots when they are enabled again.
    const jumpToPosition = (position) => {
        setDotState((prev) => ({
            ...prev,
            highlightPosition: position,
        }));
    };

    if (length === 0) return null;

    const prevIndex =
        (currentIndex - 1 + length) % length;

    const nextIndex =
        (currentIndex + 1) % length;

    const hasMultiple = length > 1;

    // רשימת ה"סלוטים" הנוכחיים, לפי id של כל תמונה - נחוץ ל-FlipRow
    const slots = hasMultiple
        ? [
              { image: images[prevIndex], size: 'side', onClick: goPrev },
              {
                  image: images[currentIndex],
                  size: 'main',
                  onClick: () => onImageClick(images[currentIndex].id),
              },
              { image: images[nextIndex], size: 'side', onClick: goNext },
          ]
        : [
              {
                  image: images[currentIndex],
                  size: 'main',
                  onClick: () => onImageClick(images[currentIndex].id),
              },
          ];

    return (
        <div>

            {/* =====================================================
                IMAGES / CAROUSEL
                הערה: בגלל dir="rtl", סדר האלמנטים ב-flex מתהפך ויזואלית -
                הכפתור הראשון בקוד (goNext) מוצג בפועל מימין.
            ====================================================== */}

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
                DOTS / NAVIGATION

                Temporarily disabled.
                Keep the logic above because currentIndex
                currently depends on dotState.
            ====================================================== */}

            {/*
            {hasMultiple && (
                <div
                    className={styles['ing-dots']}
                >
                    {Array.from(
                        { length: windowSize },
                        (_, position) => {
                            const isActive =
                                position ===
                                dotState.highlightPosition;

                            return (
                                <button
                                    key={position}
                                    className={`
                                        ${styles['ing-dot']}
                                        ${
                                            isActive
                                                ? styles['ing-dot-active']
                                                : ''
                                        }
                                    `}
                                    onClick={() =>
                                        jumpToPosition(position)
                                    }
                                    aria-label={`מיקום ${
                                        position + 1
                                    } מתוך ${windowSize}`}
                                />
                            );
                        }
                    )}
                </div>
            )}
            */}
        </div>
    );
}

// =========================================================
// FlipRow
// אחראי על אנימציית ה-FLIP: מזיז כל תמונה קיימת מהמיקום
// הישן שלה למיקום החדש בצורה חלקה, וגם נותן אנימציית
// כניסה לתמונה חדשה שלא הייתה קיימת קודם.
// =========================================================

function FlipRow({ slots, onImageFail, direction }) {
    const nodeRefs = useRef(new Map());   // image.id -> אלמנט DOM
    const prevRects = useRef(new Map());  // image.id -> מיקום מהרנדר הקודם

    useLayoutEffect(() => {
        const newRects = new Map();

        nodeRefs.current.forEach((node, id) => {
            if (node) newRects.set(id, node.getBoundingClientRect());
        });

        // שלב 1: תמונות שהיו קיימות גם קודם - מזיזים מהמיקום הישן לחדש
        let referenceDelta = 0;

        nodeRefs.current.forEach((node, id) => {
            if (!node) return;
            const oldRect = prevRects.current.get(id);
            const newRect = newRects.get(id);

            if (oldRect && newRect) {
                const deltaX = oldRect.left - newRect.left;

                if (deltaX !== 0) {
                    if (referenceDelta === 0) {
                        referenceDelta = deltaX; // שומרים דוגמה למרחק תנועה טיפוסי
                    }

                    node.style.transition = 'none';
                    node.style.transform = `translateX(${deltaX}px)`;

                    requestAnimationFrame(() => {
                        node.style.transition = 'transform 1s ease';
                        node.style.transform = 'translateX(0)';
                    });
                }
            }
        });

        // שלב 2: תמונות חדשות לגמרי (אין להן oldRect) - נותנים להן
        // נקודת התחלה מלאכותית בכיוון התנועה, כדי שגם הן "ייכנסו"
        // עם אנימציה ולא יופיעו בבום.
        nodeRefs.current.forEach((node, id) => {
            if (!node) return;
            const oldRect = prevRects.current.get(id);
            const newRect = newRects.get(id);

            if (!oldRect && newRect) {
                const enterOffset =
                    referenceDelta !== 0
                        ? referenceDelta
                        : direction === 1
                        ? -80
                        : 80;

                node.style.transition = 'none';
                node.style.transform = `translateX(${enterOffset}px)`;

                requestAnimationFrame(() => {
                    node.style.transition = 'transform 1s ease';
                    node.style.transform = 'translateX(0)';
                });
            }
        });

        prevRects.current = newRects;
    });

    return (
        <div className={styles['ing-track-inner']}>
            {slots.map(({ image, size, onClick }) => (
                <div
                    key={image.id}
                    ref={(node) => {
                        if (node) nodeRefs.current.set(image.id, node);
                        else nodeRefs.current.delete(image.id);
                    }}
                    style={{
                        width: size === 'main' ? '60%' : '20%',
                        maxWidth: size === 'main' ? '600px' : undefined,
                        height: size === 'main' ? '400px' : '250px',
                        flexShrink: 0,
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