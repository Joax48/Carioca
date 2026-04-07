-- ═══════════════════════════════════════════════════════
-- CARIOCA — Schema completo de Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- Orden: extensions → tablas → índices → RLS → triggers → storage
-- ═══════════════════════════════════════════════════════

-- ── Extensiones necesarias ──────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUIDs
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- búsqueda full-text

-- ═══════════════════════════════════════════════════════
-- TABLAS
-- ═══════════════════════════════════════════════════════

-- ── 1. Colecciones ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Productos ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id   UUID REFERENCES collections(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  compare_price   NUMERIC(10,2),                  -- precio tachado opcional
  tag             TEXT,                            -- "Nuevo", "Top", etc.
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Imágenes de producto (relación 1-N) ──────────────
CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,          -- URL pública del Storage de Supabase
  alt_text    TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Usuarios / clientes ──────────────────────────────
-- Extiende auth.users de Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  phone      TEXT,
  address    TEXT,
  city       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Pedidos ──────────────────────────────────────────
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Snapshot de datos del cliente al momento del pedido
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city            TEXT NOT NULL,
  -- Financiero
  subtotal        NUMERIC(10,2) NOT NULL,
  shipping_cost   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  -- Estado
  status          order_status NOT NULL DEFAULT 'pending',
  -- SINPE
  sinpe_phone     TEXT,                -- número al que transfirió
  sinpe_confirmed_at TIMESTAMPTZ,      -- cuándo el admin confirmó
  -- Notas
  notes           TEXT,
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. Líneas de pedido ─────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  -- Snapshot del producto al momento del pedido
  product_name  TEXT NOT NULL,
  product_price NUMERIC(10,2) NOT NULL,
  quantity      INT NOT NULL CHECK (quantity > 0),
  subtotal      NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. Testimonios ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID UNIQUE REFERENCES orders(id) ON DELETE SET NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  text        TEXT NOT NULL,
  stars       INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  is_approved BOOLEAN NOT NULL DEFAULT false,  -- el admin aprueba antes de publicar
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. Administradores ──────────────────────────────────
-- Roles: 'admin' tiene acceso total al CMS
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- ÍNDICES — performance en queries frecuentes
-- ═══════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_products_collection  ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_active      ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_prod  ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user          ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created       ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);

-- Full-text search en productos
CREATE INDEX IF NOT EXISTS idx_products_fts ON products
  USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- ═══════════════════════════════════════════════════════
-- TRIGGERS — updated_at automático
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_collections_updated BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger: cuando se crea un auth.user → crear perfil vacío automáticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Regla base: negar todo por defecto, permitir explícitamente
-- ═══════════════════════════════════════════════════════

ALTER TABLE collections     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users     ENABLE ROW LEVEL SECURITY;

-- Helper: saber si el usuario actual es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Colecciones — lectura pública, escritura solo admin ─
CREATE POLICY "collections_public_read" ON collections
  FOR SELECT USING (is_active = true);

CREATE POLICY "collections_admin_all" ON collections
  FOR ALL USING (is_admin());

-- ── Productos — lectura pública, escritura solo admin ───
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (is_admin());

-- ── Imágenes de producto ─────────────────────────────────
CREATE POLICY "product_images_public_read" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "product_images_admin_all" ON product_images
  FOR ALL USING (is_admin());

-- ── Perfiles — cada usuario ve y edita el suyo ───────────
CREATE POLICY "profiles_own_read" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_own_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (is_admin());

-- ── Pedidos — el usuario ve los suyos, admin ve todos ───
CREATE POLICY "orders_own_read" ON orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "orders_own_insert" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (is_admin());

-- ── Líneas de pedido — heredan acceso del pedido ────────
CREATE POLICY "order_items_own_read" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "order_items_own_insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "order_items_admin_all" ON order_items
  FOR ALL USING (is_admin());

-- ── Testimonios — aprobados visibles para todos ─────────
CREATE POLICY "testimonials_approved_read" ON testimonials
  FOR SELECT USING (is_approved = true);

CREATE POLICY "testimonials_own_insert" ON testimonials
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "testimonials_admin_all" ON testimonials
  FOR ALL USING (is_admin());

-- ── Admin users — solo admins pueden verse ──────────────
CREATE POLICY "admin_users_admin_only" ON admin_users
  FOR ALL USING (is_admin());

-- ═══════════════════════════════════════════════════════
-- STORAGE — buckets para imágenes
-- ═══════════════════════════════════════════════════════

-- Crear bucket "product-images" (público para lectura)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública de imágenes
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Solo admins pueden subir/borrar imágenes
CREATE POLICY "product_images_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

-- ═══════════════════════════════════════════════════════
-- DATOS INICIALES — admin por defecto
-- Reemplazar el UUID con usuario en Supabase Auth
-- ═══════════════════════════════════════════════════════

-- INSERT INTO admin_users (id) VALUES ('TU-UUID-DE-AUTH-USER-AQUI');
