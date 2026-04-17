// Versión con datos reales desde la API.

import { useRef, useEffect } from 'react';
import { useCollections } from '../../hooks/useCollections';
import { SectionLabel }   from '../ui';
import styles from './CollectionsSection.module.css';

function useStaggeredReveal(refs) {
  useEffect(() => {
    const observers = refs.map((ref, i) => {
      const el = ref.current;
      if (!el) return null;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.style.transitionDelay = `${i * 0.12}s`;
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

// ── Skeleton ─────────────────────────────────────────────
function CollectionSkeleton() {
  return (
    <div className={styles.skeleton} />
  );
}

export function CollectionsSection() {
  const { data: collections, loading } = useCollections();
  const headerRef = useRef(null);
  const cardRefs  = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useStaggeredReveal([headerRef, ...cardRefs]);

  const items = loading
    ? Array.from({ length: 4 })   // 4 skeletons mientras carga
    : collections;

  return (
    <section id="colecciones" className={styles.section} aria-label="Comprar por colección">
      <div ref={headerRef} className={`reveal ${styles.header}`}>
        <h2 className={styles.heading}>COLECCIÓN</h2>
      </div>

      <ul className={styles.grid} role="list">
        {items.map((collection, i) => (
          <li key={collection?.id ?? i} ref={cardRefs[i]} className="reveal">
            {loading
              ? <CollectionSkeleton />
              : <CollectionCard collection={collection} />
            }
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── CollectionCard con imagen real ───────────────────────
function CollectionCard({ collection }) {
  return (
    <a
      href={`/colecciones/${collection.slug}`}
      className={styles.card}
      aria-label={collection.name}
    >
      {collection.image_url
        ? <img
            src={collection.image_url}
            alt={collection.name}
            className={styles.cardImage}
            loading="lazy"
          />
        : <div className={styles.cardImageFallback} aria-hidden="true" />
      }

      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <h3 className={styles.name}>{collection.name}</h3>
        {collection.description && (
          <p className={styles.sub}>{collection.description}</p>
        )}
      </div>
    </a>
  );
}
