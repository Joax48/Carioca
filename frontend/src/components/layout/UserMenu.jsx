// components/layout/UserMenu.jsx
// Panel de usuario desde el nav.
// Usa useAuth (store unificado) — detecta si es admin o cliente.

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../stores/useAuth';
import styles from './UserMenu.module.css';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const {
    user, loading, initialized,
    loginWithGoogle, logout,
  } = useAuth();

  const isAdmin    = user?.role === 'admin';
  const discountPct = user?.role === 'client' ? 10 : 0;

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogin = async () => {
    await loginWithGoogle(window.location.href);
    setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  const avatarUrl = user?.avatar ?? null;
  const displayName = user?.name ?? '';

  return (
    <div className={styles.root} ref={ref}>
      {/* ── Trigger ── */}
      <button
        className={`${styles.trigger} ${user ? styles.triggerActive : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={user ? `Cuenta de ${displayName}` : 'Iniciar sesión'}
        aria-expanded={open}
      >
        {avatarUrl
          ? <img src={avatarUrl} alt={displayName} className={styles.avatar} />
          : <IconUser size={17} />
        }
        {user && <span className={styles.onlineDot} aria-hidden="true" />}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Menú de usuario">

          {!initialized || loading ? (
            <div className={styles.loading}><span className={styles.spinner} /></div>

          ) : !user ? (
            /* Guest */
            <div className={styles.guestPanel}>
              <p className={styles.guestTitle}>Iniciá sesión</p>
              <p className={styles.guestSub}>
                Obtenés un <strong>5% de descuento</strong> automático en todas tus compras.
              </p>
              <button className={styles.googleBtn} onClick={handleLogin}>
                <IconGoogle />
                Continuar con Google
              </button>
            </div>

          ) : (
            /* Logged in */
            <div className={styles.userPanel}>
              <div className={styles.userHeader}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className={styles.userAvatar} />
                  : <div className={styles.userInitial}>{displayName[0]?.toUpperCase() ?? '?'}</div>
                }
                <div className={styles.userInfo}>
                  <p className={styles.userName}>{displayName}</p>
                  <p className={styles.userEmail}>{user.email}</p>
                </div>
              </div>

              {discountPct > 0 && (
                <div className={styles.discountBadge}>
                  <IconTag />
                  <span>{discountPct}% de descuento aplicado automáticamente</span>
                </div>
              )}

              <div className={styles.divider} />

              <a href="/mi-cuenta" className={styles.menuItem} onClick={() => setOpen(false)}>
                <IconUser size={14} /> Mi cuenta
              </a>

              {/* Solo admins ven este link — sin texto llamativo */}
              {isAdmin && (
                <a href="/admin" className={`${styles.menuItem} ${styles.menuItemAdmin}`}
                  onClick={() => setOpen(false)}>
                  <IconSettings size={14} /> Panel de gestión
                </a>
              )}

              <div className={styles.divider} />

              <button className={styles.logoutBtn} onClick={handleLogout}>
                <IconLogout size={14} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Icons */
const IconUser = ({ size = 18 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconGoogle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const IconTag = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const IconSettings = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const IconLogout = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);
