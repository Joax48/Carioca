/* ─────────────────────────────────────────
   FeaturedBanner — section component
   Dark split-panel promotional banner.
   Accepts a featured product object as prop.
───────────────────────────────────────── */

import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Button, PlaceholderImage, SectionLabel } from '../ui';
import { FEATURED_PRODUCT } from '../../data/homeData';
import styles from './FeaturedBanner.module.css';

export function FeaturedBanner({ product = FEATURED_PRODUCT }) {
  const ref = useScrollReveal();

  return (
    <section
      className={styles.banner}
      aria-label={`Producto destacado: ${product.name}`}
      ref={ref}
    >
      {/* ── Copy side ── */}
      <div className={styles.copy}>
        <SectionLabel dark>Destacado</SectionLabel>

        <h2 className={styles.heading}>
          {product.name.split(' ').map((word, i) => (
            <span key={i}>{word}<br /></span>
          ))}
        </h2>

        <p className={styles.body}>{product.description}</p>

        <p className={styles.price}>{product.price}</p>

        <Button href={`/productos/${product.slug}`} variant="primary" dark>
          Comprar ahora
        </Button>
      </div>

      {/* ── Image side ── */}
      <div className={styles.image} aria-hidden="true">
        <PlaceholderImage aspect="square" label={product.name} />
      </div>
    </section>
  );
}
