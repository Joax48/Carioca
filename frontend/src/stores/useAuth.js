// Estado de autenticación del admin.

import { create } from 'zustand';
import { authService } from '../services';

export const useAuth = create((set, get) => ({
  user:        null,
  loading:     true,    // true hasta que se resuelva el check inicial
  initialized: false,

  // ── Verificar sesión al montar la app ────────────────
  async init() {
    if (get().initialized) return;
    try {
      const { user } = await authService.me();
      set({ user, loading: false, initialized: true });
    } catch {
      // No hay sesión activa — silencioso
      set({ user: null, loading: false, initialized: true });
    }
  },

  // ── Login ────────────────────────────────────────────
  async login(email, password) {
    const { user } = await authService.login({ email, password });
    set({ user });
    return user;
  },

  // ── Logout ───────────────────────────────────────────
  async logout() {
    await authService.logout();
    set({ user: null });
  },

  get isAdmin() {
    return get().user?.role === 'admin';
  },
}));
