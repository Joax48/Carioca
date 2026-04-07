
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import { loginSchema } from '../utils/schemas.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';

const COOKIE_OPTIONS = {
  httpOnly: true,       // JS nunca puede leer esta cookie
  secure:   process.env.NODE_ENV === 'production',  // solo HTTPS en prod
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 días en ms
};

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  // 1. Buscar usuario en Supabase Auth via service key
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) throw createError('Error de autenticación', 500);

  const authUser = users.find(u => u.email === email);
  if (!authUser) throw createError('Credenciales inválidas', 401);

  // 2. Verificar que es admin
  const { data: adminRecord } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (!adminRecord) throw createError('Credenciales inválidas', 401);

  // 3. Verificar contraseña
  // Supabase maneja el hash internamente — usamos signInWithPassword
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) throw createError('Credenciales inválidas', 401);

  // 4. Emitir JWT propio para el backend
  const token = jwt.sign(
    { id: authUser.id, email: authUser.email, role: adminRecord.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // 5. Enviar en cookie httpOnly
  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({ message: 'Sesión iniciada', user: { id: authUser.id, email, role: adminRecord.role } });
});

// POST /api/auth/logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ message: 'Sesión cerrada' });
});

// GET /api/auth/me — devuelve el usuario autenticado actual
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
