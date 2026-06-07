import { useEffect, useState } from 'react';
import api from '../../api/client.js';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/stock')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.inventory || [];
        setInventory(data);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Error cargando inventario'))
      .finally(() => setLoading(false));
  }, []);

  const filteredData = lowStockOnly ? inventory.filter((item) => item.stock < 5) : inventory;

  return (
    <section className="container">
      <h1 className="page-title">Inventario de Productos</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
        <label>
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
          Mostrar solo stock bajo (&lt; 5)
        </label>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p>Cargando inventario...</p>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #6c3483' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Producto</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Stock</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Precio</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Categoría</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Movimientos</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6f6f7a' }}>
                    No hay productos.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '1rem' }}>{item.nombre}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '999px',
                          background: item.stock < 5 ? '#fee2e2' : '#d4edda',
                          color: item.stock < 5 ? '#991b1b' : '#155724',
                          fontWeight: '700',
                        }}
                      >
                        {item.stock}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>${Number(item.precio).toFixed(2)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{item.categoria_nombre || 'N/A'}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{item.total_movimientos || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
