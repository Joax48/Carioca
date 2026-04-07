// Shell del CMS: sidebar + topbar + <Outlet /> para sub-páginas.

import { useState }           from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth }            from '../../stores/useAuth';
import '../../styles/admin.tokens.css';
import styles from './AdminLayout.module.css';

/* ── Inline SVG icons ─────────────────────────────────── */
const IconProduct    = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
const IconCollection = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
const IconOrders     = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>;
const IconStar       = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const IconLogout     = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
const IconMenu       = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>;
const IconExternalLink = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>;

const NAV_ITEMS = [
  {
    group: 'Catálogo',
    items: [
      { label: 'Productos',    href: '/admin/productos',    icon: IconProduct },
      { label: 'Colecciones',  href: '/admin/colecciones',  icon: IconCollection },
    ],
  },
  {
    group: 'Ventas',
    items: [
      { label: 'Pedidos',      href: '/admin/pedidos',      icon: IconOrders },
      { label: 'Testimonios',  href: '/admin/testimonios',  icon: IconStar },
    ],
  },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location         = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  // Título de la página activa
  const activeItem = NAV_ITEMS.flatMap(g => g.items)
    .find(item => location.pathname.startsWith(item.href));

  return (
    <div className={`${styles.root} adminRoot`}>

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Wordmark */}
        <div className={styles.sidebarBrand}>
          <span className={styles.brandName}>CARIOCA</span>
          <span className={styles.brandSub}>CMS</span>
        </div>

        {/* Nav groups */}
        <nav className={styles.nav} aria-label="Navegación admin">
          {NAV_ITEMS.map(group => (
            <div key={group.group} className={styles.navGroup}>
              <p className={styles.navGroupLabel}>{group.group}</p>
              {group.items.map(item => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={15} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User + logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            <div className={styles.userAvatar}>
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <IconLogout size={14} />
            Salir
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className={styles.main}>

        {/* Topbar */}
        <header className={styles.topbar}>
          {/* Mobile toggle */}
          <button
            className={styles.menuToggle}
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Abrir menú"
          >
            <IconMenu size={18} />
          </button>

          <h1 className={styles.pageTitle}>
            {activeItem?.label ?? 'Dashboard'}
          </h1>

          <div className={styles.topbarRight}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.previewLink}
            >
              <IconExternalLink size={13} />
              Ver sitio
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
