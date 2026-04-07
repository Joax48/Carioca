/* ─────────────────────────────────────────
   CollectionPage — página de una colección
   Muestra el hero de la colección y su grid
   de productos.

   Recibe :slug desde React Router:
     <Route path="/colecciones/:slug" element={<CollectionPage />} />
───────────────────────────────────────── */

import { useState, useMemo }    from 'react';
import { useParams }            from 'react-router-dom';
import { Navbar, Footer }       from '../components/layout';
import { Breadcrumb }           from '../components/catalog/Breadcrumb';
import { FilterBar }            from '../components/catalog/FilterBar';
import { CatalogGrid }          from '../components/catalog/CatalogGrid';
import { PlaceholderImage }     from '../components/ui';
import { useCollection }        from '../hooks/useCollections';
import styles from './CollectionPage.module.css';

const SORT_OPTIONS_CLIENT = {
  'newest':     () => 0,
  'price-asc':  (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
};

export function CollectionPage() {
  const { slug }   = useParams();
  const [sortBy, setSortBy] = useState('newest');

  const { data: collection, loading } = useCollection(slug);

  const products = collection?.products ?? [];

  const sorted = useMemo(() => {
    const arr = [...products];
    const fn  = SORT_OPTIONS_CLIENT[sortBy];
    return fn ? arr.sort(fn) : arr;
  }, [products, sortBy]);

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        {/* ── Hero de la colección ── */}
        <header className={styles.hero}>
          {/* Imagen de fondo de la colección */}
          <div className={styles.heroBg} aria-hidden="true">
            {collection?.image_url
              ? <img
                  src={collection.image_url}
                  alt=""
                  className={styles.heroBgImg}
                />
              : <PlaceholderImage aspect="wide" />
            }
          </div>
          <div className={styles.heroOverlay} aria-hidden="true" />

          <div className={styles.heroInner}>
            <p className={styles.heroLabel}>Colección</p>
            <h1 className={styles.heroTitle}>
              {loading ? '·' : collection?.name ?? slug}
            </h1>
            {collection?.description && (
              <p className={styles.heroDesc}>{collection.description}</p>
            )}
          </div>
        </header>

        {/* ── Content ── */}
        <div className={styles.content}>
          <Breadcrumb
            items={[
              { label: 'Inicio',     href: '/'            },
              { label: 'Colecciones', href: '/colecciones' },
              { label: collection?.name ?? slug },
            ]}
          />

          <FilterBar
            collections={[]}          /* sin filtro de colección dentro de una colección */
            activeFilter=""
            sortBy={sortBy}
            onSort={setSortBy}
            total={sorted.length}
          />

          <CatalogGrid
            products={sorted}
            loading={loading}
            columns={3}
          />
        </div>
      </main>

      <Footer />
    </>
  );
}
