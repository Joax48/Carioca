// Estado global del carrito con Zustand.
// Persiste en localStorage automáticamente.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],   // [{ product, quantity }]

      // ── Getters ──────────────────────────────────────
      get count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
      get total() {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
      },

      // ── Actions ───────────────────────────────────────
      addItem(product, quantity = 1) {
        set(state => {
          const existing = state.items.find(i => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },

      removeItem(productId) {
        set(state => ({
          items: state.items.filter(i => i.product.id !== productId),
        }));
      },

      updateQuantity(productId, quantity) {
        if (quantity <= 0) return get().removeItem(productId);
        set(state => ({
          items: state.items.map(i =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clear() {
        set({ items: [] });
      },

      // Formatear items para enviar al backend
      toOrderItems() {
        return get().items.map(i => ({
          product_id: i.product.id,
          quantity:   i.quantity,
        }));
      },
    }),
    {
      name: 'carioca-cart',   // clave en localStorage
      // Solo persistir items, no funciones
      partialize: state => ({ items: state.items }),
    }
  )
);
