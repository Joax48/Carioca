// App.jsx — rutas completas del sitio

import { useEffect }        from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';

import { useAuth }              from './stores/useAuth';
import { useClientAuth }        from './stores/useClientAuth';
import { ProtectedRoute }       from './components/auth/ProtectedRoute';
import { CartDrawer }           from './components/cart/CartDrawer';

// Storefront
import { HomePage }             from './pages/HomePage';
import { CatalogPage }          from './pages/CatalogPage';
import { CollectionsListPage }  from './pages/CollectionsListPage';
import { CollectionPage }       from './pages/CollectionPage';
import { ProductPage }          from './pages/ProductPage';
import { CheckoutPage }         from './pages/CheckoutPage';
import { ReviewPage }           from './pages/ReviewPage';
import { ContactPage }          from './pages/ContactPage';
import { ProfilePage }          from './pages/ProfilePage';
import { BlogPage }             from './pages/BlogPage';
import { BlogPostPage }         from './pages/BlogPostPage';

// Admin CMS
import { LoginPage }            from './pages/admin/LoginPage';
import { AdminLayout }          from './pages/admin/AdminLayout';
import { ProductsPage }         from './pages/admin/ProductsPage';
import { CollectionsPage }      from './pages/admin/CollectionsPage';
import { OrdersPage }           from './pages/admin/OrdersPage';
import { TestimonialsPage }     from './pages/admin/TestimonialsPage';
import { BlogAdminPage }        from './pages/admin/BlogAdminPage';

export function App() {
  const initAdmin  = useAuth(s => s.init);
  const initClient = useClientAuth(s => s.init);

  useEffect(() => {
    initAdmin();
    initClient();
  }, []);

  return (
    <BrowserRouter>
      <CartDrawer />
      <Routes>
        {/* ── Storefront ── */}
        <Route path="/"                  element={<HomePage />} />
        <Route path="/catalogo"          element={<CatalogPage />} />
        <Route path="/colecciones"       element={<CollectionsListPage />} />
        <Route path="/colecciones/:slug" element={<CollectionPage />} />
        <Route path="/productos/:slug"   element={<ProductPage />} />
        <Route path="/checkout"          element={<CheckoutPage />} />
        <Route path="/review/:orderId"   element={<ReviewPage />} />
        <Route path="/contacto"          element={<ContactPage />} />
        <Route path="/mi-cuenta"         element={<ProfilePage />} />
        <Route path="/blog"              element={<BlogPage />} />
        <Route path="/blog/:slug"        element={<BlogPostPage />} />

        {/* ── Admin CMS ── */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={
          <ProtectedRoute><AdminLayout /></ProtectedRoute>
        }>
          <Route index              element={<OrdersPage />} />
          <Route path="pedidos"     element={<OrdersPage />} />
          <Route path="productos"   element={<ProductsPage />} />
          <Route path="colecciones" element={<CollectionsPage />} />
          <Route path="testimonios" element={<TestimonialsPage />} />
          <Route path="blog"        element={<BlogAdminPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16 }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:72, fontWeight:300,
        fontStyle:'italic', color:'var(--color-espresso)' }}>404</h1>
      <p style={{ fontFamily:'var(--font-body)', color:'var(--color-espresso-60)' }}>
        Esta página no existe.
      </p>
      <a href="/" style={{ fontFamily:'var(--font-body)', fontSize:12,
        letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--color-espresso)',
        borderBottom:'1.5px solid var(--color-gold)', paddingBottom:3 }}>
        Volver al inicio →
      </a>
    </div>
  );
}
