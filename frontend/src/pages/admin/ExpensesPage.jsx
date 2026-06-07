import { useEffect, useState } from 'react';
import api from '../../api/client.js';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ concepto: '', monto: '', fecha: '' });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    setLoading(true);
    api
      .get('/expenses')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.expenses || [];
        setExpenses(data);
      })
      .catch((err) => setError(err?.response?.data?.message || 'Error cargando gastos'))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.concepto || !formData.monto || !formData.fecha) {
      setError('Completa todos los campos');
      return;
    }
    try {
      await api.post('/expenses', {
        concepto: formData.concepto,
        monto: parseFloat(formData.monto),
        fecha: formData.fecha,
      });
      setFormData({ concepto: '', monto: '', fecha: '' });
      setShowForm(false);
      loadExpenses();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error creando gasto');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este gasto?')) {
      try {
        await api.delete(`/expenses/${id}`);
        loadExpenses();
      } catch (err) {
        setError(err?.response?.data?.message || 'Error eliminando gasto');
      }
    }
  };

  return (
    <section className="container">
      <h1 className="page-title">Gestión de Gastos</h1>

      <button
        type="button"
        className="button-primary"
        style={{ marginBottom: '1.5rem' }}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancelar' : 'Agregar Gasto'}
      </button>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2>Nuevo Gasto</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Concepto</label>
              <input
                type="text"
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                minLength="3"
              />
            </div>
            <div className="input-group">
              <label>Monto</label>
              <input
                type="number"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
            <div className="input-group">
              <label>Fecha</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
            <button type="submit" className="button-primary" style={{ width: '100%' }}>
              Crear Gasto
            </button>
          </form>
        </div>
      )}

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p>Cargando gastos...</p>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          {expenses.length === 0 ? (
            <p>No hay gastos registrados.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #6c3483' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Concepto</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '700' }}>Monto</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Fecha</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '1rem' }}>{exp.concepto}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700' }}>
                      ${Number(exp.monto).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {new Date(exp.fecha).toLocaleDateString('es-CO')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        className="button-danger"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        onClick={() => handleDelete(exp.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
}
