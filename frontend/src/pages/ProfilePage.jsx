import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getProfile, updateProfile, getMyOrders } from '../services/userService.js';

export default function ProfilePage() {
  const { user, logout } = useAuth();
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
          <h2>Pedidos recientes</h2>
          {orders.length === 0 ? (
            <p>No tienes pedidos aún.</p>
          ) : (
            <div className="grid" style={{ gap: '1rem' }}>
              {orders.map((order) => (
                <div key={order.id} className="card">
                  <p><strong>Orden #{order.id}</strong></p>
                  <p className="small-text">Estado: {order.estado}</p>
                  <p>Total: ${Number(order.total).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
          <button type="button" className="button-danger" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </section>
  );
}
