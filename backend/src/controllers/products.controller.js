
import supabase from '../config/supabase.js';
import { productSchema } from '../utils/schemas.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';

// ── Públicos ─────────────────────────────────────────────

// GET /api/products — listado con filtros opcionales
export const getProducts = asyncHandler(async (req, res) => {
  const { collection, limit = 20, offset = 0, q } = req.query;

  let query = supabase
    .from('products')
    .select(`
      id, name, slug, description, price, compare_price, tag, sort_order,
      collection:collections(id, name, slug),
      images:product_images(url, alt_text, sort_order)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (collection) query = query.eq('collection_id', collection);

  // Búsqueda full-text
  if (q) query = query.textSearch('fts', q, { config: 'spanish' });

  const { data, error, count } = await query;
  if (error) throw createError(error.message, 500);

  res.json({ data, count });
});

// GET /api/products/:slug
export const getProduct = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      collection:collections(id, name, slug),
      images:product_images(url, alt_text, sort_order)
    `)
    .eq('slug', req.params.slug)
    .eq('is_active', true)
    .single();

  if (error || !data) throw createError('Producto no encontrado', 404);

  // Ordenar imágenes por sort_order
  data.images?.sort((a, b) => a.sort_order - b.sort_order);

  res.json(data);
});

// ── Admin ─────────────────────────────────────────────────

// POST /api/admin/products
export const createProduct = asyncHandler(async (req, res) => {
  const validated = productSchema.parse(req.body);

  const { data, error } = await supabase
    .from('products')
    .insert(validated)
    .select()
    .single();

  if (error) throw createError(error.message, 400);
  res.status(201).json(data);
});

// PATCH /api/admin/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  const validated = productSchema.partial().parse(req.body);

  const { data, error } = await supabase
    .from('products')
    .update(validated)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) throw createError('Producto no encontrado', 404);
  res.json(data);
});

// DELETE /api/admin/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })    // soft delete
    .eq('id', req.params.id);

  if (error) throw createError(error.message, 400);
  res.json({ message: 'Producto eliminado' });
});

// POST /api/admin/products/:id/images — subir imagen
export const uploadProductImage = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { url, alt_text, sort_order = 0 } = req.body;

  // La imagen ya fue subida al Storage desde el frontend
  // usando el SDK de Supabase. Aquí solo registramos la URL.
  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url, alt_text, sort_order })
    .select()
    .single();

  if (error) throw createError(error.message, 400);
  res.status(201).json(data);
});
