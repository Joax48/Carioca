
import supabase from '../config/supabase.js';
import { orderSchema, orderStatusSchema } from '../utils/schemas.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import {
  sendOrderReceived,
  sendOrderConfirmed,
  sendOrderCompleted,
} from '../services/email.service.js';

// ── Público ───────────────────────────────────────────────

// POST /api/orders — crear pedido
export const createOrder = asyncHandler(async (req, res) => {
  const validated = orderSchema.parse(req.body);

  // 1. Obtener precios reales de la BD (nunca confiar en precios del cliente)
  const productIds = validated.items.map(i => i.product_id);
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name, price')
    .in('id', productIds)
    .eq('is_active', true);

  if (pErr || products.length !== productIds.length) {
    throw createError('Uno o más productos no están disponibles', 400);
  }

  // 2. Calcular totales
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));
  const items = validated.items.map(item => {
    const product = productMap[item.product_id];
    const subtotal = product.price * item.quantity;
    return {
      product_id:    item.product_id,
      product_name:  product.name,
      product_price: product.price,
      quantity:      item.quantity,
      subtotal,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const shipping_cost = 0;  // TODO: calcular según zona
  const total = subtotal + shipping_cost;

  // 3. Crear pedido + items en transacción
  const { data: order, error: oErr } = await supabase
    .from('orders')
    .insert({
      user_id:          req.user?.id || null,
      customer_name:    validated.customer_name,
      customer_email:   validated.customer_email,
      customer_phone:   validated.customer_phone,
      shipping_address: validated.shipping_address,
      city:             validated.city,
      notes:            validated.notes,
      sinpe_phone:      validated.sinpe_phone,
      subtotal,
      shipping_cost,
      total,
      status: 'pending',
    })
    .select()
    .single();

  if (oErr) throw createError(oErr.message, 500);

  // 4. Insertar líneas del pedido
  const { error: iErr } = await supabase
    .from('order_items')
    .insert(items.map(i => ({ ...i, order_id: order.id })));

  if (iErr) throw createError(iErr.message, 500);

  // 5. Enviar email de confirmación al cliente
  await sendOrderReceived({
    to:           validated.customer_email,
    customerName: validated.customer_name,
    orderId:      order.id,
    total,
  }).catch(console.error);  // no bloquear respuesta si falla el email

  res.status(201).json({
    message: 'Pedido creado exitosamente',
    orderId: order.id,
    total,
  });
});

// ── Admin ─────────────────────────────────────────────────

// GET /api/admin/orders — listado con filtro de estado
export const getOrders = asyncHandler(async (req, res) => {
  const { status, limit = 30, offset = 0 } = req.query;

  let query = supabase
    .from('orders')
    .select(`
      id, customer_name, customer_email, customer_phone,
      shipping_address, city, total, status,
      sinpe_phone, sinpe_confirmed_at,
      notes, admin_notes, created_at, updated_at,
      items:order_items(product_name, product_price, quantity, subtotal)
    `)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw createError(error.message, 500);

  res.json(data);
});

// GET /api/admin/orders/:id
export const getOrder = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', req.params.id)
    .single();

  if (error || !data) throw createError('Pedido no encontrado', 404);
  res.json(data);
});

// PATCH /api/admin/orders/:id/status — cambiar estado del pedido
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, admin_notes } = orderStatusSchema.parse(req.body);

  // Campos extra según el nuevo estado
  const extra = {};
  if (status === 'confirmed') extra.sinpe_confirmed_at = new Date().toISOString();

  const { data: order, error } = await supabase
    .from('orders')
    .update({ status, admin_notes, ...extra })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !order) throw createError('Pedido no encontrado', 404);

  // Disparar emails según estado
  if (status === 'confirmed') {
    await sendOrderConfirmed({
      to:           order.customer_email,
      customerName: order.customer_name,
      orderId:      order.id,
    }).catch(console.error);
  }

  if (status === 'completed') {
    const reviewUrl = `${process.env.ALLOWED_ORIGINS.split(',')[0]}/review/${order.id}`;
    await sendOrderCompleted({
      to:           order.customer_email,
      customerName: order.customer_name,
      orderId:      order.id,
      reviewUrl,
    }).catch(console.error);
  }

  res.json({ message: `Pedido actualizado a: ${status}`, order });
});