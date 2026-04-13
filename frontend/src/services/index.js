import { api } from './api.client.js';

// ── Productos ─────────────────────────────────────────────
export const productsService = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
    ).toString();
    return api.get(`/products${qs ? `?${qs}` : ''}`);
  },
  // Admin: trae todos incluyendo inactivos
  getAllAdmin: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
    ).toString();
    return api.get(`/admin/products${qs ? `?${qs}` : ''}`);
  },
  getOne:   (slug)         => api.get(`/products/${slug}`),
  create:   (body)         => api.post('/admin/products', body),
  update:   (id, body)     => api.patch(`/admin/products/${id}`, body),
  remove:   (id)           => api.delete(`/admin/products/${id}`),

  // Imágenes — upload al backend (bypasea RLS)
  // files: File[]
  // meta:  [{ alt_text, color_name, color_hex, sort_order, is_primary }]
  uploadImages: (productId, files, meta = []) => {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    if (meta.length) fd.append('metadata', JSON.stringify(meta));
    return api.upload(`/admin/products/${productId}/images`, fd);
  },
  updateImage: (imageId, body)  => api.patch(`/admin/products/images/${imageId}`, body),
  deleteImage: (imageId)        => api.delete(`/admin/products/images/${imageId}`),

  // Variantes de color
  createVariant: (productId, body) => api.post(`/admin/products/${productId}/variants`, body),
  updateVariant: (variantId, body) => api.patch(`/admin/products/variants/${variantId}`, body),
  deleteVariant: (variantId)       => api.delete(`/admin/products/variants/${variantId}`),
};

// ── Colecciones ───────────────────────────────────────────
export const collectionsService = {
  getAll:      ()       => api.get('/collections'),
  // Admin: trae todas incluyendo inactivas
  getAllAdmin:  ()       => api.get('/admin/collections'),
  getOne:  (slug)       => api.get(`/collections/${slug}`),
  create:  (body)       => api.post('/admin/collections', body),
  update:  (id, body)   => api.patch(`/admin/collections/${id}`, body),

  // Upload imagen de portada al backend
  uploadImage: (collectionId, file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.upload(`/admin/collections/${collectionId}/image`, fd);
  },
};

// ── Pedidos ───────────────────────────────────────────────
export const ordersService = {
  create:       (body)        => api.post('/orders', body),
  getAll:       (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/orders${qs ? `?${qs}` : ''}`);
  },
  getOne:       (id)          => api.get(`/admin/orders/${id}`),
  updateStatus: (id, body)    => api.patch(`/admin/orders/${id}/status`, body),
};

// ── Testimonios ───────────────────────────────────────────
export const testimonialsService = {
  getAll:   ()                      => api.get('/testimonials'),
  create:   (body)                  => api.post('/testimonials', body),
  getAdmin: ()                      => api.get('/admin/testimonials'),
  approve:  (id, approved = true)   => api.patch(`/admin/testimonials/${id}/approve`, { approved }),
};

// ── Auth ──────────────────────────────────────────────────
export const authService = {
  login:  (body) => api.post('/auth/login', body),
  logout: ()     => api.post('/auth/logout'),
  me:     ()     => api.get('/auth/me'),
};

// ── Blog ──────────────────────────────────────────────────
export const blogService = {
  getAll:   (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
    ).toString();
    return api.get(`/blog${qs ? `?${qs}` : ''}`);
  },
  getOne:       (slug) => api.get(`/blog/${slug}`),
  getAllAdmin:   ()     => api.get('/admin/blog'),
  getOneAdmin:  (id)   => api.get(`/admin/blog/${id}`),
  create:       (body) => api.post('/admin/blog', body),
  update:       (id, body) => api.patch(`/admin/blog/${id}`, body),
  remove:       (id)   => api.delete(`/admin/blog/${id}`),
  uploadCover:  (id, file) => {
    const fd = new FormData();
    fd.append('cover', file);
    return api.upload(`/admin/blog/${id}/cover`, fd);
  },
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.upload('/admin/blog/image', fd);
  },
};

// ── Producto destacado ────────────────────────────────────
export const settingsService = {
  getFeatured: () => api.get('/products/featured'),
  setFeatured: (productId) => api.patch(`/admin/products/${productId}`, { is_featured: true }),
  clearFeatured: (productId) => api.patch(`/admin/products/${productId}`, { is_featured: false }),
};