/* ─────────────────────────────────────────
   ReviewPage — Dejar reseña de un pedido
   Ruta: /review/:orderId
   Accesible desde el link en el correo de entrega.
───────────────────────────────────────── */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar }    from '../components/layout/Navbar';
import { Footer }    from '../components/layout/Footer';
import { Button }    from '../components/ui/Button';
import { testimonialsService } from '../services';
import styles from './ReviewPage.module.css';

export function ReviewPage() {
  const { orderId } = useParams();

  const [form, setForm] = useState({
    author_name: '',
    stars: 0,
    text: '',
  });
  const [hovered,   setHovered]   = useState(0);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [submitErr, setSubmitErr] = useState('');
  const [done,      setDone]      = useState(false);

  function validate() {
    const e = {};
    if (!form.author_name.trim())       e.author_name = 'Ingresá tu nombre';
    if (form.stars === 0)               e.stars       = 'Seleccioná una calificación';
    if (form.text.trim().length < 10)   e.text        = 'Escribí al menos 10 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitErr('');
    try {
      await testimonialsService.create({
        order_id:    orderId,
        author_name: form.author_name.trim(),
        stars:       form.stars,
        text:        form.text.trim(),
      });
      setDone(true);
    } catch (err) {
      setSubmitErr(err?.message ?? 'Ocurrió un error. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  /* ── Pantalla de éxito ── */
  if (done) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.card}>
            <div className={styles.successIcon}><IconHeart /></div>
            <h1 className={styles.title}>¡Gracias por tu reseña!</h1>
            <p className={styles.sub}>
              Tu opinión ayuda a otras mujeres a descubrir Carioca.
              Una vez revisada, la publicaremos en el sitio.
            </p>
            <div className={styles.actions}>
              <Button href="/" variant="primary">Volver al inicio</Button>
              <Button href="/catalogo" variant="outline">Ver catálogo</Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.card}>

          {/* Encabezado */}
          <div className={styles.header}>
            <div className={styles.headerIcon}><IconStar /></div>
            <h1 className={styles.title}>Dejá tu reseña</h1>
            <p className={styles.sub}>
              ¿Cómo fue tu experiencia con Carioca? Tu opinión nos ayuda a crecer
              y a otras personas a conocernos.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className={styles.form}>

            {/* Nombre */}
            <div className={styles.fieldGroup}>
              <label htmlFor="author_name" className={styles.label}>
                Tu nombre <span className={styles.required}>*</span>
              </label>
              <input
                id="author_name"
                type="text"
                className={`${styles.input} ${errors.author_name ? styles.inputError : ''}`}
                value={form.author_name}
                onChange={e => { setForm(f => ({ ...f, author_name: e.target.value })); setErrors(v => ({ ...v, author_name: '' })); }}
                placeholder="Ej: María Rodríguez"
                autoComplete="name"
              />
              {errors.author_name && (
                <p className={styles.errorMsg} role="alert">{errors.author_name}</p>
              )}
            </div>

            {/* Estrellas */}
            <div className={styles.fieldGroup}>
              <span className={styles.label}>
                Calificación <span className={styles.required}>*</span>
              </span>
              <div
                className={styles.stars}
                onMouseLeave={() => setHovered(0)}
                role="group"
                aria-label="Calificación de 1 a 5 estrellas"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={styles.starBtn}
                    onClick={() => { setForm(f => ({ ...f, stars: n })); setErrors(v => ({ ...v, stars: '' })); }}
                    onMouseEnter={() => setHovered(n)}
                    aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
                    aria-pressed={form.stars >= n}
                  >
                    <IconStarFill filled={n <= (hovered || form.stars)} />
                  </button>
                ))}
                {(hovered || form.stars) > 0 && (
                  <span className={styles.starLabel}>
                    {STAR_LABELS[hovered || form.stars]}
                  </span>
                )}
              </div>
              {errors.stars && (
                <p className={styles.errorMsg} role="alert">{errors.stars}</p>
              )}
            </div>

            {/* Texto */}
            <div className={styles.fieldGroup}>
              <label htmlFor="review_text" className={styles.label}>
                Tu reseña <span className={styles.required}>*</span>
              </label>
              <textarea
                id="review_text"
                className={`${styles.textarea} ${errors.text ? styles.inputError : ''}`}
                value={form.text}
                onChange={e => { setForm(f => ({ ...f, text: e.target.value })); setErrors(v => ({ ...v, text: '' })); }}
                rows={5}
                placeholder="Contanos sobre la calidad de las prendas, el proceso de compra, la entrega…"
                maxLength={600}
              />
              <div className={styles.textareaFooter}>
                {errors.text
                  ? <p className={styles.errorMsg} role="alert">{errors.text}</p>
                  : <span />
                }
                <span className={styles.charCount}>{form.text.length}/600</span>
              </div>
            </div>

            {submitErr && <p className={styles.submitError}>{submitErr}</p>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Enviando…' : 'Publicar reseña'}
            </button>

          </form>

        </div>
      </main>
      <Footer />
    </>
  );
}

const STAR_LABELS = {
  1: 'Muy malo',
  2: 'Regular',
  3: 'Bueno',
  4: 'Muy bueno',
  5: '¡Excelente!',
};

/* ── Íconos ── */
const IconStar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const IconStarFill = ({ filled }) => (
  <svg width="32" height="32" viewBox="0 0 24 24"
    fill={filled ? 'var(--color-gold)' : 'none'}
    stroke={filled ? 'var(--color-gold)' : 'var(--color-espresso-15)'}
    strokeWidth="1.5"
    style={{ transition: 'fill 120ms, stroke 120ms' }}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const IconHeart = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-gold)" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
