import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService.js';
import ProductCard from '../components/ProductCard.jsx';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProducts()
      .then((data) => setProducts(data))
      .catch((err) => setError(err?.response?.data?.message || 'Error cargando productos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container">
      <h1 className="page-title">Tienda Pandea</h1>
      {error && <div className="alert">{error}</div>}
      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="grid grid-3">
          {products.length === 0 ? (
            <p>No hay productos disponibles.</p>
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      )}
    </section>
  );
}
