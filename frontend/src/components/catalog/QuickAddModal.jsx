/* ─────────────────────────────────────────
   QuickAddModal — selección rápida de
   color, talla y cantidad desde el catálogo.
   Se abre al hacer clic en "Agregar al carrito"
   en cualquier tarjeta de producto.
───────────────────────────────────────── */

import { useState, useMemo, useEffect } from 'react';
import { useCart }   from '../../stores/useCart';
import { ColorSwatch } from './ColorSwatch';
import { DEFAULT_SIZES } from './SizeSelector';
import styles from './QuickAddModal.module.css';

export function QuickAddModal({ product, onClose }) {
  const { addItem, open: openCart } = useCart();

  const hasVariants  = (product?.variants?.length ?? 0) > 0;
  const hasSizes     = hasVariants
    ? product.variants.some(v => Object.keys(v.sizes ?? {}).length > 0)
    : Object.keys(product?.sizes ?? {}).length > 0;
  const primaryImage = product?.images?.find(i => i.is_primary) ?? product?.images?.[0];

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize,  setSelectedSize]  = useState('');
  const [quantity,      setQuantity]      = useState(1);
  const [colorError,    setColorError]    = useState(false);
  const [sizeError,     setSizeError]     = useState(false);
  const [added,         setAdded]         = useState(false);

  /* Cerrar con Escape */
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  /* Variante seleccionada */
  const selectedVariant = useMemo(() =>
    product?.variants?.find(v => v.color_name === selectedColor) ?? null,
    [product?.variants, selectedColor]
  );

  /* Color hex para guardar en el carrito */
  const selectedColorHex = selectedVariant?.color_hex ?? null;

  /* Tallas disponibles según color seleccionado */
  const availableSizes = useMemo(() => {
    const sizesMap = selectedVariant?.sizes ?? product?.sizes ?? {};
    const hasStock  = Object.keys(sizesMap).length > 0;
    return DEFAULT_SIZES.map(s => ({
      ...s,
      available: hasStock ? (sizesMap[s.label] ?? 0) > 0 : true,
    }));
  }, [selectedVariant, product?.sizes]);

  /* Imagen activa según color */
  const activeImage = useMemo(() => {
    if (!selectedColor || !product?.images) return primaryImage;
    const colorImg = product.images.find(img => img.color_name === selectedColor);
    return colorImg ?? primaryImage;
  }, [selectedColor, product?.images, primaryImage]);

  function handleAdd() {
    let ok = true;
    if (hasVariants && !selectedColor) {
      setColorError(true);
      setTimeout(() => setColorError(false), 1800);
      ok = false;
    }
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 1800);
      ok = false;
    }
    if (!ok) return;

    addItem(product, selectedSize, selectedColor, selectedColorHex, quantity);
    setAdded(true);
    setTimeout(() => {
      onClose();
      openCart();
    }, 600);
  }

  if (!product) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Agregar al carrito">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Botón cerrar */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
          <IconClose />
        </button>

        <div className={styles.layout}>
          {/* Imagen */}
          <div className={styles.imageCol}>
            {activeImage
              ? <img src={activeImage.url} alt={activeImage.alt_text ?? product.name} className={styles.image} />
              : <div className={styles.imageFallback} />
            }
          </div>

          {/* Selectores */}
          <div className={styles.infoCol}>
            {product.collection && (
              <p className={styles.collection}>{product.collection.name}</p>
            )}
            <h2 className={styles.name}>{product.name}</h2>
            <p className={styles.price}>
              ₡{Number(product.price).toLocaleString('es-CR')}
              {product.compare_price && (
                <span className={styles.comparePrice}>
                  ₡{Number(product.compare_price).toLocaleString('es-CR')}
                </span>
              )}
            </p>

            <div className={styles.divider} />

            {/* Color */}
            {hasVariants && (
              <div className={colorError ? styles.shakeError : ''}>
                <ColorSwatch
                  variants={product.variants}
                  selectedColor={selectedColor}
                  onSelect={c => { setSelectedColor(c); setSizeError(false); setSelectedSize(''); }}
                />
                {colorError && <p className={styles.errorMsg}>Seleccioná un color</p>}
              </div>
            )}

            {/* Talla */}
            {hasSizes && (
              <div className={sizeError ? styles.shakeError : ''}>
                <div className={styles.sizeHeader}>
                  <span className={styles.sizeLabel}>
                    Talla{selectedSize && <span className={styles.sizeSelected}> — {selectedSize}</span>}
                  </span>
                  <a href="/guia-de-tallas" className={styles.sizeGuide} tabIndex={-1}>
                    Guía de tallas
                  </a>
                </div>
                <div className={styles.sizeGrid}>
                  {availableSizes.map(size => (
                    <button
                      key={size.label}
                      disabled={!size.available}
                      onClick={() => { setSelectedSize(size.label); setSizeError(false); }}
                      className={[
                        styles.sizeBtn,
                        selectedSize === size.label && styles.sizeBtnActive,
                        !size.available && styles.sizeBtnOut,
                      ].filter(Boolean).join(' ')}
                      aria-pressed={selectedSize === size.label}
                      aria-label={`${size.label}${!size.available ? ' — agotada' : ''}`}
                    >
                      {size.label}
                      {!size.available && <span className={styles.sizeBtnSlash} aria-hidden="true" />}
                    </button>
                  ))}
                </div>
                {sizeError && <p className={styles.errorMsg}>Seleccioná una talla</p>}
              </div>
            )}

            {/* Cantidad */}
            <div className={styles.qtyRow}>
              <span className={styles.sizeLabel}>Cantidad</span>
              <div className={styles.qtyControl}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Reducir"
                >−</button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity(q => q + 1)}
                  aria-label="Aumentar"
                >+</button>
              </div>
            </div>

            {/* Botón agregar */}
            <button
              className={`${styles.addBtn} ${added ? styles.addBtnDone : ''}`}
              onClick={handleAdd}
              disabled={added}
            >
              {added ? '¡Agregado! ✓' : 'Agregar al carrito'}
            </button>

            {/* Link al producto completo */}
            <a href={`/productos/${product.slug}`} className={styles.fullLink}>
              Ver producto completo →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);
