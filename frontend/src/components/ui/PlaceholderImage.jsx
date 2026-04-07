/* ─────────────────────────────────────────
   PlaceholderImage — UI atom
   Mimics real images during development.
   Replace <PlaceholderImage> with <img> once
   Supabase Storage URLs are available.

   Props:
     aspect   — 'square' | 'wide' | 'tall' | 'portrait'
     label    — optional overlay text
     className — extra classes on wrapper
───────────────────────────────────────── */

import styles from './PlaceholderImage.module.css';

const ASPECT_MAP = {
  square:   '1 / 1',
  wide:     '16 / 9',
  tall:     '3 / 4',
  portrait: '2 / 3',
};

export function PlaceholderImage({ aspect = 'square', label = '', className = '' }) {
  return (
    <div
      className={`${styles.wrapper} ${className}`}
      style={{ aspectRatio: ASPECT_MAP[aspect] ?? ASPECT_MAP.square }}
      aria-hidden="true"
      role="img"
    >
      <svg
        className={styles.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="10" fill="rgba(255,255,255,0.25)" />
        <path
          d="M8 36l11-14 8 9 5-6 8 11H8z"
          fill="rgba(255,255,255,0.7)"
        />
        <circle cx="33" cy="16" r="4" fill="rgba(255,255,255,0.7)" />
      </svg>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
