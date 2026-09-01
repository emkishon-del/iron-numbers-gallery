import { useState, useCallback } from 'react';
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

    const currentIndex =
        length > 0
            ? (dotState.windowStart + dotState.highlightPosition) % length
            : 0;

    // =========================================================
    // NAVIGATION
    // =========================================================

    const goNext = useCallback(() => {
        if (length === 0) return;

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

    return (
        <div>

            {/* =====================================================
                IMAGES / CAROUSEL
            ====================================================== */}

            <div
                className={styles['ing-carousel']}
                dir="rtl"
            >
                <button
                    className={styles['ing-arrow']}
                    onClick={goPrev}
                    aria-label="תמונה קודמת"
                    disabled={!hasMultiple}
                >
                    ‹
                </button>

                <div className={styles['ing-track']}>

                    {hasMultiple && (
                        <GalleryImage
                            image={images[prevIndex]}
                            size="side"
                            onClick={goPrev}
                            onFail={onImageFail}
                        />
                    )}

                    <GalleryImage
                        image={images[currentIndex]}
                        size="main"
                        onClick={() =>
                            onImageClick(
                                images[currentIndex].id
                            )
                        }
                        onFail={onImageFail}
                    />

                    {hasMultiple && (
                        <GalleryImage
                            image={images[nextIndex]}
                            size="side"
                            onClick={goNext}
                            onFail={onImageFail}
                        />
                    )}
                </div>

                <button
                    className={styles['ing-arrow']}
                    onClick={goNext}
                    aria-label="תמונה הבאה"
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