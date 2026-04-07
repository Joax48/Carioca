/* ─────────────────────────────────────────
   QuantitySelector — product page component

   Props:
     value    — número actual
     min      — mínimo (default 1)
     max      — máximo (default 99)
     onChange — (value) => void
───────────────────────────────────────── */

import styles from './QuantitySelector.module.css';

export function QuantitySelector({ value = 1, min = 1, max = 99, onChange }) {
  const dec = () => onChange?.(Math.max(min, value - 1));
  const inc = () => onChange?.(Math.min(max, value + 1));

  return (
    <div className={styles.root} role="group" aria-label="Cantidad">
      <button
        className={styles.btn}
        onClick={dec}
        disabled={value <= min}
        aria-label="Reducir cantidad"
      >
        −
      </button>

      <span className={styles.value} aria-live="polite" aria-atomic="true">
        {value}
      </span>

      <button
        className={styles.btn}
        onClick={inc}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}
