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

    const [dotState, setDotState] = useState(() => ({
        windowStart:
            length > 0 ? (length - half) % length : 0,
        highlightPosition: half,
    }));

    const [direction, setDirection] = useState(0);

    const currentIndex =
        length > 0
            ? (dotState.windowStart + dotState.highlightPosition) % length
            : 0;

    const goNext = useCallback(() => {
        if (length === 0) return;
        setDirection(1);

        setDotState((prev) => {
            if (prev.highlightPosition < windowSize - 1) {
                return {
                    ...prev,
                    highlightPosition:
                        prev.highlightPosition + 1,
                };
            }

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
            if (prev.highlightPosition > 0) {
                return {
                    ...prev,
                    highlightPosition:
                        prev.highlightPosition - 1,
                };
            }

            return {
                windowStart:
                    (prev.windowStart - 1 + length) % length,
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

    if (length === 0) return null;

    const prevIndex =
        (currentIndex - 1 + length) % length;

    const nextIndex =
        (currentIndex + 1) % length;

    const hasMultiple = length > 1;

    // רשימת ה"סלוטים" הנוכחיים - נחוץ ל-FlipRow.
    // onImageClick מקבל עכשיו את המיקום האמיתי במערך (currentIndex),
    // לא את image.id - כי הלייטבוק צריך אינדקס אמיתי, לא מספר תצוגה.
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

// FlipRow - עכשיו ממופה לפי uid (קבוע) ולא id (שמשתנה עם מיון),
// כדי שאנימציית ה-FLIP לא "תישבר" גם ברגע שהמשתמש בוחר מיון חדש.

function FlipRow({ slots, onImageFail, direction }) {
    const nodeRefs = useRef(new Map());   // image.uid -> אלמנט DOM
    const prevRects = useRef(new Map());  // image.uid -> מיקום מהרנדר הקודם

    useLayoutEffect(() => {
        const newRects = new Map();

        nodeRefs.current.forEach((node, uid) => {
            if (node) newRects.set(uid, node.getBoundingClientRect());
        });

        let referenceDelta = 0;

        nodeRefs.current.forEach((node, uid) => {
            if (!node) return;
            const oldRect = prevRects.current.get(uid);
            const newRect = newRects.get(uid);

            if (oldRect && newRect) {
                const deltaX = oldRect.left - newRect.left;

                if (deltaX !== 0) {
                    if (referenceDelta === 0) {
                        referenceDelta = deltaX;
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

        nodeRefs.current.forEach((node, uid) => {
            if (!node) return;
            const oldRect = prevRects.current.get(uid);
            const newRect = newRects.get(uid);

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
                    key={image.uid}
                    ref={(node) => {
                        if (node) nodeRefs.current.set(image.uid, node);
                        else nodeRefs.current.delete(image.uid);
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