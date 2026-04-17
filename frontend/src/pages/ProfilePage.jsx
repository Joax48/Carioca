/* ─────────────────────────────────────────
   ProfilePage — Mi cuenta
   Visible para usuarios autenticados con Google
───────────────────────────────────────── */

import { useEffect } from 'react';
import { useAuth }   from '../stores/useAuth';
import { Navbar }    from '../components/layout/Navbar';
import { Footer }    from '../components/layout/Footer';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user, loading, loginWithGoogle, logout } = useAuth();

  /* Redirigir si no hay usuario */
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/';
    }
  }, [user, loading]);

  if (loading || !user) return null;

  const initials = (user.name ?? user.email ?? '')
    .split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  const isClient = user.role === 'client';
  const isAdmin  = user.role === 'admin';

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>

          {/* ── Header ── */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarWrap}>
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className={styles.avatar} />
                : <div className={styles.avatarInitials}>{initials}</div>
              }
            </div>
            <div className={styles.headerInfo}>
              <p className={styles.greeting}>Mi cuenta</p>
              <h1 className={styles.userName}>{user.name}</h1>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>

          <div className={styles.layout}>

            {/* ── Sidebar ── */}
            <aside className={styles.sidebar}>
              <nav className={styles.sideNav}>
                <a href="#info"    className={`${styles.sideLink} ${styles.sideLinkActive}`}>Información</a>
                <a href="#pedidos" className={styles.sideLink}>Mis pedidos</a>
                {isAdmin && (
                  <a href="/admin" className={`${styles.sideLink} ${styles.sideLinkAdmin}`}>
                    Panel administrativo →
                  </a>
                )}
              </nav>

              <button className={styles.logoutBtn} onClick={logout}>
                Cerrar sesión
              </button>
            </aside>

            {/* ── Content ── */}
            <div className={styles.content}>

              {/* Info section */}
              <section id="info" className={styles.section}>
                <h2 className={styles.sectionTitle}>Información de cuenta</h2>

                <div className={styles.infoGrid}>
                  <InfoRow label="Nombre" value={user.name} />
                  <InfoRow label="Correo" value={user.email} />
                  <InfoRow label="Tipo de cuenta" value={
                    isAdmin ? 'Administrador' : isClient ? 'Cliente' : 'Usuario'
                  } />
                  {isClient && (
                    <InfoRow label="Descuento fidelidad" value="5% en todos los pedidos" highlight />
                  )}
                  <InfoRow label="Método de acceso" value="Google" />
                </div>
              </section>

              {/* Beneficios */}
              {isClient && (
                <section className={styles.benefitsCard}>
                  <div className={styles.benefitsIcon}><IconStar /></div>
                  <div>
                    <p className={styles.benefitsTitle}>Beneficios de cliente registrada</p>
                    <p className={styles.benefitsSub}>
                      Disfrutás de un <strong>5% de descuento automático</strong> en todos tus pedidos.
                      El descuento se aplica al confirmar tu compra.
                    </p>
                  </div>
                </section>
              )}

              {/* Pedidos */}
              <section id="pedidos" className={styles.section}>
                <h2 className={styles.sectionTitle}>Mis pedidos</h2>
                <div className={styles.ordersEmpty}>
                  <IconBag />
                  <p className={styles.ordersEmptyText}>
                    Para consultar el estado de tus pedidos, escribinos a{' '}
                    <a href="mailto:cariocawear.cr@gmail.com" className={styles.emailLink}>cariocawear.cr@gmail.com</a>{' '}
                    con tu correo de compra.
                  </p>
                  <a href="/catalogo" className={styles.shopBtn}>
                    Ir al catálogo
                  </a>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${highlight ? styles.infoHighlight : ''}`}>{value}</span>
    </div>
  );
}

const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-gold)" stroke="none">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const IconBag = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
