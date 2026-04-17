import { useState, useEffect, useCallback } from 'react';
import { PlaceholderImage } from '../ui';
import styles from './ImageGallery.module.css';

export function ImageGallery({ images = [], name = '', activeIndex }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < images.length) {
      setActive(activeIndex);
    }
  }, [activeIndex]);

  const prev = useCallback(() => setActive(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  if (images.length === 0) {
    return (
      <div className={styles.root}>
        <div className={styles.main}>
          <PlaceholderImage aspect="tall" label={name} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* ── Miniaturas (izquierda) ── */}
      {images.length > 1 && (
        <div className={styles.thumbs} role="list">
          {images.map((img, i) => (
            <button
              key={i}
              role="listitem"
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <img
                src={img.url}
                alt={img.alt_text ?? name}
                className={styles.thumbImg}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Imagen principal ── */}
      <div className={styles.main}>
        <img
          key={active}
          src={images[active].url}
          alt={images[active].alt_text ?? name}
          className={styles.mainImg}
        />

        {images.length > 1 && (
          <>
            <button className={`${styles.arrow} ${styles.arrowPrev}`} onClick={prev} aria-label="Imagen anterior">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button className={`${styles.arrow} ${styles.arrowNext}`} onClick={next} aria-label="Siguiente imagen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <div className={styles.dots}>
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`Imagen ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
