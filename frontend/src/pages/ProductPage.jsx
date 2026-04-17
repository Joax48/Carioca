/* ─────────────────────────────────────────
   ProductPage — página de detalle de producto
   Galería, selector de talla, cantidad,
   agregar al carrito y compra directa.
───────────────────────────────────────── */

import { useState, useMemo } from 'react';
import { useParams }          from 'react-router-dom';
import { Navbar, Footer }     from '../components/layout';
import { Breadcrumb }         from '../components/catalog/Breadcrumb';
import { ImageGallery }       from '../components/catalog/ImageGallery';
import { ColorSwatch }        from '../components/catalog/ColorSwatch';
import { SizeSelector, DEFAULT_SIZES } from '../components/catalog/SizeSelector';
import { QuantitySelector }   from '../components/catalog/QuantitySelector';
import { CatalogGrid }        from '../components/catalog/CatalogGrid';
import { Button, SectionLabel } from '../components/ui';
import { useProduct }         from '../hooks/useProducts';
import { useProducts }        from '../hooks/useProducts';
import { useCart }            from '../stores/useCart';
import styles from './ProductPage.module.css';

/* ── Trust accordion ── */
const TRUST_ITEMS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    label: 'Pago por SINPE Móvil',
    body: 'Realizamos el cobro por SINPE Móvil de forma rápida y segura. Te enviamos el número de teléfono al confirmar tu pedido.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3" width="15" height="13"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    label: 'Envíos a todo Costa Rica',
    body: 'Enviamos a nivel nacional a través de mensajería privada. También podés recoger tu pedido en nuestra tienda física en Pozos de Santa Ana.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-4.6"/>
      </svg>
    ),
    label: 'Devoluciones en 7 días',
    body: 'Si el producto no cumple tus expectativas, aceptamos devoluciones dentro de los 7 días posteriores a la entrega. El artículo debe estar sin usar y con etiqueta.',
  },
];

function TrustAccordion() {
  const [open, setOpen] = useState(null);
  return (
    <div className={styles.trust}>
      {TRUST_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={`${styles.trustItem} ${isOpen ? styles.trustItemOpen : ''}`}>
            <button
              className={styles.trustTrigger}
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className={styles.trustIcon}>{item.icon}</span>
              <span className={styles.trustLabel}>{item.label}</span>
              <span className={`${styles.trustChevron} ${isOpen ? styles.trustChevronOpen : ''}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </button>
            {isOpen && (
              <p className={styles.trustBody}>{item.body}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ProductPage() {
  const { slug }    = useParams();
  const { addItem, open: openCart } = useCart();

  const { data: product, loading, error } = useProduct(slug);

  const [selectedSize,  setSelectedSize]  = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity,      setQuantity]      = useState(1);
  const [addedMsg,      setAddedMsg]      = useState(false);
  const [sizeError,     setSizeError]     = useState(false);
  const [colorError,    setColorError]    = useState(false);

  const hasVariants = (product?.variants?.length ?? 0) > 0;
  const hasSizes    = hasVariants
    ? product.variants.some(v => Object.keys(v.sizes ?? {}).length > 0)
    : Object.keys(product?.sizes ?? {}).length > 0;

  /* Variante seleccionada (para su sizes map) */
  const selectedVariant = useMemo(() =>
    product?.variants?.find(v => v.color_name === selectedColor) ?? null,
    [product?.variants, selectedColor]
  );

  /* Tallas con stock: usa sizes de la variante seleccionada, o product.sizes como fallback */
  const availableSizes = useMemo(() => {
    const sizesMap = selectedVariant?.sizes ?? product?.sizes ?? {};
    const hasStock = Object.keys(sizesMap).length > 0;
    return DEFAULT_SIZES.map(s => ({
      ...s,
      available: hasStock ? (sizesMap[s.label] ?? 0) > 0 : true,
    }));
  }, [selectedVariant, product?.sizes]);

  /* Stock máximo para la talla seleccionada */
  const maxStock = useMemo(() => {
    if (!selectedSize) return 99;
    const sizesMap = selectedVariant?.sizes ?? product?.sizes ?? {};
    return sizesMap[selectedSize] ?? 99;
  }, [selectedSize, selectedVariant, product?.sizes]);

  /* Índice de la primera imagen del color seleccionado */
  const colorImageIndex = useMemo(() => {
    if (!selectedColor || !product?.images) return undefined;
    const idx = product.images.findIndex(img => img.color_name === selectedColor);
    return idx >= 0 ? idx : undefined;
  }, [product?.images, selectedColor]);

  /* Color hex del seleccionado (para cart) */
  const selectedColorHex = useMemo(() =>
    product?.variants?.find(v => v.color_name === selectedColor)?.color_hex ?? null,
    [product?.variants, selectedColor]
  );

  /* Productos relacionados (misma colección) */
  const { data: related } = useProducts({
    collection: product?.collection?.id,
    limit: 4,
  });
  const relatedFiltered = related.filter(p => p.slug !== slug).slice(0, 4);

  /* ── Handlers ── */
  function validate() {
    let ok = true;
    if (hasVariants && !selectedColor) {
      setColorError(true);
      setTimeout(() => setColorError(false), 2000);
      ok = false;
    }
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      ok = false;
    }
    return ok;
  }

  const handleAddToCart = () => {
    if (!validate()) return;
    addItem(product, selectedSize, selectedColor, selectedColorHex, quantity);
    openCart();
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  const handleBuyNow = () => {
    if (!validate()) return;
    addItem(product, selectedSize, selectedColor, selectedColorHex, quantity);
    window.location.href = '/checkout';
  };

  /* ── Loading / Error states ── */
  if (loading) return <ProductSkeleton />;
  if (error || !product) return <ProductNotFound />;

  const hasDiscount  = Boolean(product.compare_price);
  const discount     = hasDiscount
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <div className={styles.container}>

          {/* ── Breadcrumb ── */}
          <Breadcrumb
            items={[
              { label: 'Inicio',   href: '/'          },
              { label: 'Catálogo', href: '/catalogo'  },
              ...(product.collection
                ? [{ label: product.collection.name, href: `/colecciones/${product.collection.slug}` }]
                : []),
              { label: product.name },
            ]}
          />

          {/* ── Layout principal: galería + info ── */}
          <div className={styles.layout}>

            {/* Galería */}
            <div className={styles.gallery}>
              <ImageGallery images={product.images ?? []} name={product.name} activeIndex={colorImageIndex} />
            </div>

            {/* Info del producto */}
            <div className={styles.info}>

              {/* Colección y tag */}
              <div className={styles.meta}>
                {product.collection && (
                  <a
                    href={`/colecciones/${product.collection.slug}`}
                    className={styles.collectionLink}
                  >
                    {product.collection.name}
                  </a>
                )}
                {product.tag && (
                  <span className={styles.tag}>{product.tag}</span>
                )}
              </div>

              {/* Nombre */}
              <h1 className={styles.name}>{product.name}</h1>

              {/* Precio */}
              <div className={styles.priceBlock}>
                <span className={styles.price}>
                  ₡{Number(product.price).toLocaleString('es-CR')}
                </span>
                {hasDiscount && (
                  <>
                    <span className={styles.comparePrice}>
                      ₡{Number(product.compare_price).toLocaleString('es-CR')}
                    </span>
                    <span className={styles.discountBadge}>−{discount}%</span>
                  </>
                )}
              </div>

              {/* Descripción */}
              {product.description && (
                <p className={styles.description}>{product.description}</p>
              )}

              <div className={styles.divider} />

              {/* Selector de color */}
              {hasVariants && (
                <>
                  <div className={colorError ? styles.sizeErrorShake : ''}>
                    <ColorSwatch
                      variants={product.variants}
                      selectedColor={selectedColor}
                      onSelect={c => { setSelectedColor(c); setColorError(false); setSelectedSize(''); }}
                    />
                    {colorError && (
                      <p className={styles.sizeErrorMsg}>
                        Por favor seleccioná un color
                      </p>
                    )}
                  </div>
                  <div className={styles.divider} />
                </>
              )}

              {/* Selector de talla */}
              {hasSizes && (
              <div className={sizeError ? styles.sizeErrorShake : ''}>
                <SizeSelector
                  sizes={availableSizes}
                  selected={selectedSize}
                  onSelect={size => { setSelectedSize(size); setSizeError(false); }}
                />
                {sizeError && (
                  <p className={styles.sizeErrorMsg}>
                    Por favor seleccioná una talla
                  </p>
                )}
              </div>
              )}

              {(hasVariants || hasSizes) && <div className={styles.divider} />}

              {/* Cantidad */}
              <div className={styles.quantityRow}>
                <span className={styles.quantityLabel}>Cantidad</span>
                <QuantitySelector
                  value={quantity}
                  max={maxStock}
                  onChange={setQuantity}
                />
              </div>

              {/* CTAs */}
              <div className={styles.actions}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddToCart}
                  className={styles.btnCart}
                >
                  {addedMsg ? '¡Agregado! ✓' : 'Agregar al carrito'}
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBuyNow}
                  className={styles.btnBuy}
                >
                  Comprar ahora
                </Button>
              </div>

              {/* Trust signals */}
              <TrustAccordion />

            </div>
          </div>

          {/* ── Productos relacionados ── */}
          {relatedFiltered.length > 0 && (
            <section className={styles.related}>
              <div className={styles.relatedHeader}>
                <SectionLabel>También te puede gustar</SectionLabel>
              </div>
              <CatalogGrid products={relatedFiltered} columns={4} />
            </section>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}

/* ── Loading skeleton ── */
function ProductSkeleton() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={`${styles.container} ${styles.skeletonLayout}`}>
          <div className={styles.skeletonGallery} />
          <div className={styles.skeletonInfo}>
            <div className={styles.skeletonLine} style={{ width: '40%', height: 12 }} />
            <div className={styles.skeletonLine} style={{ width: '70%', height: 28 }} />
            <div className={styles.skeletonLine} style={{ width: '30%', height: 24 }} />
            <div className={styles.skeletonLine} style={{ width: '100%', height: 80 }} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ── Not found ── */
function ProductNotFound() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.notFound}>
          <h1 className={styles.notFoundTitle}>Producto no encontrado</h1>
          <p className={styles.notFoundSub}>
            Este producto no existe o fue removido.
          </p>
          <Button href="/catalogo" variant="primary">
            Ver catálogo
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
