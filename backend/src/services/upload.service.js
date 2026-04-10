// services/upload.service.js
// Sube archivos binarios a Supabase Storage usando la service_role key.
// Al usar el cliente del backend (service_role) bypasea el RLS
// y evita el error "new row violates row-level security policy".

import supabase from '../config/supabase.js';
import { createError } from '../middleware/error.middleware.js';

const BUCKET = 'product-images';

// Extensiones permitidas → tipo MIME
const ALLOWED_TYPES = {
  'jpg':  'image/jpeg',
  'jpeg': 'image/jpeg',
  'png':  'image/png',
  'webp': 'image/webp',
  'avif': 'image/avif',
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Sube un Buffer/Uint8Array a Supabase Storage.
 *
 * @param {Buffer}  buffer      — contenido del archivo
 * @param {string}  originalName — nombre original del archivo
 * @param {string}  folder      — subcarpeta dentro del bucket (ej: "products/uuid")
 * @returns {string} URL pública del archivo subido
 */
export async function uploadToStorage(buffer, originalName, folder) {
  // Validar extensión
  const ext = originalName.split('.').pop()?.toLowerCase();
  const mimeType = ALLOWED_TYPES[ext];
  if (!mimeType) {
    throw createError(`Tipo de archivo no permitido: .${ext}. Solo JPG, PNG, WebP o AVIF.`, 400);
  }

  // Validar tamaño
  if (buffer.length > MAX_SIZE_BYTES) {
    throw createError('El archivo supera el límite de 5 MB.', 400);
  }

  // Nombre único para evitar colisiones
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw createError(`Error al subir imagen: ${error.message}`, 500);

  // URL pública
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

/**
 * Elimina un archivo del Storage a partir de su URL pública.
 * No lanza error si el archivo no existe.
 */
export async function deleteFromStorage(publicUrl) {
  try {
    // Extraer el path relativo desde la URL pública
    const url    = new URL(publicUrl);
    const prefix = `/storage/v1/object/public/${BUCKET}/`;
    const path   = url.pathname.startsWith(prefix)
      ? url.pathname.slice(prefix.length)
      : null;

    if (!path) return;

    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Silencioso — no crítico si falla el borrado
  }
}
