// Cliente Supabase para el FRONTEND.
// Solo usa la ANON key — nunca la service key.
// Uso principal: subir imágenes al Storage desde el CMS.

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Subir imagen al bucket 'product-images' ──────────────
// Retorna la URL pública del archivo subido.
export async function uploadProductImage(file, productId) {
  const ext      = file.name.split('.').pop();
  const filename = `${productId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename);

  return data.publicUrl;
}
