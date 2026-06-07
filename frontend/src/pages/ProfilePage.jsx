import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile, getMyOrders } from '../services/userService.js';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || {});
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data))
      .catch(() => setError('No fue posible cargar tu perfil'));
    getMyOrders()
      .then((data) => setOrders(data))
      .catch(() => {});
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const updated = await updateProfile({
        nombre: profile.nombre,
        apellido: profile.apellido,
        email: profile.email,
      });
      setProfile(updated);
      setMessage('Perfil actualizado.');
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error actualizando perfil');
    }
  };

  return (
    <section className="container">
      <h1 className="page-title">Mi perfil</h1>
      {error && <div className="alert">{error}</div>}
      {message && <div className="card">{message}</div>}
      <div className="section-row">
        <form className="card" onSubmit={handleSave}>
          <div className="input-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              name="nombre"
              value={profile.nombre || ''}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
          <div className="input-group">
            <label htmlFor="apellido">Apellido</label>
            <input
              id="apellido"
              name="apellido"
              value={profile.apellido || ''}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={profile.email || ''}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
            {editing ? (
              <>
                <button type="submit" className="button-primary">Guardar</button>
                <button type="button" className="button-secondary" onClick={() => setEditing(false)}>
                  Cancelar
                </button>
              </>
            ) : (
              <button type="button" className="button-primary" onClick={() => setEditing(true)}>
                Editar perfil
              </button>
            )}
          </div>
        </form>
        <div className="card">
          <h2>Opciones</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <Link to="/profile/historial" className="button-secondary" style={{ display: 'block', textAlign: 'center' }}>
              Ver Historial Completo
            </Link>
            <button type="button" className="button-danger" onClick={() => { logout(); navigate('/'); }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
