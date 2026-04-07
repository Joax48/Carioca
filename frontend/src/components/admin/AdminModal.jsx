// Modal lateral (drawer) para formularios de creación/edición.
//
// Props:
//   open     — boolean
//   onClose  — () => void
//   title    — string
//   children — contenido del formulario

import { useEffect } from 'react';
import styles from './AdminModal.module.css';

export function AdminModal({ open, onClose, title, children }) {
  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.drawer}
        onClick={e => e.stopPropagation()}
        aria-label={title}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <IconClose />
          </button>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
