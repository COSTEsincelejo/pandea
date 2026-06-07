import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/orders/my-orders')
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err?.response?.data?.message || 'Error cargando órdenes'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pendiente: '#e67e22',
      procesando: '#3498db',
      enviado: '#9b59b6',
      entregado: '#27ae60',
      cancelado: '#e74c3c',
    };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          backgroundColor: colors[status] || '#95a5a6',
          color: 'white',
          borderRadius: '999px',
          fontSize: '0.85rem',
          fontWeight: '600',
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <section className="container">
      <h1 className="page-title">Mi Historial de Compras</h1>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p>Cargando órdenes...</p>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No tienes órdenes aún.</p>
          <Link to="/" className="button-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            Ver productos
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.map((order) => (
            <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '1rem',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>Orden #{order.id}</h3>
                  <p style={{ margin: '0', color: '#6f6f7a', fontSize: '0.9rem' }}>
                    {formatDate(order.fecha)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0', fontWeight: '700', fontSize: '1.1rem' }}>
                    ${Number(order.total).toFixed(2)}
                  </p>
                </div>
                <div>{getStatusBadge(order.estado)}</div>
                <Link to={`/order/${order.id}`} className="button-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Ver detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
