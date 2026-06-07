import { Link } from 'react-router-dom';
import { getWhatsAppNumber, formatWhatsappMessage, buildWhatsappUrl } from '../services/whatsappService.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const handleBuy = async () => {
    try {
      const number = await getWhatsAppNumber();
      const url = buildWhatsappUrl(number, formatWhatsappMessage(product));
      window.open(url, '_blank');
    } catch (error) {
      window.alert('No se pudo abrir WhatsApp en este momento. Intenta de nuevo más tarde.');
    }
  };

  const handleAdd = () => {
    try {
      addItem(product);
    } catch (err) {
      console.error(err);
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
        <h3>{product.nombre} {product.nuevo && <span className="badge-new">Nuevo</span>}</h3>
        <p className="small-text">{product.descripcion}</p>
      </div>
      <div className="product-meta">
        <span className="price">${Number(product.precio).toFixed(2)}</span>
        <span className="small-text">{product.stock > 0 ? 'Disponible' : 'Agotado'}</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'center' }}>
        <Link to={`/product/${product.id}`} className="button-secondary">
          Ver
        </Link>
        <button type="button" className="btn-add" onClick={handleAdd} disabled={product.stock <= 0} aria-label="Agregar al carrito">
          Agregar
        </button>
        <button
          type="button"
          className="button-primary"
          onClick={handleBuy}
          disabled={product.stock <= 0}
        >
          Comprar
        </button>
      </div>
    </article>
  );
}
