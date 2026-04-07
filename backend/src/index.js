//  entry point del backend Carioca

import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Seguridad: headers HTTP seguros ─────────────────────
app.use(helmet());

// ── CORS: solo orígenes autorizados ─────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej: Postman en dev) o de orígenes en lista
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origen no permitido — ${origin}`));
  },
  credentials: true,   // necesario para cookies httpOnly
}));

// ── Parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// ── Rate limiting global ─────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
}));

// Rate limit estricto en login (prevenir brute force)
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de login.' },
}));

// ── Rutas ────────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ─────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

// ── 404 ──────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Ruta no encontrada: ${req.path}` }));

// ── Error handler global (debe ir último) ────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✓ Carioca API corriendo en http://localhost:${PORT}`);
  console.log(`  Entorno: ${process.env.NODE_ENV}`);
});
