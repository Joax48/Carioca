/* ─────────────────────────────────────────
   SectionLabel — UI atom
   The small uppercase gold overline that appears
   above section headings throughout the site.

   Usage:
     <SectionLabel>Nueva Colección · 2026</SectionLabel>
───────────────────────────────────────── */

import styles from './SectionLabel.module.css';

export function SectionLabel({ children, dark = false }) {
  return (
    <p className={`${styles.label} ${dark ? styles.dark : ''}`}>
      {children}
    </p>
  );
}
