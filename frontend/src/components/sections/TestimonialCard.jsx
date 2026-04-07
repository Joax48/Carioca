/* ─────────────────────────────────────────
   TestimonialCard — reusable component

   Props:
     testimonial — { id, name, text, stars }
───────────────────────────────────────── */

import { StarRating } from '../ui';
import styles from './TestimonialCard.module.css';

export function TestimonialCard({ testimonial }) {
  const { name, text, stars } = testimonial;

  /* Derive initials (up to 2 chars) */
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('');

  return (
    <article className={styles.card}>
      <div className={styles.stars}>
        <StarRating count={stars} />
      </div>

      <blockquote className={styles.quote}>
        <p className={styles.text}>{text}</p>
      </blockquote>

      <footer className={styles.author}>
        <div className={styles.avatar} aria-hidden="true">
          {initials}
        </div>
        <p className={styles.name}>{name}</p>
      </footer>
    </article>
  );
}
