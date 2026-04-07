/* ─────────────────────────────────────────
   Tag — UI atom
   Small pill label (e.g. "Nuevo", "Top").

   Props:
     variant — 'gold' | 'dark' | 'light'
───────────────────────────────────────── */

import styles from './Tag.module.css';

export function Tag({ children, variant = 'gold' }) {
  return (
    <span className={`${styles.tag} ${styles[variant]}`}>
      {children}
    </span>
  );
}
