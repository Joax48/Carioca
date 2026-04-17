/* ─────────────────────────────────────────
   Footer — layout component
───────────────────────────────────────── */

import { SOCIAL_LINKS, FOOTER_NAV, CONTACT_INFO } from '../../data/homeData';
import { IconWhatsApp, IconInstagram, IconLinktree } from '../ui';
import styles from './Footer.module.css';

const SOCIAL_ICONS = {
  whatsapp:  IconWhatsApp,
  instagram: IconInstagram,
  linktree:  IconLinktree,
};

const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.65A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>

        {/* ── Brand column ── */}
        <div className={styles.brand}>
          <p className={styles.wordmark}>CARIOCA</p>
          <p className={styles.tagline}>Athletic Wear</p>
          <div className={styles.social}>
            {SOCIAL_LINKS.map(({ label, href, type }) => {
              const Icon = SOCIAL_ICONS[type];
              return (
                <a
                  key={type}
                  href={href}
                  className={styles.socialLink}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>

        {/* ── Nav column ── */}
        <div>
          <p className={styles.colTitle}>Enlaces</p>
          <ul className={styles.colLinks}>
            {FOOTER_NAV.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className={styles.colLink}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contact column ── */}
        <div>
          <p className={styles.colTitle}>Contacto</p>
          <ul className={styles.contactList}>
            <li>
              <span className={styles.contactIcon} aria-hidden="true"><IconPhone /></span>
              <span>{CONTACT_INFO.phone}</span>
            </li>
            <li>
              <span className={styles.contactIcon} aria-hidden="true"><IconMail /></span>
              <a href={`mailto:${CONTACT_INFO.email}`} className={styles.contactEmail}>
                {CONTACT_INFO.email}
              </a>
            </li>
            <li>
              <span className={styles.contactIcon} aria-hidden="true"><IconPin /></span>
              <span>{CONTACT_INFO.location}</span>
            </li>
          </ul>
        </div>

        {/* ── CTA column ── */}
        <div className={styles.ctaCol}>
          <a href="/nosotros" className={styles.cta}>
            Conócenos →
          </a>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.bottom}>
        <p className={styles.copy}>
          © {new Date().getFullYear()} Carioca&nbsp;&nbsp;|&nbsp;&nbsp;Created by Kiso Tech
        </p>
      </div>
    </footer>
  );
}
