import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        await api.get(`/auth/reset-password/validate/${token}`);
        setIsValidToken(true);
      } catch (err) {
        setError(err?.response?.data?.message || 'Token inválido o expirado');
      } finally {
        setValidating(false);
      }
    };
    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <section className="container" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className="card">
          <p style={{ textAlign: 'center' }}>Validando token...</p>
        </div>
      </section>
    );
  }

  if (!isValidToken) {
    return (
      <section className="container" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className="card">
          <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#e74c3c' }}>
            Token Inválido
          </h1>
          <p style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>
          <button
            type="button"
            className="button-primary"
            style={{ width: '100%' }}
            onClick={() => navigate('/forgot-password')}
          >
            Solicitar nuevo email
          </button>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="container" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className="card">
          <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#27ae60' }}>
            Contraseña Actualizada
          </h1>
          <p style={{ textAlign: 'center', marginBottom: '0' }}>
            Tu contraseña ha sido cambiada exitosamente. Serás redirigido a login en 2 segundos.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div className="card">
        <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Cambiar Contraseña
        </h1>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="password">Nueva Contraseña (mín. 8 caracteres)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength="8"
              required
            />
          </div>
          <button type="submit" className="button-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </section>
  );
}
