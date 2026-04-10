// Wrapper de campo de formulario: label + input/textarea/select + error.
//
// Props:
//   label    — string
//   error    — string | null
//   required — boolean
//   hint     — string (texto de ayuda)
//   children — el <input>, <select>, <textarea>

import styles from './AdminField.module.css';

export function AdminField({ label, error, required, hint, children }) {
  return (
    <div className={`${styles.field} ${error ? styles.hasError : ''}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={styles.control}>
        {children}
      </div>
      {hint && !error && (
        <p className={styles.hint}>{hint}</p>
      )}
      {error && (
        <p className={styles.error} role="alert">{error}</p>
      )}
    </div>
  );
}

// ── Componentes de input pre-estilizados para el CMS ──

export function AdminInput({ className = '', ...props }) {
  return <input className={`${styles.input} ${className}`} {...props} />;
}

export function AdminTextarea({ className = '', rows = 4, ...props }) {
  return <textarea className={`${styles.textarea} ${className}`} rows={rows} {...props} />;
}

export function AdminSelect({ className = '', children, ...props }) {
  return (
    <select className={`${styles.select} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function AdminToggle({ label, checked, onChange }) {
  return (
    <div
      className={styles.toggleLabel}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange?.(!checked)}
      onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && onChange?.(!checked)}
    >
      <div className={`${styles.track} ${checked ? styles.trackOn : ''}`}>
        <span className={styles.thumb} />
      </div>
      {label && <span className={styles.toggleText}>{label}</span>}
    </div>
  );
}
