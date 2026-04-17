import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import styles from './SizeGuidePage.module.css';

const TOPS = [
  { size: 'XS', busto: '78–82', cintura: '60–64', cadera: '84–88' },
  { size: 'S',  busto: '82–86', cintura: '64–68', cadera: '88–92' },
  { size: 'M',  busto: '86–90', cintura: '68–72', cadera: '92–96' },
  { size: 'L',  busto: '90–95', cintura: '72–77', cadera: '96–101' },
  { size: 'XL', busto: '95–100', cintura: '77–82', cadera: '101–106' },
  { size: 'XXL',busto: '100–106', cintura: '82–88', cadera: '106–112' },
];

const BOTTOMS = [
  { size: 'XS', cintura: '60–64', cadera: '84–88', largo: '94–96' },
  { size: 'S',  cintura: '64–68', cadera: '88–92', largo: '95–97' },
  { size: 'M',  cintura: '68–72', cadera: '92–96', largo: '96–98' },
  { size: 'L',  cintura: '72–77', cadera: '96–101', largo: '97–99' },
  { size: 'XL', cintura: '77–82', cadera: '101–106', largo: '98–100' },
  { size: 'XXL',cintura: '82–88', cadera: '106–112', largo: '99–101' },
];

const TIPS = [
  { icon: '📏', title: 'Busto', text: 'Medí la parte más prominente del pecho, con la cinta paralela al suelo.' },
  { icon: '⭕', title: 'Cintura', text: 'Medí la parte más estrecha del torso, generalmente 2–3 cm sobre el ombligo.' },
  { icon: '🔵', title: 'Cadera', text: 'Medí la parte más ancha de tus caderas, con los pies juntos.' },
  { icon: '📐', title: 'Largo', text: 'Medí desde la cintura hasta el tobillo para leggings y pantalones.' },
];

export function SizeGuidePage() {
  return (
    <>
      <Navbar />
      <main className={styles.page}>

        <header className={styles.hero}>
          <p className={styles.label}>Carioca</p>
          <h1 className={styles.title}>Guía de tallas</h1>
          <p className={styles.subtitle}>
            Todas las medidas están en centímetros. Si estás entre dos tallas, te recomendamos elegir la mayor.
          </p>
        </header>

        <div className={styles.content}>

          {/* Cómo medirse */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cómo tomar tus medidas</h2>
            <div className={styles.tipsGrid}>
              {TIPS.map(t => (
                <div key={t.title} className={styles.tipCard}>
                  <span className={styles.tipIcon}>{t.icon}</span>
                  <strong className={styles.tipTitle}>{t.title}</strong>
                  <p className={styles.tipText}>{t.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tabla tops / sports bra */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tops, Sports Bra y Crop Tops</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Talla</th>
                    <th>Busto (cm)</th>
                    <th>Cintura (cm)</th>
                    <th>Cadera (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {TOPS.map(row => (
                    <tr key={row.size}>
                      <td className={styles.sizeCell}>{row.size}</td>
                      <td>{row.busto}</td>
                      <td>{row.cintura}</td>
                      <td>{row.cadera}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tabla bottoms */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Leggings, Shorts y Pantalones</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Talla</th>
                    <th>Cintura (cm)</th>
                    <th>Cadera (cm)</th>
                    <th>Largo (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {BOTTOMS.map(row => (
                    <tr key={row.size}>
                      <td className={styles.sizeCell}>{row.size}</td>
                      <td>{row.cintura}</td>
                      <td>{row.cadera}</td>
                      <td>{row.largo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Nota */}
          <section className={styles.note}>
            <p>
              Las medidas pueden variar ligeramente según el modelo y la tela. Si tenés dudas,
              escribinos por <a href="https://wa.me/50672939849" className={styles.link}>WhatsApp</a> y
              con gusto te asesoramos.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
