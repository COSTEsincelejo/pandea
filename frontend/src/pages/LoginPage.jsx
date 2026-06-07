import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div className="card">
        <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Iniciar sesión</h1>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="button-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
          <p className="small-text" style={{ marginBottom: '0.5rem' }}>
            ¿No tienes cuenta? <Link to="/register" style={{ color: '#6c3483', fontWeight: '700' }}>Regístrate aquí</Link>
          </p>
          <p className="small-text">
            ¿Olvidaste tu contraseña? <Link to="/forgot-password" style={{ color: '#e67e22', fontWeight: '700' }}>Recupérala</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
