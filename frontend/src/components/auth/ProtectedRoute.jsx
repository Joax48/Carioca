// Redirige a /admin/login si el usuario no está autenticado.

import { useEffect }  from 'react';
import { useAuth }    from '../../stores/useAuth';

export function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuth();

  useEffect(() => {
    if (initialized && !loading && !user) {
      window.location.href = '/admin/login';
    }
  }, [user, loading, initialized]);

  // Mientras verifica la sesión → pantalla en blanco (evita flash)
  if (!initialized || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0E0D0B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '1.5px solid rgba(200,168,130,0.3)',
          borderTopColor: '#C8A882',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null; // se redirige en el useEffect

  return children;
}
