import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct } from '../services/productService.js';
import { useCart } from '../context/CartContext.jsx';
import { getWhatsAppNumber, formatWhatsappMessage, buildWhatsappUrl } from '../services/whatsappService.js';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then((data) => setProduct(data))
      .catch(() => setError('No se encontró el producto'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuyWhatsapp = async () => {
    try {
      const number = await getWhatsAppNumber();
      const url = buildWhatsappUrl(number, formatWhatsappMessage(product));
      window.open(url, '_blank');
    } catch (err) {
      window.alert('Error abriendo WhatsApp. Intenta de nuevo más tarde.');
    }
  };

  if (loading) {
    return <p>Cargando producto...</p>;
  }

  if (error || !product) {
    return <div className="alert">{error || 'Producto no disponible'}</div>;
  }

  return (
    <section className="container">
      <div className="card section-row">
        <img
          src={product.imagen_url || 'https://via.placeholder.com/640x420?text=Producto'}
          alt={product.nombre}
          className="product-image"
        />
        <div>
          <h1 className="page-title">{product.nombre}</h1>
          <p className="small-text">{product.descripcion}</p>
          <p>
            <strong>Precio:</strong> ${Number(product.precio).toFixed(2)}
          </p>
          <p className="small-text">{product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}</p>
          <div className="grid" style={{ gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
            <button
              type="button"
              className="button-primary"
              onClick={handleBuyWhatsapp}
              disabled={product.stock <= 0}
            >
              Comprar por WhatsApp
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => addItem(product)}
              disabled={product.stock <= 0}
            >
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
