
import { useState, useRef } from 'react';
import { useScrollReveal }    from '../../hooks/useScrollReveal';
import { useTestimonials }    from '../../hooks/useCollections';  // mismo archivo
import { IconButton, IconChevronLeft, IconChevronRight } from '../ui';
import { TestimonialCard }    from './TestimonialCard';
import styles from './TestimonialsSection.module.css';

const VISIBLE = 3;

// ── Skeleton ─────────────────────────────────────────────
function TestimonialSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonStars} />
      <div className={styles.skeletonLine} style={{ width: '90%' }} />
      <div className={styles.skeletonLine} style={{ width: '75%' }} />
      <div className={styles.skeletonLine} style={{ width: '60%' }} />
      <div className={styles.skeletonAuthor} />
    </div>
  );
}

export function TestimonialsSection() {
  const { data: testimonials, loading } = useTestimonials();
  const [start, setStart] = useState(0);
  const headerRef         = useScrollReveal();

  const total   = testimonials.length;
  const canPrev = start > 0;
  const canNext = start + VISIBLE < total;

  const prev    = () => setStart(s => Math.max(0, s - 1));
  const next    = () => setStart(s => Math.min(total - VISIBLE, s + 1));
  const visible = testimonials.slice(start, start + VISIBLE);

  return (
    <section className={styles.section} aria-label="Testimonios de clientes">
      <div className={styles.inner}>

        <div ref={headerRef} className={`reveal ${styles.header}`}>
          <h2 className={styles.heading}>TESTIMONIOS</h2>

          {!loading && total > VISIBLE && (
            <div className={styles.nav} aria-label="Navegación del carrusel">
              <IconButton label="Anterior" bordered onClick={prev}
                disabled={!canPrev} className={!canPrev ? styles.disabled : ''}>
                <IconChevronLeft size={14} />
              </IconButton>
              <IconButton label="Siguiente" bordered onClick={next}
                disabled={!canNext} className={!canNext ? styles.disabled : ''}>
                <IconChevronRight size={14} />
              </IconButton>
            </div>
          )}
        </div>

        <ul className={styles.grid} role="list">
          {loading
            ? Array.from({ length: VISIBLE }).map((_, i) => (
                <li key={i}><TestimonialSkeleton /></li>
              ))
            : visible.map((t, i) => (
                <li key={t.id} className={styles.item} style={{ animationDelay: `${i * 0.08}s` }}>
                  <TestimonialCard testimonial={t} />
                </li>
              ))
          }
        </ul>

        {!loading && total === 0 && (
          <p className={styles.empty}>Sé la primera en dejar tu reseña ✨</p>
        )}
      </div>
    </section>
  );
}
