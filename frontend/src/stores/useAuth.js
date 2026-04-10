// stores/useAuth.js
// Store unificado: admin (JWT cookie) + cliente (Supabase OAuth Google)

import { create } from 'zustand';
import { authService } from '../services';
import {
  signInWithGoogle,
  signOut as supabaseSignOut,
  onAuthStateChange,
  checkIfAdmin,
} from '../services/supabase.client';

export const useAuth = create((set, get) => ({
  user:        null,
  loading:     true,
  initialized: false,

  // ── Init: verifica sesión admin Y escucha cambios Supabase ──
  async init() {
    if (get().initialized) return;

    // 1. ¿Hay sesión admin activa (JWT cookie del backend)?
    try {
      const { user } = await authService.me();
      set({ user: { ...user, source: 'admin' } });
    } catch {
      // Sin sesión admin — OK
    }

    // 2. Escuchar cambios de Supabase (login OAuth, logout, refresh, etc.)
    onAuthStateChange(async (event, session) => {
      // Si ya hay admin por JWT, Supabase no lo pisa
      if (get().user?.source === 'admin') return;

      if (!session?.user) {
        set({ user: null, loading: false });
        return;
      }

      const su = session.user;

      // Solo al hacer login nuevo (no en recargas de página con sesión ya activa)
      // verificamos si el usuario de Google es también admin en la BD
      if (event === 'SIGNED_IN') {
        const adminRole = await checkIfAdmin(su.id);
        if (adminRole) {
          set({
            user: {
              id:     su.id,
              email:  su.email,
              name:   su.user_metadata?.full_name ?? su.email,
              avatar: su.user_metadata?.avatar_url ?? null,
              role:   adminRole,
              source: 'supabase',
            },
            loading: false,
          });
          // Redirigir al panel admin solo si no estamos ya ahí
          if (!window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin';
          }
          return;
        }
      }

      // Usuario cliente normal (o recarga con sesión ya activa)
      set({
        user: {
          id:     su.id,
          email:  su.email,
          name:   su.user_metadata?.full_name ?? su.email,
          avatar: su.user_metadata?.avatar_url ?? null,
          role:   'client',
          source: 'supabase',
        },
        loading: false,
      });
    });

    set({ loading: false, initialized: true });
  },

  // ── Login admin (email + password) ──────────────────────
  async login(email, password) {
    const { user } = await authService.login({ email, password });
    set({ user: { ...user, source: 'admin' } });
    return user;
  },

  // ── Login cliente (Google OAuth) ─────────────────────────
  async loginWithGoogle(redirectTo = window.location.origin) {
    await signInWithGoogle(redirectTo);
  },

  // ── Logout (admin o cliente) ─────────────────────────────
  async logout() {
    const { user } = get();
    if (user?.source === 'admin')    await authService.logout();
    if (user?.source === 'supabase') await supabaseSignOut();
    set({ user: null });
  },

  // ── Computed helpers ─────────────────────────────────────
  get isAdmin() {
    return get().user?.role === 'admin';
  },

  get discountPct() {
    const u = get().user;
    return u && u.role === 'client' ? 10 : 0;
  },
}));
