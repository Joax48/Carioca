/* ─────────────────────────────────────────
   StarRating — UI atom
   Renders N filled stars (accessible).

   Props:
     count  — number of stars (1-5)
     size   — 'sm' | 'md'
───────────────────────────────────────── */

import styles from './StarRating.module.css';

export function StarRating({ count = 5, size = 'md' }) {
  return (
    <div
      className={`${styles.wrapper} ${styles[size]}`}
      role="img"
      aria-label={`${count} de 5 estrellas`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${styles.star} ${i < count ? styles.filled : styles.empty}`}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.5l-3.7 1.8.7-4.1L2 5.3l4.2-.7L8 1z" />
        </svg>
      ))}
    </div>
  );
}
