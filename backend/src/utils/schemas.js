// Esquemas de validación Zod — reutilizables en controllers.

import { z } from 'zod';

// ── Auth ─────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

// ── Productos ─────────────────────────────────────────────
export const productSchema = z.object({
  name:           z.string().min(2).max(120),
  slug:           z.string().regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description:    z.string().optional(),
  price:          z.number().positive(),
  compare_price:  z.number().positive().optional(),
  tag:            z.string().max(20).optional(),
  collection_id:  z.string().uuid().optional(),
  is_active:      z.boolean().optional(),
  sort_order:     z.number().int().optional(),
});

// ── Colecciones ───────────────────────────────────────────
export const collectionSchema = z.object({
  name:        z.string().min(2).max(80),
  slug:        z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  is_active:   z.boolean().optional(),
  sort_order:  z.number().int().optional(),
});

// ── Pedidos ───────────────────────────────────────────────
export const orderSchema = z.object({
  customer_name:    z.string().min(2).max(100),
  customer_email:   z.string().email(),
  customer_phone:   z.string().min(8).max(20),
  shipping_address: z.string().min(10),
  city:             z.string().min(2),
  notes:            z.string().max(500).optional(),
  sinpe_phone:      z.string().min(8).max(20).optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity:   z.number().int().positive(),
  })).min(1, 'El carrito no puede estar vacío'),
});

// ── Estado de pedido ──────────────────────────────────────
export const orderStatusSchema = z.object({
  status:      z.enum(['pending', 'confirmed', 'shipped', 'completed', 'cancelled']),
  admin_notes: z.string().max(500).optional(),
});

// ── Testimonio ────────────────────────────────────────────
export const testimonialSchema = z.object({
  order_id:    z.string().uuid(),
  author_name: z.string().min(2).max(80),
  text:        z.string().min(10).max(600),
  stars:       z.number().int().min(1).max(5),
});
