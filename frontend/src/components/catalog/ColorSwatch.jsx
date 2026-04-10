/* ─────────────────────────────────────────
   ColorSwatch — product page component
   Swatches de color que al tocarse filtran
   la galería a las imágenes de ese color.

   Props:
     variants       — [{ id, color_name, color_hex, in_stock }]
     selectedColor  — color_name activo (null = todas)
     onSelect       — (color_name | null) => void
───────────────────────────────────────── */

import styles from './ColorSwatch.module.css';

export function ColorSwatch({ variants = [], selectedColor, onSelect }) {
  if (!variants.length) return null;

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.label}>Color</span>
        {selectedColor && (
          <span className={styles.selected}>
            — {variants.find(v => v.color_name === selectedColor)?.color_name}
          </span>
        )}
      </div>

      {/* Swatches */}
      <div className={styles.swatches} role="radiogroup" aria-label="Seleccionar color">
        {variants.map(variant => {
          const isActive = selectedColor === variant.color_name;
          return (
            <button
              key={variant.id}
              role="radio"
              aria-checked={isActive}
              aria-label={`${variant.color_name}${!variant.in_stock ? ' — agotado' : ''}`}
              className={`${styles.swatch} ${isActive ? styles.swatchActive : ''} ${!variant.in_stock ? styles.swatchSoldOut : ''}`}
              onClick={() => onSelect?.(isActive ? null : variant.color_name)}
              title={variant.color_name}
              style={{ '--swatch-color': variant.color_hex }}
            >
              {/* Círculo de color */}
              <span
                className={styles.swatchDot}
                style={{ background: variant.color_hex }}
              />
              {/* Línea diagonal si está agotado */}
              {!variant.in_stock && (
                <span className={styles.soldOutSlash} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
