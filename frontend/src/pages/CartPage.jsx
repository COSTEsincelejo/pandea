import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { getWhatsAppNumber, formatCartWhatsappMessage, buildWhatsappUrl } from '../services/whatsappService.js';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [error, setError] = useState(null);

  const handleBuyWhatsapp = async () => {
    setError(null);
    try {
      const number = await getWhatsAppNumber();
      const text = formatCartWhatsappMessage(items, subtotal);
      const url = buildWhatsappUrl(number, text);
      window.open(url, '_blank');
    } catch (err) {
      setError('No se pudo abrir WhatsApp. Intenta de nuevo más tarde.');
    }
  };

  if (items.length === 0) {
    return (
      <section className="container">
        <h1 className="page-title">Tu carrito</h1>
        <div className="card">
          <p>No hay productos en el carrito todavía.</p>
          <Link to="/" className="button-secondary">
            Ver productos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container">
      <h1 className="page-title">Tu carrito</h1>
      {error && <div className="alert">{error}</div>}
      <div className="card">
        <div className="grid" style={{ gap: '1rem' }}>
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <h3>{item.nombre}</h3>
                <p className="small-text">${Number(item.precio).toFixed(2)} x unidad</p>
                <div className="grid" style={{ gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                  <label>
                    Cantidad
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                    />
                  </label>
                  <button type="button" className="button-danger" onClick={() => removeItem(item.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="cart-meta">
                <strong>Total</strong>
                <span>${(item.quantity * Number(item.precio)).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: '1rem' }}>
          <h2>Resumen</h2>
          <p>Subtotal: <strong>${subtotal.toFixed(2)}</strong></p>
          <button type="button" className="button-primary" onClick={handleBuyWhatsapp}>
            Comprar por WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}
