// Punto central de rutas — importado por src/index.js

import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

import { login, logout, me }                                         from '../controllers/auth.controller.js';
import { getProducts, getProduct,
         createProduct, updateProduct,
         deleteProduct, uploadProductImage }                         from '../controllers/products.controller.js';
import { getCollections, getCollection,
         createCollection, updateCollection }                        from '../controllers/collections.controller.js';
import { createOrder, getOrders,
         getOrder, updateOrderStatus }                               from '../controllers/orders.controller.js';
import { getTestimonials, createTestimonial,
         approveTestimonial, getAllTestimonials }                    from '../controllers/testimonials.controller.js';

const router = Router();

// ── Auth ─────────────────────────────────────────────────
router.post('/auth/login',  login);
router.post('/auth/logout', logout);
router.get ('/auth/me',     requireAuth, me);

// ── Productos (público) ──────────────────────────────────
router.get('/products',      getProducts);
router.get('/products/:slug', getProduct);

// ── Colecciones (público) ─────────────────────────────────
router.get('/collections',       getCollections);
router.get('/collections/:slug', getCollection);

// ── Pedidos (público — cualquiera puede crear) ────────────
router.post('/orders', createOrder);

// ── Testimonios (público) ─────────────────────────────────
router.get ('/testimonials',  getTestimonials);
router.post('/testimonials',  createTestimonial);

// ════════════════════════════════════════════════════════
// RUTAS ADMIN — protegidas con requireAdmin
// ════════════════════════════════════════════════════════

// Productos
router.post  ('/admin/products',               requireAdmin, createProduct);
router.patch ('/admin/products/:id',           requireAdmin, updateProduct);
router.delete('/admin/products/:id',           requireAdmin, deleteProduct);
router.post  ('/admin/products/:productId/images', requireAdmin, uploadProductImage);

// Colecciones
router.post ('/admin/collections',     requireAdmin, createCollection);
router.patch('/admin/collections/:id', requireAdmin, updateCollection);

// Pedidos
router.get  ('/admin/orders',              requireAdmin, getOrders);
router.get  ('/admin/orders/:id',          requireAdmin, getOrder);
router.patch('/admin/orders/:id/status',   requireAdmin, updateOrderStatus);

// Testimonios
router.get  ('/admin/testimonials',             requireAdmin, getAllTestimonials);
router.patch('/admin/testimonials/:id/approve', requireAdmin, approveTestimonial);

export default router;
