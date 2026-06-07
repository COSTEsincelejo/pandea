import { useEffect, useState } from 'react';
import { getProducts } from '../services/productService.js';
import ProductCard from '../components/ProductCard.jsx';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [categories] = useState(['mujer', 'hombre', 'accesorios']);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCategory !== 'all') params.append('categoria', selectedCategory);
    if (availability !== 'all') params.append('disponible', availability === 'disponible');

    getProducts(`?${params.toString()}`)
      .then((data) => setProducts(data))
      .catch((err) => setError(err?.response?.data?.message || 'Error cargando productos'))
      .finally(() => setLoading(false));
  }, [search, selectedCategory, availability]);

  return (
    <section className="container">
      <h1 className="page-title">Tienda Pandea</h1>
      
      {/* Barra de búsqueda */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(108,52,131,0.05)', borderRadius: '10px' }}>
        <input
          type="text"
          placeholder="Buscar productos por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', marginBottom: '1rem' }}
        />
        
        {/* Filtros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div>
            <label>Categoría</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">Todas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Disponibilidad</label>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="all">Todos</option>
              <option value="disponible">Disponible</option>
              <option value="agotado">Agotado</option>
            </select>
          </div>
        </div>
      </div>
      
      {error && <div className="alert">{error}</div>}
      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <div className="grid grid-3">
          {products.length === 0 ? (
            <p>No hay productos que coincidan con los filtros.</p>
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
