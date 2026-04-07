/* ─────────────────────────────────────────
   SizeSelector — product page component
   Selector de tallas con estado de stock.

   Props:
     sizes        — [{ label, available }]
     selected     — label seleccionado
     onSelect     — (label) => void
───────────────────────────────────────── */

import styles from './SizeSelector.module.css';

/* Tallas estándar de ropa deportiva femenina */
export const DEFAULT_SIZES = [
  { label: 'XS',  available: true  },
  { label: 'S',   available: true  },
  { label: 'M',   available: true  },
  { label: 'L',   available: true  },
  { label: 'XL',  available: true  },
  { label: 'XXL', available: false },
];

export function SizeSelector({ sizes = DEFAULT_SIZES, selected, onSelect }) {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.label}>Talla</span>
        {selected && (
          <span className={styles.selected}>— {selected}</span>
        )}
        <a href="/guia-de-tallas" className={styles.guide}>
          Guía de tallas
        </a>
      </div>

      <div className={styles.grid} role="radiogroup" aria-label="Seleccionar talla">
        {sizes.map(size => (
          <button
            key={size.label}
            role="radio"
            aria-checked={selected === size.label}
            aria-label={`Talla ${size.label}${!size.available ? ' — agotada' : ''}`}
            disabled={!size.available}
            className={[
              styles.sizeBtn,
              selected === size.label ? styles.sizeBtnActive : '',
              !size.available         ? styles.sizeBtnSoldOut : '',
            ].filter(Boolean).join(' ')}
            onClick={() => size.available && onSelect?.(size.label)}
          >
            {size.label}
            {/* Línea diagonal sobre botón agotado */}
            {!size.available && <span className={styles.slash} aria-hidden="true" />}
          </button>
        ))}
      </div>
    </div>
  );
}
