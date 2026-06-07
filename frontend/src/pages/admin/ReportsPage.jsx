import { useEffect, useState } from 'react';
import api from '../../api/client.js';

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadStats();
  }, [days]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes] = await Promise.all([
        api.get(`/orders/stats?days=${days}`),
        api.get(`/orders/top-products?limit=5`),
      ]);
      setStats(statsRes.data);
      setTopProducts(Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.products || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error cargando reportes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container">
        <h1 className="page-title">Reportes y Estadísticas</h1>
        <p>Cargando reportes...</p>
      </section>
    );
  }

  return (
    <section className="container">
      <h1 className="page-title">Reportes y Estadísticas</h1>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ marginRight: '1rem', fontWeight: '600' }}>Período:</label>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            cursor: 'pointer',
          }}
        >
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
        </select>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6c3483', marginBottom: '0.5rem' }}>Total Ingresos</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0', color: '#27ae60' }}>
            ${Number(stats?.totalIngresos || 0).toFixed(2)}
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6c3483', marginBottom: '0.5rem' }}>Total Pedidos</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0', color: '#3498db' }}>
            {stats?.totalPedidos || 0}
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6c3483', marginBottom: '0.5rem' }}>Promedio por Pedido</h3>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0', color: '#e67e22' }}>
            ${Number(stats?.promedioPorPedido || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Ventas Diarias</h2>
        {stats?.ventasDiarias && stats.ventasDiarias.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #6c3483' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Fecha</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '700' }}>Ingresos</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {stats.ventasDiarias.map((venta, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '1rem' }}>{venta.fecha}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700' }}>
                      ${Number(venta.ingresos).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{venta.pedidos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay datos de ventas.</p>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Top 5 Productos</h2>
        {topProducts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #6c3483' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Producto</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Cantidad Vendida</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '700' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((prod, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '1rem' }}>{prod.nombre}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{prod.cantidad}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700' }}>
                      ${Number(prod.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay datos de productos.</p>
        )}
      </div>
    </section>
  );
}
