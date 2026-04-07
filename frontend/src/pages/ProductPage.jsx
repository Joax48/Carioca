/* ─────────────────────────────────────────
   ProductPage — página de detalle de producto
   Galería, selector de talla, cantidad,
   agregar al carrito y compra directa.
───────────────────────────────────────── */

import { useState }           from 'react';
import { useParams }          from 'react-router-dom';
import { Navbar, Footer }     from '../components/layout';
import { Breadcrumb }         from '../components/catalog/Breadcrumb';
import { ImageGallery }       from '../components/catalog/ImageGallery';
import { SizeSelector, DEFAULT_SIZES } from '../components/catalog/SizeSelector';
import { QuantitySelector }   from '../components/catalog/QuantitySelector';
import { CatalogGrid }        from '../components/catalog/CatalogGrid';
import { Button, SectionLabel } from '../components/ui';
import { useProduct }         from '../hooks/useProducts';
import { useProducts }        from '../hooks/useProducts';
import { useCart }            from '../stores/useCart';
import styles from './ProductPage.module.css';

export function ProductPage() {
  const { slug }    = useParams();
  const addItem     = useCart(s => s.addItem);

  const { data: product, loading, error } = useProduct(slug);

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity,     setQuantity]     = useState(1);
  const [addedMsg,     setAddedMsg]     = useState(false);
  const [sizeError,    setSizeError]    = useState(false);

  /* Productos relacionados (misma colección) */
  const { data: related } = useProducts({
    collection: product?.collection?.id,
    limit: 4,
  });
  const relatedFiltered = related.filter(p => p.slug !== slug).slice(0, 4);

  /* ── Handlers ── */
  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    addItem({ ...product, selectedSize }, quantity);
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2000);
      return;
    }
    addItem({ ...product, selectedSize }, quantity);
    window.location.href = '/checkout';
  };

  /* ── Loading / Error states ── */
  if (loading) return <ProductSkeleton />;
  if (error || !product) return <ProductNotFound />;

  const images       = product.images ?? [];
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
              <ImageGallery images={images} name={product.name} />
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

              {/* Selector de talla */}
              <div className={sizeError ? styles.sizeErrorShake : ''}>
                <SizeSelector
                  sizes={DEFAULT_SIZES}
                  selected={selectedSize}
                  onSelect={size => { setSelectedSize(size); setSizeError(false); }}
                />
                {sizeError && (
                  <p className={styles.sizeErrorMsg}>
                    Por favor seleccioná una talla
                  </p>
                )}
              </div>

              <div className={styles.divider} />

              {/* Cantidad */}
              <div className={styles.quantityRow}>
                <span className={styles.quantityLabel}>Cantidad</span>
                <QuantitySelector
                  value={quantity}
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
              <ul className={styles.trust}>
                <li className={styles.trustItem}>
                  <span className={styles.trustIcon}>✦</span>
                  Pago por SINPE Móvil
                </li>
                <li className={styles.trustItem}>
                  <span className={styles.trustIcon}>✦</span>
                  Envíos a todo Costa Rica
                </li>
                <li className={styles.trustItem}>
                  <span className={styles.trustIcon}>✦</span>
                  Devoluciones en 7 días
                </li>
              </ul>

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
