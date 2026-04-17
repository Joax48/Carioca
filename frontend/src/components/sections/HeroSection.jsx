/* ─────────────────────────────────────────
   HeroSection — section component
   Full-viewport split layout: dark left panel
   with copy + CTA, right panel with main image.
───────────────────────────────────────── */

import { Button, SectionLabel } from '../ui';
import styles from './HeroSection.module.css';

const HERO_VIDEO = import.meta.env.VITE_HERO_VIDEO_URL || '/videos/hero.mp4';

export function HeroSection() {
  return (
    <section className={styles.hero} aria-label="Inicio">

      {/* ── Video de fondo (ocupa toda la sección) ── */}
      <video
        className={styles.videoBg}
        src={HERO_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      {/* ── Overlay oscuro sobre el video ── */}
      <div className={styles.videoOverlay} aria-hidden="true" />

      {/* ── Contenido centrado sobre el video ── */}
      <div className={styles.copyInner}>
        <SectionLabel dark>Nueva Colección · 2026</SectionLabel>

        <h1 className={styles.headline}>
          Mueve<br />
          <em>tu mundo</em>
        </h1>

        <p className={styles.body}>
          Ropa deportiva diseñada para la mujer costarricense.
          Calidad, confort y estilo en cada entrenamiento.
        </p>

        <div className={styles.ctas}>
          <Button href="#catalogo" variant="primary" dark size="md">
            Ver catálogo
          </Button>
          <Button href="#colecciones" variant="outline" dark size="md">
            Colecciones
          </Button>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className={styles.scrollCue} aria-hidden="true">
        <span className={styles.scrollLabel}>Desplazar</span>
        <div className={styles.scrollLine} />
      </div>

    </section>
  );
}