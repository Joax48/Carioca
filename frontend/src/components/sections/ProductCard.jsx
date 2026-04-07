/* ─────────────────────────────────────────
   ProductCard — reusable component
   Used in ProductsSection and anywhere
   a product thumbnail grid is needed.

   Props:
     product — { id, name, price, tag, slug }
     onAddToCart — callback(product)
───────────────────────────────────────── */

import { PlaceholderImage, Tag, Button } from '../ui';
import styles from './ProductCard.module.css';

export function ProductCard({ product, onAddToCart }) {
  const { name, price, tag, slug } = product;

  return (
    <article className={styles.card}>
      {/* ── Image + overlay ── */}
      <a href={`/productos/${slug}`} className={styles.imageWrap} aria-label={name}>
        <div className={styles.image}>
          <PlaceholderImage aspect="tall" />
        </div>

        {tag && (
          <div className={styles.tag}>
            <Tag variant="gold">{tag}</Tag>
          </div>
        )}

        <div className={styles.overlay} aria-hidden="true">
          <Button
            variant="primary"
            size="sm"
            onClick={e => {
              e.preventDefault();
              onAddToCart?.(product);
            }}
          >
            Agregar al carrito
          </Button>
        </div>
      </a>

      {/* ── Info ── */}
      <div className={styles.info}>
        <a href={`/productos/${slug}`} className={styles.name}>{name}</a>
        <p className={styles.price}>{price}</p>
      </div>
    </article>
  );
}
