/* ─────────────────────────────────────────
   ContactPage — Página de contacto
   Formulario + info de la tienda
───────────────────────────────────────── */

import { useState } from 'react';
import { Navbar }  from '../components/layout/Navbar';
import { Footer }  from '../components/layout/Footer';
import { api }     from '../services/api.client.js';
import styles from './ContactPage.module.css';

const WHATSAPP = '50672939849';
const EMAIL    = 'cariocawear.cr@gmail.com';
const LOCATION = 'Pozos de Santa Ana, Costa Rica';
const INSTAGRAM = 'https://www.instagram.com/carioca_practice_wear';

export function ContactPage() {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' });
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState('');

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Por favor completá todos los campos requeridos.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await api.post('/contact', form);
      setSent(true);
    } catch {
      setError('No se pudo enviar el mensaje. Intentá de nuevo o escribinos directamente.');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className={styles.page}>

        {/* ── Hero header ── */}
        <div className={styles.hero}>
          <p className={styles.heroLabel}>Contacto</p>
          <h1 className={styles.heroTitle}>Hablemos</h1>
          <p className={styles.heroSub}>
            ¿Tenés una consulta sobre tallas, pedidos o simplemente querés saber más de Carioca?
            Estamos para vos.
          </p>
        </div>

        <div className={styles.container}>
          <div className={styles.layout}>

            {/* ── Columna izquierda: Info ── */}
            <aside className={styles.infoCol}>
              <div className={styles.infoCard}>
                <p className={styles.infoLabel}>Ubicación</p>
                <p className={styles.infoValue}>{LOCATION}</p>
              </div>

              <div className={styles.infoCard}>
                <p className={styles.infoLabel}>Correo electrónico</p>
                <a href={`mailto:${EMAIL}`} className={styles.infoLink}>{EMAIL}</a>
              </div>

              <div className={styles.infoCard}>
                <p className={styles.infoLabel}>WhatsApp</p>
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                >
                  Escribinos por WhatsApp →
                </a>
              </div>

              <div className={styles.infoCard}>
                <p className={styles.infoLabel}>Instagram</p>
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoLink}
                >
                  @carioca_practice_wear →
                </a>
              </div>

              <div className={styles.hoursCard}>
                <p className={styles.infoLabel}>Horario de atención</p>
                <p className={styles.hoursText}>Lunes – Viernes · 9 am a 6 pm</p>
                <p className={styles.hoursNote}>Respondemos en menos de 24 h</p>
              </div>
            </aside>

            {/* ── Columna derecha: Formulario ── */}
            <div className={styles.formCol}>
              {sent ? (
                <div className={styles.successBox}>
                  <div className={styles.successIcon}>
                    <IconCheck />
                  </div>
                  <h2 className={styles.successTitle}>¡Mensaje enviado!</h2>
                  <p className={styles.successSub}>
                    Recibimos tu mensaje y te responderemos en menos de 24 h.
                    También podés escribirnos por Instagram o WhatsApp.
                  </p>
                  <button className={styles.resetBtn} onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}>
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className={styles.form}>
                  <h2 className={styles.formTitle}>Envianos un mensaje</h2>

                  <div className={styles.row2}>
                    <Field label="Nombre" id="name" value={form.name} onChange={set('name')} required />
                    <Field label="Correo electrónico" id="email" type="email" value={form.email} onChange={set('email')} required />
                  </div>

                  <Field label="Asunto" id="subject" value={form.subject} onChange={set('subject')} placeholder="¿En qué te podemos ayudar?" />

                  <div className={styles.fieldGroup}>
                    <label htmlFor="message" className={styles.label}>
                      Mensaje <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="message"
                      className={styles.textarea}
                      value={form.message}
                      onChange={set('message')}
                      rows={6}
                      placeholder="Contanos tu consulta con todo el detalle que necesités..."
                    />
                  </div>

                  {error && <p className={styles.errorMsg}>{error}</p>}

                  <button type="submit" className={styles.submitBtn} disabled={sending}>
                    {sending ? 'Enviando...' : 'Enviar mensaje'}
                  </button>

                  <p className={styles.formNote}>
                    También podés escribirnos directamente a{' '}
                    <a href={`mailto:${EMAIL}`} className={styles.formNoteLink}>{EMAIL}</a>
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ── Componente de campo ── */
function Field({ label, id, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}{required && <span className={styles.required}>*</span>}
      </label>
      <input
        id={id} type={type} value={value} onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
}

const IconCheck = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
