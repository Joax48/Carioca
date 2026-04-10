/* ─────────────────────────────────────────
   CartDrawer — slide-in cart sidebar
   Se abre desde el ícono del carrito en el Navbar.
───────────────────────────────────────── */

import { useEffect } from 'react';
import { useCart }   from '../../stores/useCart';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
  const items        = useCart(s => s.items);
  const isOpen       = useCart(s => s.isOpen);
  const close        = useCart(s => s.close);
  const removeItem   = useCart(s => s.removeItem);
  const updateQuantity = useCart(s => s.updateQuantity);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        aria-label="Carrito de compras"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Carrito
            {count > 0 && <span className={styles.countBadge}>{count}</span>}
          </h2>
          <button className={styles.closeBtn} onClick={close} aria-label="Cerrar carrito">
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <IconBag />
              <p className={styles.emptyTitle}>Tu carrito está vacío</p>
              <p className={styles.emptySub}>
                Explorá nuestro catálogo y encontrá algo que te encante.
              </p>
              <a href="/catalogo" className={styles.emptyLink} onClick={close}>
                Ver catálogo →
              </a>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map(item => (
                <CartItem
                  key={item.key}
                  item={item}
                  onRemove={() => removeItem(item.key)}
                  onQtyChange={qty => updateQuantity(item.key, qty)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalAmount}>
                ₡{Number(total).toLocaleString('es-CR')}
              </span>
            </div>
            <p className={styles.shipping}>Envío calculado al finalizar</p>
            <a
              href="/checkout"
              className={styles.checkoutBtn}
              onClick={close}
            >
              Finalizar compra
            </a>
            <button className={styles.continueBtn} onClick={close}>
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ── CartItem ── */
function CartItem({ item, onRemove, onQtyChange }) {
  const { product, size, colorName, colorHex, quantity } = item;
  const image = product.images?.[0]?.url ?? null;

  return (
    <li className={styles.item}>
      {/* Imagen */}
      <div className={styles.itemImg}>
        {image
          ? <img src={image} alt={product.name} className={styles.itemImgEl} />
          : <div className={styles.itemImgFallback} />
        }
      </div>

      {/* Info */}
      <div className={styles.itemInfo}>
        <div className={styles.itemTop}>
          <p className={styles.itemName}>{product.name}</p>
          <button className={styles.itemRemove} onClick={onRemove} aria-label="Eliminar del carrito">
            <IconTrash />
          </button>
        </div>

        {/* Variantes */}
        <div className={styles.itemMeta}>
          {colorName && (
            <span className={styles.itemVariant}>
              {colorHex && (
                <span
                  className={styles.itemColorDot}
                  style={{ background: colorHex }}
                  aria-hidden="true"
                />
              )}
              {colorName}
            </span>
          )}
          {size && (
            <span className={styles.itemVariant}>Talla {size}</span>
          )}
        </div>

        {/* Precio + cantidad */}
        <div className={styles.itemBottom}>
          <span className={styles.itemPrice}>
            ₡{Number(product.price).toLocaleString('es-CR')}
          </span>
          <div className={styles.qtyControl}>
            <button
              className={styles.qtyBtn}
              onClick={() => onQtyChange(quantity - 1)}
              aria-label="Reducir cantidad"
              disabled={quantity <= 1}
            >−</button>
            <span className={styles.qtyValue}>{quantity}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => onQtyChange(quantity + 1)}
              aria-label="Aumentar cantidad"
            >+</button>
          </div>
        </div>
      </div>
    </li>
  );
}

/* ── Icons ── */
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconBag = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);
