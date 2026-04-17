import { useState, useEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Button, SectionLabel } from '../ui';
import { settingsService } from '../../services';
import styles from './FeaturedBanner.module.css';

export function FeaturedBanner() {
  const ref = useScrollReveal();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    settingsService.getFeatured()
      .then(setProduct)
      .catch(() => setProduct(null));
  }, []);

  if (!product) return null;

  const price = `₡${Number(product.price).toLocaleString('es-CR')}`;
  const image = product.images?.find(img => img.is_primary) ?? product.images?.[0];
  const hasImage = Boolean(image);

  return (
    <section
      className={`${styles.banner} ${hasImage ? styles.split : styles.centered}`}
      aria-label={`Producto destacado: ${product.name}`}
      ref={ref}
    >
      <div className={styles.content}>
        <SectionLabel dark>Destacado</SectionLabel>

        <h2 className={styles.heading}>{product.name}</h2>

        {product.description && (
          <p className={styles.body}>{product.description}</p>
        )}

        <div className={styles.footer}>
          <span className={styles.price}>{price}</span>
          <Button href={`/productos/${product.slug}`} variant="primary" dark>
            Comprar ahora
          </Button>
        </div>
      </div>

      {hasImage && (
        <div className={styles.imageWrap}>
          <img
            src={image.url}
            alt={image.alt_text || product.name}
            className={styles.image}
          />
          <div className={styles.imageOverlay} />
        </div>
      )}
    </section>
  );
}
