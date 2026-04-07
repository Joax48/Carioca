/* ─────────────────────────────────────────
   useNavScroll
   Returns true once the user scrolls past `threshold` px.
   Used to toggle the navbar from transparent to solid.
───────────────────────────────────────── */

import { useState, useEffect } from 'react';

/**
 * @param {number} threshold - px scrolled before returning true
 * @returns {boolean}
 */
export function useNavScroll(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
