
import supabase from '../config/supabase.js';
import { collectionSchema } from '../utils/schemas.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';

// GET /api/collections
export const getCollections = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, slug, description, image_url, sort_order')
    .eq('is_active', true)
    .order('sort_order');

  if (error) throw createError(error.message, 500);
  res.json(data);
});

// GET /api/collections/:slug — colección + sus productos
export const getCollection = asyncHandler(async (req, res) => {
  const { data: collection, error } = await supabase
    .from('collections')
    .select(`
      *,
      products(
        id, name, slug, price, compare_price, tag,
        images:product_images(url, alt_text, sort_order)
      )
    `)
    .eq('slug', req.params.slug)
    .eq('is_active', true)
    .single();

  if (error || !collection) throw createError('Colección no encontrada', 404);
  res.json(collection);
});

// POST /api/admin/collections
export const createCollection = asyncHandler(async (req, res) => {
  const validated = collectionSchema.parse(req.body);
  const { data, error } = await supabase
    .from('collections').insert(validated).select().single();
  if (error) throw createError(error.message, 400);
  res.status(201).json(data);
});

// PATCH /api/admin/collections/:id
export const updateCollection = asyncHandler(async (req, res) => {
  const validated = collectionSchema.partial().parse(req.body);
  const { data, error } = await supabase
    .from('collections').update(validated).eq('id', req.params.id).select().single();
  if (error || !data) throw createError('Colección no encontrada', 404);
  res.json(data);
});
