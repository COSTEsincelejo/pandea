import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/auth/recover', { email });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error enviando email de recuperación');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section className="container" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className="card">
          <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#27ae60' }}>
            Email Enviado
          </h1>
          <p style={{ textAlign: 'center', marginBottom: '0' }}>
            Revisa tu correo electrónico para obtener instrucciones de recuperación de contraseña. Serás redirigido a login en 3 segundos.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div className="card">
        <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Recuperar Contraseña
        </h1>
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
          <button type="submit" className="button-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
          <p className="small-text">
            ¿Recuerdas tu contraseña? <Link to="/login" style={{ color: '#6c3483', fontWeight: '700' }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
