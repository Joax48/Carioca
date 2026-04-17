/* ─────────────────────────────────────────
   CheckoutPage — Finalizar compra
   Layout: form (izquierda) + resumen (derecha)
   Flujo: carrito → formulario → confirmación
───────────────────────────────────────── */

import { useState, useEffect }  from 'react';
import { useNavigate }           from 'react-router-dom';
import { Navbar }                from '../components/layout/Navbar';
import { Footer }                from '../components/layout/Footer';
import { Button }                from '../components/ui/Button';
import { useCart }               from '../stores/useCart';
import { useAuth }               from '../stores/useAuth';
import { ordersService }         from '../services';
import styles from './CheckoutPage.module.css';

/* ── Helpers ─────────────────────────────────────── */
const fmt = n => `₡${Number(n).toLocaleString('es-CR')}`;

const SHIPPING_COST = 2500;
const STORE_ADDRESS = 'Pozos de Santa Ana, San José';

/* ── Componente principal ────────────────────────── */
export function CheckoutPage() {
  const navigate   = useNavigate();
  const { items, clear, toOrderItems } = useCart();
  const { user }   = useAuth();

  /* Redirigir si el carrito está vacío */
  useEffect(() => {
    if (items.length === 0) navigate('/catalogo', { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [deliveryMethod, setDeliveryMethod] = useState('courier'); // 'courier' | 'pickup'

  /* Pre-llenar con datos del usuario autenticado */
  const [form, setForm] = useState({
    customer_name:    user?.name  ?? '',
    customer_email:   user?.email ?? '',
    customer_phone:   '',
    shipping_address: '',
    city:             '',
    notes:            '',
  });
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const [success,   setSuccess]   = useState(null); // { orderId, total, deliveryMethod }

  /* ── Totales ── */
  const isClient    = user?.role === 'client';
  const subtotal    = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discountPct = isClient ? 5 : 0;
  const discountAmt = Math.round(subtotal * discountPct / 100);
  const shipping    = deliveryMethod === 'courier' ? SHIPPING_COST : 0;
  const total       = subtotal - discountAmt + shipping;

  /* ── Validación ── */
  function validate() {
    const e = {};
    if (!form.customer_name.trim())  e.customer_name  = 'Requerido';
    if (!form.customer_email.trim()) e.customer_email = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email))
                                     e.customer_email = 'Email inválido';
    if (!form.customer_phone.trim()) e.customer_phone = 'Requerido';
    else if (form.customer_phone.replace(/\D/g, '').length < 8)
                                     e.customer_phone = 'Mínimo 8 dígitos';

    if (deliveryMethod === 'courier') {
      if (!form.shipping_address.trim())              e.shipping_address = 'Requerido';
      else if (form.shipping_address.trim().length < 10) e.shipping_address = 'Ingresá una dirección más completa';
      if (!form.city.trim())                          e.city = 'Requerido';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ── Submit ── */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitErr('');
    try {
      const raw = { ...form, delivery_method: deliveryMethod, items: toOrderItems() };
      // Strip empty strings so Zod .optional() fields don't fail min() checks
      const payload = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v !== '' && v !== null && v !== undefined || Array.isArray(v))
      );
      const res = await ordersService.create(payload);
      clear();
      setSuccess({ orderId: res.orderId, total: res.total, deliveryMethod });
    } catch (err) {
      setSubmitErr(err?.message ?? 'Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function set(field) {
    return e => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };
  }

  /* ── Pantalla de éxito ── */
  if (success) return (
    <SuccessScreen
      orderId={success.orderId}
      total={success.total}
      deliveryMethod={success.deliveryMethod}
    />
  );

  if (items.length === 0) return null;

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <div className={styles.container}>

          {/* Encabezado */}
          <div className={styles.header}>
            <a href="/catalogo" className={styles.backLink}>
              <IconArrowLeft /> Seguir comprando
            </a>
            <h1 className={styles.title}>Finalizar compra</h1>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.layout}>

              {/* ── Columna izquierda: Formulario ── */}
              <div className={styles.formCol}>

                {/* Banner descuento cliente */}
                {isClient && (
                  <div className={styles.discountBanner}>
                    <IconTag />
                    <span>
                      Como cliente registrada, tu pedido incluye un <strong>5% de descuento</strong> automático.
                    </span>
                  </div>
                )}

                {/* Sección: Contacto */}
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Información de contacto</h2>

                  <div className={styles.row2}>
                    <Field
                      label="Nombre completo" id="customer_name"
                      value={form.customer_name} onChange={set('customer_name')}
                      error={errors.customer_name} autoComplete="name" required
                    />
                    <Field
                      label="Correo electrónico" id="customer_email" type="email"
                      value={form.customer_email} onChange={set('customer_email')}
                      error={errors.customer_email} autoComplete="email" required
                    />
                  </div>

                  <Field
                    label="Teléfono" id="customer_phone" type="tel"
                    value={form.customer_phone} onChange={set('customer_phone')}
                    error={errors.customer_phone}
                    hint="Ej: 8888-8888 — para coordinar la entrega"
                    autoComplete="tel" required
                  />
                </section>

                {/* Sección: Método de entrega */}
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Método de entrega</h2>

                  <div className={styles.deliveryOptions}>
                    {/* Mensajería */}
                    <label
                      className={`${styles.deliveryOption} ${deliveryMethod === 'courier' ? styles.deliverySelected : ''}`}
                    >
                      <input
                        type="radio" name="delivery" value="courier"
                        checked={deliveryMethod === 'courier'}
                        onChange={() => setDeliveryMethod('courier')}
                        className={styles.radioHidden}
                      />
                      <div className={styles.deliveryRadio}>
                        {deliveryMethod === 'courier' && <div className={styles.deliveryRadioDot} />}
                      </div>
                      <div className={styles.deliveryInfo}>
                        <div className={styles.deliveryTop}>
                          <span className={styles.deliveryLabel}>Mensajería privada</span>
                          <span className={styles.deliveryPrice}>{fmt(SHIPPING_COST)}</span>
                        </div>
                        <p className={styles.deliveryDesc}>
                          Envío a domicilio a todo Costa Rica. Coordinaremos el día de entrega por WhatsApp o llamada.
                        </p>
                      </div>
                    </label>

                    {/* Retiro en tienda */}
                    <label
                      className={`${styles.deliveryOption} ${deliveryMethod === 'pickup' ? styles.deliverySelected : ''}`}
                    >
                      <input
                        type="radio" name="delivery" value="pickup"
                        checked={deliveryMethod === 'pickup'}
                        onChange={() => setDeliveryMethod('pickup')}
                        className={styles.radioHidden}
                      />
                      <div className={styles.deliveryRadio}>
                        {deliveryMethod === 'pickup' && <div className={styles.deliveryRadioDot} />}
                      </div>
                      <div className={styles.deliveryInfo}>
                        <div className={styles.deliveryTop}>
                          <span className={styles.deliveryLabel}>Retiro en tienda</span>
                          <span className={styles.deliveryFree}>Gratis</span>
                        </div>
                        <p className={styles.deliveryDesc}>
                          Retirá tu pedido en nuestra tienda en <strong>{STORE_ADDRESS}</strong>.
                          Te avisamos cuando esté listo.
                        </p>
                      </div>
                    </label>
                  </div>
                </section>

                {/* Sección: Dirección — solo para mensajería */}
                {deliveryMethod === 'courier' && (
                  <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Dirección de entrega</h2>

                    <Field
                      label="Dirección" id="shipping_address"
                      value={form.shipping_address} onChange={set('shipping_address')}
                      error={errors.shipping_address}
                      hint="Provincia, cantón, distrito y señas exactas"
                      autoComplete="street-address" required
                    />
                    <Field
                      label="Ciudad / Zona" id="city"
                      value={form.city} onChange={set('city')}
                      error={errors.city}
                      hint="Ej: Escazú, Santa Ana, Heredia"
                      autoComplete="address-level2" required
                    />
                  </section>
                )}

                {/* Sección: Notas */}
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    Notas del pedido <span className={styles.optional}>(opcional)</span>
                  </h2>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="notes" className={styles.label}>Instrucciones adicionales</label>
                    <textarea
                      id="notes" className={styles.textarea}
                      value={form.notes} onChange={set('notes')} rows={3}
                      placeholder={
                        deliveryMethod === 'pickup'
                          ? 'Horario preferido para el retiro, consultas, etc.'
                          : 'Instrucciones para la mensajería, preferencias de empaque, etc.'
                      }
                    />
                  </div>
                </section>

                {/* Info SINPE */}
                <div className={styles.sinpeBox}>
                  <div className={styles.sinpeIcon}><IconSinpe /></div>
                  <div>
                    <p className={styles.sinpeTitle}>Pago por SINPE Móvil</p>
                    <p className={styles.sinpeDesc}>
                      Al confirmar tu pedido te enviamos el número de SINPE Móvil por correo.
                      Tu pedido se procesa una vez verificado el pago.
                    </p>
                  </div>
                </div>

                {submitErr && <p className={styles.submitError}>{submitErr}</p>}

                {/* Submit móvil */}
                <div className={styles.submitMobile}>
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Procesando...' : `Confirmar pedido — ${fmt(total)}`}
                  </button>
                </div>

              </div>

              {/* ── Columna derecha: Resumen ── */}
              <aside className={styles.summaryCol}>
                <div className={styles.summaryCard}>
                  <h2 className={styles.summaryTitle}>Resumen del pedido</h2>
                  <p className={styles.summaryCount}>{items.length} producto{items.length !== 1 ? 's' : ''}</p>

                  <ul className={styles.itemList}>
                    {items.map(item => <SummaryItem key={item.key} item={item} />)}
                  </ul>

                  <div className={styles.totals}>
                    <div className={styles.totalRow}>
                      <span>Subtotal</span>
                      <span>{fmt(subtotal)}</span>
                    </div>

                    {discountPct > 0 && (
                      <div className={`${styles.totalRow} ${styles.discountRow}`}>
                        <span>Descuento ({discountPct}%)</span>
                        <span>−{fmt(discountAmt)}</span>
                      </div>
                    )}

                    <div className={styles.totalRow}>
                      <span>Envío</span>
                      {deliveryMethod === 'courier'
                        ? <span>{fmt(SHIPPING_COST)}</span>
                        : <span className={styles.freeShipping}>Gratis · Retiro en tienda</span>
                      }
                    </div>

                    <div className={styles.divider} />

                    <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                      <span>Total</span>
                      <span>{fmt(total)}</span>
                    </div>
                  </div>

                  {/* Submit desktop */}
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Procesando...' : 'Confirmar pedido'}
                  </button>

                  <p className={styles.secureNote}>
                    <IconLock /> Tu información está segura y cifrada.
                  </p>
                </div>
              </aside>

            </div>
          </form>

        </div>
      </main>

      <Footer />
    </>
  );
}

/* ── Campo de formulario ───────────────────────────── */
function Field({ label, id, type = 'text', value, onChange, error, hint, required, autoComplete }) {
  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}{required && <span className={styles.required}>*</span>}
      </label>
      <input
        id={id} type={type} value={value} onChange={onChange} autoComplete={autoComplete}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
      />
      {hint && !error && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}
      {error && <p id={`${id}-error`} className={styles.errorMsg} role="alert">{error}</p>}
    </div>
  );
}

/* ── Item del resumen ──────────────────────────────── */
function SummaryItem({ item }) {
  const { product, size, colorName, colorHex, quantity } = item;
  const image = product.images?.[0]?.url ?? null;

  return (
    <li className={styles.summaryItem}>
      <div className={styles.summaryImg}>
        {image ? <img src={image} alt={product.name} /> : <div className={styles.summaryImgFallback} />}
        <span className={styles.qtyBadge}>{quantity}</span>
      </div>
      <div className={styles.summaryInfo}>
        <p className={styles.summaryName}>{product.name}</p>
        <div className={styles.summaryMeta}>
          {colorName && (
            <span className={styles.metaChip}>
              {colorHex && <span className={styles.colorDot} style={{ background: colorHex }} />}
              {colorName}
            </span>
          )}
          {size && <span className={styles.metaChip}>Talla {size}</span>}
        </div>
      </div>
      <span className={styles.summaryPrice}>{fmt(product.price * quantity)}</span>
    </li>
  );
}

/* ── Pantalla de éxito ─────────────────────────────── */
function SuccessScreen({ orderId, total, deliveryMethod }) {
  const isPickup = deliveryMethod === 'pickup';
  return (
    <>
      <Navbar />
      <main className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}><IconCheck /></div>
          <h1 className={styles.successTitle}>¡Pedido recibido!</h1>
          <p className={styles.successSub}>
            {isPickup
              ? 'Te contactaremos para coordinar el horario de retiro en nuestra tienda.'
              : 'Te enviamos un correo con los detalles del pago por SINPE Móvil.'
            }
          </p>

          <div className={styles.successMeta}>
            <div className={styles.successMetaRow}>
              <span className={styles.successMetaLabel}>Número de pedido</span>
              <span className={styles.successMetaValue}>#{orderId?.slice(-8).toUpperCase()}</span>
            </div>
            {total != null && (
              <div className={styles.successMetaRow}>
                <span className={styles.successMetaLabel}>Total a pagar</span>
                <span className={styles.successMetaValue}>{fmt(total)}</span>
              </div>
            )}
            <div className={styles.successMetaRow}>
              <span className={styles.successMetaLabel}>Entrega</span>
              <span className={styles.successMetaValue}>
                {isPickup ? `Retiro en tienda · ${STORE_ADDRESS}` : 'Mensajería privada'}
              </span>
            </div>
          </div>

          <p className={styles.successNote}>
            {isPickup
              ? 'Revisá tu correo y WhatsApp para los detalles de coordinación.'
              : 'Revisá tu bandeja de entrada (o spam) para los detalles del pago.'
            }
          </p>

          <div className={styles.successActions}>
            <Button href="/" variant="primary" size="lg">Volver al inicio</Button>
            <Button href="/catalogo" variant="outline" size="lg">Seguir comprando</Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ── Íconos ────────────────────────────────────────── */
const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const IconTag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IconSinpe = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="4" width="22" height="16" rx="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IconLock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconCheck = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
