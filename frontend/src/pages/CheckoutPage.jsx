import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { getWhatsAppNumber, formatCartWhatsappMessage, buildWhatsappUrl } from '../services/whatsappService.js';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const total = subtotal;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const number = await getWhatsAppNumber();
      const text = formatCartWhatsappMessage(items, subtotal, couponCode);
      const url = buildWhatsappUrl(number, text);
      window.open(url, '_blank');
    } catch (err) {
      setError('No se pudo abrir WhatsApp. Intenta de nuevo más tarde.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container">
      <h1 className="page-title">Checkout</h1>
      {error && <div className="alert">{error}</div>}
      {success && <div className="card">{success}</div>}
      <div className="section-row">
        <div className="card">
          <h2>Tu pedido</h2>
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <strong>{item.nombre}</strong>
                <p className="small-text">{item.quantity} × ${Number(item.precio).toFixed(2)}</p>
              </div>
              <strong>${(item.quantity * Number(item.precio)).toFixed(2)}</strong>
            </div>
          ))}
          <div style={{ marginTop: '1rem' }}>
            <p>Subtotal: <strong>${subtotal.toFixed(2)}</strong></p>
            <p>Total: <strong>${total.toFixed(2)}</strong></p>
          </div>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <h2>Información de compra</h2>
          <div className="input-group">
            <label htmlFor="couponCode">Cupón (opcional)</label>
            <input
              id="couponCode"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Método de compra</label>
            <p>La compra se confirma por WhatsApp. No hay pasarela de pago en línea.</p>
          </div>
          <button type="submit" className="button-primary" disabled={submitting}>
            {submitting ? 'Procesando...' : 'Enviar pedido por WhatsApp'}
          </button>
        </form>
      </div>
    </section>
  );
}
