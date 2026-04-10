// middleware/upload.middleware.js
// Parsea multipart/form-data usando multer (memoria, sin disco).
// El buffer llega listo para ser enviado a Supabase Storage.

import multer from 'multer';

const storage = multer.memoryStorage(); // buffer en RAM, sin escribir a disco

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo no permitido: ${file.mimetype}`), false);
  }
};

// Para subir una imagen (colecciones, imagen principal)
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');   // campo del form se llama "image"

// Para subir hasta 10 imágenes (galería de producto)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
}).array('images', 10);  // campo del form se llama "images"

// Wrapper async para usar con asyncHandler
export const withUploadSingle   = (req, res) => new Promise((ok, fail) => uploadSingle(req, res, e => e ? fail(e) : ok()));
export const withUploadMultiple = (req, res) => new Promise((ok, fail) => uploadMultiple(req, res, e => e ? fail(e) : ok()));
