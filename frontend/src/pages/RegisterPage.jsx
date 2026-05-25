import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    documento: '',
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Error creando la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container">
      <h1 className="page-title">Crear cuenta</h1>
      {error && <div className="alert">{error}</div>}
      <form className="card" onSubmit={handleSubmit}>
        <div className="grid grid-3">
          <div className="input-group">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="apellido">Apellido</label>
            <input id="apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label htmlFor="documento">Documento</label>
            <input id="documento" name="documento" value={form.documento} onChange={handleChange} required />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="button-primary" disabled={submitting}>
          {submitting ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      <p className="small-text">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </section>
  );
}
