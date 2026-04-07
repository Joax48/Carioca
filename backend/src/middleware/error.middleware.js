
// ── Envuelve handlers async para no repetir try/catch ───
export const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ── Handler global de errores ────────────────────────────
// Debe registrarse ÚLTIMO en Express (4 parámetros)
export function errorHandler(err, req, res, next) {
  // Errores de validación de Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Error conocido con statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Error inesperado — no exponer detalles en producción
  console.error('[ERROR]', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
  });
}

// ── Crear errores con statusCode ─────────────────────────
export function createError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}
