/* ─────────────────────────────────────────
   IconButton — UI atom
   Circular button for icon-only actions.

   Props:
     label    — aria-label (required for a11y)
     dark     — for use on dark backgrounds
     bordered — adds visible border ring
───────────────────────────────────────── */

import styles from './IconButton.module.css';

export function IconButton({
  children,
  label,
  dark     = false,
  bordered = false,
  className = '',
  ...props
}) {
  const classes = [
    styles.btn,
    dark     ? styles.dark     : '',
    bordered ? styles.bordered : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} aria-label={label} {...props}>
      {children}
    </button>
  );
}
