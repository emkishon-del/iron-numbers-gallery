import { useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import GalleryImage from './GalleryImage';
import styles from './Gallery.module.css';

/** Duration for one carousel step (ms). Easy to tune. */
const TRANSITION_MS = 450;

/**
 * Relative sizes based on the available track width.
 * Heights use aspect-ratio so the whole carousel scales with its container.
 * maxWidth / maxHeight keep the original "normal" size on very large hosts.
 * No vw / vh.
 */
const SIZE_STYLES = {
    main: {
        width: '60%',
        maxWidth: '600px',
        // 3/2 ≈ original 600×400 proportion
        aspectRatio: '3 / 2',
        height: 'auto',
        maxHeight: '400px',
        opacity: 1,
    },
    side: {
        width: '20%',
        maxWidth: '200px',
        // close to original ~250px height feel
        aspectRatio: '4 / 5',
        height: 'auto',
        maxHeight: '250px',
        opacity: 0.55,
    },
    // Real physical size (not 0) so enter/exit can animate; clipped by overflow:hidden
    far: {
        width: '20%',
        maxWidth: '200px',
        aspectRatio: '4 / 5',
        height: 'auto',
        maxHeight: '250px',
        opacity: 0,
    },
};

export default function CarouselView({
    images = [],
    onImageClick,
    onImageFail,
}) {
    const length = images.length;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const isAnimatingRef = useRef(false);
    const animTimerRef = useRef(null);
    const directionRef = useRef(0);

    const finishAnimation = useCallback(() => {
        isAnimatingRef.current = false;
        setIsAnimating(false);
        animTimerRef.current = null;
    }, []);

    const startAnimationLock = useCallback(() => {
        isAnimatingRef.current = true;
        setIsAnimating(true);
        if (animTimerRef.current) {
            clearTimeout(animTimerRef.current);
        }
        animTimerRef.current = setTimeout(finishAnimation, TRANSITION_MS + 50);
    }, [finishAnimation]);

    useEffect(() => {
        return () => {
            if (animTimerRef.current) clearTimeout(animTimerRef.current);
        };
    }, []);

    const goNext = useCallback(() => {
        if (length === 0 || isAnimatingRef.current) return;
        directionRef.current = 1;
        startAnimationLock();
        setCurrentIndex((prev) => (prev + 1) % length);
    }, [length, startAnimationLock]);

    const goPrev = useCallback(() => {
        if (length === 0 || isAnimatingRef.current) return;
        directionRef.current = -1;
        startAnimationLock();
        setCurrentIndex((prev) => (prev - 1 + length) % length);
    }, [length, startAnimationLock]);

    if (length === 0) return null;

    const prevIndex = (currentIndex - 1 + length) % length;
    const nextIndex = (currentIndex + 1) % length;
    const hasMultiple = length > 1;

    let slots;
    if (length >= 5) {
        const farPrevIndex = (currentIndex - 2 + length) % length;
        const farNextIndex = (currentIndex + 2) % length;
        slots = [
            { image: images[farPrevIndex], size: 'far', onClick: () => {} },
            { image: images[prevIndex], size: 'side', onClick: () => onImageClick?.(prevIndex) },
            {
                image: images[currentIndex],
                size: 'main',
                onClick: () => onImageClick?.(currentIndex),
            },
            { image: images[nextIndex], size: 'side', onClick: () => onImageClick?.(nextIndex) },
            { image: images[farNextIndex], size: 'far', onClick: () => {} },
        ];
    } else if (hasMultiple) {
        slots = [
            { image: images[prevIndex], size: 'side', onClick: () => onImageClick?.(prevIndex) },
            {
                image: images[currentIndex],
                size: 'main',
                onClick: () => onImageClick?.(currentIndex),
            },
            { image: images[nextIndex], size: 'side', onClick: () => onImageClick?.(nextIndex) },
        ];
    } else {
        slots = [
            {
                image: images[currentIndex],
                size: 'main',
                onClick: () => onImageClick?.(currentIndex),
            },
        ];
    }

    return (
        <div className={styles['ing-carousel']} dir="rtl">
            <button
                className={styles['ing-arrow']}
                onClick={goNext}
                aria-label="תמונה הבאה"
                disabled={!hasMultiple || isAnimating}
            >
                ‹
            </button>

            <div className={styles['ing-track']}>
                <FlipRow
                    slots={slots}
                    onImageFail={onImageFail}
                    directionRef={directionRef}
                />
            </div>

            <button
                className={styles['ing-arrow']}
                onClick={goPrev}
                aria-label="תמונה קודמת"
                disabled={!hasMultiple || isAnimating}
            >
                ›
            </button>
        </div>
    );
}

function FlipRow({ slots, onImageFail, directionRef }) {
    const nodeRefs = useRef(new Map());
    const prevRects = useRef(new Map());
    const prevOpacities = useRef(new Map());
    const isFirstLayout = useRef(true);
    const trackRef = useRef(null);

    const layoutKey = slots.map((s) => `${s.image.uid}:${s.size}`).join('|');

    useLayoutEffect(() => {
        const nodes = nodeRefs.current;
        const newRects = new Map();
        const newOpacities = new Map();

        // ניקוי transform ישן לפני מדידה
        nodes.forEach((node) => {
            if (!node) return;
            node.style.transition = 'none';
            node.style.transform = 'none';
        });
        if (trackRef.current) void trackRef.current.offsetWidth;

        const opacityByUid = new Map(
            slots.map((s) => [s.image.uid, SIZE_STYLES[s.size]?.opacity ?? 1]),
        );

        nodes.forEach((node, uid) => {
            if (!node) return;
            newRects.set(uid, node.getBoundingClientRect());
            newOpacities.set(uid, opacityByUid.get(uid) ?? 1);
        });

        if (isFirstLayout.current) {
            isFirstLayout.current = false;
            prevRects.current = newRects;
            prevOpacities.current = newOpacities;
            return;
        }

        let referenceDelta = 0;
        const plays = [];

        nodes.forEach((node, uid) => {
            if (!node) return;

            const oldRect = prevRects.current.get(uid);
            const newRect = newRects.get(uid);
            if (!oldRect || !newRect) return;

            const deltaX = oldRect.left - newRect.left;
            const deltaY = oldRect.top - newRect.top;
            const scaleX = oldRect.width / (newRect.width || 1);
            const scaleY = oldRect.height / (newRect.height || 1);
            const oldOpacity = prevOpacities.current.has(uid)
                ? prevOpacities.current.get(uid)
                : 1;
            const targetOpacity = newOpacities.get(uid) ?? 1;

            const moved =
                Math.abs(deltaX) > 0.5 ||
                Math.abs(deltaY) > 0.5 ||
                Math.abs(scaleX - 1) > 0.001 ||
                Math.abs(scaleY - 1) > 0.001 ||
                Math.abs(oldOpacity - targetOpacity) > 0.01;

            if (!moved) return;

            if (referenceDelta === 0 && Math.abs(deltaX) > 0.5) {
                referenceDelta = deltaX;
            }

            // חשוב: top left — לא center
            node.style.transformOrigin = 'top left';
            node.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
            node.style.opacity = String(oldOpacity);

            plays.push(() => {
                node.style.transition = [
                    `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                    `opacity ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                ].join(', ');
                node.style.transform = 'translate(0px, 0px) scale(1, 1)';
                node.style.opacity = String(targetOpacity);
            });
        });

        nodes.forEach((node, uid) => {
            if (!node) return;
            const oldRect = prevRects.current.get(uid);
            const newRect = newRects.get(uid);
            if (oldRect || !newRect) return;

            const dir = directionRef.current;
            const enterOffset =
                referenceDelta !== 0
                    ? referenceDelta
                    : dir === 1
                      ? newRect.width || 80
                      : -(newRect.width || 80);

            const targetOpacity = newOpacities.get(uid) ?? 0;

            node.style.transformOrigin = 'top left';
            node.style.transform = `translate(${enterOffset}px, 0px) scale(1, 1)`;
            node.style.opacity = '0';

            plays.push(() => {
                node.style.transition = [
                    `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                    `opacity ${TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                ].join(', ');
                node.style.transform = 'translate(0px, 0px) scale(1, 1)';
                node.style.opacity = String(targetOpacity);
            });
        });

        if (trackRef.current) void trackRef.current.offsetWidth;

        requestAnimationFrame(() => {
            plays.forEach((play) => play());
        });

        prevRects.current = newRects;
        prevOpacities.current = newOpacities;

        const clearTimer = setTimeout(() => {
            nodes.forEach((node) => {
                if (!node) return;
                node.style.transition = '';
                node.style.transform = 'none';
            });
        }, TRANSITION_MS + 40);

        return () => clearTimeout(clearTimer);
    }, [layoutKey, directionRef, slots]);

    return (
        <div className={styles['ing-track-inner']} ref={trackRef}>
            {slots.map(({ image, size, onClick }) => {
                const box = SIZE_STYLES[size] || SIZE_STYLES.side;
                return (
                    <div
                        key={image.uid}
                        className={styles['ing-carousel-slot']}
                        ref={(node) => {
                            if (node) {
                                nodeRefs.current.set(image.uid, node);
                            } else {
                                nodeRefs.current.delete(image.uid);
                            }
                        }}
                        style={{
                            width: box.width,
                            maxWidth: box.maxWidth,
                            aspectRatio: box.aspectRatio,
                            height: box.height,
                            maxHeight: box.maxHeight,
                            opacity: box.opacity,
                            flexShrink: 0,
                            overflow: 'hidden',
                            transformOrigin: 'top left',
                            pointerEvents: size === 'far' ? 'none' : undefined,
                        }}
                    >
                        <GalleryImage
                            image={image}
                            size={size === 'far' ? 'side' : size}
                            onClick={size === 'far' ? undefined : onClick}
                            onFail={onImageFail}
                        />
                    </div>
                );
            })}
        </div>
    );
}