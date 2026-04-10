// routes/index.js

import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

import { login, logout, me }
  from '../controllers/auth.controller.js';

import {
  getProducts, getProduct,
  getAllProductsAdmin,
  createProduct, updateProduct, deleteProduct,
  uploadProductImages, deleteProductImage, updateProductImage,
  createVariant, updateVariant, deleteVariant,
  uploadCollectionImage,
} from '../controllers/products.controller.js';

import { getCollections, getCollection,
         getAllCollectionsAdmin,
         createCollection, updateCollection }
  from '../controllers/collections.controller.js';

import { createOrder, getOrders, getOrder, updateOrderStatus }
  from '../controllers/orders.controller.js';

import { getTestimonials, createTestimonial,
         approveTestimonial, getAllTestimonials }
  from '../controllers/testimonials.controller.js';

const router = Router();

// ── Auth ─────────────────────────────────────────────────
router.post('/auth/login',  login);
router.post('/auth/logout', logout);
router.get ('/auth/me',     requireAuth, me);

// ── Productos (público) ──────────────────────────────────
router.get('/products',       getProducts);
router.get('/products/:slug', getProduct);

// ── Colecciones (público) ─────────────────────────────────
router.get('/collections',        getCollections);
router.get('/collections/:slug',  getCollection);

// ── Pedidos (público) ─────────────────────────────────────
router.post('/orders', createOrder);

// ── Testimonios (público) ─────────────────────────────────
router.get ('/testimonials', getTestimonials);
router.post('/testimonials', createTestimonial);

// ════════════════════════════════════════════════════════
// ADMIN — protegidas con requireAdmin
// ════════════════════════════════════════════════════════

// Productos (CRUD)
router.get   ('/admin/products',     requireAdmin, getAllProductsAdmin);
router.post  ('/admin/products',     requireAdmin, createProduct);
router.patch ('/admin/products/:id', requireAdmin, updateProduct);
router.delete('/admin/products/:id', requireAdmin, deleteProduct);

// Imágenes de producto (upload desde backend)
router.post  ('/admin/products/:productId/images',  requireAdmin, uploadProductImages);
router.patch ('/admin/products/images/:imageId',    requireAdmin, updateProductImage);
router.delete('/admin/products/images/:imageId',    requireAdmin, deleteProductImage);

// Variantes de color
router.post  ('/admin/products/:productId/variants', requireAdmin, createVariant);
router.patch ('/admin/products/variants/:variantId', requireAdmin, updateVariant);
router.delete('/admin/products/variants/:variantId', requireAdmin, deleteVariant);

// Colecciones (CRUD + upload imagen)
router.get  ('/admin/collections',                        requireAdmin, getAllCollectionsAdmin);
router.post ('/admin/collections',                        requireAdmin, createCollection);
router.patch('/admin/collections/:id',                    requireAdmin, updateCollection);
router.post ('/admin/collections/:collectionId/image',    requireAdmin, uploadCollectionImage);

// Pedidos
router.get  ('/admin/orders',            requireAdmin, getOrders);
router.get  ('/admin/orders/:id',        requireAdmin, getOrder);
router.patch('/admin/orders/:id/status', requireAdmin, updateOrderStatus);

// Testimonios
router.get  ('/admin/testimonials',             requireAdmin, getAllTestimonials);
router.patch('/admin/testimonials/:id/approve', requireAdmin, approveTestimonial);

export default router;