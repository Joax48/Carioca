/* ─────────────────────────────────────────
   CatalogPage — página de catálogo completo
   Filtros por colección, ordenamiento y
   carga progresiva (load more).
───────────────────────────────────────── */

import { useState, useMemo } from 'react';
import { Navbar, Footer }   from '../components/layout';
import { Breadcrumb }       from '../components/catalog/Breadcrumb';
import { FilterBar }        from '../components/catalog/FilterBar';
import { CatalogGrid }      from '../components/catalog/CatalogGrid';
import { Button }           from '../components/ui';
import { useProducts }      from '../hooks/useProducts';
import { useCollections }   from '../hooks/useCollections';
import { useCart }          from '../stores/useCart';
import styles from './CatalogPage.module.css';

const PAGE_SIZE = 12;

export function CatalogPage() {
  const [activeFilter, setActiveFilter] = useState('');
  const [sortBy,       setSortBy]       = useState('newest');
  const [page,         setPage]         = useState(1);

  const { data: collections } = useCollections();

  /* Construir filtros para el hook */
  const filters = useMemo(() => {
    const active = collections.find(c => c.slug === activeFilter);
    return {
      ...(active ? { collection: active.id } : {}),
      limit: PAGE_SIZE * page,
      offset: 0,
    };
  }, [activeFilter, page, collections]);

  const { data: products, loading } = useProducts(filters);

  /* Ordenamiento client-side (el backend puede hacerlo también) */
  const sorted = useMemo(() => {
    const arr = [...products];
    if (sortBy === 'price-asc')  return arr.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return arr.sort((a, b) => b.price - a.price);
    return arr; // newest: viene ordenado del backend
  }, [products, sortBy]);

  const handleFilter = (slug) => {
    setActiveFilter(slug);
    setPage(1);       // resetear paginación al cambiar filtro
  };

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        {/* ── Hero del catálogo ── */}
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.heroLabel}>Carioca · 2026</p>
            <h1 className={styles.heroTitle}>Catálogo</h1>
            <p className={styles.heroSub}>
              Prendas diseñadas para mover tu mundo
            </p>
          </div>
        </header>

        <div className={styles.content}>
          <Breadcrumb
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Catálogo' },
            ]}
          />

          <FilterBar
            collections={collections}
            activeFilter={activeFilter}
            sortBy={sortBy}
            onFilter={handleFilter}
            onSort={setSortBy}
            total={sorted.length}
          />

          <CatalogGrid
            products={sorted}
            loading={loading}
            columns={3}
          />

          {/* Load more */}
          {!loading && products.length >= PAGE_SIZE * page && (
            <div className={styles.loadMore}>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
              >
                Ver más productos
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
