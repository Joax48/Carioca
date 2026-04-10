// controllers/products.controller.js

import supabase from '../config/supabase.js';
import { productSchema } from '../utils/schemas.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { uploadToStorage, deleteFromStorage } from '../services/upload.service.js';
import { withUploadSingle, withUploadMultiple } from '../middleware/upload.middleware.js';

// ── Públicos ─────────────────────────────────────────────

export const getProducts = asyncHandler(async (req, res) => {
  const { collection, limit = 20, offset = 0, q } = req.query;

  let query = supabase
    .from('products')
    .select(`
      id, name, slug, description, price, compare_price, tag, sort_order,
      collection:collections(id, name, slug),
      images:product_images(id, url, alt_text, sort_order, color_name, color_hex, is_primary),
      variants:product_variants(id, color_name, color_hex, sort_order, in_stock, sizes)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (collection) query = query.eq('collection_id', collection);
  if (q) query = query.textSearch('fts', q, { config: 'spanish' });

  const { data, error } = await query;
  if (error) throw createError(error.message, 500);

  res.json({ data: data ?? [] });
});

export const getProduct = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      collection:collections(id, name, slug),
      images:product_images(id, url, alt_text, sort_order, color_name, color_hex, is_primary),
      variants:product_variants(id, color_name, color_hex, sort_order, in_stock)
    `)
    .eq('slug', req.params.slug)
    .eq('is_active', true)
    .single();

  if (error || !data) throw createError('Producto no encontrado', 404);

  data.images?.sort((a, b) => a.sort_order - b.sort_order);
  data.variants?.sort((a, b) => a.sort_order - b.sort_order);

  res.json(data);
});

// ── Admin CRUD ────────────────────────────────────────────

// GET /api/admin/products — todos los productos (incluyendo inactivos)
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const { limit = 200, offset = 0 } = req.query;

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, description, price, compare_price, tag, sort_order, is_active, sizes,
      collection:collections(id, name, slug),
      images:product_images(id, url, alt_text, sort_order, color_name, color_hex, is_primary),
      variants:product_variants(id, color_name, color_hex, sort_order, in_stock)
    `)
    .order('sort_order', { ascending: true })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) throw createError(error.message, 500);
  res.json({ data: data ?? [] });
});

export const createProduct = asyncHandler(async (req, res) => {
  const validated = productSchema.parse(req.body);
  const { data, error } = await supabase
    .from('products').insert(validated).select().single();
  if (error) throw createError(error.message, 400);
  res.status(201).json(data);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const validated = productSchema.partial().parse(req.body);
  const { data, error } = await supabase
    .from('products').update(validated).eq('id', req.params.id).select().single();
  if (error || !data) throw createError('Producto no encontrado', 404);
  res.json(data);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('products').update({ is_active: false }).eq('id', req.params.id);
  if (error) throw createError(error.message, 400);
  res.json({ message: 'Producto eliminado' });
});

// ── Imágenes (upload desde backend → bypasea RLS) ─────────

// POST /api/admin/products/:productId/images
// multipart/form-data: images[] + metadata (JSON string)
export const uploadProductImages = asyncHandler(async (req, res) => {
  await withUploadMultiple(req, res);

  const { productId } = req.params;
  const files = req.files ?? [];
  if (files.length === 0) throw createError('No se recibieron imágenes', 400);

  let meta = [];
  try { meta = req.body.metadata ? JSON.parse(req.body.metadata) : []; } catch { meta = []; }

  const uploaded = await Promise.all(
    files.map(async (file, i) => {
      const url = await uploadToStorage(file.buffer, file.originalname, `products/${productId}`);
      const m = meta[i] ?? {};
      return {
        product_id: productId,
        url,
        alt_text:   m.alt_text   ?? '',
        color_name: m.color_name ?? null,
        color_hex:  m.color_hex  ?? null,
        sort_order: m.sort_order ?? i,
        is_primary: m.is_primary ?? (i === 0),
      };
    })
  );

  const { data, error } = await supabase
    .from('product_images').insert(uploaded).select();
  if (error) throw createError(error.message, 500);
  res.status(201).json(data);
});

// DELETE /api/admin/products/images/:imageId
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { data: img } = await supabase
    .from('product_images').select('url').eq('id', req.params.imageId).single();
  if (img?.url) await deleteFromStorage(img.url);
  const { error } = await supabase
    .from('product_images').delete().eq('id', req.params.imageId);
  if (error) throw createError(error.message, 400);
  res.json({ message: 'Imagen eliminada' });
});

// PATCH /api/admin/products/images/:imageId
export const updateProductImage = asyncHandler(async (req, res) => {
  const allowed = ['sort_order', 'is_primary', 'alt_text', 'color_name', 'color_hex'];
  const patch = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );
  const { data, error } = await supabase
    .from('product_images').update(patch).eq('id', req.params.imageId).select().single();
  if (error || !data) throw createError('Imagen no encontrada', 404);
  res.json(data);
});

// ── Variantes de color ────────────────────────────────────

// POST /api/admin/products/:productId/variants
export const createVariant = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { color_name, color_hex, sort_order = 0, in_stock = true, sizes = {} } = req.body;
  if (!color_name || !color_hex) throw createError('color_name y color_hex son requeridos', 400);
  const { data, error } = await supabase
    .from('product_variants')
    .insert({ product_id: productId, color_name, color_hex, sort_order, in_stock, sizes })
    .select().single();
  if (error) throw createError(error.message, 400);
  res.status(201).json(data);
});

// PATCH /api/admin/products/variants/:variantId
export const updateVariant = asyncHandler(async (req, res) => {
  const allowed = ['color_name', 'color_hex', 'sort_order', 'in_stock', 'sizes'];
  const patch = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );
  const { data, error } = await supabase
    .from('product_variants').update(patch).eq('id', req.params.variantId).select().single();
  if (error || !data) throw createError('Variante no encontrada', 404);
  res.json(data);
});

// DELETE /api/admin/products/variants/:variantId
export const deleteVariant = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('product_variants').delete().eq('id', req.params.variantId);
  if (error) throw createError(error.message, 400);
  res.json({ message: 'Variante eliminada' });
});

// ── Upload imagen de colección ────────────────────────────

// POST /api/admin/collections/:collectionId/image
export const uploadCollectionImage = asyncHandler(async (req, res) => {
  await withUploadSingle(req, res);
  const file = req.file;
  if (!file) throw createError('No se recibió ninguna imagen', 400);

  const url = await uploadToStorage(
    file.buffer, file.originalname, `collections/${req.params.collectionId}`
  );

  const { data, error } = await supabase
    .from('collections').update({ image_url: url })
    .eq('id', req.params.collectionId).select().single();
  if (error) throw createError(error.message, 500);

  res.json({ url, collection: data });
});
