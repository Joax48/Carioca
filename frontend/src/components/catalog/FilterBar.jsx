/* ─────────────────────────────────────────
   FilterBar — catalog component
   Barra de filtros y ordenamiento para el catálogo.

   Props:
     collections    — [{ id, name, slug }]
     activeFilter   — slug de la colección activa ('' = todas)
     sortBy         — 'newest' | 'price-asc' | 'price-desc'
     onFilter       — (slug) => void
     onSort         — (value) => void
     total          — número de productos encontrados
───────────────────────────────────────── */

import styles from './FilterBar.module.css';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Más recientes' },
  { value: 'price-asc',  label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
];

export function FilterBar({
  collections   = [],
  activeFilter  = '',
  sortBy        = 'newest',
  onFilter,
  onSort,
  total         = 0,
}) {
  return (
    <div className={styles.bar}>
      {/* ── Filtros por colección ── */}
      <div className={styles.filters} role="list" aria-label="Filtrar por colección">
        <button
          className={`${styles.chip} ${activeFilter === '' ? styles.active : ''}`}
          onClick={() => onFilter?.('')}
          aria-pressed={activeFilter === ''}
        >
          Todas
        </button>

        {collections.map(col => (
          <button
            key={col.id}
            className={`${styles.chip} ${activeFilter === col.slug ? styles.active : ''}`}
            onClick={() => onFilter?.(col.slug)}
            aria-pressed={activeFilter === col.slug}
          >
            {col.name}
          </button>
        ))}
      </div>

      {/* ── Lado derecho: total + ordenamiento ── */}
      <div className={styles.right}>
        <span className={styles.total}>
          {total} {total === 1 ? 'producto' : 'productos'}
        </span>

        <div className={styles.sortWrap}>
          <label htmlFor="sort-select" className={styles.sortLabel}>
            Ordenar
          </label>
          <select
            id="sort-select"
            className={styles.select}
            value={sortBy}
            onChange={e => onSort?.(e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
