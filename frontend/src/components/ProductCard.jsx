import { Link } from 'react-router-dom';
import { getWhatsAppNumber, formatWhatsappMessage, buildWhatsappUrl } from '../services/whatsappService.js';

export default function ProductCard({ product }) {
  const handleBuy = async () => {
    try {
      const number = await getWhatsAppNumber();
      const url = buildWhatsappUrl(number, formatWhatsappMessage(product));
      window.open(url, '_blank');
    } catch (error) {
      window.alert('No se pudo abrir WhatsApp en este momento. Intenta de nuevo más tarde.');
    }
  };

  return (
    <article className="card product-card">
      <img
        src={product.imagen_url || 'https://via.placeholder.com/400x280?text=Producto'}
        alt={product.nombre}
        className="product-image"
      />
      <div>
        <h3>{product.nombre}</h3>
        <p className="small-text">{product.descripcion}</p>
      </div>
      <div className="product-meta">
        <strong>${Number(product.precio).toFixed(2)}</strong>
        <span className="small-text">{product.stock > 0 ? 'Disponible' : 'Agotado'}</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
        <Link to={`/product/${product.id}`} className="button-secondary">
          Ver
        </Link>
        <button
          type="button"
          className="button-primary"
          onClick={handleBuy}
          disabled={product.stock <= 0}
        >
          Comprar por WhatsApp
        </button>
      </div>
    </article>
  );
}
