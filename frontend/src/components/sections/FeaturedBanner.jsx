/* ─────────────────────────────────────────
   FeaturedBanner — hero full-bleed con gradiente
───────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { useScrollReveal }     from '../../hooks/useScrollReveal';
import { Button, SectionLabel } from '../ui';
import { settingsService }     from '../../services';
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

  const image = product.images?.find(i => i.is_primary) ?? product.images?.[0];
  const price = `₡${Number(product.price).toLocaleString('es-CR')}`;

  return (
    <section
      className={styles.banner}
      aria-label={`Producto destacado: ${product.name}`}
      ref={ref}
    >
      {/* ── Imagen de fondo ── */}
      <div className={styles.image} aria-hidden="true">
        {image
          ? <img src={image.url} alt={image.alt_text ?? product.name} className={styles.img} />
          : <div className={styles.imageFallback} />
        }
      </div>

      {/* ── Gradiente overlay ── */}
      <div className={styles.gradient} aria-hidden="true" />

      {/* ── Copy ── */}
      <div className={styles.copy}>
        <SectionLabel dark>Destacado</SectionLabel>

        <h2 className={styles.heading}>{product.name}</h2>

        {product.description && (
          <p className={styles.body}>{product.description}</p>
        )}

        <p className={styles.price}>{price}</p>

        <Button href={`/productos/${product.slug}`} variant="primary" dark>
          Comprar ahora
        </Button>
      </div>
    </section>
  );
}
