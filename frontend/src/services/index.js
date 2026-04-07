// Un objeto por entidad. Importar lo que se necesite.

import { api } from './api.client.js';

// ── Productos ─────────────────────────────────────────────
export const productsService = {
  getAll: ({ collection, limit, offset, q } = {}) => {
    const params = new URLSearchParams();
    if (collection) params.set('collection', collection);
    if (limit)      params.set('limit', limit);
    if (offset)     params.set('offset', offset);
    if (q)          params.set('q', q);
    const qs = params.toString();
    return api.get(`/products${qs ? `?${qs}` : ''}`);
  },
  getOne:   (slug)         => api.get(`/products/${slug}`),
  create:   (body)         => api.post('/admin/products', body),
  update:   (id, body)     => api.patch(`/admin/products/${id}`, body),
  remove:   (id)           => api.delete(`/admin/products/${id}`),
  addImage: (productId, body) => api.post(`/admin/products/${productId}/images`, body),
};

// ── Colecciones ───────────────────────────────────────────
export const collectionsService = {
  getAll:  ()           => api.get('/collections'),
  getOne:  (slug)       => api.get(`/collections/${slug}`),
  create:  (body)       => api.post('/admin/collections', body),
  update:  (id, body)   => api.patch(`/admin/collections/${id}`, body),
};

// ── Pedidos ───────────────────────────────────────────────
export const ordersService = {
  create:       (body)         => api.post('/orders', body),
  // Admin
  getAll:       (params = {})  => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin/orders${qs ? `?${qs}` : ''}`);
  },
  getOne:       (id)           => api.get(`/admin/orders/${id}`),
  updateStatus: (id, body)     => api.patch(`/admin/orders/${id}/status`, body),
};

// ── Testimonios ───────────────────────────────────────────
export const testimonialsService = {
  getAll:   ()           => api.get('/testimonials'),
  create:   (body)       => api.post('/testimonials', body),
  // Admin
  getAdmin: ()           => api.get('/admin/testimonials'),
  approve:  (id, approved = true) =>
    api.patch(`/admin/testimonials/${id}/approve`, { approved }),
};

// ── Auth ──────────────────────────────────────────────────
export const authService = {
  login:  (body) => api.post('/auth/login', body),
  logout: ()     => api.post('/auth/logout'),
  me:     ()     => api.get('/auth/me'),
};
