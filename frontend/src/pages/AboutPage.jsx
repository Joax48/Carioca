/* ─────────────────────────────────────────
   AboutPage — Sobre Nosotros
   Editorial layout: hero split → story →
   statement manifesto → values → CTA
───────────────────────────────────────── */

import { Link } from 'react-router-dom';
import { Navbar }           from '../components/layout/Navbar';
import { Footer }           from '../components/layout/Footer';
import { SectionLabel }     from '../components/ui';
import { useScrollReveal }  from '../hooks/useScrollReveal';
import styles from './AboutPage.module.css';

/* ── Founder image path (add your photo to frontend/public/images/) ── */
const FOUNDER_IMG    = '/images/fundadora.webp';
const EMPODERATE_IMG = '/images/empoderate.jpeg';

export function AboutPage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <HeroSection />
        <StorySection />
        <StatementSection />
        <ValuesSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}

/* ──────────────────────────────────────────────────
   HERO — Split: dark panel left / portrait right
─────────────────────────────────────────────────── */
function HeroSection() {
  const textRef = useScrollReveal();

  return (
    <section className={styles.hero} aria-label="Sobre Nosotros">

      {/* Left: dark editorial panel */}
      <div className={styles.heroDark}>
        <div ref={textRef} className={`${styles.heroText} reveal`}>
          <SectionLabel light>Sobre Nosotros</SectionLabel>

          <h1 className={styles.heroTitle}>
            Nuestra<br />
            <em>Historia</em>
          </h1>

          <span className={styles.heroRule} aria-hidden="true" />

          <p className={styles.heroSub}>
            La mujer detrás de la marca que te acompaña en cada movimiento.
          </p>
        </div>

        {/* Decorative number */}
        <span className={styles.heroDecorNum} aria-hidden="true">01</span>
      </div>

      {/* Right: portrait image */}
      <div className={styles.heroImageWrap}>
        <img
          src={FOUNDER_IMG}
          alt="Camila — Fundadora de Carioca"
          className={styles.heroImg}
          loading="eager"
        />
        {/* Fade left edge into the dark panel */}
        <div className={styles.heroImgFade} aria-hidden="true" />
      </div>

    </section>
  );
}

/* ──────────────────────────────────────────────────
   STORY — Brand origin narrative
─────────────────────────────────────────────────── */
function StorySection() {
  const headRef  = useScrollReveal();
  const textRef  = useScrollReveal();
  const quoteRef = useScrollReveal();

  return (
    <section className={styles.story} aria-label="Historia de la marca">

      {/* Background decorative number */}
      <span className={styles.storyDecor} aria-hidden="true">01</span>

      <div className={styles.storyInner}>

        {/* Left: section header */}
        <div ref={headRef} className={`${styles.storyHead} reveal`}>
          <SectionLabel>La Fundadora</SectionLabel>
          <h2 className={styles.storyHeading}>
            Nació de una<br />necesidad y se<br />
            <em>convirtió en pasión</em>
          </h2>
        </div>

        {/* Right: body copy */}
        <div ref={textRef} className={`${styles.storyBody} reveal reveal--d1`}>
          <p>
            Hola, soy Camila, fundadora y diseñadora de Carioca. Esta marca nació
            de una necesidad personal y de mi sueño. Como bailarina, me encontraba
            frecuentemente buscando ropa juvenil, cómoda y funcional para bailar en
            Costa Rica. Todo era limitado, incómodo o había que viajar para conseguirlo.
          </p>
          <p>
            Entonces empecé a diseñar y confeccionar mis propias piezas, fusionando
            el movimiento en estética, línea y expresión. Al tiempo, lo que inició
            como una solución para mí se convirtió en la prenda favorita de otras
            mujeres. La respuesta fue tan buena que decidí convertir esto en Carioca:
            mi empresa, mi historia, mi amor.
          </p>
          <p>
            Seguimos diseñando para la mujer que no frena —para quien entrena,
            baila, vive y se expresa con el cuerpo. Cada pieza lleva esa energía.
          </p>
        </div>

      </div>

      {/* Pull quote */}
      <div ref={quoteRef} className={`${styles.storyQuote} reveal reveal--d2`}>
        <blockquote className={styles.quote}>
          "Carioca se define en una palabra: <em>amor</em>.
           Todo lo hacemos desde el amor y con ese amor."
        </blockquote>
        <cite className={styles.quoteCite}>— Camila, Fundadora</cite>
      </div>

    </section>
  );
}

/* ──────────────────────────────────────────────────
   STATEMENT — Full-bleed manifesto overlay
─────────────────────────────────────────────────── */
function StatementSection() {
  const wordRef = useScrollReveal({ threshold: 0.3 });

  return (
    <section className={styles.statement} aria-label="Manifiesto">
      {/* Background portrait with dark overlay */}
      <div className={styles.statementBg} aria-hidden="true">
        <img
          src={EMPODERATE_IMG}
          alt=""
          className={styles.statementImg}
          loading="lazy"
        />
        <div className={styles.statementOverlay} />
      </div>

      {/* Foreground text */}
      <div ref={wordRef} className={`${styles.statementContent} reveal`}>
        <p className={styles.statementEyebrow}>
          — Nuestro manifiesto
        </p>
        <p className={styles.statementWord}>Empodérate.</p>
        <p className={styles.statementTagline}>
          Cada prenda diseñada para que te muevas, te expreses y te sientas
          imparable.
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────
   VALUES — Propósito · Misión · Visión
─────────────────────────────────────────────────── */
function ValuesSection() {
  const labelRef = useScrollReveal();

  return (
    <section className={styles.values} aria-label="Propósito, Misión y Visión">
      <span className={styles.valuesDecor} aria-hidden="true">02</span>

      <div ref={labelRef} className={`${styles.valuesHeader} reveal`}>
        <SectionLabel>Nuestra filosofía</SectionLabel>
        <h2 className={styles.valuesHeading}>
          Lo que nos mueve
        </h2>
      </div>

      <div className={styles.valuesGrid}>
        <ValueCard
          label="Propósito"
          heading="Por qué existimos"
          body="Hacer que cada mujer se sienta segura, hermosa y conectada con su cuerpo, impulsando autoestima, confianza y bienestar a través de prendas diseñadas para acompañarla en movimiento, disciplina y crecimiento."
          delay="reveal--d1"
          num="I"
        />
        <ValueCard
          label="Misión"
          heading="Lo que hacemos"
          body="Crear prendas de alto rendimiento, hechas a mano con estándares de excelencia, que acompañen el movimiento y fortalezcan la superación de cada mujer. Más que ropa, buscamos inspirar y crear experiencias personalizadas, calidad superior y diseño consistente."
          delay="reveal--d2"
          num="II"
        />
        <ValueCard
          label="Visión"
          heading="A dónde vamos"
          body="Expandir Carioca desde Costa Rica hasta el mundo, sin perder nuestra autenticidad, accesibilidad ni el vínculo con cada mujer. Crecer guiadas por lo que significa realmente sentirse a tono."
          delay="reveal--d3"
          num="III"
        />
      </div>
    </section>
  );
}

function ValueCard({ label, heading, body, delay, num }) {
  const ref = useScrollReveal();
  return (
    <article ref={ref} className={`${styles.valueCard} reveal ${delay}`}>
      <span className={styles.valueNum} aria-hidden="true">{num}</span>
      <div className={styles.valueAccent} />
      <p className={styles.valueLabel}>{label}</p>
      <h3 className={styles.valueHeading}>{heading}</h3>
      <p className={styles.valueBody}>{body}</p>
    </article>
  );
}

/* ──────────────────────────────────────────────────
   CTA — Invite to catalog
─────────────────────────────────────────────────── */
function CtaSection() {
  const ref = useScrollReveal();
  return (
    <section className={styles.cta} aria-label="Ver productos">
      <div ref={ref} className={`${styles.ctaInner} reveal`}>
        <SectionLabel light>Conocé la colección</SectionLabel>
        <h2 className={styles.ctaHeading}>
          Prendas diseñadas<br /><em>para vos</em>
        </h2>
        <Link to="/catalogo" className={styles.ctaLink}>
          Ver productos →
        </Link>
      </div>
    </section>
  );
}
