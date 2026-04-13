/* ─────────────────────────────────────────
   SearchOverlay — buscador de productos
───────────────────────────────────────── */

import { useState, useEffect, useRef, useCallback } from 'react';
import { productsService } from '../../services';
import styles from './SearchOverlay.module.css';

export function SearchOverlay({ onClose }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  /* Focus al abrir */
  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  /* Escape cierra */
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  /* Búsqueda con debounce */
  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await productsService.getAll({ q, limit: 8 });
      setResults(res.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    if (!val.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(() => search(val), 350);
  }

  const fmt = n => `₡${Number(n).toLocaleString('es-CR')}`;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>

        {/* Input */}
        <div className={styles.inputRow}>
          <IconSearch />
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={handleChange}
            placeholder="Buscar productos..."
            aria-label="Buscar"
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}>
              <IconClose />
            </button>
          )}
          <button className={styles.closeBtn} onClick={onClose}>ESC</button>
        </div>

        {/* Results */}
        <div className={styles.results}>
          {loading && (
            <div className={styles.loadingRow}>
              <span className={styles.spinner} />
              <span className={styles.loadingText}>Buscando...</span>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <p className={styles.empty}>No encontramos resultados para <em>"{query}"</em></p>
          )}

          {!loading && results.length > 0 && (
            <>
              <p className={styles.resultsLabel}>{results.length} resultado{results.length !== 1 ? 's' : ''}</p>
              <ul className={styles.list}>
                {results.map(p => {
                  const img = p.images?.find(i => i.is_primary) ?? p.images?.[0];
                  return (
                    <li key={p.id}>
                      <a href={`/productos/${p.slug}`} className={styles.item} onClick={onClose}>
                        <div className={styles.thumb}>
                          {img
                            ? <img src={img.url} alt={img.alt_text ?? p.name} />
                            : <div className={styles.thumbFallback} />
                          }
                        </div>
                        <div className={styles.itemInfo}>
                          {p.collection && <span className={styles.collection}>{p.collection.name}</span>}
                          <p className={styles.itemName}>{p.name}</p>
                          <p className={styles.itemPrice}>{fmt(p.price)}</p>
                        </div>
                        <IconArrow />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {!query && (
            <p className={styles.hint}>Escribí el nombre de una prenda, colección o talla</p>
          )}
        </div>
      </div>
    </div>
  );
}

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
