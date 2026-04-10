// Versión con datos reales — reemplaza la versión con datos estáticos.

import { useRef, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCart }     from '../../stores/useCart';
import { SectionLabel, Button, PlaceholderImage, Tag } from '../ui';
import styles from './ProductsSection.module.css';

// ── Skeleton para estado de carga ────────────────────────
function ProductSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonName} />
      <div className={styles.skeletonPrice} />
    </div>
  );
}

function useStaggeredReveal(refs) {
  useEffect(() => {
    const observers = refs.map((ref, i) => {
      const el = ref.current;
      if (!el) return null;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.style.transitionDelay = `${i * 0.1}s`;
            el.classList.add('visible');
            io.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      io.observe(el);
      return io;
    });
    return () => observers.forEach(io => io?.disconnect());
  }); // sin [] — corre después de cada render para observar refs cuando carguen los datos
}

export function ProductsSection() {
  const { data: products, loading, error } = useProducts({ limit: 4 });
  const addItem    = useCart(s => s.addItem);
  const headerRef  = useRef(null);
  const cardRefs   = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useStaggeredReveal([headerRef, ...cardRefs]);

  return (
    <section id="catalogo" className={styles.section} aria-label="Productos destacados">

      <div ref={headerRef} className={`reveal ${styles.header}`}>
        <SectionLabel>Lo más nuevo</SectionLabel>
      </div>

      {/* ── Error ── */}
      {error && (
        <p className={styles.errorMsg}>No se pudieron cargar los productos. Intenta de nuevo.</p>
      )}

      {/* ── Grid: skeletons mientras carga, cards cuando hay datos ── */}
      <ul className={styles.grid} role="list">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i}><ProductSkeleton /></li>
            ))
          : products.map((product, i) => (
              <li key={product.id} ref={cardRefs[i]} className="reveal">
                <ProductCard
                  product={product}
                  onAddToCart={() => addItem(product)}
                />
              </li>
            ))
        }
      </ul>

      <div className={styles.cta}>
        <Button href="/catalogo" variant="outline">
          Ver todos los productos
        </Button>
      </div>
    </section>
  );
}

// ── ProductCard inline (usa datos reales) ────────────────
function ProductCard({ product, onAddToCart }) {
  // La primera imagen o placeholder si no hay ninguna
  const imageUrl = product.images?.[0]?.url;
  const altText  = product.images?.[0]?.alt_text ?? product.name;

  return (
    <article className={styles.card}>
      <a href={`/productos/${product.slug}`} className={styles.imageWrap}>
        {imageUrl
          ? <img src={imageUrl} alt={altText} className={styles.image} loading="lazy" />
          : <PlaceholderImage aspect="tall" />
        }
        {product.tag && (
          <div className={styles.tag}><Tag variant="gold">{product.tag}</Tag></div>
        )}
        <div className={styles.overlay} aria-hidden="true">
          <button
            className={styles.addBtn}
            onClick={e => { e.preventDefault(); onAddToCart(); }}
          >
            Agregar al carrito
          </button>
        </div>
      </a>

      <div className={styles.info}>
        <a href={`/productos/${product.slug}`} className={styles.name}>{product.name}</a>
        <div className={styles.priceRow}>
          <p className={styles.price}>
            ₡{Number(product.price).toLocaleString('es-CR')}
          </p>
          {product.compare_price && (
            <p className={styles.comparePrice}>
              ₡{Number(product.compare_price).toLocaleString('es-CR')}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
