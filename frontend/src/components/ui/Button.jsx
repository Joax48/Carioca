/* ─────────────────────────────────────────
   Button — UI atom
   Variants: primary | outline | ghost | link
   Sizes:    sm | md (default) | lg
───────────────────────────────────────── */

import styles from './Button.module.css';

/**
 * @param {'primary'|'outline'|'ghost'|'link'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {string} [href] - renders an <a> if provided
 * @param {boolean} [dark] - for use on dark backgrounds
 */
export function Button({
  children,
  variant = 'primary',
  size    = 'md',
  href,
  dark    = false,
  className = '',
  ...props
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    dark ? styles.dark : '',
    className,
  ].filter(Boolean).join(' ');

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
