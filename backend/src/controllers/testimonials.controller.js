
import supabase from '../config/supabase.js';
import { testimonialSchema } from '../utils/schemas.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';

// GET /api/testimonials — solo los aprobados (público)
export const getTestimonials = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, author_name, text, stars, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw createError(error.message, 500);
  res.json(data);
});

// POST /api/testimonials — el cliente envía su reseña
export const createTestimonial = asyncHandler(async (req, res) => {
  const validated = testimonialSchema.parse(req.body);

  // Verificar que el pedido existe y está completado
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', validated.order_id)
    .eq('status', 'completed')
    .single();

  if (!order) throw createError('Pedido no válido para dejar reseña', 400);

  // Un pedido = un testimonio máximo
  const { data: existing } = await supabase
    .from('testimonials')
    .select('id')
    .eq('order_id', validated.order_id)
    .single();

  if (existing) throw createError('Ya dejaste una reseña para este pedido', 400);

  const { data, error } = await supabase
    .from('testimonials')
    .insert({ ...validated, is_approved: false })  // el admin aprueba
    .select()
    .single();

  if (error) throw createError(error.message, 400);
  res.status(201).json({ message: 'Reseña recibida. Gracias por tu opinión 🤍' });
});

// PATCH /api/admin/testimonials/:id/approve — el admin aprueba
export const approveTestimonial = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('testimonials')
    .update({ is_approved: req.body.approved ?? true })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) throw createError('Testimonio no encontrado', 404);
  res.json(data);
});

// GET /api/admin/testimonials — todos (aprobados y pendientes)
export const getAllTestimonials = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw createError(error.message, 500);
  res.json(data);
});
