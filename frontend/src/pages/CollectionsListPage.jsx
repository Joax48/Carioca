// pages/CollectionsListPage.jsx
// Página pública /colecciones — muestra todas las colecciones activas
// en un grid editorial. Accesible desde el nav y el footer.

import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCollections }  from '../hooks/useCollections';
import { Navbar, Footer }  from '../components/layout';
import { SectionLabel }    from '../components/ui';
import styles from './CollectionsListPage.module.css';

function CollectionHeroCard({ collection, delay = 0 }) {
  const ref = useScrollReveal();
  return (
    <a
      ref={ref}
      href={`/colecciones/${collection.slug}`}
      className={`reveal ${styles.card}`}
      style={{ transitionDelay: `${delay}s` }}
      aria-label={collection.name}
    >
      {/* Imagen de fondo */}
      <div className={styles.cardBg}>
        {collection.image_url
          ? <img src={collection.image_url} alt={collection.name} className={styles.cardImg} loading="lazy" />
          : <div className={styles.cardFallback} aria-hidden="true" />
        }
      </div>

      {/* Overlay */}
      <div className={styles.cardOverlay} aria-hidden="true" />

      {/* Contenido */}
      <div className={styles.cardContent}>
        <p className={styles.cardLabel}>Colección</p>
        <h2 className={styles.cardName}>{collection.name}</h2>
        {collection.description && (
          <p className={styles.cardDesc}>{collection.description}</p>
        )}
        <span className={styles.cardCta}>
          Ver colección →
        </span>
      </div>
    </a>
  );
}

function SkeletonCard() {
  return <div className={styles.skeleton} aria-hidden="true" />;
}

export function CollectionsListPage() {
  const { data: collections, loading } = useCollections();
  const heroRef = useScrollReveal();

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        {/* ── Hero header ── */}
        <header className={styles.hero}>
          <div ref={heroRef} className={`reveal ${styles.heroInner}`}>
            <SectionLabel>Carioca · 2026</SectionLabel>
            <h1 className={styles.heroTitle}>
              Nuestras<br /><em>colecciones</em>
            </h1>
            <p className={styles.heroSub}>
              Cada colección cuenta una historia. Encontrá la que habla de vos.
            </p>
          </div>
        </header>

        {/* ── Grid de colecciones ── */}
        <section className={styles.grid} aria-label="Todas las colecciones">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : collections.map((col, i) => (
                <CollectionHeroCard
                  key={col.id}
                  collection={col}
                  delay={i * 0.1}
                />
              ))
          }

          {!loading && collections.length === 0 && (
            <div className={styles.empty}>
              <p>Próximamente nuevas colecciones.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
