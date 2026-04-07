/* ─────────────────────────────────────────
   CatalogGrid — catalog component
   Grid de productos reutilizable para
   CatalogPage y CollectionPage.

   Props:
     products  — array de productos
     loading   — boolean
     columns   — 3 | 4 (default 3)
───────────────────────────────────────── */

import { useRef, useEffect } from 'react';
import { Tag } from '../ui';
import styles from './CatalogGrid.module.css';

/* Staggered reveal para los items */
function useGridReveal(count) {
  const refs = Array.from({ length: count }, () => useRef(null));
  useEffect(() => {
    refs.forEach((ref, i) => {
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.style.transitionDelay = `${(i % 4) * 0.08}s`;
            el.classList.add('visible');
            io.disconnect();
          }
        },
        { threshold: 0.08 }
      );
      io.observe(el);
      return () => io.disconnect();
    });
  }, [count]);
  return refs;
}

function ProductSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonName} />
      <div className={styles.skeletonPrice} />
    </div>
  );
}

export function CatalogGrid({ products = [], loading = false, columns = 3 }) {
  const SKELETON_COUNT = columns === 4 ? 8 : 6;
  const refs = useGridReveal(products.length);

  return (
    <ul
      className={`${styles.grid} ${styles[`cols${columns}`]}`}
      role="list"
      aria-label="Productos"
    >
      {loading
        ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <li key={i}><ProductSkeleton /></li>
          ))
        : products.map((product, i) => (
            <li key={product.id} ref={refs[i]} className="reveal">
              <CatalogCard product={product} />
            </li>
          ))
      }
    </ul>
  );
}

/* ── CatalogCard ────────────────────────────────────────── */
function CatalogCard({ product }) {
  const image = product.images?.[0];

  return (
    <article className={styles.card}>
      <a
        href={`/productos/${product.slug}`}
        className={styles.imageWrap}
        aria-label={`Ver ${product.name}`}
      >
        {/* Imagen */}
        <div className={styles.imageContainer}>
          {image
            ? <img
                src={image.url}
                alt={image.alt_text ?? product.name}
                className={styles.image}
                loading="lazy"
              />
            : <div className={styles.imageFallback} aria-hidden="true" />
          }
        </div>

        {/* Tag badge */}
        {product.tag && (
          <span className={styles.tagBadge}>
            <Tag variant="gold">{product.tag}</Tag>
          </span>
        )}

        {/* Hover quick-view overlay */}
        <div className={styles.overlay} aria-hidden="true">
          <span className={styles.overlayText}>Ver producto</span>
        </div>
      </a>

      {/* Info */}
      <div className={styles.info}>
        {product.collection && (
          <p className={styles.collectionName}>{product.collection.name}</p>
        )}
        <a href={`/productos/${product.slug}`} className={styles.name}>
          {product.name}
        </a>
        <div className={styles.priceRow}>
          <span className={styles.price}>
            ₡{Number(product.price).toLocaleString('es-CR')}
          </span>
          {product.compare_price && (
            <span className={styles.comparePrice}>
              ₡{Number(product.compare_price).toLocaleString('es-CR')}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
