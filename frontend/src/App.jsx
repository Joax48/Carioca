// rutas completas incluyendo CMS admin

import { useEffect }        from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';

import { useAuth }          from './stores/useAuth';
import { ProtectedRoute }   from './components/auth/ProtectedRoute';

// Storefront
import { HomePage }         from './pages/HomePage';
import { CatalogPage }      from './pages/CatalogPage';
import { CollectionPage }   from './pages/CollectionPage';
import { ProductPage }      from './pages/ProductPage';

// Admin CMS
import { LoginPage }        from './pages/admin/LoginPage';
import { AdminLayout }      from './pages/admin/AdminLayout';
import { ProductsPage }     from './pages/admin/ProductsPage';
import { CollectionsPage }  from './pages/admin/CollectionsPage';

export function App() {
  const init = useAuth(s => s.init);
  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Storefront ── */}
        <Route path="/"                  element={<HomePage />} />
        <Route path="/catalogo"          element={<CatalogPage />} />
        <Route path="/colecciones/:slug" element={<CollectionPage />} />
        <Route path="/productos/:slug"   element={<ProductPage />} />

        {/* ── Admin login (sin layout) ── */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ── Admin CMS (protegido) ── */}
        <Route path="/admin" element={
          <ProtectedRoute><AdminLayout /></ProtectedRoute>
        }>
          <Route index            element={<ProductsPage />} />
          <Route path="productos"   element={<ProductsPage />} />
          <Route path="colecciones" element={<CollectionsPage />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:72, fontWeight:300, fontStyle:'italic', color:'var(--color-espresso)' }}>404</h1>
      <p style={{ fontFamily:'var(--font-body)', color:'var(--color-espresso-60)' }}>Esta página no existe.</p>
      <a href="/" style={{ fontFamily:'var(--font-body)', fontSize:12, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--color-espresso)', borderBottom:'1.5px solid var(--color-gold)', paddingBottom:3 }}>
        Volver al inicio →
      </a>
    </div>
  );
}