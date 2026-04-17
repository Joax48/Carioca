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
import { useCart } from './useCart';

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

    // 2. Escuchar cambios de Supabase — mantiene loading:true hasta el primer evento
    let firstEvent = true;
    onAuthStateChange(async (event, session) => {
      // Si ya hay admin por JWT, Supabase no lo pisa
      if (get().user?.source === 'admin') {
        if (firstEvent) { firstEvent = false; set({ loading: false }); }
        return;
      }

      if (!session?.user) {
        firstEvent = false;
        set({ user: null, loading: false });
        return;
      }

      const su = session.user;

      if (event === 'SIGNED_IN') {
        const adminRole = await checkIfAdmin(su.id);
        if (adminRole) {
          firstEvent = false;
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
          const p = window.location.pathname;
          if (!p.startsWith('/admin') || p === '/admin/login') {
            window.location.href = '/admin';
          }
          return;
        }
      }

      // Usuario cliente normal (o recarga con sesión ya activa)
      firstEvent = false;
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

    set({ initialized: true }); // NO toca loading — lo maneja el callback de arriba
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
    useCart.getState().clear();
  },

}));
