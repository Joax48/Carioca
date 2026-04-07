
import { useState }  from 'react';
import { useAuth }   from '../../stores/useAuth';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const login = useAuth(s => s.login);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Completá todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      window.location.href = '/admin';
    } catch (err) {
      setError('Credenciales incorrectas. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Logo / wordmark */}
        <div className={styles.brand}>
          <p className={styles.brandSub}>Panel de administración</p>
          <h1 className={styles.brandName}>CARIOCA</h1>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              disabled={loading}
              placeholder="hola@carioca.cr"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">{error}</p>
          )}

          <button
            type="submit"
            className={styles.btn}
            disabled={loading}
          >
            {loading
              ? <span className={styles.spinner} aria-hidden="true" />
              : 'Ingresar'
            }
          </button>
        </form>

        <a href="/" className={styles.backLink}>
          ← Volver al sitio
        </a>
      </div>
    </div>
  );
}
