
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

// ── Verifica JWT en cookie httpOnly ──────────────────────
export async function requireAuth(req, res, next) {
  // 1. Buscar token en cookie httpOnly primero, luego en header
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;   // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// ── Solo admins ──────────────────────────────────────────
export async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    // Verificar en BD que sigue siendo admin (por si fue removido)
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', req.user.id)
      .single();

    if (!data) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
  });
}
