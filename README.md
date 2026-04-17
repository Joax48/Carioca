# Carioca — Tienda de Ropa Deportiva

E-commerce completo para **Carioca Practice Wear**, una marca costarricense de ropa deportiva femenina. Incluye tienda pública, carrito, checkout con SINPE Móvil, panel de administración y blog.

**Producción:** [https://carioca-five.vercel.app](https://carioca-five.vercel.app)

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + CSS Modules |
| Backend | Node.js + Express |
| Base de datos | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase OAuth (Google) + JWT admin |
| Deploy frontend | Vercel |
| Deploy backend | Render |
| Email | Nodemailer (Gmail SMTP) |

---

## Estructura del proyecto

```
Carioca/
├── frontend/          # React app (Vite)
│   ├── src/
│   │   ├── components/   # Layout, catálogo, carrito, UI
│   │   ├── pages/        # Todas las páginas + admin CMS
│   │   ├── stores/       # Zustand (carrito, auth)
│   │   ├── services/     # Llamadas a la API
│   │   ├── hooks/        # Custom hooks
│   │   └── styles/       # Variables CSS globales
│   └── vercel.json       # Rewrites + headers CSP
│
└── backend/           # Express API
    └── src/
        ├── controllers/  # Lógica de cada endpoint
        ├── routes/       # Definición de rutas
        ├── middleware/   # Auth, error handling, upload
        ├── services/     # Upload a Supabase Storage, email
        └── config/       # Cliente de Supabase
```

---

## Correr localmente

### Requisitos

- Node.js 18+
- Una cuenta de Supabase con las tablas creadas

### 1. Clonar

```bash
git clone https://github.com/tu-usuario/carioca.git
cd carioca
```

### 2. Backend

```bash
cd backend
npm install
```

Crear el archivo `backend/.env` con:

```env
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=genera-una-clave-aleatoria-larga
JWT_EXPIRES_IN=7d

# Supabase (Dashboard → Settings → API)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-role-key

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Email (Gmail con contraseña de aplicación)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="Carioca <tu-correo@gmail.com>"
STORE_SINPE=88888888
```

Iniciar el servidor:

```bash
npm run dev
```

La API queda en `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend
npm install
```

Crear el archivo `frontend/.env.local` con:

```env
VITE_API_URL=http://localhost:4000/api

VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# Opcional: URL pública del video hero (mp4 en Supabase Storage)
VITE_HERO_VIDEO_URL=
```

Iniciar el frontend:

```bash
npm run dev
```

La app queda en `http://localhost:5173`.

---

## Deployment

### Frontend — Vercel

El frontend está desplegado en **Vercel** con deploy automático desde la rama `main`.

- **URL:** [https://carioca-five.vercel.app](https://carioca-five.vercel.app)
- `vercel.json` configura los rewrites de SPA (todas las rutas apuntan a `index.html`) y los headers de seguridad (CSP, HSTS, etc.)
- Las variables de entorno se configuran en **Vercel → Settings → Environment Variables**

Variables necesarias en Vercel:
```
VITE_API_URL=https://tu-api.onrender.com/api
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_HERO_VIDEO_URL=...  (opcional)
```

### Backend — Render

El backend está desplegado en **Render** como un Web Service.

- **Build command:** `npm install`
- **Start command:** `npm start`
- El plan gratuito de Render apaga el servidor tras ~15 min de inactividad. Para evitar cold starts, se recomienda configurar un ping periódico con [cron-job.org](https://cron-job.org) apuntando a `/health` cada 10 minutos.

Variables de entorno a configurar en Render: las mismas que en `backend/.env` (sin `PORT`, Render lo asigna automáticamente).

---

## Funcionalidades principales

**Tienda pública**
- Catálogo con filtros por colección
- Página de producto con galería, selector de color/talla y stock en tiempo real
- Carrito persistente (Zustand)
- Checkout con envío por correo o retiro, pago por SINPE Móvil
- Login con Google → 5% de descuento automático en pedidos
- Guía de tallas en `/guia-de-tallas`
- Blog editorial
- Página Sobre Nosotros

**Panel de administración** (`/admin`)
- CRUD de productos (con variantes de color, stock por talla, imágenes)
- Paleta de colores guardados entre productos
- CRUD de colecciones
- Gestión de pedidos y cambio de estado
- Moderación de testimonios
- Blog con editor de contenido e imágenes
- Producto destacado en el hero del home

---

## Comandos útiles

```bash
# Frontend
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build

# Backend
npm run dev        # Servidor con hot-reload (node --watch)
npm start          # Servidor de producción
```
