/* ─────────────────────────────────────────
   useScrollReveal
   Observes when an element enters the viewport
   and toggles the "visible" class for CSS transitions.

   Usage:
     const ref = useScrollReveal();
     <div ref={ref} className="reveal">...</div>
───────────────────────────────────────── */

import { useEffect, useRef } from 'react';

/**
 * @param {IntersectionObserverInit} options - Optional IO config
 * @returns {React.RefObject} ref to attach to the DOM element
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.disconnect(); // fire once
        }
      },
      { threshold: 0.12, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
