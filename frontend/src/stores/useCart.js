// stores/useCart.js
// Carrito con persistencia. Ítems identificados por (productId + size + color).

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function makeKey(productId, size, colorName) {
  return `${productId}__${size}__${colorName ?? ''}`;
}

export const useCart = create(
  persist(
    (set, get) => ({
      items:  [],    // [{ key, product, size, colorName, colorHex, quantity }]
      isOpen: false,

      // ── Drawer ───────────────────────────────────────
      open()  { set({ isOpen: true });  },
      close() { set({ isOpen: false }); },


      // ── Actions ───────────────────────────────────────
      addItem(product, size, colorName, colorHex, quantity = 1) {
        const key = makeKey(product.id, size, colorName);
        set(state => {
          const existing = state.items.find(i => i.key === key);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            items: [...state.items, { key, product, size, colorName, colorHex, quantity }],
          };
        });
      },

      removeItem(key) {
        set(state => ({ items: state.items.filter(i => i.key !== key) }));
      },

      updateQuantity(key, quantity) {
        if (quantity <= 0) { get().removeItem(key); return; }
        set(state => ({
          items: state.items.map(i => i.key === key ? { ...i, quantity } : i),
        }));
      },

      clear() { set({ items: [] }); },

      // Para el backend
      toOrderItems() {
        return get().items.map(i => ({
          product_id: i.product.id,
          quantity:   i.quantity,
          size:       i.size,
          color:      i.colorName,
        }));
      },
    }),
    {
      name: 'carioca-cart-v2',
      partialize: state => ({ items: state.items }),
    }
  )
);
