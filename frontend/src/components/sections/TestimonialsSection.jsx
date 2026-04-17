
import { useState, useRef, useEffect, useCallback } from 'react';
import { useScrollReveal }    from '../../hooks/useScrollReveal';
import { useTestimonials }    from '../../hooks/useCollections';
import { IconButton, IconChevronLeft, IconChevronRight } from '../ui';
import { TestimonialCard }    from './TestimonialCard';
import styles from './TestimonialsSection.module.css';

function useVisibleCount() {
  const get = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth <= 560) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  };
  const [count, setCount] = useState(get);
  useEffect(() => {
    const handler = () => setCount(get());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return count;
}

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
  const [index, setIndex]  = useState(0);
  const headerRef          = useScrollReveal();
  const visibleCount       = useVisibleCount();
  const autoRef            = useRef(null);

  const total     = testimonials.length;
  const maxIndex  = Math.max(0, total - visibleCount);
  const pageCount = maxIndex + 1;

  const prev = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex(i => Math.min(maxIndex, i + 1)), [maxIndex]);

  // Auto-advance every 4s
  useEffect(() => {
    if (total <= visibleCount) return;
    autoRef.current = setInterval(() => {
      setIndex(i => (i >= maxIndex ? 0 : i + 1));
    }, 4000);
    return () => clearInterval(autoRef.current);
  }, [total, visibleCount, maxIndex]);

  const pauseAuto = () => clearInterval(autoRef.current);

  const offset = `${-(index * (100 / visibleCount))}%`;

  return (
    <section className={styles.section} aria-label="Testimonios de clientes">
      <div className={styles.inner}>

        <div ref={headerRef} className={`reveal ${styles.header}`}>
          <h2 className={styles.heading}>TESTIMONIOS</h2>

          {!loading && total > visibleCount && (
            <div className={styles.nav} aria-label="Navegación del carrusel">
              <IconButton label="Anterior" bordered onClick={() => { pauseAuto(); prev(); }}
                disabled={index === 0} className={index === 0 ? styles.disabled : ''}>
                <IconChevronLeft size={14} />
              </IconButton>
              <IconButton label="Siguiente" bordered onClick={() => { pauseAuto(); next(); }}
                disabled={index >= maxIndex} className={index >= maxIndex ? styles.disabled : ''}>
                <IconChevronRight size={14} />
              </IconButton>
            </div>
          )}
        </div>

        {/* Carousel viewport */}
        <div className={styles.viewport}>
          {loading ? (
            <div className={styles.track} style={{ transform: 'none' }}>
              {Array.from({ length: visibleCount }).map((_, i) => (
                <div key={i} className={styles.slide} style={{ '--visible': visibleCount }}>
                  <TestimonialSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <ul
              className={styles.track}
              role="list"
              style={{ transform: `translateX(${offset})` }}
            >
              {testimonials.map(t => (
                <li
                  key={t.id}
                  className={styles.slide}
                  style={{ '--visible': visibleCount }}
                >
                  <TestimonialCard testimonial={t} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dots */}
        {!loading && pageCount > 1 && (
          <div className={styles.dots} role="tablist" aria-label="Diapositivas">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Ir a testimonio ${i + 1}`}
                className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
                onClick={() => { pauseAuto(); setIndex(i); }}
              />
            ))}
          </div>
        )}

        {!loading && total === 0 && (
          <p className={styles.empty}>Sé la primera en dejar tu reseña ✨</p>
        )}
      </div>
    </section>
  );
}
