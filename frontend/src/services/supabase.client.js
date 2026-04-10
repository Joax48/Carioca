// services/supabase.client.js
// Cliente Supabase frontend — Google OAuth + sesión persistente.

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true, // detecta el hash OAuth al volver de Google
    },
  }
);

// ── Google OAuth ─────────────────────────────────────────
export async function signInWithGoogle(redirectTo = window.location.origin) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { access_type: 'offline', prompt: 'select_account' },
    },
  });
  if (error) throw new Error(error.message);
}

// signOut — exportado también como alias para compatibilidad
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
export { signOut as signOutClient };

// onAuthStateChange — pasa event + session al callback
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return data.subscription;
}

// Verifica si un user ID de Supabase está en la tabla admin_users
// Requiere RLS: allow select where auth.uid() = id
export async function checkIfAdmin(userId) {
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  return data?.role ?? null; // 'admin' | null
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
