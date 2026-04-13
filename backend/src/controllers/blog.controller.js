// controllers/blog.controller.js

import supabase from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { uploadToStorage, deleteFromStorage } from '../services/upload.service.js';
import { withUploadCover, withUploadSingle } from '../middleware/upload.middleware.js';

// ── Público ───────────────────────────────────────────────

// GET /api/blog
export const getPosts = asyncHandler(async (req, res) => {
  const { limit = 12, offset = 0, tag } = req.query;

  let query = supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_url, tags, published_at, created_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (tag) query = query.contains('tags', [tag]);

  const { data, error } = await query;
  if (error) throw createError(error.message, 500);
  res.json({ data: data ?? [] });
});

// GET /api/blog/:slug
export const getPost = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', req.params.slug)
    .eq('is_published', true)
    .single();

  if (error || !data) throw createError('Artículo no encontrado', 404);
  res.json(data);
});

// ── Admin ─────────────────────────────────────────────────

// GET /api/admin/blog
export const getAllPosts = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_url, tags, is_published, published_at, created_at')
    .order('created_at', { ascending: false });

  if (error) throw createError(error.message, 500);
  res.json(data ?? []);
});

// GET /api/admin/blog/:id
export const getPostAdmin = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) throw createError('Artículo no encontrado', 404);
  res.json(data);
});

// POST /api/admin/blog
export const createPost = asyncHandler(async (req, res) => {
  const { title, slug, excerpt, content, cover_url, tags, is_published } = req.body;
  if (!title?.trim() || !slug?.trim()) throw createError('Título y slug requeridos', 400);

  const published_at = is_published ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({ title, slug, excerpt, content, cover_url, tags: tags ?? [], is_published: !!is_published, published_at })
    .select()
    .single();

  if (error) throw createError(error.message, 500);
  res.status(201).json(data);
});

// PATCH /api/admin/blog/:id
export const updatePost = asyncHandler(async (req, res) => {
  const { title, slug, excerpt, content, cover_url, tags, is_published } = req.body;
  const updates = { updated_at: new Date().toISOString() };

  if (title     !== undefined) updates.title     = title;
  if (slug      !== undefined) updates.slug      = slug;
  if (excerpt   !== undefined) updates.excerpt   = excerpt;
  if (content   !== undefined) updates.content   = content;
  if (cover_url !== undefined) updates.cover_url = cover_url;
  if (tags      !== undefined) updates.tags      = tags;
  if (is_published !== undefined) {
    updates.is_published = is_published;
    if (is_published) updates.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) throw createError('Artículo no encontrado', 404);
  res.json(data);
});

// DELETE /api/admin/blog/:id
export const deletePost = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', req.params.id);

  if (error) throw createError(error.message, 500);
  res.json({ message: 'Artículo eliminado' });
});

// POST /api/admin/blog/image — upload imagen de contenido (sin post ID)
export const uploadContentImage = asyncHandler(async (req, res) => {
  await withUploadSingle(req, res);
  if (!req.file) throw createError('No se recibió imagen', 400);

  const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `blog/content/${Date.now()}-${safeName}`;
  const url  = await uploadToStorage(req.file.buffer, path, req.file.mimetype);

  res.json({ url });
});

// POST /api/admin/blog/:id/cover — upload imagen de portada
export const uploadCover = asyncHandler(async (req, res) => {
  await withUploadCover(req, res);
  if (!req.file) throw createError('No se recibió imagen', 400);

  const { data: post } = await supabase
    .from('blog_posts')
    .select('cover_url')
    .eq('id', req.params.id)
    .single();

  // Eliminar imagen anterior si existe
  if (post?.cover_url) {
    const oldPath = post.cover_url.split('/storage/v1/object/public/')[1];
    if (oldPath) await deleteFromStorage(oldPath).catch(() => {});
  }

  const ext  = req.file.originalname.split('.').pop();
  const path = `blog/${req.params.id}/cover.${ext}`;
  const url  = await uploadToStorage(req.file.buffer, path, req.file.mimetype);

  await supabase
    .from('blog_posts')
    .update({ cover_url: url, updated_at: new Date().toISOString() })
    .eq('id', req.params.id);

  res.json({ url });
});
