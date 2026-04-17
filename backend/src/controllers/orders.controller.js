// controllers/orders.controller.js

import supabase from '../config/supabase.js';
import { orderSchema, orderStatusSchema } from '../utils/schemas.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import {
  sendOrderReceived,
  sendOrderConfirmed,
  sendOrderReadyForPickup,
  sendOrderShipped,
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
      size:          item.size  ?? null,
      color:         item.color ?? null,
      subtotal,
    };
  });

  const subtotal        = items.reduce((sum, i) => sum + i.subtotal, 0);
  const delivery_method = validated.delivery_method ?? 'courier';
  const shipping_cost   = delivery_method === 'courier' ? 2500 : 0;

  // ── Descuento automático para clientes registrados (10%) ──
  const userId = req.user?.id ?? null;
  let discount_pct = 0;
  let discount_amount = 0;

  if (userId) {
    // Verificar si el usuario está en profiles (es cliente registrado)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profile) {
      discount_pct    = 5;
      discount_amount = parseFloat((subtotal * 0.05).toFixed(2));
    }
  }

  const total = parseFloat((subtotal - discount_amount + shipping_cost).toFixed(2));

  // 3. Crear pedido + items en transacción
  const { data: order, error: oErr } = await supabase
    .from('orders')
    .insert({
      user_id:             userId,
      customer_name:       validated.customer_name,
      customer_email:      validated.customer_email,
      customer_phone:      validated.customer_phone,
      delivery_method,
      shipping_address:    validated.shipping_address ?? (delivery_method === 'pickup' ? 'Retiro en tienda' : null),
      city:                validated.city ?? (delivery_method === 'pickup' ? 'Retiro en tienda' : null),
      notes:               validated.notes ?? null,
      sinpe_phone:         validated.sinpe_phone ?? null,
      subtotal,
      discount_percentage: discount_pct,
      discount_amount,
      shipping_cost,
      total,
      status:              'pending',
    })
    .select()
    .single();

  if (oErr) throw createError(oErr.message, 500);

  // 4. Insertar líneas del pedido
  const { error: iErr } = await supabase
    .from('order_items')
    .insert(items.map(i => ({ ...i, order_id: order.id })));

  if (iErr) throw createError(iErr.message, 500);

  // 5. Reducir stock por talla y color para cada ítem
  for (const item of items) {
    const { product_id, size, color, quantity } = item;
    if (!size) continue;  // sin talla no hay nada que reducir

    try {
      if (color) {
        // Producto con variante de color → reducir en product_variants.sizes
        const { data: variant } = await supabase
          .from('product_variants')
          .select('id, sizes')
          .eq('product_id', product_id)
          .eq('color_name', color)
          .single();

        if (variant?.sizes) {
          const current  = Number(variant.sizes[size] ?? 0);
          const newStock = Math.max(0, current - quantity);
          await supabase
            .from('product_variants')
            .update({ sizes: { ...variant.sizes, [size]: newStock } })
            .eq('id', variant.id);
        }
      } else {
        // Producto sin variantes → reducir en products.sizes
        const { data: product } = await supabase
          .from('products')
          .select('sizes')
          .eq('id', product_id)
          .single();

        if (product?.sizes) {
          const current  = Number(product.sizes[size] ?? 0);
          const newStock = Math.max(0, current - quantity);
          await supabase
            .from('products')
            .update({ sizes: { ...product.sizes, [size]: newStock } })
            .eq('id', product_id);
        }
      }
    } catch (stockErr) {
      // No bloqueamos el pedido si falla la actualización de stock
      console.error(`Error reduciendo stock para product ${product_id} size ${size}:`, stockErr);
    }
  }

  // 6. Enviar email de confirmación al cliente
  await sendOrderReceived({
    to:             validated.customer_email,
    customerName:   validated.customer_name,
    orderId:        order.id,
    total,
    deliveryMethod: delivery_method,
  }).catch(err => console.error('[Email] sendOrderReceived falló:', err.message));

  res.status(201).json({
    message: 'Pedido creado exitosamente',
    orderId:         order.id,
    subtotal,
    discount_pct,
    discount_amount,
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
      shipping_address, city, subtotal, shipping_cost, discount_percentage,
      discount_amount, total, status, delivery_method,
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

  const updateData = { status };
  if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
  if (status === 'confirmed') updateData.sinpe_confirmed_at = new Date().toISOString();

  const { data: order, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !order) throw createError(error?.message ?? 'Pedido no encontrado', 404);

  // Disparar emails según estado
  if (status === 'confirmed') {
    await sendOrderConfirmed({
      to:             order.customer_email,
      customerName:   order.customer_name,
      orderId:        order.id,
      deliveryMethod: order.delivery_method ?? 'courier',
    }).catch(err => console.error('[Email] sendOrderConfirmed falló:', err.message));
  }

  if (status === 'ready') {
    await sendOrderReadyForPickup({
      to:           order.customer_email,
      customerName: order.customer_name,
      orderId:      order.id,
    }).catch(err => console.error('[Email] sendOrderReadyForPickup falló:', err.message));
  }

  if (status === 'shipped' && order.delivery_method !== 'pickup') {
    await sendOrderShipped({
      to:           order.customer_email,
      customerName: order.customer_name,
      orderId:      order.id,
    }).catch(err => console.error('[Email] sendOrderShipped falló:', err.message));
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
