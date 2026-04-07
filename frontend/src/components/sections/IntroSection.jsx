/* ─────────────────────────────────────────
   IntroSection — section component
   Centered editorial text block with tagline,
   heading, body copy and underline CTA link.
───────────────────────────────────────── */

import { useScrollReveal } from '../../hooks/useScrollReveal';
import { SectionLabel, Button } from '../ui';
import styles from './IntroSection.module.css';

export function IntroSection() {
  const ref = useScrollReveal();

  return (
    <section className={styles.section} aria-label="Filosofía">
      <div ref={ref} className={`${styles.inner} reveal`}>
        <SectionLabel>Nuestra filosofía</SectionLabel>

        <h2 className={styles.heading}>
          Hecha para mujeres<br />
          <em>que no frenan</em>
        </h2>

        <p className={styles.body}>
          En Carioca creemos que el rendimiento y la belleza no están peleados.
          Cada pieza está diseñada con telas de alta compresión, costuras reforzadas
          y cortes que abrazan cada forma.
        </p>

        <Button href="#catalogo" variant="link">
          Nuestros productos →
        </Button>
      </div>
    </section>
  );
}
