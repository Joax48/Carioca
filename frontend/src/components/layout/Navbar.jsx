/* ─────────────────────────────────────────
   Navbar — layout component
   Fixed top navigation with transparent→solid
   scroll transition.
───────────────────────────────────────── */

import { useState } from 'react';
import { useNavScroll } from '../../hooks/useNavScroll';
import { UserMenu }    from './UserMenu';
import { useCart }     from '../../stores/useCart';
import { NAV_LINKS, SOCIAL_LINKS } from '../../data/homeData';
import {
  IconButton,
  IconSearch,
  IconUser,
  IconBag,
  IconWhatsApp,
  IconInstagram,
  IconLinktree,
  IconMenu,
  IconClose,
} from '../ui';
import styles from './Navbar.module.css';

const SOCIAL_ICONS = {
  whatsapp:  IconWhatsApp,
  instagram: IconInstagram,
  linktree:  IconLinktree,
};

export function Navbar() {
  const scrolled  = useNavScroll(40);
  const [open, setOpen] = useState(false);
  const { items, open: openCart } = useCart();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        {/* ── Left: nav links ── */}
        <ul className={styles.links}>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href} className={styles.link}>{label}</a>
            </li>
          ))}
        </ul>

        {/* ── Center: wordmark ── */}
        <a href="/" className={styles.wordmark} aria-label="Carioca — inicio">
          CARIOCA
        </a>

        {/* ── Right: actions ── */}
        <div className={styles.actions}>
          {/* Social icons */}
          {SOCIAL_LINKS.map(({ label, href, type }) => {
            const Icon = SOCIAL_ICONS[type];
            return (
              <IconButton key={type} label={label} as="a" href={href}
                target="_blank" rel="noopener noreferrer">
                <Icon size={17} />
              </IconButton>
            );
          })}

          <div className={styles.divider} />

          {/* Utility icons */}
          <IconButton label="Buscar" className={styles.searchBtn}>
            <IconSearch size={17} />
          </IconButton>
          <div className={styles.userMenuWrap}>
            <UserMenu />
          </div>

          {/* Cart with badge */}
          <div className={styles.cartWrap}>
            <IconButton label={`Carrito — ${cartCount} artículos`} onClick={openCart}>
              <IconBag size={17} />
            </IconButton>
            {cartCount > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {cartCount}
              </span>
            )}
          </div>

          {/* Mobile hamburger */}
          <IconButton
            label={open ? 'Cerrar menú' : 'Abrir menú'}
            className={styles.hamburger}
            onClick={() => setOpen(v => !v)}
          >
            {open ? <IconClose size={20} /> : <IconMenu size={20} />}
          </IconButton>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <ul className={styles.drawerLinks}>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className={styles.drawerLink}
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
