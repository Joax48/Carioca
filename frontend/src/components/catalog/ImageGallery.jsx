/* ─────────────────────────────────────────
   ImageGallery — product page component
   Galería principal con miniaturas laterales.

   Props:
     images — [{ url, alt_text }]
     name   — nombre del producto (alt fallback)
───────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { PlaceholderImage } from '../ui';
import styles from './ImageGallery.module.css';

export function ImageGallery({ images = [], name = '', activeIndex }) {
  const [active, setActive] = useState(0);

  // Cuando activeIndex cambia desde afuera (ej: selector de color), saltar a esa imagen
  useEffect(() => {
    if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < images.length) {
      setActive(activeIndex);
    }
  }, [activeIndex]);

  /* Si no hay imágenes mostramos placeholder */
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
          key={active}                      /* key fuerza re-render para animación */
          src={images[active].url}
          alt={images[active].alt_text ?? name}
          className={styles.mainImg}
        />
      </div>
    </div>
  );
}
