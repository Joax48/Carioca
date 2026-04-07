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
            {FOOTER_NAV.map(label => (
              <li key={label}>
                <a href="#" className={styles.colLink}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contact column ── */}
        <div>
          <p className={styles.colTitle}>Contacto</p>
          <ul className={styles.contactList}>
            <li>
              <span className={styles.contactIcon} aria-hidden="true">📞</span>
              <span>{CONTACT_INFO.phone}</span>
            </li>
            <li>
              <span className={styles.contactIcon} aria-hidden="true">✉</span>
              <a href={`mailto:${CONTACT_INFO.email}`} className={styles.contactEmail}>
                {CONTACT_INFO.email}
              </a>
            </li>
            <li>
              <span className={styles.contactIcon} aria-hidden="true">📍</span>
              <span>{CONTACT_INFO.location}</span>
            </li>
          </ul>
        </div>

        {/* ── CTA column ── */}
        <div className={styles.ctaCol}>
          <a href="#nosotros" className={styles.cta}>
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
