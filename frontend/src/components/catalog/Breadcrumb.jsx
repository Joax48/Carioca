/* ─────────────────────────────────────────
   Breadcrumb — catalog component
   Muestra la ruta de navegación actual.
   Props: items — [{ label, href? }]
───────────────────────────────────────── */

import styles from './Breadcrumb.module.css';

export function Breadcrumb({ items = [] }) {
  return (
    <nav className={styles.nav} aria-label="Ruta de navegación">
      <ol className={styles.list}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className={styles.item}>
              {isLast ? (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <a href={item.href} className={styles.link}>{item.label}</a>
                  <span className={styles.sep} aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
