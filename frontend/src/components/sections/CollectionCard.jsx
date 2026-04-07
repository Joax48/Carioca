/* ─────────────────────────────────────────
   CollectionCard — reusable component
   Image card with gradient overlay and label.

   Props:
     collection — { id, name, sub, slug }
───────────────────────────────────────── */

import { PlaceholderImage } from '../ui';
import styles from './CollectionCard.module.css';

export function CollectionCard({ collection }) {
  const { name, sub, slug } = collection;

  return (
    <a
      href={`/colecciones/${slug}`}
      className={styles.card}
      aria-label={name}
    >
      {/* ── Background image ── */}
      <div className={styles.image}>
        <PlaceholderImage aspect="wide" />
      </div>

      {/* ── Gradient overlay + text ── */}
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.sub}>{sub}</p>
      </div>
    </a>
  );
}
