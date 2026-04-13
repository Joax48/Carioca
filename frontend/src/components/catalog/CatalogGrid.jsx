/* ─────────────────────────────────────────
   CatalogGrid — catalog component
   Grid de productos reutilizable para
   CatalogPage y CollectionPage.

   Props:
     products  — array de productos
     loading   — boolean
     columns   — 3 | 4 (default 3)
───────────────────────────────────────── */

import { useRef, useEffect, useState } from 'react';
import { Tag } from '../ui';
import { QuickAddModal } from './QuickAddModal';
import styles from './CatalogGrid.module.css';

/* Staggered reveal para los items */
function useGridReveal() {
  const itemsRef = useRef([]);
  useEffect(() => {
    const observers = itemsRef.current.map((el, i) => {
      if (!el) return null;
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
      return io;
    });
    return () => observers.forEach(io => io?.disconnect());
  });
  return itemsRef;
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
  const refs = useGridReveal();
  const [quickAddProduct, setQuickAddProduct] = useState(null);

  return (
    <>
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
              <li key={product.id} ref={el => { refs.current[i] = el; }} className="reveal">
                <CatalogCard product={product} onQuickAdd={() => setQuickAddProduct(product)} />
              </li>
            ))
        }
      </ul>

      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
        />
      )}
    </>
  );
}

/* ── CatalogCard ────────────────────────────────────────── */
function CatalogCard({ product, onQuickAdd }) {
  const image = product.images?.[0];

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <a
          href={`/productos/${product.slug}`}
          aria-label={`Ver ${product.name}`}
          className={styles.imageLink}
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
        </a>

        {/* Tag badge */}
        {product.tag && (
          <span className={styles.tagBadge}>
            <Tag variant="gold">{product.tag}</Tag>
          </span>
        )}

        {/* Hover overlay with two actions */}
        <div className={styles.overlay} aria-hidden="true">
          <button
            className={styles.overlayBtn}
            onClick={e => { e.preventDefault(); onQuickAdd(); }}
            tabIndex={-1}
          >
            Agregar al carrito
          </button>
          <a href={`/productos/${product.slug}`} className={styles.overlayLink} tabIndex={-1}>
            Ver producto
          </a>
        </div>
      </div>

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
