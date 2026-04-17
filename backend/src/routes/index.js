// routes/index.js

import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';

import { login, logout, me }
  from '../controllers/auth.controller.js';

import {
  getProducts, getProduct, getFeaturedProduct,
  getAllProductsAdmin,
  createProduct, updateProduct, deleteProduct,
  uploadProductImages, deleteProductImage, updateProductImage,
  createVariant, updateVariant, deleteVariant,
  uploadCollectionImage,
  getColors,
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

import {
  getPosts, getPost,
  getAllPosts, getPostAdmin, createPost, updatePost, deletePost,
  uploadCover, uploadContentImage,
} from '../controllers/blog.controller.js';

const router = Router();

// ── Contacto ─────────────────────────────────────────────
router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Nombre, correo y mensaje son requeridos' });
    }
    const { sendContactMessage } = await import('../services/email.service.js');
    await sendContactMessage({ name, email, subject, message });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Auth ─────────────────────────────────────────────────
router.post('/auth/login',  login);
router.post('/auth/logout', logout);
router.get ('/auth/me',     requireAuth, me);

// ── Productos (público) ──────────────────────────────────
router.get('/products/featured', getFeaturedProduct);  // must come before /:slug
router.get('/products',          getProducts);
router.get('/products/:slug',    getProduct);

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
router.get   ('/admin/colors',                       requireAdmin, getColors);
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

// ── Blog (público) ────────────────────────────────────────
router.get('/blog',       getPosts);
router.get('/blog/:slug', getPost);

// ── Blog (admin) ──────────────────────────────────────────
router.post  ('/admin/blog/image',        requireAdmin, uploadContentImage); // antes de /:id
router.get   ('/admin/blog',              requireAdmin, getAllPosts);
router.get   ('/admin/blog/:id',          requireAdmin, getPostAdmin);
router.post  ('/admin/blog',              requireAdmin, createPost);
router.patch ('/admin/blog/:id',          requireAdmin, updatePost);
router.delete('/admin/blog/:id',          requireAdmin, deletePost);
router.post  ('/admin/blog/:id/cover',    requireAdmin, uploadCover);

export default router;