// components/admin/ImageGalleryEditor.jsx
// Editor de galería de imágenes para el formulario de producto.
// Soporta: subir múltiples imágenes, asignar color desde las variantes definidas,
// marcar la imagen principal y eliminar.
//
// Props:
//   images   — array de items { file?, preview, url?, id?, color_name, color_hex, is_primary }
//   variants — array de variantes { color_name, color_hex } — fuente de colores disponibles
//   onChange — (images) => void

import { useRef } from 'react';
import styles from './ImageGalleryEditor.module.css';

export function ImageGalleryEditor({ images = [], variants = [], onChange }) {
  const inputRef = useRef(null);

  const addFiles = (files) => {
    const newItems = Array.from(files).map((file, i) => ({
      file,
      preview: URL.createObjectURL(file),
      color_name: '',
      color_hex:  '',
      is_primary: images.length === 0 && i === 0,
    }));
    onChange([...images, ...newItems]);
  };

  const remove = (index) => {
    const next = images.filter((_, i) => i !== index);
    if (images[index]?.is_primary && next.length > 0) {
      next[0] = { ...next[0], is_primary: true };
    }
    onChange(next);
  };

  const setPrimary = (index) => {
    onChange(images.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  // Al seleccionar un color del dropdown, sincroniza name + hex automáticamente
  const handleColorSelect = (index, colorName) => {
    if (!colorName) {
      onChange(images.map((img, i) =>
        i === index ? { ...img, color_name: '', color_hex: '' } : img
      ));
      return;
    }
    const variant = variants.find(v => v.color_name === colorName);
    onChange(images.map((img, i) =>
      i === index
        ? { ...img, color_name: colorName, color_hex: variant?.color_hex ?? '' }
        : img
    ));
  };

  const onDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const hasVariants = variants.length > 0;

  return (
    <div className={styles.root}>
      {/* Drop zone */}
      <div
        className={styles.dropzone}
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Agregar imágenes"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={e => addFiles(e.target.files)}
        />
        <IconUpload />
        <p className={styles.dropzoneText}>
          Arrastrá imágenes aquí o <span>hacé click</span>
        </p>
        <p className={styles.dropzoneHint}>JPG, PNG, WebP · Máx 5 MB · Hasta 10 imágenes</p>
      </div>

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <ul className={styles.grid} role="list">
          {images.map((img, i) => (
            <li
              key={i}
              className={`${styles.item} ${img.is_primary ? styles.itemPrimary : ''}`}
            >
              {/* Thumbnail */}
              <div className={styles.thumb}>
                <img
                  src={img.preview ?? img.url}
                  alt={img.color_name || `Imagen ${i + 1}`}
                  className={styles.thumbImg}
                />

                <div className={styles.thumbActions}>
                  <button
                    type="button"
                    className={`${styles.thumbBtn} ${img.is_primary ? styles.thumbBtnActive : ''}`}
                    onClick={() => setPrimary(i)}
                    title={img.is_primary ? 'Imagen principal' : 'Marcar como principal'}
                  >
                    <IconStar filled={img.is_primary} />
                  </button>
                  <button
                    type="button"
                    className={`${styles.thumbBtn} ${styles.thumbBtnDanger}`}
                    onClick={() => remove(i)}
                    title="Eliminar"
                  >
                    <IconTrash />
                  </button>
                </div>

                {img.is_primary && (
                  <span className={styles.primaryBadge}>Principal</span>
                )}
              </div>

              {/* Selector de color */}
              <div className={styles.colorRow}>
                {/* Swatch del color actual */}
                <div
                  className={styles.colorSwatch}
                  style={{ background: img.color_hex || 'transparent' }}
                  title={img.color_name || 'Sin color'}
                />

                {hasVariants ? (
                  /* Dropdown con los colores ya definidos en Variantes */
                  <select
                    className={styles.colorSelect}
                    value={img.color_name}
                    onChange={e => handleColorSelect(i, e.target.value)}
                  >
                    <option value="">Sin color</option>
                    {variants.map(v => (
                      <option key={v.color_name} value={v.color_name}>
                        {v.color_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  /* Sin variantes definidas aún — texto libre */
                  <span className={styles.noVariantsHint}>
                    Definí colores primero ↑
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
  </svg>
);

const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
  </svg>
);

const IconStar = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
